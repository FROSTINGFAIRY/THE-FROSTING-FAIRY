const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

initializeApp();

const twilioSidSecret = defineSecret("TWILIO_SID");
const twilioTokenSecret = defineSecret("TWILIO_TOKEN");
const instaTokenSecret = defineSecret("INSTA_TOKEN");

const DEFAULT_ADMINS = ['kiddepressed03@gmail.com', 'hellofrostingfairy@gmail.com'];

/**
 * Helper to send notifications via Webhook and/or Twilio WhatsApp
 */
async function dispatchNotification({ orderId, customerName, cakeType, status, isTest = false }) {
  const db = getFirestore();
  const settingsSnap = await db.collection("settings").doc("notifications").get();
  const settings = settingsSnap.exists ? settingsSnap.data() : {};

  const twilioSid = process.env.TWILIO_SID || twilioSidSecret.value() || settings.twilioSid || "";
  const twilioToken = process.env.TWILIO_TOKEN || twilioTokenSecret.value() || settings.twilioToken || "";
  const instaToken = process.env.INSTA_TOKEN || instaTokenSecret.value() || settings.instaToken || "";

  const prefix = isTest ? "🧪 [TEST NOTIFICATION]" : "🔔 [THE FROSTING FAIRY]";
  const messageText = `${prefix} Order #${orderId} | Customer: "${customerName}" | Item: "${cakeType}" | Status: "${status}"`;

  const results = { webhook: false, twilio: false, instagram: false };

  // 1. Dispatch Webhook / Instagram
  if (settings.instaWebhook) {
    try {
      await fetch(settings.instaWebhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: isTest ? "test_notification" : "new_order",
          orderId,
          customerName,
          cakeType,
          status,
          message: messageText,
          timestamp: new Date().toISOString()
        })
      });
      results.webhook = true;
      console.log(`[Notification Dispatch] Webhook sent for Order #${orderId}`);
    } catch (err) {
      console.error("[Notification Dispatch] Webhook error:", err);
    }
  }

  // 2. Direct Instagram Graph API
  if (instaToken && settings.instaBusinessId && settings.instaRecipient) {
    try {
      await fetch(`https://graph.facebook.com/v19.0/${settings.instaBusinessId.trim()}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${instaToken.trim()}`
        },
        body: JSON.stringify({
          recipient: { id: settings.instaRecipient.trim() },
          message: { text: messageText }
        })
      });
      results.instagram = true;
      console.log(`[Notification Dispatch] Instagram DM sent for Order #${orderId}`);
    } catch (err) {
      console.error("[Notification Dispatch] Instagram Graph API error:", err);
    }
  }

  // 3. Dispatch WhatsApp via Twilio
  if (settings.whatsappEnabled && twilioSid && twilioToken && settings.twilioRecipient) {
    try {
      const formData = new URLSearchParams();
      formData.append("To", settings.twilioRecipient.trim());
      formData.append("From", settings.twilioFrom ? settings.twilioFrom.trim() : "whatsapp:+14155238886");
      formData.append("Body", messageText);

      const basicAuth = Buffer.from(`${twilioSid.trim()}:${twilioToken.trim()}`).toString("base64");
      await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid.trim()}/Messages.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Basic ${basicAuth}`
        },
        body: formData.toString()
      });
      results.twilio = true;
      console.log(`[Notification Dispatch] Twilio WhatsApp sent for Order #${orderId}`);
    } catch (err) {
      console.error("[Notification Dispatch] Twilio WhatsApp error:", err);
    }
  }

  return results;
}

/**
 * Callable Cloud Function: sendTestNotification
 * Gated by checking request.auth.token.email against the admin list.
 */
exports.sendTestNotification = onCall(
  { secrets: [twilioSidSecret, twilioTokenSecret, instaTokenSecret] },
  async (request) => {
    const email = request.auth && request.auth.token && request.auth.token.email 
      ? request.auth.token.email.toLowerCase() 
      : null;

    if (!email) {
      throw new HttpsError("unauthenticated", "Authentication required to trigger test notifications.");
    }

    const db = getFirestore();
    let isAuthorized = DEFAULT_ADMINS.includes(email);
    if (!isAuthorized) {
      const adminDoc = await db.collection("admins").doc(email).get();
      if (adminDoc.exists) isAuthorized = true;
    }

    if (!isAuthorized) {
      throw new HttpsError("permission-denied", "Access denied: Admin privileges required.");
    }

    const results = await dispatchNotification({
      orderId: "TEST-8888",
      customerName: request.data?.customerName || "Test Administrator",
      cakeType: request.data?.cakeType || "Boutique Sample Pastry",
      status: "TEST_ALERT",
      isTest: true
    });

    return { success: true, message: "Test notification dispatched successfully.", results };
  }
);

/**
 * Callable Cloud Function: createOrder
 * Validates pricing server-side using products collection and creates order.
 */
exports.createOrder = onCall(async (request) => {
  const { cartItems, checkoutData } = request.data || {};

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    throw new HttpsError("invalid-argument", "Cart items are required to create an order.");
  }
  if (!checkoutData || !checkoutData.customerName || !checkoutData.customerPhone) {
    throw new HttpsError("invalid-argument", "Customer details (name & phone) are required.");
  }

  const db = getFirestore();
  const createdOrderIds = [];
  let totalItemsPrice = 0;

  // Verify and calculate item prices server-side
  const orderEntries = [];
  for (const item of cartItems) {
    let unitPrice = 0;
    let recipeData = null;

    if (item.productId) {
      const productDoc = await db.collection("products").doc(item.productId).get();
      if (productDoc.exists) {
        recipeData = productDoc.data();
        if (Array.isArray(recipeData.priceOptions) && recipeData.priceOptions.length > 0) {
          const matchedOpt = recipeData.priceOptions.find(
            (opt) => opt.weight === item.selectedOption || opt.weight === item.unit
          );
          unitPrice = matchedOpt ? matchedOpt.price : recipeData.priceOptions[0].price;
        } else {
          unitPrice = recipeData.basePrice || recipeData.price || 0;
        }
      }
    }

    const itemQuantity = Math.max(1, parseInt(item.amount, 10) || 1);
    const calculatedLinePrice = unitPrice * itemQuantity;
    totalItemsPrice += calculatedLinePrice;

    orderEntries.push({
      cakeType: item.name || recipeData?.name || "Custom Pastry",
      flavor: item.recipeName || recipeData?.category || "Standard Flavor",
      weight: item.selectedOption || "Standard",
      message: item.customMessage || "",
      instructions: item.customMessage ? `Text on cake: "${item.customMessage}"` : "",
      pickupDate: checkoutData.pickupDate || "",
      pickupTime: checkoutData.pickupTime || "",
      contactName: checkoutData.customerName,
      contactPhone: checkoutData.customerPhone,
      estimatedPrice: calculatedLinePrice,
      status: "Pending",
      recipe: recipeData,
      customerName: checkoutData.customerName,
      customerPhone: checkoutData.customerPhone,
      specialInstructions: checkoutData.specialInstructions || "",
      deliveryType: checkoutData.deliveryType || "Pickup",
      deliveryAddress: checkoutData.deliveryAddress || "",
      gpsCoordinates: checkoutData.gpsCoordinates || "",
      paymentMethod: checkoutData.paymentMethod || "COD",
      paymentDetails: checkoutData.paymentDetails || {},
      adminNotes: [],
      createdAt: FieldValue.serverTimestamp()
    });
  }

  // Server-side delivery fee calculation
  const deliveryFee = checkoutData.deliveryType === "Delivery" ? (totalItemsPrice >= 600 ? 0 : 50) : 0;
  if (deliveryFee > 0) {
    orderEntries.push({
      cakeType: "Delivery Fee",
      flavor: "N/A",
      weight: "Standard",
      message: "",
      instructions: "Delivery fee for hand-crafted cake delivery",
      pickupDate: checkoutData.pickupDate || "",
      pickupTime: checkoutData.pickupTime || "",
      contactName: checkoutData.customerName,
      contactPhone: checkoutData.customerPhone,
      estimatedPrice: deliveryFee,
      status: "Pending",
      recipe: null,
      customerName: checkoutData.customerName,
      customerPhone: checkoutData.customerPhone,
      specialInstructions: checkoutData.specialInstructions || "",
      deliveryType: checkoutData.deliveryType || "Delivery",
      deliveryAddress: checkoutData.deliveryAddress || "",
      gpsCoordinates: checkoutData.gpsCoordinates || "",
      paymentMethod: checkoutData.paymentMethod || "COD",
      paymentDetails: checkoutData.paymentDetails || {},
      adminNotes: [],
      createdAt: FieldValue.serverTimestamp()
    });
  }

  // Create order documents server-side
  for (const entry of orderEntries) {
    const docRef = await db.collection("orders").add(entry);
    createdOrderIds.push(docRef.id);
  }

  return {
    success: true,
    orderIds: createdOrderIds,
    totalPrice: totalItemsPrice + deliveryFee
  };
});

/**
 * Firestore Trigger: onNewOrderCreated
 */
exports.onNewOrderCreated = onDocumentCreated("orders/{orderId}", async (event) => {
  const orderId = event.params.orderId;
  const newOrder = event.data?.data();

  if (!newOrder) return;

  console.log(`[Cloud Function] New order trigger fired: #${orderId}`, newOrder);

  await dispatchNotification({
    orderId,
    customerName: newOrder.customerName || newOrder.contactName || "Valued Customer",
    cakeType: newOrder.cakeType || "Custom Pastry",
    status: newOrder.status || "Pending",
    isTest: false
  });
});

const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

initializeApp();

/**
 * Firestore-triggered Cloud Function on new document creation in `orders`.
 * Automatically reads saved notification settings from `settings/notifications`
 * and triggers Instagram Webhook and/or Twilio WhatsApp notifications.
 */
exports.onNewOrderCreated = onDocumentCreated("orders/{orderId}", async (event) => {
  const orderId = event.params.orderId;
  const newOrder = event.data.data();

  if (!newOrder) {
    console.log("No order data found");
    return;
  }

  console.log(`[Cloud Function] New order received: #${orderId}`, newOrder);

  try {
    const db = getFirestore();
    const settingsSnap = await db.collection("settings").doc("notifications").get();
    const settings = settingsSnap.exists ? settingsSnap.data() : {};

    const customerName = newOrder.customerName || newOrder.contactName || "Valued Customer";
    const cakeType = newOrder.cakeType || "Custom Pastry";
    const status = newOrder.status || "Pending";

    const messageText = `🔔 [THE FROSTING FAIRY] New Order #${orderId} received! Customer: "${customerName}", Item: "${cakeType}", Status: "${status}"`;

    // 1. Dispatch Webhook / Instagram DM
    if (settings.instaWebhook) {
      try {
        await fetch(settings.instaWebhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "new_order",
            orderId,
            customerName,
            cakeType,
            status,
            message: messageText,
            timestamp: new Date().toISOString()
          })
        });
        console.log(`[Cloud Function] Webhook dispatched for Order #${orderId}`);
      } catch (err) {
        console.error("[Cloud Function] Webhook dispatch error:", err);
      }
    }

    // 2. Dispatch WhatsApp via Twilio
    if (settings.whatsappEnabled && settings.twilioSid && settings.twilioToken && settings.twilioRecipient) {
      try {
        const formData = new URLSearchParams();
        formData.append("To", settings.twilioRecipient.trim());
        formData.append("From", settings.twilioFrom ? settings.twilioFrom.trim() : "whatsapp:+14155238886");
        formData.append("Body", messageText);

        const basicAuth = Buffer.from(`${settings.twilioSid.trim()}:${settings.twilioToken.trim()}`).toString("base64");
        await fetch(`https://api.twilio.com/2010-04-01/Accounts/${settings.twilioSid.trim()}/Messages.json`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": `Basic ${basicAuth}`
          },
          body: formData.toString()
        });
        console.log(`[Cloud Function] WhatsApp alert dispatched for Order #${orderId}`);
      } catch (err) {
        console.error("[Cloud Function] WhatsApp dispatch error:", err);
      }
    }
  } catch (err) {
    console.error("[Cloud Function] Error in onNewOrderCreated trigger:", err);
  }
});

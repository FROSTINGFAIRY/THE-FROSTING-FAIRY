const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

initializeApp();

const twilioSidSecret = defineSecret("TWILIO_SID");
const twilioTokenSecret = defineSecret("TWILIO_TOKEN");
const instaTokenSecret = defineSecret("INSTA_TOKEN");

const DEFAULT_ADMINS = ['kiddepressed03@gmail.com', 'hellofrostingfairy@gmail.com'];

// Note: createOrder and onNewOrderCreated have been removed from Cloud Functions
// to maintain a single canonical path in server.ts (Cloud Run), which handles order
// creation validation, pricing calculation, database storage, and real-time order notifications.

/**
 * Helper to send notifications via Webhook, Instagram Graph API, and/or Twilio WhatsApp
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

  // 1. Dispatch Webhook
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
  if (settings.whatsappEnabled !== false && twilioSid && twilioToken && settings.twilioRecipient) {
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

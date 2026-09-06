import express from "express";
import path from "path";
import crypto from "crypto";
import compression from "compression";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import firebaseConfig from "./firebase-applet-config.json";
import {
  getFirestoreDoc,
  setFirestoreDoc,
  addFirestoreDoc,
} from "./serverFirestore";

dotenv.config();

const DEFAULT_ADMINS = ['kiddepressed03@gmail.com', 'hellofrostingfairy@gmail.com'];

/**
 * Server-side Admin Token Verification helper using Firebase Identity Toolkit lookup
 */
async function verifyAdminToken(req: express.Request) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw { status: 401, message: "Missing or invalid Authorization header." };
  }

  const idToken = authHeader.split("Bearer ")[1].trim();
  if (!idToken) {
    throw { status: 401, message: "Missing token string." };
  }

  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseConfig.apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken })
  });

  if (!response.ok) {
    throw { status: 401, message: "Invalid or expired Firebase ID token." };
  }

  const data = await response.json();
  const user = data.users?.[0];
  if (!user || !user.email) {
    throw { status: 401, message: "Authentication token contains no email." };
  }

  const email = user.email.toLowerCase();
  let isAuthorized = DEFAULT_ADMINS.includes(email);

  if (!isAuthorized) {
    try {
      const adminDoc = await getFirestoreDoc("admins", email);
      if (adminDoc) {
        isAuthorized = true;
      }
    } catch (err) {
      console.warn("Error checking admin doc in verifyAdminToken:", err);
    }
  }

  if (!isAuthorized) {
    throw { status: 403, message: `Access denied: Account ${email} is not listed as an authorized admin.` };
  }

  return { email, user };
}

/**
 * Dispatch notification helper for server
 */
async function dispatchServerNotification({ orderId, customerName, cakeType, status, isTest = false }: {
  orderId: string;
  customerName: string;
  cakeType: string;
  status: string;
  isTest?: boolean;
}) {
  try {
    const settings = (await getFirestoreDoc("settings", "notifications")) || {};

    const twilioSid = process.env.TWILIO_SID || settings.twilioSid || "";
    const twilioToken = process.env.TWILIO_TOKEN || settings.twilioToken || "";
    const instaToken = process.env.INSTA_TOKEN || settings.instaToken || "";

    const prefix = isTest ? "🧪 [TEST NOTIFICATION]" : "🔔 [THE FROSTING FAIRY]";
    const messageText = `${prefix} Order #${orderId} | Customer: "${customerName}" | Item: "${cakeType}" | Status: "${status}"`;

    const results = { webhook: false, twilio: false, instagram: false };

    // 1. Dispatch Webhook
    if (settings.instaWebhook) {
      fetch(settings.instaWebhook, {
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
      }).then(() => console.log(`[Server Trigger] Webhook dispatched for Order #${orderId}`))
        .catch(e => console.error("[Server Trigger] Webhook error:", e));
      results.webhook = true;
    }

    // 2. Direct Instagram Graph API
    if (instaToken && settings.instaBusinessId && settings.instaRecipient) {
      fetch(`https://graph.facebook.com/v19.0/${settings.instaBusinessId.trim()}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${instaToken.trim()}`
        },
        body: JSON.stringify({
          recipient: { id: settings.instaRecipient.trim() },
          message: { text: messageText }
        })
      }).then(() => console.log(`[Server Trigger] Instagram DM sent for Order #${orderId}`))
        .catch(e => console.error("[Server Trigger] Instagram error:", e));
      results.instagram = true;
    }

    // 3. Dispatch WhatsApp via Twilio
    if (settings.whatsappEnabled !== false && twilioSid && twilioToken && settings.twilioRecipient) {
      const formData = new URLSearchParams();
      formData.append("To", settings.twilioRecipient.trim());
      formData.append("From", settings.twilioFrom ? settings.twilioFrom.trim() : "whatsapp:+14155238886");
      formData.append("Body", messageText);

      const basicAuth = Buffer.from(`${twilioSid.trim()}:${twilioToken.trim()}`).toString("base64");
      fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid.trim()}/Messages.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Basic ${basicAuth}`
        },
        body: formData.toString()
      }).then(() => console.log(`[Server Trigger] WhatsApp alert dispatched for Order #${orderId}`))
        .catch(e => console.error("[Server Trigger] WhatsApp error:", e));
      results.twilio = true;
    }

    return results;
  } catch (err) {
    console.error("Error in dispatchServerNotification:", err);
    return { webhook: false, twilio: false, instagram: false };
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Cloud Run / Reverse Proxy header trust configuration
  app.set("trust proxy", 1);

  // Rate Limiting for image generation (~10 requests per minute per IP)
  const imageGenLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: { error: "Rate limit exceeded. Maximum 10 image generation requests per minute allowed." },
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false, default: false },
  });

  // Rate Limiting for order creation (30 requests per 10 minutes per IP)
  const createOrderLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 30,
    message: { error: "Rate limit exceeded. Please wait a few moments before trying again." },
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false, default: false },
  });

  // Middleware for parsing JSON requests with rawBody preserved for webhook signatures
  app.use(
    express.json({
      limit: "10mb",
      verify: (req: any, _res, buf) => {
        req.rawBody = buf;
      },
    })
  );

  // Initialize GoogleGenAI client lazily via dynamic import
  let ai: any = null;
  const getAiClient = async () => {
    if (!ai) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not set. Please add it in Settings > Secrets.");
      }
      const { GoogleGenAI } = await import("@google/genai");
      ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
    return ai;
  };

  // 1) /api/generate-image with rate limiting and graceful curated fallbacks
  app.post("/api/generate-image", imageGenLimiter, async (req, res) => {
    try {
      // Optional admin verification for logging
      try {
        if (req.headers.authorization) {
          const adminAuth = await verifyAdminToken(req);
          console.log(`[Image Gen] Admin user: ${adminAuth?.email}`);
        }
      } catch {
        // Customer generation permitted under imageGenLimiter
      }

      let { prompt } = req.body;
      if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({ error: "Prompt is required and must be a string." });
      }

      prompt = prompt.trim();
      if (prompt.length > 500) {
        prompt = prompt.slice(0, 500);
      }

      console.log(`Generating cake image for prompt: "${prompt}"`);

      try {
        const client = await getAiClient();
        const response = await client.models.generateContent({
          model: "gemini-3.1-flash-lite-image",
          contents: {
            parts: [
              {
                text: `A beautiful professional food photograph of a customized bakery product: ${prompt}. Photorealistic, elegant, delicious close-up, clean background, appetizing lighting.`,
              },
            ],
          },
          config: {
            imageConfig: {
              aspectRatio: "1:1",
            },
          },
        });

        let base64Image = null;
        if (response?.candidates?.[0]?.content?.parts) {
          for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
              base64Image = `data:${part.inlineData.mimeType || "image/png"};base64,${part.inlineData.data}`;
              break;
            }
          }
        }

        if (base64Image) {
          return res.json({ imageUrl: base64Image });
        }
      } catch (aiErr: any) {
        console.warn("[Image Gen] Gemini API quota or model error encountered:", aiErr?.message || aiErr);
      }

      // Fallback: Select curated high-res bakery image matching prompt keywords
      const promptLower = prompt.toLowerCase();
      let fallbackUrl = "https://images.unsplash.com/photo-1535141192574-5d4897c13636?auto=format&fit=crop&q=80&w=800";
      if (promptLower.includes("chocolate") || promptLower.includes("cocoa") || promptLower.includes("truffle")) {
        fallbackUrl = "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=800";
      } else if (promptLower.includes("red velvet") || promptLower.includes("berry") || promptLower.includes("strawberry")) {
        fallbackUrl = "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&q=80&w=800";
      } else if (promptLower.includes("cupcake") || promptLower.includes("muffin")) {
        fallbackUrl = "https://images.unsplash.com/photo-1587668178277-295251f900ce?auto=format&fit=crop&q=80&w=800";
      } else if (promptLower.includes("macaron") || promptLower.includes("cookie") || promptLower.includes("roll")) {
        fallbackUrl = "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&q=80&w=800";
      } else if (promptLower.includes("vanilla") || promptLower.includes("white") || promptLower.includes("gold")) {
        fallbackUrl = "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&q=80&w=800";
      }

      return res.json({
        imageUrl: fallbackUrl,
        isFallback: true,
        message: "Served curated high-resolution bakery photo preview."
      });
    } catch (error: any) {
      console.error("Image generation handler error:", error);
      const status = error.status || 500;
      res.status(status).json({ error: error.message || "Internal server error." });
    }
  });

  // SECURE /api/ai-draft-email - Use Gemini to write polite bakery emails & replies
  app.post("/api/ai-draft-email", async (req, res) => {
    try {
      const adminAuth = await verifyAdminToken(req);
      const { topic, customerName, orderDetails, tone, previousMessage } = req.body || {};

      if (!topic && !previousMessage) {
        return res.status(400).json({ error: "Topic or previous message is required to draft an email." });
      }

      let generatedSubject = "Update from The Frosting Fairy 🎂";
      let generatedBody = "";

      try {
        const client = await getAiClient();
        const prompt = `You are the Head Pastry Chef & Communications Manager for 'The Frosting Fairy', a luxury artisanal bakery and cake boutique.
Write a warm, elegant, polite, and mouth-watering email for a customer.
Customer Name: ${customerName || 'Valued Customer'}
Email Purpose / Topic: ${topic || 'General bakery correspondence'}
Order Details (if any): ${orderDetails || 'Custom confectionery request'}
Tone: ${tone || 'Warm, sweet, professional, artisanal'}
${previousMessage ? `Previous Message from Customer:\n"${previousMessage}"` : ''}

Output format:
SUBJECT: [Catchy, polite subject with an emoji]
BODY_HTML:
[Clean, well-formatted HTML with <p>, <strong>, <ul>, and confectionery aesthetic, ready to send or preview]`;

        const response = await client.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
        });

        const text = response?.text || "";
        const subjectMatch = text.match(/SUBJECT:\s*(.+)/i);
        const bodyMatch = text.match(/BODY_HTML:\s*([\s\S]+)/i);

        if (subjectMatch && subjectMatch[1]) {
          generatedSubject = subjectMatch[1].trim();
        }
        if (bodyMatch && bodyMatch[1]) {
          generatedBody = bodyMatch[1].trim();
        } else {
          generatedBody = text.replace(/SUBJECT:.*(\n|$)/i, '').trim();
        }
      } catch (aiErr: any) {
        console.warn("[AI Draft Email] Gemini fallback:", aiErr?.message || aiErr);
        generatedSubject = `A Sweet Note from The Frosting Fairy 🧁 - Order #${orderDetails || 'Update'}`;
        generatedBody = `<p>Hello ${customerName || 'there'},</p><p>Thank you for connecting with The Frosting Fairy! We are delighted to assist you with your confectionery needs.</p><p>Our culinary artisans are dedicated to crafting the finest custom pastries and bespoke celebration cakes for your special occasions.</p><p>Please let us know if you have any questions or additional custom requirements!</p><p>Sweet regards,<br><strong>The Frosting Fairy Team</strong></p>`;
      }

      return res.json({
        success: true,
        subject: generatedSubject,
        bodyHtml: generatedBody,
      });
    } catch (error: any) {
      console.error("AI Draft Email handler error:", error);
      const status = error.status || 500;
      res.status(status).json({ error: error.message || "Failed to generate draft." });
    }
  });

  // 2) SECURE /api/send-test-notification
  app.post("/api/send-test-notification", async (req, res) => {
    try {
      const adminAuth = await verifyAdminToken(req);
      const { customerName, cakeType } = req.body || {};

      const results = await dispatchServerNotification({
        orderId: "TEST-9999",
        customerName: customerName || `Test Admin (${adminAuth.email})`,
        cakeType: cakeType || "Artisanal Sample Pastry",
        status: "TEST_ALERT",
        isTest: true
      });

      return res.json({
        success: true,
        message: "Test notification dispatched from server.",
        results
      });
    } catch (error: any) {
      console.error("Test notification handler error:", error);
      const status = error.status || 500;
      res.status(status).json({ error: error.message || "Failed to dispatch test notification." });
    }
  });

  /**
   * Server-side helper to strictly re-derive order item prices and delivery fee from Firestore
   */
  async function deriveOrderItemsAndTotals(cartItems: any[], checkoutData: any) {
    let totalItemsPrice = 0;
    const items: any[] = [];

    for (const item of cartItems) {
      let unitPrice = 0;
      let recipeData: any = null;

      if (item.productId) {
        try {
          const productData = await getFirestoreDoc("products", item.productId);
          if (productData) {
            recipeData = productData;
            if (recipeData.isBuildYourBox && Array.isArray(item.boxContents) && item.boxContents.length > 0) {
              unitPrice = item.boxContents.reduce(
                (sum: number, c: any) => sum + (Number(c.price) || 0) * (Number(c.quantity) || 0),
                0
              );
            } else if (Array.isArray(recipeData.priceOptions) && recipeData.priceOptions.length > 0) {
              const matchedOpt = recipeData.priceOptions.find(
                (opt: any) => opt.label === item.selectedOption || opt.label === item.unit
              );
              unitPrice = matchedOpt ? matchedOpt.price : recipeData.priceOptions[0].price;
            } else {
              unitPrice = recipeData.basePrice || recipeData.price || 0;
            }
          }
        } catch (err) {
          console.warn(`Error looking up product ${item.productId}:`, err);
        }
      }

      // Fallback calculation for box contents if product wasn't found in Firestore
      if (unitPrice === 0 && Array.isArray(item.boxContents) && item.boxContents.length > 0) {
        unitPrice = item.boxContents.reduce(
          (sum: number, c: any) => sum + (Number(c.price) || 0) * (Number(c.quantity) || 0),
          0
        );
      }

      // Fallback to submitted item price if unit price is still 0
      if (unitPrice === 0 && item.price) {
        unitPrice = Number(item.price) || 0;
      }

      // Clamp item amount server-side to range 1-50
      const rawAmount = parseInt(item.amount, 10) || 1;
      const itemQuantity = Math.min(50, Math.max(1, rawAmount));

      const calculatedLinePrice = unitPrice * itemQuantity;
      totalItemsPrice += calculatedLinePrice;

      items.push({
        productId: item.productId || null,
        name: item.name || recipeData?.name || "Custom Pastry",
        cakeType: item.name || recipeData?.name || "Custom Pastry",
        flavor: item.recipeName || recipeData?.category || "Standard Flavor",
        weight: item.selectedOption || "Standard",
        selectedOption: item.selectedOption || "Standard",
        unit: item.unit || "pcs",
        amount: itemQuantity,
        unitPrice: unitPrice,
        linePrice: calculatedLinePrice,
        message: item.customMessage || "",
        customMessage: item.customMessage || "",
        instructions: item.customMessage ? `Text on cake: "${item.customMessage}"` : "",
        boxContents: Array.isArray(item.boxContents) ? item.boxContents : null,
        recipe: recipeData || null,
      });
    }

    // Server-side delivery fee calculation
    const deliveryFee = checkoutData.deliveryType === "Delivery" ? (totalItemsPrice >= 600 ? 0 : 50) : 0;
    const totalPrice = totalItemsPrice + deliveryFee;

    return { totalItemsPrice, deliveryFee, totalPrice, items };
  }

  // --- CUSTOMER MOBILE NUMBER OTP AUTHENTICATION ---
  interface OtpRecord {
    otp: string;
    phoneNumber: string;
    countryCode: string;
    fullPhoneNumber: string;
    expiresAt: number;
    attempts: number;
    createdAt: number;
    lastRequestedAt: number;
  }

  const otpStore = new Map<string, OtpRecord>();

  interface CustomerSessionRecord {
    customerId: string;
    fullPhoneNumber: string;
    createdAt: number;
    expiresAt: number;
  }

  const customerSessions = new Map<string, CustomerSessionRecord>();

  // Cleanup expired OTPs and sessions periodically
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of otpStore.entries()) {
      if (record.expiresAt < now) {
        otpStore.delete(key);
      }
    }
    for (const [token, session] of customerSessions.entries()) {
      if (session.expiresAt < now) {
        customerSessions.delete(token);
      }
    }
  }, 5 * 60 * 1000);

  // Helper to normalize phone number
  function normalizePhoneNumber(rawNumber: string, countryCode: string = "+966") {
    let cleanCode = countryCode.trim();
    if (!cleanCode.startsWith("+")) {
      cleanCode = "+" + cleanCode;
    }
    let digits = rawNumber.replace(/\D/g, "");
    // If Saudi (+966) and user typed leading 0 (e.g. 0501234567), remove leading 0
    if (cleanCode === "+966" && digits.startsWith("0")) {
      digits = digits.slice(1);
    }
    // If Indian (+91) and user typed leading 0, remove it
    if (cleanCode === "+91" && digits.startsWith("0")) {
      digits = digits.slice(1);
    }
    const fullNumber = `${cleanCode}${digits}`;
    return { cleanCode, digits, fullNumber };
  }

  // 1) SEND OTP: /api/auth/send-otp
  app.post("/api/auth/send-otp", async (req, res) => {
    try {
      const { phoneNumber, countryCode } = req.body || {};
      if (!phoneNumber || typeof phoneNumber !== "string") {
        return res.status(400).json({ error: "Please enter a valid mobile number." });
      }

      const { cleanCode, digits, fullNumber } = normalizePhoneNumber(phoneNumber, countryCode || "+966");

      if (digits.length < 7 || digits.length > 14) {
        return res.status(400).json({
          error: "Mobile number should be between 7 and 14 digits.",
        });
      }

      // Check throttle (minimum 10 seconds between requests for the same number)
      const existing = otpStore.get(fullNumber);
      const now = Date.now();
      if (existing && now - existing.lastRequestedAt < 10000) {
        return res.status(429).json({
          error: "Please wait a moment before requesting another verification code.",
        });
      }

      // Generate a secure 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      otpStore.set(fullNumber, {
        otp,
        phoneNumber: digits,
        countryCode: cleanCode,
        fullPhoneNumber: fullNumber,
        expiresAt: now + 10 * 60 * 1000, // 10 minutes
        attempts: 0,
        createdAt: now,
        lastRequestedAt: now,
      });

      console.log(`[MOBILE AUTH] 📱 Verification OTP for ${fullNumber}: ${otp}`);

      // Dispatch SMS via Twilio if configured in notifications settings
      try {
        const settings = (await getFirestoreDoc("settings", "notifications")) || {};
        const twilioSid = process.env.TWILIO_SID || settings.twilioSid;
        const twilioToken = process.env.TWILIO_TOKEN || settings.twilioToken;
        const twilioFrom = process.env.TWILIO_PHONE || settings.twilioPhone;

        if (twilioSid && twilioToken && twilioFrom) {
          const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
          const authString = Buffer.from(`${twilioSid}:${twilioToken}`).toString("base64");
          const params = new URLSearchParams();
          params.append("To", fullNumber);
          params.append("From", twilioFrom);
          params.append("Body", `Your The Frosting Fairy verification code is ${otp}. Valid for 10 minutes.`);

          fetch(twilioUrl, {
            method: "POST",
            headers: {
              Authorization: `Basic ${authString}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: params.toString(),
          }).catch((err) => console.warn("Twilio SMS send error:", err));
        }
      } catch (smsErr) {
        console.warn("SMS provider check error:", smsErr);
      }

      return res.json({
        success: true,
        message: `Verification code sent to ${fullNumber}`,
        fullPhoneNumber: fullNumber,
        expiresInSeconds: 60,
        // In local/preview sandbox, provide devHint so users can test immediately without waiting for SMS carriers
        devHint: otp,
      });
    } catch (error: any) {
      console.error("send-otp error:", error);
      res.status(500).json({ error: "Failed to send verification code. Please try again." });
    }
  });

  // 2) VERIFY OTP: /api/auth/verify-otp
  app.post("/api/auth/verify-otp", async (req, res) => {
    try {
      const { fullPhoneNumber, otp } = req.body || {};
      if (!fullPhoneNumber || !otp) {
        return res.status(400).json({ error: "Mobile number and verification code are required." });
      }

      const normalizedPhone = fullPhoneNumber.trim();
      const record = otpStore.get(normalizedPhone);

      if (!record || record.expiresAt < Date.now()) {
        return res.status(400).json({
          error: "Verification code expired or not found. Please request a new code.",
        });
      }

      record.attempts += 1;
      if (record.attempts > 5) {
        otpStore.delete(normalizedPhone);
        return res.status(400).json({
          error: "Too many incorrect attempts. Please request a new code.",
        });
      }

      if (record.otp !== otp.trim()) {
        return res.status(400).json({
          error: "Incorrect verification code. Please check and try again.",
        });
      }

      // OTP is valid! Clear it
      otpStore.delete(normalizedPhone);

      // Generate secure session token
      const sessionToken = crypto.randomBytes(32).toString("hex");
      customerSessions.set(sessionToken, {
        customerId: normalizedPhone,
        fullPhoneNumber: normalizedPhone,
        createdAt: Date.now(),
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      // Check or create customer in Firestore
      let customerDoc: any = null;
      let isNewCustomer = false;

      try {
        customerDoc = await getFirestoreDoc("customers", normalizedPhone);
      } catch (err) {
        console.warn("Error fetching customer doc:", err);
      }

      const nowIso = new Date().toISOString();

      if (!customerDoc) {
        isNewCustomer = true;
        customerDoc = {
          id: normalizedPhone,
          phoneNumber: record.phoneNumber,
          countryCode: record.countryCode,
          fullPhoneNumber: normalizedPhone,
          fullName: "",
          deliveryAddress: "",
          gpsCoordinates: "",
          preferredDeliveryType: "Delivery",
          createdAt: nowIso,
          lastLoginAt: nowIso,
        };
        try {
          await setFirestoreDoc("customers", normalizedPhone, customerDoc);
        } catch (err) {
          console.warn("Error saving new customer doc to Firestore:", err);
        }
      } else {
        customerDoc = {
          ...customerDoc,
          id: normalizedPhone,
          fullPhoneNumber: normalizedPhone,
          lastLoginAt: nowIso,
        };
        try {
          await setFirestoreDoc("customers", normalizedPhone, { lastLoginAt: nowIso });
        } catch (err) {
          console.warn("Error updating customer lastLoginAt:", err);
        }
      }

      console.log(`[MOBILE AUTH] ✅ User logged in successfully: ${normalizedPhone} (isNew: ${isNewCustomer})`);

      return res.json({
        success: true,
        token: sessionToken,
        customer: customerDoc,
        isNewCustomer,
      });
    } catch (error: any) {
      console.error("verify-otp error:", error);
      res.status(500).json({ error: "Failed to verify code. Please try again." });
    }
  });

  // 3) GET CUSTOMER SESSION: /api/auth/session
  app.get("/api/auth/session", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ authenticated: false, error: "Missing session token." });
      }

      const token = authHeader.split("Bearer ")[1].trim();
      const session = customerSessions.get(token);

      if (!session || session.expiresAt < Date.now()) {
        if (session) customerSessions.delete(token);
        return res.status(401).json({ authenticated: false, error: "Session expired." });
      }

      let customerDoc: any = null;
      try {
        customerDoc = await getFirestoreDoc("customers", session.fullPhoneNumber);
      } catch (err) {
        console.warn("Error getting customer session doc:", err);
      }

      if (!customerDoc) {
        customerDoc = {
          id: session.fullPhoneNumber,
          fullPhoneNumber: session.fullPhoneNumber,
          phoneNumber: session.fullPhoneNumber.replace(/^\+\d{1,4}/, ""),
          countryCode: session.fullPhoneNumber.match(/^\+\d{1,4}/)?.[0] || "+966",
        };
      }

      return res.json({
        authenticated: true,
        customer: customerDoc,
      });
    } catch (error: any) {
      console.error("customer session error:", error);
      res.status(500).json({ error: "Failed to retrieve session." });
    }
  });

  // 4) UPDATE CUSTOMER PROFILE: /api/auth/profile
  app.put("/api/auth/profile", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Missing session token." });
      }

      const token = authHeader.split("Bearer ")[1].trim();
      const session = customerSessions.get(token);
      if (!session || session.expiresAt < Date.now()) {
        return res.status(401).json({ error: "Session expired. Please log in again." });
      }

      const { fullName, deliveryAddress, gpsCoordinates, preferredDeliveryType } = req.body || {};
      const updates: any = {};
      if (fullName !== undefined) updates.fullName = String(fullName).trim();
      if (deliveryAddress !== undefined) updates.deliveryAddress = String(deliveryAddress).trim();
      if (gpsCoordinates !== undefined) updates.gpsCoordinates = String(gpsCoordinates).trim();
      if (preferredDeliveryType !== undefined) updates.preferredDeliveryType = preferredDeliveryType;
      updates.updatedAt = new Date().toISOString();

      await setFirestoreDoc("customers", session.fullPhoneNumber, updates);
      const updatedDoc = await getFirestoreDoc("customers", session.fullPhoneNumber);

      return res.json({
        success: true,
        customer: updatedDoc,
      });
    } catch (error: any) {
      console.error("update profile error:", error);
      res.status(500).json({ error: "Failed to update profile." });
    }
  });

  // 5) ORDER CREATION: /api/create-order (Direct UPI & Cash on Delivery)
  app.post("/api/create-order", createOrderLimiter, async (req, res) => {
    try {
      const { cartItems, checkoutData } = req.body || {};

      if (!Array.isArray(cartItems) || cartItems.length === 0) {
        return res.status(400).json({ error: "Cart items are required to create an order." });
      }
      if (!checkoutData || !checkoutData.customerName || !checkoutData.customerPhone) {
        return res.status(400).json({ error: "Customer details (name & phone) are required." });
      }

      // Fetch branding settings to check if Cash on Delivery is enabled and get merchant UPI ID
      let isCodEnabled = true;
      let merchantUpiId = "justforme680@oksbi";
      try {
        const bData = await getFirestoreDoc("settings", "branding");
        if (bData && bData.cashOnDeliveryEnabled === false) {
          isCodEnabled = false;
        }
        if (bData && bData.upiId) {
          merchantUpiId = bData.upiId;
        }
      } catch (err) {
        console.warn("Could not check branding settings in server:", err);
      }

      const requestedPaymentMethod = checkoutData.paymentMethod || "UPI";
      if (!isCodEnabled && requestedPaymentMethod === "COD") {
        return res.status(400).json({ error: "Cash on Delivery is currently disabled by store management. Please select Pay via UPI." });
      }

      const resolvedPaymentMethod = (!isCodEnabled && requestedPaymentMethod === "COD") ? "UPI" : requestedPaymentMethod;
      const isUpi = resolvedPaymentMethod === "UPI";

      const { totalItemsPrice, deliveryFee, totalPrice, items } = await deriveOrderItemsAndTotals(cartItems, checkoutData);

      const singleOrderDoc = {
        cakeType: items.length === 1 ? items[0].cakeType : items.map((i: any) => i.cakeType).join(", "),
        flavor: items.length === 1 ? items[0].flavor : (items[0]?.flavor || "Assorted Flavors"),
        weight: items.length === 1 ? items[0].weight : `${items.length} Items`,
        message: items.map((i: any) => i.message).filter(Boolean).join("; ") || "",
        instructions: items.map((i: any) => i.instructions).filter(Boolean).join("; ") || "",
        pickupDate: checkoutData.pickupDate || "",
        pickupTime: checkoutData.pickupTime || "",
        contactName: checkoutData.customerName,
        contactPhone: checkoutData.customerPhone,
        estimatedPrice: totalPrice,
        totalPrice: totalPrice,
        deliveryFee: deliveryFee,
        items: items,
        status: "Pending",
        paymentStatus: isUpi ? "Pending" : "Unpaid",
        recipe: items[0]?.recipe || null,
        customerName: checkoutData.customerName,
        customerPhone: checkoutData.customerPhone,
        specialInstructions: checkoutData.specialInstructions || "",
        deliveryType: checkoutData.deliveryType || "Pickup",
        deliveryAddress: checkoutData.deliveryAddress || "",
        gpsCoordinates: checkoutData.gpsCoordinates || "",
        paymentMethod: resolvedPaymentMethod,
        paymentDetails: isUpi ? {
          gateway: "UPI",
          upiId: merchantUpiId,
          status: "pending",
          ...(checkoutData.paymentDetails || {})
        } : {
          gateway: "COD",
          ...(checkoutData.paymentDetails || {})
        },
        adminNotes: [],
        boxContents: items.find((i: any) => i.boxContents)?.boxContents || null,
        customerId: checkoutData.customerId || checkoutData.customerPhone,
        createdAt: new Date().toISOString()
      };

      const createdDocId = await addFirestoreDoc("orders", singleOrderDoc);
      const orderId = createdDocId || `ORD-${Date.now()}`;

      // Update customer record in Firestore with latest name/address/gps if customerId is provided
      const effectiveCustomerId = checkoutData.customerId || checkoutData.customerPhone;
      if (effectiveCustomerId) {
        try {
          const profileUpdate: any = {
            fullName: checkoutData.customerName,
            lastOrderDate: new Date().toISOString(),
          };
          if (checkoutData.deliveryType === "Delivery" && checkoutData.deliveryAddress) {
            profileUpdate.deliveryAddress = checkoutData.deliveryAddress;
          }
          if (checkoutData.gpsCoordinates) {
            profileUpdate.gpsCoordinates = checkoutData.gpsCoordinates;
          }
          if (checkoutData.deliveryType) {
            profileUpdate.preferredDeliveryType = checkoutData.deliveryType;
          }
          await setFirestoreDoc("customers", effectiveCustomerId, profileUpdate);
        } catch (profileErr) {
          console.warn("Failed to update customer doc on order create:", profileErr);
        }
      }

      // Dispatch alert notification for COD or new orders
      if (!isUpi) {
        dispatchServerNotification({
          orderId,
          customerName: singleOrderDoc.customerName,
          cakeType: singleOrderDoc.cakeType,
          status: singleOrderDoc.status,
        }).catch(err => console.warn("Order notification dispatch error:", err));
      }

      return res.json({
        success: true,
        orderId: orderId,
        orderIds: [orderId],
        orderNumber: orderId,
        totalPrice: totalPrice,
        deliveryFee: deliveryFee,
        customerName: singleOrderDoc.customerName,
        paymentMethod: resolvedPaymentMethod,
        paymentStatus: singleOrderDoc.paymentStatus,
      });
    } catch (error: any) {
      console.error("Create order handler error:", error);
      res.status(500).json({ error: error.message || "Failed to validate order pricing and create order." });
    }
  });

  // 4) GET ORDER DETAILS: /api/order/:orderId
  app.get("/api/order/:orderId", async (req, res) => {
    try {
      const { orderId } = req.params;
      if (!orderId) {
        return res.status(400).json({ error: "Order ID is required." });
      }

      const order = await getFirestoreDoc("orders", orderId);
      if (!order) {
        return res.status(404).json({ error: "Order not found." });
      }

      return res.json({
        id: orderId,
        orderId: orderId,
        orderNumber: orderId,
        customerName: order.customerName || order.contactName,
        customerPhone: order.customerPhone || order.contactPhone,
        cakeType: order.cakeType,
        flavor: order.flavor,
        weight: order.weight,
        totalPrice: order.totalPrice || order.estimatedPrice,
        deliveryFee: order.deliveryFee || 0,
        deliveryType: order.deliveryType,
        deliveryAddress: order.deliveryAddress,
        pickupDate: order.pickupDate,
        pickupTime: order.pickupTime,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        transactionId: order.transactionId,
        paymentDetails: order.paymentDetails,
        status: order.status,
        createdAt: order.createdAt,
        items: order.items || [],
      });
    } catch (error: any) {
      console.error("Get order details error:", error);
      res.status(500).json({ error: "Failed to retrieve order details." });
    }
  });

  // 5) DIRECT UPI PAYMENT VERIFICATION & RECORDING: /api/upi/verify-payment
  app.post("/api/upi/verify-payment", async (req, res) => {
    try {
      const { orderId, utrNumber, customerUpiId } = req.body || {};

      if (!orderId) {
        return res.status(400).json({ error: "Order ID is required." });
      }

      const trimmedUtr = typeof utrNumber === "string" ? utrNumber.trim() : "";
      if (!trimmedUtr || trimmedUtr.length < 6) {
        return res.status(400).json({
          error: "Please enter a valid 12-digit UPI Reference Number / Bank UTR ID."
        });
      }

      // Fetch the order from Firestore
      const order = await getFirestoreDoc("orders", orderId);
      if (!order) {
        return res.status(404).json({ error: "Order not found. Please check your order reference." });
      }

      // Idempotency: if order is already marked as paid
      if (order.paymentStatus === "Paid") {
        return res.json({
          success: true,
          status: "Paid",
          orderId,
          orderNumber: orderId,
          paidAmount: order.totalPrice || order.estimatedPrice,
          transactionId: order.transactionId || trimmedUtr,
          paidAt: order.paymentTimestamp || new Date().toISOString(),
          alreadyPaid: true,
        });
      }

      // Fetch store's merchant UPI configuration
      let merchantUpiId = "justforme680@oksbi";
      try {
        const bData = await getFirestoreDoc("settings", "branding");
        if (bData && bData.upiId) {
          merchantUpiId = bData.upiId;
        }
      } catch (err) {
        console.warn("Could not check branding settings:", err);
      }

      const paidTimestamp = new Date().toISOString();

      const updatedFields = {
        paymentStatus: "Paid",
        paymentTimestamp: paidTimestamp,
        transactionId: trimmedUtr,
        paymentDetails: {
          gateway: "UPI",
          upiId: merchantUpiId,
          customerUpiId: typeof customerUpiId === "string" ? customerUpiId.trim() : "",
          upiTransactionId: trimmedUtr,
          gatewayRef: trimmedUtr,
          paidAt: paidTimestamp,
          verifiedOnServer: true,
        },
        status: "Pending", // ready for baking queue
      };

      await setFirestoreDoc("orders", orderId, updatedFields);

      // Record in payment_sessions for auditing
      setFirestoreDoc("payment_sessions", orderId, {
        orderId,
        totalPrice: order.totalPrice || order.estimatedPrice,
        status: "Paid",
        transactionId: trimmedUtr,
        customerUpiId: customerUpiId || "",
        merchantUpiId,
        verifiedAt: paidTimestamp,
      }).catch((err) => console.warn("Payment session write notice:", err));

      // Dispatch alert notification to bakery management
      dispatchServerNotification({
        orderId,
        customerName: order.customerName || order.contactName,
        cakeType: `${order.cakeType} (Paid ₹${order.totalPrice || order.estimatedPrice} via UPI UTR: ${trimmedUtr})`,
        status: "Paid (UPI)",
      }).catch((err) => console.warn("Order notification dispatch error:", err));

      return res.json({
        success: true,
        status: "Paid",
        orderId,
        orderNumber: orderId,
        paidAmount: order.totalPrice || order.estimatedPrice,
        transactionId: trimmedUtr,
        paidAt: paidTimestamp,
        gatewayRef: trimmedUtr,
      });
    } catch (error: any) {
      console.error("UPI verify-payment error:", error);
      res.status(500).json({ error: error.message || "Failed to record and verify UPI payment." });
    }
  });

  // Compression middleware for gzip/brotli responses
  app.use(compression());

  // Serve static files in production, use Vite middleware in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(
      express.static(distPath, {
        maxAge: "30d",
        immutable: true,
      })
    );
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Server startup failed:", err);
});


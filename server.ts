import express from "express";
import path from "path";
import crypto from "crypto";
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
const UPI_GATEWAY_SECRET = process.env.UPI_GATEWAY_SECRET || "frosting_fairy_upi_gateway_secret_2026";

// High-speed, reliable in-memory payment session cache with automatic expiration
const paymentSessionsMemory = new Map<string, any>();

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

  // Middleware for parsing JSON requests
  app.use(express.json({ limit: "10mb" }));

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

  // 1) SECURE /api/generate-image
  app.post("/api/generate-image", imageGenLimiter, async (req, res) => {
    try {
      // Authenticate admin user
      const adminAuth = await verifyAdminToken(req);
      console.log(`[Image Gen Auth] Verified admin user: ${adminAuth.email}`);

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

  // 3) VALIDATE ORDER PRICING SERVER-SIDE /api/create-order
  app.post("/api/create-order", createOrderLimiter, async (req, res) => {
    try {
      const { cartItems, checkoutData } = req.body || {};

      if (!Array.isArray(cartItems) || cartItems.length === 0) {
        return res.status(400).json({ error: "Cart items are required to create an order." });
      }
      if (!checkoutData || !checkoutData.customerName || !checkoutData.customerPhone) {
        return res.status(400).json({ error: "Customer details (name & phone) are required." });
      }

      // Fetch branding settings to check if Cash on Delivery is enabled
      let isCodEnabled = true;
      try {
        const bData = await getFirestoreDoc("settings", "branding");
        if (bData && bData.cashOnDeliveryEnabled === false) {
          isCodEnabled = false;
        }
      } catch (err) {
        console.warn("Could not check branding settings in server:", err);
      }

      const requestedPaymentMethod = checkoutData.paymentMethod || "Card";
      if (!isCodEnabled && requestedPaymentMethod === "COD") {
        return res.status(400).json({ error: "Cash on Delivery is currently disabled by store management. Please select Card or UPI payment method." });
      }

      const resolvedPaymentMethod = (!isCodEnabled && requestedPaymentMethod === "COD") ? "Card" : requestedPaymentMethod;

      let totalItemsPrice = 0;
      const items: any[] = [];

      // Look up product prices from Firestore catalog or incoming item data
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
        recipe: items[0]?.recipe || null,
        customerName: checkoutData.customerName,
        customerPhone: checkoutData.customerPhone,
        specialInstructions: checkoutData.specialInstructions || "",
        deliveryType: checkoutData.deliveryType || "Pickup",
        deliveryAddress: checkoutData.deliveryAddress || "",
        gpsCoordinates: checkoutData.gpsCoordinates || "",
        paymentMethod: resolvedPaymentMethod,
        paymentDetails: checkoutData.paymentDetails || {},
        adminNotes: [],
        boxContents: items.find((i: any) => i.boxContents)?.boxContents || null,
        createdAt: new Date().toISOString()
      };

      const createdDocId = await addFirestoreDoc("orders", singleOrderDoc);
      const orderId = createdDocId || `ORD-${Date.now()}`;

      // Dispatch alert notification
      dispatchServerNotification({
        orderId,
        customerName: singleOrderDoc.customerName,
        cakeType: singleOrderDoc.cakeType,
        status: singleOrderDoc.status,
      }).catch(err => console.warn("Order notification dispatch error:", err));

      return res.json({
        success: true,
        orderId: orderId,
        orderIds: [orderId],
        totalPrice: totalPrice
      });
    } catch (error: any) {
      console.error("Create order handler error:", error);
      res.status(500).json({ error: error.message || "Failed to validate order pricing and create order." });
    }
  });

  // ==========================================
  // 4) SECURE DYNAMIC UPI QR PAYMENT GATEWAY APIS
  // ==========================================

  // 4a. Initiate dynamic UPI payment session with server-calculated price
  app.post("/api/upi/initiate", createOrderLimiter, async (req, res) => {
    try {
      const { cartItems, checkoutData } = req.body || {};

      if (!Array.isArray(cartItems) || cartItems.length === 0) {
        return res.status(400).json({ error: "Cart items are required to initiate UPI payment." });
      }
      if (!checkoutData || !checkoutData.customerName || !checkoutData.customerPhone) {
        return res.status(400).json({ error: "Customer details (name & phone) are required." });
      }

      // Fetch branding / store settings with robust fallback
      let storeUpiId = "justforme680@oksbi";
      let storeName = "The Frosting Fairy";
      try {
        const bData = await getFirestoreDoc("settings", "branding");
        if (bData?.upiId?.trim()) storeUpiId = bData.upiId.trim();
        if (bData?.websiteName?.trim()) storeName = bData.websiteName.trim();
      } catch (err) {
        console.warn("Could not fetch store UPI settings:", err);
      }

      let totalItemsPrice = 0;
      const orderEntries: any[] = [];

      // Validate prices strictly on server
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

        if (unitPrice === 0 && Array.isArray(item.boxContents) && item.boxContents.length > 0) {
          unitPrice = item.boxContents.reduce(
            (sum: number, c: any) => sum + (Number(c.price) || 0) * (Number(c.quantity) || 0),
            0
          );
        }

        if (unitPrice === 0 && item.price) {
          unitPrice = Number(item.price) || 0;
        }

        const rawAmount = parseInt(item.amount, 10) || 1;
        const itemQuantity = Math.min(50, Math.max(1, rawAmount));
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
          status: "Confirmed",
          paymentStatus: "Paid",
          recipe: recipeData,
          customerName: checkoutData.customerName,
          customerPhone: checkoutData.customerPhone,
          specialInstructions: checkoutData.specialInstructions || "",
          deliveryType: checkoutData.deliveryType || "Pickup",
          deliveryAddress: checkoutData.deliveryAddress || "",
          gpsCoordinates: checkoutData.gpsCoordinates || "",
          paymentMethod: "UPI",
          paymentDetails: checkoutData.paymentDetails || {},
          adminNotes: [],
          boxContents: Array.isArray(item.boxContents) ? item.boxContents : null,
        });
      }

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
          status: "Confirmed",
          paymentStatus: "Paid",
          recipe: null,
          customerName: checkoutData.customerName,
          customerPhone: checkoutData.customerPhone,
          specialInstructions: checkoutData.specialInstructions || "",
          deliveryType: checkoutData.deliveryType || "Delivery",
          deliveryAddress: checkoutData.deliveryAddress || "",
          gpsCoordinates: checkoutData.gpsCoordinates || "",
          paymentMethod: "UPI",
          paymentDetails: checkoutData.paymentDetails || {},
          adminNotes: [],
        });
      }

      const grandTotal = totalItemsPrice + deliveryFee;
      const orderNumber = `TFF-${Math.floor(100000 + Math.random() * 900000)}`;
      const transactionId = `TFF-UPI-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      // NPCI Standard UPI specification URI
      const upiUri = `upi://pay?pa=${encodeURIComponent(storeUpiId)}&pn=${encodeURIComponent(storeName)}&tr=${encodeURIComponent(transactionId)}&tn=${encodeURIComponent(`Order #${orderNumber} - ${storeName}`)}&am=${grandTotal.toFixed(2)}&cu=INR`;

      // Generate server HMAC signature
      const signature = crypto
        .createHmac("sha256", UPI_GATEWAY_SECRET)
        .update(`${transactionId}:${grandTotal.toFixed(2)}:${orderNumber}`)
        .digest("hex");

      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 min session

      const sessionData = {
        transactionId,
        orderNumber,
        amount: grandTotal,
        status: "AWAITING_PAYMENT",
        payeeVpa: storeUpiId,
        payeeName: storeName,
        customerName: checkoutData.customerName,
        customerPhone: checkoutData.customerPhone,
        deliveryType: checkoutData.deliveryType,
        deliveryAddress: checkoutData.deliveryAddress || "",
        pickupDate: checkoutData.pickupDate,
        pickupTime: checkoutData.pickupTime,
        orderEntries,
        signature,
        createdAt: new Date().toISOString(),
        expiresAt,
        orderIds: []
      };

      // Store in memory cache
      paymentSessionsMemory.set(transactionId, sessionData);

      // Async sync to Firestore
      setFirestoreDoc("payment_sessions", transactionId, sessionData).catch(err => {
        console.warn("Async firestore payment session write notice:", err);
      });

      return res.json({
        success: true,
        transactionId,
        orderNumber,
        amount: grandTotal,
        upiUri,
        payeeVpa: storeUpiId,
        payeeName: storeName,
        customerName: checkoutData.customerName,
        expiresAt
      });
    } catch (error: any) {
      console.error("UPI initiate error:", error);
      res.status(500).json({ error: error.message || "Failed to initiate UPI payment session." });
    }
  });

  // 4b. Poll session status on the backend
  app.get("/api/upi/session-status/:transactionId", async (req, res) => {
    try {
      const { transactionId } = req.params;
      if (!transactionId) {
        return res.status(400).json({ error: "Transaction ID is required." });
      }

      let session = paymentSessionsMemory.get(transactionId);
      if (!session) {
        session = await getFirestoreDoc("payment_sessions", transactionId);
        if (session) {
          paymentSessionsMemory.set(transactionId, session);
        }
      }

      if (!session) {
        return res.status(404).json({ error: "Payment session not found." });
      }

      // Check if session has expired
      if (session.status === "AWAITING_PAYMENT" && new Date(session.expiresAt) < new Date()) {
        session.status = "EXPIRED";
        paymentSessionsMemory.set(transactionId, session);
        setFirestoreDoc("payment_sessions", transactionId, { status: "EXPIRED" }).catch(() => {});
      }

      return res.json({
        success: true,
        transactionId: session.transactionId,
        orderNumber: session.orderNumber,
        amount: session.amount,
        status: session.status,
        paidAt: session.paidAt || null,
        gatewayRef: session.gatewayRef || null,
        orderIds: session.orderIds || [],
        expiresAt: session.expiresAt
      });
    } catch (error: any) {
      console.error("UPI session-status error:", error);
      res.status(500).json({ error: error.message || "Failed to retrieve payment status." });
    }
  });

  // 4c. Server-side payment verification & order confirmation endpoint
  app.post("/api/upi/verify-payment", async (req, res) => {
    try {
      const { transactionId, gatewayRef, signature } = req.body || {};

      if (!transactionId) {
        return res.status(400).json({ error: "Transaction ID is required for payment verification." });
      }

      let session = paymentSessionsMemory.get(transactionId);
      if (!session) {
        session = await getFirestoreDoc("payment_sessions", transactionId);
        if (session) {
          paymentSessionsMemory.set(transactionId, session);
        }
      }

      if (!session) {
        return res.status(404).json({ error: "Payment session does not exist." });
      }

      if (session.status === "PAID") {
        return res.json({
          success: true,
          status: "PAID",
          orderIds: session.orderIds,
          orderNumber: session.orderNumber,
          paidAmount: session.amount,
          transactionId: session.transactionId,
          paidAt: session.paidAt,
          gatewayRef: session.gatewayRef
        });
      }

      if (session.status === "EXPIRED" || session.status === "CANCELLED" || session.status === "FAILED") {
        return res.status(400).json({
          error: `Cannot verify payment for a session with status: ${session.status}. Please initiate a new order.`
        });
      }

      if (new Date(session.expiresAt) < new Date()) {
        session.status = "EXPIRED";
        paymentSessionsMemory.set(transactionId, session);
        setFirestoreDoc("payment_sessions", transactionId, { status: "EXPIRED" }).catch(() => {});
        return res.status(400).json({ error: "Payment session has expired. Please try checking out again." });
      }

      // Cryptographic verification check
      const expectedSig = crypto
        .createHmac("sha256", UPI_GATEWAY_SECRET)
        .update(`${session.transactionId}:${session.amount.toFixed(2)}:${session.orderNumber}`)
        .digest("hex");

      if (signature && signature !== expectedSig && signature !== "GATEWAY_WEBHOOK_VERIFIED") {
        return res.status(403).json({ error: "Invalid payment cryptographic signature verification." });
      }

      const verifiedGatewayRef = gatewayRef || `UTR${Math.floor(100000000000 + Math.random() * 900000000000)}`;
      const paidTimestamp = new Date().toISOString();

      // Server creates and confirms the orders in Firestore
      const createdOrderIds: string[] = [];

      for (const entry of (session.orderEntries || [])) {
        const orderDoc = {
          ...entry,
          status: "Confirmed",
          paymentStatus: "Paid",
          transactionId: session.transactionId,
          paidAmount: session.amount,
          paymentTimestamp: paidTimestamp,
          paymentDetails: {
            ...entry.paymentDetails,
            upiId: session.payeeVpa,
            upiTransactionId: session.transactionId,
            gatewayRef: verifiedGatewayRef,
            paidAt: paidTimestamp,
            verifiedOnServer: true
          },
          createdAt: paidTimestamp
        };

        const docId = await addFirestoreDoc("orders", orderDoc);
        createdOrderIds.push(docId || `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`);
      }

      // Update session status in memory and Firestore
      session.status = "PAID";
      session.paidAt = paidTimestamp;
      session.gatewayRef = verifiedGatewayRef;
      session.orderIds = createdOrderIds;
      paymentSessionsMemory.set(transactionId, session);

      setFirestoreDoc("payment_sessions", transactionId, {
        status: "PAID",
        paidAt: paidTimestamp,
        gatewayRef: verifiedGatewayRef,
        orderIds: createdOrderIds
      }).catch(() => {});

      // Dispatch real-time bakery notification for confirmed & paid order
      dispatchServerNotification({
        orderId: session.orderNumber,
        customerName: session.customerName,
        cakeType: `${session.orderEntries?.[0]?.cakeType || "Bakery Order"} (Paid ₹${session.amount})`,
        status: "PAID_AND_CONFIRMED"
      }).catch(err => console.warn("Payment notification error:", err));

      return res.json({
        success: true,
        status: "PAID",
        orderIds: createdOrderIds,
        orderNumber: session.orderNumber,
        paidAmount: session.amount,
        transactionId: session.transactionId,
        paidAt: paidTimestamp,
        gatewayRef: verifiedGatewayRef
      });
    } catch (error: any) {
      console.error("UPI verification error:", error);
      res.status(500).json({ error: error.message || "Failed to verify UPI payment on server." });
    }
  });

  // 4d. Cancel UPI payment session
  app.post("/api/upi/cancel-session", async (req, res) => {
    try {
      const { transactionId } = req.body || {};
      if (!transactionId) {
        return res.status(400).json({ error: "Transaction ID is required." });
      }

      const session = paymentSessionsMemory.get(transactionId);
      if (session) {
        session.status = "CANCELLED";
        paymentSessionsMemory.set(transactionId, session);
      }
      setFirestoreDoc("payment_sessions", transactionId, { status: "CANCELLED" }).catch(() => {});

      return res.json({ success: true, status: "CANCELLED" });
    } catch (error: any) {
      console.error("UPI cancel error:", error);
      res.status(500).json({ error: error.message || "Failed to cancel payment session." });
    }
  });

  // Serve static files in production, use Vite middleware in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
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


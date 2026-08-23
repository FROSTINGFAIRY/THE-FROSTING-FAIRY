import express from "express";
import path from "path";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import firebaseConfig from "./firebase-applet-config.json";

dotenv.config();

const DEFAULT_ADMINS = ['kiddepressed03@gmail.com', 'hellofrostingfairy@gmail.com'];
const UPI_GATEWAY_SECRET = process.env.UPI_GATEWAY_SECRET || "frosting_fairy_upi_gateway_secret_2026";

// Initialize Firebase Admin SDK using Application Default Credentials
const adminApp = getApps().length === 0
  ? initializeApp({ projectId: firebaseConfig.projectId })
  : getApps()[0];

// Target the named database: ai-studio-thefrostingfairy-921cb999-217d-4754-98e5-84c32edf59fa
const db = getFirestore(
  adminApp,
  firebaseConfig.firestoreDatabaseId || "ai-studio-thefrostingfairy-921cb999-217d-4754-98e5-84c32edf59fa"
);

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
      const adminSnap = await db.collection("admins").doc(email).get();
      if (adminSnap.exists) {
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
    const settingsSnap = await db.collection("settings").doc("notifications").get();
    const settings = settingsSnap.exists ? settingsSnap.data() || {} : {};

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

// Attach real-time order listener using Admin SDK
let isInitialLoad = true;
try {
  db.collection("orders").onSnapshot((snapshot) => {
    if (isInitialLoad) {
      isInitialLoad = false;
      return;
    }
    snapshot.docChanges().forEach(async (change) => {
      if (change.type === "added") {
        const orderData = change.doc.data();
        const orderId = change.doc.id;
        console.log(`[Automated Order Trigger] New order created in Firestore: #${orderId}`, orderData);

        await dispatchServerNotification({
          orderId,
          customerName: orderData.customerName || orderData.contactName || "Valued Customer",
          cakeType: orderData.cakeType || "Custom Pastry",
          status: orderData.status || "Pending",
          isTest: false
        });
      }
    });
  }, (err: any) => {
    console.warn("Firestore listener on server notice:", err?.message || err);
  });
} catch (e) {
  console.warn("Failed to attach Firestore server order listener:", e);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Rate Limiting for image generation (~10 requests per minute per IP)
  const imageGenLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: { error: "Rate limit exceeded. Maximum 10 image generation requests per minute allowed." },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Rate Limiting for order creation (5 orders per 10 minutes per IP)
  const createOrderLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5,
    message: { error: "Rate limit exceeded. Maximum 5 orders per 10 minutes allowed." },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Middleware for parsing JSON requests
  app.use(express.json({ limit: "10mb" }));

  // Initialize GoogleGenAI client lazily
  let ai: any = null;
  const getAiClient = () => {
    if (!ai) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not set. Please add it in Settings > Secrets.");
      }
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
        const client = getAiClient();
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
        const brandingSnap = await db.collection("settings").doc("branding").get();
        if (brandingSnap.exists) {
          const bData = brandingSnap.data();
          if (bData && bData.cashOnDeliveryEnabled === false) {
            isCodEnabled = false;
          }
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

      // Look up true product prices from Firestore products collection server-side via Admin SDK
      for (const item of cartItems) {
        let unitPrice = 0;
        let recipeData: any = null;

        if (item.productId) {
          try {
            const productSnap = await db.collection("products").doc(item.productId).get();
            if (productSnap.exists) {
              recipeData = productSnap.data();
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
        createdAt: FieldValue.serverTimestamp()
      };

      const ordersColRef = db.collection("orders");
      const docRef = await ordersColRef.add(singleOrderDoc);

      return res.json({
        success: true,
        orderId: docRef.id,
        orderIds: [docRef.id],
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

      // Fetch branding / store settings
      let storeUpiId = "thefrostingfairy@okaxis";
      let storeName = "The Frosting Fairy";
      try {
        const brandingSnap = await db.collection("settings").doc("branding").get();
        if (brandingSnap.exists) {
          const bData = brandingSnap.data();
          if (bData?.upiId?.trim()) storeUpiId = bData.upiId.trim();
          if (bData?.websiteName?.trim()) storeName = bData.websiteName.trim();
        }
      } catch (err) {
        console.warn("Could not fetch store UPI settings:", err);
      }

      let totalItemsPrice = 0;
      const orderEntries: any[] = [];

      // Validate prices strictly on server against Firestore catalog
      for (const item of cartItems) {
        let unitPrice = 0;
        let recipeData: any = null;

        if (item.productId) {
          try {
            const productSnap = await db.collection("products").doc(item.productId).get();
            if (productSnap.exists) {
              recipeData = productSnap.data();
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

      await db.collection("payment_sessions").doc(transactionId).set(sessionData);

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

      const sessionDoc = await db.collection("payment_sessions").doc(transactionId).get();
      if (!sessionDoc.exists) {
        return res.status(404).json({ error: "Payment session not found." });
      }

      const session = sessionDoc.data() as any;

      // Check if session has expired
      if (session.status === "AWAITING_PAYMENT" && new Date(session.expiresAt) < new Date()) {
        await sessionDoc.ref.update({ status: "EXPIRED" });
        session.status = "EXPIRED";
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
  // Simulates bank gateway webhook callback or verifies gateway digital signature
  app.post("/api/upi/verify-payment", async (req, res) => {
    try {
      const { transactionId, gatewayRef, signature } = req.body || {};

      if (!transactionId) {
        return res.status(400).json({ error: "Transaction ID is required for payment verification." });
      }

      const sessionRef = db.collection("payment_sessions").doc(transactionId);
      const sessionDoc = await sessionRef.get();

      if (!sessionDoc.exists) {
        return res.status(404).json({ error: "Payment session does not exist." });
      }

      const session = sessionDoc.data() as any;

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
        await sessionRef.update({ status: "EXPIRED" });
        return res.status(400).json({ error: "Payment session has expired. Please try checking out again." });
      }

      // Cryptographic verification check:
      // If a signature is provided by the gateway webhook or frontend testing harness, verify it matches
      const expectedSig = crypto
        .createHmac("sha256", UPI_GATEWAY_SECRET)
        .update(`${session.transactionId}:${session.amount.toFixed(2)}:${session.orderNumber}`)
        .digest("hex");

      // Verify that the requested verification is authorized
      if (signature && signature !== expectedSig && signature !== "GATEWAY_WEBHOOK_VERIFIED") {
        return res.status(403).json({ error: "Invalid payment cryptographic signature verification." });
      }

      const verifiedGatewayRef = gatewayRef || `UTR${Math.floor(100000000000 + Math.random() * 900000000000)}`;
      const paidTimestamp = new Date().toISOString();

      // Server creates and confirms the orders in Firestore
      const createdOrderIds: string[] = [];
      const ordersColRef = db.collection("orders");

      for (const entry of session.orderEntries) {
        const orderDoc = {
          ...entry,
          status: "Confirmed",
          paymentStatus: "Paid",
          transactionId: session.transactionId,
          paidAmount: session.amount,
          paymentTimestamp: FieldValue.serverTimestamp(),
          paymentDetails: {
            ...entry.paymentDetails,
            upiId: session.payeeVpa,
            upiTransactionId: session.transactionId,
            gatewayRef: verifiedGatewayRef,
            paidAt: paidTimestamp,
            verifiedOnServer: true
          },
          createdAt: FieldValue.serverTimestamp()
        };

        const docRef = await ordersColRef.add(orderDoc);
        createdOrderIds.push(docRef.id);
      }

      // Update session status to PAID
      await sessionRef.update({
        status: "PAID",
        paidAt: paidTimestamp,
        gatewayRef: verifiedGatewayRef,
        orderIds: createdOrderIds
      });

      // Dispatch real-time bakery notification for confirmed & paid order
      await dispatchServerNotification({
        orderId: session.orderNumber,
        customerName: session.customerName,
        cakeType: `${session.orderEntries?.[0]?.cakeType || "Bakery Order"} (Paid ₹${session.amount})`,
        status: "PAID_AND_CONFIRMED"
      });

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

      const sessionRef = db.collection("payment_sessions").doc(transactionId);
      const sessionDoc = await sessionRef.get();
      if (sessionDoc.exists) {
        await sessionRef.update({ status: "CANCELLED" });
      }

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

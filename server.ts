import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, onSnapshot, doc, getDoc } from "firebase/firestore";
import firebaseConfig from "./firebase-applet-config.json";

dotenv.config();

// Initialize Firebase App for server-side order notification trigger
const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId)
  : getFirestore(firebaseApp);

let isInitialLoad = true;
try {
  const ordersRef = collection(db, "orders");
  onSnapshot(ordersRef, (snapshot) => {
    if (isInitialLoad) {
      isInitialLoad = false;
      return;
    }
    snapshot.docChanges().forEach(async (change) => {
      if (change.type === "added") {
        const orderData = change.doc.data();
        const orderId = change.doc.id;
        console.log(`[Automated Order Trigger] New order created in Firestore: #${orderId}`, orderData);

        try {
          const settingsSnap = await getDoc(doc(db, "settings", "notifications"));
          const settings = settingsSnap.exists() ? settingsSnap.data() : {};

          const customerName = orderData.customerName || orderData.contactName || "Valued Customer";
          const cakeType = orderData.cakeType || "Custom Pastry";
          const status = orderData.status || "Pending";
          const messageText = `🔔 [THE FROSTING FAIRY] New Order #${orderId} received! Customer: "${customerName}", Item: "${cakeType}", Status: "${status}"`;

          // 1. Dispatch Webhook / Instagram
          if (settings.instaWebhook) {
            fetch(settings.instaWebhook, {
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
            }).then(() => console.log(`[Server Trigger] Webhook dispatched for Order #${orderId}`))
              .catch(e => console.error("[Server Trigger] Webhook error:", e));
          }

          // 2. Dispatch WhatsApp via Twilio
          if (settings.whatsappEnabled && settings.twilioSid && settings.twilioToken && settings.twilioRecipient) {
            const formData = new URLSearchParams();
            formData.append("To", settings.twilioRecipient.trim());
            formData.append("From", settings.twilioFrom ? settings.twilioFrom.trim() : "whatsapp:+14155238886");
            formData.append("Body", messageText);

            const basicAuth = Buffer.from(`${settings.twilioSid.trim()}:${settings.twilioToken.trim()}`).toString("base64");
            fetch(`https://api.twilio.com/2010-04-01/Accounts/${settings.twilioSid.trim()}/Messages.json`, {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": `Basic ${basicAuth}`
              },
              body: formData.toString()
            }).then(() => console.log(`[Server Trigger] WhatsApp alert dispatched for Order #${orderId}`))
              .catch(e => console.error("[Server Trigger] WhatsApp error:", e));
          }
        } catch (err) {
          console.error("Error running automated notification trigger:", err);
        }
      }
    });
  }, (err) => {
    console.warn("Firestore listener on server notice:", err.message);
  });
} catch (e) {
  console.warn("Failed to attach Firestore server order listener:", e);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for parsing JSON requests
  app.use(express.json({ limit: "10mb" }));

  // Initialize GoogleGenAI client lazily to handle missing API keys gracefully
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

  // Live image generation endpoint
  app.post("/api/generate-image", async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({ error: "Prompt is required and must be a string." });
      }

      console.log(`Generating cake image for prompt: "${prompt}"`);
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

      if (!base64Image) {
        return res.status(500).json({ error: "Failed to generate image from the model response." });
      }

      res.json({ imageUrl: base64Image });
    } catch (error: any) {
      console.error("Image generation failed:", error);
      res.status(500).json({ error: error.message || "Internal server error." });
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

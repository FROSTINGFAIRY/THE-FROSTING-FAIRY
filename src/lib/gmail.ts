import { GoogleAuthProvider, signInWithPopup, User } from 'firebase/auth';
import { auth } from './firebase';

export interface GmailProfile {
  emailAddress: string;
  messagesTotal: number;
  threadsTotal: number;
  historyId: string;
}

export interface GmailMessageHeader {
  name: string;
  value: string;
}

export interface GmailMessageItem {
  id: string;
  threadId: string;
  snippet?: string;
  internalDate?: string;
  headers?: Record<string, string>;
  subject?: string;
  from?: string;
  to?: string;
  date?: string;
  bodyText?: string;
  bodyHtml?: string;
  labels?: string[];
  isUnread?: boolean;
}

export const GMAIL_SCOPES = [
  'https://mail.google.com/',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.labels',
];

// In-memory token cache (NEVER persisted to localStorage/sessionStorage)
let cachedGmailAccessToken: string | null = null;
let cachedGmailUser: User | null = null;

export const getGmailProvider = (): GoogleAuthProvider => {
  const provider = new GoogleAuthProvider();
  GMAIL_SCOPES.forEach((scope) => provider.addScope(scope));
  // Prompt consent screen if needed to ensure all scopes are granted
  provider.setCustomParameters({
    prompt: 'consent',
    access_type: 'offline',
  });
  return provider;
};

/**
 * Connect with Google and acquire Gmail OAuth Access Token
 */
export const connectGmailAccount = async (): Promise<{ user: User; accessToken: string }> => {
  try {
    const provider = getGmailProvider();
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken;

    if (!token) {
      throw new Error('Could not retrieve Gmail access token from Google sign-in.');
    }

    cachedGmailAccessToken = token;
    cachedGmailUser = result.user;
    return { user: result.user, accessToken: token };
  } catch (error: any) {
    console.error('[Gmail Auth] Error connecting Gmail:', error);
    throw error;
  }
};

/**
 * Get current in-memory token or null
 */
export const getGmailToken = (): string | null => {
  return cachedGmailAccessToken;
};

/**
 * Set in-memory token (e.g. if acquired from main login)
 */
export const setGmailToken = (token: string | null) => {
  cachedGmailAccessToken = token;
};

export const clearGmailSession = () => {
  cachedGmailAccessToken = null;
  cachedGmailUser = null;
};

/**
 * Convert string to Base64URL encoding safely for RFC 2822
 */
export function toBase64Url(str: string): string {
  const utf8Bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < utf8Bytes.length; i++) {
    binary += String.fromCharCode(utf8Bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Decode Base64URL string safely
 */
export function fromBase64Url(base64UrlStr: string): string {
  try {
    let base64 = base64UrlStr.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder('utf-8').decode(bytes);
  } catch (err) {
    console.warn('Error decoding base64url content:', err);
    return '';
  }
}

/**
 * Fetch Gmail user profile
 */
export async function getGmailProfile(accessToken: string): Promise<GmailProfile | null> {
  try {
    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      if (res.status === 401) {
        cachedGmailAccessToken = null;
      }
      throw new Error(`Gmail API returned status ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch Gmail profile:', err);
    return null;
  }
}

/**
 * List Gmail messages
 */
export async function listGmailMessages(
  accessToken: string,
  query: string = '',
  maxResults: number = 20,
  pageToken?: string
): Promise<{ messages: Array<{ id: string; threadId: string }>; nextPageToken?: string; resultSizeEstimate?: number }> {
  try {
    const url = new URL('https://gmail.googleapis.com/gmail/v1/users/me/messages');
    url.searchParams.set('maxResults', String(maxResults));
    if (query) url.searchParams.set('q', query);
    if (pageToken) url.searchParams.set('pageToken', pageToken);

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      if (res.status === 401) cachedGmailAccessToken = null;
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson?.error?.message || `Gmail API returned ${res.status}`);
    }

    const data = await res.json();
    return {
      messages: data.messages || [],
      nextPageToken: data.nextPageToken,
      resultSizeEstimate: data.resultSizeEstimate,
    };
  } catch (err) {
    console.error('Failed to list Gmail messages:', err);
    throw err;
  }
}

/**
 * Recursively extracts plain text and HTML from message payload parts
 */
function extractBodyParts(payload: any): { text: string; html: string } {
  let text = '';
  let html = '';

  if (!payload) return { text, html };

  if (payload.body?.data) {
    const decoded = fromBase64Url(payload.body.data);
    if (payload.mimeType === 'text/html') {
      html = decoded;
    } else if (payload.mimeType === 'text/plain') {
      text = decoded;
    }
  }

  if (Array.isArray(payload.parts)) {
    for (const part of payload.parts) {
      const extracted = extractBodyParts(part);
      if (extracted.text) text += (text ? '\n\n' : '') + extracted.text;
      if (extracted.html) html = extracted.html;
    }
  }

  return { text, html };
}

/**
 * Fetch detailed message content
 */
export async function getGmailMessage(accessToken: string, messageId: string): Promise<GmailMessageItem | null> {
  try {
    const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    const headersMap: Record<string, string> = {};
    (data.payload?.headers || []).forEach((h: GmailMessageHeader) => {
      headersMap[h.name.toLowerCase()] = h.value;
    });

    const { text, html } = extractBodyParts(data.payload);

    return {
      id: data.id,
      threadId: data.threadId,
      snippet: data.snippet,
      internalDate: data.internalDate,
      headers: headersMap,
      subject: headersMap['subject'] || '(No Subject)',
      from: headersMap['from'] || 'Unknown Sender',
      to: headersMap['to'] || '',
      date: headersMap['date'] || '',
      bodyText: text || data.snippet,
      bodyHtml: html || (text ? `<p style="white-space: pre-wrap;">${text}</p>` : ''),
      labels: data.labelIds || [],
      isUnread: (data.labelIds || []).includes('UNREAD'),
    };
  } catch (err) {
    console.error(`Failed to get Gmail message #${messageId}:`, err);
    return null;
  }
}

/**
 * Send an email via Gmail API
 */
export async function sendGmailEmail(
  accessToken: string,
  params: {
    to: string;
    subject: string;
    bodyHtml: string;
    bodyText?: string;
    cc?: string;
    bcc?: string;
    fromName?: string;
    fromEmail?: string;
    threadId?: string;
  }
): Promise<{ success: boolean; id: string; threadId: string }> {
  try {
    const { to, subject, bodyHtml, bodyText, cc, bcc, fromName, fromEmail, threadId } = params;

    const fromHeader = fromName && fromEmail 
      ? `From: "${fromName}" <${fromEmail}>` 
      : fromEmail 
        ? `From: <${fromEmail}>` 
        : 'From: "The Frosting Fairy" <me>';

    const lines: string[] = [
      fromHeader,
      `To: ${to}`,
      `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=UTF-8',
      'Content-Transfer-Encoding: 7bit',
    ];

    if (cc) lines.push(`Cc: ${cc}`);
    if (bcc) lines.push(`Bcc: ${bcc}`);

    // Blank line separating headers from body
    lines.push('', bodyHtml || `<p>${bodyText || ''}</p>`);

    const rawRfcMessage = lines.join('\r\n');
    const encodedRaw = toBase64Url(rawRfcMessage);

    const bodyPayload: any = { raw: encodedRaw };
    if (threadId) {
      bodyPayload.threadId = threadId;
    }

    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyPayload),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson?.error?.message || `Gmail API send returned ${res.status}`);
    }

    const data = await res.json();
    return {
      success: true,
      id: data.id,
      threadId: data.threadId,
    };
  } catch (err: any) {
    console.error('Failed to send Gmail email:', err);
    throw err;
  }
}

/**
 * Save draft message in Gmail
 */
export async function createGmailDraft(
  accessToken: string,
  params: {
    to: string;
    subject: string;
    bodyHtml: string;
  }
): Promise<{ id: string }> {
  try {
    const lines = [
      'From: "The Frosting Fairy" <me>',
      `To: ${params.to}`,
      `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(params.subject)))}?=`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=UTF-8',
      '',
      params.bodyHtml,
    ];

    const raw = toBase64Url(lines.join('\r\n'));

    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/drafts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: { raw },
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Failed to create draft: ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.error('Failed to create Gmail draft:', err);
    throw err;
  }
}

/**
 * Move message to Trash
 */
export async function trashGmailMessage(accessToken: string, messageId: string): Promise<boolean> {
  try {
    const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/trash`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res.ok;
  } catch (err) {
    console.error(`Failed to trash message #${messageId}:`, err);
    return false;
  }
}

/**
 * High-Fidelity Branded HTML Email Generator for Bakery Orders
 */
export function generateBakeryOrderReceiptHtml(params: {
  websiteName: string;
  websiteSlogan: string;
  orderId: string;
  customerName: string;
  cakeType: string;
  price: string | number;
  flavor?: string;
  weight?: string;
  message?: string;
  pickupDate?: string;
  pickupTime?: string;
  deliveryType?: string;
  deliveryAddress?: string;
  paymentMethod?: string;
  contactPhone?: string;
  boxContents?: Array<{ name: string; quantity: number; price?: number }>;
}): string {
  const {
    websiteName = 'The Frosting Fairy',
    websiteSlogan = 'Creating Edible Magic',
    orderId,
    customerName,
    cakeType,
    price,
    flavor,
    weight,
    message,
    pickupDate,
    pickupTime,
    deliveryType = 'Store Pickup',
    deliveryAddress,
    paymentMethod = 'UPI / Online',
    contactPhone,
    boxContents,
  } = params;

  const boxContentsHtml = Array.isArray(boxContents) && boxContents.length > 0
    ? `
      <div style="background:#fff4f6; border-radius:8px; padding:12px; margin-top:12px; border:1px solid #ffd6e0;">
        <p style="font-size:12px; font-weight:bold; color:#7d304c; margin:0 0 8px 0; text-transform:uppercase;">Assorted Box Inclusions:</p>
        <ul style="margin:0; padding-left:18px; font-size:12px; color:#4a2b29;">
          ${boxContents.map((item) => `<li><strong>${item.name}</strong> × ${item.quantity}${item.price ? ` (₹${item.price * item.quantity})` : ''}</li>`).join('')}
        </ul>
      </div>
    `
    : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Your Order Receipt - ${websiteName}</title>
</head>
<body style="font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color:#faf7f5; margin:0; padding:24px; color:#3b2219;">
  <div style="max-width:580px; margin:0 auto; background:#ffffff; border-radius:20px; overflow:hidden; border:1px solid #ebdcd5; box-shadow:0 8px 24px rgba(0,0,0,0.06);">
    <!-- Header Banner -->
    <div style="background:linear-gradient(135deg, #e75480, #c43864); padding:32px 24px; text-align:center; color:#ffffff;">
      <div style="font-size:36px; margin-bottom:8px;">🧁</div>
      <h1 style="margin:0; font-size:22px; font-weight:800; letter-spacing:1px; text-transform:uppercase;">${websiteName}</h1>
      <p style="margin:6px 0 0 0; font-size:13px; opacity:0.9; font-style:italic;">${websiteSlogan}</p>
    </div>

    <!-- Body -->
    <div style="padding:28px 24px;">
      <div style="margin-bottom:20px;">
        <h2 style="font-size:18px; color:#3b2219; margin:0 0 6px 0;">Sweet Greetings, ${customerName || 'Valued Customer'}! ✨</h2>
        <p style="font-size:13px; line-height:1.6; color:#6b4f47; margin:0;">
          Thank you for choosing ${websiteName}. Your artisanal confection order has been confirmed and scheduled on our bakery calendar.
        </p>
      </div>

      <!-- Receipt Card -->
      <div style="background:#fff9fa; border:1px solid #ffd8e2; border-radius:14px; padding:18px; margin-bottom:20px;">
        <div style="display:flex; justify-content:space-between; border-bottom:1px solid #ffe0e8; padding-bottom:10px; margin-bottom:12px;">
          <span style="font-size:11px; font-weight:bold; color:#d6336c; text-transform:uppercase; letter-spacing:0.5px;">Bespoke Order Receipt</span>
          <span style="font-size:11px; font-weight:bold; color:#3b2219; font-family:monospace;">#${orderId}</span>
        </div>

        <div style="margin-bottom:12px;">
          <div style="display:flex; justify-content:space-between; font-size:15px; font-weight:bold; color:#3b2219;">
            <span>${cakeType}</span>
            <span style="color:#d6336c;">${typeof price === 'number' ? `₹${price}` : price}</span>
          </div>
          ${flavor || weight ? `
            <p style="font-size:12px; color:#7d5850; margin:4px 0 0 0;">
              ${flavor ? `Filling / Flavor: <strong>${flavor}</strong>` : ''} 
              ${flavor && weight ? ' • ' : ''}
              ${weight ? `Size / Portion: <strong>${weight}</strong>` : ''}
            </p>
          ` : ''}
        </div>

        ${boxContentsHtml}

        ${message ? `
          <div style="background:#ffffff; border-radius:8px; padding:10px; border:1px dashed #e8c4cf; margin-top:10px; text-align:center;">
            <span style="font-size:10px; font-weight:bold; color:#888; text-transform:uppercase;">Fondant Inscription</span>
            <p style="font-size:13px; font-style:italic; color:#3b2219; margin:2px 0 0 0;">"${message}"</p>
          </div>
        ` : ''}
      </div>

      <!-- Logistics Grid -->
      <table style="width:100%; border-collapse:collapse; margin-bottom:20px; font-size:12px;">
        <tr>
          <td style="width:50%; padding:10px; background:#faf6f4; border-radius:10px; vertical-align:top;">
            <strong style="color:#8f5e52; font-size:10px; text-transform:uppercase; display:block; margin-bottom:4px;">📅 Scheduled Date</strong>
            <span style="font-weight:bold; color:#3b2219; font-size:13px;">${pickupDate || 'Scheduled Soon'}</span>
            ${pickupTime ? `<br><span style="color:#6b4f47;">Time: ${pickupTime}</span>` : ''}
          </td>
          <td style="width:6px;"></td>
          <td style="width:50%; padding:10px; background:#faf6f4; border-radius:10px; vertical-align:top;">
            <strong style="color:#8f5e52; font-size:10px; text-transform:uppercase; display:block; margin-bottom:4px;">📍 Fulfillment Mode</strong>
            <span style="font-weight:bold; color:#3b2219; font-size:13px;">${deliveryType}</span>
            ${deliveryAddress ? `<br><span style="color:#6b4f47; font-size:11px;">${deliveryAddress}</span>` : ''}
          </td>
        </tr>
      </table>

      <!-- Payment & Contact -->
      <div style="background:#faf6f4; border-radius:10px; padding:12px; font-size:12px; margin-bottom:20px; color:#5c3e37;">
        <p style="margin:0 0 4px 0;"><strong>Payment Method:</strong> ${paymentMethod}</p>
        ${contactPhone ? `<p style="margin:0;"><strong>Contact Phone:</strong> ${contactPhone}</p>` : ''}
      </div>

      <!-- Footer Note -->
      <div style="text-align:center; border-top:1px solid #ebdcd5; padding-top:20px; color:#8f6b62; font-size:11px;">
        <p style="margin:0 0 6px 0;">Have a custom request or modification? Simply reply directly to this email!</p>
        <p style="margin:0; font-weight:bold; color:#d6336c; text-transform:uppercase; letter-spacing:0.5px;">${websiteName} Artisanal Bakery</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Status Update Email Template
 */
export function generateBakeryStatusUpdateHtml(params: {
  websiteName: string;
  orderId: string;
  customerName: string;
  cakeType: string;
  status: string;
  customNote?: string;
}): string {
  const { websiteName, orderId, customerName, cakeType, status, customNote } = params;

  let statusEmoji = '🥣';
  let statusMessage = `Your order is currently marked as: <strong>${status}</strong>.`;

  if (status === 'Baking') {
    statusEmoji = '🥣';
    statusMessage = 'Your gourmet creation is currently baking in our artisanal oven!';
  } else if (status === 'Ready for Pickup') {
    statusEmoji = '🏪';
    statusMessage = 'Your delightful confection is boxed with ribbon and ready for pickup at our boutique counter!';
  } else if (status === 'Out for Delivery') {
    statusEmoji = '🛵';
    statusMessage = 'Our delivery driver has carefully packed your confection and is en route!';
  } else if (status === 'Completed') {
    statusEmoji = '🎉';
    statusMessage = 'Your order has been fulfilled. We hope it brought sweet joy to your celebration!';
  } else if (status === 'Confirmed') {
    statusEmoji = '🤝';
    statusMessage = 'Your order has been confirmed by our Head Pastry Chef!';
  }

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color:#faf7f5; margin:0; padding:24px; color:#3b2219;">
  <div style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:20px; overflow:hidden; border:1px solid #ebdcd5;">
    <div style="background:linear-gradient(135deg, #e75480, #c43864); padding:28px 24px; text-align:center; color:#ffffff;">
      <div style="font-size:32px; margin-bottom:6px;">${statusEmoji}</div>
      <h1 style="margin:0; font-size:20px; font-weight:800; text-transform:uppercase;">Order Status Update</h1>
      <p style="margin:4px 0 0 0; font-size:12px; opacity:0.9;">Order #${orderId} • ${websiteName}</p>
    </div>
    <div style="padding:24px;">
      <h2 style="font-size:16px; margin:0 0 8px 0;">Hello ${customerName || 'Friend'},</h2>
      <p style="font-size:13px; line-height:1.6; color:#5c3e37; margin:0 0 16px 0;">
        We wanted to provide a quick real-time update regarding your order for <strong>${cakeType}</strong>:
      </p>
      <div style="background:#fff0f3; border:1px solid #ffccd5; border-radius:12px; padding:16px; text-align:center; margin-bottom:20px;">
        <span style="font-size:12px; font-weight:bold; color:#c43864; text-transform:uppercase;">Current State: ${status}</span>
        <p style="font-size:14px; font-weight:600; color:#3b2219; margin:6px 0 0 0;">${statusMessage}</p>
      </div>
      ${customNote ? `
        <div style="background:#f8f9fa; border-left:4px solid #e75480; padding:12px; margin-bottom:20px; font-size:12px; color:#495057;">
          <strong style="display:block; margin-bottom:4px;">Chef's Note:</strong>
          ${customNote}
        </div>
      ` : ''}
      <div style="text-align:center; border-top:1px solid #ebdcd5; padding-top:16px; font-size:11px; color:#8f6b62;">
        <p style="margin:0;">Reply to this email if you have any questions or timing adjustments.</p>
        <p style="margin:4px 0 0 0; font-weight:bold; color:#e75480;">${websiteName} Team</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

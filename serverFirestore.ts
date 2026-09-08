import firebaseConfig from "./firebase-applet-config.json";

const firestoreDbId = (firebaseConfig as any).firestoreDatabaseId || "(default)";
const FIRESTORE_BASE_URL = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/${firestoreDbId}/documents`;

/**
 * Converts standard JavaScript types to Firestore REST API typed values
 */
export function toFirestoreValue(value: any): any {
  if (value === null || value === undefined) {
    return { nullValue: null };
  }
  if (typeof value === "boolean") {
    return { booleanValue: value };
  }
  if (typeof value === "number") {
    if (Number.isInteger(value)) {
      return { integerValue: value.toString() };
    }
    return { doubleValue: value };
  }
  if (typeof value === "string") {
    return { stringValue: value };
  }
  if (Array.isArray(value)) {
    return {
      arrayValue: {
        values: value.map((v) => toFirestoreValue(v)),
      },
    };
  }
  if (typeof value === "object") {
    return {
      mapValue: {
        fields: toFirestoreFields(value),
      },
    };
  }
  return { stringValue: String(value) };
}

/**
 * Converts a JS object to Firestore REST fields map
 */
export function toFirestoreFields(obj: Record<string, any>): Record<string, any> {
  const fields: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined) {
      fields[key] = toFirestoreValue(val);
    }
  }
  return fields;
}

/**
 * Converts Firestore REST value back to plain JavaScript value
 */
export function fromFirestoreValue(valObj: any): any {
  if (!valObj || typeof valObj !== "object") return null;
  if ("stringValue" in valObj) return valObj.stringValue;
  if ("booleanValue" in valObj) return valObj.booleanValue;
  if ("integerValue" in valObj) return parseInt(valObj.integerValue, 10);
  if ("doubleValue" in valObj) return Number(valObj.doubleValue);
  if ("nullValue" in valObj) return null;
  if ("timestampValue" in valObj) return valObj.timestampValue;
  if ("arrayValue" in valObj) {
    return (valObj.arrayValue?.values || []).map((v: any) => fromFirestoreValue(v));
  }
  if ("mapValue" in valObj) {
    return fromFirestoreFields(valObj.mapValue?.fields || {});
  }
  return null;
}

/**
 * Converts Firestore REST document fields to plain JavaScript object
 */
export function fromFirestoreFields(fields: Record<string, any>): Record<string, any> {
  const obj: Record<string, any> = {};
  for (const [key, val] of Object.entries(fields || {})) {
    obj[key] = fromFirestoreValue(val);
  }
  return obj;
}

/**
 * Fetch a single Firestore document via REST API
 */
export async function getFirestoreDoc(collection: string, docId: string): Promise<Record<string, any> | null> {
  try {
    const url = `${FIRESTORE_BASE_URL}/${collection}/${encodeURIComponent(docId)}?key=${firebaseConfig.apiKey}`;
    const res = await fetch(url);
    if (!res.ok) {
      if (res.status === 404) return null;
      return null;
    }
    const data = await res.json();
    if (!data || !data.fields) return null;
    return { id: docId, ...fromFirestoreFields(data.fields) };
  } catch (err) {
    console.warn(`[Firestore REST] Error fetching doc ${collection}/${docId}:`, err);
    return null;
  }
}

/**
 * Create or overwrite a document in Firestore via REST API
 */
export async function setFirestoreDoc(collection: string, docId: string, data: Record<string, any>): Promise<boolean> {
  try {
    const url = `${FIRESTORE_BASE_URL}/${collection}/${encodeURIComponent(docId)}?key=${firebaseConfig.apiKey}`;
    const res = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields: toFirestoreFields(data) }),
    });
    return res.ok;
  } catch (err) {
    console.warn(`[Firestore REST] Error setting doc ${collection}/${docId}:`, err);
    return false;
  }
}

/**
 * Patch specific fields of an existing document in Firestore via REST API using updateMask
 */
export async function updateFirestoreDoc(collection: string, docId: string, data: Record<string, any>): Promise<boolean> {
  try {
    const fieldKeys = Object.keys(data);
    if (fieldKeys.length === 0) return true;
    const maskParams = fieldKeys.map((k) => `updateMask.fieldPaths=${encodeURIComponent(k)}`).join("&");
    const url = `${FIRESTORE_BASE_URL}/${collection}/${encodeURIComponent(docId)}?${maskParams}&key=${firebaseConfig.apiKey}`;
    const res = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields: toFirestoreFields(data) }),
    });
    return res.ok;
  } catch (err) {
    console.warn(`[Firestore REST] Error updating doc ${collection}/${docId}:`, err);
    return false;
  }
}

/**
 * Add a new document with an auto-generated ID in Firestore via REST API
 */
export async function addFirestoreDoc(collection: string, data: Record<string, any>): Promise<string | null> {
  try {
    const url = `${FIRESTORE_BASE_URL}/${collection}?key=${firebaseConfig.apiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields: toFirestoreFields(data) }),
    });
    if (!res.ok) {
      const errText = await res.text();
      console.warn(`[Firestore REST] Add doc returned ${res.status}:`, errText);
      return null;
    }
    const resData = await res.json();
    const docName = resData.name || "";
    const docId = docName.split("/").pop() || null;
    return docId;
  } catch (err) {
    console.warn(`[Firestore REST] Error adding doc to ${collection}:`, err);
    return null;
  }
}

/**
 * Delete a document from Firestore via REST API
 */
export async function deleteFirestoreDoc(collection: string, docId: string): Promise<boolean> {
  try {
    const url = `${FIRESTORE_BASE_URL}/${collection}/${encodeURIComponent(docId)}?key=${firebaseConfig.apiKey}`;
    const res = await fetch(url, { method: "DELETE" });
    return res.ok;
  } catch (err) {
    console.warn(`[Firestore REST] Error deleting doc ${collection}/${docId}:`, err);
    return false;
  }
}

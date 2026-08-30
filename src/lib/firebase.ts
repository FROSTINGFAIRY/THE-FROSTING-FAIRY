import { initializeApp, getApps } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp,
  setLogLevel
} from 'firebase/firestore';

// Suppress internal gRPC idle stream disconnect logs
try {
  setLogLevel('error');
} catch {
  // ignore
}
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firestore with specific databaseId if provided
const firestoreDbId = (firebaseConfig as any).firestoreDatabaseId;
export const db = firestoreDbId 
  ? getFirestore(app, firestoreDbId)
  : getFirestore(app);

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

let activeGoogleSignInPromise: Promise<User | null> | null = null;

// Google Sign-In helper using Firebase Authentication with concurrent request safety
export const signInWithGoogle = async (): Promise<User | null> => {
  if (activeGoogleSignInPromise) {
    return activeGoogleSignInPromise;
  }

  activeGoogleSignInPromise = (async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error: any) {
      const errorCode = error?.code || '';
      const errorMsg = error?.message || '';
      if (
        errorCode === 'auth/popup-closed-by-user' ||
        errorCode === 'auth/cancelled-popup-request' ||
        errorCode === 'auth/user-cancelled' ||
        errorMsg.includes('popup-closed-by-user') ||
        errorMsg.includes('cancelled-popup-request') ||
        errorMsg.includes('Pending promise was never set')
      ) {
        // User closed or dismissed the popup window normally
        return null;
      }
      console.warn('[Firebase Auth] Sign-in notice:', errorMsg || error);
      throw error;
    } finally {
      activeGoogleSignInPromise = null;
    }
  })();

  return activeGoogleSignInPromise;
};

// Sign out helper
export const logOutAdmin = async (): Promise<void> => {
  await signOut(auth);
};

// Recursively strip undefined values so Firestore setDoc/updateDoc never fails
export function cleanFirestoreData<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => cleanFirestoreData(item)) as unknown as T;
  }
  if (typeof obj === 'object' && !(obj instanceof Date)) {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = cleanFirestoreData(value);
      }
    }
    return cleaned as T;
  }
  return obj;
}

export const DEFAULT_ADMIN_EMAILS = ['kiddepressed03@gmail.com', 'hellofrostingfairy@gmail.com'];

// Verify if a user's email is an authorized admin
export const checkIsAdminInFirestore = async (email: string | null | undefined): Promise<boolean> => {
  if (!email) return false;
  const cleanEmail = email.trim().toLowerCase();
  if (DEFAULT_ADMIN_EMAILS.includes(cleanEmail)) {
    return true;
  }
  try {
    const adminDocRef = doc(db, 'admins', cleanEmail);
    const adminSnap = await getDoc(adminDocRef);
    if (adminSnap.exists()) {
      return true;
    }
  } catch (err) {
    console.warn('Error verifying admin document in Firestore:', err);
  }
  return false;
};

// Fetch admin role from Firestore
export const getAdminRoleFromFirestore = async (email: string | null | undefined): Promise<'admin' | 'chef' | 'viewer'> => {
  if (!email) return 'viewer';
  const cleanEmail = email.trim().toLowerCase();
  try {
    const adminSnap = await getDoc(doc(db, 'admins', cleanEmail));
    if (adminSnap.exists()) {
      const role = adminSnap.data()?.role;
      if (role === 'admin' || role === 'chef' || role === 'viewer') {
        return role;
      }
    }
  } catch (err) {
    console.warn('Error reading admin role from Firestore:', err);
  }
  if (DEFAULT_ADMIN_EMAILS.includes(cleanEmail)) {
    return 'admin';
  }
  return 'viewer';
};

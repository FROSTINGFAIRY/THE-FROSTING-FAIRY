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
export const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Google Sign-In helper using Firebase Authentication
export const signInWithGoogle = async (): Promise<User> => {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
};

// Sign out helper
export const logOutAdmin = async (): Promise<void> => {
  await signOut(auth);
};

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

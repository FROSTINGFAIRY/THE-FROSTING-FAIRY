import React, { useState } from 'react';
import { 
  DollarSign, 
  Image as ImageIcon, 
  Sparkles, 
  RotateCcw, 
  Save, 
  Search, 
  Edit3, 
  Plus, 
  Trash2, 
  Globe, 
  CheckCircle, 
  LayoutGrid, 
  TrendingUp, 
  Layers, 
  BadgeHelp,
  Tag,
  Lock,
  Unlock,
  Shield,
  Users,
  Activity,
  Upload,
  Calendar,
  Phone,
  User,
  Check,
  ExternalLink,
  MessageSquare,
  Send,
  Bell,
  Mail,
  Loader2,
  CreditCard,
  StickyNote,
  FileText,
  AlertTriangle,
  AlertCircle,
  X
} from 'lucide-react';
import { Recipe, PriceOption, MealPlanEntry, CategoryInfo } from '../types';
import { motion } from 'motion/react';
import { INITIAL_RECIPES, INITIAL_CATEGORY_INFOS } from '../data';
import defaultLogoImg from '../assets/images/frosting_fairy_logo_1784129178255.jpg';
import { PerformanceDashboard } from './PerformanceDashboard';
import { db, auth, signInWithGoogle, logOutAdmin, checkIsAdminInFirestore } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, addDoc, serverTimestamp, query, orderBy, limit } from 'firebase/firestore';

// Helper to decode Google JWT token client-side
const decodeJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("JWT Decode error:", e);
    return null;
  }
};


interface AdminDashboardProps {
  recipes: Recipe[];
  setRecipes: React.Dispatch<React.SetStateAction<Recipe[]>>;
  categoryInfos?: CategoryInfo[];
  setCategoryInfos?: React.Dispatch<React.SetStateAction<CategoryInfo[]>>;
  logo: string;
  setLogo: (logo: string) => void;
  websiteName: string;
  setWebsiteName: (name: string) => void;
  websiteSlogan: string;
  setWebsiteSlogan: (slogan: string) => void;
  mealPlan: MealPlanEntry[];
  setMealPlan: React.Dispatch<React.SetStateAction<MealPlanEntry[]>>;
  addToast: (title: string, message: string, type?: 'success' | 'info' | 'warning') => void;
  upiId: string;
  setUpiId: (id: string) => void;
  upiQrCode: string;
  setUpiQrCode: (code: string) => void;
  cashOnDeliveryEnabled: boolean;
  setCashOnDeliveryEnabled: (enabled: boolean) => void;
}

// Preset assets for logo customizer
const LOGO_PRESETS = [
  { name: 'Original Pink Emblem', url: defaultLogoImg, desc: 'Original handcrafted fairy logo' },
  { name: 'Golden Luxury Whisk', url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=300', desc: 'Sleek, gold, minimalist design' },
  { name: 'Artisanal Macaron Garland', url: 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?auto=format&fit=crop&q=80&w=300', desc: 'Cute pastel macarons logo circle' },
  { name: 'Imperial Chocolate Crown', url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=300', desc: 'Rich velvet gourmet aesthetics' },
  { name: 'Spring Blossom Flour', url: 'https://images.unsplash.com/photo-1517433456452-f9633a875f6f?auto=format&fit=crop&q=80&w=300', desc: 'Rustic floral confectionary theme' },
];

// Preset high-fidelity pastry display image presets for quick selection
const PRODUCT_IMAGE_PRESETS = [
  { name: 'Princess Pink Buttercream Cake', url: 'https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=600&q=80' },
  { name: 'Silky Belgian Chocolate Cake', url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80' },
  { name: 'Artisanal Victoria Strawberry Sponge', url: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&q=80&w=600' },
  { name: 'Red Velvet White Ganache Tower', url: 'https://images.unsplash.com/photo-1586985289688-ca9cf499150a?auto=format&fit=crop&w=600&q=80' },
  { name: 'Rich Raspberry Dark Chocolate Tart', url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80' },
  { name: 'Royal Iced Swirl Cupcakes', url: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&q=80&w=600' },
  { name: 'Warm Glazed Pecan Cinnamon Rolls', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80' },
  { name: 'Fairy Blossom French Macarons', url: 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?auto=format&fit=crop&w=600&q=80' },
  { name: 'Wild Harvest Blueberry Tart', url: 'https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=600&q=80' },
];

export default function AdminDashboard({
  recipes,
  setRecipes,
  categoryInfos: passedCategoryInfos,
  setCategoryInfos,
  logo,
  setLogo,
  websiteName,
  setWebsiteName,
  websiteSlogan,
  setWebsiteSlogan,
  mealPlan,
  setMealPlan,
  addToast,
  upiId,
  setUpiId,
  upiQrCode,
  setUpiQrCode,
  cashOnDeliveryEnabled,
  setCashOnDeliveryEnabled,
}: AdminDashboardProps) {
  const [adminTab, setAdminTab] = useState<'overview' | 'products' | 'categories' | 'branding' | 'authority' | 'orders'>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  const categoryInfos = passedCategoryInfos && passedCategoryInfos.length > 0
    ? passedCategoryInfos
    : INITIAL_CATEGORY_INFOS;

  // Category management states
  const [categoryPreviews, setCategoryPreviews] = useState<Record<string, string>>({});
  const [categoryInputs, setCategoryInputs] = useState<Record<string, { description?: string; itemCountText?: string; startingPrice?: number; imageUrl?: string }>>({});
  const [categoryUploading, setCategoryUploading] = useState<Record<string, boolean>>({});
  const [isCategoriesConfigExpanded, setIsCategoriesConfigExpanded] = useState(true);

  const compressCategoryFile = (file: File, maxWidth = 800, quality = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
      if (!file.type || !allowedTypes.includes(file.type.toLowerCase())) {
        return reject(new Error('Invalid image format. Please upload a JPG, PNG, or WEBP file.'));
      }

      if (file.size > 10 * 1024 * 1024) {
        return reject(new Error('File is too large (>10MB). Please select a smaller file.'));
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return reject(new Error('Failed to get canvas context'));
          }

          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        };

        img.onerror = () => reject(new Error('Failed to load image for compression.'));
        img.src = e.target?.result as string;
      };

      reader.onerror = () => reject(new Error('Failed to read image file.'));
      reader.readAsDataURL(file);
    });
  };

  const handleCategoryFileSelect = async (catName: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCategoryUploading((prev) => ({ ...prev, [catName]: true }));

    try {
      const compressedDataUrl = await compressCategoryFile(file, 800, 0.8);

      // Show live preview immediately
      setCategoryPreviews((prev) => ({
        ...prev,
        [catName]: compressedDataUrl,
      }));

      addToast('Live Preview Loaded', `Selected image for ${catName}. Click "Save Category" to apply.`, 'info');
    } catch (err: any) {
      addToast('Upload Error', err?.message || 'Failed to process image file.', 'warning');
    } finally {
      setCategoryUploading((prev) => ({ ...prev, [catName]: false }));
      e.target.value = '';
    }
  };

  const handleSaveCategory = (catName: string) => {
    const newImageUrl = categoryPreviews[catName] !== undefined
      ? categoryPreviews[catName]
      : (categoryInputs[catName]?.imageUrl ?? categoryInfos.find((c) => c.name === catName)?.imageUrl);

    const updatedCategories = categoryInfos.map((c) => {
      if (c.name === catName) {
        return {
          ...c,
          imageUrl: newImageUrl,
          image: newImageUrl || c.image,
          description: categoryInputs[catName]?.description ?? c.description,
          startingPrice: categoryInputs[catName]?.startingPrice ?? c.startingPrice,
          itemCountText: categoryInputs[catName]?.itemCountText ?? c.itemCountText,
        };
      }
      return c;
    });

    if (setCategoryInfos) {
      setCategoryInfos(updatedCategories);
    }

    setCategoryPreviews((prev) => {
      const copy = { ...prev };
      delete copy[catName];
      return copy;
    });

    addToast('Category Saved', `Successfully updated "${catName}" cover image!`, 'success');
  };

  const handleRemoveCategoryImage = (catName: string) => {
    setCategoryPreviews((prev) => ({
      ...prev,
      [catName]: '',
    }));

    const updatedCategories = categoryInfos.map((c) => {
      if (c.name === catName) {
        return { ...c, imageUrl: '', image: '' };
      }
      return c;
    });

    if (setCategoryInfos) {
      setCategoryInfos(updatedCategories);
    }

    addToast('Image Cleared', `Removed image for "${catName}". Card will show a clean soft placeholder.`, 'info');
  };

  // --- ORDER NOTIFICATIONS CONFIGURATION ---
  const [whatsappEnabled, setWhatsappEnabled] = useState(() => localStorage.getItem('gusto_whatsapp_enabled') !== 'false');
  const [isOrderNotificationsExpanded, setIsOrderNotificationsExpanded] = useState(true);

  // Orders filters state
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'Pending' | 'Confirmed' | 'Baking' | 'Ready for Pickup' | 'Out for Delivery' | 'Completed'>('all');

  // --- EMAIL NOTIFICATION SIMULATOR STATE ---
  const [selectedEmailPreviewOrder, setSelectedEmailPreviewOrder] = useState<MealPlanEntry | null>(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSubject, setEmailSubject] = useState('Your Delightful Confection Receipt - The Frosting Fairy 🎂');
  const [emailHeader, setEmailHeader] = useState('An artisanal creation is being lovingly prepared for you!');
  const [sentEmails, setSentEmails] = useState<Array<{ id: string; recipientName: string; recipientEmail: string; subject: string; time: string; status: 'SENT' | 'DELIVERED'; orderId: string; cakeType: string }>>(() => {
    try {
      const saved = localStorage.getItem('gusto_simulated_emails');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  React.useEffect(() => {
    localStorage.setItem('gusto_simulated_emails', JSON.stringify(sentEmails));
  }, [sentEmails]);

  const [isEmailCenterExpanded, setIsEmailCenterExpanded] = useState(true);

  // --- INTERNAL ORDER NOTES STATE & HANDLERS ---
  const [orderNoteInputs, setOrderNoteInputs] = useState<Record<string, string>>({});
  const [openNoteOrderId, setOpenNoteOrderId] = useState<string | null>(null);

  const handleSaveNote = (orderId: string) => {
    if (currentRole === 'viewer') {
      triggerToast('❌ Permission Denied: Read-only role cannot add notes.');
      return;
    }

    const noteText = orderNoteInputs[orderId]?.trim();
    if (!noteText) {
      triggerToast('⚠️ Note cannot be empty.');
      return;
    }

    setMealPlan((prevPlan) =>
      prevPlan.map((order) => {
        if (order.id === orderId) {
          const existingNotes = order.adminNotes || [];
          return {
            ...order,
            adminNotes: [...existingNotes, noteText],
          };
        }
        return order;
      })
    );

    setOrderNoteInputs((prev) => ({ ...prev, [orderId]: '' }));
    setOpenNoteOrderId(null);

    addAuditLog(`Added internal note to Order #${orderId}: "${noteText.length > 30 ? noteText.substring(0, 30) + '...' : noteText}"`, 'success');
    addToast('Note Saved', `Internal note added to Order #${orderId}`, 'success');
  };

  const handleDeleteNote = (orderId: string, noteIndex: number) => {
    if (currentRole === 'viewer') {
      triggerToast('❌ Permission Denied: Read-only role cannot delete notes.');
      return;
    }

    setMealPlan((prevPlan) =>
      prevPlan.map((order) => {
        if (order.id === orderId) {
          const existingNotes = order.adminNotes || [];
          return {
            ...order,
            adminNotes: existingNotes.filter((_, idx) => idx !== noteIndex),
          };
        }
        return order;
      })
    );

    addAuditLog(`Deleted internal note from Order #${orderId}`, 'info');
    addToast('Note Removed', `Internal note deleted from Order #${orderId}`, 'info');
  };

  // --- ORDER DELETION WITH CONFIRMATION DIALOG ---
  const [orderToDelete, setOrderToDelete] = useState<MealPlanEntry | null>(null);

  const handleDeleteOrderClick = (order: MealPlanEntry) => {
    if (currentRole === 'viewer') {
      addAuditLog(`Attempted to delete Order #${order.id} (Blocked)`, 'warning');
      triggerToast('❌ Permission Denied: Cashier/Viewer role is read-only.');
      return;
    }
    setOrderToDelete(order);
  };

  const handleConfirmDeleteOrder = () => {
    if (!orderToDelete) return;

    if (currentRole === 'viewer') {
      triggerToast('❌ Permission Denied: Read-only role cannot delete orders.');
      setOrderToDelete(null);
      return;
    }

    const deletedId = orderToDelete.id;
    const customerName = orderToDelete.customerName || orderToDelete.contactName || 'Valued Customer';
    const cakeType = orderToDelete.cakeType;

    setMealPlan((prevPlan) => prevPlan.filter((o) => o.id !== deletedId));

    addAuditLog(`Permanently deleted Order #${deletedId} for "${customerName}" (${cakeType})`, 'warning');
    addToast('Order Deleted', `Order #${deletedId} has been removed from the order queue.`, 'info');
    setOrderToDelete(null);
  };

  // Server-side handled notification loggers
  const dispatchInstagramDM = async (orderId: string, cakeType: string, customerName: string, status: string) => {
    addAuditLog(`📱 Status update recorded for Order #${orderId} (${status}). Instagram DM is dispatched automatically by server triggers.`, 'success');
  };

  const dispatchWhatsAppAlert = async (orderId: string, cakeType: string, customerName: string, status: string) => {
    addAuditLog(`💬 Status update recorded for Order #${orderId} (${status}). WhatsApp alert is dispatched automatically by server triggers.`, 'success');
  };

  // Server-side Test Notification sender
  const handleSendTestNotification = async () => {
    addAuditLog(`Initiating secure server-side test notification dispatch...`, 'info');
    
    try {
      const idToken = auth.currentUser ? await auth.currentUser.getIdToken() : '';
      const response = await fetch('/api/send-test-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          customerName: firebaseUser?.displayName || 'Authorized Admin',
          cakeType: 'Signature Fudge Blossom',
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        addAuditLog(`✅ [Server Notification Dispatch] Test notification successfully executed server-side!`, 'success');
        triggerToast('⚡ Server test notification dispatched!');
      } else {
        addAuditLog(`❌ [Server Notification Fail] ${data.error || 'Unknown error'}`, 'warning');
        triggerToast(`⚠️ Test notification error: ${data.error || 'Failed'}`);
      }
    } catch (err: any) {
      addAuditLog(`❌ [Server Notification Connection Error] ${err.message}`, 'warning');
      triggerToast(`❌ Network error sending test notification.`);
    }
  };

  // --- FIREBASE AUTH & FIRESTORE ACCESS CONTROL ---
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [signInError, setSignInError] = useState('');
  const [authorizedAdmins, setAuthorizedAdmins] = useState<string[]>(['kiddepressed03@gmail.com', 'hellofrostingfairy@gmail.com']);

  // Subscribe to Firebase Auth state
  React.useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setIsAuthLoading(true);
      if (user) {
        setFirebaseUser(user);
        const email = user.email || '';
        const isAuthorized = await checkIsAdminInFirestore(email);
        if (isAuthorized) {
          setIsUnlocked(true);
          setSignInError('');
          addAuditLog(`Firebase Auth Google sign in: ${email}`, 'success');
        } else {
          setIsUnlocked(false);
          setSignInError(`Access Denied: Your Google account (${email}) is not listed in Firestore 'admins' collection.`);
          addAuditLog(`Access denied for Google user: ${email}`, 'warning');
        }
      } else {
        setFirebaseUser(null);
        setIsUnlocked(false);
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  // When an admin is signed in, seed or update products collection in Firestore
  React.useEffect(() => {
    if (!isUnlocked) return;
    const syncProductsToFirestore = async () => {
      try {
        const productsRef = collection(db, 'products');
        const snap = await getDocs(productsRef);
        if (snap.empty) {
          for (const recipe of INITIAL_RECIPES) {
            await setDoc(doc(db, 'products', recipe.id), recipe);
          }
          addAuditLog('Seeded initial products catalog into Firestore', 'success');
        } else {
          // Sync any updated initial recipes into Firestore to keep live database updated
          for (const recipe of INITIAL_RECIPES) {
            await setDoc(doc(db, 'products', recipe.id), recipe, { merge: true });
          }
        }
      } catch (err: any) {
        console.warn('Admin products sync notice:', err.message);
      }
    };
    syncProductsToFirestore();
  }, [isUnlocked]);

  // Subscribe to Firestore 'admins' collection live
  React.useEffect(() => {
    const adminsRef = collection(db, 'admins');
    const unsubscribe = onSnapshot(adminsRef, (snapshot) => {
      const emails: string[] = [];
      snapshot.forEach((docSnap) => {
        emails.push(docSnap.id.toLowerCase());
      });
      if (emails.length > 0) {
        setAuthorizedAdmins(emails);
      }
    }, (err) => {
      if (err.message?.includes('CANCELLED') || err.code === 'cancelled') {
        console.debug('Firestore admins stream re-establishing connection...');
      } else {
        console.warn('Firestore admins collection listener notice:', err.message);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    setSignInError('');
    try {
      const user = await signInWithGoogle();
      const email = user.email || '';
      const isAuthorized = await checkIsAdminInFirestore(email);
      if (isAuthorized) {
        setIsUnlocked(true);
        triggerToast(`👑 Welcome, ${user.displayName || email}!`);
      } else {
        setIsUnlocked(false);
        setSignInError(`Access Denied: Google account (${email}) is not in Firestore 'admins' collection.`);
        triggerToast('❌ Unauthorized: Account not registered in Firestore.');
      }
    } catch (err: any) {
      console.error('Sign-in error:', err);
      setSignInError('Google sign in error: ' + (err?.message || 'Popup closed or failed'));
    }
  };

  const handleLogoutAdmin = async () => {
    await logOutAdmin();
    setIsUnlocked(false);
    setFirebaseUser(null);
    addAuditLog('Admin signed out', 'info');
    triggerToast('🔒 Admin session logged out.');
  };

  // Authority role: 'admin' | 'chef' | 'viewer'
  const [currentRole, setCurrentRole] = useState<'admin' | 'chef' | 'viewer'>('admin');

  // Sync admin role live from Firestore for signed-in user
  React.useEffect(() => {
    if (!firebaseUser?.email) return;
    const cleanEmail = firebaseUser.email.toLowerCase();
    const adminDocRef = doc(db, 'admins', cleanEmail);

    const unsubscribe = onSnapshot(adminDocRef, (snap) => {
      if (snap.exists() && snap.data()?.role) {
        const r = snap.data().role;
        if (r === 'admin' || r === 'chef' || r === 'viewer') {
          setCurrentRole(r);
        }
      } else if (['kiddepressed03@gmail.com', 'hellofrostingfairy@gmail.com'].includes(cleanEmail)) {
        setCurrentRole('admin');
      } else {
        setCurrentRole('viewer');
      }
    }, (err) => {
      if (!err.message?.includes('CANCELLED')) {
        console.warn('Admin role document snapshot listener notice:', err.message);
      }
    });

    return () => unsubscribe();
  }, [firebaseUser]);

  // Audit Logs state stored in Firestore 'auditLogs' collection
  interface AuditLog {
    id: string;
    time: string;
    role: string;
    action: string;
    status: 'success' | 'warning' | 'info';
  }

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Live subscription to Firestore auditLogs collection
  React.useEffect(() => {
    if (!isUnlocked) return;
    try {
      const q = query(collection(db, 'auditLogs'), orderBy('timestamp', 'desc'), limit(50));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const logs: AuditLog[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          logs.push({
            id: docSnap.id,
            time: data.time || (data.timestamp ? new Date(data.timestamp.toDate()).toLocaleTimeString() : 'Recently'),
            role: data.role || 'System',
            action: data.action || '',
            status: data.status || 'info'
          });
        });
        setAuditLogs(logs);
      }, (err) => {
        if (!err.message?.includes('CANCELLED')) {
          console.warn('Firestore auditLogs stream notice:', err.message);
        }
      });
      return () => unsubscribe();
    } catch (err) {
      console.warn('Error setting up auditLogs stream:', err);
    }
  }, [isUnlocked]);

  const addAuditLog = async (action: string, status: 'success' | 'warning' | 'info' = 'success', roleName = currentRole) => {
    const formattedRole = roleName === 'admin' ? 'Administrator' : roleName === 'chef' ? 'Head Pastry Chef' : 'Cashier/Viewer';
    const newLog = {
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      timestamp: serverTimestamp(),
      role: formattedRole,
      action,
      status
    };

    if (isUnlocked) {
      try {
        await addDoc(collection(db, 'auditLogs'), newLog);
      } catch (err: any) {
        console.warn('Could not save audit log to Firestore:', err?.message || err);
      }
    }
  };


  // Selected recipe to edit details
  const [selectedProductId, setSelectedProductId] = useState<string>(recipes[0]?.id || '');
  const activeProduct = recipes.find((r) => r.id === selectedProductId) || recipes[0];

  // Add product flow state
  const [isAddingNewProduct, setIsAddingNewProduct] = useState(false);

  const handleInitiateAddProduct = () => {
    if (currentRole === 'viewer') {
      triggerToast('❌ Permission Denied: Cashier/Viewer role is read-only.');
      return;
    }
    setIsAddingNewProduct(true);
    setEditName('');
    setEditImage('https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=600&q=80'); // nice default
    setEditDescription('');
    setEditCategory('Signature Cakes');
    setEditPriceOptions([{ label: 'Standard', price: 500 }]);
    setEditIsBuildYourBox(false);
    setEditBoxMinItems(3);
    setDeviceImagePreview(null);
    setUploadError(null);
  };

  const handleCreateProduct = async () => {
    if (currentRole === 'viewer') {
      addAuditLog(`Attempted to create product "${editName}" (Blocked)`, 'warning');
      triggerToast('❌ Permission Denied: Cashier/Viewer role is read-only.');
      return;
    }

    if (!editName.trim()) {
      triggerToast('❌ Product name cannot be empty!');
      return;
    }
    if (editPriceOptions.length === 0) {
      triggerToast('❌ Product must have at least one pricing option!');
      return;
    }
    if (editPriceOptions.some(opt => !opt.label.trim() || opt.price <= 0)) {
      triggerToast('❌ All price options must have a valid label and price above zero!');
      return;
    }

    const newId = `custom-bakery-${Date.now()}`;
    const newRecipe: Recipe = {
      id: newId,
      name: editName.trim(),
      description: editDescription.trim() || `${editName} - A delicious handcrafted pastry from The Frosting Fairy.`,
      image: editImage.trim() || 'https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=600&q=80',
      prepTime: 15,
      cookTime: 20,
      difficulty: 'Easy',
      servings: 6,
      rating: 5.0,
      votes: 1,
      nutrients: { calories: 300, protein: '4g', carbs: '40g', fat: '12g' },
      ingredients: [{ name: 'Love and magic', amount: 100, unit: '%' }],
      instructions: [{ step: 1, text: 'Bake with care and serve with a smile.' }],
      tags: ['Fresh', 'Handcrafted', editCategory],
      category: editCategory,
      priceOptions: editPriceOptions,
      isBuildYourBox: editIsBuildYourBox,
      boxMinItems: editIsBuildYourBox ? (Number(editBoxMinItems) || 3) : undefined,
      details: ['Freshly baked daily', 'Handcrafted with premium ingredients'],
      isFavorite: false
    };

    try {
      await setDoc(doc(db, 'products', newId), newRecipe);
      setSelectedProductId(newId);
      setIsAddingNewProduct(false);
      addAuditLog(`Created new bakery item in Firestore: "${editName}"`);
      triggerToast(`✨ Successfully created "${editName}" in Firestore!`);
    } catch (err: any) {
      console.error('Firestore create product error:', err);
      triggerToast('❌ Error creating product in Firestore: ' + err.message);
    }
  };

  // Temporary local edit states to prevent immediate jagged keypress rendering
  const [editName, setEditName] = useState('');
  const [editImage, setEditImage] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editPriceOptions, setEditPriceOptions] = useState<PriceOption[]>([]);
  const [editIsBuildYourBox, setEditIsBuildYourBox] = useState(false);
  const [editBoxMinItems, setEditBoxMinItems] = useState(3);

  // Device Image Upload states for Product Management
  const [isUploadingProductImage, setIsUploadingProductImage] = useState(false);
  const [uploadProgressPercent, setUploadProgressPercent] = useState(0);
  const [deviceImagePreview, setDeviceImagePreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Handle device image file selection & progress tracking
  const handleDeviceImageUpload = (file: File) => {
    // 1. Restrict to authenticated admin users only
    if (currentRole === 'viewer') {
      addAuditLog(`Attempted product image upload for "${editName || 'New Product'}" (Blocked)`, 'warning');
      triggerToast('❌ Permission Denied: Only authenticated admin users can upload product images.');
      return;
    }

    setUploadError(null);

    // 2. Format validation: JPG, PNG, WEBP
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!file.type || !allowedTypes.includes(file.type.toLowerCase())) {
      const errMsg = 'Invalid file format. Please upload a JPG, PNG, or WEBP image.';
      setUploadError(errMsg);
      triggerToast('❌ Invalid format! Only JPG, PNG, and WEBP files are allowed.');
      return;
    }

    // 3. Size validation: Max 5MB
    const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      const errMsg = `File size (${sizeMB}MB) exceeds the 5MB limit.`;
      setUploadError(errMsg);
      triggerToast(`⚠️ Image too large! File is ${sizeMB}MB (Max allowed size: 5MB).`);
      return;
    }

    // 4. Immediate Live Preview Thumbnail
    const objectUrl = URL.createObjectURL(file);
    setDeviceImagePreview(objectUrl);

    // 5. Upload progress tracking simulation & reading
    setIsUploadingProductImage(true);
    setUploadProgressPercent(15);

    const reader = new FileReader();

    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 90);
        setUploadProgressPercent(percent);
      }
    };

    reader.onload = (e) => {
      const resultUrl = e.target?.result as string;
      if (!resultUrl) {
        setIsUploadingProductImage(false);
        setUploadError('Failed to read image file.');
        triggerToast('❌ Error reading file data.');
        return;
      }

      setUploadProgressPercent(100);

      setTimeout(() => {
        setEditImage(resultUrl);
        setIsUploadingProductImage(false);
        addAuditLog(`Uploaded product image from device: "${file.name}"`, 'success');
        triggerToast('✨ Device image uploaded successfully! Thumbnail updated.');
      }, 300);
    };

    reader.onerror = () => {
      setIsUploadingProductImage(false);
      setUploadError('Failed to upload file from device.');
      triggerToast('❌ Error during file upload.');
    };

    reader.readAsDataURL(file);
  };

  // Pixabay Image search states
  const [isSearchingPixabay, setIsSearchingPixabay] = useState(false);
  const [pixabayError, setPixabayError] = useState<string | null>(null);
  const [pixabayResults, setPixabayResults] = useState<Array<{
    id: number;
    url: string;
    thumbnail: string;
    user: string;
  }>>([]);

  // Bulk update states
  const [isBulkUpdatingImages, setIsBulkUpdatingImages] = useState(false);
  const [bulkUpdateProgress, setBulkUpdateProgress] = useState('');
  
  // Branding states
  const [brandNameInput, setBrandNameInput] = useState(websiteName);
  const [brandSloganInput, setBrandSloganInput] = useState(websiteSlogan);
  const [brandLogoInput, setBrandLogoInput] = useState(logo);

  // Payment states
  const [upiIdInput, setUpiIdInput] = useState(upiId);
  const [upiQrInput, setUpiQrInput] = useState(upiQrCode);
  const [isDraggingQr, setIsDraggingQr] = useState(false);
  const [cashOnDeliveryInput, setCashOnDeliveryInput] = useState(cashOnDeliveryEnabled);
  const [isPaymentConfigExpanded, setIsPaymentConfigExpanded] = useState(true);

  React.useEffect(() => {
    setUpiIdInput(upiId);
  }, [upiId]);

  React.useEffect(() => {
    setUpiQrInput(upiQrCode);
  }, [upiQrCode]);

  React.useEffect(() => {
    setCashOnDeliveryInput(cashOnDeliveryEnabled);
  }, [cashOnDeliveryEnabled]);

  // Logo Upload presets state
  const [uploadedLogoPresets, setUploadedLogoPresets] = useState<{ name: string; url: string; desc: string }[]>(() => {
    const saved = localStorage.getItem('gusto_uploaded_logo_presets');
    return saved ? JSON.parse(saved) : [];
  });
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);

  React.useEffect(() => {
    localStorage.setItem('gusto_uploaded_logo_presets', JSON.stringify(uploadedLogoPresets));
  }, [uploadedLogoPresets]);

  // New option row local inputs
  const [newOptionLabel, setNewOptionLabel] = useState('');
  const [newOptionPrice, setNewOptionPrice] = useState<number>(0);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // --- CUSTOMER ORDERS HANDLERS ---
  const filteredOrders = mealPlan.filter((order) => {
    const matchesSearch = 
      order.cakeType.toLowerCase().includes(orderSearch.toLowerCase()) ||
      (order.customerName || order.contactName || '').toLowerCase().includes(orderSearch.toLowerCase()) ||
      (order.customerPhone || order.contactPhone || '').includes(orderSearch);
    
    const matchesFilter = orderStatusFilter === 'all' || (order.status || 'Pending') === orderStatusFilter;

    return matchesSearch && matchesFilter;
  });

  const handleUpdateOrderStatus = async (
    orderId: string, 
    newStatus: 'Pending' | 'Confirmed' | 'Baking' | 'Ready' | 'Ready for Pickup' | 'Out for Delivery' | 'Completed'
  ) => {
    if (currentRole === 'viewer') {
      addAuditLog(`Attempted to transition status of Order #${orderId} to "${newStatus}" (Blocked)`, 'warning');
      triggerToast('❌ Permission Denied: Cashier/Viewer role is read-only.');
      return;
    }

    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      
      const orderMatch = mealPlan.find(o => o.id === orderId);
      const customerName = orderMatch?.customerName || orderMatch?.contactName || 'Valued Customer';
      const cakeType = orderMatch?.cakeType || 'Order';

      if (newStatus === 'Ready for Pickup' || newStatus === 'Out for Delivery') {
        dispatchInstagramDM(orderId, cakeType, customerName, newStatus);
        if (whatsappEnabled) {
          dispatchWhatsAppAlert(orderId, cakeType, customerName, newStatus);
        }
        addToast(
          `🔔 Order Notification Sent!`, 
          `Alerted customer ${customerName} that order #${orderId} is ${newStatus}.`, 
          'success'
        );
      }

      addAuditLog(`Updated Order #${orderId} status to "${newStatus}" in Firestore`);
      triggerToast(`✨ Order #${orderId} status updated to: ${newStatus}`);
    } catch (err: any) {
      console.error('Firestore update order status error:', err);
      triggerToast('❌ Error updating order in Firestore: ' + err.message);
    }
  };

  const handleUpdateOrderPaymentMethod = async (
    orderId: string,
    newPaymentMethod: 'Card' | 'UPI' | 'COD'
  ) => {
    if (currentRole === 'viewer') {
      addAuditLog(`Attempted to update payment method of Order #${orderId} (Blocked)`, 'warning');
      triggerToast('❌ Permission Denied: Cashier/Viewer role is read-only.');
      return;
    }

    if (!cashOnDeliveryEnabled && newPaymentMethod === 'COD') {
      triggerToast('❌ Cash on Delivery is currently disabled in Payment Settings.');
      return;
    }

    try {
      await updateDoc(doc(db, 'orders', orderId), { paymentMethod: newPaymentMethod });
      addAuditLog(`Updated Order #${orderId} payment method to "${newPaymentMethod}" in Firestore`);
      triggerToast(`💳 Order #${orderId} payment method updated to: ${newPaymentMethod}`);
    } catch (err: any) {
      console.error('Firestore update order payment method error:', err);
      triggerToast('❌ Error updating payment method: ' + err.message);
    }
  };

  // Sync edit form with selected product
  React.useEffect(() => {
    if (activeProduct && !isAddingNewProduct) {
      setEditName(activeProduct.name);
      setEditImage(activeProduct.image);
      setEditDescription(activeProduct.description);
      setEditCategory(activeProduct.category);
      setEditPriceOptions([...activeProduct.priceOptions]);
      setEditIsBuildYourBox(!!activeProduct.isBuildYourBox);
      setEditBoxMinItems(activeProduct.boxMinItems || 3);
      setPixabayError(null);
      setPixabayResults([]);
      setDeviceImagePreview(null);
      setUploadError(null);
    }
  }, [selectedProductId, activeProduct, isAddingNewProduct]);

  // Handle saving product edits
  const handleSaveProduct = async () => {
    if (!activeProduct) return;

    if (currentRole === 'viewer') {
      addAuditLog(`Attempted to save product "${editName}" (Blocked)`, 'warning');
      triggerToast('❌ Permission Denied: Cashier/Viewer role is read-only.');
      return;
    }

    const isNameChanged = editName !== activeProduct.name;
    const isPriceChanged = JSON.stringify(editPriceOptions) !== JSON.stringify(activeProduct.priceOptions);
    if (currentRole === 'chef' && (isNameChanged || isPriceChanged)) {
      addAuditLog(`Attempted to edit title/pricing of "${editName}" (Blocked)`, 'warning');
      triggerToast("❌ Permission Denied: Head Pastry Chef role cannot edit product titles or prices.");
      return;
    }
    
    if (!editName.trim()) {
      triggerToast('❌ Product name cannot be empty!');
      return;
    }
    if (editPriceOptions.length === 0) {
      triggerToast('❌ Product must have at least one pricing option!');
      return;
    }
    if (editPriceOptions.some(opt => !opt.label.trim() || opt.price <= 0)) {
      triggerToast('❌ All price options must have a valid label and price above zero!');
      return;
    }

    const updatedRecipe: Recipe = {
      ...activeProduct,
      name: editName,
      image: editImage,
      description: editDescription,
      category: editCategory,
      priceOptions: editPriceOptions,
      isBuildYourBox: editIsBuildYourBox,
      boxMinItems: editIsBuildYourBox ? (Number(editBoxMinItems) || 3) : undefined,
    };

    try {
      await setDoc(doc(db, 'products', activeProduct.id), updatedRecipe, { merge: true });
      addAuditLog(`Updated product "${editName}" in Firestore`);
      triggerToast(`✨ Successfully updated "${editName}" in Firestore!`);
    } catch (err: any) {
      console.error('Firestore save product error:', err);
      triggerToast('❌ Error saving product to Firestore: ' + err.message);
    }
  };

  const handleSearchPixabay = async () => {
    if (!editName.trim()) {
      return;
    }

    setIsSearchingPixabay(true);
    setPixabayError(null);

    try {
      const apiKey = (import.meta as any).env?.VITE_PIXABAY_API_KEY;
      if (!apiKey) {
        throw new Error('Pixabay API key (VITE_PIXABAY_API_KEY) is missing. Define it in your environment or Settings panel.');
      }

      const query = editName.trim();
      const url = `https://pixabay.com/api/?key=${encodeURIComponent(apiKey)}&q=${encodeURIComponent(query)}&image_type=photo&category=food`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Pixabay API error: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.hits && data.hits.length > 0) {
        const results = data.hits.slice(0, 4).map((p: any) => ({
          id: p.id,
          url: p.largeImageURL || p.webformatURL,
          thumbnail: p.previewURL || p.webformatURL,
          user: p.user,
        }));

        setPixabayResults(results);
        
        // Auto-populate the image URL field with the first match
        setEditImage(results[0].url);
        triggerToast('✨ Stock photo search complete! Auto-selected top result.');
      } else {
        throw new Error('No matching images found — try editing the product name or paste a URL manually.');
      }
    } catch (err: any) {
      console.error(err);
      setPixabayError(err.message || 'Error occurred during stock photo search.');
      triggerToast('❌ Stock photo search failed.');
    } finally {
      setIsSearchingPixabay(false);
    }
  };

  const handleBulkUpdatePixabayImages = async () => {
    if (currentRole === 'viewer') {
      triggerToast('❌ Permission Denied: Cashier/Viewer role is read-only.');
      return;
    }

    const apiKey = (import.meta as any).env?.VITE_PIXABAY_API_KEY;
    if (!apiKey) {
      triggerToast('❌ Pixabay API key (VITE_PIXABAY_API_KEY) is missing. Define it in your environment or Settings panel.');
      return;
    }

    if (!window.confirm('This utility will iterate through all existing products, fetch the top food photo match from Pixabay using each product name, and update the live menu and localStorage. Do you want to proceed?')) {
      return;
    }

    setIsBulkUpdatingImages(true);
    setBulkUpdateProgress('Initializing bulk update...');
    addAuditLog('Starting bulk menu image synchronization with Pixabay', 'info');

    try {
      const updatedRecipes = [...recipes];
      let successCount = 0;

      for (let i = 0; i < updatedRecipes.length; i++) {
        const recipe = updatedRecipes[i];
        setBulkUpdateProgress(`Syncing [${i + 1}/${updatedRecipes.length}]: ${recipe.name}...`);

        // Clean up recipe name for search query
        let cleanName = recipe.name
          .replace(/Classic/g, '')
          .replace(/Premium/g, '')
          .replace(/Organic/g, '')
          .replace(/Signature/g, '')
          .replace(/Gourmet/g, '')
          .replace(/Homemade/g, '')
          .replace(/Bestseller/g, '')
          .replace(/Swirl/g, '')
          .replace(/Burst/g, '')
          .trim();

        const queriesToTry = [
          cleanName,
          cleanName.split(/\s+/).slice(0, 3).join(' '),
          cleanName.split(/\s+/).slice(0, 2).join(' '),
          recipe.category.replace(/Signature\s+/i, '').replace(/New\s+/i, '').trim(),
          'dessert baked'
        ];

        let foundUrl = '';
        for (const query of queriesToTry) {
          if (!query.trim()) continue;
          try {
            const url = `https://pixabay.com/api/?key=${encodeURIComponent(apiKey)}&q=${encodeURIComponent(query)}&image_type=photo&category=food`;
            const response = await fetch(url);
            if (response.ok) {
              const data = await response.json();
              if (data.hits && data.hits.length > 0) {
                foundUrl = data.hits[0].largeImageURL || data.hits[0].webformatURL;
                break;
              }
            }
          } catch (err) {
            console.error(`Pixabay search failed for query: ${query}`, err);
          }
        }

        if (foundUrl) {
          updatedRecipes[i] = {
            ...recipe,
            image: foundUrl
          };
          successCount++;
        }

        // Delay to respect api rates
        await new Promise((resolve) => setTimeout(resolve, 150));
      }

      setRecipes(updatedRecipes);
      localStorage.setItem('gusto_recipes', JSON.stringify(updatedRecipes));

      addAuditLog(`Successfully updated ${successCount} menu product images using Pixabay`, 'success');
      triggerToast(`✨ Successfully updated ${successCount} product images in local storage!`);
    } catch (err: any) {
      console.error(err);
      triggerToast('❌ Error running bulk image sync.');
    } finally {
      setIsBulkUpdatingImages(false);
      setBulkUpdateProgress('');
    }
  };

  // Quick preset product picture selection
  const handleSelectPicturePreset = (url: string) => {
    if (currentRole === 'viewer') {
      triggerToast('❌ Permission Denied: Cashier/Viewer role is read-only.');
      return;
    }
    setEditImage(url);
    triggerToast('🖼️ Display image preset applied! Click Save to confirm.');
  };

  // Add a price option to local edit state
  const handleAddPriceOption = () => {
    if (currentRole === 'viewer' || currentRole === 'chef') {
      triggerToast('❌ Permission Denied: Only Administrators can modify pricing structures.');
      return;
    }
    if (!newOptionLabel.trim()) {
      triggerToast('⚠️ Please specify a label (e.g. "2kg", "Box of 12")');
      return;
    }
    if (newOptionPrice <= 0) {
      triggerToast('⚠️ Price must be greater than zero');
      return;
    }
    
    // Check for duplicate label
    if (editPriceOptions.some((opt) => opt.label.toLowerCase() === newOptionLabel.trim().toLowerCase())) {
      triggerToast('⚠️ A pricing option with that label already exists!');
      return;
    }

    const updatedOptions = [...editPriceOptions, { label: newOptionLabel.trim(), price: newOptionPrice }];
    setEditPriceOptions(updatedOptions);
    setNewOptionLabel('');
    setNewOptionPrice(0);
    triggerToast(`Added option "${newOptionLabel}"`);
  };

  // Remove a price option
  const handleRemovePriceOption = (index: number) => {
    if (currentRole === 'viewer' || currentRole === 'chef') {
      triggerToast('❌ Permission Denied: Only Administrators can modify pricing structures.');
      return;
    }
    if (editPriceOptions.length <= 1) {
      triggerToast('⚠️ Cannot delete the only price option! Add another one first.');
      return;
    }
    const updated = editPriceOptions.filter((_, idx) => idx !== index);
    setEditPriceOptions(updated);
  };

  // Update specific price option values in line
  const handleUpdatePriceOptionValue = (index: number, newPrice: number) => {
    if (currentRole === 'viewer' || currentRole === 'chef') {
      triggerToast('❌ Permission Denied: Only Administrators can modify pricing structures.');
      return;
    }
    const updated = [...editPriceOptions];
    updated[index] = { ...updated[index], price: Math.max(0, newPrice) };
    setEditPriceOptions(updated);
  };

  // Save branding settings in Firestore
  const handleSaveBranding = async () => {
    if (currentRole !== 'admin') {
      addAuditLog(`Attempted to save website branding (Blocked)`, 'warning');
      triggerToast('❌ Permission Denied: Only Administrators can change global branding settings.');
      return;
    }
    if (!brandNameInput.trim()) {
      triggerToast('❌ Website brand name cannot be empty!');
      return;
    }
    
    const newName = brandNameInput.trim().toUpperCase();
    const newSlogan = brandSloganInput.trim().toUpperCase();
    const newLogo = brandLogoInput.trim();

    try {
      await setDoc(doc(db, 'settings', 'branding'), {
        websiteName: newName,
        websiteSlogan: newSlogan,
        logo: newLogo,
      }, { merge: true });

      setWebsiteName(newName);
      setWebsiteSlogan(newSlogan);
      setLogo(newLogo);
      addAuditLog(`Updated boutique branding in Firestore`);
      triggerToast('👑 Global Website Branding settings updated in Firestore!');
    } catch (err: any) {
      console.error('Error saving branding to Firestore:', err);
      triggerToast('❌ Error saving branding to Firestore: ' + err.message);
    }
  };

  // Save payment settings in Firestore
  const handleSavePayments = async () => {
    if (currentRole !== 'admin') {
      addAuditLog(`Attempted to save payment configurations (Blocked)`, 'warning');
      triggerToast('❌ Permission Denied: Only Administrators can modify payment details.');
      return;
    }
    if (!upiIdInput.trim()) {
      triggerToast('❌ UPI ID cannot be empty!');
      return;
    }

    try {
      await setDoc(doc(db, 'settings', 'branding'), {
        upiId: upiIdInput.trim(),
        upiQrCode: upiQrInput.trim(),
        cashOnDeliveryEnabled: cashOnDeliveryInput,
      }, { merge: true });

      setUpiId(upiIdInput.trim());
      setUpiQrCode(upiQrInput.trim());
      setCashOnDeliveryEnabled(cashOnDeliveryInput);

      // If Cash on Delivery is disabled, update any active/pending COD orders in Firestore to Card payment
      if (!cashOnDeliveryInput) {
        const codOrders = mealPlan.filter(o => o.paymentMethod === 'COD');
        if (codOrders.length > 0) {
          for (const ord of codOrders) {
            try {
              await updateDoc(doc(db, 'orders', ord.id), { paymentMethod: 'Card' });
            } catch (e) {
              console.warn(`Could not update order #${ord.id} to Card:`, e);
            }
          }
          addAuditLog(`Auto-updated ${codOrders.length} Cash on Delivery order(s) to Card payment as COD was disabled.`, 'info');
          triggerToast(`💳 COD disabled. Automatically converted ${codOrders.length} existing COD order(s) to Card/Online payment!`);
          return;
        }
      }

      addAuditLog(`Updated payment settings in Firestore: UPI ID ${upiIdInput.trim()}`);
      triggerToast('💳 Payment settings updated in Firestore!');
    } catch (err: any) {
      console.error('Error saving payments to Firestore:', err);
      triggerToast('❌ Error saving payments to Firestore: ' + err.message);
    }
  };

  // Handle QR Code file selection via click or drag-and-drop
  const handleQrFile = (file: File) => {
    if (currentRole !== 'admin') {
      triggerToast('❌ Permission Denied: Only Administrators can upload QR codes.');
      return;
    }
    if (!file.type.startsWith('image/')) {
      triggerToast('❌ Only image files (PNG, JPG, WEBP, SVG) are allowed!');
      return;
    }
    if (file.size > 1.5 * 1024 * 1024) {
      triggerToast('⚠️ Image too large! Please use a file smaller than 1.5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) return;

      setUpiQrInput(dataUrl);
      addAuditLog(`Uploaded custom payment QR Code image`, 'success');
      triggerToast('✨ Payment QR code uploaded in preview! Click Save to confirm.');
    };
    reader.readAsDataURL(file);
  };

  // Handle logo file selection via click or drag-and-drop
  const handleLogoFile = (file: File) => {
    if (currentRole !== 'admin') {
      triggerToast('❌ Permission Denied: Only Administrators can upload brand logos.');
      return;
    }
    if (!file.type.startsWith('image/')) {
      triggerToast('❌ Only image files (PNG, JPG, WEBP, SVG) are allowed!');
      return;
    }
    
    // Suggest under 1.5MB to stay responsive and avoid hitting localStorage quotas
    if (file.size > 1.5 * 1024 * 1024) {
      triggerToast('⚠️ Image too large! Please use a file smaller than 1.5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) return;

      const newPreset = {
        name: `Custom Logo (${file.name.split('.')[0].slice(0, 15)})`,
        url: dataUrl,
        desc: 'Personally uploaded brand emblem'
      };

      setUploadedLogoPresets(prev => [newPreset, ...prev]);
      setBrandLogoInput(dataUrl);
      addAuditLog(`Uploaded custom brand logo image: ${file.name}`, 'success');
      triggerToast('✨ Logo uploaded & set in preview! Click "Update Global Branding Settings" to save.');
    };
    reader.readAsDataURL(file);
  };

  const handleLogoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingLogo(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleLogoFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveUploadedLogo = (e: React.MouseEvent, urlToRemove: string) => {
    e.stopPropagation();
    if (currentRole !== 'admin') {
      triggerToast('❌ Permission Denied: Only Administrators can modify branding logos.');
      return;
    }
    setUploadedLogoPresets(prev => prev.filter(p => p.url !== urlToRemove));
    if (brandLogoInput === urlToRemove) {
      setBrandLogoInput(defaultLogoImg);
    }
    addAuditLog('Removed a custom uploaded logo', 'info');
    triggerToast('🗑️ Custom uploaded logo preset removed.');
  };

  // Apply logo preset
  const handleApplyLogoPreset = (url: string, name: string) => {
    if (currentRole !== 'admin') {
      triggerToast('❌ Permission Denied: Only Administrators can modify branding logo presets.');
      return;
    }
    setBrandLogoInput(url);
    triggerToast(`🎨 Selected "${name}" logo! Click Update Branding to apply site-wide.`);
  };

  // Reset entire website state back to initial values
  const handleResetToArtisanalDefaults = () => {
    if (currentRole !== 'admin') {
      addAuditLog(`Attempted to reset store database (Blocked)`, 'warning');
      triggerToast('❌ Permission Denied: Only Administrators can reset the system database.');
      return;
    }
    if (window.confirm('Are you sure you want to restore all product prices, photos, logo, and store titles back to default? All custom additions will be lost.')) {
      setRecipes(INITIAL_RECIPES);
      setLogo(defaultLogoImg);
      setWebsiteName('THE FROSTING FAIRY');
      setWebsiteSlogan('CREATING EDIBLE MAGIC');
      
      setBrandNameInput('THE FROSTING FAIRY');
      setBrandSloganInput('CREATING EDIBLE MAGIC');
      setBrandLogoInput(defaultLogoImg);
      
      // Reset selected product
      setSelectedProductId(INITIAL_RECIPES[0].id);
      
      localStorage.removeItem('gusto_recipes');
      localStorage.removeItem('gusto_logo');
      localStorage.removeItem('gusto_website_name');
      localStorage.removeItem('gusto_website_slogan');

      addAuditLog(`System restored to factory boutique defaults`, 'info');
      triggerToast('♻️ Website restored to initial default boutique data.');
    }
  };

  // Filtered recipes list for selection
  const filteredRecipes = recipes.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isUnlocked) {
    const clientId = (import.meta as any).env.VITE_GOOGLE_CLIENT_ID;

    return (
      <div id="admin-lock-screen" className="flex-1 min-h-[600px] flex items-center justify-center bg-brand-cream-light/60 p-4 md:p-8 text-left">
        {toastMessage && (
          <div className="fixed top-24 right-6 z-50 bg-brand-cocoa text-brand-cream px-5 py-3 rounded-xl shadow-lg border border-brand-cocoa-border text-xs font-semibold flex items-center gap-2 animate-bounce">
            <Sparkles className="w-4 h-4 text-brand-pink fill-brand-pink animate-pulse" />
            <span>{toastMessage}</span>
          </div>
        )}
        <div className="max-w-md w-full bg-white rounded-3xl border border-brand-cocoa-border shadow-lg p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-brand-pink-light/30 text-brand-pink border border-brand-pink-accent/20 flex items-center justify-center mx-auto shadow-xs">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <span className="font-mono text-[9px] uppercase tracking-widest text-brand-pink-dark font-extrabold bg-brand-pink-light/60 px-3 py-1.5 rounded-full border border-brand-pink-accent/20">
              Restricted Area
            </span>
            <h2 className="font-display font-black text-2xl text-brand-cocoa mt-3.5 tracking-tight uppercase">
              Bakery Dashboard
            </h2>
            <p className="text-xs text-brand-cocoa-light font-sans mt-1">
              This area is restricted to authorized administrative personnel. Please sign in with your Google Account to verify your authority.
            </p>
          </div>

          <div className="space-y-4 flex flex-col items-center">
            <button
              id="google-signin-btn-firebase"
              onClick={handleGoogleSignIn}
              type="button"
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-800 font-semibold py-3 px-4 rounded-xl border border-gray-300 shadow-sm transition-all hover:shadow-md active:scale-98 cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign in with Google</span>
            </button>
            <p className="text-[10px] text-brand-cocoa-light font-mono">
              Secured with Firebase Authentication & Firestore Security Rules
            </p>
            {signInError && (
              <div className="w-full bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3 text-left font-sans">
                {signInError}
              </div>
            )}
          </div>

          <div className="border-t border-brand-cocoa-border/40 pt-4 text-left">
            <span className="font-mono text-[9px] uppercase tracking-widest text-brand-cocoa-light/80 font-bold block mb-1">
              Authorized Firestore Admin Accounts:
            </span>
            <div className="flex flex-wrap gap-1">
              {authorizedAdmins.map((email, idx) => (
                <span key={`auth-email-${email}-${idx}`} className="font-mono text-[9px] font-semibold text-brand-pink-dark bg-brand-pink-light/50 border border-brand-pink-accent/20 px-2.5 py-0.5 rounded-full">
                  {email}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="admin-dashboard-container" className="flex-1 px-4 sm:px-6 lg:px-8 py-8 bg-brand-cream-light/60 text-left">
      {/* Toast message notification */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 bg-brand-cocoa text-brand-cream px-5 py-3 rounded-xl shadow-lg border border-brand-cocoa-border text-xs font-semibold flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-brand-pink fill-brand-pink animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin Panel Header Section */}
      <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <span className="font-mono text-[9px] uppercase tracking-widest text-brand-pink-dark font-extrabold bg-brand-pink-light/60 px-3 py-1.5 rounded-full border border-brand-pink-accent/20">
            🔒 Store Manager Admin Console
          </span>
          <h1 className="font-display font-black text-3xl md:text-4xl text-brand-cocoa mt-2.5 tracking-tight uppercase">
            Fairy Confectionery Control Panel
          </h1>
          <p className="text-sm text-brand-cocoa-light font-sans mt-1">
            Real-time management for artisanal cake prices, brand logos, display photos, and menu lists.
          </p>
        </div>

        {/* Global Action Tools */}
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center">
          <button
            onClick={handleBulkUpdatePixabayImages}
            disabled={isBulkUpdatingImages}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-brand-cocoa-border text-xs font-bold text-brand-cocoa transition-all cursor-pointer shadow-2xs ${
              isBulkUpdatingImages ? 'bg-brand-cream/40 text-brand-cocoa/50 cursor-not-allowed' : 'bg-white hover:bg-brand-cream-light'
            }`}
          >
            {isBulkUpdatingImages ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-pink" />
                <span>{bulkUpdateProgress || 'Syncing Images...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-brand-pink fill-brand-pink/20 animate-pulse" />
                <span>Pixabay Bulk Sync</span>
              </>
            )}
          </button>

          <button
            onClick={handleResetToArtisanalDefaults}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-brand-cocoa-border text-xs font-bold text-brand-cocoa bg-white hover:bg-brand-cream-light transition-all cursor-pointer shadow-2xs shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Factory Defaults</span>
          </button>
        </div>
      </div>

      {/* Quick Interactive Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4.5 rounded-2xl border border-brand-cocoa-border shadow-3xs">
          <span className="font-mono text-[9px] text-brand-cocoa-light/80 block uppercase tracking-wider">Active Menu Products</span>
          <div className="flex items-center gap-2.5 mt-1.5">
            <LayoutGrid className="w-5 h-5 text-brand-pink" />
            <span className="font-display font-extrabold text-2xl text-brand-cocoa">{recipes.length}</span>
          </div>
        </div>
        <div className="bg-white p-4.5 rounded-2xl border border-brand-cocoa-border shadow-3xs">
          <span className="font-mono text-[9px] text-brand-cocoa-light/80 block uppercase tracking-wider">Total Pricing Options</span>
          <div className="flex items-center gap-2.5 mt-1.5">
            <TrendingUp className="w-5 h-5 text-brand-pink" />
            <span className="font-display font-extrabold text-2xl text-brand-cocoa">
              {recipes.reduce((sum, r) => sum + r.priceOptions.length, 0)} Options
            </span>
          </div>
        </div>
        <div className="bg-white p-4.5 rounded-2xl border border-brand-cocoa-border shadow-3xs">
          <span className="font-mono text-[9px] text-brand-cocoa-light/80 block uppercase tracking-wider">Brand Logo Style</span>
          <div className="flex items-center gap-2.5 mt-1.5">
            <Globe className="w-5 h-5 text-brand-pink" />
            <span className="font-display font-bold text-sm text-brand-cocoa truncate">
              {logo === defaultLogoImg ? '🎨 Original Emblem' : '⚙️ Customized URL'}
            </span>
          </div>
        </div>
        <div className="bg-white p-4.5 rounded-2xl border border-brand-cocoa-border shadow-3xs">
          <span className="font-mono text-[9px] text-brand-cocoa-light/80 block uppercase tracking-wider">Website Core Theme</span>
          <div className="flex items-center gap-2.5 mt-1.5">
            <Layers className="w-5 h-5 text-brand-pink" />
            <span className="font-display font-bold text-xs text-brand-cocoa uppercase tracking-wider truncate">
              Pink & Cocoa Luxe
            </span>
          </div>
        </div>
      </div>

      {/* Main Panel Routing Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-brand-cocoa-border/60 mb-6 gap-2">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setAdminTab('overview')}
            className={`px-5 py-3 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              adminTab === 'overview'
                ? 'border-brand-pink text-brand-pink font-bold border-brand-pink'
                : 'border-transparent text-brand-cocoa-light hover:text-brand-cocoa'
            }`}
          >
            <span className="p-1 rounded-md bg-brand-pink-light/35 text-brand-pink">📊</span>
            <span>Executive Summary</span>
          </button>
          <button
            onClick={() => setAdminTab('products')}
            className={`px-5 py-3 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              adminTab === 'products'
                ? 'border-brand-pink text-brand-pink font-bold border-brand-pink'
                : 'border-transparent text-brand-cocoa-light hover:text-brand-cocoa'
            }`}
          >
            <span className="p-1 rounded-md bg-brand-pink-light/35 text-brand-pink">🎂</span>
            <span>Manage Product Prices & Pictures</span>
          </button>
          <button
            onClick={() => setAdminTab('categories')}
            className={`px-5 py-3 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              adminTab === 'categories'
                ? 'border-brand-pink text-brand-pink font-bold border-brand-pink'
                : 'border-transparent text-brand-cocoa-light hover:text-brand-cocoa'
            }`}
          >
            <Sparkles className="w-4 h-4 text-brand-pink fill-brand-pink/20" />
            <span>Homepage Categories</span>
          </button>
          <button
            onClick={() => setAdminTab('branding')}
            className={`px-5 py-3 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              adminTab === 'branding'
                ? 'border-brand-pink text-brand-pink font-bold border-brand-pink'
                : 'border-transparent text-brand-cocoa-light hover:text-brand-cocoa'
            }`}
          >
            <span className="p-1 rounded-md bg-brand-pink-light/35 text-brand-pink">👑</span>
            <span>Branding & Logo Designer</span>
          </button>
          <button
            onClick={() => setAdminTab('orders')}
            className={`px-5 py-3 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              adminTab === 'orders'
                ? 'border-brand-pink text-brand-pink font-bold border-brand-pink'
                : 'border-transparent text-brand-cocoa-light hover:text-brand-cocoa'
            }`}
          >
            <span className="p-1 rounded-md bg-brand-pink-light/35 text-brand-pink">📦</span>
            <span>Customer Orders Queue</span>
          </button>
          <button
            onClick={() => setAdminTab('authority')}
            className={`px-5 py-3 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              adminTab === 'authority'
                ? 'border-brand-pink text-brand-pink font-bold border-brand-pink'
                : 'border-transparent text-brand-cocoa-light hover:text-brand-cocoa'
            }`}
          >
            <Shield className="w-4 h-4 text-brand-pink" />
            <span>Authority & Security Settings</span>
          </button>
        </div>

        {/* Lock/Logout Session Button */}
        <button
          onClick={handleLogoutAdmin}
          className="mb-2 sm:mb-0 px-3 py-1.5 rounded-lg border border-brand-pink-accent/25 hover:bg-brand-pink-light/20 text-brand-pink-dark font-mono text-[10px] uppercase font-bold flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto"
          title="Sign out of administrative session"
        >
          <Lock className="w-3 h-3" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* TAB CONTENT: EXECUTIVE BOUTIQUE OVERVIEW */}
      {adminTab === 'overview' && (
        <div className="space-y-8 animate-fade-in text-left">
          {/* Hero Welcome banner */}
          <div className="bg-gradient-to-r from-brand-cocoa to-brand-cocoa-light text-white p-6 sm:p-8 rounded-3xl border border-brand-cocoa-border shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-10 pointer-events-none transform translate-x-12 -translate-y-6">
              <Sparkles className="w-64 h-64 text-white" />
            </div>
            <div className="relative z-10 space-y-2 max-w-xl">
              <span className="text-[10px] font-mono uppercase tracking-widest text-brand-pink font-extrabold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 fill-brand-pink animate-pulse" />
                <span>Boutique Headquarters</span>
              </span>
              <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight">
                Welcome back, {firebaseUser?.displayName || firebaseUser?.email || 'Fairy Chef'}!
              </h2>
              <p className="text-xs sm:text-sm text-brand-cream-light/80 leading-relaxed">
                Your administrative session is secure. From here, you can manage real-time boutique confections, customize global brand assets, fulfill custom client orders, and track system audits.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Real-time Sales and Operational KPI cards */}
            <div className="lg:col-span-8 space-y-6">
              <h3 className="font-display font-bold text-sm text-brand-cocoa uppercase tracking-wider">
                Boutique Key Performance Indicators
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white p-5 rounded-2xl border border-brand-cocoa-border shadow-xs hover:border-brand-pink/50 transition-colors">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-brand-cocoa-light font-bold">Menu Portfolio</span>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-3xl font-black text-brand-cocoa font-display">{recipes.length}</span>
                    <span className="text-xs text-brand-cocoa-light font-sans font-medium">Items</span>
                  </div>
                  <span className="text-[10px] text-brand-cocoa-light block mt-1.5 font-sans">Across {new Set(recipes.map(r => r.category)).size} unique categories</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-brand-cocoa-border shadow-xs hover:border-brand-pink/50 transition-colors">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-brand-cocoa-light font-bold">Active Orders</span>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-3xl font-black text-brand-pink font-display">{mealPlan.length}</span>
                    <span className="text-xs text-brand-cocoa-light font-sans font-medium">Active</span>
                  </div>
                  <span className="text-[10px] text-brand-cocoa-light block mt-1.5 font-sans">
                    {mealPlan.filter(o => o.status === 'Pending' || !o.status).length} pending processing
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-brand-cocoa-border shadow-xs hover:border-brand-pink/50 transition-colors">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-brand-cocoa-light font-bold">Total Sales Value</span>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-3xl font-black text-brand-cocoa font-display">₹{mealPlan.reduce((acc, order) => {
                      if (!order.estimatedPrice) return acc;
                      const num = typeof order.estimatedPrice === 'number'
                        ? order.estimatedPrice
                        : parseInt(String(order.estimatedPrice).replace(/[^0-9]/g, '')) || 0;
                      return acc + num;
                    }, 0)}</span>
                  </div>
                  <span className="text-[10px] text-brand-cocoa-light block mt-1.5 font-sans">Queued customer pipeline</span>
                </div>
              </div>

              {/* Quick Action Panel */}
              <div className="bg-white p-6 rounded-2xl border border-brand-cocoa-border shadow-xs space-y-4">
                <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-brand-cocoa">
                  Quick Management Shortcuts
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <button
                    onClick={() => setAdminTab('products')}
                    className="p-3 bg-brand-cream-light/30 hover:bg-brand-pink-light/40 border border-brand-cocoa-border/40 rounded-xl text-center group cursor-pointer transition-all animate-none h-auto w-auto"
                  >
                    <span className="text-lg block group-hover:scale-110 transition-transform">🎂</span>
                    <span className="text-[11px] font-bold text-brand-cocoa block mt-1">Manage Menu</span>
                  </button>
                  <button
                    onClick={() => setAdminTab('categories')}
                    className="p-3 bg-brand-cream-light/30 hover:bg-brand-pink-light/40 border border-brand-cocoa-border/40 rounded-xl text-center group cursor-pointer transition-all animate-none h-auto w-auto"
                  >
                    <span className="text-lg block group-hover:scale-110 transition-transform">✨</span>
                    <span className="text-[11px] font-bold text-brand-cocoa block mt-1">Categories</span>
                  </button>
                  <button
                    onClick={() => setAdminTab('branding')}
                    className="p-3 bg-brand-cream-light/30 hover:bg-brand-pink-light/40 border border-brand-cocoa-border/40 rounded-xl text-center group cursor-pointer transition-all animate-none h-auto w-auto"
                  >
                    <span className="text-lg block group-hover:scale-110 transition-transform">👑</span>
                    <span className="text-[11px] font-bold text-brand-cocoa block mt-1">Logo & Style</span>
                  </button>
                  <button
                    onClick={() => setAdminTab('orders')}
                    className="p-3 bg-brand-cream-light/30 hover:bg-brand-pink-light/40 border border-brand-cocoa-border/40 rounded-xl text-center group cursor-pointer transition-all animate-none h-auto w-auto"
                  >
                    <span className="text-lg block group-hover:scale-110 transition-transform">📦</span>
                    <span className="text-[11px] font-bold text-brand-cocoa block mt-1">Orders Desk</span>
                  </button>
                  <button
                    onClick={() => setAdminTab('authority')}
                    className="p-3 bg-brand-cream-light/30 hover:bg-brand-pink-light/40 border border-brand-cocoa-border/40 rounded-xl text-center group cursor-pointer transition-all animate-none h-auto w-auto"
                  >
                    <span className="text-lg block group-hover:scale-110 transition-transform">🛡️</span>
                    <span className="text-[11px] font-bold text-brand-cocoa block mt-1">Security & Role</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Audit Logs Right Sidebar on Overview */}
            <div className="lg:col-span-4 space-y-6">
              <h3 className="font-display font-bold text-sm text-brand-cocoa uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-brand-pink animate-pulse" />
                <span>Real-Time Audit Stream</span>
              </h3>
              
              <div className="bg-white p-5 rounded-2xl border border-brand-cocoa-border shadow-xs flex flex-col h-[320px]">
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {auditLogs.slice(0, 8).map((log, idx) => (
                    <div key={`audit-summary-${log.id}-${idx}`} className="text-left text-xs border-b border-brand-cream pb-2 last:border-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-mono text-[9px] font-semibold text-brand-cocoa-light">{log.time}</span>
                        <span className={`font-mono text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                          log.status === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          log.status === 'warning' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-brand-pink-light/40 text-brand-pink border border-brand-pink/10'
                        }`}>
                          {log.role.split(' ')[0]}
                        </span>
                      </div>
                      <p className="text-brand-cocoa font-medium text-[11px] leading-relaxed">{log.action}</p>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setAdminTab('authority')}
                  className="mt-3 text-center text-[10px] font-bold font-mono uppercase tracking-wider text-brand-pink hover:text-brand-pink-dark transition-colors pt-2.5 border-t border-brand-cream cursor-pointer"
                >
                  View All Audit Logs &rarr;
                </button>
              </div>
            </div>
          </div>

          {/* Performance Dashboard Card with Recharts */}
          <PerformanceDashboard orders={mealPlan} />
        </div>
      )}

      {/* TAB CONTENT: PRODUCT PRICES & PICTURES */}
      {adminTab === 'products' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Product Selection List (span 4) */}
          <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-brand-cocoa-border shadow-2xs flex flex-col h-[650px]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-md text-brand-cocoa">
                Select Bakery Item
              </h3>
              <button
                onClick={handleInitiateAddProduct}
                className="px-2.5 py-1 bg-brand-pink hover:bg-brand-pink-dark text-white text-[10px] font-bold rounded-lg transition-all cursor-pointer shadow-3xs flex items-center gap-1 shrink-0"
              >
                <Plus className="w-3 h-3" />
                <span>Add Item</span>
              </button>
            </div>
            
            {/* Search items */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-brand-cocoa-light/70" />
              <input
                type="text"
                placeholder="Search pastries, cakes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-brand-cocoa-border bg-brand-cream-light/30 focus:outline-none focus:ring-1 focus:ring-brand-pink text-brand-cocoa font-medium"
              />
            </div>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {filteredRecipes.length === 0 ? (
                <div className="py-8 text-center text-xs text-brand-cocoa-light font-mono">
                  No matching products found
                </div>
              ) : (
                filteredRecipes.map((item, itemIdx) => {
                  const isSelected = !isAddingNewProduct && item.id === selectedProductId;
                  const lowestPrice = Math.min(...item.priceOptions.map((o) => o.price));
                  return (
                    <button
                      key={`recipe-item-${item.id}-${itemIdx}`}
                      onClick={() => {
                        setIsAddingNewProduct(false);
                        setSelectedProductId(item.id);
                      }}
                      className={`w-full p-2.5 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                        isSelected
                           ? 'border-brand-pink bg-brand-pink-light/20 shadow-3xs'
                           : 'border-transparent hover:bg-brand-cream-light/40'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-brand-cream border border-brand-cocoa-border/40 shrink-0">
                        <img src={item.image} alt={item.name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-sans font-bold text-brand-cocoa text-xs block truncate">
                          {item.name}
                        </span>
                        <span className="font-mono text-[9px] text-brand-pink-dark uppercase tracking-wider block">
                          {item.category}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-mono text-[10px] font-bold text-brand-cocoa bg-brand-cream px-1.5 py-0.5 rounded border border-brand-cocoa-border/40">
                          ₹{lowestPrice}+
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Active Interactive Editor Form (span 8) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {isAddingNewProduct ? (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Form fields editor (Col span 7) */}
                <div className="md:col-span-7 bg-white p-6 rounded-2xl border border-brand-cocoa-border shadow-2xs space-y-5">
                  <div className="flex items-center justify-between border-b border-brand-cocoa-border/40 pb-3">
                    <div>
                      <h3 className="font-display font-bold text-base text-brand-cocoa">
                        Add New Bakery Item
                      </h3>
                      <span className="text-[10px] font-mono text-brand-cocoa-light uppercase">
                        Product Creator
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsAddingNewProduct(false)}
                        className="px-3 py-1.5 border border-brand-cocoa-border/50 text-brand-cocoa text-xs font-bold rounded-lg hover:bg-brand-cream-light/30 transition-all cursor-pointer font-sans"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleCreateProduct}
                        className="flex items-center gap-1.5 px-4 py-1.5 bg-brand-pink text-white text-xs font-bold rounded-lg hover:bg-brand-pink-dark transition-all cursor-pointer shadow-3xs font-sans"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Create Product</span>
                      </button>
                    </div>
                  </div>

                  {/* Name field */}
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] uppercase tracking-wider text-brand-cocoa-light block">
                      Product Name
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="e.g., Gourmet Blueberry Cheesecake"
                      className="w-full px-3 py-2 text-xs font-semibold text-brand-cocoa border border-brand-cocoa-border rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-pink bg-brand-cream-light/10"
                    />
                  </div>

                  {/* Category Selection */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-mono text-[9px] uppercase tracking-wider text-brand-cocoa-light block">
                        Category
                      </label>
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-semibold text-brand-cocoa border border-brand-cocoa-border rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-pink bg-white"
                      >
                        <option value="Signature Cakes">Signature Cakes</option>
                        <option value="Cupcakes">Cupcakes</option>
                        <option value="Brownies">Brownies</option>
                        <option value="Cookies">Cookies</option>
                        <option value="Donuts">Donuts</option>
                        <option value="Bombolonis">Bombolonis</option>
                        <option value="Assorted Boxes">Assorted Boxes</option>
                        <option value="New Additions">New Additions</option>
                      </select>
                    </div>

                    {/* Display Picture Link & Device Upload */}
                    <div className="space-y-2 bg-brand-cream-light/20 p-3.5 rounded-2xl border border-brand-cocoa-border/40">
                      <div className="flex items-center justify-between">
                        <label className="font-mono text-[9px] uppercase tracking-wider text-brand-cocoa-light block">
                          Product Image
                        </label>
                        <span className="text-[9px] font-mono text-brand-pink font-bold">JPG, PNG, WEBP (Max 5MB)</span>
                      </div>
                      
                      <input
                        type="text"
                        value={editImage}
                        onChange={(e) => setEditImage(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full px-3 py-2 text-xs font-mono text-brand-cocoa border border-brand-cocoa-border rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-pink bg-white"
                      />

                      {/* Device File Picker Button */}
                      <div className="pt-1">
                        <input
                          type="file"
                          id="device-image-upload-create"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          disabled={currentRole === 'viewer'}
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleDeviceImageUpload(file);
                            e.target.value = '';
                          }}
                        />
                        <label
                          htmlFor="device-image-upload-create"
                          className={`w-full flex items-center justify-center gap-2 px-3.5 py-2.5 text-xs font-bold rounded-xl transition-all shadow-2xs cursor-pointer ${
                            currentRole === 'viewer'
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                              : 'bg-gradient-to-r from-brand-pink to-brand-pink-dark hover:from-brand-pink-dark hover:to-brand-pink text-white shadow-brand-pink/20 hover:shadow-md active:scale-[0.99]'
                          }`}
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload from Device</span>
                        </label>
                      </div>

                      {/* Upload Progress Bar */}
                      {isUploadingProductImage && (
                        <div className="p-2.5 bg-brand-pink-light/30 rounded-xl border border-brand-pink/30 space-y-1.5 animate-pulse">
                          <div className="flex items-center justify-between text-[10px] font-bold text-brand-cocoa">
                            <span className="flex items-center gap-1.5">
                              <Loader2 className="w-3.5 h-3.5 text-brand-pink animate-spin" />
                              <span>Uploading & Processing Image...</span>
                            </span>
                            <span className="font-mono text-brand-pink font-extrabold">{uploadProgressPercent}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-white/80 rounded-full overflow-hidden border border-brand-pink/20">
                            <div
                              className="h-full bg-brand-pink transition-all duration-200 rounded-full"
                              style={{ width: `${uploadProgressPercent}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Live Thumbnail Preview */}
                      {deviceImagePreview && !isUploadingProductImage && (
                        <div className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-brand-cocoa-border/40 shadow-3xs">
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-brand-cocoa-border shrink-0 bg-brand-cream">
                            <img src={deviceImagePreview} alt="Device Preview" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-[11px] font-bold text-brand-cocoa block truncate">Device Image Selected</span>
                            <span className="text-[9px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                              <CheckCircle className="w-3 h-3 text-emerald-600" /> Live Preview Active
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setDeviceImagePreview(null);
                              setUploadError(null);
                            }}
                            className="p-1 text-brand-cocoa-light hover:text-red-500 rounded-lg hover:bg-red-50 text-[10px]"
                            title="Clear preview"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {/* Upload Error Display */}
                      {uploadError && (
                        <div className="p-2.5 bg-red-50 text-red-600 text-[10px] font-medium rounded-xl border border-red-200 flex items-start gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-500" />
                          <span className="leading-tight">{uploadError}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description field */}
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] uppercase tracking-wider text-brand-cocoa-light block">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Describe this delightful pastry..."
                      className="w-full px-3 py-2 text-xs font-semibold text-brand-cocoa border border-brand-cocoa-border rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-pink bg-brand-cream-light/10 resize-none"
                    />
                  </div>

                  {/* Build-Your-Own Assorted Box Configuration */}
                  <div className="p-4 bg-brand-cream-light/40 border border-brand-cocoa-border/40 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🎁</span>
                        <div>
                          <label htmlFor="create-build-your-box-toggle" className="font-sans font-bold text-xs text-brand-cocoa block cursor-pointer">
                            Build-Your-Own Assorted Box
                          </label>
                          <span className="text-[10px] text-brand-cocoa-light block">
                            Enables interactive pastry customizer where customers pick individual menu items with live running totals
                          </span>
                        </div>
                      </div>
                      <input
                        id="create-build-your-box-toggle"
                        type="checkbox"
                        checked={editIsBuildYourBox}
                        onChange={(e) => {
                          setEditIsBuildYourBox(e.target.checked);
                          if (e.target.checked && editCategory !== 'Assorted Boxes') {
                            setEditCategory('Assorted Boxes');
                          }
                        }}
                        className="w-4 h-4 accent-brand-pink rounded cursor-pointer"
                      />
                    </div>

                    {editIsBuildYourBox && (
                      <div className="pt-2 border-t border-brand-cocoa-border/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <label className="font-mono text-[9px] uppercase tracking-wider text-brand-cocoa-light font-bold block">
                            Minimum Items Required (Floor)
                          </label>
                          <span className="text-[10px] text-brand-cocoa-light">
                            Minimum total pieces customer must select before checkout is allowed
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={editBoxMinItems}
                            onChange={(e) => setEditBoxMinItems(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-20 px-2.5 py-1 text-xs font-mono font-bold text-brand-cocoa border border-brand-cocoa-border rounded-lg bg-white text-center"
                          />
                          <span className="text-xs text-brand-cocoa-light font-mono">items</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Manage Pricing Options inside Create Form */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between border-t border-brand-cocoa-border/40 pt-3">
                      <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-brand-cocoa flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5 text-brand-pink" />
                        <span>Manage Pricing Options</span>
                      </h4>
                      <span className="text-[9px] font-mono text-brand-cocoa-light">
                        (e.g., By weight or count)
                      </span>
                    </div>

                    {/* Pricing lists edit block */}
                    <div className="bg-brand-cream-light/45 p-3 rounded-xl border border-brand-cocoa-border/40 space-y-2">
                      <div className="max-h-[140px] overflow-y-auto space-y-1.5 pr-1">
                        {editPriceOptions.map((opt, index) => (
                          <div key={`create-price-${opt.label}-${index}`} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-brand-cocoa-border/20">
                            <span className="font-sans font-bold text-xs text-brand-cocoa min-w-[70px]">
                              {opt.label}
                            </span>
                            <div className="text-right flex-1 flex items-center justify-end gap-2">
                              <span className="font-mono text-xs font-black text-brand-cocoa">
                                ₹{opt.price}
                              </span>
                              <button
                                onClick={() => {
                                  if (editPriceOptions.length === 1) {
                                    triggerToast('⚠️ A product must have at least one pricing option!');
                                    return;
                                  }
                                  setEditPriceOptions(editPriceOptions.filter((_, idx) => idx !== index));
                                }}
                                className="p-1 text-brand-cocoa-light hover:text-brand-pink hover:bg-brand-pink-light/35 rounded-md cursor-pointer transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Quick Add Price Option Setup */}
                      <div className="flex items-center gap-2 pt-2 border-t border-brand-cocoa-border/20">
                        <input
                          type="text"
                          placeholder="Size (e.g., 500g, Piece)"
                          value={newOptionLabel}
                          onChange={(e) => setNewOptionLabel(e.target.value)}
                          className="flex-1 bg-white border border-brand-cocoa-border rounded-lg px-2 py-1 text-[11px] text-brand-cocoa"
                        />
                        <div className="relative w-20">
                          <span className="absolute left-1.5 top-1 text-[11px] font-bold text-brand-cocoa-light">₹</span>
                          <input
                            type="number"
                            placeholder="Price"
                            value={newOptionPrice || ''}
                            onChange={(e) => setNewOptionPrice(Number(e.target.value))}
                            className="w-full bg-white border border-brand-cocoa-border rounded-lg pl-4 pr-1 py-1 text-[11px] text-brand-cocoa font-mono font-bold"
                          />
                        </div>
                        <button
                          onClick={() => {
                            if (!newOptionLabel.trim()) {
                              triggerToast('⚠️ Please specify a label (e.g. "2kg", "Box of 12")');
                              return;
                            }
                            if (newOptionPrice <= 0) {
                              triggerToast('⚠️ Price must be greater than zero!');
                              return;
                            }
                            setEditPriceOptions([...editPriceOptions, { label: newOptionLabel.trim(), price: newOptionPrice }]);
                            setNewOptionLabel('');
                            setNewOptionPrice(0);
                          }}
                          className="px-2.5 py-1 bg-brand-pink text-white text-[10px] font-bold rounded-lg hover:bg-brand-pink-dark cursor-pointer transition-all"
                        >
                          Add Option
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column previews in Create Mode */}
                <div className="md:col-span-5 flex flex-col gap-6">
                  
                  {/* LIVE PREVIEW CARD */}
                  <div className="bg-brand-cream/20 rounded-2xl border border-brand-cocoa-border p-4 shadow-sm space-y-4">
                    <h4 className="font-display font-bold text-xs text-brand-cocoa uppercase tracking-wider mb-2">Live Shop Card Preview</h4>
                    <div className="bg-white rounded-2xl overflow-hidden border border-brand-cocoa-border shadow-xs max-w-[240px] mx-auto">
                      <div className="h-40 bg-brand-cream relative overflow-hidden flex items-center justify-center">
                        {editImage ? (
                          <img src={editImage} alt="Preview" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-mono text-[10px] text-brand-cocoa-light">No Image Selected</span>
                        )}
                      </div>
                      <div className="p-3.5 text-left">
                        <span className="font-display font-black text-xs text-brand-cocoa block truncate uppercase tracking-tight">
                          {editName || 'Untitled Pastry'}
                        </span>
                        <p className="text-[10px] text-brand-cocoa-light/90 leading-tight line-clamp-2 mt-1 min-h-[30px]">
                          {editDescription || 'Provide a beautiful description detailing gourmet ingredients.'}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2.5">
                          {editPriceOptions.map((opt, i) => (
                            <span key={`create-preview-price-${opt.label}-${i}`} className="text-[8px] font-mono bg-white text-brand-cocoa border border-brand-cocoa-border/50 px-1.5 py-0.5 rounded-md font-bold">
                              {opt.label}: ₹{opt.price}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* DISPLAY PICTURE PRESETS */}
                  <div className="bg-white p-4.5 rounded-2xl border border-brand-cocoa-border shadow-2xs flex-1 flex flex-col">
                    <h4 className="font-display font-bold text-xs text-brand-cocoa uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-brand-pink" />
                      <span>Display Photo Library</span>
                    </h4>
                    <p className="text-[10px] text-brand-cocoa-light leading-relaxed mb-3">
                      Select a premium hand-made pastry preset from our curated high-resolution photography library to update the display photo instantly:
                    </p>

                    <div className="grid grid-cols-3 gap-2 overflow-y-auto max-h-[220px] pr-1 flex-1">
                      {PRODUCT_IMAGE_PRESETS.map((p, idx) => (
                        <button
                          key={idx}
                          onClick={() => setEditImage(p.url)}
                          className={`group aspect-square rounded-xl overflow-hidden border bg-brand-cream relative cursor-pointer ${
                            editImage === p.url ? 'border-brand-pink ring-2 ring-brand-pink-light' : 'border-brand-cocoa-border/50'
                          }`}
                          title={p.name}
                        >
                          <img src={p.url} alt={p.name} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <span className="text-[8px] font-bold text-white text-center p-1 leading-none">{p.name.split(' ').slice(0, 2).join(' ')}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            ) : activeProduct ? (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Form fields editor (Col span 7) */}
                <div className="md:col-span-7 bg-white p-6 rounded-2xl border border-brand-cocoa-border shadow-2xs space-y-5">
                  <div className="flex items-center justify-between border-b border-brand-cocoa-border/40 pb-3">
                    <div>
                      <h3 className="font-display font-bold text-base text-brand-cocoa">
                        Edit Recipe Details
                      </h3>
                      <span className="text-[10px] font-mono text-brand-cocoa-light uppercase">
                        Product ID: {activeProduct.id}
                      </span>
                    </div>
                    <button
                      onClick={handleSaveProduct}
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-brand-pink text-white text-xs font-bold rounded-lg hover:bg-brand-pink-dark transition-all cursor-pointer shadow-3xs"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </button>
                  </div>

                  {/* Name field */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-mono text-[9px] uppercase tracking-wider text-brand-cocoa-light block">
                        Product Name
                      </label>
                      {(currentRole === 'chef' || currentRole === 'viewer') && (
                        <span className="font-mono text-[8px] text-brand-pink-dark font-extrabold bg-brand-pink-light/60 px-2 py-0.5 rounded flex items-center gap-0.5 border border-brand-pink-accent/20">
                          <Lock className="w-2.5 h-2.5" /> {currentRole === 'chef' ? 'PASTRY CHEF LOCKED' : 'READ-ONLY'}
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      disabled={currentRole === 'chef' || currentRole === 'viewer'}
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className={`w-full px-3 py-2 text-xs font-semibold text-brand-cocoa border border-brand-cocoa-border rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-pink ${
                        currentRole === 'chef' || currentRole === 'viewer' ? 'bg-brand-cream-light/65 text-brand-cocoa-light/80 cursor-not-allowed' : 'bg-brand-cream-light/10'
                      }`}
                    />
                  </div>

                  {/* Category Selection */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="font-mono text-[9px] uppercase tracking-wider text-brand-cocoa-light block">
                          Category
                        </label>
                        {currentRole === 'viewer' && (
                          <span className="font-mono text-[8px] text-brand-pink-dark font-extrabold bg-brand-pink-light/60 px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-brand-pink-accent/20">
                            <Lock className="w-2 h-2" /> LOCKED
                          </span>
                        )}
                      </div>
                      <select
                        disabled={currentRole === 'viewer'}
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        className={`w-full px-3 py-2 text-xs font-semibold text-brand-cocoa border border-brand-cocoa-border rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-pink bg-white ${
                          currentRole === 'viewer' ? 'bg-brand-cream-light/65 text-brand-cocoa-light/80 cursor-not-allowed' : ''
                        }`}
                      >
                        <option value="Signature Cakes">Signature Cakes</option>
                        <option value="Cupcakes">Cupcakes</option>
                        <option value="Brownies">Brownies</option>
                        <option value="Cookies">Cookies</option>
                        <option value="Donuts">Donuts</option>
                        <option value="Bombolonis">Bombolonis</option>
                        <option value="Assorted Boxes">Assorted Boxes</option>
                        <option value="New Additions">New Additions</option>
                      </select>
                    </div>

                    {/* Display Picture Link & Device Upload */}
                    <div className="space-y-2.5 bg-brand-cream-light/20 p-3.5 rounded-2xl border border-brand-cocoa-border/40">
                      <div className="flex items-center justify-between">
                        <label className="font-mono text-[9px] uppercase tracking-wider text-brand-cocoa-light block">
                          Product Image
                        </label>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono text-brand-pink font-bold">JPG, PNG, WEBP (Max 5MB)</span>
                          {currentRole === 'viewer' && (
                            <span className="font-mono text-[8px] text-brand-pink-dark font-extrabold bg-brand-pink-light/60 px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-brand-pink-accent/20">
                              <Lock className="w-2.5 h-2.5" /> LOCKED
                            </span>
                          )}
                        </div>
                      </div>

                      <input
                        type="text"
                        disabled={currentRole === 'viewer'}
                        value={editImage}
                        onChange={(e) => setEditImage(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className={`w-full px-3 py-2 text-xs font-mono text-brand-cocoa border border-brand-cocoa-border rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-pink ${
                          currentRole === 'viewer' ? 'bg-brand-cream-light/65 text-brand-cocoa-light/80 cursor-not-allowed' : 'bg-white'
                        }`}
                      />

                      {/* Device File Picker Button */}
                      <div className="pt-1">
                        <input
                          type="file"
                          id="device-image-upload-edit"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          disabled={currentRole === 'viewer'}
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleDeviceImageUpload(file);
                            e.target.value = '';
                          }}
                        />
                        <label
                          htmlFor="device-image-upload-edit"
                          className={`w-full flex items-center justify-center gap-2 px-3.5 py-2.5 text-xs font-bold rounded-xl transition-all shadow-2xs cursor-pointer ${
                            currentRole === 'viewer'
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                              : 'bg-gradient-to-r from-brand-pink to-brand-pink-dark hover:from-brand-pink-dark hover:to-brand-pink text-white shadow-brand-pink/20 hover:shadow-md active:scale-[0.99]'
                          }`}
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload from Device</span>
                        </label>
                      </div>

                      {/* Upload Progress Bar */}
                      {isUploadingProductImage && (
                        <div className="p-2.5 bg-brand-pink-light/30 rounded-xl border border-brand-pink/30 space-y-1.5 animate-pulse">
                          <div className="flex items-center justify-between text-[10px] font-bold text-brand-cocoa">
                            <span className="flex items-center gap-1.5">
                              <Loader2 className="w-3.5 h-3.5 text-brand-pink animate-spin" />
                              <span>Uploading & Processing Image...</span>
                            </span>
                            <span className="font-mono text-brand-pink font-extrabold">{uploadProgressPercent}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-white/80 rounded-full overflow-hidden border border-brand-pink/20">
                            <div
                              className="h-full bg-brand-pink transition-all duration-200 rounded-full"
                              style={{ width: `${uploadProgressPercent}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Live Thumbnail Preview */}
                      {deviceImagePreview && !isUploadingProductImage && (
                        <div className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-brand-cocoa-border/40 shadow-3xs">
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-brand-cocoa-border shrink-0 bg-brand-cream">
                            <img src={deviceImagePreview} alt="Device Preview" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-[11px] font-bold text-brand-cocoa block truncate">Device Image Selected</span>
                            <span className="text-[9px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                              <CheckCircle className="w-3 h-3 text-emerald-600" /> Live Preview Active
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setDeviceImagePreview(null);
                              setUploadError(null);
                            }}
                            className="p-1 text-brand-cocoa-light hover:text-red-500 rounded-lg hover:bg-red-50 text-[10px]"
                            title="Clear preview"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {/* Upload Error Display */}
                      {uploadError && (
                        <div className="p-2.5 bg-red-50 text-red-600 text-[10px] font-medium rounded-xl border border-red-200 flex items-start gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-500" />
                          <span className="leading-tight">{uploadError}</span>
                        </div>
                      )}

                      {/* Pixabay Image Search Component */}
                      {currentRole !== 'viewer' && (
                        <div className="pt-2 space-y-2">
                          <button
                            id="btn-search-pixabay-image"
                            type="button"
                            disabled={isSearchingPixabay || !editName.trim()}
                            onClick={handleSearchPixabay}
                            className={`w-full flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all shadow-3xs cursor-pointer ${
                              !editName.trim()
                                ? 'bg-brand-cocoa-border/40 text-brand-cocoa-light/60 cursor-not-allowed'
                                : 'bg-brand-pink text-white hover:bg-brand-pink-dark'
                            }`}
                          >
                            {isSearchingPixabay ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Searching Pixabay...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Search for Image</span>
                              </>
                            )}
                          </button>

                          {/* Error display */}
                          {pixabayError && (
                            <p className="text-[10px] text-red-500 font-medium leading-relaxed text-center bg-red-50 p-1.5 rounded-lg border border-red-100">
                              {pixabayError}
                            </p>
                          )}

                          {/* Empty state hint */}
                          {!editName.trim() && (
                            <p className="text-[10px] text-brand-pink-dark font-medium leading-relaxed text-center">
                              Add a product name first to search.
                            </p>
                          )}

                          {/* Thumbnail previews */}
                          {pixabayResults.length > 0 && (
                            <div className="space-y-1.5 pt-1 bg-brand-cream-light/10 p-2 rounded-xl border border-brand-cocoa-border/20">
                              <p className="font-mono text-[8px] uppercase tracking-wider text-brand-cocoa-light block">
                                Pick a Match manually:
                              </p>
                              <div className="grid grid-cols-4 gap-2">
                                {pixabayResults.map((result, idx) => (
                                  <button
                                    key={`pixabay-img-${result.id}-${idx}`}
                                    type="button"
                                    title={`Photo by ${result.user}`}
                                    onClick={() => setEditImage(result.url)}
                                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer bg-brand-cream-light/20 hover:scale-105 ${
                                      editImage === result.url
                                        ? 'border-brand-pink ring-2 ring-brand-pink/30'
                                        : 'border-brand-cocoa-border/40 hover:border-brand-cocoa'
                                    }`}
                                  >
                                    <img
                                      src={result.thumbnail}
                                      alt={`Pixabay match`}
                                      loading="lazy"
                                      decoding="async"
                                      className="w-full h-full object-cover"
                                      referrerPolicy="no-referrer"
                                    />
                                    <div className="absolute inset-x-0 bottom-0 bg-black/60 text-[6px] text-white truncate px-1 text-center py-0.5">
                                      {result.user}
                                    </div>
                                  </button>
                                ))}
                              </div>
                              <p className="text-[7px] text-right text-brand-cocoa-light font-mono italic">
                                Photos provided by Pixabay
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description field */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-mono text-[9px] uppercase tracking-wider text-brand-cocoa-light block">
                        Description
                      </label>
                      {currentRole === 'viewer' && (
                        <span className="font-mono text-[8px] text-brand-pink-dark font-extrabold bg-brand-pink-light/60 px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-brand-pink-accent/20">
                          <Lock className="w-2 h-2" /> LOCKED
                        </span>
                      )}
                    </div>
                    <textarea
                      rows={3}
                      disabled={currentRole === 'viewer'}
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className={`w-full px-3 py-2 text-xs text-brand-cocoa border border-brand-cocoa-border rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-pink resize-none leading-relaxed ${
                        currentRole === 'viewer' ? 'bg-brand-cream-light/65 text-brand-cocoa-light/80 cursor-not-allowed' : 'bg-brand-cream-light/10'
                      }`}
                    />
                  </div>

                  {/* Build-Your-Own Assorted Box Configuration */}
                  <div className="p-4 bg-brand-cream-light/40 border border-brand-cocoa-border/40 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🎁</span>
                        <div>
                          <label htmlFor="edit-build-your-box-toggle" className="font-sans font-bold text-xs text-brand-cocoa block cursor-pointer">
                            Build-Your-Own Assorted Box
                          </label>
                          <span className="text-[10px] text-brand-cocoa-light block">
                            Enables interactive pastry customizer where customers pick individual menu items with live running totals
                          </span>
                        </div>
                      </div>
                      <input
                        id="edit-build-your-box-toggle"
                        type="checkbox"
                        disabled={currentRole === 'viewer' || currentRole === 'chef'}
                        checked={editIsBuildYourBox}
                        onChange={(e) => {
                          setEditIsBuildYourBox(e.target.checked);
                          if (e.target.checked && editCategory !== 'Assorted Boxes') {
                            setEditCategory('Assorted Boxes');
                          }
                        }}
                        className="w-4 h-4 accent-brand-pink rounded cursor-pointer disabled:cursor-not-allowed"
                      />
                    </div>

                    {editIsBuildYourBox && (
                      <div className="pt-2 border-t border-brand-cocoa-border/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <label className="font-mono text-[9px] uppercase tracking-wider text-brand-cocoa-light font-bold block">
                            Minimum Items Required (Floor)
                          </label>
                          <span className="text-[10px] text-brand-cocoa-light">
                            Minimum total pieces customer must select before checkout is allowed
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            max="100"
                            disabled={currentRole === 'viewer' || currentRole === 'chef'}
                            value={editBoxMinItems}
                            onChange={(e) => setEditBoxMinItems(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-20 px-2.5 py-1 text-xs font-mono font-bold text-brand-cocoa border border-brand-cocoa-border rounded-lg bg-white text-center disabled:bg-gray-100 disabled:cursor-not-allowed"
                          />
                          <span className="text-xs text-brand-cocoa-light font-mono">items</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* CHAGE PRODUCT PRICES ROW */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between border-t border-brand-cocoa-border/40 pt-3">
                      <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-brand-cocoa flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5 text-brand-pink" />
                        <span>Manage Pricing Options</span>
                        {(currentRole === 'chef' || currentRole === 'viewer') && (
                          <span className="font-mono text-[8px] text-brand-pink-dark font-extrabold bg-brand-pink-light/60 px-2 py-0.5 rounded flex items-center gap-0.5 border border-brand-pink-accent/20 ml-2">
                            <Lock className="w-2.5 h-2.5" /> LOCKED
                          </span>
                        )}
                      </h4>
                      <span className="text-[9px] font-mono text-brand-cocoa-light">
                        (e.g., By weight or count)
                      </span>
                    </div>

                    {/* Pricing lists edit block */}
                    <div className="bg-brand-cream-light/45 p-3 rounded-xl border border-brand-cocoa-border/40 space-y-2">
                      <div className="max-h-[140px] overflow-y-auto space-y-1.5 pr-1">
                        {editPriceOptions.map((opt, index) => (
                          <div key={`edit-price-${opt.label}-${index}`} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-brand-cocoa-border/20">
                            {/* Label label */}
                            <span className="font-sans font-bold text-xs text-brand-cocoa min-w-[70px]">
                              {opt.label}
                            </span>
                            
                            {/* Input price */}
                            <div className="relative flex-1">
                              <span className="absolute left-2.5 top-1.5 font-mono text-xs text-brand-cocoa-light">₹</span>
                              <input
                                type="number"
                                value={opt.price}
                                onChange={(e) => handleUpdatePriceOptionValue(index, parseInt(e.target.value) || 0)}
                                className="w-full pl-6 pr-2 py-1 text-xs font-mono font-bold border border-brand-cocoa-border/50 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-pink"
                              />
                            </div>

                            {/* Delete Option button */}
                            <button
                              onClick={() => handleRemovePriceOption(index)}
                              className="p-1.5 text-brand-cocoa-light hover:text-red-500 transition-colors cursor-pointer"
                              title="Delete pricing option"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Add new option row */}
                      <div className="flex items-center gap-2 pt-2 border-t border-brand-cocoa-border/30">
                        <input
                          type="text"
                          placeholder="Label (e.g. 1.5kg)"
                          value={newOptionLabel}
                          onChange={(e) => setNewOptionLabel(e.target.value)}
                          className="w-1/3 px-2.5 py-1.5 text-xs font-medium border border-brand-cocoa-border rounded-lg bg-white"
                        />
                        <div className="relative flex-1">
                          <span className="absolute left-2.5 top-1.5 font-mono text-xs text-brand-cocoa-light">₹</span>
                          <input
                            type="number"
                            placeholder="Price"
                            value={newOptionPrice || ''}
                            onChange={(e) => setNewOptionPrice(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-full pl-6 pr-2 py-1.5 text-xs font-mono border border-brand-cocoa-border rounded-lg bg-white"
                          />
                        </div>
                        <button
                          onClick={handleAddPriceOption}
                          className="px-3 py-1.5 bg-brand-cocoa text-white text-xs font-bold rounded-lg hover:bg-brand-cocoa-light flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Option</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Preview Card & Display Image Preset Chooser (Col span 5) */}
                <div className="md:col-span-5 space-y-6 flex flex-col">
                  
                  {/* Live Card Preview Box */}
                  <div className="bg-white p-4.5 rounded-2xl border border-brand-cocoa-border shadow-2xs">
                    <h4 className="font-display font-bold text-xs text-brand-cocoa uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-brand-pink fill-brand-pink" />
                      <span>Live Menu Card Preview</span>
                    </h4>

                    {/* Simulating card style */}
                    <div className="bg-brand-cream-light/35 rounded-2xl border border-brand-cocoa-border overflow-hidden">
                      <div className="relative h-36 bg-brand-cream/40 flex items-center justify-center overflow-hidden">
                        {editImage ? (
                          <img src={editImage} alt="Card Preview" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex flex-col items-center justify-center p-4 text-center">
                            <ImageIcon className="w-8 h-8 text-brand-cocoa-light/60 mb-1" />
                            <span className="font-mono text-[10px] text-brand-cocoa-light">No photo provided</span>
                          </div>
                        )}
                        <span className="absolute top-2.5 right-2.5 bg-white/95 text-brand-pink-dark font-mono text-[9px] font-bold px-2 py-0.5 rounded-full border border-brand-pink-accent/20 uppercase">
                          {editCategory}
                        </span>
                      </div>
                      <div className="p-3.5 text-left">
                        <span className="font-display font-black text-xs text-brand-cocoa block truncate uppercase tracking-tight">
                          {editName || 'Untitled Pastry'}
                        </span>
                        <p className="text-[10px] text-brand-cocoa-light/90 leading-tight line-clamp-2 mt-1 min-h-[30px]">
                          {editDescription || 'Provide a beautiful description detailing gourmet ingredients.'}
                        </p>
                        
                        {/* Option pills */}
                        <div className="flex flex-wrap gap-1 mt-2.5">
                          {editPriceOptions.map((opt, i) => (
                            <span key={`edit-preview-price-${opt.label}-${i}`} className="text-[8px] font-mono bg-white text-brand-cocoa border border-brand-cocoa-border/50 px-1.5 py-0.5 rounded-md font-bold">
                              {opt.label}: ₹{opt.price}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* PICTURE OF DISPLAY PRODUCT CHANGER PRESETS */}
                  <div className="bg-white p-4.5 rounded-2xl border border-brand-cocoa-border shadow-2xs flex-1 flex flex-col">
                    <h4 className="font-display font-bold text-xs text-brand-cocoa uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-brand-pink" />
                      <span>Display Photo Library</span>
                    </h4>
                    <p className="text-[10px] text-brand-cocoa-light leading-relaxed mb-3">
                      Select a premium hand-made pastry preset from our curated high-resolution photography library to update the display photo instantly:
                    </p>

                    <div className="grid grid-cols-3 gap-2 overflow-y-auto max-h-[220px] pr-1 flex-1">
                      {PRODUCT_IMAGE_PRESETS.map((p, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSelectPicturePreset(p.url)}
                          className={`group aspect-square rounded-xl overflow-hidden border bg-brand-cream relative cursor-pointer ${
                            editImage === p.url ? 'border-brand-pink ring-2 ring-brand-pink-light' : 'border-brand-cocoa-border/50'
                          }`}
                          title={p.name}
                        >
                          <img src={p.url} alt={p.name} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <span className="text-[8px] font-bold text-white text-center p-1 leading-none">{p.name.split(' ').slice(0, 2).join(' ')}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            ) : (
              <div className="bg-white p-8 rounded-2xl border border-brand-cocoa-border text-center">
                <BadgeHelp className="w-12 h-12 text-brand-cocoa-light mx-auto mb-2" />
                <h3 className="font-display font-bold text-base text-brand-cocoa">No Active Product Selected</h3>
                <p className="text-xs text-brand-cocoa-light mt-1">Please select an item from the left panel list.</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB CONTENT: SIGNATURE CATEGORIES MANAGEMENT */}
      {adminTab === 'categories' && (
        <div className="bg-white rounded-2xl border border-brand-cocoa-border shadow-2xs overflow-hidden">
          {/* Header */}
          <div className="w-full px-6 md:px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 text-left bg-gradient-to-r from-brand-cream-light/40 via-brand-pink-light/20 to-brand-cream-light/40 border-b border-brand-cocoa-border/30">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-brand-pink/15 text-brand-pink rounded-xl shadow-3xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-brand-cocoa flex items-center gap-2">
                  <span>✨ Homepage Categories</span>
                </h3>
                <p className="text-[11px] text-brand-cocoa-light mt-0.5">
                  Manage cover images, descriptions, starting prices, and badges for each category card on the Home Page and Discover catalog.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-start md:self-auto">
              <span className="text-[10px] font-mono uppercase bg-brand-pink/10 text-brand-pink px-3 py-1 rounded-full border border-brand-pink-accent/20 font-bold">
                {categoryInfos.length} Categories Configured
              </span>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-8 text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryInfos.map((cat, idx) => {
                const preview = categoryPreviews[cat.name];
                const currentImg = cat.imageUrl || cat.image;
                const displayImg = preview !== undefined ? preview : currentImg;
                const hasImg = Boolean(displayImg && displayImg.trim() !== '');
                const isUploading = Boolean(categoryUploading[cat.name]);
                const inputState = categoryInputs[cat.name] || {};

                return (
                  <div
                    key={`cat-info-${cat.name}-${idx}`}
                    className="bg-brand-cream-light/20 rounded-2xl border border-brand-cocoa-border/60 p-5 space-y-4 hover:border-brand-pink/50 transition-all flex flex-col justify-between"
                  >
                    {/* Category Header */}
                    <div className="flex items-center justify-between border-b border-brand-cocoa-border/30 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl p-1.5 bg-white rounded-xl border border-brand-cocoa-border/40 shadow-3xs">
                          {cat.emoji || '✨'}
                        </span>
                        <div>
                          <h4 className="font-display font-extrabold text-sm text-brand-cocoa uppercase tracking-tight">
                            {cat.name}
                          </h4>
                          <span className="text-[9px] font-mono text-brand-cocoa-light/80 block">
                            {inputState.itemCountText ?? cat.itemCountText}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-brand-pink bg-brand-pink/10 px-2.5 py-1 rounded-full border border-brand-pink/20">
                        From ₹{inputState.startingPrice ?? cat.startingPrice}
                      </span>
                    </div>

                    {/* Cover Image Preview Box */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="font-mono text-[9px] uppercase tracking-wider text-brand-cocoa-light/90 font-bold">
                          Cover Photo
                        </label>
                        {preview !== undefined && (
                          <span className="text-[9px] font-mono text-brand-pink font-extrabold animate-pulse">
                            ⚡ LIVE PREVIEW (UNSAVED)
                          </span>
                        )}
                      </div>

                      <div className="relative h-44 rounded-xl border border-brand-cocoa-border overflow-hidden bg-brand-cream-light/60 group">
                        {hasImg ? (
                          <img
                            src={displayImg}
                            alt={cat.name}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-brand-cream via-brand-pink-light/30 to-brand-cream-light flex flex-col items-center justify-center p-4 text-center">
                            <div className="w-12 h-12 rounded-full bg-white/90 border border-brand-pink/30 flex items-center justify-center text-2xl shadow-sm mb-1.5">
                              {cat.emoji || '✨'}
                            </div>
                            <span className="text-[10px] font-mono text-brand-cocoa-light font-bold">
                              Clean Soft Placeholder
                            </span>
                            <span className="text-[9px] text-brand-cocoa-light/60 font-mono">
                              (No custom image uploaded)
                            </span>
                          </div>
                        )}

                        {isUploading && (
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white text-xs font-bold gap-2">
                            <Loader2 className="w-6 h-6 animate-spin text-brand-pink" />
                            <span>Compressing Image...</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Description & Price inputs */}
                    <div className="space-y-3">
                      <div>
                        <label className="font-mono text-[9px] uppercase tracking-wider text-brand-cocoa-light/90 block font-bold mb-1">
                          Category Description
                        </label>
                        <textarea
                          rows={2}
                          value={inputState.description ?? cat.description}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCategoryInputs((prev) => ({
                              ...prev,
                              [cat.name]: { ...prev[cat.name], description: val },
                            }));
                          }}
                          className="w-full text-xs p-2 rounded-lg border border-brand-cocoa-border bg-white text-brand-cocoa focus:outline-none focus:ring-1 focus:ring-brand-pink"
                          placeholder="Category description..."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="font-mono text-[9px] uppercase tracking-wider text-brand-cocoa-light/90 block font-bold mb-1">
                            Starting Price (₹)
                          </label>
                          <input
                            type="number"
                            value={inputState.startingPrice ?? cat.startingPrice}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setCategoryInputs((prev) => ({
                                ...prev,
                                [cat.name]: { ...prev[cat.name], startingPrice: val },
                              }));
                            }}
                            className="w-full text-xs p-2 rounded-lg border border-brand-cocoa-border bg-white text-brand-cocoa focus:outline-none focus:ring-1 focus:ring-brand-pink font-mono"
                          />
                        </div>

                        <div>
                          <label className="font-mono text-[9px] uppercase tracking-wider text-brand-cocoa-light/90 block font-bold mb-1">
                            Badge Text
                          </label>
                          <input
                            type="text"
                            value={inputState.itemCountText ?? cat.itemCountText}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCategoryInputs((prev) => ({
                                ...prev,
                                [cat.name]: { ...prev[cat.name], itemCountText: val },
                              }));
                            }}
                            className="w-full text-xs p-2 rounded-lg border border-brand-cocoa-border bg-white text-brand-cocoa focus:outline-none focus:ring-1 focus:ring-brand-pink"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Upload & Action Controls */}
                    <div className="space-y-2 pt-2 border-t border-brand-cocoa-border/30">
                      <input
                        type="file"
                        id={`cat-file-upload-${cat.name.replace(/\s+/g, '-')}`}
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => handleCategoryFileSelect(cat.name, e)}
                      />

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => document.getElementById(`cat-file-upload-${cat.name.replace(/\s+/g, '-')}`)?.click()}
                          disabled={isUploading}
                          className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-brand-pink hover:bg-brand-pink-dark text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-3xs uppercase tracking-wider"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{hasImg ? 'Change Photo' : 'Upload Photo'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSaveCategory(cat.name)}
                          disabled={isUploading}
                          className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-brand-cocoa hover:bg-brand-cocoa-light text-brand-cream text-xs font-bold rounded-xl transition-all cursor-pointer shadow-3xs uppercase tracking-wider"
                        >
                          <CheckCircle className="w-3.5 h-3.5 text-brand-pink" />
                          <span>Save Category</span>
                        </button>
                      </div>

                      {hasImg && (
                        <button
                          type="button"
                          onClick={() => handleRemoveCategoryImage(cat.name)}
                          className="w-full text-center text-[10px] font-mono font-bold text-red-600 hover:text-red-700 hover:underline py-1 cursor-pointer block"
                        >
                          Remove Photo (Use Soft Placeholder)
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Global Action Footer */}
            <div className="pt-4 border-t border-brand-cocoa-border/40 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-brand-cocoa-light leading-relaxed">
                ✨ Category cover photos are automatically resized and compressed to optimized dimensions, converting to lightweight data URLs stored locally.
              </p>
              <button
                onClick={() => {
                  categoryInfos.forEach((c) => handleSaveCategory(c.name));
                  addToast('All Categories Saved', 'All category photos and configurations updated successfully!', 'success');
                }}
                className="px-6 py-3 bg-brand-cocoa text-brand-cream text-xs font-extrabold rounded-xl hover:bg-brand-cocoa-light transition-all cursor-pointer shadow-md uppercase tracking-wider shrink-0 flex items-center gap-2"
              >
                <Save className="w-4 h-4 text-brand-pink" />
                <span>Save All Categories</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: BRANDING & LOGO DESIGNER */}
      {adminTab === 'branding' && (
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-brand-cocoa-border shadow-2xs max-w-4xl">
          <div className="border-b border-brand-cocoa-border/40 pb-4 mb-6">
            <h3 className="font-display font-bold text-lg text-brand-cocoa flex items-center gap-2">
              <span>👑 Boutique Brand Customizer</span>
            </h3>
            <p className="text-xs text-brand-cocoa-light mt-1">
              Customize the look, name, and trademark emblem across the entire website instantly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left side: branding form */}
            <div className="space-y-5 text-left">
              <h4 className="font-sans font-extrabold text-xs text-brand-cocoa uppercase tracking-wider">
                Branding Attributes
              </h4>

              {/* Website Name */}
              <div className="space-y-1.5">
                <label className="font-mono text-[9px] uppercase tracking-wider text-brand-cocoa-light block">
                  Website Name (Uppercase)
                </label>
                <input
                  type="text"
                  value={brandNameInput}
                  onChange={(e) => setBrandNameInput(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm font-bold text-brand-cocoa border border-brand-cocoa-border rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-pink"
                  placeholder="E.g. THE FROSTING FAIRY"
                />
              </div>

              {/* Website Tagline */}
              <div className="space-y-1.5">
                <label className="font-mono text-[9px] uppercase tracking-wider text-brand-cocoa-light block">
                  Website Slogan / Tagline
                </label>
                <input
                  type="text"
                  value={brandSloganInput}
                  onChange={(e) => setBrandSloganInput(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-semibold text-brand-cocoa border border-brand-cocoa-border rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-pink"
                  placeholder="E.g. CREATING EDIBLE MAGIC"
                />
              </div>

              {/* Brand Logo URL */}
              <div className="space-y-1.5">
                <label className="font-mono text-[9px] uppercase tracking-wider text-brand-cocoa-light block">
                  Custom Logo Image URL
                </label>
                <textarea
                  rows={2}
                  value={brandLogoInput}
                  onChange={(e) => setBrandLogoInput(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-mono text-brand-cocoa border border-brand-cocoa-border rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-pink resize-none"
                  placeholder="Paste custom logo image URL here..."
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={handleSaveBranding}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-brand-cocoa text-brand-cream text-xs font-bold rounded-xl hover:bg-brand-cocoa-light transition-all cursor-pointer shadow-md uppercase tracking-wider"
                >
                  <CheckCircle className="w-4 h-4 text-brand-pink" />
                  <span>Update Global Branding Settings</span>
                </button>
              </div>
            </div>

            {/* Right side: Logo Preset Gallery */}
            <div className="space-y-4">
              <h4 className="font-sans font-extrabold text-xs text-brand-cocoa uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-pink fill-brand-pink" />
                <span>Change Website Logo Presets</span>
              </h4>
              <p className="text-xs text-brand-cocoa-light leading-relaxed">
                Click on any custom emblem preset below or upload your own to set it as the live website logo:
              </p>

              {/* Current preview */}
              <div className="flex items-center gap-4 bg-brand-cream-light/40 p-4 rounded-2xl border border-brand-cocoa-border/40">
                <div className="w-16 h-16 rounded-full border border-brand-cocoa-border bg-white overflow-hidden shadow-sm flex items-center justify-center shrink-0">
                  <img src={brandLogoInput} alt="Current brand logo" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                </div>
                <div className="text-left">
                  <span className="font-display font-black text-sm text-brand-cocoa block uppercase">
                    {brandNameInput || 'THE FROSTING FAIRY'}
                  </span>
                  <span className="font-mono text-[8px] text-brand-pink-dark font-bold block">
                    {brandSloganInput || 'CREATING EDIBLE MAGIC'}
                  </span>
                  <span className="text-[9px] font-mono text-brand-cocoa-light/80 block mt-1">
                    Live site headers will use this emblem
                  </span>
                </div>
              </div>

              {/* Drag-and-drop File Upload Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDraggingLogo(true); }}
                onDragLeave={() => setIsDraggingLogo(false)}
                onDrop={handleLogoDrop}
                onClick={() => document.getElementById('logo-file-upload')?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-4.5 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
                  isDraggingLogo
                    ? 'border-brand-pink bg-brand-pink-light/25 scale-[0.98]'
                    : 'border-brand-cocoa-border/65 bg-brand-cream-light/10 hover:border-brand-pink hover:bg-brand-cream-light/40'
                }`}
              >
                <input
                  type="file"
                  id="logo-file-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleLogoFile(e.target.files[0]);
                    }
                  }}
                />
                <div className={`p-2.5 rounded-full mb-2 transition-transform ${isDraggingLogo ? 'scale-110 bg-brand-pink text-white' : 'bg-white text-brand-cocoa-light border border-brand-cocoa-border/40'}`}>
                  <Upload className="w-5 h-5" />
                </div>
                <span className="font-sans font-bold text-xs text-brand-cocoa block">
                  Upload Custom Brand Emblem
                </span>
                <span className="text-[10px] text-brand-cocoa-light/90 mt-0.5 max-w-[280px] leading-relaxed block">
                  Drag and drop PNG, JPG, or SVG logo here, or <span className="text-brand-pink font-semibold hover:underline">browse files</span>
                </span>
                <span className="text-[8px] font-mono text-brand-cocoa-light/65 mt-1 block">
                  Optimized for small screens (Max 1.5MB)
                </span>
              </div>

              {/* Grid of logo presets including custom uploads */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[260px] overflow-y-auto pr-1">
                {[
                  ...uploadedLogoPresets.map(p => ({ ...p, isUploaded: true })),
                  ...LOGO_PRESETS.map(p => ({ ...p, isUploaded: false }))
                ].map((l, index) => {
                  const isActive = brandLogoInput === l.url;
                  return (
                    <div
                      key={`logo-preset-${l.name}-${index}`}
                      onClick={() => handleApplyLogoPreset(l.url, l.name)}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer relative group ${
                        isActive
                          ? 'border-brand-pink bg-brand-pink-light/10 ring-1 ring-brand-pink'
                          : 'border-brand-cocoa-border/40 bg-white hover:bg-brand-cream-light/45'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full border border-brand-cocoa-border/30 overflow-hidden bg-white shrink-0">
                        <img src={l.url} alt={l.name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <span className="font-sans font-bold text-[11px] text-brand-cocoa truncate block">
                            {l.name}
                          </span>
                          {l.isUploaded && (
                            <span className="font-mono text-[7px] font-bold text-brand-pink bg-brand-pink-light/60 px-1 rounded uppercase tracking-wider shrink-0">
                              custom
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] font-mono text-brand-cocoa-light block truncate">
                          {l.desc}
                        </span>
                      </div>
                      {l.isUploaded && (
                        <button
                          onClick={(e) => handleRemoveUploadedLogo(e, l.url)}
                          className="p-1 rounded-full text-brand-cocoa-light hover:text-red-500 hover:bg-brand-cream-light transition-colors cursor-pointer shrink-0"
                          title="Delete custom logo"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB CONTENT: CUSTOMER ORDERS QUEUE */}
      {adminTab === 'orders' && (
        <div className="space-y-6 animate-fade-in text-left">
          {/* Section Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-brand-cocoa-border shadow-3xs text-left">
              <span className="font-mono text-[9px] uppercase font-bold text-brand-cocoa-light">Total Custom Orders</span>
              <span className="font-display font-black text-2xl text-brand-cocoa block mt-1">{mealPlan.length}</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-brand-cocoa-border shadow-3xs text-left">
              <span className="font-mono text-[9px] uppercase font-bold text-amber-600">Pending Orders</span>
              <span className="font-display font-black text-2xl text-amber-600 block mt-1">
                {mealPlan.filter(o => o.status === 'Pending' || !o.status).length}
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-brand-cocoa-border shadow-3xs text-left">
              <span className="font-mono text-[9px] uppercase font-bold text-brand-pink">Baking (In Oven)</span>
              <span className="font-display font-black text-2xl text-brand-pink block mt-1">
                {mealPlan.filter(o => o.status === 'Baking').length}
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-brand-cocoa-border shadow-3xs text-left">
              <span className="font-mono text-[9px] uppercase font-bold text-emerald-600">Dispatched / Ready</span>
              <span className="font-display font-black text-2xl text-emerald-600 block mt-1">
                {mealPlan.filter(o => o.status === 'Ready for Pickup' || o.status === 'Out for Delivery' || o.status === 'Ready').length}
              </span>
            </div>
          </div>

          {/* Search and Filters bar */}
          <div className="bg-white p-4 rounded-2xl border border-brand-cocoa-border flex flex-col md:flex-row gap-4 items-center justify-between shadow-3xs">
            <div className="relative w-full md:max-w-md">
              <Search className="w-4 h-4 text-brand-cocoa-light absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search orders by customer name, phone, cake type..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs font-semibold text-brand-cocoa border border-brand-cocoa-border rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-pink"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto shrink-0">
              <span className="font-sans font-bold text-xs text-brand-cocoa shrink-0">Status:</span>
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value as any)}
                className="flex-1 md:flex-initial px-3 py-2 text-xs font-bold text-brand-cocoa border border-brand-cocoa-border rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-pink bg-white cursor-pointer"
              >
                <option value="all">All Orders</option>
                <option value="Pending">Pending ✉️</option>
                <option value="Confirmed">Confirmed 🤝</option>
                <option value="Baking">In Oven 🥣</option>
                <option value="Ready for Pickup">Ready for Pickup 🏪</option>
                <option value="Out for Delivery">Out for Delivery 🛵</option>
                <option value="Completed">Completed 🎉</option>
              </select>

              {mealPlan.some(o => o.paymentMethod === 'COD') && (
                <button
                  onClick={async () => {
                    if (currentRole === 'viewer') {
                      triggerToast('❌ Permission Denied.');
                      return;
                    }
                    const codOrders = mealPlan.filter(o => o.paymentMethod === 'COD');
                    let count = 0;
                    for (const ord of codOrders) {
                      try {
                        await updateDoc(doc(db, 'orders', ord.id), { paymentMethod: 'Card' });
                        count++;
                      } catch (err) {
                        console.warn('Error updating order:', err);
                      }
                    }
                    addAuditLog(`Converted ${count} COD orders to Card payment`, 'info');
                    triggerToast(`✨ Converted ${count} Cash on Delivery order(s) to Card/Online payment!`);
                  }}
                  className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white font-sans font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-1 shrink-0"
                  title="Convert all COD orders to Card payment"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Convert COD Orders to Card</span>
                </button>
              )}
            </div>
          </div>

          {/* Email Notification Simulation Dashboard */}
          <div className="bg-white rounded-2xl border border-brand-cocoa-border overflow-hidden shadow-xs mb-6">
            <button
              onClick={() => setIsEmailCenterExpanded(!isEmailCenterExpanded)}
              className="w-full px-5 py-4 bg-brand-cream-light/30 flex items-center justify-between border-b border-brand-cocoa-border/40 hover:bg-brand-cream-light/50 transition-all cursor-pointer text-left"
            >
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-brand-pink-light/70 text-brand-pink text-xs">📧</span>
                <div>
                  <h4 className="font-display font-black text-xs uppercase tracking-wider text-brand-cocoa">
                    Boutique Email Notification Center <span className="text-[10px] text-brand-pink font-sans font-bold normal-case ml-2 bg-brand-pink-light/80 px-2 py-0.5 rounded-full">Simulator Mode</span>
                  </h4>
                  <p className="text-[10px] text-brand-cocoa-light mt-0.5 font-medium leading-none">
                    Configure customer receipts, test triggers, and review delivery logs instantly.
                  </p>
                </div>
              </div>
              <span className="text-brand-cocoa-light text-xs font-bold font-mono">
                {isEmailCenterExpanded ? '[ COLLAPSE ]' : '[ EXPAND ]'}
              </span>
            </button>

            {isEmailCenterExpanded && (
              <div className="p-5 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 divide-y lg:divide-y-0 lg:divide-x divide-brand-cocoa-border/40 text-left text-brand-cocoa">
                {/* Left side: Configuration & Live Trigger */}
                <div className="lg:col-span-7 space-y-5 lg:pr-6">
                  <div>
                    <h5 className="font-display font-bold text-xs uppercase tracking-wider text-brand-pink mb-1">
                      1. Customize Automated Receipt Template
                    </h5>
                    <p className="text-[10px] text-brand-cocoa-light leading-normal">
                      Update custom email variables below. These will propagate to the receipt simulation preview.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-mono text-[9px] uppercase tracking-wider font-bold text-brand-cocoa-light block">
                        Email Subject Line
                      </label>
                      <input
                        type="text"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        placeholder="Subject Line"
                        className="w-full px-3 py-2 text-xs font-semibold text-brand-cocoa border border-brand-cocoa-border rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-pink bg-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-mono text-[9px] uppercase tracking-wider font-bold text-brand-cocoa-light block">
                        Email Custom Banner Greeting
                      </label>
                      <input
                        type="text"
                        value={emailHeader}
                        onChange={(e) => setEmailHeader(e.target.value)}
                        placeholder="Banner Greeting"
                        className="w-full px-3 py-2 text-xs font-semibold text-brand-cocoa border border-brand-cocoa-border rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-pink bg-white"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-brand-cocoa-border/10">
                    <div className="mb-2">
                      <h5 className="font-display font-bold text-xs uppercase tracking-wider text-brand-pink mb-1">
                        2. Test Order Confirmation dispatch
                      </h5>
                      <p className="text-[10px] text-brand-cocoa-light leading-normal">
                        Select any active customer order from the storefront and trigger an immediate test confirmation receipt email!
                      </p>
                    </div>

                    {mealPlan.length === 0 ? (
                      <div className="p-4 rounded-xl border border-dashed border-brand-cocoa-border text-center text-xs text-brand-cocoa-light">
                        No orders are currently available to test. Create one on the storefront!
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="font-mono text-[9px] uppercase tracking-wider font-bold text-brand-cocoa-light block">
                          Select Customer Target Order
                        </label>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <select
                            id="test-order-select"
                            className="flex-1 px-3 py-2 bg-white border border-brand-cocoa-border rounded-xl text-xs font-bold text-brand-cocoa focus:outline-none focus:ring-1 focus:ring-brand-pink cursor-pointer"
                            onChange={(e) => {
                              const found = mealPlan.find(o => o.id === e.target.value);
                              if (found) setSelectedEmailPreviewOrder(found);
                            }}
                            defaultValue=""
                          >
                            <option value="" disabled>-- Select an active customer order --</option>
                            {mealPlan.map((o, idx) => (
                              <option key={`meal-opt-${o.id}-${idx}`} value={o.id}>
                                #{o.id} - {o.customerName || o.contactName || 'Anonymous'} ({o.cakeType})
                              </option>
                            ))}
                          </select>

                          <button
                            onClick={() => {
                              const selectEl = document.getElementById('test-order-select') as HTMLSelectElement;
                              const selectedId = selectEl?.value;
                              const found = mealPlan.find(o => o.id === selectedId) || mealPlan[0];
                              if (found) {
                                setSelectedEmailPreviewOrder(found);
                              } else {
                                triggerToast('Please select or submit an order to trigger confirmation.');
                              }
                            }}
                            className="px-4 py-2 bg-brand-pink hover:bg-brand-pink-dark text-white font-sans font-bold text-xs rounded-xl transition-all shadow-xs shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Mail className="w-4 h-4" />
                            <span>Preview & Send Confirmation</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right side: Simulation Dispatch Logs */}
                <div className="lg:col-span-5 space-y-4 pt-5 lg:pt-0 lg:pl-6">
                  <div className="flex items-center justify-between border-b border-brand-cocoa-border/40 pb-2">
                    <div>
                      <h5 className="font-display font-bold text-xs uppercase tracking-wider text-brand-cocoa">
                        Delivery Logs
                      </h5>
                      <p className="text-[9px] text-brand-cocoa-light mt-0.5">
                        Simulated live mail transmission status logs.
                      </p>
                    </div>
                    {sentEmails.length > 0 && (
                      <button
                        onClick={() => {
                          setSentEmails([]);
                          addAuditLog('Simulated email dispatch history cleared', 'info');
                          triggerToast('Email logs cleared.');
                        }}
                        className="text-[9px] text-brand-pink hover:text-brand-pink-dark font-mono font-bold uppercase cursor-pointer"
                      >
                        Clear logs
                      </button>
                    )}
                  </div>

                  <div className="max-h-[220px] overflow-y-auto space-y-2.5 pr-1 divide-y divide-brand-cocoa-border/20">
                    {sentEmails.length === 0 ? (
                      <div className="py-8 text-center text-xs text-brand-cocoa-light/80 italic font-medium">
                        No emails dispatched yet in this session. Click "Send Order Confirmation" above or on an order card.
                      </div>
                    ) : (
                      sentEmails.map((mail, idx) => (
                        <div key={`sent-mail-${mail.id}-${idx}`} className="pt-2.5 first:pt-0 flex flex-col gap-1 text-[11px] text-left">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[9px] text-brand-cocoa-light">[{mail.time}] ID: #{mail.id}</span>
                            <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 font-mono font-bold text-[8px] px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-900/30">
                              ● {mail.status}
                            </span>
                          </div>
                          <div className="font-sans font-bold text-brand-cocoa truncate">
                            {mail.recipientName} ({mail.recipientEmail})
                          </div>
                          <div className="font-mono text-[10px] text-brand-cocoa-light truncate">
                            Subj: {mail.subject}
                          </div>
                          <div className="font-sans text-[10px] text-brand-pink font-semibold">
                            Confirmed Items: {mail.cakeType} (Order #{mail.orderId})
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Orders list container */}
          <div className="space-y-4">
            {filteredOrders.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-brand-cocoa-border">
                <span className="text-3xl block">🎂</span>
                <h4 className="font-display font-black text-sm text-brand-cocoa uppercase tracking-wider mt-4">No Matching Orders Found</h4>
                <p className="text-xs text-brand-cocoa-light mt-1">Adjust search parameters or create a custom order from the storefront.</p>
              </div>
            ) : (
              filteredOrders.map((order, idx) => {
                const currentStatus = order.status || 'Pending';
                return (
                  <div key={`admin-order-${order.id}-${idx}`} className="bg-white border border-brand-cocoa-border rounded-2xl p-5 md:p-6 shadow-3xs relative overflow-hidden flex flex-col md:flex-row md:items-start justify-between gap-6 hover:shadow-2xs transition-all duration-200">
                    
                    {/* Status side indicator bar */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                      currentStatus === 'Pending' ? 'bg-amber-400' :
                      currentStatus === 'Confirmed' ? 'bg-blue-400' :
                      currentStatus === 'Baking' ? 'bg-pink-400' :
                      currentStatus === 'Ready for Pickup' ? 'bg-emerald-500' :
                      currentStatus === 'Out for Delivery' ? 'bg-indigo-500' :
                      'bg-gray-400'
                    }`} />

                    <div className="flex-1 space-y-4">
                      {/* Order Metadata and Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-cream-light/80 pb-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[10px] font-bold text-brand-pink bg-brand-pink-light/60 px-2 py-0.5 rounded uppercase tracking-wider">
                            Order #{order.id}
                          </span>
                          {order.pickupDate && (
                            <span className="font-mono text-[9px] text-brand-cocoa-light/90 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-brand-cocoa-light" />
                              {order.pickupDate} {order.pickupTime && `@ ${order.pickupTime}`}
                            </span>
                          )}
                          <span className={`font-sans font-bold text-[9px] border px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            currentStatus === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            currentStatus === 'Confirmed' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            currentStatus === 'Baking' ? 'bg-pink-50 text-brand-pink border-brand-pink/20' :
                            currentStatus === 'Ready for Pickup' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            currentStatus === 'Out for Delivery' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                            'bg-gray-50 text-gray-500 border-gray-200'
                          }`}>
                            {currentStatus}
                          </span>
                        </div>

                        <button
                          onClick={() => handleDeleteOrderClick(order)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-sans font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200/80 rounded-lg transition-all cursor-pointer shadow-3xs"
                          title="Delete order card"
                        >
                          <Trash2 className="w-3 h-3 text-red-500" />
                          <span>Delete Order</span>
                        </button>
                      </div>

                      {/* Cake details info layout */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-y border-brand-cream/60 py-3 text-left">
                        <div>
                          <span className="font-mono text-[8px] uppercase tracking-wider text-brand-cocoa-light block font-bold">Pastry Item</span>
                          <span className="font-sans font-bold text-xs text-brand-cocoa block mt-0.5">{order.cakeType}</span>
                        </div>
                        <div>
                          <span className="font-mono text-[8px] uppercase tracking-wider text-brand-cocoa-light block font-bold">Filling & Buttercream</span>
                          <span className="font-sans text-xs text-brand-cocoa block mt-0.5 font-medium">{order.flavor || 'Signature Standard'}</span>
                        </div>
                        <div>
                          <span className="font-mono text-[8px] uppercase tracking-wider text-brand-cocoa-light block font-bold">Specifications</span>
                          <span className="font-sans text-xs text-brand-cocoa block mt-0.5 font-medium">Weight: {order.weight || 'Standard'} | Qty: 1</span>
                        </div>
                      </div>

                      {order.boxContents && order.boxContents.length > 0 && (
                        <div className="bg-brand-pink-light/25 border border-brand-pink/20 rounded-xl p-3 text-left space-y-1.5">
                          <span className="font-mono text-[9px] uppercase tracking-wider text-brand-pink-dark block font-bold flex items-center gap-1.5">
                            <span>🎁</span> Assorted Box Manifest (Customer Custom Choices):
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {order.boxContents.map((content, bIdx) => (
                              <span
                                key={`admin-order-box-${bIdx}`}
                                className="text-xs font-sans font-semibold text-brand-cocoa bg-white border border-brand-cocoa-border/50 px-2.5 py-1 rounded-lg shadow-3xs flex items-center gap-1.5"
                              >
                                <span className="font-bold text-brand-pink bg-brand-pink-light/60 px-1.5 py-0.5 rounded text-[11px]">{content.quantity}x</span>
                                <span>{content.name}</span>
                                {content.price !== undefined && (
                                  <span className="font-mono text-[10px] text-brand-cocoa-light font-medium">
                                    (@ ₹{content.price} = ₹{content.price * content.quantity})
                                  </span>
                                )}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Customer Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left text-xs">
                        <div className="space-y-1.5">
                          <span className="font-mono text-[8px] uppercase tracking-wider text-brand-cocoa-light block font-bold">Customer Profile</span>
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-brand-cocoa-light shrink-0" />
                            <span className="font-sans font-bold text-brand-cocoa">{order.customerName || order.contactName || 'Anonymous Foodie'}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-brand-cocoa-light shrink-0" />
                            <span className="font-mono text-[10px] text-brand-cocoa">{order.customerPhone || order.contactPhone || 'No contact provided'}</span>
                          </div>
                          {order.deliveryType === 'Delivery' && order.deliveryAddress && (
                            <div className="mt-1.5 p-1.5 bg-brand-pink-light/30 border border-brand-pink/15 rounded-lg text-[11px] text-brand-cocoa font-medium flex items-start gap-1.5">
                              <span className="shrink-0 text-brand-pink font-sans">📍</span>
                              <span>{order.deliveryAddress}</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-1 text-left">
                          <span className="font-mono text-[8px] uppercase tracking-wider text-brand-cocoa-light block font-bold">Special Fondant Custom Inscription</span>
                          <p className="font-serif italic text-xs text-brand-cocoa leading-relaxed bg-brand-cream-light/30 p-2 border border-brand-cocoa-border/30 rounded-xl">
                            {order.message ? `"${order.message}"` : '— No custom inscription requested —'}
                          </p>
                        </div>
                      </div>

                      {/* Internal Staff Notes Section */}
                      <div className="pt-3 border-t border-brand-cocoa-border/30 space-y-2 text-left">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <StickyNote className="w-3.5 h-3.5 text-brand-pink shrink-0" />
                            <span className="font-mono text-[9px] uppercase tracking-wider font-bold text-brand-cocoa">
                              Internal Kitchen & Staff Notes
                            </span>
                            {order.adminNotes && order.adminNotes.length > 0 && (
                              <span className="font-mono text-[8.5px] font-bold bg-brand-pink-light/70 text-brand-pink px-1.5 py-0.2 rounded-full border border-brand-pink/20">
                                {order.adminNotes.length}
                              </span>
                            )}
                          </div>

                          <button
                            onClick={() => {
                              if (currentRole === 'viewer') {
                                triggerToast('❌ Permission Denied: Read-only role cannot add notes.');
                                return;
                              }
                              setOpenNoteOrderId(openNoteOrderId === order.id ? null : order.id);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-sans font-bold text-brand-cocoa hover:text-brand-pink bg-brand-cream-light/60 hover:bg-brand-pink-light/30 border border-brand-cocoa-border/40 rounded-lg transition-all cursor-pointer shadow-3xs"
                          >
                            <Plus className="w-3 h-3 text-brand-pink" />
                            <span>Add Note</span>
                          </button>
                        </div>

                        {/* Notes List */}
                        {order.adminNotes && order.adminNotes.length > 0 ? (
                          <div className="space-y-1.5 pt-1">
                            {order.adminNotes.map((noteItem, noteIdx) => (
                              <div 
                                key={`admin-note-${order.id}-${noteIdx}`} 
                                className="group flex items-start justify-between gap-2 p-2 bg-amber-50/80 border border-amber-200/90 rounded-xl text-xs text-brand-cocoa shadow-3xs font-sans"
                              >
                                <div className="flex items-start gap-2 flex-1">
                                  <span className="text-[10px] text-amber-700 mt-0.5 shrink-0 font-bold">📌</span>
                                  <span className="leading-snug text-brand-cocoa font-medium text-[11px]">{noteItem}</span>
                                </div>
                                <button
                                  onClick={() => handleDeleteNote(order.id, idx)}
                                  className="opacity-60 hover:opacity-100 text-brand-cocoa-light hover:text-red-600 transition-opacity p-0.5 rounded cursor-pointer shrink-0"
                                  title="Delete this note"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          openNoteOrderId !== order.id && (
                            <p className="text-[10px] text-brand-cocoa-light/70 italic">No internal notes added for this order yet.</p>
                          )
                        )}

                        {/* Inline Input Box when Add Note is active */}
                        {openNoteOrderId === order.id && (
                          <div className="mt-2 p-3 bg-brand-cream-light/40 border border-brand-pink/30 rounded-xl space-y-2 text-left animate-fade-in shadow-2xs">
                            <div className="flex items-center justify-between">
                              <label className="font-mono text-[8.5px] uppercase font-bold text-brand-pink flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                <span>New Internal Note</span>
                              </label>
                              <span className="text-[9px] text-brand-cocoa-light font-mono">Visible to kitchen & staff</span>
                            </div>
                            <textarea
                              rows={2}
                              value={orderNoteInputs[order.id] || ''}
                              onChange={(e) => setOrderNoteInputs(prev => ({ ...prev, [order.id]: e.target.value }))}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleSaveNote(order.id);
                                }
                              }}
                              placeholder="Type internal note (e.g. 'Customer confirmed 3 PM pickup', 'Eggless sponge verified')..."
                              className="w-full p-2 text-xs text-brand-cocoa bg-white border border-brand-cocoa-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-pink resize-none font-sans"
                            />
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setOpenNoteOrderId(null);
                                  setOrderNoteInputs(prev => ({ ...prev, [order.id]: '' }));
                                }}
                                className="px-2.5 py-1 text-[10px] font-sans font-bold text-brand-cocoa-light hover:text-brand-cocoa cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSaveNote(order.id)}
                                className="px-3 py-1 bg-brand-pink hover:bg-brand-pink-dark text-white text-[10px] font-sans font-bold rounded-lg shadow-xs transition-all cursor-pointer flex items-center gap-1"
                              >
                                <Check className="w-3 h-3" />
                                <span>Save Note</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right side: Action Panel */}
                    <div className="flex flex-col justify-between items-stretch gap-3 shrink-0 min-w-[210px] bg-brand-cream-light/35 p-4 rounded-2xl border border-brand-cocoa-border/40 text-left">
                      <div className="space-y-1">
                        <span className="font-mono text-[8px] uppercase tracking-wider text-brand-cocoa-light block font-bold">Order Value</span>
                        <span className="font-display font-black text-lg text-brand-pink block">{order.estimatedPrice || '$45.00'}</span>
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-mono text-[8px] uppercase tracking-wider text-brand-cocoa-light block font-bold">Update Order State</label>
                        <select
                          value={currentStatus}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as any)}
                          className="w-full px-2.5 py-2 bg-white border border-brand-cocoa-border rounded-xl text-xs font-bold text-brand-cocoa focus:outline-none focus:ring-1 focus:ring-brand-pink cursor-pointer"
                        >
                          <option value="Pending">Pending ✉️</option>
                          <option value="Confirmed">Confirmed 🤝</option>
                          <option value="Baking">In Oven 🥣</option>
                          <option value="Ready for Pickup">Ready for Pickup 🏪</option>
                          <option value="Out for Delivery">Out for Delivery 🛵</option>
                          <option value="Completed">Completed 🎉</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-mono text-[8px] uppercase tracking-wider text-brand-cocoa-light block font-bold">Payment Method</label>
                        <select
                          value={order.paymentMethod || 'Card'}
                          onChange={(e) => handleUpdateOrderPaymentMethod(order.id, e.target.value as any)}
                          className="w-full px-2.5 py-1.5 bg-white border border-brand-cocoa-border rounded-xl text-xs font-semibold text-brand-cocoa focus:outline-none focus:ring-1 focus:ring-brand-pink cursor-pointer"
                        >
                          <option value="Card">💳 Credit / Debit Card</option>
                          <option value="UPI">📱 UPI / QR Scan</option>
                          <option value="COD" disabled={!cashOnDeliveryEnabled}>
                            💵 Cash on Delivery {!cashOnDeliveryEnabled ? '(Disabled)' : ''}
                          </option>
                        </select>
                      </div>

                      <div className="space-y-2 pt-1 border-t border-brand-cocoa-border/20">
                        <button
                          onClick={() => {
                            if (currentRole === 'viewer') {
                              triggerToast('❌ Permission Denied: Read-only role cannot add notes.');
                              return;
                            }
                            setOpenNoteOrderId(openNoteOrderId === order.id ? null : order.id);
                          }}
                          className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white hover:bg-brand-cream-light text-brand-cocoa border border-brand-cocoa-border font-sans font-bold text-xs rounded-xl transition-all cursor-pointer shadow-3xs"
                          title="Append an internal note to this order entry"
                        >
                          <StickyNote className="w-3.5 h-3.5 text-brand-pink" />
                          <span>{openNoteOrderId === order.id ? 'Close Note Form' : '+ Add Internal Note'}</span>
                        </button>

                        <button
                          onClick={() => setSelectedEmailPreviewOrder(order)}
                          className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-brand-pink hover:bg-brand-pink-dark text-white font-sans font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs hover:shadow-sm"
                          title="Open interactive email notification simulator for this customer"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Send Order Confirmation</span>
                        </button>

                        <button
                          onClick={async () => {
                            if (currentRole === 'viewer') {
                              triggerToast('❌ Permission Denied: Viewer role cannot delete orders.');
                              return;
                            }
                            if (window.confirm(`Are you sure you want to delete Order #${order.id}?`)) {
                              try {
                                await deleteDoc(doc(db, 'orders', order.id));
                                addAuditLog(`Deleted Order #${order.id} from Firestore`, 'warning');
                                triggerToast(`🗑️ Order #${order.id} deleted successfully!`);
                              } catch (err: any) {
                                console.error('Error deleting order:', err);
                                triggerToast('❌ Error deleting order: ' + err.message);
                              }
                            }
                          }}
                          className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-sans font-bold text-xs rounded-xl transition-all cursor-pointer shadow-3xs"
                          title="Delete this order permanently from Firestore"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Order</span>
                        </button>
                      </div>

                      <div className="border-t border-brand-cocoa-border/40 pt-2 text-[9px] text-brand-cocoa-light/80 leading-normal flex items-start gap-1">
                        <Bell className="w-3.5 h-3.5 text-brand-pink shrink-0 mt-0.5 animate-pulse" />
                        <span>Transitions to <strong>Ready for Pickup</strong> or <strong>Out for Delivery</strong> dispatch an Instagram DM alert.</span>
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: AUTHORITY & ROLE SETTINGS */}
      {adminTab === 'authority' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl animate-fade-in text-left">
          
          {/* Left Column: Google Account Authorized List Manager */}
          <div className="lg:col-span-6 bg-white p-6 md:p-8 rounded-2xl border border-brand-cocoa-border shadow-2xs flex flex-col justify-between min-h-[460px]">
            <div className="space-y-6">
              <div className="border-b border-brand-cocoa-border/40 pb-4">
                <h3 className="font-display font-bold text-base text-brand-cocoa flex items-center gap-2">
                  <Shield className="w-4.5 h-4.5 text-brand-pink" />
                  <span>Authorized Google Accounts</span>
                </h3>
                <p className="text-xs text-brand-cocoa-light mt-1">
                  Only the specific Google Accounts listed below can log in and view or modify the admin panel.
                </p>
              </div>

              {/* Active Admin Profile Card */}
              {firebaseUser && (
                <div className="p-4 bg-brand-pink-light/30 border border-brand-pink-accent/20 rounded-2xl flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-full overflow-hidden border border-brand-pink-accent/40 shrink-0 bg-brand-cocoa text-brand-cream flex items-center justify-center font-bold font-display text-sm">
                    {firebaseUser.photoURL ? (
                      <img src={firebaseUser.photoURL} alt="Admin profile" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                    ) : (
                      <span>{(firebaseUser.displayName || firebaseUser.email || 'A')[0].toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-mono text-[8px] font-bold text-brand-pink bg-white/70 border border-brand-pink-accent/20 px-2 py-0.5 rounded uppercase tracking-wider">
                      Active Administrator
                    </span>
                    <span className="font-sans font-bold text-sm text-brand-cocoa block mt-0.5 truncate">
                      {firebaseUser.displayName || 'Authorized Admin'}
                    </span>
                    <span className="font-mono text-[10px] text-brand-cocoa-light block truncate leading-none">
                      {firebaseUser.email}
                    </span>
                  </div>
                </div>
              )}

              {/* List of Authorized Firestore Accounts */}
              <div className="space-y-2">
                <span className="font-mono text-[9px] uppercase tracking-wider text-brand-cocoa-light block font-bold">
                  Firestore Authorized Admin Accounts (Enforced by Rules)
                </span>
                <div className="max-h-[180px] overflow-y-auto space-y-1.5 pr-1">
                  {authorizedAdmins.map((email, index) => {
                    const isSelf = firebaseUser && email.toLowerCase() === (firebaseUser.email || '').toLowerCase();
                    return (
                      <div key={`auth-email-manage-${email}-${index}`} className="flex items-center justify-between p-2.5 bg-brand-cream-light/45 border border-brand-cocoa-border/20 rounded-xl">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                          <span className="font-mono text-xs text-brand-cocoa truncate font-semibold">
                            {email}
                          </span>
                          {isSelf && (
                            <span className="font-mono text-[8px] font-bold text-brand-pink bg-brand-pink-light/60 px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
                              you
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-[9px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                          Firestore Verified
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>



            {/* Quick Sign Out Session Card */}
            <div className="mt-8 pt-4 border-t border-brand-cocoa-border/30">
              <button
                onClick={handleLogoutAdmin}
                className="w-full flex items-center justify-center gap-2 py-3 bg-brand-pink text-white text-xs font-bold rounded-xl hover:bg-brand-pink-dark transition-all cursor-pointer shadow-md uppercase tracking-wider"
              >
                <Lock className="w-4 h-4" />
                <span>Sign Out of Admin Console</span>
              </button>
            </div>
          </div>

          {/* Right Column: Role Based Authority (RBAC Simulator) */}
          <div className="lg:col-span-6 bg-white p-6 md:p-8 rounded-2xl border border-brand-cocoa-border shadow-2xs">
            <div className="border-b border-brand-cocoa-border/40 pb-4 mb-6">
              <h3 className="font-display font-bold text-base text-brand-cocoa flex items-center gap-2">
                <Users className="w-4.5 h-4.5 text-brand-pink" />
                <span>Simulated Role-Based Authority</span>
              </h3>
              <p className="text-xs text-brand-cocoa-light mt-1">
                Toggle your active administrative role to test and experience our interactive system permission restrictions.
              </p>
            </div>

            <div className="space-y-4">
              {/* Administrator */}
              <button
                onClick={async () => {
                  if (firebaseUser?.email) {
                    const cleanEmail = firebaseUser.email.toLowerCase();
                    try {
                      await setDoc(doc(db, 'admins', cleanEmail), { email: cleanEmail, role: 'admin' }, { merge: true });
                      triggerToast('👑 Authority updated: Administrator role active in Firestore.');
                    } catch (err: any) {
                      triggerToast('❌ Firestore role update error: ' + err.message);
                    }
                  } else {
                    setCurrentRole('admin');
                  }
                  addAuditLog('Authority level set to Administrator', 'info', 'admin');
                }}
                className={`w-full text-left p-4 rounded-xl border flex items-start gap-3.5 transition-all cursor-pointer ${
                  currentRole === 'admin'
                    ? 'border-brand-pink bg-brand-pink-light/10 ring-1 ring-brand-pink'
                    : 'border-brand-cocoa-border/40 bg-white hover:bg-brand-cream-light/30'
                }`}
              >
                <div className={`p-2.5 rounded-lg shrink-0 ${currentRole === 'admin' ? 'bg-brand-pink text-white font-extrabold' : 'bg-brand-cream text-brand-cocoa-light font-extrabold'}`}>
                  👑
                </div>
                <div>
                  <span className="font-sans font-bold text-xs text-brand-cocoa block uppercase tracking-wide">
                    Owner / Administrator
                  </span>
                  <span className="text-[10px] text-brand-cocoa-light block mt-0.5 leading-relaxed">
                    Full write access: Edit product titles/prices, adjust global branding headers, change logos, and configure gatekeeper settings.
                  </span>
                </div>
              </button>

              {/* Pastry Chef */}
              <button
                onClick={async () => {
                  if (firebaseUser?.email) {
                    const cleanEmail = firebaseUser.email.toLowerCase();
                    try {
                      await setDoc(doc(db, 'admins', cleanEmail), { email: cleanEmail, role: 'chef' }, { merge: true });
                      triggerToast('👩‍🍳 Authority updated: Head Pastry Chef role active in Firestore.');
                    } catch (err: any) {
                      triggerToast('❌ Firestore role update error: ' + err.message);
                    }
                  } else {
                    setCurrentRole('chef');
                  }
                  addAuditLog('Authority level set to Head Pastry Chef', 'info', 'chef');
                }}
                className={`w-full text-left p-4 rounded-xl border flex items-start gap-3.5 transition-all cursor-pointer ${
                  currentRole === 'chef'
                    ? 'border-brand-pink bg-brand-pink-light/10 ring-1 ring-brand-pink'
                    : 'border-brand-cocoa-border/40 bg-white hover:bg-brand-cream-light/30'
                }`}
              >
                <div className={`p-2.5 rounded-lg shrink-0 ${currentRole === 'chef' ? 'bg-brand-pink text-white' : 'bg-brand-cream text-brand-cocoa-light'}`}>
                  👩‍🍳
                </div>
                <div>
                  <span className="font-sans font-bold text-xs text-brand-cocoa block uppercase tracking-wide">
                    Head Pastry Chef
                  </span>
                  <span className="text-[10px] text-brand-cocoa-light block mt-0.5 leading-relaxed">
                    Restricted content write access: Edit descriptions, categories, and display pictures. <span className="text-brand-pink-dark font-semibold">Forbidden</span> from altering pricing models, titles, or branding attributes.
                  </span>
                </div>
              </button>

              {/* Viewer / Cashier */}
              <button
                onClick={async () => {
                  if (firebaseUser?.email) {
                    const cleanEmail = firebaseUser.email.toLowerCase();
                    try {
                      await setDoc(doc(db, 'admins', cleanEmail), { email: cleanEmail, role: 'viewer' }, { merge: true });
                      triggerToast('👁️ Authority updated: Cashier/Viewer read-only active in Firestore.');
                    } catch (err: any) {
                      triggerToast('❌ Firestore role update error: ' + err.message);
                    }
                  } else {
                    setCurrentRole('viewer');
                  }
                  addAuditLog('Authority level set to Cashier / Viewer', 'info', 'viewer');
                }}
                className={`w-full text-left p-4 rounded-xl border flex items-start gap-3.5 transition-all cursor-pointer ${
                  currentRole === 'viewer'
                    ? 'border-brand-pink bg-brand-pink-light/10 ring-1 ring-brand-pink'
                    : 'border-brand-cocoa-border/40 bg-white hover:bg-brand-cream-light/30'
                }`}
              >
                <div className={`p-2.5 rounded-lg shrink-0 ${currentRole === 'viewer' ? 'bg-brand-pink text-white' : 'bg-brand-cream text-brand-cocoa-light'}`}>
                  👁️
                </div>
                <div>
                  <span className="font-sans font-bold text-xs text-brand-cocoa block uppercase tracking-wide">
                    Cashier / Viewer
                  </span>
                  <span className="text-[10px] text-brand-cocoa-light block mt-0.5 leading-relaxed">
                    Read-only authority: Full inspection of all tabs is allowed, but <span className="text-brand-pink-dark font-semibold">forbidden</span> from committing any changes or saving edits.
                  </span>
                </div>
              </button>

            </div>
          </div>

          {/* Collapsible Order Notifications Folder */}
          <div className="lg:col-span-12 bg-white rounded-2xl border border-brand-cocoa-border shadow-2xs overflow-hidden">
            {/* Header / Toggle Button */}
            <button
              onClick={() => setIsOrderNotificationsExpanded(!isOrderNotificationsExpanded)}
              className="w-full px-6 md:px-8 py-5 flex items-center justify-between text-left bg-gradient-to-r from-brand-cream-light/30 to-brand-pink-light/10 hover:from-brand-cream-light/50 hover:to-brand-pink-light/20 transition-all cursor-pointer border-b border-brand-cocoa-border/30 focus:outline-none"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-pink/10 text-brand-pink rounded-xl">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-brand-cocoa flex items-center gap-2">
                    <span>🔔 Order Notifications</span>
                  </h3>
                  <p className="text-[11px] text-brand-cocoa-light mt-0.5">
                    Configure your Instagram Professional Messaging, webhook targets, and Twilio WhatsApp alert credentials.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Secured Server Gateway
                </span>
                <span className="text-brand-cocoa-light text-xs font-bold font-mono">
                  {isOrderNotificationsExpanded ? '▲ COLLAPSE' : '▼ EXPAND'}
                </span>
              </div>
            </button>

            {isOrderNotificationsExpanded && (
              <div className="p-6 md:p-8 space-y-6 text-left">
                <div className="bg-brand-cream-light/40 border border-brand-cocoa-border/40 rounded-2xl p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">🔒</span>
                    <div className="space-y-1">
                      <h4 className="font-sans font-bold text-xs text-brand-cocoa uppercase tracking-wider">
                        Secure Server-Side Notification Gateway
                      </h4>
                      <p className="text-xs text-brand-cocoa-light leading-relaxed">
                        Twilio WhatsApp and Instagram API credentials (<strong>TWILIO_SID</strong>, <strong>TWILIO_TOKEN</strong>, <strong>INSTA_TOKEN</strong>) are configured securely via Firebase Secrets in the environment panel — exactly like your <strong>GEMINI_API_KEY</strong>.
                      </p>
                    </div>
                  </div>
                  <p className="text-[11px] text-brand-cocoa-light/80 leading-relaxed border-t border-brand-cocoa-border/20 pt-3">
                    No API keys, account tokens, or auth credentials are stored in browser local storage or exposed to client-side scripts. All notification dispatches (WhatsApp alerts, Instagram DMs, and webhook postings) are processed exclusively by server triggers during order creation and status changes.
                  </p>
                </div>

                <div className="pt-4 border-t border-brand-cocoa-border/30 flex flex-col sm:flex-row items-center justify-between p-5 bg-brand-pink-light/10 border border-brand-pink-accent/15 rounded-xl gap-4 text-left">
                  <div className="flex-1">
                    <span className="font-sans font-bold text-xs text-brand-cocoa block">
                      Verify Server Notification Dispatcher
                    </span>
                    <span className="text-[10px] text-brand-cocoa-light block leading-normal mt-0.5 max-w-xl">
                      Dispatches a secure server-side test alert through the backend notification handler. Check the Security Audit Log below to verify execution results!
                    </span>
                  </div>
                  <button
                    onClick={handleSendTestNotification}
                    className="px-5 py-2.5 bg-brand-pink text-white hover:bg-brand-pink-accent text-xs font-bold rounded-xl transition-all shadow-sm shrink-0 uppercase tracking-wider cursor-pointer"
                  >
                    ⚡ Send Test Alert
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Collapsible Payment Configuration Folder */}
          <div className="lg:col-span-12 bg-white rounded-2xl border border-brand-cocoa-border shadow-2xs overflow-hidden">
            {/* Header / Toggle Button */}
            <button
              onClick={() => setIsPaymentConfigExpanded(!isPaymentConfigExpanded)}
              className="w-full px-6 md:px-8 py-5 flex items-center justify-between text-left bg-gradient-to-r from-brand-cream-light/30 to-brand-pink-light/10 hover:from-brand-cream-light/50 hover:to-brand-pink-light/20 transition-all cursor-pointer border-b border-brand-cocoa-border/30 focus:outline-none"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-pink/10 text-brand-pink rounded-xl">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-brand-cocoa flex items-center gap-2">
                    <span>💳 Payment Configuration</span>
                  </h3>
                  <p className="text-[11px] text-brand-cocoa-light mt-0.5">
                    Configure the merchant UPI ID, instant payment QR Code, and Cash on Delivery option used by customers during checkout.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase bg-brand-pink/5 text-brand-pink px-2.5 py-1 rounded-full border border-brand-pink-accent/10 font-bold">
                  {upiIdInput || cashOnDeliveryInput ? "Active" : "Inactive"}
                </span>
                <span className="text-brand-cocoa-light text-xs font-bold font-mono">
                  {isPaymentConfigExpanded ? '▲ COLLAPSE' : '▼ EXPAND'}
                </span>
              </div>
            </button>

            {isPaymentConfigExpanded && (
              <div className="p-6 md:p-8 space-y-8 text-left">
                {/* Subsection A: Instant Online Payments (UPI) */}
                <div className="space-y-6">
                  <div className="border-b border-brand-cocoa-border/40 pb-3">
                    <h4 className="font-sans font-extrabold text-xs text-brand-pink uppercase tracking-widest flex items-center gap-2">
                      <span>⚡ Instant Online Payments (UPI)</span>
                    </h4>
                    <p className="text-[11px] text-brand-cocoa-light mt-1 leading-relaxed">
                      Configure your primary merchant UPI virtual payment address and custom QR code for instant, zero-fee direct transfers.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column: Form */}
                    <div className="space-y-5 text-left">
                      <h5 className="font-sans font-extrabold text-xs text-brand-cocoa uppercase tracking-wider">
                        Payment Attributes
                      </h5>

                      {/* Merchant UPI ID */}
                      <div className="space-y-1.5">
                        <label className="font-mono text-[9px] uppercase tracking-wider text-brand-cocoa-light block">
                          Merchant UPI ID / VPA
                        </label>
                        <input
                          type="text"
                          value={upiIdInput}
                          onChange={(e) => setUpiIdInput(e.target.value)}
                          className="w-full px-3.5 py-2 text-xs font-mono font-bold text-brand-cocoa border border-brand-cocoa-border rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-pink bg-brand-cream-light/10"
                          placeholder="E.g. thefrostingfairy@okaxis"
                        />
                      </div>

                      {/* Custom QR Code Image URL */}
                      <div className="space-y-1.5">
                        <label className="font-mono text-[9px] uppercase tracking-wider text-brand-cocoa-light block">
                          Custom QR Code Image URL
                        </label>
                        <textarea
                          rows={2}
                          value={upiQrInput}
                          onChange={(e) => setUpiQrInput(e.target.value)}
                          className="w-full px-3.5 py-2 text-xs font-mono text-brand-cocoa border border-brand-cocoa-border rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-pink resize-none bg-brand-cream-light/10"
                          placeholder="Paste custom QR code image URL here, or upload an image below..."
                        />
                      </div>
                    </div>

                    {/* Right Column: Checkout QR Code Live Preview & Drag Zone */}
                    <div className="space-y-4">
                      <h5 className="font-sans font-extrabold text-xs text-brand-cocoa uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-brand-pink fill-brand-pink" />
                        <span>Instant Checkout Card Preview</span>
                      </h5>
                      <p className="text-xs text-brand-cocoa-light leading-relaxed">
                        Below is a live preview of the payment option card that your customers see at checkout:
                      </p>

                      {/* Live Checkout Payment Card Mockup */}
                      <div className="flex flex-col items-center justify-center bg-brand-cream-light/40 p-4 rounded-2xl border border-brand-cocoa-border/40">
                        <div className="bg-white p-3.5 border border-brand-cocoa-border rounded-xl flex flex-col items-center shadow-2xs max-w-[190px] w-full">
                          <div className="w-28 h-28 bg-gray-100 border border-brand-cocoa-border/60 flex flex-col items-center justify-center rounded-lg relative overflow-hidden p-1">
                            {upiQrInput ? (
                              <img src={upiQrInput} alt="Payment QR Preview" loading="lazy" decoding="async" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-full h-full border border-dashed border-brand-pink/50 flex flex-col justify-center items-center text-center p-1 bg-brand-cream-light/40">
                                <span className="font-mono text-[7px] text-brand-cocoa-light font-bold">THE FROSTING FAIRY</span>
                                <div className="w-12 h-12 bg-brand-cocoa mt-1 rounded relative flex items-center justify-center">
                                  <span className="text-[6.5px] text-white font-black font-mono">UPI QR</span>
                                </div>
                                <span className="font-mono text-[5px] text-brand-pink-dark mt-1 truncate max-w-full">
                                  {upiIdInput || 'No UPI ID'}
                                </span>
                              </div>
                            )}
                          </div>
                          <span className="text-[8px] font-mono uppercase tracking-wider text-brand-cocoa-light mt-2 text-center block">
                            Pay ₹Grand_Total instantly
                          </span>
                          <span className="text-[7.5px] font-mono text-brand-cocoa-light/85 text-center block select-all mt-0.5 max-w-full truncate">
                            UPI ID: {upiIdInput || 'None'}
                          </span>
                        </div>
                      </div>

                      {/* Drag-and-drop QR Upload Zone */}
                      <div
                        onDragOver={(e) => { e.preventDefault(); setIsDraggingQr(true); }}
                        onDragLeave={() => setIsDraggingQr(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDraggingQr(false);
                          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                            handleQrFile(e.dataTransfer.files[0]);
                          }
                        }}
                        onClick={() => document.getElementById('qr-file-upload')?.click()}
                        className={`relative border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
                          isDraggingQr
                            ? 'border-brand-pink bg-brand-pink-light/25 scale-[0.98]'
                            : 'border-brand-cocoa-border/65 bg-brand-cream-light/10 hover:border-brand-pink hover:bg-brand-cream-light/40'
                        }`}
                      >
                        <input
                          type="file"
                          id="qr-file-upload"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleQrFile(e.target.files[0]);
                            }
                          }}
                        />
                        <div className={`p-2 rounded-full mb-1.5 transition-transform ${isDraggingQr ? 'scale-110 bg-brand-pink text-white' : 'bg-white text-brand-cocoa-light border border-brand-cocoa-border/40'}`}>
                          <Upload className="w-4 h-4" />
                        </div>
                        <span className="font-sans font-bold text-[11px] text-brand-cocoa block">
                          Drag Custom QR Code Image
                        </span>
                        <span className="text-[9px] text-brand-cocoa-light/90 mt-0.5 leading-tight block">
                          Drag QR file here, or <span className="text-brand-pink font-semibold hover:underline">browse files</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subsection B: Cash on Delivery Settings */}
                <div className="space-y-6 pt-6 border-t border-brand-cocoa-border/30">
                  <div className="border-b border-brand-cocoa-border/40 pb-3">
                    <h4 className="font-sans font-extrabold text-xs text-brand-pink uppercase tracking-widest flex items-center gap-2">
                      <span>💵 Cash on Delivery (COD)</span>
                    </h4>
                    <p className="text-[11px] text-brand-cocoa-light mt-1 leading-relaxed">
                      Enable or disable cash-based manual billing on checkout for customers picking up orders or receiving deliveries.
                    </p>
                  </div>

                  {/* Cash on Delivery Toggle Setting */}
                  <div className="flex items-center justify-between gap-4 p-4.5 bg-brand-cream-light/25 border border-brand-cocoa-border/20 rounded-2xl text-left">
                    <div className="space-y-0.5">
                      <span className="font-sans font-bold text-xs text-brand-cocoa block">
                        Allow Cash on Delivery Payment Option
                      </span>
                      <span className="text-[10px] text-brand-cocoa-light leading-relaxed block max-w-xl">
                        Allow customers to complete checkout and pay in-person with cash on pickup or delivery.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (currentRole === 'viewer') {
                          triggerToast('❌ Permission Denied: Read-only role cannot toggle settings.');
                          return;
                        }
                        setCashOnDeliveryInput(!cashOnDeliveryInput);
                      }}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        cashOnDeliveryInput ? 'bg-brand-pink' : 'bg-brand-cocoa-border'
                      }`}
                      title="Allow customers to pay with cash on delivery."
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          cashOnDeliveryInput ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Shared Action: Update Payment Settings */}
                <div className="pt-6 border-t border-brand-cocoa-border/30">
                  <button
                    onClick={handleSavePayments}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-brand-cocoa text-brand-cream text-xs font-bold rounded-xl hover:bg-brand-cocoa-light transition-all cursor-pointer shadow-md uppercase tracking-wider"
                  >
                    <CheckCircle className="w-4 h-4 text-brand-pink" />
                    <span>Update Payment Settings</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Panel: Dynamic Administrative Audit Log */}
          <div className="lg:col-span-12 bg-white p-6 rounded-2xl border border-brand-cocoa-border shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-brand-cocoa-border/40 pb-3">
              <div className="space-y-0.5">
                <h4 className="font-display font-bold text-sm text-brand-cocoa uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-brand-pink" />
                  <span>Real-Time Security Audit Logs</span>
                </h4>
                <p className="text-[10px] text-brand-cocoa-light">
                  A high-fidelity trail monitoring live role activities, permission checks, and database interactions.
                </p>
              </div>
              <button
                onClick={() => {
                  setAuditLogs([
                    { id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, time: new Date().toLocaleTimeString(), role: 'System', action: 'Audit log cleared by operator', status: 'info' }
                  ]);
                  triggerToast('📋 Audit logs cleared.');
                }}
                className="px-3 py-1 bg-brand-cream border border-brand-cocoa-border/50 text-brand-cocoa text-[10px] font-bold rounded-lg hover:bg-brand-cream-light transition-all cursor-pointer shadow-3xs uppercase tracking-wider"
              >
                Clear Log
              </button>
            </div>

            {/* Logs List */}
            <div className="max-h-[220px] overflow-y-auto font-mono text-[10px] divide-y divide-brand-cocoa-border/20 pr-1">
              {auditLogs.map((log, idx) => (
                <div key={`audit-log-all-${log.id}-${idx}`} className="py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                  <div className="flex items-start sm:items-center gap-2 min-w-0">
                    <span className="text-brand-cocoa-light shrink-0">[{log.time}]</span>
                    <span className={`px-2 py-0.5 rounded font-bold shrink-0 text-[9px] uppercase tracking-wide ${
                      log.role === 'Administrator'
                        ? 'bg-brand-pink-light/50 text-brand-pink-dark border border-brand-pink-accent/20'
                        : log.role === 'Head Pastry Chef'
                        ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                        : log.role === 'System'
                        ? 'bg-blue-50 text-blue-800 border border-blue-200'
                        : 'bg-brand-cream text-brand-cocoa-light border border-brand-cocoa-border/30'
                    }`}>
                      {log.role}
                    </span>
                    <span className="text-brand-cocoa truncate font-medium">{log.action}</span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                    {log.status === 'success' && (
                      <span className="bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded-md border border-emerald-200 uppercase text-[8px] tracking-wide flex items-center gap-1">
                        ● AUTHORIZED
                      </span>
                    )}
                    {log.status === 'warning' && (
                      <span className="bg-red-50 text-red-700 font-bold px-1.5 py-0.5 rounded-md border border-red-200 uppercase text-[8px] tracking-wide flex items-center gap-1">
                        ⚠️ ACCESS_DENIED
                      </span>
                    )}
                    {log.status === 'info' && (
                      <span className="bg-blue-50 text-blue-700 font-bold px-1.5 py-0.5 rounded-md border border-blue-200 uppercase text-[8px] tracking-wide flex items-center gap-1">
                        ℹ️ SYSTEM_EVENT
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* EMAIL PREVIEW SIMULATION MODAL OVERLAY */}
      {selectedEmailPreviewOrder && (
        <div className="fixed inset-0 bg-brand-cocoa/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in">
          <div className="bg-white border border-brand-cocoa-border rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col text-left">
            {/* Modal Header */}
            <div className="bg-brand-cream-light/45 px-6 py-4 border-b border-brand-cocoa-border/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-brand-pink-light text-brand-pink">📧</span>
                <div>
                  <h4 className="font-display font-black text-xs sm:text-sm text-brand-cocoa uppercase tracking-wider">
                    Boutique Email Dispatch Simulator
                  </h4>
                  <p className="text-[10px] text-brand-cocoa-light font-medium leading-none mt-0.5">
                    Pre-dispatch mock-up & client preview for Order #{selectedEmailPreviewOrder.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEmailPreviewOrder(null)}
                className="p-1.5 rounded-full hover:bg-brand-cream text-brand-cocoa-light hover:text-brand-cocoa transition-all cursor-pointer font-mono font-bold text-xs"
              >
                [CLOSE]
              </button>
            </div>

            {/* Email Client Shell */}
            <div className="bg-brand-cream p-4 border-b border-brand-cocoa-border/40 space-y-2 text-xs text-brand-cocoa">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-brand-cocoa-light shrink-0 w-12 text-right">From:</span>
                <span className="px-2.5 py-1 bg-white border border-brand-cocoa-border rounded-lg font-sans font-semibold text-brand-cocoa flex-1 truncate">
                  The Frosting Fairy Confectionary &lt;orders@thefrostingfairy.com&gt;
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-brand-cocoa-light shrink-0 w-12 text-right">To:</span>
                <span className="px-2.5 py-1 bg-white border border-brand-cocoa-border rounded-lg font-sans font-semibold text-brand-cocoa flex-1 truncate">
                  {selectedEmailPreviewOrder.customerName || selectedEmailPreviewOrder.contactName || 'Anonymous Foodie'} &lt;{(selectedEmailPreviewOrder.customerName || selectedEmailPreviewOrder.contactName || 'customer').toLowerCase().replace(/[^a-z0-9]/g, '') || 'customer'}@example.com&gt;
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-brand-cocoa-light shrink-0 w-12 text-right">Subject:</span>
                <span className="px-2.5 py-1 bg-white border border-brand-cocoa-border rounded-lg font-sans font-bold text-brand-cocoa flex-1 text-brand-pink truncate">
                  {emailSubject}
                </span>
              </div>
            </div>

            {/* High-Fidelity Email Confectionary Theme HTML Body */}
            <div className="flex-1 p-6 overflow-y-auto max-h-[380px] bg-white border-b border-brand-cocoa-border/40 font-sans text-brand-cocoa">
              <div className="max-w-xl mx-auto border border-brand-cocoa-border/40 rounded-2xl overflow-hidden shadow-xs bg-white text-left">
                {/* Email Banner Header */}
                <div className="bg-brand-pink p-6 text-center text-white space-y-2 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_15%,transparent_16%)] [background-size:16px_16px]" />
                  <span className="text-3xl animate-bounce inline-block">🧁</span>
                  <h3 className="font-display font-black text-base tracking-wider uppercase">
                    {websiteName || 'The Frosting Fairy'}
                  </h3>
                  <p className="font-serif italic text-xs opacity-90 leading-tight">
                    {emailHeader}
                  </p>
                </div>

                {/* Email Body Content */}
                <div className="p-6 space-y-5">
                  <div className="space-y-1">
                    <h4 className="font-sans font-bold text-sm text-brand-cocoa">
                      Sweet Greetings {selectedEmailPreviewOrder.customerName || selectedEmailPreviewOrder.contactName || 'Artisanal Connoisseur'},
                    </h4>
                    <p className="text-xs text-brand-cocoa-light leading-relaxed">
                      We have received your bespoke request and have scheduled it on our baking calendar! Our culinary artisans are already sourcing the finest organic ingredients to bring your beautiful vision to life.
                    </p>
                  </div>

                  {/* Order Receipt Details Block */}
                  <div className="bg-brand-pink-light/30 border border-brand-pink/15 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center border-b border-brand-pink/10 pb-2">
                      <span className="font-mono text-[9px] uppercase font-bold text-brand-pink">Bespoke Order Receipt</span>
                      <span className="font-mono text-[9px] font-bold text-brand-cocoa">Order ID: #{selectedEmailPreviewOrder.id}</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-brand-cocoa">{selectedEmailPreviewOrder.cakeType}</span>
                        <span className="font-mono font-bold text-brand-pink">{selectedEmailPreviewOrder.estimatedPrice || '$45.00'}</span>
                      </div>
                      <p className="text-[11px] text-brand-cocoa-light leading-relaxed">
                        Filling/Buttercream: <strong className="font-semibold text-brand-cocoa">{selectedEmailPreviewOrder.flavor || 'Signature Standard'}</strong> | Base Options: <strong className="font-semibold text-brand-cocoa">Weight {selectedEmailPreviewOrder.weight || 'Standard'}</strong>
                      </p>
                    </div>

                    {selectedEmailPreviewOrder.message && (
                      <div className="bg-white/65 p-2.5 rounded-lg border border-brand-pink/10 text-center">
                        <span className="font-mono text-[8px] uppercase tracking-wider text-brand-cocoa-light block font-bold">Fondant Custom Inscription</span>
                        <p className="font-serif italic text-xs text-brand-cocoa mt-0.5">
                          "{selectedEmailPreviewOrder.message}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Delivery Info */}
                  <div className="grid grid-cols-2 gap-4 text-[11px] text-brand-cocoa border-t border-brand-cocoa-border/40 pt-4">
                    <div className="space-y-1">
                      <span className="font-mono text-[8px] uppercase tracking-wider text-brand-cocoa-light block font-bold">Scheduled Fulfillment</span>
                      <p className="font-bold">
                        📅 {selectedEmailPreviewOrder.pickupDate || 'Scheduled soon'}
                      </p>
                      {selectedEmailPreviewOrder.pickupTime && (
                        <p className="text-brand-cocoa-light">At {selectedEmailPreviewOrder.pickupTime}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <span className="font-mono text-[8px] uppercase tracking-wider text-brand-cocoa-light block font-bold">Fulfillment Mode</span>
                      <p className="font-bold">
                        📍 {selectedEmailPreviewOrder.deliveryType || 'Store Pickup'}
                      </p>
                      {selectedEmailPreviewOrder.deliveryType === 'Delivery' && selectedEmailPreviewOrder.deliveryAddress && (
                        <p className="text-brand-cocoa-light truncate max-w-[150px]" title={selectedEmailPreviewOrder.deliveryAddress}>
                          {selectedEmailPreviewOrder.deliveryAddress}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-center pt-3 border-t border-brand-cocoa-border/40">
                    <p className="text-[10px] text-brand-cocoa-light italic font-medium leading-normal">
                      Need custom changes? Drop us an Instagram DM or reply to this receipt simulation.
                    </p>
                    <p className="text-[10px] text-brand-pink font-bold mt-1 uppercase tracking-wider">
                      {websiteSlogan || 'Where magic is baked into every layer!'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="bg-brand-cream-light/35 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-brand-cocoa-light font-medium text-center sm:text-left">
                <span className="text-brand-pink font-bold">💡</span>
                <span>Pre-flight simulation respects current theme and custom settings.</span>
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setSelectedEmailPreviewOrder(null)}
                  className="flex-1 sm:flex-initial px-4 py-2 border border-brand-cocoa-border bg-white text-brand-cocoa hover:bg-brand-cream text-xs font-bold rounded-xl transition-all cursor-pointer uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (currentRole === 'viewer') {
                      addAuditLog(`Attempted to dispatch simulated email (Blocked)`, 'warning');
                      triggerToast('❌ Permission Denied: View-only users cannot dispatch simulated alerts.');
                      return;
                    }
                    setIsSendingEmail(true);
                    addAuditLog(`Initiating high-fidelity email notification build for order #${selectedEmailPreviewOrder.id}`, 'info');

                    setTimeout(() => {
                      const recipientName = selectedEmailPreviewOrder.customerName || selectedEmailPreviewOrder.contactName || 'Anonymous Foodie';
                      const safeName = recipientName.toLowerCase().replace(/[^a-z0-9]/g, '');
                      const recipientEmail = `${safeName || 'customer'}@example.com`;

                      const newEmail = {
                        id: Math.random().toString(36).substr(2, 9).toUpperCase(),
                        recipientName,
                        recipientEmail,
                        subject: emailSubject,
                        time: new Date().toLocaleTimeString(),
                        status: 'DELIVERED' as const,
                        orderId: selectedEmailPreviewOrder.id,
                        cakeType: selectedEmailPreviewOrder.cakeType,
                      };

                      setSentEmails(prev => [newEmail, ...prev]);
                      addAuditLog(`📧 [Email Dispatched Successfully] Sent receipt to ${recipientEmail}`, 'success');
                      setIsSendingEmail(false);
                      setSelectedEmailPreviewOrder(null);
                      triggerToast(`💖 Simulated Email Confirmation sent to ${recipientEmail}!`);
                    }, 1200);
                  }}
                  disabled={isSendingEmail}
                  className="flex-1 sm:flex-initial px-5 py-2 bg-brand-pink hover:bg-brand-pink-dark text-white text-xs font-bold rounded-xl transition-all shadow-md hover:shadow-lg shrink-0 flex items-center justify-center gap-2 uppercase tracking-wider disabled:opacity-50 cursor-pointer"
                >
                  {isSendingEmail ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending Simulation...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Simulated Receipt</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ORDER DELETION CONFIRMATION DIALOG MODAL OVERLAY */}
      {orderToDelete && (
        <div className="fixed inset-0 bg-brand-cocoa/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-brand-cocoa-border rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl text-left">
            {/* Modal Header */}
            <div className="bg-red-50/90 border-b border-red-100 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-red-100 border border-red-200 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h4 className="font-display font-black text-sm text-red-950 uppercase tracking-wider">
                    Confirm Order Deletion
                  </h4>
                  <p className="text-[10px] text-red-700 font-mono font-medium">
                    Permanent removal from queue
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOrderToDelete(null)}
                className="p-1 rounded-full hover:bg-red-200/50 text-red-700 transition-colors cursor-pointer font-bold"
                title="Cancel deletion"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Content */}
            <div className="p-6 space-y-4">
              <p className="text-xs text-brand-cocoa leading-relaxed">
                Are you sure you want to permanently delete <strong className="text-brand-pink font-mono">Order #{orderToDelete.id}</strong>? This action cannot be undone and will remove all custom specifications and internal staff notes.
              </p>

              {/* Order Summary Badge */}
              <div className="p-3.5 bg-brand-cream-light/50 border border-brand-cocoa-border/40 rounded-2xl space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-brand-cocoa font-semibold">
                  <span className="text-brand-cocoa-light font-medium">Customer Name:</span>
                  <span>{orderToDelete.customerName || orderToDelete.contactName || 'Valued Customer'}</span>
                </div>
                <div className="flex items-center justify-between text-brand-cocoa font-semibold">
                  <span className="text-brand-cocoa-light font-medium">Pastry / Cake:</span>
                  <span>{orderToDelete.cakeType}</span>
                </div>
                <div className="flex items-center justify-between text-brand-cocoa font-semibold">
                  <span className="text-brand-cocoa-light font-medium">Estimated Price:</span>
                  <span className="text-brand-pink font-bold">{orderToDelete.estimatedPrice || 'N/A'}</span>
                </div>
                {orderToDelete.pickupDate && (
                  <div className="flex items-center justify-between text-brand-cocoa font-semibold">
                    <span className="text-brand-cocoa-light font-medium">Pickup / Delivery:</span>
                    <span className="font-mono text-[11px]">{orderToDelete.pickupDate}</span>
                  </div>
                )}
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl flex items-start gap-2 text-[11px] text-amber-900 leading-normal">
                <span className="text-xs">⚠️</span>
                <span>
                  This deletion will be logged in the <strong>Security & Activity Audit Log</strong> for administrative recordkeeping.
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="bg-brand-cream-light/30 px-6 py-4 border-t border-brand-cocoa-border/40 flex items-center justify-end gap-3">
              <button
                onClick={() => setOrderToDelete(null)}
                className="px-4 py-2 text-xs font-bold text-brand-cocoa hover:text-brand-pink bg-white border border-brand-cocoa-border hover:bg-brand-cream-light rounded-xl transition-all cursor-pointer shadow-3xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteOrder}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Permanently Delete Order</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

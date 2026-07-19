import React, { useState } from 'react';
import { 
  DollarSign, 
  Image, 
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
  Bell
} from 'lucide-react';
import { Recipe, PriceOption, MealPlanEntry } from '../types';
import { motion } from 'motion/react';
import { INITIAL_RECIPES } from '../data';
import defaultLogoImg from '../assets/images/frosting_fairy_logo_1784129178255.jpg';

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
  { name: 'Princess Pink Buttercream Cake', url: 'https://images.unsplash.com/photo-1535141192574-5d4897c13636?auto=format&fit=crop&w=600&q=80' },
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
}: AdminDashboardProps) {
  const [adminTab, setAdminTab] = useState<'overview' | 'products' | 'branding' | 'authority' | 'orders'>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  // --- INSTAGRAM DM CONFIGURATION ---
  const [instaToken, setInstaToken] = useState(() => localStorage.getItem('gusto_insta_token') || '');
  const [instaRecipient, setInstaRecipient] = useState(() => localStorage.getItem('gusto_insta_recipient') || '');
  const [instaBusinessId, setInstaBusinessId] = useState(() => localStorage.getItem('gusto_insta_business_id') || '');
  const [instaWebhook, setInstaWebhook] = useState(() => localStorage.getItem('gusto_insta_webhook') || '');

  // Orders filters state
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'Pending' | 'Confirmed' | 'Baking' | 'Ready for Pickup' | 'Out for Delivery' | 'Completed'>('all');

  // Async sender for Instagram DM Webhooks or Meta API
  const dispatchInstagramDM = async (orderId: string, cakeType: string, customerName: string, status: string) => {
    const textMessage = `🔔 [THE FROSTING FAIRY] Order #${orderId} for "${customerName}" is now "${status}"! 🎂 (${cakeType})`;
    addAuditLog(`Triggered Instagram DM dispatch for status: ${status}`, 'info');

    let success = false;
    let detail = "";

    if (instaWebhook.trim()) {
      try {
        const res = await fetch(instaWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'order_status_update',
            orderId,
            cakeType,
            customerName,
            status,
            message: textMessage,
            timestamp: new Date().toISOString()
          })
        });
        if (res.ok) {
          success = true;
          detail = "Sent via Custom Webhook forwarding to Instagram DM";
        } else {
          detail = `Webhook failed with response code: ${res.status}`;
        }
      } catch (err: any) {
        detail = `Webhook connection error: ${err.message}`;
      }
    } else if (instaToken.trim() && instaRecipient.trim() && instaBusinessId.trim()) {
      try {
        const res = await fetch(`https://graph.facebook.com/v19.0/${instaBusinessId.trim()}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${instaToken.trim()}`
          },
          body: JSON.stringify({
            recipient: { id: instaRecipient.trim() },
            message: { text: textMessage }
          })
        });
        const data = await res.json();
        if (res.ok) {
          success = true;
          detail = "Sent via Facebook Meta Graph API to Instagram DM";
        } else {
          detail = `Meta Graph API error response: ${data.error?.message || 'Unknown'}`;
        }
      } catch (err: any) {
        detail = `Meta connection failure: ${err.message}`;
      }
    } else {
      detail = "Simulated successfully (Configure Webhook or Meta credentials in the 'Security & Authority' tab to route to live endpoints)";
      success = true;
    }

    if (success) {
      addAuditLog(`📱 [Instagram DM Dispatched] ${detail}`, 'success');
      addAuditLog(`DM Content: "${textMessage}"`, 'success');
    } else {
      addAuditLog(`❌ [Instagram DM Fail] ${detail}`, 'warning');
    }
  };

  // --- GOOGLE SIGN IN & ACCESS CONTROL ---
  const [googleUser, setGoogleUser] = useState<{
    email: string;
    name: string;
    picture: string;
  } | null>(() => {
    const saved = localStorage.getItem('gusto_google_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [authorizedEmails, setAuthorizedEmails] = useState<string[]>(() => {
    const saved = localStorage.getItem('gusto_authorized_emails');
    if (saved) return JSON.parse(saved);
    return ['kiddepressed03@gmail.com', 'hellofrostingfairy@gmail.com'];
  });

  const [newEmailInput, setNewEmailInput] = useState('');
  const [signInError, setSignInError] = useState('');

  const isUnlocked = googleUser !== null && authorizedEmails.map(e => e.toLowerCase()).includes(googleUser.email.toLowerCase());

  // ====================================================================================
  // SECURITY NOTICE / DISCLAIMER:
  // Role-based capabilities ('admin' | 'chef' | 'viewer') and the corresponding UI checks
  // (such as conditionally rendered buttons, disabled fields, etc.) are implemented
  // purely on the client-side for sandbox demonstration purposes. Because there is currently
  // no authenticated server-side database validation/backend check enforcing these, they
  // are UI-ONLY limits and NOT a secure permission/security boundary.
  // ====================================================================================
  // Authority role: 'admin' | 'chef' | 'viewer'
  const [currentRole, setCurrentRole] = useState<'admin' | 'chef' | 'viewer'>(() => {
    return (localStorage.getItem('gusto_current_role') as 'admin' | 'chef' | 'viewer') || 'admin';
  });

  // Audit Logs state
  interface AuditLog {
    id: string;
    time: string;
    role: string;
    action: string;
    status: 'success' | 'warning' | 'info';
  }

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('gusto_audit_logs');
    if (saved) return JSON.parse(saved);
    return [
      { id: '1', time: '09:12:05 AM', role: 'System', action: 'Boutique Security core initialized', status: 'info' },
      { id: '2', time: '09:15:30 AM', role: 'Administrator', action: 'Updated Princess Pink Buttercream Cake details', status: 'success' },
      { id: '3', time: '09:18:12 AM', role: 'Head Pastry Chef', action: 'Updated Royal Iced Swirl Cupcakes description', status: 'success' },
    ];
  });

  // Sync state modifications with localStorage
  React.useEffect(() => {
    localStorage.setItem('gusto_authorized_emails', JSON.stringify(authorizedEmails));
  }, [authorizedEmails]);

  React.useEffect(() => {
    localStorage.setItem('gusto_current_role', currentRole);
  }, [currentRole]);

  React.useEffect(() => {
    localStorage.setItem('gusto_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Initialize Google Identity Services
  React.useEffect(() => {
    const clientId = (import.meta as any).env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const initializeGsi = () => {
      const google = (window as any).google;
      if (google && google.accounts && google.accounts.id) {
        google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: any) => {
            const decoded = decodeJwt(response.credential);
            if (decoded && decoded.email) {
              const emailLower = decoded.email.toLowerCase();
              if (authorizedEmails.map(e => e.toLowerCase()).includes(emailLower)) {
                const userObj = {
                  email: decoded.email,
                  name: decoded.name || decoded.email.split('@')[0],
                  picture: decoded.picture || '',
                };
                setSignInError('');
                setGoogleUser(userObj);
                localStorage.setItem('gusto_google_user', JSON.stringify(userObj));
                addAuditLog(`Admin signed in via Google: ${decoded.email}`, 'success');
                triggerToast(`👑 Welcome, ${decoded.name || 'Admin'}!`);
              } else {
                setSignInError(`❌ Access Denied: The Google account (${decoded.email}) is not authorized.`);
                addAuditLog(`Access denied for Google account: ${decoded.email}`, 'warning');
                triggerToast('❌ Unauthorized: This Google Account does not have admin privileges.');
              }
            }
          }
        });

        const btnContainer = document.getElementById('google-signin-btn-real');
        if (btnContainer) {
          google.accounts.id.renderButton(btnContainer, {
            theme: 'outline',
            size: 'large',
            width: 280,
          });
        }
      } else {
        // Retry in case SDK takes a moment to load
        setTimeout(initializeGsi, 500);
      }
    };

    initializeGsi();
  }, [authorizedEmails]);

  const addAuditLog = (action: string, status: 'success' | 'warning' | 'info' = 'success', roleName = currentRole) => {
    const formattedRole = roleName === 'admin' ? 'Administrator' : roleName === 'chef' ? 'Head Pastry Chef' : 'Cashier/Viewer';
    const newLog: AuditLog = {
      id: Date.now().toString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      role: formattedRole,
      action,
      status
    };
    setAuditLogs(prev => [newLog, ...prev].slice(0, 50)); // Keep last 50
  };

  const handleLogoutAdmin = () => {
    setGoogleUser(null);
    localStorage.removeItem('gusto_google_user');
    addAuditLog('Admin panel signed out', 'info');
    triggerToast('🔒 Admin session secured and logged out.');
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
    setEditImage('https://images.unsplash.com/photo-1535141192574-5d4897c13636?auto=format&fit=crop&w=600&q=80'); // nice default
    setEditDescription('');
    setEditCategory('Signature Cakes');
    setEditPriceOptions([{ label: 'Standard', price: 500 }]);
  };

  const handleCreateProduct = () => {
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
      image: editImage.trim() || 'https://images.unsplash.com/photo-1535141192574-5d4897c13636?auto=format&fit=crop&w=600&q=80',
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
      details: ['Freshly baked daily', 'Handcrafted with premium ingredients'],
      isFavorite: false
    };

    setRecipes((prev) => [newRecipe, ...prev]);
    setSelectedProductId(newId);
    setIsAddingNewProduct(false);
    addAuditLog(`Created new bakery item: "${editName}"`);
    triggerToast(`✨ Successfully created "${editName}"!`);
  };

  // Temporary local edit states to prevent immediate jagged keypress rendering
  const [editName, setEditName] = useState('');
  const [editImage, setEditImage] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editPriceOptions, setEditPriceOptions] = useState<PriceOption[]>([]);
  
  // Branding states
  const [brandNameInput, setBrandNameInput] = useState(websiteName);
  const [brandSloganInput, setBrandSloganInput] = useState(websiteSlogan);
  const [brandLogoInput, setBrandLogoInput] = useState(logo);

  // Payment states
  const [upiIdInput, setUpiIdInput] = useState(upiId);
  const [upiQrInput, setUpiQrInput] = useState(upiQrCode);
  const [isDraggingQr, setIsDraggingQr] = useState(false);

  React.useEffect(() => {
    setUpiIdInput(upiId);
  }, [upiId]);

  React.useEffect(() => {
    setUpiQrInput(upiQrCode);
  }, [upiQrCode]);

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

  const handleUpdateOrderStatus = (
    orderId: string, 
    newStatus: 'Pending' | 'Confirmed' | 'Baking' | 'Ready' | 'Ready for Pickup' | 'Out for Delivery' | 'Completed'
  ) => {
    if (currentRole === 'viewer') {
      addAuditLog(`Attempted to transition status of Order #${orderId} to "${newStatus}" (Blocked)`, 'warning');
      triggerToast('❌ Permission Denied: Cashier/Viewer role is read-only.');
      return;
    }

    setMealPlan((prev) => 
      prev.map((o) => {
        if (o.id === orderId) {
          const oldStatus = o.status || 'Pending';
          addAuditLog(`Transitioned Order #${orderId} status from "${oldStatus}" to "${newStatus}"`);
          
          // Trigger Instagram DM if transitioning to 'Ready for Pickup' or 'Out for Delivery'
          if (newStatus === 'Ready for Pickup' || newStatus === 'Out for Delivery') {
            dispatchInstagramDM(orderId, o.cakeType, o.customerName || o.contactName || 'Valued Customer', newStatus);
            addToast(
              `🔔 Order Notification Sent!`, 
              `Alerted customer ${o.customerName || o.contactName || 'Valued Customer'} that order #${orderId} is ${newStatus}.`, 
              'success'
            );
          }
          
          return { ...o, status: newStatus };
        }
        return o;
      })
    );

    triggerToast(`✨ Order #${orderId} status updated to: ${newStatus}`);
  };

  // Sync edit form with selected product
  React.useEffect(() => {
    if (activeProduct && !isAddingNewProduct) {
      setEditName(activeProduct.name);
      setEditImage(activeProduct.image);
      setEditDescription(activeProduct.description);
      setEditCategory(activeProduct.category);
      setEditPriceOptions([...activeProduct.priceOptions]);
    }
  }, [selectedProductId, activeProduct, isAddingNewProduct]);

  // Handle saving product edits
  const handleSaveProduct = () => {
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

    setRecipes((prev) =>
      prev.map((r) =>
        r.id === activeProduct.id
          ? {
              ...r,
              name: editName,
              image: editImage,
              description: editDescription,
              category: editCategory,
              priceOptions: editPriceOptions,
            }
          : r
      )
    );
    addAuditLog(`Updated product "${editName}" details`);
    triggerToast(`✨ Successfully updated "${editName}"!`);
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

  // Save branding settings
  const handleSaveBranding = () => {
    if (currentRole !== 'admin') {
      addAuditLog(`Attempted to save website branding (Blocked)`, 'warning');
      triggerToast('❌ Permission Denied: Only Administrators can change global branding settings.');
      return;
    }
    if (!brandNameInput.trim()) {
      triggerToast('❌ Website brand name cannot be empty!');
      return;
    }
    setWebsiteName(brandNameInput.trim().toUpperCase());
    setWebsiteSlogan(brandSloganInput.trim().toUpperCase());
    setLogo(brandLogoInput.trim());
    addAuditLog(`Updated boutique branding title and tagline`);
    triggerToast('👑 Global Website Branding settings updated successfully!');
  };

  // Save payment settings
  const handleSavePayments = () => {
    if (currentRole !== 'admin') {
      addAuditLog(`Attempted to save payment configurations (Blocked)`, 'warning');
      triggerToast('❌ Permission Denied: Only Administrators can modify payment details.');
      return;
    }
    if (!upiIdInput.trim()) {
      triggerToast('❌ UPI ID cannot be empty!');
      return;
    }
    setUpiId(upiIdInput.trim());
    setUpiQrCode(upiQrInput.trim());
    addAuditLog(`Updated UPI payment settings: UPI ID is ${upiIdInput.trim()}`);
    triggerToast('💳 Payment settings updated successfully!');
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
              Boutique Control Panel
            </h2>
            <p className="text-xs text-brand-cocoa-light font-sans mt-1">
              This area is restricted to authorized administrative personnel. Please sign in with your Google Account to verify your authority.
            </p>
          </div>

          <div className="space-y-4 flex flex-col items-center">
            {clientId ? (
              <div className="w-full flex flex-col items-center space-y-2">
                <div id="google-signin-btn-real" className="min-h-[40px]"></div>
                <p className="text-[10px] text-brand-cocoa-light font-mono">
                  Using secure Google Identity Services
                </p>
                {signInError && (
                  <div className="w-full bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3 mt-2 text-left font-sans">
                    {signInError}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full bg-brand-cream-light/40 border border-brand-cocoa-border/40 p-4.5 rounded-2xl text-left space-y-3.5">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-red-50 text-red-800 border border-red-200 font-bold text-xs">⚠️</span>
                  <div>
                    <span className="font-sans font-bold text-xs text-brand-cocoa block">Admin Sign-In Not Configured</span>
                    <span className="text-[9px] text-brand-cocoa-light leading-none block">Missing Google Client ID</span>
                  </div>
                </div>
                <p className="text-[10px] text-brand-cocoa-light font-sans leading-relaxed">
                  Google Account administrative sign-in is not configured yet. To enable administrative access, please declare the <code className="bg-white px-1 py-0.5 rounded border font-mono font-semibold text-brand-pink-dark">VITE_GOOGLE_CLIENT_ID</code> variable in your configuration.
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-brand-cocoa-border/40 pt-4 text-left">
            <span className="font-mono text-[9px] uppercase tracking-widest text-brand-cocoa-light/80 font-bold block mb-1">
              Authorized Google Accounts:
            </span>
            <div className="flex flex-wrap gap-1">
              {authorizedEmails.map((email, idx) => (
                <span key={idx} className="font-mono text-[9px] font-semibold text-brand-pink-dark bg-brand-pink-light/50 border border-brand-pink-accent/20 px-2.5 py-0.5 rounded-full">
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
        <button
          onClick={handleResetToArtisanalDefaults}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-brand-cocoa-border text-xs font-bold text-brand-cocoa bg-white hover:bg-brand-cream-light transition-all cursor-pointer shadow-2xs shrink-0 self-start lg:self-center"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Factory Defaults</span>
        </button>
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
                Welcome back, {googleUser?.name || 'Fairy Chef'}!
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
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button
                    onClick={() => setAdminTab('products')}
                    className="p-3 bg-brand-cream-light/30 hover:bg-brand-pink-light/40 border border-brand-cocoa-border/40 rounded-xl text-center group cursor-pointer transition-all animate-none h-auto w-auto"
                  >
                    <span className="text-lg block group-hover:scale-110 transition-transform">🎂</span>
                    <span className="text-[11px] font-bold text-brand-cocoa block mt-1">Manage Menu</span>
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
                  {auditLogs.slice(0, 8).map((log) => (
                    <div key={log.id} className="text-left text-xs border-b border-brand-cream pb-2 last:border-0">
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
                filteredRecipes.map((item) => {
                  const isSelected = !isAddingNewProduct && item.id === selectedProductId;
                  const lowestPrice = Math.min(...item.priceOptions.map((o) => o.price));
                  return (
                    <button
                      key={item.id}
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
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
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
                        <option value="New Additions">New Additions</option>
                      </select>
                    </div>

                    {/* Display Picture Link */}
                    <div className="space-y-1.5">
                      <label className="font-mono text-[9px] uppercase tracking-wider text-brand-cocoa-light block">
                        Product Image URL
                      </label>
                      <input
                        type="text"
                        value={editImage}
                        onChange={(e) => setEditImage(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full px-3 py-2 text-xs font-mono text-brand-cocoa border border-brand-cocoa-border rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-pink bg-brand-cream-light/10"
                      />
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
                          <div key={index} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-brand-cocoa-border/20">
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
                          <img src={editImage} alt="Preview" className="w-full h-full object-cover" />
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
                            <span key={i} className="text-[8px] font-mono bg-white text-brand-cocoa border border-brand-cocoa-border/50 px-1.5 py-0.5 rounded-md font-bold">
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
                      <Image className="w-3.5 h-3.5 text-brand-pink" />
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
                          <img src={p.url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
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
                        <option value="New Additions">New Additions</option>
                      </select>
                    </div>

                    {/* Display Picture Link */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="font-mono text-[9px] uppercase tracking-wider text-brand-cocoa-light block">
                          Product Image URL
                        </label>
                        {currentRole === 'viewer' && (
                          <span className="font-mono text-[8px] text-brand-pink-dark font-extrabold bg-brand-pink-light/60 px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-brand-pink-accent/20">
                            <Lock className="w-2 h-2" /> LOCKED
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        disabled={currentRole === 'viewer'}
                        value={editImage}
                        onChange={(e) => setEditImage(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className={`w-full px-3 py-2 text-xs font-mono text-brand-cocoa border border-brand-cocoa-border rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-pink ${
                          currentRole === 'viewer' ? 'bg-brand-cream-light/65 text-brand-cocoa-light/80 cursor-not-allowed' : 'bg-brand-cream-light/10'
                        }`}
                      />
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
                          <div key={index} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-brand-cocoa-border/20">
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
                          <img src={editImage} alt="Card Preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex flex-col items-center justify-center p-4 text-center">
                            <Image className="w-8 h-8 text-brand-cocoa-light/60 mb-1" />
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
                            <span key={i} className="text-[8px] font-mono bg-white text-brand-cocoa border border-brand-cocoa-border/50 px-1.5 py-0.5 rounded-md font-bold">
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
                      <Image className="w-3.5 h-3.5 text-brand-pink" />
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
                          <img src={p.url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
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
                  <img src={brandLogoInput} alt="Current brand logo" className="w-full h-full object-cover" />
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
                    <button
                      key={index}
                      onClick={() => handleApplyLogoPreset(l.url, l.name)}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer relative group ${
                        isActive
                          ? 'border-brand-pink bg-brand-pink-light/10 ring-1 ring-brand-pink'
                          : 'border-brand-cocoa-border/40 bg-white hover:bg-brand-cream-light/45'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full border border-brand-cocoa-border/30 overflow-hidden bg-white shrink-0">
                        <img src={l.url} alt={l.name} className="w-full h-full object-cover" />
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
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* PAYMENT SETTINGS SECTION */}
          <div className="border-t border-brand-cocoa-border/40 mt-10 pt-8">
            <div className="pb-4 mb-6">
              <h3 className="font-display font-bold text-lg text-brand-cocoa flex items-center gap-2">
                <span>💳 Shop Payment Configuration</span>
              </h3>
              <p className="text-xs text-brand-cocoa-light mt-1">
                Configure the merchant UPI ID and instant payment QR Code used by customers during checkout.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Form */}
              <div className="space-y-5 text-left">
                <h4 className="font-sans font-extrabold text-xs text-brand-cocoa uppercase tracking-wider">
                  Payment Attributes
                </h4>

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

                <div className="pt-2">
                  <button
                    onClick={handleSavePayments}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-brand-cocoa text-brand-cream text-xs font-bold rounded-xl hover:bg-brand-cocoa-light transition-all cursor-pointer shadow-md uppercase tracking-wider"
                  >
                    <CheckCircle className="w-4 h-4 text-brand-pink" />
                    <span>Update Payment Settings</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Checkout QR Code Live Preview & Drag Zone */}
              <div className="space-y-4">
                <h4 className="font-sans font-extrabold text-xs text-brand-cocoa uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-pink fill-brand-pink" />
                  <span>Instant Checkout Card Preview</span>
                </h4>
                <p className="text-xs text-brand-cocoa-light leading-relaxed">
                  Below is a live preview of the payment option card that your customers see at checkout:
                </p>

                {/* Live Checkout Payment Card Mockup */}
                <div className="flex flex-col items-center justify-center bg-brand-cream-light/40 p-4 rounded-2xl border border-brand-cocoa-border/40">
                  <div className="bg-white p-3.5 border border-brand-cocoa-border rounded-xl flex flex-col items-center shadow-2xs max-w-[190px] w-full">
                    <div className="w-28 h-28 bg-gray-100 border border-brand-cocoa-border/60 flex flex-col items-center justify-center rounded-lg relative overflow-hidden p-1">
                      {upiQrInput ? (
                        <img src={upiQrInput} alt="Payment QR Preview" className="w-full h-full object-contain" />
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

            <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
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
            </div>
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
              filteredOrders.map((order) => {
                const currentStatus = order.status || 'Pending';
                return (
                  <div key={order.id} className="bg-white border border-brand-cocoa-border rounded-2xl p-5 md:p-6 shadow-3xs relative overflow-hidden flex flex-col md:flex-row md:items-start justify-between gap-6 hover:shadow-2xs transition-all duration-200">
                    
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
                    </div>

                    {/* Right side: Action Panel */}
                    <div className="flex flex-col justify-between items-stretch gap-4 shrink-0 min-w-[210px] bg-brand-cream-light/35 p-4 rounded-2xl border border-brand-cocoa-border/40 text-left">
                      <div className="space-y-1">
                        <span className="font-mono text-[8px] uppercase tracking-wider text-brand-cocoa-light block font-bold">Order Value</span>
                        <span className="font-display font-black text-lg text-brand-pink block">{order.estimatedPrice || '$45.00'}</span>
                      </div>

                      <div className="space-y-2">
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
              {googleUser && (
                <div className="p-4 bg-brand-pink-light/30 border border-brand-pink-accent/20 rounded-2xl flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-full overflow-hidden border border-brand-pink-accent/40 shrink-0">
                    <img src={googleUser.picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'} alt="Admin profile" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-mono text-[8px] font-bold text-brand-pink bg-white/70 border border-brand-pink-accent/20 px-2 py-0.5 rounded uppercase tracking-wider">
                      Active Administrator
                    </span>
                    <span className="font-sans font-bold text-sm text-brand-cocoa block mt-0.5 truncate">
                      {googleUser.name}
                    </span>
                    <span className="font-mono text-[10px] text-brand-cocoa-light block truncate leading-none">
                      {googleUser.email}
                    </span>
                  </div>
                </div>
              )}

              {/* Add New Email Form */}
              <div className="space-y-2">
                <label className="font-mono text-[9px] uppercase tracking-wider text-brand-cocoa-light block font-bold">
                  Authorize New Google Email Address
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="admin-email@gmail.com"
                    value={newEmailInput}
                    onChange={(e) => setNewEmailInput(e.target.value)}
                    className="flex-1 px-3.5 py-2 text-xs font-semibold text-brand-cocoa border border-brand-cocoa-border rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-pink"
                  />
                  <button
                    onClick={() => {
                      if (!newEmailInput.trim()) {
                        triggerToast('⚠️ Please enter an email address!');
                        return;
                      }
                      if (!newEmailInput.includes('@') || !newEmailInput.includes('.')) {
                        triggerToast('⚠️ Please enter a valid email address!');
                        return;
                      }
                      const emailLower = newEmailInput.trim().toLowerCase();
                      if (authorizedEmails.map(e => e.toLowerCase()).includes(emailLower)) {
                        triggerToast('⚠️ This email is already authorized!');
                        return;
                      }
                      setAuthorizedEmails(prev => [...prev, emailLower]);
                      setNewEmailInput('');
                      addAuditLog(`Authorized new Google Account: ${emailLower}`, 'success');
                      triggerToast(`✨ Successfully authorized ${emailLower}!`);
                    }}
                    className="px-4 py-2 bg-brand-cocoa text-brand-cream text-xs font-bold rounded-xl hover:bg-brand-cocoa-light transition-all cursor-pointer shadow-sm uppercase tracking-wider"
                  >
                    Authorize
                  </button>
                </div>
              </div>

              {/* List of Authorized Emails */}
              <div className="space-y-2">
                <span className="font-mono text-[9px] uppercase tracking-wider text-brand-cocoa-light block font-bold">
                  Currently Authorized Accounts
                </span>
                <div className="max-h-[160px] overflow-y-auto space-y-1.5 pr-1">
                  {authorizedEmails.map((email, index) => {
                    const isSelf = googleUser && email.toLowerCase() === googleUser.email.toLowerCase();
                    return (
                      <div key={index} className="flex items-center justify-between p-2.5 bg-brand-cream-light/45 border border-brand-cocoa-border/20 rounded-xl">
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
                        <button
                          disabled={!!isSelf || authorizedEmails.length <= 1}
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to revoke administrative access for ${email}?`)) {
                              setAuthorizedEmails(prev => prev.filter(e => e.toLowerCase() !== email.toLowerCase()));
                              addAuditLog(`Revoked Google Account authorization: ${email}`, 'info');
                              triggerToast(`🗑️ Revoked access for ${email}`);
                            }
                          }}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            isSelf || authorizedEmails.length <= 1
                              ? 'text-brand-cocoa-light/40 cursor-not-allowed'
                              : 'text-brand-cocoa-light hover:text-red-500 hover:bg-brand-cream'
                          }`}
                          title={isSelf ? 'Cannot remove yourself' : authorizedEmails.length <= 1 ? 'Cannot remove the last remaining email' : 'Revoke administrative authorization'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
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
                onClick={() => {
                  setCurrentRole('admin');
                  addAuditLog('Authority level set to Administrator', 'info', 'admin');
                  triggerToast('👑 Authority updated: Administrator role active.');
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
                onClick={() => {
                  setCurrentRole('chef');
                  addAuditLog('Authority level set to Head Pastry Chef', 'info', 'chef');
                  triggerToast('👩‍🍳 Authority updated: Head Pastry Chef role active.');
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
                onClick={() => {
                  setCurrentRole('viewer');
                  addAuditLog('Authority level set to Cashier / Viewer', 'info', 'viewer');
                  triggerToast('👁️ Authority updated: Cashier/Viewer read-only active.');
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

          {/* Instagram Notification Settings (Full Width) */}
          <div className="lg:col-span-12 bg-white p-6 md:p-8 rounded-2xl border border-brand-cocoa-border shadow-2xs space-y-6">
            <div className="border-b border-brand-cocoa-border/40 pb-4">
              <h3 className="font-display font-bold text-base text-brand-cocoa flex items-center gap-2">
                <Bell className="w-5 h-5 text-brand-pink" />
                <span>Instagram DM Notification Gateway Hub</span>
              </h3>
              <p className="text-xs text-brand-cocoa-light mt-1">
                Configure your Instagram Professional Messaging credentials or third-party webhooks (Zapier/Make/n8n) to dispatch real-time DM alerts to your admin account when custom orders are marked as Ready/Out for Delivery.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-sans font-bold text-xs text-brand-cocoa uppercase tracking-wide">
                  Option A: Custom Integration Webhook (Zapier / Make)
                </h4>
                <p className="text-[11px] text-brand-cocoa-light leading-relaxed">
                  Enter an automated webhook endpoint URL. When an order status updates to <strong className="text-emerald-600">Ready for Pickup</strong> or <strong className="text-indigo-600">Out for Delivery</strong>, we will POST JSON payloads containing complete order records and direct message copy.
                </p>

                <div className="space-y-2 text-left">
                  <label className="font-mono text-[9px] uppercase tracking-wider text-brand-cocoa-light block font-bold">
                    Automator Webhook URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://hooks.zapier.com/hooks/catch/..."
                    value={instaWebhook}
                    onChange={(e) => {
                      setInstaWebhook(e.target.value);
                      localStorage.setItem('gusto_insta_webhook', e.target.value);
                    }}
                    className="w-full px-3.5 py-2 text-xs font-semibold text-brand-cocoa border border-brand-cocoa-border rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-pink bg-white"
                  />
                  <span className="text-[9px] font-mono text-brand-cocoa-light/60 block">
                    {instaWebhook.trim() ? "✅ Live Webhook posting active." : "ℹ️ Leave empty to use simulation logs or Meta API below."}
                  </span>
                </div>
              </div>

              <div className="space-y-4 border-t md:border-t-0 md:border-l border-brand-cocoa-border/30 pt-4 md:pt-0 md:pl-6 text-left">
                <h4 className="font-sans font-bold text-xs text-brand-cocoa uppercase tracking-wide">
                  Option B: Official Meta Graph API Credentials
                </h4>
                <p className="text-[11px] text-brand-cocoa-light leading-relaxed">
                  Provide your Meta Developer App access tokens to transmit messages using the official Facebook Graph endpoints directly to your authorized Instagram accounts.
                </p>

                {/* Secure warning note for browser token storage */}
                <div className="text-[10px] text-red-700 bg-red-50 border border-red-200 px-3.5 py-2.5 rounded-xl flex items-start gap-2 leading-relaxed">
                  <span className="font-bold text-xs">⚠️</span>
                  <span>
                    <strong>Security Warning:</strong> This access token is stored in the browser's localStorage and is used in a client-side fetch, making it visible to anyone opening DevTools. This is insecure. <strong>Only use low-privilege test tokens for testing; never input a production token here.</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-mono text-[8px] uppercase tracking-wider text-brand-cocoa-light block font-bold">
                      Instagram User Access Token
                    </label>
                    <input
                      type="password"
                      placeholder="EAAGy..."
                      value={instaToken}
                      onChange={(e) => {
                        setInstaToken(e.target.value);
                        localStorage.setItem('gusto_insta_token', e.target.value);
                      }}
                      className="w-full px-3 py-1.5 text-xs font-semibold text-brand-cocoa border border-brand-cocoa-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-pink bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-mono text-[8px] uppercase tracking-wider text-brand-cocoa-light block font-bold">
                      Instagram Professional ID
                    </label>
                    <input
                      type="text"
                      placeholder="178414..."
                      value={instaBusinessId}
                      onChange={(e) => {
                        setInstaBusinessId(e.target.value);
                        localStorage.setItem('gusto_insta_business_id', e.target.value);
                      }}
                      className="w-full px-3 py-1.5 text-xs font-semibold text-brand-cocoa border border-brand-cocoa-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-pink bg-white"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-mono text-[8px] uppercase tracking-wider text-brand-cocoa-light block font-bold">
                      Admin Instagram Recipient ID (Thread / User ID)
                    </label>
                    <input
                      type="text"
                      placeholder="849204321..."
                      value={instaRecipient}
                      onChange={(e) => {
                        setInstaRecipient(e.target.value);
                        localStorage.setItem('gusto_insta_recipient', e.target.value);
                      }}
                      className="w-full px-3 py-1.5 text-xs font-semibold text-brand-cocoa border border-brand-cocoa-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-pink bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Test Connection Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-brand-pink-light/20 border border-brand-pink-accent/15 rounded-xl gap-3 text-left">
              <div className="flex-1">
                <span className="font-sans font-bold text-xs text-brand-cocoa block">
                  Verify Instagram DM Gateway
                </span>
                <span className="text-[10px] text-brand-cocoa-light block leading-normal mt-0.5 max-w-xl">
                  Dispatches a simulated status transition alert. This hits your custom configured API endpoint or automator webhook instantly. Review dispatch success or failure diagnostics in the real-time Security Audit Logs below!
                </span>
              </div>
              <button
                onClick={() => {
                  dispatchInstagramDM('TEST-ALERT-01', 'Signature Fudge Blossom', 'Jane Doe', 'Ready for Pickup');
                  triggerToast('🚀 Instagram DM Test Dispatched! Review Audit Logs below.');
                }}
                className="px-4 py-2 bg-brand-cocoa text-brand-cream hover:bg-brand-cocoa-light text-xs font-bold rounded-xl transition-all shadow-sm shrink-0 uppercase tracking-wider cursor-pointer"
              >
                Send Test DM Alert
              </button>
            </div>
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
                    { id: Date.now().toString(), time: new Date().toLocaleTimeString(), role: 'System', action: 'Audit log cleared by operator', status: 'info' }
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
              {auditLogs.map((log) => (
                <div key={log.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
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
    </div>
  );
}

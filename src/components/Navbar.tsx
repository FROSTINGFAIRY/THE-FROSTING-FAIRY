import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Calendar, 
  Heart, 
  Menu, 
  X, 
  Sparkles, 
  Mail, 
  Instagram, 
  Sun, 
  Moon, 
  MapPin, 
  User, 
  LogOut, 
  Smartphone, 
  ChevronDown, 
  ShieldCheck, 
  Home as HomeIcon, 
  Navigation, 
  Check, 
  Loader2 
} from 'lucide-react';
import { CustomerProfile } from '../types';
import CustomerMobileLogin from './CustomerMobileLogin';

interface NavbarProps {
  shoppingItemsCount: number;
  ordersCount: number;
  logo: string;
  websiteName: string;
  websiteSlogan: string;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onOpenMap?: () => void;
  customer?: CustomerProfile | null;
  onLogout?: () => void;
  onLogin?: (customer: CustomerProfile, token: string) => void;
  onUpdateProfile?: (data: Partial<CustomerProfile>) => Promise<void>;
}

export default function Navbar({
  shoppingItemsCount,
  ordersCount,
  logo,
  websiteName,
  websiteSlogan,
  theme,
  toggleTheme,
  onOpenMap,
  customer,
  onLogout,
  onLogin,
  onUpdateProfile,
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showContactDropdown, setShowContactDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // Modals for Customer account management
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  // Form states for profile & address modals
  const [profileName, setProfileName] = useState(customer?.fullName || '');
  const [deliveryTypePref, setDeliveryTypePref] = useState<'Pickup' | 'Delivery'>(customer?.preferredDeliveryType || 'Delivery');
  const [addressText, setAddressText] = useState(customer?.deliveryAddress || '');
  const [gpsCoords, setGpsCoords] = useState(customer?.gpsCoordinates || '');
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  const location = useLocation();
  const navigate = useNavigate();

  const isShopActive = location.pathname === '/shop' || location.pathname === '/menu' || location.pathname.startsWith('/product');
  const isCartActive = location.pathname === '/cart';

  // Keep local form states in sync when customer changes
  React.useEffect(() => {
    if (customer) {
      setProfileName(customer.fullName || '');
      setDeliveryTypePref(customer.preferredDeliveryType || 'Delivery');
      setAddressText(customer.deliveryAddress || '');
      setGpsCoords(customer.gpsCoordinates || '');
    }
  }, [customer]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateProfile) return;
    setIsSavingProfile(true);
    try {
      await onUpdateProfile({
        fullName: profileName.trim(),
        preferredDeliveryType: deliveryTypePref,
      });
      setSaveSuccessMsg('Profile updated successfully!');
      setTimeout(() => {
        setSaveSuccessMsg('');
        setIsProfileModalOpen(false);
      }, 1200);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateProfile) return;
    setIsSavingProfile(true);
    try {
      await onUpdateProfile({
        deliveryAddress: addressText.trim(),
        gpsCoordinates: gpsCoords.trim(),
      });
      setSaveSuccessMsg('Address saved successfully!');
      setTimeout(() => {
        setSaveSuccessMsg('');
        setIsAddressModalOpen(false);
      }, 1200);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = `${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`;
        setGpsCoords(coords);
        setIsDetectingGps(false);
      },
      (err) => {
        console.warn('GPS error:', err);
        setIsDetectingGps(false);
        alert('Could not retrieve current location. Please verify device permissions.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <nav id="website-navbar" className="bg-white border-b border-brand-cocoa-border sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* 1. Logo on the far left */}
          <div className="flex items-center">
            <NavLink
              to="/"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 group focus:outline-none cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full border border-brand-cocoa-border overflow-hidden shadow-xs group-hover:scale-105 transition-transform flex items-center justify-center bg-white shrink-0">
                <img 
                  src={logo} 
                  alt="The Frosting Fairy Logo" 
                  width="48" 
                  height="48" 
                  loading="eager" 
                  decoding="async" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="text-left">
                <span className="font-display font-black text-lg md:text-xl text-brand-cocoa tracking-tight block uppercase">
                  {websiteName}
                </span>
                <span className="text-[8px] font-mono uppercase tracking-widest text-brand-pink-dark font-bold block -mt-1.5 flex items-center gap-1">
                  <Sparkles className="w-2 h-2 text-brand-pink fill-brand-pink animate-pulse" />
                  <span>{websiteSlogan}</span>
                </span>
              </div>
            </NavLink>
          </div>

          {/* 2. Main Navigation: Home → Our Menu → Admin Panel → Contact Us */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <NavLink
              to="/"
              id="nav-link-home"
              className={({ isActive }) =>
                `px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'text-brand-pink bg-brand-pink-light/30'
                    : 'text-brand-cocoa-light hover:text-brand-cocoa hover:bg-brand-cream-light/40'
                }`
              }
            >
              Home
            </NavLink>
            
            <NavLink
              to="/shop"
              id="nav-link-our-menu"
              className={() =>
                `px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  isShopActive
                    ? 'text-brand-pink bg-brand-pink-light/30'
                    : 'text-brand-cocoa-light hover:text-brand-cocoa hover:bg-brand-cream-light/40'
                }`
              }
            >
              Our Menu
            </NavLink>

            <NavLink
              to="/admin"
              id="nav-link-admin-panel"
              className={({ isActive }) =>
                `px-3.5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'text-brand-pink bg-brand-pink-light/30'
                    : 'text-brand-cocoa-light hover:text-brand-cocoa hover:bg-brand-cream-light/40'
                }`
              }
              title="Admin Panel"
            >
              <ShieldCheck className="w-4 h-4 text-brand-pink" />
              <span>Admin Panel</span>
            </NavLink>

            <div className="relative">
              <button
                type="button"
                id="nav-link-contact-us"
                onClick={() => setShowContactDropdown(!showContactDropdown)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  showContactDropdown
                    ? 'text-brand-pink bg-brand-pink-light/20 border border-brand-pink/20 shadow-xs'
                    : 'text-brand-cocoa-light hover:text-brand-pink hover:bg-brand-pink-light/20'
                }`}
              >
                <Mail className="w-4 h-4 text-brand-pink-dark" />
                <span>Contact Us</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${showContactDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showContactDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowContactDropdown(false)} />
                  <div className="absolute left-0 mt-2 w-52 bg-white border border-brand-cocoa-border rounded-xl shadow-lg py-2.5 z-20 text-left animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-1.5 border-b border-brand-cocoa-border/20 mb-1.5">
                      <span className="text-[9px] uppercase tracking-wider font-extrabold text-brand-cocoa-light font-mono block">
                        Get In Touch
                      </span>
                    </div>
                    <a
                      href="mailto:hellofrostingfairy@gmail.com"
                      className="px-4 py-2 text-xs font-semibold text-brand-cocoa-light hover:text-brand-pink hover:bg-brand-pink-light/20 transition-all flex items-center gap-2"
                      onClick={() => setShowContactDropdown(false)}
                    >
                      <Mail className="w-3.5 h-3.5 text-brand-pink-dark" />
                      <span>Email Us</span>
                    </a>
                    <a
                      href="https://www.instagram.com/the._frosting._fairy._?igsh=MWk0dWM4ZWN0a2RrNQ=="
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 text-xs font-semibold text-brand-cocoa-light hover:text-brand-pink hover:bg-brand-pink-light/20 transition-all flex items-center gap-2"
                      onClick={() => setShowContactDropdown(false)}
                    >
                      <Instagram className="w-3.5 h-3.5 text-brand-pink" />
                      <span>Instagram Profile</span>
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 3. Utility Group on Far Right: Theme 🌙 | Cart 🛍 | Account 👤 */}
          <div className="hidden md:flex items-center space-x-2.5">
            
            {/* Theme Toggle Button */}
            <button
              type="button"
              id="nav-theme-toggle-btn"
              onClick={toggleTheme}
              title={theme === 'light' ? 'Switch to Midnight Velvet' : 'Switch to Light Mode'}
              className="p-2.5 rounded-full border border-brand-cocoa-border bg-white text-brand-cocoa hover:border-brand-pink-accent/50 hover:bg-brand-pink-light/20 transition-all cursor-pointer shadow-2xs flex items-center justify-center focus:outline-none"
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-brand-cocoa-light hover:text-brand-pink" />
              ) : (
                <Sun className="w-4 h-4 text-yellow-400 hover:text-brand-pink" />
              )}
            </button>

            {/* Cart / Shopping Bag Icon */}
            <NavLink
              to="/cart"
              id="nav-cart-my-order"
              title="My Cart / Order"
              aria-label="My Cart / Order"
              className={() =>
                `relative p-2.5 rounded-full border border-brand-cocoa-border transition-all cursor-pointer shadow-2xs focus:outline-none ${
                  isCartActive
                    ? 'bg-brand-pink text-white border-brand-pink shadow-xs'
                    : 'bg-white text-brand-cocoa hover:border-brand-pink-accent/50 hover:bg-brand-pink-light/20'
                }`
              }
            >
              <ShoppingBag className="w-4 h-4" />
              {shoppingItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-brand-pink text-white text-[9px] font-extrabold font-mono w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs animate-pulse">
                  {shoppingItemsCount}
                </span>
              )}
            </NavLink>

            {/* Account / Login / Dashboard Button (Final Right Item) */}
            <div className="relative">
              {customer ? (
                // Authenticated Customer: User icon with "Dashboard"
                <button
                  type="button"
                  id="nav-customer-dashboard-btn"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="px-3.5 py-2 rounded-full border border-brand-pink/40 bg-brand-pink-light/25 hover:bg-brand-pink-light/40 text-brand-cocoa text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer focus:outline-none"
                  title="Open Customer Dashboard"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <User className="w-4 h-4 text-brand-pink shrink-0" />
                  <span className="font-semibold">Dashboard</span>
                  <ChevronDown className={`w-3 h-3 text-brand-cocoa-light transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>
              ) : (
                // Guest Customer: User icon with "Login"
                <button
                  type="button"
                  id="nav-customer-login-btn"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="px-3.5 py-2 rounded-full border border-brand-cocoa-border bg-white text-brand-cocoa hover:text-brand-pink hover:border-brand-pink/40 hover:bg-brand-pink/5 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer focus:outline-none"
                  title="Customer Login"
                >
                  <User className="w-4 h-4 text-brand-pink shrink-0" />
                  <span>Login</span>
                  <ChevronDown className={`w-3 h-3 text-brand-cocoa-light transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>
              )}

              {/* Account Dropdown Menu */}
              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-brand-cocoa-border rounded-2xl shadow-xl py-2 z-20 text-left animate-in fade-in slide-in-from-top-2 duration-150">
                    
                    {customer ? (
                      /* Authenticated Dropdown: My Profile, My Orders, Favourites, Addresses, Logout */
                      <>
                        <div className="px-4 py-2.5 border-b border-brand-cocoa-border/20 bg-brand-cream-light/30">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-brand-pink-dark">
                              Customer Dashboard
                            </span>
                            <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-emerald-700 bg-emerald-100/90 px-1.5 py-0.5 rounded-full">
                              <ShieldCheck className="w-2.5 h-2.5" /> Verified
                            </span>
                          </div>
                          <p className="text-xs font-bold text-brand-cocoa mt-1 truncate">
                            {customer.fullName || 'Confectionery Patron'}
                          </p>
                          <p className="text-[11px] font-mono text-brand-cocoa-light/80 truncate">
                            {customer.fullPhoneNumber}
                          </p>
                        </div>

                        <div className="py-1">
                          {/* 1. My Profile */}
                          <button
                            type="button"
                            id="dashboard-opt-my-profile"
                            onClick={() => {
                              setShowUserMenu(false);
                              setIsProfileModalOpen(true);
                            }}
                            className="w-full text-left px-4 py-2 text-xs font-semibold text-brand-cocoa-light hover:text-brand-pink hover:bg-brand-pink-light/20 transition-all flex items-center gap-2.5 cursor-pointer"
                          >
                            <User className="w-4 h-4 text-brand-pink" />
                            <span>My Profile</span>
                          </button>

                          {/* 2. My Orders */}
                          <NavLink
                            to="/orders"
                            id="dashboard-opt-my-orders"
                            onClick={() => setShowUserMenu(false)}
                            className="px-4 py-2 text-xs font-semibold text-brand-cocoa-light hover:text-brand-pink hover:bg-brand-pink-light/20 transition-all flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2.5">
                              <Calendar className="w-4 h-4 text-brand-pink" />
                              <span>My Orders</span>
                            </div>
                            {ordersCount > 0 && (
                              <span className="bg-brand-cocoa text-white text-[10px] font-bold font-mono px-2 py-0.5 rounded-full">
                                {ordersCount}
                              </span>
                            )}
                          </NavLink>

                          {/* 3. Favourites */}
                          <NavLink
                            to="/shop?category=Favorites"
                            id="dashboard-opt-favourites"
                            onClick={() => setShowUserMenu(false)}
                            className="px-4 py-2 text-xs font-semibold text-brand-cocoa-light hover:text-brand-pink hover:bg-brand-pink-light/20 transition-all flex items-center gap-2.5"
                          >
                            <Heart className="w-4 h-4 text-brand-pink" />
                            <span>Favourites</span>
                          </NavLink>

                          {/* 4. Addresses */}
                          <button
                            type="button"
                            id="dashboard-opt-addresses"
                            onClick={() => {
                              setShowUserMenu(false);
                              setIsAddressModalOpen(true);
                            }}
                            className="w-full text-left px-4 py-2 text-xs font-semibold text-brand-cocoa-light hover:text-brand-pink hover:bg-brand-pink-light/20 transition-all flex items-center gap-2.5 cursor-pointer"
                          >
                            <HomeIcon className="w-4 h-4 text-brand-pink" />
                            <span>Addresses</span>
                          </button>
                        </div>

                        {/* 5. Logout */}
                        <div className="border-t border-brand-cocoa-border/20 mt-1 pt-1">
                          <button
                            type="button"
                            id="dashboard-opt-logout"
                            onClick={() => {
                              setShowUserMenu(false);
                              if (onLogout) onLogout();
                            }}
                            className="w-full text-left px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-all flex items-center gap-2.5 cursor-pointer"
                          >
                            <LogOut className="w-4 h-4 text-red-500" />
                            <span>Log Out</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      /* Guest Dropdown: Login action + quick links */
                      <>
                        <div className="px-4 py-3 border-b border-brand-cocoa-border/20 bg-brand-cream-light/30">
                          <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-brand-pink-dark block">
                            Welcome Patron
                          </span>
                          <p className="text-xs text-brand-cocoa-light mt-0.5">
                            Sign in to track orders, manage addresses, and save favorites.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setShowUserMenu(false);
                              setIsLoginModalOpen(true);
                            }}
                            className="w-full mt-2.5 py-2 px-3 rounded-xl bg-brand-pink text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs hover:bg-brand-pink-dark transition-colors cursor-pointer"
                          >
                            <Smartphone className="w-3.5 h-3.5" />
                            <span>Login with Mobile</span>
                          </button>
                        </div>

                        <div className="py-1">
                          <NavLink
                            to="/orders"
                            onClick={() => setShowUserMenu(false)}
                            className="px-4 py-2 text-xs font-semibold text-brand-cocoa-light hover:text-brand-pink hover:bg-brand-pink-light/20 transition-all flex items-center gap-2.5"
                          >
                            <Calendar className="w-4 h-4 text-brand-pink" />
                            <span>My Orders</span>
                          </NavLink>

                          <NavLink
                            to="/shop?category=Favorites"
                            onClick={() => setShowUserMenu(false)}
                            className="px-4 py-2 text-xs font-semibold text-brand-cocoa-light hover:text-brand-pink hover:bg-brand-pink-light/20 transition-all flex items-center gap-2.5"
                          >
                            <Heart className="w-4 h-4 text-brand-pink" />
                            <span>Favourites</span>
                          </NavLink>
                        </div>
                      </>
                    )}

                  </div>
                </>
              )}
            </div>

          </div>

          {/* Mobile Right Controls: Theme | Cart | Account | Hamburger */}
          <div className="flex items-center md:hidden gap-1.5">
            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              title={theme === 'light' ? 'Switch to Midnight Velvet' : 'Switch to Light Mode'}
              className="p-2 rounded-full border border-brand-cocoa-border text-brand-cocoa cursor-pointer flex items-center justify-center bg-white shadow-2xs"
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-brand-cocoa-light" />
              ) : (
                <Sun className="w-4 h-4 text-yellow-400" />
              )}
            </button>

            {/* Cart Icon */}
            <NavLink
              to="/cart"
              id="mobile-nav-cart-btn"
              title="My Order"
              className="relative p-2 rounded-full border border-brand-cocoa-border text-brand-cocoa cursor-pointer bg-white shadow-2xs"
            >
              <ShoppingBag className="w-4 h-4" />
              {shoppingItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-pink text-white text-[9px] font-extrabold font-mono w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white">
                  {shoppingItemsCount}
                </span>
              )}
            </NavLink>

            {/* Account Quick Icon / Pill */}
            {customer ? (
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="px-2.5 py-1.5 rounded-full border border-brand-pink/30 bg-brand-pink-light/25 text-brand-cocoa text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                title="Customer Dashboard"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <User className="w-3.5 h-3.5 text-brand-pink" />
                <span className="hidden sm:inline">Dashboard</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(true)}
                className="px-2.5 py-1.5 rounded-full border border-brand-cocoa-border bg-white text-brand-cocoa hover:text-brand-pink text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                title="Login"
              >
                <User className="w-3.5 h-3.5 text-brand-pink" />
                <span>Login</span>
              </button>
            )}

            {/* Mobile Drawer Hamburger Button */}
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-brand-cocoa-light hover:text-brand-cocoa hover:bg-brand-cream-light/40 border border-brand-cocoa-border focus:outline-none cursor-pointer ml-0.5"
              aria-label="Toggle Navigation Menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-brand-cocoa-border px-4 py-3 space-y-2 text-left shadow-lg animate-in slide-in-from-top duration-200">
          
          {/* Main Navigation in exact order: Home → Our Menu → Find Us → Contact Us (No Admin Panel) */}
          <NavLink
            to="/"
            onClick={() => setIsOpen(false)}
            className={({ isActive }) =>
              `w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold block ${
                isActive
                  ? 'text-brand-pink bg-brand-pink-light/30'
                  : 'text-brand-cocoa-light hover:text-brand-cocoa'
              }`
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/shop"
            onClick={() => setIsOpen(false)}
            className={() =>
              `w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold block ${
                isShopActive
                  ? 'text-brand-pink bg-brand-pink-light/30'
                  : 'text-brand-cocoa-light hover:text-brand-cocoa'
              }`
            }
          >
            Our Menu
          </NavLink>

          <NavLink
            to="/admin"
            id="mobile-nav-admin-panel"
            onClick={() => setIsOpen(false)}
            className={({ isActive }) =>
              `w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 ${
                isActive
                  ? 'text-brand-pink bg-brand-pink-light/30'
                  : 'text-brand-cocoa-light hover:text-brand-cocoa'
              }`
            }
          >
            <ShieldCheck className="w-4 h-4 text-brand-pink" />
            <span>Admin Panel</span>
          </NavLink>

          {/* Contact Us Accordion */}
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setShowContactDropdown(!showContactDropdown)}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between transition-all ${
                showContactDropdown 
                  ? 'text-brand-pink bg-brand-pink-light/25' 
                  : 'text-brand-cocoa-light hover:text-brand-pink'
              }`}
            >
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>Contact Us</span>
              </div>
              <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${showContactDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showContactDropdown && (
              <div className="pl-6 py-2 space-y-2 bg-brand-cream-light/30 rounded-xl border border-brand-cocoa-border/20 mx-1">
                <a
                  href="mailto:hellofrostingfairy@gmail.com"
                  onClick={() => {
                    setIsOpen(false);
                    setShowContactDropdown(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs font-semibold flex items-center gap-2 text-brand-cocoa-light hover:text-brand-pink transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-brand-pink-dark" />
                  <span>Email: hellofrostingfairy@gmail.com</span>
                </a>
                <a
                  href="https://www.instagram.com/the._frosting._fairy._?igsh=MWk0dWM4ZWN0a2RrNQ=="
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    setIsOpen(false);
                    setShowContactDropdown(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs font-semibold flex items-center gap-2 text-brand-cocoa-light hover:text-brand-pink transition-colors"
                >
                  <Instagram className="w-3.5 h-3.5 text-brand-pink" />
                  <span>Instagram Profile</span>
                </a>
              </div>
            )}
          </div>

          {/* Customer Dashboard Section in Mobile Drawer */}
          <div className="border-t border-brand-cocoa-border/30 pt-3 px-1 space-y-2">
            <span className="text-[10px] font-mono uppercase font-bold text-brand-cocoa-light px-2 tracking-wider block">
              {customer ? 'Customer Dashboard' : 'Customer Account'}
            </span>

            {customer ? (
              <>
                <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-950 font-mono">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{customer.fullPhoneNumber}</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-emerald-700 font-mono bg-emerald-100 px-1.5 py-0.5 rounded">
                      Verified
                    </span>
                  </div>
                  {customer.fullName && (
                    <p className="text-[11px] text-emerald-800 font-medium truncate mt-1">{customer.fullName}</p>
                  )}
                </div>

                <div className="space-y-1 bg-white rounded-xl border border-brand-cocoa-border/40 p-1.5 shadow-2xs">
                  {/* My Profile */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      setIsProfileModalOpen(true);
                    }}
                    className="w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2.5 text-brand-cocoa hover:bg-brand-pink-light/15 hover:text-brand-pink transition-colors cursor-pointer"
                  >
                    <User className="w-4 h-4 text-brand-pink" />
                    <span>My Profile</span>
                  </button>

                  {/* My Orders */}
                  <NavLink
                    to="/orders"
                    onClick={() => setIsOpen(false)}
                    className="w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-between text-brand-cocoa hover:bg-brand-pink-light/15 hover:text-brand-pink transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Calendar className="w-4 h-4 text-brand-pink" />
                      <span>My Orders</span>
                    </div>
                    {ordersCount > 0 && (
                      <span className="bg-brand-cocoa text-white text-[10px] font-bold font-mono px-2 py-0.5 rounded-full">
                        {ordersCount}
                      </span>
                    )}
                  </NavLink>

                  {/* Favourites */}
                  <NavLink
                    to="/shop?category=Favorites"
                    onClick={() => setIsOpen(false)}
                    className="w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2.5 text-brand-cocoa hover:bg-brand-pink-light/15 hover:text-brand-pink transition-colors"
                  >
                    <Heart className="w-4 h-4 text-brand-pink" />
                    <span>Favourites</span>
                  </NavLink>

                  {/* Addresses */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      setIsAddressModalOpen(true);
                    }}
                    className="w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2.5 text-brand-cocoa hover:bg-brand-pink-light/15 hover:text-brand-pink transition-colors cursor-pointer"
                  >
                    <HomeIcon className="w-4 h-4 text-brand-pink" />
                    <span>Addresses</span>
                  </button>
                </div>

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      if (onLogout) onLogout();
                    }}
                    className="w-full text-left py-2 px-3 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span>Log Out</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setIsLoginModalOpen(true);
                  }}
                  className="w-full text-center py-2.5 px-4 rounded-xl bg-brand-pink text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs hover:bg-brand-pink-dark transition-colors cursor-pointer"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Login with Mobile Number</span>
                </button>

                <div className="space-y-1 bg-white rounded-xl border border-brand-cocoa-border/40 p-1.5">
                  <NavLink
                    to="/orders"
                    onClick={() => setIsOpen(false)}
                    className="w-full text-left px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2.5 text-brand-cocoa hover:text-brand-pink transition-colors"
                  >
                    <Calendar className="w-3.5 h-3.5 text-brand-pink" />
                    <span>Track My Orders</span>
                  </NavLink>
                  <NavLink
                    to="/shop?category=Favorites"
                    onClick={() => setIsOpen(false)}
                    className="w-full text-left px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2.5 text-brand-cocoa hover:text-brand-pink transition-colors"
                  >
                    <Heart className="w-3.5 h-3.5 text-brand-pink" />
                    <span>Browse Favourites</span>
                  </NavLink>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Theme Switcher Footer */}
          <div className="border-t border-brand-cocoa-border/40 pt-3 flex items-center justify-between px-2">
            <span className="text-xs font-semibold text-brand-cocoa-light">Theme Appearance</span>
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-brand-cocoa-border bg-white text-xs font-semibold text-brand-cocoa cursor-pointer"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-brand-cocoa-light" />
                  <span>Midnight Velvet</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Light Theme</span>
                </>
              )}
            </button>
          </div>

        </div>
      )}

      {/* Customer Mobile Login Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-brand-cocoa-border overflow-hidden">
            <div className="absolute top-4 right-4 z-10">
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(false)}
                className="p-1.5 rounded-full text-brand-cocoa-light hover:text-brand-cocoa hover:bg-brand-cream transition-colors cursor-pointer"
                aria-label="Close Login Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <CustomerMobileLogin
                title="Customer Login"
                subtitle="Enter your mobile number to receive an OTP verification code."
                onSuccess={(verifiedCustomer, token) => {
                  if (onLogin) {
                    onLogin(verifiedCustomer, token);
                  }
                  setIsLoginModalOpen(false);
                }}
                onCancel={() => setIsLoginModalOpen(false)}
                embedded={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Customer My Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-brand-cocoa-border overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-brand-cocoa-border/30 bg-brand-cream-light/30">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-brand-pink" />
                <h3 className="font-display font-black text-brand-cocoa text-base uppercase">My Profile</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(false)}
                className="p-1.5 rounded-full text-brand-cocoa-light hover:text-brand-cocoa hover:bg-brand-cream transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-6 space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-brand-cocoa-light mb-1 uppercase tracking-wider font-mono">
                  Verified Mobile Number
                </label>
                <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-700 flex items-center justify-between">
                  <span>{customer?.fullPhoneNumber}</span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-bold uppercase bg-emerald-100 px-2 py-0.5 rounded-full">
                    <Check className="w-3 h-3" /> Verified
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Mobile number is bound to your customer session.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-cocoa mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-cocoa-border bg-white text-sm text-brand-cocoa focus:outline-none focus:border-brand-pink focus:ring-1 focus:ring-brand-pink"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-cocoa mb-1.5">
                  Preferred Delivery Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryTypePref('Delivery')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      deliveryTypePref === 'Delivery'
                        ? 'border-brand-pink bg-brand-pink-light/30 text-brand-pink'
                        : 'border-brand-cocoa-border text-brand-cocoa-light hover:bg-brand-cream-light/30'
                    }`}
                  >
                    <span>🛵 Home Delivery</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryTypePref('Pickup')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      deliveryTypePref === 'Pickup'
                        ? 'border-brand-pink bg-brand-pink-light/30 text-brand-pink'
                        : 'border-brand-cocoa-border text-brand-cocoa-light hover:bg-brand-cream-light/30'
                    }`}
                  >
                    <span>🏪 Store Pickup</span>
                  </button>
                </div>
              </div>

              {saveSuccessMsg && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-brand-cocoa-border text-xs font-bold text-brand-cocoa-light hover:bg-brand-cream-light transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="flex-1 py-2.5 rounded-xl bg-brand-pink text-white text-xs font-bold hover:bg-brand-pink-dark transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  {isSavingProfile ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Addresses Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-brand-cocoa-border overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-brand-cocoa-border/30 bg-brand-cream-light/30">
              <div className="flex items-center gap-2">
                <HomeIcon className="w-5 h-5 text-brand-pink" />
                <h3 className="font-display font-black text-brand-cocoa text-base uppercase">Saved Delivery Address</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddressModalOpen(false)}
                className="p-1.5 rounded-full text-brand-cocoa-light hover:text-brand-cocoa hover:bg-brand-cream transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="p-6 space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-brand-cocoa mb-1">
                  Street Address, Building & Landmark
                </label>
                <textarea
                  rows={3}
                  value={addressText}
                  onChange={(e) => setAddressText(e.target.value)}
                  placeholder="e.g. Flat 4B, Emerald Heights, Linking Road, Bandra West"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-cocoa-border bg-white text-xs text-brand-cocoa focus:outline-none focus:border-brand-pink focus:ring-1 focus:ring-brand-pink"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-brand-cocoa">
                    GPS Coordinates
                  </label>
                  <button
                    type="button"
                    onClick={handleDetectGps}
                    disabled={isDetectingGps}
                    className="text-[11px] text-brand-pink font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {isDetectingGps ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Detecting GPS...</span>
                      </>
                    ) : (
                      <>
                        <Navigation className="w-3 h-3" />
                        <span>Pin GPS Location</span>
                      </>
                    )}
                  </button>
                </div>
                <input
                  type="text"
                  value={gpsCoords}
                  onChange={(e) => setGpsCoords(e.target.value)}
                  placeholder="e.g. 19.0596, 72.8295"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-cocoa-border bg-white text-xs font-mono text-brand-cocoa focus:outline-none focus:border-brand-pink focus:ring-1 focus:ring-brand-pink"
                />
                <p className="text-[10px] text-slate-400 mt-1">Used by our courier dispatch team for accurate cake delivery.</p>
              </div>

              {saveSuccessMsg && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-brand-cocoa-border text-xs font-bold text-brand-cocoa-light hover:bg-brand-cream-light transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="flex-1 py-2.5 rounded-xl bg-brand-pink text-white text-xs font-bold hover:bg-brand-pink-dark transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  {isSavingProfile ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Address</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </nav>
  );
}

import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Cake, ShoppingBag, Calendar, Heart, Menu, X, Sparkles, Settings, Mail, Instagram, Sun, Moon, MapPin, User, LogOut, Smartphone } from 'lucide-react';
import { CustomerProfile } from '../types';

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
}: NavbarProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [showContactDropdown, setShowContactDropdown] = React.useState(false);
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isHomeActive = location.pathname === '/';
  const isShopActive = location.pathname === '/shop' || location.pathname === '/menu' || location.pathname.startsWith('/product');
  const isOrdersActive = location.pathname === '/orders' || location.pathname === '/my-orders';
  const isAdminActive = location.pathname === '/admin';
  const isCartActive = location.pathname === '/cart';

  return (
    <nav id="website-navbar" className="bg-white border-b border-brand-cocoa-border sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo Brand Section */}
          <div className="flex items-center">
            <NavLink
              to="/"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 group focus:outline-none cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full border border-brand-cocoa-border overflow-hidden shadow-xs group-hover:scale-105 transition-transform flex items-center justify-center bg-white shrink-0">
                <img src={logo} alt="The Frosting Fairy Logo" width="48" height="48" loading="eager" decoding="async" className="w-full h-full object-cover" />
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

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            <NavLink
              to="/"
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
            {onOpenMap && (
              <button
                onClick={onOpenMap}
                className="px-3.5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5 text-brand-cocoa-light hover:text-brand-pink hover:bg-brand-pink-light/20"
                title="View Bakery Locations & Google Maps"
              >
                <MapPin className="w-4 h-4 text-brand-pink" />
                <span>Find Us</span>
              </button>
            )}
            <NavLink
              to="/admin"
              className={() =>
                `px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isAdminActive
                    ? 'text-brand-cocoa bg-brand-cream-light border border-brand-cocoa-border shadow-2xs'
                    : 'text-brand-pink-dark hover:text-brand-pink hover:bg-brand-pink-light/20'
                }`
              }
            >
              <Settings className="w-4 h-4 animate-spin-slow" />
              <span>Admin Panel</span>
            </NavLink>
            <div className="relative">
              <button
                onClick={() => setShowContactDropdown(!showContactDropdown)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  showContactDropdown
                    ? 'text-brand-pink bg-brand-pink-light/20 border border-brand-pink/20 shadow-xs'
                    : 'text-brand-cocoa-light hover:text-brand-pink hover:bg-brand-pink-light/20'
                }`}
              >
                <Mail className="w-4 h-4 text-brand-pink-dark" />
                <span>Contact Us</span>
                <span className={`text-[8px] transition-transform duration-200 ${showContactDropdown ? 'rotate-180' : ''}`}>▼</span>
              </button>

              {showContactDropdown && (
                <>
                  {/* Invisible backdrop to dismiss dropdown on outer click */}
                  <div className="fixed inset-0 z-10" onClick={() => setShowContactDropdown(false)} />
                  
                  <div className="absolute right-0 mt-2 w-52 bg-white border border-brand-cocoa-border rounded-xl shadow-lg py-2.5 z-20 text-left animate-in fade-in slide-in-from-top-2 duration-150">
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

          {/* Right Action Icons */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Customer Account Indicator */}
            {customer ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="px-3 py-2 rounded-full border border-emerald-300 bg-emerald-50/80 hover:bg-emerald-100 text-emerald-900 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <User className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="font-mono max-w-[130px] truncate">
                    {customer.fullName || customer.fullPhoneNumber}
                  </span>
                  <span className={`text-[8px] transition-transform ${showUserMenu ? 'rotate-180' : ''}`}>▼</span>
                </button>

                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-brand-cocoa-border rounded-xl shadow-lg py-2 z-20 text-left animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-2 border-b border-brand-cocoa-border/20">
                        <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-brand-pink-dark block">
                          Verified Customer
                        </span>
                        <p className="text-xs font-bold text-brand-cocoa mt-0.5 truncate">
                          {customer.fullPhoneNumber}
                        </p>
                        {customer.fullName && (
                          <p className="text-[11px] text-brand-cocoa-light truncate">{customer.fullName}</p>
                        )}
                      </div>

                      <NavLink
                        to="/cart"
                        id="dashboard-opt-my-order"
                        onClick={() => setShowUserMenu(false)}
                        className="px-4 py-2 text-xs font-semibold text-brand-cocoa-light hover:text-brand-pink hover:bg-brand-pink-light/20 transition-all flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="w-3.5 h-3.5 text-brand-pink" />
                          <span className="font-bold">My Order</span>
                        </div>
                        {shoppingItemsCount > 0 && (
                          <span className="bg-brand-pink text-white text-[10px] font-bold font-mono px-1.5 py-0.2 rounded-full">
                            {shoppingItemsCount}
                          </span>
                        )}
                      </NavLink>

                      <NavLink
                        to="/orders"
                        id="dashboard-opt-my-orders"
                        onClick={() => setShowUserMenu(false)}
                        className="px-4 py-2 text-xs font-semibold text-brand-cocoa-light hover:text-brand-pink hover:bg-brand-pink-light/20 transition-all flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-brand-pink" />
                          <span className="font-bold">My Orders</span>
                        </div>
                        {ordersCount > 0 && (
                          <span className="bg-brand-cocoa text-white text-[10px] font-bold font-mono px-1.5 py-0.2 rounded-full">
                            {ordersCount}
                          </span>
                        )}
                      </NavLink>

                      <div className="border-t border-brand-cocoa-border/20 mt-1 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setShowUserMenu(false);
                            if (onLogout) onLogout();
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Log Out</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="relative">
                <button
                  type="button"
                  id="nav-guest-dashboard-btn"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="px-3.5 py-1.5 rounded-full border border-brand-cocoa-border bg-white text-brand-cocoa hover:text-brand-pink hover:border-brand-pink/30 hover:bg-brand-pink/5 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Smartphone className="w-3.5 h-3.5 text-brand-pink" />
                  <span>Login / Dashboard</span>
                  <span className={`text-[8px] transition-transform ${showUserMenu ? 'rotate-180' : ''}`}>▼</span>
                </button>

                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-brand-cocoa-border rounded-xl shadow-lg py-2 z-20 text-left animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-2 border-b border-brand-cocoa-border/20">
                        <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-brand-pink-dark block">
                          Customer Dashboard
                        </span>
                        <NavLink
                          to="/cart"
                          onClick={() => setShowUserMenu(false)}
                          className="text-xs font-bold text-brand-pink hover:underline mt-0.5 inline-block"
                        >
                          Login with Mobile Number →
                        </NavLink>
                      </div>

                      <NavLink
                        to="/cart"
                        id="guest-dashboard-opt-my-order"
                        onClick={() => setShowUserMenu(false)}
                        className="px-4 py-2 text-xs font-semibold text-brand-cocoa-light hover:text-brand-pink hover:bg-brand-pink-light/20 transition-all flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="w-3.5 h-3.5 text-brand-pink" />
                          <span className="font-bold">My Order</span>
                        </div>
                        {shoppingItemsCount > 0 && (
                          <span className="bg-brand-pink text-white text-[10px] font-bold font-mono px-1.5 py-0.2 rounded-full">
                            {shoppingItemsCount}
                          </span>
                        )}
                      </NavLink>

                      <NavLink
                        to="/orders"
                        id="guest-dashboard-opt-my-orders"
                        onClick={() => setShowUserMenu(false)}
                        className="px-4 py-2 text-xs font-semibold text-brand-cocoa-light hover:text-brand-pink hover:bg-brand-pink-light/20 transition-all flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-brand-pink" />
                          <span className="font-bold">My Orders</span>
                        </div>
                        {ordersCount > 0 && (
                          <span className="bg-brand-cocoa text-white text-[10px] font-bold font-mono px-1.5 py-0.2 rounded-full">
                            {ordersCount}
                          </span>
                        )}
                      </NavLink>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              title={theme === 'light' ? 'Switch to Midnight Velvet' : 'Switch to Light Mode'}
              className="p-3 rounded-full border border-brand-cocoa-border bg-white text-brand-cocoa hover:border-brand-pink-accent/50 hover:bg-brand-pink-light/20 transition-all cursor-pointer shadow-xs flex items-center justify-center"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-brand-cocoa-light hover:text-brand-pink" />
              ) : (
                <Sun className="w-5 h-5 text-yellow-400 hover:text-brand-pink" />
              )}
            </button>

            <NavLink
              to="/cart"
              id="nav-cart-my-order"
              title="My Order"
              aria-label="My Order"
              className={() =>
                `relative p-3 rounded-full border border-brand-cocoa-border transition-all cursor-pointer ${
                  isCartActive
                    ? 'bg-brand-pink text-white border-brand-pink shadow-xs'
                    : 'bg-white text-brand-cocoa hover:border-brand-pink-accent/50 hover:bg-brand-pink-light/20'
                }`
              }
            >
              <ShoppingBag className="w-5 h-5" />
              {shoppingItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-brand-pink text-white text-[10px] font-extrabold font-mono w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  {shoppingItemsCount}
                </span>
              )}
            </NavLink>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden gap-2">
            {/* Mobile Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              title={theme === 'light' ? 'Switch to Midnight Velvet' : 'Switch to Light Mode'}
              className="p-2 rounded-full border border-brand-cocoa-border text-brand-cocoa cursor-pointer flex items-center justify-center bg-white"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-brand-cocoa-light" />
              ) : (
                <Sun className="w-5 h-5 text-yellow-400" />
              )}
            </button>

            <NavLink
              to="/cart"
              id="mobile-nav-cart-my-order"
              title="My Order"
              aria-label="My Order"
              className="relative p-2 rounded-full border border-brand-cocoa-border text-brand-cocoa mr-1 cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5" />
              {shoppingItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-pink text-white text-[9px] font-extrabold font-mono w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white">
                  {shoppingItemsCount}
                </span>
              )}
            </NavLink>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-brand-cocoa-light hover:text-brand-cocoa hover:bg-brand-cream-light/40 border border-brand-cocoa-border focus:outline-none cursor-pointer"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-brand-cocoa-border px-4 py-3 space-y-2 text-left">
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
          {onOpenMap && (
            <button
              onClick={() => {
                onOpenMap();
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 text-brand-cocoa-light hover:text-brand-pink"
            >
              <MapPin className="w-4 h-4 text-brand-pink" />
              <span>Find Us (Google Maps)</span>
            </button>
          )}
          <NavLink
            to="/admin"
            onClick={() => setIsOpen(false)}
            className={() =>
              `w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 ${
                isAdminActive
                  ? 'text-brand-cocoa bg-brand-cream-light border border-brand-cocoa-border'
                  : 'text-brand-pink-dark hover:text-brand-pink'
              }`
            }
          >
            <Settings className="w-4 h-4 animate-spin-slow" />
            <span>Admin Panel</span>
          </NavLink>
          {/* Mobile Accordion Contact Toggle containing Instagram */}
          <div className="space-y-1">
            <button
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
              <span className={`text-[8px] transition-transform duration-200 ${showContactDropdown ? 'rotate-180' : ''}`}>▼</span>
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

          {/* Customer Dashboard for Mobile */}
          <div className="border-t border-brand-cocoa-border/30 pt-3 px-1 space-y-2">
            <span className="text-[10px] font-mono uppercase font-bold text-brand-cocoa-light px-2 tracking-wider">
              Customer Dashboard
            </span>

            {customer && (
              <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs">
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
                  <p className="text-[11px] text-emerald-800 font-medium truncate mt-0.5">{customer.fullName}</p>
                )}
              </div>
            )}

            {/* Dashboard Order Options */}
            <div className="space-y-1 bg-white rounded-xl border border-brand-cocoa-border/40 p-1.5 shadow-2xs">
              <NavLink
                to="/cart"
                id="mobile-dashboard-opt-my-order"
                onClick={() => setIsOpen(false)}
                className={() =>
                  `w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-between transition-colors ${
                    isCartActive
                      ? 'text-brand-pink bg-brand-pink-light/30'
                      : 'text-brand-cocoa hover:bg-brand-pink-light/15 hover:text-brand-pink'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="w-4 h-4 text-brand-pink" />
                  <span className="font-bold">My Order</span>
                </div>
                {shoppingItemsCount > 0 && (
                  <span className="bg-brand-pink text-white text-[10px] font-bold font-mono px-2 py-0.5 rounded-full">
                    {shoppingItemsCount}
                  </span>
                )}
              </NavLink>

              <NavLink
                to="/orders"
                id="mobile-dashboard-opt-my-orders"
                onClick={() => setIsOpen(false)}
                className={() =>
                  `w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-between transition-colors ${
                    isOrdersActive
                      ? 'text-brand-pink bg-brand-pink-light/30'
                      : 'text-brand-cocoa hover:bg-brand-pink-light/15 hover:text-brand-pink'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-brand-pink" />
                  <span className="font-bold">My Orders</span>
                </div>
                {ordersCount > 0 && (
                  <span className="bg-brand-cocoa text-white text-[10px] font-bold font-mono px-2 py-0.5 rounded-full">
                    {ordersCount}
                  </span>
                )}
              </NavLink>
            </div>

            {customer ? (
              <div className="pt-1 px-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    if (onLogout) onLogout();
                  }}
                  className="w-full text-left py-2 px-3 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out ({customer.fullPhoneNumber})</span>
                </button>
              </div>
            ) : (
              <NavLink
                to="/cart"
                onClick={() => setIsOpen(false)}
                className="w-full text-center py-2.5 px-4 rounded-xl bg-brand-pink text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Login with Mobile Number</span>
              </NavLink>
            )}
          </div>

          {/* Mobile Theme Toggle footer inside drawer */}
          <div className="border-t border-brand-cocoa-border/40 pt-3 flex items-center justify-between px-4">
            <span className="text-xs font-semibold text-brand-cocoa-light">Theme</span>
            <button
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
    </nav>
  );
}

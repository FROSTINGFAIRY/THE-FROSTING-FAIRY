import React from 'react';
import { Cake, ShoppingBag, Calendar, Heart, Menu, X, Sparkles, Settings, Mail, Instagram, Sun, Moon } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  shoppingItemsCount: number;
  mealPlanCount: number;
  logo: string;
  websiteName: string;
  websiteSlogan: string;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  shoppingItemsCount,
  mealPlanCount,
  logo,
  websiteName,
  websiteSlogan,
  theme,
  toggleTheme,
}: NavbarProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [showContactDropdown, setShowContactDropdown] = React.useState(false);

  return (
    <nav id="website-navbar" className="bg-white border-b border-brand-cocoa-border sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo Brand Section */}
          <div className="flex items-center">
            <button
              onClick={() => {
                setActiveTab('home');
                setIsOpen(false);
              }}
              className="flex items-center gap-3 group focus:outline-none cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full border border-brand-cocoa-border overflow-hidden shadow-xs group-hover:scale-105 transition-transform flex items-center justify-center bg-white shrink-0">
                <img src={logo} alt="The Frosting Fairy Logo" className="w-full h-full object-cover" />
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
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'home'
                  ? 'text-brand-pink bg-brand-pink-light/30'
                  : 'text-brand-cocoa-light hover:text-brand-cocoa hover:bg-brand-cream-light/40'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setActiveTab('discover')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'discover'
                  ? 'text-brand-pink bg-brand-pink-light/30'
                  : 'text-brand-cocoa-light hover:text-brand-cocoa hover:bg-brand-cream-light/40'
              }`}
            >
              Our Menu
            </button>
            <button
              onClick={() => setActiveTab('planner')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'planner'
                  ? 'text-brand-pink bg-brand-pink-light/30'
                  : 'text-brand-cocoa-light hover:text-brand-cocoa hover:bg-brand-cream-light/40'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>My Orders</span>
              {mealPlanCount > 0 && (
                <span className="bg-brand-cocoa text-white text-[10px] font-bold font-mono px-1.5 py-0.5 rounded-full animate-bounce">
                  {mealPlanCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'admin'
                  ? 'text-brand-cocoa bg-brand-cream-light border border-brand-cocoa-border shadow-2xs'
                  : 'text-brand-pink-dark hover:text-brand-pink hover:bg-brand-pink-light/20'
              }`}
            >
              <Settings className="w-4 h-4 animate-spin-slow" />
              <span>Admin Panel</span>
            </button>
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

            <button
              onClick={() => setActiveTab('shopping')}
              className={`relative p-3 rounded-full border border-brand-cocoa-border transition-all cursor-pointer ${
                activeTab === 'shopping'
                  ? 'bg-brand-pink text-white border-brand-pink shadow-xs'
                  : 'bg-white text-brand-cocoa hover:border-brand-pink-accent/50 hover:bg-brand-pink-light/20'
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
              {shoppingItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-brand-pink text-white text-[10px] font-extrabold font-mono w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  {shoppingItemsCount}
                </span>
              )}
            </button>
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

            <button
              onClick={() => setActiveTab('shopping')}
              className="relative p-2 rounded-full border border-brand-cocoa-border text-brand-cocoa mr-1 cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5" />
              {shoppingItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-pink text-white text-[9px] font-extrabold font-mono w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white">
                  {shoppingItemsCount}
                </span>
              )}
            </button>
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
          <button
            onClick={() => {
              setActiveTab('home');
              setIsOpen(false);
            }}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold block ${
              activeTab === 'home'
                ? 'text-brand-pink bg-brand-pink-light/30'
                : 'text-brand-cocoa-light hover:text-brand-cocoa'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => {
              setActiveTab('discover');
              setIsOpen(false);
            }}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold block ${
              activeTab === 'discover'
                ? 'text-brand-pink bg-brand-pink-light/30'
                : 'text-brand-cocoa-light hover:text-brand-cocoa'
            }`}
          >
            Our Menu
          </button>
          <button
            onClick={() => {
              setActiveTab('planner');
              setIsOpen(false);
            }}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between ${
              activeTab === 'planner'
                ? 'text-brand-pink bg-brand-pink-light/30'
                : 'text-brand-cocoa-light hover:text-brand-cocoa'
            }`}
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>My Orders</span>
            </div>
            {mealPlanCount > 0 && (
              <span className="bg-brand-cocoa text-white text-[10px] font-bold font-mono px-2 py-0.5 rounded-full">
                {mealPlanCount}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab('admin');
              setIsOpen(false);
            }}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 ${
              activeTab === 'admin'
                ? 'text-brand-cocoa bg-brand-cream-light border border-brand-cocoa-border'
                : 'text-brand-pink-dark hover:text-brand-pink'
            }`}
          >
            <Settings className="w-4 h-4 animate-spin-slow" />
            <span>Admin Panel</span>
          </button>
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
                  <Mail className="w-3.5 h-3.5 text-brand-pink" />
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

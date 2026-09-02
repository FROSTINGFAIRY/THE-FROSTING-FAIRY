import React from 'react';
import LegalPageLayout from './LegalPageLayout';
import { Cookie, ShieldCheck, HardDrive, Lock, RefreshCw, Mail } from 'lucide-react';

export default function CookiePolicy() {
  return (
    <LegalPageLayout
      title="Cookie & Storage Policy"
      lastUpdated="August 31, 2026"
      metaDescription="Cookie and Browser Storage Policy for The Frosting Fairy - Transparent explanation of essential client storage, zero third-party ad tracking."
    >
      <section className="space-y-4">
        <h2 className="font-display font-bold text-xl sm:text-2xl text-brand-cocoa flex items-center gap-2">
          <Cookie className="w-5 h-5 text-brand-pink" />
          <span>1. Our Transparent Stance on Cookies</span>
        </h2>
        <p>
          At <strong>The Frosting Fairy</strong>, we believe in delicious baked cookies, not invasive web tracking cookies.
        </p>
        <p>
          We want you to know plainly and clearly: <strong>we do not use third-party marketing, cross-site profiling, or behavioral advertising cookies on this website</strong>. You will not be tracked around the internet simply because you viewed our cinnamon rolls or strawberry cupcakes.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-display font-bold text-xl sm:text-2xl text-brand-cocoa flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-brand-pink" />
          <span>2. Essential Browser Local Storage</span>
        </h2>
        <p>
          Instead of storing sensitive cookies on your computer, our single-page application utilizes your web browser's standard <strong>HTML5 LocalStorage</strong> strictly for essential functional operations:
        </p>
        <div className="space-y-3">
          <div className="p-4 bg-brand-cream-light/60 border border-brand-cocoa-border rounded-2xl">
            <div className="flex items-center justify-between font-mono text-xs font-bold text-brand-pink mb-1">
              <span>tff_shopping_list</span>
              <span className="text-brand-cocoa-light font-normal">Essential / Cart</span>
            </div>
            <p className="text-xs text-brand-cocoa-light">Stores the customized treats currently added to your shopping cart so you do not lose your selections when refreshing the page.</p>
          </div>

          <div className="p-4 bg-brand-cream-light/60 border border-brand-cocoa-border rounded-2xl">
            <div className="flex items-center justify-between font-mono text-xs font-bold text-brand-pink mb-1">
              <span>tff_theme</span>
              <span className="text-brand-cocoa-light font-normal">Preference</span>
            </div>
            <p className="text-xs text-brand-cocoa-light">Remembers whether you selected the Warm Cream light theme or the Midnight Velvet dark theme.</p>
          </div>

          <div className="p-4 bg-brand-cream-light/60 border border-brand-cocoa-border rounded-2xl">
            <div className="flex items-center justify-between font-mono text-xs font-bold text-brand-pink mb-1">
              <span>tff_my_orders</span>
              <span className="text-brand-cocoa-light font-normal">Customer Receipt History</span>
            </div>
            <p className="text-xs text-brand-cocoa-light">Caches your past order IDs locally so you can view order receipts in &ldquo;My Orders&rdquo; without requiring a registered account login.</p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display font-bold text-xl sm:text-2xl text-brand-cocoa flex items-center gap-2">
          <Lock className="w-5 h-5 text-brand-pink" />
          <span>3. Administrative Session Authentication</span>
        </h2>
        <p>
          When authorized staff access the administrative kitchen dashboard (<code>/admin</code>), Firebase Authentication sets secure session tokens to protect sensitive inventory and order management functions against unauthorized access. These tokens are used solely for security verification.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-display font-bold text-xl sm:text-2xl text-brand-cocoa flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-brand-pink" />
          <span>4. Updates to This Policy</span>
        </h2>
        <p>
          Should we ever introduce analytical performance measurement tools or optional features requiring cookie consent in the future, we will update this policy accordingly and provide an explicit consent mechanism.
        </p>
        <p>
          If you have questions regarding our data storage practices, please write to us at{' '}
          <a href="mailto:hellofrostingfairy@gmail.com" className="text-brand-pink hover:underline font-bold">
            hellofrostingfairy@gmail.com
          </a>
          .
        </p>
      </section>
    </LegalPageLayout>
  );
}

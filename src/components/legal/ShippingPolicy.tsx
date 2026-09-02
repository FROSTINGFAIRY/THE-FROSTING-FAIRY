import React from 'react';
import LegalPageLayout from './LegalPageLayout';
import { Truck, Store, Clock, ShieldCheck, ThermometerSnowflake, DollarSign } from 'lucide-react';

export default function ShippingPolicy() {
  return (
    <LegalPageLayout
      title="Delivery & Store Pickup Policy"
      lastUpdated="August 31, 2026"
      metaDescription="Delivery and Store Pickup Policy for The Frosting Fairy - Delivery areas, ₹50 fee waived over ₹600, transit care for perishables, and store pickup options."
    >
      <section className="space-y-4">
        <h2 className="font-display font-bold text-xl sm:text-2xl text-brand-cocoa flex items-center gap-2">
          <Truck className="w-5 h-5 text-brand-pink" />
          <span>1. Local Hand-Delivery (Not Long-Haul Shipping)</span>
        </h2>
        <p>
          Because our confections contain fresh whipped cream, Belgian chocolate ganache, real fruit compotes, and delicate piped frostings, <strong>we do not ship through conventional parcel cargo services</strong>. Instead, every order is hand-delivered through dedicated direct two-wheeler and four-wheeler temperature-aware delivery couriers to guarantee peak freshness.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-display font-bold text-xl sm:text-2xl text-brand-cocoa flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-brand-pink" />
          <span>2. Delivery Charges & Free Delivery Threshold</span>
        </h2>
        <p>
          We keep our delivery rates transparent and affordable:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 bg-white border border-brand-cocoa-border rounded-2xl space-y-1">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-brand-cocoa-light">Standard Delivery Fee</span>
            <div className="text-2xl font-display font-extrabold text-brand-cocoa">₹50</div>
            <p className="text-xs text-brand-cocoa-light">Applicable on orders below ₹600 within city delivery bounds.</p>
          </div>

          <div className="p-5 bg-brand-pink-light/30 border border-brand-pink-accent/50 rounded-2xl space-y-1">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-brand-pink-dark">Free Delivery Threshold</span>
            <div className="text-2xl font-display font-extrabold text-brand-pink">FREE (₹0)</div>
            <p className="text-xs text-brand-cocoa-light">Automatically applied at checkout on all orders of <strong>₹600 or more</strong>.</p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display font-bold text-xl sm:text-2xl text-brand-cocoa flex items-center gap-2">
          <Clock className="w-5 h-5 text-brand-pink" />
          <span>3. Delivery Slots & Timelines</span>
        </h2>
        <p>
          During checkout on our website, you may specify your preferred delivery date and time window (Morning: 10:00 AM – 2:00 PM, Evening: 3:00 PM – 8:00 PM).
        </p>
        <p>
          Same-day orders are freshly baked and dispatched within <strong>90 to 180 minutes</strong> depending on queue volume. For multi-tier cakes and elaborate milestone designs, we encourage booking 24 to 48 hours in advance.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-display font-bold text-xl sm:text-2xl text-brand-cocoa flex items-center gap-2">
          <Store className="w-5 h-5 text-brand-pink" />
          <span>4. Complimentary Boutique Store Pickup</span>
        </h2>
        <p>
          If you prefer to collect your cake personally or want to visit our kitchen:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-brand-cocoa/85">
          <li>Select <strong>&ldquo;Boutique Store Pickup&rdquo;</strong> during checkout.</li>
          <li>Store pickup is always <strong>100% Free</strong> with no minimum order requirement.</li>
          <li>Your order will be packaged in a rigid luxury bakery box with base stabilization, ready when you arrive at our storefront counter.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="font-display font-bold text-xl sm:text-2xl text-brand-cocoa flex items-center gap-2">
          <ThermometerSnowflake className="w-5 h-5 text-brand-pink" />
          <span>5. Transit Protection & Perishable Care</span>
        </h2>
        <p>
          To ensure your dessert arrives in pristine condition:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-brand-cocoa/85">
          <li>All cakes are chilled prior to dispatch to set the buttercream and ganache.</li>
          <li>We use reinforced, shock-absorbent food-grade luxury boxes with anti-slide baseboards.</li>
          <li>Please refrigerate cream-based cakes immediately upon delivery until 15–20 minutes before slicing.</li>
        </ul>
      </section>
    </LegalPageLayout>
  );
}

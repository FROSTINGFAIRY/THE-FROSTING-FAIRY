import React from 'react';
import LegalPageLayout from './LegalPageLayout';
import { RotateCcw, AlertTriangle, ShieldCheck, Camera, CheckSquare, Mail } from 'lucide-react';

export default function ReturnsExchangePolicy() {
  return (
    <LegalPageLayout
      title="Returns & Exchanges Policy"
      lastUpdated="August 31, 2026"
      metaDescription="Returns and Exchanges Policy for The Frosting Fairy - Food safety guidelines regarding baked goods and replacement protocol."
    >
      <section className="space-y-4">
        <h2 className="font-display font-bold text-xl sm:text-2xl text-brand-cocoa flex items-center gap-2">
          <RotateCcw className="w-5 h-5 text-brand-pink" />
          <span>1. Food Safety & Non-Returnable Policy</span>
        </h2>
        <p>
          In strict compliance with <strong>Food Safety and Standards Authority of India (FSSAI)</strong> hygienic regulations, food items and freshly baked perishable goods <strong>cannot be physically returned or exchanged</strong> once handed over and accepted.
        </p>
        <p>
          Once a bakery box has left our possession and entered customer premises, it cannot be reintroduced into our kitchen inventory under any circumstances to prevent cross-contamination and ensure absolute hygiene for all patrons.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-display font-bold text-xl sm:text-2xl text-brand-cocoa flex items-center gap-2">
          <Camera className="w-5 h-5 text-brand-pink" />
          <span>2. Immediate Resolution for Transit Damage or Defect</span>
        </h2>
        <p>
          While baked goods cannot be returned, we stand firmly behind our craftsmanship. If you receive an item that is:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-brand-cocoa/85">
          <li>Physically damaged, dropped, or crushed upon delivery;</li>
          <li>Fundamentally incorrect in flavor, size, or custom lettering compared to your confirmed invoice; or</li>
          <li>Possessing a verifiable quality defect reported upon unboxing.</li>
        </ul>
        <p>
          <strong>Action Required:</strong> Please take a clear photograph or 5-second video of the item inside its box and send it to our team at{' '}
          <a href="mailto:hellofrostingfairy@gmail.com" className="text-brand-pink hover:underline font-bold">
            hellofrostingfairy@gmail.com
          </a>{' '}
          within <strong>24 hours of delivery</strong>.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-display font-bold text-xl sm:text-2xl text-brand-cocoa flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-brand-pink" />
          <span>3. Resolution Options Offered</span>
        </h2>
        <p>
          Upon rapid verification by our bakery manager, we will offer one of the following immediate solutions:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-brand-cream-light/60 border border-brand-cocoa-border rounded-2xl">
            <h4 className="font-display font-bold text-sm text-brand-cocoa mb-1">Priority Kitchen Re-Bake</h4>
            <p className="text-xs text-brand-cocoa-light">We rush a fresh replacement cake to your doorstep at zero cost if time allows before your celebration.</p>
          </div>
          <div className="p-4 bg-brand-cream-light/60 border border-brand-cocoa-border rounded-2xl">
            <h4 className="font-display font-bold text-sm text-brand-cocoa mb-1">Full or Pro-Rata Refund</h4>
            <p className="text-xs text-brand-cocoa-light">Instant refund processed back to your original payment method or UPI account within standard bank settlement times.</p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display font-bold text-xl sm:text-2xl text-brand-cocoa flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-brand-pink" />
          <span>4. Exceptions & Exclusions</span>
        </h2>
        <p>
          We cannot offer replacements or compensation for damage resulting from customer mishandling after delivery (e.g. dropping the cake box, improper transport on a motorcycle footboard, or leaving cream products in direct sunlight).
        </p>
      </section>
    </LegalPageLayout>
  );
}

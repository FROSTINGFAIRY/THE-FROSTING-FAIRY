import React from 'react';
import LegalPageLayout from './LegalPageLayout';
import { XCircle, Clock, CheckCircle2, AlertCircle, PhoneCall, Mail } from 'lucide-react';

export default function CancellationPolicy() {
  return (
    <LegalPageLayout
      title="Cancellation Policy"
      lastUpdated="August 31, 2026"
      metaDescription="Cancellation Policy for The Frosting Fairy - Guidelines on modifying or cancelling scheduled orders and bespoke cakes."
    >
      <section className="space-y-4">
        <h2 className="font-display font-bold text-xl sm:text-2xl text-brand-cocoa flex items-center gap-2">
          <XCircle className="w-5 h-5 text-brand-pink" />
          <span>1. Overview</span>
        </h2>
        <p>
          We know that celebratory plans can change unexpectedly. Because fresh artisan confections require advance scheduling, preparation of specialty dairy batters, and custom sugar work, our cancellation timelines are tiered based on the type of order and notice provided.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-display font-bold text-xl sm:text-2xl text-brand-cocoa flex items-center gap-2">
          <Clock className="w-5 h-5 text-brand-pink" />
          <span>2. Cancellation Windows & Cut-off Times</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2 text-left">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-800 block">
              Standard Treats & Ready Bakes
            </span>
            <p className="text-xs sm:text-sm text-emerald-950">
              <strong>Free cancellation up to 4 hours</strong> before the scheduled delivery/pickup window. 100% full refund credited back to your original payment method.
            </p>
          </div>

          <div className="p-5 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2 text-left">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-800 block">
              Custom & Milestone Cakes (1kg+)
            </span>
            <p className="text-xs sm:text-sm text-amber-950">
              <strong>Free cancellation up to 24 hours</strong> prior to your delivery date. Notice given 12–24 hours prior may incur a 30% ingredient preparation deduction.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display font-bold text-xl sm:text-2xl text-brand-cocoa flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-brand-pink" />
          <span>3. Late Cancellations & Active Baking</span>
        </h2>
        <p>
          Once your custom cake sponge has been baked, assembled, or hand-piped with custom sugar lettering (typically within 4 hours of dispatch), the order cannot be cancelled, returned, or refunded as the fresh perishable ingredients cannot be repurposed.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-display font-bold text-xl sm:text-2xl text-brand-cocoa flex items-center gap-2">
          <PhoneCall className="w-5 h-5 text-brand-pink" />
          <span>4. How to Request a Cancellation</span>
        </h2>
        <p>
          To cancel or reschedule an upcoming order before the cutoff time:
        </p>
        <ol className="list-decimal pl-6 space-y-2 text-brand-cocoa/85">
          <li>Locate your <strong>Order ID</strong> (found on your order confirmation screen or My Orders receipt).</li>
          <li>Email us immediately at <a href="mailto:hellofrostingfairy@gmail.com" className="text-brand-pink hover:underline font-bold">hellofrostingfairy@gmail.com</a> with the subject line <code>Cancellation Request - [Order ID]</code>.</li>
          <li>Include the reason for cancellation and your registered contact number.</li>
        </ol>
        <p>
          Our kitchen coordinator will confirm cancellation within 1–2 hours and initiate your refund immediately.
        </p>
      </section>
    </LegalPageLayout>
  );
}

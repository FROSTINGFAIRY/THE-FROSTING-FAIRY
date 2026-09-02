import React from 'react';
import LegalPageLayout from './LegalPageLayout';
import { RefreshCw, CheckCircle, Clock, AlertTriangle, CreditCard, Mail } from 'lucide-react';

export default function RefundPolicy() {
  return (
    <LegalPageLayout
      title="Refund Policy"
      lastUpdated="August 31, 2026"
      metaDescription="Refund Policy for The Frosting Fairy - Clear eligibility, timelines, and resolution procedures for bakery orders."
    >
      <section className="space-y-4">
        <h2 className="font-display font-bold text-xl sm:text-2xl text-brand-cocoa flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-brand-pink" />
          <span>1. Our Quality Pledge</span>
        </h2>
        <p>
          At <strong>The Frosting Fairy</strong>, our bakers pour heart and soul into every bake. We want every celebration, anniversary, and sweet moment to be extraordinary. Because our products are perishable, baked-to-order culinary items, our refund guidelines are designed to be fair, transparent, and prompt.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-display font-bold text-xl sm:text-2xl text-brand-cocoa flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-brand-pink" />
          <span>2. Refund Eligibility Criteria</span>
        </h2>
        <p>You are eligible for a partial or full refund under the following verified circumstances:</p>
        <ul className="list-disc pl-6 space-y-2 text-brand-cocoa/85">
          <li>
            <strong>Non-Delivery / Unfulfilled Order:</strong> If your order was not delivered due to an error on our part or our logistics partners, you will receive a 100% full refund immediately.
          </li>
          <li>
            <strong>Transit Damage or Severe Defect:</strong> If the cake or pastry arrived collapsed, smashed, or severely damaged in transit, please notify us within <strong>24 hours</strong> of receipt with clear photographs.
          </li>
          <li>
            <strong>Incorrect Flavor or Missing Item:</strong> If you received an incorrect item or missing components in an assorted box compared to your confirmed receipt.
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="font-display font-bold text-xl sm:text-2xl text-brand-cocoa flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-brand-pink" />
          <span>3. Non-Refundable Situations</span>
        </h2>
        <p>Refunds cannot be issued under the following circumstances:</p>
        <ul className="list-disc pl-6 space-y-2 text-brand-cocoa/85">
          <li>
            <strong>Custom Cakes in Active Production:</strong> Once sponge baking, bespoke sugar sculpting, or personalized fondant modeling has already commenced in our kitchen.
          </li>
          <li>
            <strong>Incorrect Delivery Information:</strong> If an order is delayed or undelivered due to an incorrect phone number, inaccessible address, or recipient unavailability.
          </li>
          <li>
            <strong>Subjective Taste Preferences:</strong> Personal variations in sweet tolerance or flavor preferences where the item was prepared strictly according to our recipe standards.
          </li>
          <li>
            <strong>Improper Storage After Handover:</strong> Melting, structural issues, or spoilage caused by leaving cream cakes unrefrigerated in ambient heat after successful delivery.
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="font-display font-bold text-xl sm:text-2xl text-brand-cocoa flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-brand-pink" />
          <span>4. Refund Method & Processing Time</span>
        </h2>
        <p>
          Once approved by our bakery manager:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-brand-cocoa/85">
          <li>
            <strong>Prepaid Orders (Razorpay / UPI / Cards):</strong> The refund will be credited directly back to the original source bank account or UPI VPA used during checkout. Standard banking settlement takes <strong>5 to 7 business days</strong>.
          </li>
          <li>
            <strong>Cash on Delivery (COD) Orders:</strong> If an issue arises with an accepted COD order, refunds are processed via direct NEFT/IMPS bank transfer or instant UPI payment upon verification of your payment receipt.
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="font-display font-bold text-xl sm:text-2xl text-brand-cocoa flex items-center gap-2">
          <Clock className="w-5 h-5 text-brand-pink" />
          <span>5. How to File a Claim</span>
        </h2>
        <p>
          Please email your Order ID, contact number, and clear photos/videos of the item to{' '}
          <a href="mailto:hellofrostingfairy@gmail.com" className="text-brand-pink hover:underline font-bold">
            hellofrostingfairy@gmail.com
          </a>{' '}
          within 24 hours of receiving the order. Our customer care team will respond within 4–6 business hours.
        </p>
      </section>
    </LegalPageLayout>
  );
}

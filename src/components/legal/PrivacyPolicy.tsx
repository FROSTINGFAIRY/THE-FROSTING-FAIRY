import React from 'react';
import LegalPageLayout from './LegalPageLayout';
import { Shield, Lock, Database, UserCheck, Trash2, Mail } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      lastUpdated="August 31, 2026"
      metaDescription="Privacy Policy for The Frosting Fairy - Learn how we handle your order data, privacy, and guest checkout with complete transparency."
    >
      <section className="space-y-4">
        <h2 className="font-display font-bold text-xl sm:text-2xl text-brand-cocoa flex items-center gap-2">
          <Shield className="w-5 h-5 text-brand-pink" />
          <span>1. Introduction & Our Commitment</span>
        </h2>
        <p>
          At <strong>The Frosting Fairy</strong> (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;), we cherish your trust as much as our artisan recipes. This Privacy Policy explains transparently how we collect, use, and protect your personal information when you browse our boutique storefront and place orders through our website.
        </p>
        <p>
          We operate as an Indian Direct-to-Consumer (D2C) artisan bakery. We operate on a <strong>frictionless guest-checkout model</strong>: you do not need to register a user account, memorize passwords, or provide unnecessary personal details to enjoy our confectionery.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-display font-bold text-xl sm:text-2xl text-brand-cocoa flex items-center gap-2">
          <Database className="w-5 h-5 text-brand-pink" />
          <span>2. Information We Collect and Why</span>
        </h2>
        <p>
          When you place a bakery order or schedule a custom cake for pickup or doorstep delivery, we collect only the minimal details necessary to bake, personalize, and deliver your treats:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-brand-cocoa/85">
          <li>
            <strong>Customer Full Name:</strong> To label your cake box and identify your order at our boutique pickup counter or upon delivery arrival.
          </li>
          <li>
            <strong>Contact Phone Number:</strong> To coordinate delivery arrival, provide real-time WhatsApp or phone updates, or clarify custom cake piping instructions.
          </li>
          <li>
            <strong>Delivery Address & Optional Coordinates:</strong> If you select Home Delivery, we collect your street address to route our delivery partner safely to your doorstep.
          </li>
          <li>
            <strong>Order Customizations & Piping Messages:</strong> Inscription text (e.g. &ldquo;Happy Birthday&rdquo;), dietary flavor choices, custom weight options, and box selections to bake your order accurately.
          </li>
          <li>
            <strong>Payment Reference Metadata:</strong> When you complete checkout via Razorpay (UPI, debit/credit cards, netbanking), Razorpay transmits transaction verification references (e.g., payment ID, status) to confirm receipt. <em>We never store your raw credit/debit card numbers or UPI PINs on our servers.</em>
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="font-display font-bold text-xl sm:text-2xl text-brand-cocoa flex items-center gap-2">
          <Lock className="w-5 h-5 text-brand-pink" />
          <span>3. Cloud Storage & Data Processors</span>
        </h2>
        <p>
          Your order records are securely stored in our cloud-hosted database (<strong>Google Cloud Platform / Firebase Firestore</strong> in Europe/India data regions) inside the protected <code>orders</code> collection. Access is restricted to authorized bakery staff and system dispatchers.
        </p>
        <p>
          We rely on trusted, industry-standard third-party processors strictly for operational fulfillment:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-brand-cocoa/85">
          <li><strong>Razorpay Software Pvt. Ltd.:</strong> PCI-DSS Level 1 certified payment gateway handling online card, netbanking, and UPI processing.</li>
          <li><strong>Google Cloud Platform / Firebase:</strong> Infrastructure host for database management and secure hosting.</li>
          <li><strong>Google Maps Platform:</strong> To help you pinpoint delivery coordinates and locate our storefront on an interactive map.</li>
        </ul>
        <div className="p-4 bg-brand-pink-light/30 rounded-2xl border border-brand-pink-accent/40 text-xs sm:text-sm font-medium text-brand-cocoa space-y-1">
          <span className="font-bold text-brand-pink-dark block">Zero Data Selling Guarantee:</span>
          <span>We will never sell, rent, monetize, or trade your personal contact details, phone numbers, or order histories with third-party advertisers or data brokers under any circumstances.</span>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display font-bold text-xl sm:text-2xl text-brand-cocoa flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-brand-pink" />
          <span>4. Local Storage vs. Tracking Cookies</span>
        </h2>
        <p>
          We do not deploy invasive third-party cross-site advertising cookies. Instead, our application uses standard client-side browser <code>localStorage</code> purely to remember essential app preferences:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-brand-cocoa/85">
          <li><code>tff_shopping_list</code>: Holds your live shopping cart items while you browse.</li>
          <li><code>tff_theme</code>: Remembers whether you prefer Light or Midnight Velvet theme mode.</li>
          <li><code>tff_my_orders</code>: Allows you to view your recent local order receipts directly on your personal device without requiring an account login.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="font-display font-bold text-xl sm:text-2xl text-brand-cocoa flex items-center gap-2">
          <Trash2 className="w-5 h-5 text-brand-pink" />
          <span>5. Data Retention & Right to Erasure</span>
        </h2>
        <p>
          We retain order history logs for accounting, tax compliance, and order dispute resolution as required under Indian commercial regulations.
        </p>
        <p>
          If you wish to inspect or permanently delete your phone number and delivery address from our active database records, please contact our data coordinator at{' '}
          <a href="mailto:hellofrostingfairy@gmail.com" className="text-brand-pink hover:underline font-bold">
            hellofrostingfairy@gmail.com
          </a>
          . We process verified data erasure requests within 7 business days.
        </p>
      </section>
    </LegalPageLayout>
  );
}

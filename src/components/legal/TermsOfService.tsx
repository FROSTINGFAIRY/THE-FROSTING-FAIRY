import React from 'react';
import LegalPageLayout from './LegalPageLayout';
import { FileText, CheckCircle2, AlertCircle, Copyright, Scale, HelpCircle } from 'lucide-react';

export default function TermsOfService() {
  return (
    <LegalPageLayout
      title="Terms of Service"
      lastUpdated="August 31, 2026"
      metaDescription="Terms of Service for The Frosting Fairy confectionery store - Order confirmation, intellectual property, pricing, and governing laws."
    >
      <section className="space-y-4">
        <h2 className="font-display font-bold text-xl sm:text-2xl text-brand-cocoa flex items-center gap-2">
          <FileText className="w-5 h-5 text-brand-pink" />
          <span>1. Acceptance of Terms</span>
        </h2>
        <p>
          Welcome to <strong>The Frosting Fairy</strong>. By accessing our website, placing an order, or utilizing our services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please refrain from using our service.
        </p>
        <p>
          These Terms apply to all visitors, customers, and patrons of our bakery storefront and online ordering platform in India.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-display font-bold text-xl sm:text-2xl text-brand-cocoa flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-brand-pink" />
          <span>2. Order Placement & Confirmation</span>
        </h2>
        <p>
          An order is officially accepted and queued into our kitchen schedule only upon either:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-brand-cocoa/85">
          <li><strong>Direct UPI Payment Verification:</strong> Receipt and verification of UPI payment via merchant UPI ID or QR code.</li>
          <li><strong>Cash on Delivery (COD) Confirmation:</strong> Successful placement of a valid Cash on Delivery order where COD service is active for your area.</li>
        </ul>
        <p>
          We reserve the right to decline, cancel, or refund an order in the rare event of severe ingredient supply shortages, unforeseen kitchen outages, extreme weather conditions preventing safe transit, or suspected fraudulent activity.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-display font-bold text-xl sm:text-2xl text-brand-cocoa flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-brand-pink" />
          <span>3. Pricing, Menu Availability & Variations</span>
        </h2>
        <p>
          All prices are listed in Indian Rupees (₹ INR) and include all applicable taxes unless explicitly noted. We strive for 100% price accuracy, but prices and product availability are subject to change without prior notice.
        </p>
        <p>
          Because our cakes, cupcakes, brownies, and pastries are <em>handcrafted in small artisanal batches</em>, minor visual differences in piping textures, natural fruit shades, and decorative embellishments may occur compared to studio catalog photographs.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-display font-bold text-xl sm:text-2xl text-brand-cocoa flex items-center gap-2">
          <Copyright className="w-5 h-5 text-brand-pink" />
          <span>4. Intellectual Property Rights</span>
        </h2>
        <p>
          All content published on this website—including but not limited to brand names (&ldquo;The Frosting Fairy&rdquo;), logos, recipe designs, pastry imagery, descriptions, visual branding, and website code—is the proprietary intellectual property of <strong>The Frosting Fairy Confectionery</strong> and protected under Indian and international copyright laws.
        </p>
        <p>
          You may not scrape, reproduce, redistribute, or commercially exploit any content from this site without our prior written consent.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-display font-bold text-xl sm:text-2xl text-brand-cocoa flex items-center gap-2">
          <Scale className="w-5 h-5 text-brand-pink" />
          <span>5. Limitation of Liability & Governing Law</span>
        </h2>
        <p>
          To the maximum extent permitted under applicable law, The Frosting Fairy shall not be liable for any indirect, incidental, or consequential damages resulting from delays caused by traffic disruptions, severe weather, courier delays, or incorrect recipient delivery addresses provided at checkout. Our aggregate financial liability for any claim shall not exceed the actual amount paid by you for the specific order in dispute.
        </p>
        <p>
          These Terms of Service are governed by and construed in accordance with the laws of <strong>India</strong>. Any disputes arising in connection with these terms shall be subject to the exclusive jurisdiction of the competent courts in India.
        </p>
      </section>
    </LegalPageLayout>
  );
}

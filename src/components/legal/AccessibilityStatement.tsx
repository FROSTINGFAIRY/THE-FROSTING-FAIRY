import React from 'react';
import LegalPageLayout from './LegalPageLayout';
import { Eye, Heart, Sparkles, MessageCircle, Mail } from 'lucide-react';

export default function AccessibilityStatement() {
  return (
    <LegalPageLayout
      title="Accessibility Statement"
      lastUpdated="August 31, 2026"
      metaDescription="Accessibility Statement for The Frosting Fairy - Our ongoing commitment to ensuring digital accessibility for all dessert lovers."
    >
      <section className="space-y-4">
        <h2 className="font-display font-bold text-xl sm:text-2xl text-brand-cocoa flex items-center gap-2">
          <Heart className="w-5 h-5 text-brand-pink" />
          <span>1. Our Aspirational Commitment</span>
        </h2>
        <p>
          At <strong>The Frosting Fairy</strong>, we believe everyone deserves seamless access to delicious treats. We are committed to making our digital storefront and ordering experience inclusive, intuitive, and accessible to visitors of all abilities, including patrons with visual, auditory, motor, or cognitive impairments.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-display font-bold text-xl sm:text-2xl text-brand-cocoa flex items-center gap-2">
          <Eye className="w-5 h-5 text-brand-pink" />
          <span>2. Ongoing Improvements & Design Practices</span>
        </h2>
        <p>
          We are continuously refining our web application to enhance accessibility across devices and screen readers. Key features we actively maintain include:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-brand-cocoa/85">
          <li>
            <strong>High-Contrast Theming:</strong> Offering both our signature warm light palette and a high-contrast <em>Midnight Velvet</em> dark mode for optimal readability in varying lighting conditions.
          </li>
          <li>
            <strong>Keyboard Accessibility:</strong> Ensuring navigation links, buttons, and interactive modal dialogs can be accessed and operated using keyboard commands.
          </li>
          <li>
            <strong>Descriptive Alt Text & Labels:</strong> Providing meaningful labels on product photos, flavor cards, and form inputs for screen reader software.
          </li>
          <li>
            <strong>Clear Responsive Typography:</strong> Using legible font scales with adequate line heights and generous touch targets (min. 44px) on mobile interfaces.
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="font-display font-bold text-xl sm:text-2xl text-brand-cocoa flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-brand-pink" />
          <span>3. Feedback & Contact Assistance</span>
        </h2>
        <p>
          Accessibility is an ongoing journey. If you encounter any barrier, difficulty navigating our menu, or have suggestions for enhancing our user experience, we warmly welcome your feedback.
        </p>
        <p>
          Please reach out to our team at{' '}
          <a href="mailto:hellofrostingfairy@gmail.com" className="text-brand-pink hover:underline font-bold">
            hellofrostingfairy@gmail.com
          </a>
          . We will be delighted to assist you directly with placing your order or answering any inquiries over email or phone.
        </p>
      </section>
    </LegalPageLayout>
  );
}

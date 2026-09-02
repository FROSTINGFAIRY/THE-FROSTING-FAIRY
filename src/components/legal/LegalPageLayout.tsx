import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, ShieldCheck, Mail, MapPin, Cake } from 'lucide-react';
import { motion } from 'motion/react';

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  metaDescription?: string;
  children: React.ReactNode;
}

export default function LegalPageLayout({
  title,
  lastUpdated,
  metaDescription,
  children,
}: LegalPageLayoutProps) {
  useEffect(() => {
    document.title = `${title} | The Frosting Fairy`;
    if (metaDescription) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'description');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', metaDescription);
    }
  }, [title, metaDescription]);

  return (
    <div className="flex-1 bg-brand-cream text-brand-cocoa py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-4xl mx-auto"
      >
        {/* Navigation Breadcrumb Back to Home */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest bg-white text-brand-cocoa hover:text-brand-pink hover:bg-brand-pink-light/30 border border-brand-cocoa-border shadow-2xs transition-all group"
          >
            <ArrowLeft className="w-4 h-4 text-brand-pink transition-transform group-hover:-translate-x-1" />
            <span>Back to Home</span>
          </Link>

          <Link
            to="/shop"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-brand-cocoa-light hover:text-brand-pink transition-colors"
          >
            <Cake className="w-3.5 h-3.5 text-brand-pink" />
            <span>Explore Boutique Menu</span>
          </Link>
        </div>

        {/* Header Section */}
        <header className="bg-white rounded-3xl p-6 sm:p-10 border border-brand-cocoa-border shadow-xs mb-8">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-brand-pink font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Frosting Fairy • Legal & Compliance</span>
          </div>

          <h1 className="font-display font-black text-2xl sm:text-4xl text-brand-cocoa tracking-tight mb-4">
            {title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-brand-cocoa-light pt-3 border-t border-brand-cocoa-border/40">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-brand-pink" />
              <span>Official Confectionery Policy</span>
            </span>
            <span className="text-brand-cocoa-light/40">•</span>
            <span>Last Updated: <strong className="text-brand-cocoa font-bold">{lastUpdated}</strong></span>
          </div>
        </header>

        {/* Document Body */}
        <article className="bg-white rounded-3xl p-6 sm:p-10 border border-brand-cocoa-border shadow-xs leading-relaxed text-sm sm:text-base space-y-8 text-brand-cocoa/90 font-sans">
          {children}

          {/* Direct Support & Escalation Callout Box */}
          <div className="mt-12 pt-8 border-t border-brand-cocoa-border/60 bg-brand-cream-light/40 -mx-6 sm:-mx-10 -mb-6 sm:-mb-10 p-6 sm:p-8 rounded-b-3xl space-y-3">
            <h4 className="font-display font-bold text-base text-brand-cocoa flex items-center gap-2">
              <Mail className="w-4 h-4 text-brand-pink" />
              <span>Questions or Inquiries Regarding this Policy?</span>
            </h4>
            <p className="text-xs sm:text-sm text-brand-cocoa-light leading-relaxed">
              If you have any questions, require special allergen coordination, or wish to request data clearance, our support team and master bakers are happy to assist you.
            </p>
            <div className="flex flex-wrap gap-4 pt-2 text-xs font-semibold">
              <a
                href="mailto:hellofrostingfairy@gmail.com"
                className="text-brand-pink hover:text-brand-pink-dark underline font-bold flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>hellofrostingfairy@gmail.com</span>
              </a>
              <span className="text-brand-cocoa-light/40">•</span>
              <span className="text-brand-cocoa flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-brand-pink" />
                <span>The Frosting Fairy Kitchen, India</span>
              </span>
            </div>
          </div>
        </article>
      </motion.div>
    </div>
  );
}

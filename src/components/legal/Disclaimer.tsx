import React from 'react';
import LegalPageLayout from './LegalPageLayout';
import { AlertCircle, HeartPulse, Sparkles, HelpCircle, Info } from 'lucide-react';

export default function Disclaimer() {
  return (
    <LegalPageLayout
      title="Allergen & Product Disclaimer"
      lastUpdated="August 31, 2026"
      metaDescription="Allergen and Product Disclaimer for The Frosting Fairy - Nutritional guidance, allergy advisory, and handmade variation details."
    >
      <section className="space-y-4">
        <h2 className="font-display font-bold text-xl sm:text-2xl text-brand-cocoa flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-brand-pink" />
          <span>1. Allergen & Kitchen Cross-Contact Advisory</span>
        </h2>
        <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl text-xs sm:text-sm text-amber-950 leading-relaxed space-y-2">
          <span className="font-bold font-display text-sm text-amber-900 block flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            Important Allergy Information
          </span>
          <p>
            Our bakery processes common food allergens including <strong>Wheat (Gluten), Dairy (Milk, Butter, Cream Cheese), Eggs, Tree Nuts (Almonds, Pistachios, Hazelnuts, Walnuts), Peanuts, and Soy</strong>.
          </p>
          <p>
            While we follow rigorous sanitary and kitchen segregation procedures between batches, all items are crafted in a shared facility. We cannot guarantee 100% allergen-free preparation for individuals with life-threatening allergies (anaphylaxis).
          </p>
        </div>
        <p>
          If you or your event guests have specific dietary sensitivities or eggless preferences, please contact our team via <a href="mailto:hellofrostingfairy@gmail.com" className="text-brand-pink hover:underline font-bold">hellofrostingfairy@gmail.com</a> prior to placing your order.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-display font-bold text-xl sm:text-2xl text-brand-cocoa flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-brand-pink" />
          <span>2. Artisanal & Handmade Variations</span>
        </h2>
        <p>
          Every dessert at The Frosting Fairy is crafted individually by skilled pastry chefs and hand-piped. Consequently:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-brand-cocoa/85">
          <li>Exact color hues, piping swatches, sprinkle placement, and ribbon trims may vary slightly from website gallery imagery.</li>
          <li>Fresh berries and fruit garnishes are subject to seasonal natural variations in size, color, and natural sweetness.</li>
          <li>Final weight tolerances for custom cream and sponge cakes can vary by ±5% to 8% due to natural moisture absorption and artisan layering.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="font-display font-bold text-xl sm:text-2xl text-brand-cocoa flex items-center gap-2">
          <HeartPulse className="w-5 h-5 text-brand-pink" />
          <span>3. Nutritional Estimates (Not Medical Advice)</span>
        </h2>
        <p>
          Any calorie counts, protein estimates, or macronutrient figures displayed on our recipe cards or menu pages are approximate guidelines calculated using standard culinary reference tables. They are provided for informational context only and do not constitute medical, dietary, or clinical nutritional advice.
        </p>
      </section>
    </LegalPageLayout>
  );
}

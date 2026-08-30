/**
 * Legacy storage key migration utility.
 * Runs on startup to safely convert 'gusto_' keys to 'tff_' keys.
 */
export function migrateKey(oldKey: string, newKey: string): void {
  try {
    if (localStorage.getItem(newKey) === null) {
      const old = localStorage.getItem(oldKey);
      if (old !== null) {
        localStorage.setItem(newKey, old);
        localStorage.removeItem(oldKey);
      }
    }
  } catch (err) {
    console.warn(`Failed migrating localStorage key ${oldKey} to ${newKey}:`, err);
  }
}

export function runStartupStorageMigrations(): void {
  const migrations: [string, string][] = [
    ['gusto_theme', 'tff_theme'],
    ['gusto_shopping_list', 'tff_shopping_list'],
    ['gusto_meal_plan', 'tff_my_orders'],
    ['gusto_testimonials', 'tff_testimonials'],
    ['gusto_whatsapp_enabled', 'tff_whatsapp_enabled'],
    ['gusto_simulated_emails', 'tff_simulated_emails'],
    ['gusto_uploaded_logo_presets', 'tff_uploaded_logo_presets'],
    ['gusto_recipes', 'tff_recipes'],
    ['gusto_logo', 'tff_logo'],
    ['gusto_website_name', 'tff_website_name'],
    ['gusto_website_slogan', 'tff_website_slogan'],
  ];

  for (const [oldKey, newKey] of migrations) {
    migrateKey(oldKey, newKey);
  }
}

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const IMAGES_DIR = path.resolve(process.cwd(), 'src/assets/images');

async function optimizeImages() {
  if (!fs.existsSync(IMAGES_DIR)) {
    console.error(`Images directory not found at: ${IMAGES_DIR}`);
    return;
  }

  const files = fs.readdirSync(IMAGES_DIR);
  const jpgFiles = files.filter(file => file.endsWith('.jpg') || file.endsWith('.jpeg'));

  console.log(`Found ${jpgFiles.length} JPG files to optimize in ${IMAGES_DIR}`);

  let totalOriginalBytes = 0;
  let totalOptimizedBytes = 0;

  for (const file of jpgFiles) {
    const inputPath = path.join(IMAGES_DIR, file);
    const parsed = path.parse(file);
    const outputPath = path.join(IMAGES_DIR, `${parsed.name}.webp`);

    const originalStats = fs.statSync(inputPath);
    totalOriginalBytes += originalStats.size;

    // Check if it's a hero / banner / collection / logo image vs regular product card
    const isHeroOrBanner =
      parsed.name.includes('collection') ||
      parsed.name.includes('logo') ||
      parsed.name.includes('banner') ||
      parsed.name.includes('hero') ||
      parsed.name.includes('assorted');

    const maxDimension = isHeroOrBanner ? 1600 : 800;

    await sharp(inputPath)
      .resize(maxDimension, maxDimension, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toFile(outputPath);

    const optimizedStats = fs.statSync(outputPath);
    totalOptimizedBytes += optimizedStats.size;

    console.log(
      `Optimized ${file} (${(originalStats.size / 1024).toFixed(1)} KB) -> ${parsed.name}.webp (${(optimizedStats.size / 1024).toFixed(1)} KB) [max ${maxDimension}px]`
    );
  }

  console.log('--- Summary ---');
  console.log(`Total original size: ${(totalOriginalBytes / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`Total optimized size: ${(totalOptimizedBytes / (1024 * 1024)).toFixed(2)} MB`);
  console.log(
    `Saved: ${((1 - totalOptimizedBytes / totalOriginalBytes) * 100).toFixed(1)}% (${((totalOriginalBytes - totalOptimizedBytes) / (1024 * 1024)).toFixed(2)} MB)`
  );
}

optimizeImages().catch(err => {
  console.error('Optimization failed:', err);
  process.exit(1);
});

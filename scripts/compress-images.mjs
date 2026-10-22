import sharp from 'sharp';
import fs from 'fs';

async function compressAll() {
  const tasks = [
    { input: 'public/images/desktop-hero-clean.jpg', output: 'public/images/desktop-hero-clean.webp', width: 1920, quality: 82 },
    { input: 'public/images/mobile-hero-clean.jpg', output: 'public/images/mobile-hero-clean.webp', width: 900, quality: 82 },
    { input: 'public/images/card-books-rect.jpg', output: 'public/images/card-books-rect.webp', width: 800, quality: 82 },
    { input: 'public/images/card-seva-rect.jpg', output: 'public/images/card-seva-rect.webp', width: 800, quality: 82 },
    { input: 'public/images/card-thought-rect.jpg', output: 'public/images/card-thought-rect.webp', width: 800, quality: 82 },
  ];

  for (const t of tasks) {
    if (fs.existsSync(t.input)) {
      await sharp(t.input)
        .resize({ width: t.width, withoutEnlargement: true })
        .webp({ quality: t.quality })
        .toFile(t.output);
      const size = fs.statSync(t.output).size;
      console.log(`Compressed ${t.output}: ${(size / 1024).toFixed(1)} KB`);
    } else {
      console.log(`File not found: ${t.input}`);
    }
  }
}

compressAll();

import fs from 'fs';
import path from 'path';

const artifactsDir = 'C:/Users/GHM/.gemini/antigravity-ide/brain/9143286a-54c0-4385-a47a-9693f71af3ce';
const outDir = 'public/images';

const files = [
  { src: 'founder_philosophy_clean_bg_1793183318267.jpg', dest: 'founder-philosophy-bg.jpg' },
  { src: 'founder_karma_clean_bg_1793183355239.jpg', dest: 'founder-karma-bg.jpg' },
];

for (const f of files) {
  const srcPath = path.join(artifactsDir, f.src);
  const destPath = path.join(outDir, f.dest);
  fs.copyFileSync(srcPath, destPath);
  console.log(`Copied ${f.src} -> ${destPath}`);
}

import fs from 'fs';
import path from 'path';

const artifactsDir = 'C:/Users/GHM/.gemini/antigravity-ide/brain/9143286a-54c0-4385-a47a-9693f71af3ce';
const outDir = 'public/images';

const files = [
  { src: 'hd_pillar_farmer_1793181721103.jpg', dest: 'pillar-farmer.jpg' },
  { src: 'hd_pillar_women_1793181743731.jpg', dest: 'pillar-women.jpg' },
  { src: 'hd_pillar_youth_1793181765619.jpg', dest: 'pillar-youth.jpg' },
  { src: 'hd_pillar_spiritual_1793181792591.jpg', dest: 'pillar-spiritual.jpg' },
];

for (const f of files) {
  const srcPath = path.join(artifactsDir, f.src);
  const destPath = path.join(outDir, f.dest);
  fs.copyFileSync(srcPath, destPath);
  console.log(`Copied ${f.src} -> ${destPath}`);
}

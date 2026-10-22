import sharp from 'sharp';

async function run() {
  // Let's create a clean white rectangle covering y: 755 to 825
  const rect = Buffer.from(
    `<svg width="1024" height="75"><rect x="0" y="0" width="1024" height="75" fill="#ffffff"/></svg>`
  );
  
  await sharp('public/images/event-katha-graphic.jpg')
    .composite([{ input: rect, top: 755, left: 0 }])
    .toFile('public/images/event-katha-clean.jpg');
    
  console.log('Cleaned event graphic created');
}

run();

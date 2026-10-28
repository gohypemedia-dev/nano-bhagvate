import sharp from 'sharp';

async function cropFromSevaPillars() {
  // seva_pillars_images_1793166438043.png is 1424 x 805
  // Let's crop each card's photo area cleanly
  // Top left: Farmer
  // Top right: Women
  // Bottom left: Youth
  // Bottom right: Spiritual
  
  // Card 1: Farmer
  // Card 2: Women
  // Card 3: Youth
  // Card 4: Spiritual

  const meta = await sharp('C:/Users/GHM/.gemini/antigravity-ide/brain/9143286a-54c0-4385-a47a-9693f71af3ce/seva_pillars_images_1793166438043.png').metadata();
  console.log('Image dimensions:', meta.width, meta.height);
}

cropFromSevaPillars();

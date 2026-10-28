import https from 'https';

function fetchPage(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve(data));
    }).on('error', (e) => resolve(''));
  });
}

async function main() {
  for (const path of ['/', '/pages/about-us', '/pages/our-initiatives']) {
    const html = await fetchPage('https://namobhagwatevasudevaya.com' + path);
    const images = Array.from(html.matchAll(/(?:src|data-src|srcset)=["']([^"']+\.(?:jpg|jpeg|png|webp)[^"']*)["']/gi)).map(m => m[1]);
    console.log(`=== ${path} (${images.length} images) ===`);
    images.forEach(img => {
      if (img.includes('cdn/shop/files') && !img.includes('Untitled_design_14')) {
        console.log(img);
      }
    });
  }
}

main();

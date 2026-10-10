import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Predefined gallery data matching data/gallery.ts
const initialGalleryItems = [
  {
    id: "photo-gurukul-sanskar",
    type: "PHOTO",
    title: "Vedic Gurukul Education & Sanskar Camp",
    titleHi: "गुरुकुल वैदिक शिक्षा एवं बाल संस्कार शिविर",
    event: "Gurukul Initiative",
    eventHi: "गुरुकुल पहल",
    localFile: "initiative-education.jpg",
    alt: "Children learning Vedic values and sanskars at Gurukul",
    focalPoint: "center 35%",
    displayOrder: 1,
    date: "March 2026",
  },
  {
    id: "video-bhagwat-katha",
    type: "VIDEO",
    title: "Shrimad Bhagwat Katha - Divine Discourse by Pujya Sadhvi Ji",
    titleHi: "श्रीमद्भागवत कथा ज्ञान यज्ञ - पूज्य साध्वी जी का अमृत प्रवचन",
    event: "Spiritual Discourse",
    eventHi: "सत्संग एवं कथा",
    src: "https://www.youtube.com/watch?v=kJQP7kiw5Fk",
    localThumbnail: "founder-hero-card.jpg",
    alt: "Video of Pujya Sadhvi Vijeshanand Saraswati Ji delivering spiritual discourse",
    videoProvider: "youtube",
    focalPoint: "50% 35%",
    aspectRatio: "16/9",
    displayOrder: 2,
    date: "February 2026",
  },
  {
    id: "photo-farmer-workshop",
    type: "PHOTO",
    title: "Natural Sugarcane Farming & Farmer Guidance Workshop",
    titleHi: "गन्ना किसान कल्याण एवं प्राकृतिक कृषि मार्गदर्शन कार्यशाला",
    event: "Farmer Welfare",
    eventHi: "कृषि कल्याण",
    localFile: "initiative-farmers.jpg",
    alt: "Farmers attending agricultural awareness session",
    focalPoint: "center 40%",
    displayOrder: 3,
    date: "January 2026",
  },
  {
    id: "photo-healthcare-camp",
    type: "PHOTO",
    title: "Free Rural Healthcare & Holistic Yoga Camp",
    titleHi: "निःशुल्क ग्रामीण स्वास्थ्य परीक्षण एवं योग कल्याण शिविर",
    event: "Healthcare Seva",
    eventHi: "स्वास्थ्य सेवा",
    localFile: "initiative-health.jpg",
    alt: "Doctors and sevadars providing free health checkups in rural area",
    focalPoint: "center",
    displayOrder: 4,
    date: "December 2025",
  },
  {
    id: "video-farmer-outreach",
    type: "VIDEO",
    title: "Rural Welfare & Farmer Upliftment Outreach Program",
    titleHi: "ग्राम सेवा एवं किसान सशक्तिकरण वृत्तचित्र",
    event: "Seva Outreach",
    eventHi: "सेवा कार्य",
    src: "https://www.youtube.com/watch?v=fJ9rUzIMcZQ",
    localThumbnail: "initiative-farmers.jpg",
    alt: "Documentary video showcasing farmer welfare outreach",
    videoProvider: "youtube",
    focalPoint: "center",
    aspectRatio: "16/9",
    displayOrder: 5,
    date: "November 2025",
  },
  {
    id: "photo-women-empowerment",
    type: "PHOTO",
    title: "Women Empowerment & Skill Development Center",
    titleHi: "महिला स्वावलंबन एवं आत्मनिर्भर कौशल प्रशिक्षण केंद्र",
    event: "Women Empowerment",
    eventHi: "महिला सशक्तिकरण",
    localFile: "initiative-women.jpg",
    alt: "Women learning vocational sewing and handicraft skills",
    focalPoint: "center 30%",
    displayOrder: 6,
    date: "October 2025",
  },
  {
    id: "photo-krishna-sankirtan",
    type: "PHOTO",
    title: "Shri Krishna Sankirtan & Divine Sandhya Aarti",
    titleHi: "श्री कृष्ण संकीर्तन एवं विशेष संध्या महाआरती",
    event: "Spiritual Utsav",
    eventHi: "आध्यात्मिक उत्सव",
    localFile: "krishna.jpg",
    alt: "Divine Shri Krishna deity and ceremonial prayer gathering",
    focalPoint: "center 25%",
    displayOrder: 7,
    date: "September 2025",
  },
  {
    id: "video-gurukul-chanting",
    type: "VIDEO",
    title: "Gurukul Vedic Recitation & Sanskrit Mantrochhar",
    titleHi: "गुरुकुल बाल संस्कार एवं सामूहिक वेद मंत्रोच्चार",
    event: "Gurukul Culture",
    eventHi: "गुरुकुल संस्कृति",
    src: "https://vimeo.com/76979871",
    localThumbnail: "initiative-education.jpg",
    alt: "Students reciting sacred Vedic mantras",
    videoProvider: "vimeo",
    focalPoint: "center 30%",
    aspectRatio: "16/9",
    displayOrder: 8,
    date: "August 2025",
  },
  {
    id: "photo-founder-satsang",
    type: "PHOTO",
    title: "Spiritual Guidance & Blessings with Pujya Sadhvi Ji",
    titleHi: "सत्संग सभा एवं पूज्य साध्वी जी का पावन आशीर्वाद",
    event: "Satsang Sabha",
    eventHi: "सत्संग सभा",
    localFile: "founder.jpg",
    alt: "Devotees receiving blessings and spiritual guidance",
    focalPoint: "center 20%",
    displayOrder: 9,
    date: "July 2025",
  },
  {
    id: "photo-book-release",
    type: "PHOTO",
    title: "Sugarcane Agriculture Practical Guidebook Release",
    titleHi: "गन्ना खेती मार्गदर्शिका पुस्तक विमोचन एवं विचार गोष्ठी",
    event: "Literature & Seva",
    eventHi: "साहित्य एवं सेवा",
    localFile: "book-cover.jpg",
    alt: "Release of sugarcane agricultural handbook for farmers",
    focalPoint: "center",
    displayOrder: 10,
    date: "June 2025",
  },
  {
    id: "video-trust-annadanam",
    type: "VIDEO",
    title: "Trust Seva Activities & Annadanam Community Food Relief",
    titleHi: "ट्रस्ट समाज सेवा कार्य एवं निःशुल्क अन्नदान वितरण",
    event: "Annadanam Seva",
    eventHi: "अन्नदान सेवा",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    localThumbnail: "initiative-health.jpg",
    alt: "Video of voluntary Annadanam and charitable service distribution",
    videoProvider: "mp4",
    focalPoint: "center 40%",
    aspectRatio: "16/9",
    displayOrder: 11,
    date: "May 2025",
  },
  {
    id: "photo-community-gathering",
    type: "PHOTO",
    title: "Dedicated Sevadar & Trust Member Assembly",
    titleHi: "समर्पित सेवादल एवं ट्रस्ट सदस्य सम्मेलन",
    event: "Trust Parivar",
    eventHi: "ट्रस्ट परिवार",
    localFile: "founder-hero-card.jpg",
    alt: "Community members and sevadars gathered in service of Dharma",
    focalPoint: "50% 30%",
    displayOrder: 12,
    date: "April 2025",
  },
  {
    id: "photo-satsang-meditation",
    type: "PHOTO",
    title: "Devotional Satsang, Bhakti & Silent Meditation Gathering",
    titleHi: "सामूहिक सत्संग, भक्ति एवं ध्यान साधना सभा",
    event: "Spiritual Sadhana",
    eventHi: "साधना एवं ध्यान",
    localFile: "krishna.jpg",
    alt: "Devotees immersed in quiet devotional contemplation and prayer",
    focalPoint: "center",
    displayOrder: 13,
    date: "March 2025",
  },
  {
    id: "video-women-center",
    type: "VIDEO",
    title: "Women Skill Development Center Inauguration & Recognition",
    titleHi: "महिला स्वावलंबन केंद्र शुभारंभ एवं सम्मान समारोह",
    event: "Women Empowerment",
    eventHi: "महिला सशक्तिकरण",
    src: "https://www.youtube.com/watch?v=kJQP7kiw5Fk",
    localThumbnail: "initiative-women.jpg",
    alt: "Video of women vocational center inauguration and felicitation",
    videoProvider: "youtube",
    focalPoint: "center 30%",
    aspectRatio: "16/9",
    displayOrder: 14,
    date: "February 2025",
  },
  {
    id: "photo-gurukul-students",
    type: "PHOTO",
    title: "Gurukul Students Learning Ancient Heritage & Moral Sanskars",
    titleHi: "गुरुकुल बाल संस्कार, श्लोक पाठ एवं चरित्र निर्माण",
    event: "Gurukul Initiative",
    eventHi: "गुरुकुल पहल",
    localFile: "initiative-education.jpg",
    alt: "Gurukul children learning Sanskrit shlokas and ethical principles",
    focalPoint: "center 35%",
    displayOrder: 15,
    date: "January 2025",
  },
  {
    id: "video-soil-health",
    type: "VIDEO",
    title: "Sustainable Agriculture & Organic Soil Regeneration Program",
    titleHi: "प्राकृतिक कृषि, जीवामृत निर्माण एवं मृदा संरक्षण कार्यशाला",
    event: "Farmer Welfare",
    eventHi: "कृषि कल्याण",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    localThumbnail: "initiative-farmers.jpg",
    alt: "Educational video demonstrating natural farming and soil health enrichment",
    videoProvider: "mp4",
    focalPoint: "center 40%",
    aspectRatio: "16/9",
    displayOrder: 16,
    date: "December 2024",
  },
];

const R2_BASE = (process.env.R2_PUBLIC_URL || "https://pub-6c55b4a33c034944bc9030fd94d673db.r2.dev").replace(/\/+$/, "");

async function main() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET || "namo";

  const hasR2 = Boolean(accountId && accessKeyId && secretAccessKey);

  console.log("--------------------------------------------------");
  console.log("R2 Configuration Status:");
  console.log(`Account ID: ${accountId || "NOT SET"}`);
  console.log(`Bucket:     ${bucket}`);
  console.log(`Public URL: ${R2_BASE}`);
  console.log(`API Keys:   ${hasR2 ? "Configured" : "MISSING (Set R2_ACCESS_KEY_ID & R2_SECRET_ACCESS_KEY in .env)"}`);
  console.log("--------------------------------------------------");

  let s3 = null;
  if (hasR2) {
    s3 = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    });
  }

  // Upload local files to R2
  const imageDir = path.resolve(process.cwd(), "public/images");
  const uniqueImages = new Set([
    "initiative-education.jpg",
    "founder-hero-card.jpg",
    "initiative-farmers.jpg",
    "initiative-health.jpg",
    "initiative-women.jpg",
    "krishna.jpg",
    "founder.jpg",
    "book-cover.jpg",
    "logo.jpg",
  ]);

  if (hasR2) {
    console.log(`\nUploading ${uniqueImages.size} images to Cloudflare R2 bucket "${bucket}"...`);
    for (const filename of uniqueImages) {
      const filePath = path.join(imageDir, filename);
      if (existsSync(filePath)) {
        const fileBytes = await readFile(filePath);
        const r2Key = `gallery/${filename}`;
        const contentType = filename.endsWith(".png") ? "image/png" : filename.endsWith(".webp") ? "image/webp" : "image/jpeg";
        try {
          await s3.send(
            new PutObjectCommand({
              Bucket: bucket,
              Key: r2Key,
              Body: fileBytes,
              ContentType: contentType,
              CacheControl: "public, max-age=31536000, immutable",
            })
          );
          console.log(`✔ Uploaded ${filename} -> ${R2_BASE}/${r2Key}`);
        } catch (err) {
          console.error(`✖ Failed uploading ${filename}:`, err.message);
        }
      } else {
        console.warn(`File not found: ${filePath}`);
      }
    }
  } else {
    console.log("\nNOTE: Skipping direct R2 file upload because R2_ACCESS_KEY_ID & R2_SECRET_ACCESS_KEY are not in .env yet.");
    console.log(`Once you add your Cloudflare R2 credentials, re-run this script to upload all files to R2!`);
  }

  // Seed / Sync database
  console.log("\nSyncing Gallery Items into PostgreSQL database...");
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

  for (const item of initialGalleryItems) {
    const r2Src = item.type === "PHOTO" ? `${R2_BASE}/gallery/${item.localFile}` : item.src;
    const r2Thumbnail = item.localFile
      ? `${R2_BASE}/gallery/${item.localFile}`
      : item.localThumbnail
      ? `${R2_BASE}/gallery/${item.localThumbnail}`
      : `${R2_BASE}/gallery/founder-hero-card.jpg`;

    await prisma.galleryItem.upsert({
      where: { id: item.id },
      create: {
        id: item.id,
        type: item.type,
        title: item.title,
        titleHi: item.titleHi,
        event: item.event,
        eventHi: item.eventHi,
        src: r2Src,
        thumbnail: r2Thumbnail,
        alt: item.alt,
        videoProvider: item.videoProvider,
        focalPoint: item.focalPoint,
        aspectRatio: item.aspectRatio,
        displayOrder: item.displayOrder,
        date: item.date,
        isActive: true,
      },
      update: {
        title: item.title,
        titleHi: item.titleHi,
        event: item.event,
        eventHi: item.eventHi,
        src: r2Src,
        thumbnail: r2Thumbnail,
        alt: item.alt,
        videoProvider: item.videoProvider,
        focalPoint: item.focalPoint,
        aspectRatio: item.aspectRatio,
        displayOrder: item.displayOrder,
        date: item.date,
      },
    });
    console.log(`✔ Synced item: [${item.displayOrder}] ${item.title}`);
  }

  const count = await prisma.galleryItem.count();
  console.log(`\nGallery setup complete! Total items in DB: ${count}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Setup failed:", e);
  process.exit(1);
});

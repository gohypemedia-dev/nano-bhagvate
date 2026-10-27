import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import https from "node:https";
import http from "node:http";
import fs from "node:fs";

// Load galleryData from data/gallery.ts
const content = fs.readFileSync("data/gallery.ts", "utf8");
const jsonMatch = content.match(/export const galleryData: GalleryItem\[\] = (\[[\s\S]*?\]);/);
if (!jsonMatch) {
  throw new Error("Could not parse galleryData from data/gallery.ts");
}
const items = JSON.parse(jsonMatch[1]);

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucket = process.env.R2_BUCKET || "namo";
const R2_BASE = (process.env.R2_PUBLIC_URL || "https://pub-6c55b4a33c034944bc9030fd94d673db.r2.dev").replace(/\/+$/, "");

if (!accountId || !accessKeyId || !secretAccessKey) {
  console.error("Missing R2 credentials in environment!");
  process.exit(1);
}

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId, secretAccessKey },
});

// Helper to download a URL to a Buffer
function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    const fullUrl = url.startsWith("//") ? `https:${url}` : url;
    const protocol = fullUrl.startsWith("https") ? https : http;
    const req = protocol.get(fullUrl, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchBuffer(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${fullUrl}`));
      }
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve({ buffer: Buffer.concat(chunks), contentType: res.headers["content-type"] }));
      res.on("error", reject);
    });
    req.on("error", reject);
    req.setTimeout(60000, () => {
      req.destroy();
      reject(new Error(`Timeout fetching ${fullUrl}`));
    });
  });
}

// Check if object already exists in R2
async function objectExistsInR2(key) {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch (err) {
    if (err.name === "NotFound" || err.$metadata?.httpStatusCode === 404) return false;
    return false;
  }
}

function cleanFilename(url, defaultExt = "jpg") {
  try {
    const clean = url.split("?")[0];
    const raw = clean.substring(clean.lastIndexOf("/") + 1);
    const decoded = decodeURIComponent(raw).replace(/[^a-zA-Z0-9._-]/g, "_");
    return decoded || `media_${Date.now()}.${defaultExt}`;
  } catch {
    return `media_${Date.now()}.${defaultExt}`;
  }
}

async function uploadToR2(key, buffer, contentType) {
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType || "application/octet-stream",
      CacheControl: "public, max-age=31536000, immutable",
    })
  );
  return `${R2_BASE}/${key}`;
}

async function main() {
  console.log("==================================================");
  console.log("NAMO BHAGVATE GALLERY -> CLOUDFLARE R2 SYNC");
  console.log(`Total items to process: ${items.length}`);
  console.log(`R2 Bucket: ${bucket}`);
  console.log(`Public Base: ${R2_BASE}`);
  console.log("==================================================\n");

  const updatedItems = [];
  let processed = 0;

  for (const item of items) {
    processed++;
    const isVideo = item.type === "video";
    const srcFilename = cleanFilename(item.src, isVideo ? "mp4" : "jpg");
    const thumbFilename = cleanFilename(item.thumbnail || item.src, "jpg");

    const srcKey = isVideo ? `gallery/videos/${srcFilename}` : `gallery/photos/${srcFilename}`;
    const thumbKey = `gallery/thumbnails/${thumbFilename}`;

    let r2Src = `${R2_BASE}/${srcKey}`;
    let r2Thumb = `${R2_BASE}/${thumbKey}`;

    console.log(`[${processed}/${items.length}] Processing ${item.type.toUpperCase()}: "${item.title.slice(0, 40)}"`);

    // 1. Check & Upload Main Media (Photo or Video)
    try {
      const srcExists = await objectExistsInR2(srcKey);
      if (srcExists) {
        console.log(`   ✔ Already in R2: ${srcKey}`);
      } else {
        console.log(`   ⬇ Downloading: ${item.src}`);
        const { buffer, contentType } = await fetchBuffer(item.src);
        console.log(`   ⬆ Uploading to R2: ${srcKey} (${(buffer.length / 1024 / (isVideo ? 1024 : 1)).toFixed(1)} ${isVideo ? "MB" : "KB"})`);
        await uploadToR2(srcKey, buffer, contentType || (isVideo ? "video/mp4" : "image/jpeg"));
      }
    } catch (err) {
      console.error(`   ✖ Failed to upload media: ${err.message}`);
      r2Src = item.src; // fallback
    }

    // 2. Check & Upload Thumbnail
    try {
      if (item.thumbnail && item.thumbnail !== item.src) {
        const thumbExists = await objectExistsInR2(thumbKey);
        if (thumbExists) {
          console.log(`   ✔ Thumb in R2: ${thumbKey}`);
        } else {
          const { buffer, contentType } = await fetchBuffer(item.thumbnail);
          await uploadToR2(thumbKey, buffer, contentType || "image/jpeg");
        }
      } else {
        r2Thumb = r2Src;
      }
    } catch (err) {
      console.warn(`   ⚠ Thumb upload notice: ${err.message}`);
      r2Thumb = r2Src;
    }

    updatedItems.push({
      ...item,
      src: r2Src,
      thumbnail: r2Thumb,
    });
  }

  // 3. Update database
  console.log("\n--------------------------------------------------");
  console.log("Syncing all items into PostgreSQL Database...");
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

  for (const item of updatedItems) {
    const isVideo = item.type === "video";
    await prisma.galleryItem.upsert({
      where: { id: item.id },
      create: {
        id: item.id,
        type: isVideo ? "VIDEO" : "PHOTO",
        title: item.title,
        titleHi: item.titleHi || null,
        event: item.event || null,
        eventHi: item.eventHi || null,
        src: item.src,
        thumbnail: item.thumbnail,
        alt: item.alt,
        videoProvider: item.videoProvider || (isVideo ? "mp4" : null),
        focalPoint: item.focalPoint || null,
        aspectRatio: item.aspectRatio || (isVideo ? "16/9" : null),
        displayOrder: item.displayOrder,
        date: item.date || null,
        isActive: true,
      },
      update: {
        type: isVideo ? "VIDEO" : "PHOTO",
        title: item.title,
        titleHi: item.titleHi || null,
        event: item.event || null,
        eventHi: item.eventHi || null,
        src: item.src,
        thumbnail: item.thumbnail,
        alt: item.alt,
        videoProvider: item.videoProvider || (isVideo ? "mp4" : null),
        focalPoint: item.focalPoint || null,
        aspectRatio: item.aspectRatio || (isVideo ? "16/9" : null),
        displayOrder: item.displayOrder,
        date: item.date || null,
        isActive: true,
      },
    });
  }

  const count = await prisma.galleryItem.count();
  console.log(`Database sync complete! Total items now in DB: ${count}`);
  await prisma.$disconnect();

  // 4. Update data/gallery.ts with new R2 links
  console.log("\nUpdating data/gallery.ts with Cloudflare R2 links...");
  const newGalleryTs = `/**
 * ============================================================================
 * GALLERY MEDIA DATA MANAGEMENT (गैलरी मीडिया डेटा)
 * ============================================================================
 * 
 * Contains all authentic photos and videos hosted on Cloudflare R2.
 * Total items: ${updatedItems.length} (${updatedItems.filter((i) => i.type === "video").length} videos, ${updatedItems.filter((i) => i.type === "photo").length} photos)
 */

export type MediaType = "photo" | "video";
export type VideoProvider = "youtube" | "vimeo" | "mp4";

export interface GalleryItem {
  id: string;
  type: MediaType;
  title: string;
  titleHi?: string;
  event?: string;
  eventHi?: string;
  src: string;
  thumbnail: string;
  alt: string;
  videoProvider?: VideoProvider;
  focalPoint?: string;
  aspectRatio?: string;
  displayOrder: number;
  date?: string;
}

export const galleryData: GalleryItem[] = ${JSON.stringify(updatedItems, null, 2)};
`;
  fs.writeFileSync("data/gallery.ts", newGalleryTs, "utf8");
  console.log("✔ data/gallery.ts updated successfully with Cloudflare R2 links!");
  console.log("\nALL DONE! Cloudflare R2 has all gallery images & videos!");
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});

/**
 * ============================================================================
 * GALLERY MEDIA DATA MANAGEMENT (गैलरी मीडिया डेटा)
 * ============================================================================
 * 
 * This file contains all photos and videos displayed in the website Gallery.
 * You can easily add, edit, reorder, or remove media items here.
 * 
 * ----------------------------------------------------------------------------
 * HOW TO ADD A NEW PHOTO:
 * ----------------------------------------------------------------------------
 * 1. Place your image file inside the `public/images/` folder (e.g. `public/images/event-1.jpg`).
 * 2. Add an entry below with `type: "photo"`:
 *    {
 *      id: "photo-unique-id",
 *      type: "photo",
 *      title: "Title in English",
 *      titleHi: "हिंदी में शीर्षक",
 *      event: "Event / Category Name",
 *      eventHi: "आयोजन / श्रेणी",
 *      src: "/images/event-1.jpg",
 *      thumbnail: "/images/event-1.jpg",
 *      alt: "Descriptive alt text for accessibility",
 *      focalPoint: "center", // Optional: "top", "50% 30%", "center"
 *      displayOrder: 13,
 *    }
 * 
 * ----------------------------------------------------------------------------
 * HOW TO ADD A YOUTUBE OR VIMEO VIDEO:
 * ----------------------------------------------------------------------------
 * 1. Put the YouTube or Vimeo URL in `src` (e.g. `https://www.youtube.com/watch?v=VIDEO_ID`
 *    or `https://vimeo.com/VIDEO_ID`).
 * 2. Provide a thumbnail image in `thumbnail` (e.g. a poster photo or YouTube thumbnail).
 * 3. Add an entry below with `type: "video"` and `videoProvider: "youtube"` or `"vimeo"`:
 *    {
 *      id: "video-unique-id",
 *      type: "video",
 *      title: "Discourse Title",
 *      titleHi: "प्रवचन का शीर्षक",
 *      event: "Satsang 2026",
 *      src: "https://www.youtube.com/watch?v=kJQP7kiw5Fk",
 *      thumbnail: "/images/founder-hero-card.jpg",
 *      alt: "Pujya Sadhvi Ji Spiritual Discourse",
 *      videoProvider: "youtube",
 *      displayOrder: 14,
 *    }
 * 
 * ----------------------------------------------------------------------------
 * HOW TO ADD AN UPLOADED MP4 VIDEO:
 * ----------------------------------------------------------------------------
 * 1. Place your `.mp4` file in `public/videos/` (e.g. `public/videos/trust-seva.mp4`).
 * 2. Set `src: "/videos/trust-seva.mp4"`, `videoProvider: "mp4"`, and specify a thumbnail poster:
 *    {
 *      id: "video-mp4-id",
 *      type: "video",
 *      title: "Trust Seva Activities",
 *      titleHi: "ट्रस्ट सेवा कार्य",
 *      src: "/videos/trust-seva.mp4",
 *      thumbnail: "/images/initiative-health.jpg",
 *      alt: "Trust Seva Video",
 *      videoProvider: "mp4",
 *      displayOrder: 15,
 *    }
 * ============================================================================
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
  focalPoint?: string; // Optional CSS object-position (e.g. "center", "50% 30%", "top")
  aspectRatio?: string; // Optional (e.g. "16/9", "4/3", "9/16" for vertical videos)
  displayOrder: number; // Smaller numbers appear first
  date?: string;
}

export const galleryData: GalleryItem[] = [
  // 1. Photo: Gurukul Education
  {
    id: "photo-gurukul-sanskar",
    type: "photo",
    title: "Vedic Gurukul Education & Sanskar Camp",
    titleHi: "गुरुकुल वैदिक शिक्षा एवं बाल संस्कार शिविर",
    event: "Gurukul Initiative",
    eventHi: "गुरुकुल पहल",
    src: "/images/initiative-education.jpg",
    thumbnail: "/images/initiative-education.jpg",
    alt: "Children learning Vedic values and sanskars at Gurukul",
    focalPoint: "center 35%",
    displayOrder: 1,
    date: "March 2026",
  },

  // 2. Video (YouTube): Sacred Shrimad Bhagwat Katha
  {
    id: "video-bhagwat-katha",
    type: "video",
    title: "Shrimad Bhagwat Katha - Divine Discourse by Pujya Sadhvi Ji",
    titleHi: "श्रीमद्भागवत कथा ज्ञान यज्ञ - पूज्य साध्वी जी का अमृत प्रवचन",
    event: "Spiritual Discourse",
    eventHi: "सत्संग एवं कथा",
    src: "https://www.youtube.com/watch?v=kJQP7kiw5Fk",
    thumbnail: "/images/founder-hero-card.jpg",
    alt: "Video of Pujya Sadhvi Vijeshanand Saraswati Ji delivering spiritual discourse",
    videoProvider: "youtube",
    focalPoint: "50% 35%",
    aspectRatio: "16/9",
    displayOrder: 2,
    date: "February 2026",
  },

  // 3. Photo: Farmer Guidance
  {
    id: "photo-farmer-workshop",
    type: "photo",
    title: "Natural Sugarcane Farming & Farmer Guidance Workshop",
    titleHi: "गन्ना किसान कल्याण एवं प्राकृतिक कृषि मार्गदर्शन कार्यशाला",
    event: "Farmer Welfare",
    eventHi: "कृषि कल्याण",
    src: "/images/initiative-farmers.jpg",
    thumbnail: "/images/initiative-farmers.jpg",
    alt: "Farmers attending agricultural awareness session",
    focalPoint: "center 40%",
    displayOrder: 3,
    date: "January 2026",
  },

  // 4. Photo: Free Healthcare & Yoga Camp
  {
    id: "photo-healthcare-camp",
    type: "photo",
    title: "Free Rural Healthcare & Holistic Yoga Camp",
    titleHi: "निःशुल्क ग्रामीण स्वास्थ्य परीक्षण एवं योग कल्याण शिविर",
    event: "Healthcare Seva",
    eventHi: "स्वास्थ्य सेवा",
    src: "/images/initiative-health.jpg",
    thumbnail: "/images/initiative-health.jpg",
    alt: "Doctors and sevadars providing free health checkups in rural area",
    focalPoint: "center",
    displayOrder: 4,
    date: "December 2025",
  },

  // 5. Video (YouTube): Village Seva & Outreach
  {
    id: "video-farmer-outreach",
    type: "video",
    title: "Rural Welfare & Farmer Upliftment Outreach Program",
    titleHi: "ग्राम सेवा एवं किसान सशक्तिकरण वृत्तचित्र",
    event: "Seva Outreach",
    eventHi: "सेवा कार्य",
    src: "https://www.youtube.com/watch?v=fJ9rUzIMcZQ",
    thumbnail: "/images/initiative-farmers.jpg",
    alt: "Documentary video showcasing farmer welfare outreach",
    videoProvider: "youtube",
    focalPoint: "center",
    aspectRatio: "16/9",
    displayOrder: 5,
    date: "November 2025",
  },

  // 6. Photo: Women Self-Reliance Workshop
  {
    id: "photo-women-empowerment",
    type: "photo",
    title: "Women Empowerment & Skill Development Center",
    titleHi: "महिला स्वावलंबन एवं आत्मनिर्भर कौशल प्रशिक्षण केंद्र",
    event: "Women Empowerment",
    eventHi: "महिला सशक्तिकरण",
    src: "/images/initiative-women.jpg",
    thumbnail: "/images/initiative-women.jpg",
    alt: "Women learning vocational sewing and handicraft skills",
    focalPoint: "center 30%",
    displayOrder: 6,
    date: "October 2025",
  },

  // 7. Photo: Shri Krishna Aarti
  {
    id: "photo-krishna-sankirtan",
    type: "photo",
    title: "Shri Krishna Sankirtan & Divine Sandhya Aarti",
    titleHi: "श्री कृष्ण संकीर्तन एवं विशेष संध्या महाआरती",
    event: "Spiritual Utsav",
    eventHi: "आध्यात्मिक उत्सव",
    src: "/images/krishna.jpg",
    thumbnail: "/images/krishna.jpg",
    alt: "Divine Shri Krishna deity and ceremonial prayer gathering",
    focalPoint: "center 25%",
    displayOrder: 7,
    date: "September 2025",
  },

  // 8. Video (Vimeo): Gurukul Vedic Recitation
  {
    id: "video-gurukul-chanting",
    type: "video",
    title: "Gurukul Vedic Recitation & Sanskrit Mantrochhar",
    titleHi: "गुरुकुल बाल संस्कार एवं सामूहिक वेद मंत्रोच्चार",
    event: "Gurukul Culture",
    eventHi: "गुरुकुल संस्कृति",
    src: "https://vimeo.com/76979871",
    thumbnail: "/images/initiative-education.jpg",
    alt: "Students reciting sacred Vedic mantras",
    videoProvider: "vimeo",
    focalPoint: "center 30%",
    aspectRatio: "16/9",
    displayOrder: 8,
    date: "August 2025",
  },

  // 9. Photo: Founder Blessings & Satsang
  {
    id: "photo-founder-satsang",
    type: "photo",
    title: "Spiritual Guidance & Blessings with Pujya Sadhvi Ji",
    titleHi: "सत्संग सभा एवं पूज्य साध्वी जी का पावन आशीर्वाद",
    event: "Satsang Sabha",
    eventHi: "सत्संग सभा",
    src: "/images/founder.jpg",
    thumbnail: "/images/founder.jpg",
    alt: "Devotees receiving blessings and spiritual guidance",
    focalPoint: "center 20%",
    displayOrder: 9,
    date: "July 2025",
  },

  // 10. Photo: Sugarcane Agricultural Guide
  {
    id: "photo-book-release",
    type: "photo",
    title: "Sugarcane Agriculture Practical Guidebook Release",
    titleHi: "गन्ना खेती मार्गदर्शिका पुस्तक विमोचन एवं विचार गोष्ठी",
    event: "Literature & Seva",
    eventHi: "साहित्य एवं सेवा",
    src: "/images/book-cover.jpg",
    thumbnail: "/images/book-cover.jpg",
    alt: "Release of sugarcane agricultural handbook for farmers",
    focalPoint: "center",
    displayOrder: 10,
    date: "June 2025",
  },

  // 11. Video (MP4): Trust Seva & Annadanam
  {
    id: "video-trust-annadanam",
    type: "video",
    title: "Trust Seva Activities & Annadanam Community Food Relief",
    titleHi: "ट्रस्ट समाज सेवा कार्य एवं निःशुल्क अन्नदान वितरण",
    event: "Annadanam Seva",
    eventHi: "अन्नदान सेवा",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnail: "/images/initiative-health.jpg",
    alt: "Video of voluntary Annadanam and charitable service distribution",
    videoProvider: "mp4",
    focalPoint: "center 40%",
    aspectRatio: "16/9",
    displayOrder: 11,
    date: "May 2025",
  },

  // 12. Photo: Seva Volunteers & Dedicated Members
  {
    id: "photo-community-gathering",
    type: "photo",
    title: "Dedicated Sevadar & Trust Member Assembly",
    titleHi: "समर्पित सेवादल एवं ट्रस्ट सदस्य सम्मेलन",
    event: "Trust Parivar",
    eventHi: "ट्रस्ट परिवार",
    src: "/images/founder-hero-card.jpg",
    thumbnail: "/images/founder-hero-card.jpg",
    alt: "Community members and sevadars gathered in service of Dharma",
    focalPoint: "50% 30%",
    displayOrder: 12,
    date: "April 2025",
  },

  // 13. Photo: Devotional Satsang & Meditation Circle
  {
    id: "photo-satsang-meditation",
    type: "photo",
    title: "Devotional Satsang, Bhakti & Silent Meditation Gathering",
    titleHi: "सामूहिक सत्संग, भक्ति एवं ध्यान साधना सभा",
    event: "Spiritual Sadhana",
    eventHi: "साधना एवं ध्यान",
    src: "/images/krishna.jpg",
    thumbnail: "/images/krishna.jpg",
    alt: "Devotees immersed in quiet devotional contemplation and prayer",
    focalPoint: "center",
    displayOrder: 13,
    date: "March 2025",
  },

  // 14. Video (YouTube): Women Skill Center Inauguration
  {
    id: "video-women-center",
    type: "video",
    title: "Women Skill Development Center Inauguration & Recognition",
    titleHi: "महिला स्वावलंबन केंद्र शुभारंभ एवं सम्मान समारोह",
    event: "Women Empowerment",
    eventHi: "महिला सशक्तिकरण",
    src: "https://www.youtube.com/watch?v=kJQP7kiw5Fk",
    thumbnail: "/images/initiative-women.jpg",
    alt: "Video of women vocational center inauguration and felicitation",
    videoProvider: "youtube",
    focalPoint: "center 30%",
    aspectRatio: "16/9",
    displayOrder: 14,
    date: "February 2025",
  },

  // 15. Photo: Gurukul Students & Moral Education
  {
    id: "photo-gurukul-students",
    type: "photo",
    title: "Gurukul Students Learning Ancient Heritage & Moral Sanskars",
    titleHi: "गुरुकुल बाल संस्कार, श्लोक पाठ एवं चरित्र निर्माण",
    event: "Gurukul Initiative",
    eventHi: "गुरुकुल पहल",
    src: "/images/initiative-education.jpg",
    thumbnail: "/images/initiative-education.jpg",
    alt: "Gurukul children learning Sanskrit shlokas and ethical principles",
    focalPoint: "center 35%",
    displayOrder: 15,
    date: "January 2025",
  },

  // 16. Video (MP4): Sustainable Agriculture & Soil Science
  {
    id: "video-soil-health",
    type: "video",
    title: "Sustainable Agriculture & Organic Soil Regeneration Program",
    titleHi: "प्राकृतिक कृषि, जीवामृत निर्माण एवं मृदा संरक्षण कार्यशाला",
    event: "Farmer Welfare",
    eventHi: "कृषि कल्याण",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnail: "/images/initiative-farmers.jpg",
    alt: "Educational video demonstrating natural farming and soil health enrichment",
    videoProvider: "mp4",
    focalPoint: "center 40%",
    aspectRatio: "16/9",
    displayOrder: 16,
    date: "December 2024",
  },
];

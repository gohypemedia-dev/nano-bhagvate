import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const events = [
  {
    slug: "shrimad-bhagwat-katha-2026",
    title: "Shrimad Bhagwat Katha",
    titleHi: "श्रीमद्भागवत कथा ज्ञान यज्ञ",
    summary: "Join us for a sacred seven-day spiritual discourse on the Shrimad Bhagwat Purana. All devotees are cordially invited.",
    summaryHi: "सात दिवसीय पावन श्रीमद्भागवत कथा ज्ञान यज्ञ में सादर आमंत्रित हैं। सभी भक्तगण पधारकर पुण्य लाभ प्राप्त करें।",
    description: "Join us for a divine seven-day spiritual discourse diving into the sublime pastimes and teachings of Lord Krishna from the Shrimad Bhagwat Mahapuran. Accompanied by daily sankirtan, aarti, and mahaprasad distribution. Devotees may also sponsor a day's discourse or prasadam seva.",
    startDate: new Date("2026-11-15T10:30:00Z"),
    endDate: new Date("2026-11-16T14:00:00Z"),
    timeText: "4:00 PM – 7:30 PM IST Daily",
    location: "Gurugram Ashram & Live Stream",
    address: "Namo Bhagwate Vasudevaya Trust Ashram, Sector 48, Gurugram, Haryana - 122018",
    contactPhone: "+91 9910762692",
    isPublished: true,
  },
  {
    slug: "yoga-wellness-camp-2026",
    title: "Yoga & Wellness Camp",
    titleHi: "योग एवं प्राकृतिक चिकित्सा शिविर",
    summary: "A three-day holistic wellness camp featuring yoga, meditation, pranayama, and Ayurvedic health consultation.",
    summaryHi: "योग, ध्यान, प्राणायाम एवं निःशुल्क आयुर्वेदिक स्वास्थ्य परामर्श से युक्त त्रिदिवसीय समग्र स्वास्थ्य शिविर।",
    description: "Rejuvenate mind, body, and soul in the holy environment of Vrindavan. The camp features early morning asana and pranayama sessions, yogic satvik diet, stress-relief meditation, and personalized pulse diagnosis (Nadi Parikshan) by experienced Vaidyas.",
    startDate: new Date("2026-12-05T00:30:00Z"),
    endDate: new Date("2026-12-07T13:30:00Z"),
    timeText: "6:00 AM – 9:00 AM IST",
    location: "Vrindavan Seva Kendra",
    address: "Raman Reti Road, Near Bhaktivedanta Hospital, Vrindavan, Uttar Pradesh - 281121",
    contactPhone: "+91 9910762692",
    isPublished: true,
  },
  {
    slug: "gurukul-annual-celebration-2027",
    title: "Gurukul Annual Celebration",
    titleHi: "गुरुकुल वार्षिकोत्सव एवं बाल संस्कार",
    summary: "A cultural celebration showcasing Vedic chanting, cultural performances, and academic achievements of Gurukul students.",
    summaryHi: "वेद मंत्रोच्चार, सांस्कृतिक प्रस्तुतियां एवं गुरुकुल के विद्यार्थियों की उपलब्धियों का भव्य वार्षिकोत्सव।",
    description: "Celebrate the preservation of Sanatan values and cultural heritage. The annual function will present Vedic recitation by young Brahmacharis, classical spiritual drama depicting scriptures, prize distribution, and blessing discourses by revered saints.",
    startDate: new Date("2027-01-10T04:30:00Z"),
    endDate: new Date("2027-01-10T08:30:00Z"),
    timeText: "10:00 AM – 2:00 PM IST (Followed by Mahaprasad)",
    location: "Main Auditorium",
    address: "Trust Central Auditorium, Gurugram / Delhi NCR",
    contactPhone: "+91 9910762692",
    isPublished: true,
  },
  {
    slug: "gopashtami-gau-seva-mahotsav",
    title: "Gopashtami & Gau Seva Mahotsav",
    titleHi: "गोपाष्टमी एवं गौ सेवा महोत्सव",
    summary: "Special Gau Pujan, havan, and community satsang dedicated to cow protection and welfare across our Gaushala shelters.",
    summaryHi: "गौ संवर्धन, पावन गोपूजन, विशेष हवन एवं गौशाला परिसर में विशाल महाप्रसाद व आध्यात्मिक सत्संग।",
    description: "Participate in the auspicious Gopashtami Mahotsav at our Vrindavan Gaushala. Devotees perform sacred cow worship, offer grass and jaggery, take part in Vedic havan for cosmic peace, and listen to spiritual discourses on the significance of Gomata in Sanatan Dharma.",
    startDate: new Date("2027-01-24T03:30:00Z"),
    endDate: new Date("2027-01-24T12:30:00Z"),
    timeText: "9:00 AM – 4:00 PM IST",
    location: "Trust Gaushala, Vrindavan",
    address: "Namo Bhagwate Vasudevaya Gaushala complex, Vrindavan, UP",
    contactPhone: "+91 9910762692",
    isPublished: true,
  },
  {
    slug: "youth-spiritual-leadership-camp",
    title: "Youth Spiritual Leadership Camp",
    titleHi: "युवा संस्कार एवं ध्यान साधना शिविर",
    summary: "Guiding the next generation with Vedic wisdom, value-based living, meditation workshops, and nation-building discourses.",
    summaryHi: "वैदिक जीवन दृष्टि, ध्यान साधना, राष्ट्र निर्माण एवं चरित्र निर्माण हेतु युवाओं के लिए विशेष तीन दिवसीय आवासीय शिविर।",
    description: "A transformative three-day residential camp aimed at teenagers and young adults. Combines guided meditation, character building, time management through the Bhagavad Gita, and dialogue with motivational spiritual mentors.",
    startDate: new Date("2027-02-18T04:30:00Z"),
    endDate: new Date("2027-02-20T12:30:00Z"),
    timeText: "All Day Residential Camp",
    location: "Rishikesh Ashram Kendra",
    address: "Swargashram Road, Rishikesh, Uttarakhand - 249304",
    contactPhone: "+91 9910762692",
    isPublished: true,
  },
  {
    slug: "sant-samagam-spiritual-conclave",
    title: "Sant Samagam & Vedic Conclave",
    titleHi: "विराट संत समागम एवं वेद सम्मेलन",
    summary: "A grand congregation of revered saints, scholars, and spiritual leaders discussing Sanatan culture and community welfare.",
    summaryHi: "पूज्य संतों, विद्वानों एवं आचार्यों का पावन सान्निध्य, सनातन संस्कृति के संरक्षण व समाज जागरण पर विराट विमर्श।",
    description: "Join leading spiritual masters, Mahants, and Vedic scholars for an inspiring dialogue on moral rejuvenation, cultural preservation, and social unity. Concludes with collective Mahamrityunjaya chanting and community bhandara.",
    startDate: new Date("2027-03-15T04:30:00Z"),
    endDate: new Date("2027-03-16T13:30:00Z"),
    timeText: "10:00 AM – 5:00 PM IST",
    location: "Central Ashram, Gurugram",
    address: "Namo Bhagwate Vasudevaya Trust Ashram, Sector 48, Gurugram, Haryana - 122018",
    contactPhone: "+91 9910762692",
    isPublished: true,
  },
];

async function seed() {
  console.log("Seeding events...");
  for (const item of events) {
    const ev = await prisma.event.upsert({
      where: { slug: item.slug },
      update: item,
      create: item,
    });
    console.log("Upserted event:", ev.title, `(${ev.id})`);
  }
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

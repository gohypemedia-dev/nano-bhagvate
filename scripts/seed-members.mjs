import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const initialMembers = [
  {
    name: "Mr. Sanjeev Akeel",
    email: "sanjeev.akeel@trust.org",
    phone: "+91 9814012345",
    tier: "PLATINUM",
    status: "ACTIVE",
    role: "National Media Co-ordinator",
    city: "Chandigarh",
    state: "Punjab",
  },
  {
    name: "Mr. Mann Singh",
    email: "mann.singh@trust.org",
    phone: "+91 9872054321",
    tier: "GOLD",
    status: "ACTIVE",
    role: "Senior Member",
    city: "Ludhiana",
    state: "Punjab",
  },
  {
    name: "Mrs. Prabha Gupta",
    email: "prabha.gupta@trust.org",
    phone: "+91 9418067890",
    tier: "SILVER",
    status: "ACTIVE",
    role: "Member",
    city: "Solan",
    state: "Himachal Pradesh",
  },
  {
    name: "Mr. Satish Kumar",
    email: "satish.kumar@gmail.com",
    phone: "+91 9899123456",
    tier: "BASIC",
    status: "ACTIVE",
    role: "Devotee Member",
    city: "Gurugram",
    state: "Haryana",
  },
  {
    name: "Mr. Chandan Singh",
    email: "chandan.singh@gmail.com",
    phone: "+91 9450123456",
    tier: "SILVER",
    status: "ACTIVE",
    role: "Devotee Member",
    city: "Lucknow",
    state: "Uttar Pradesh",
  },
  {
    name: "Mr. Sudhir Gupta",
    email: "sudhir.gupta@gmail.com",
    phone: "+91 9816045678",
    tier: "GOLD",
    status: "ACTIVE",
    role: "Patron Member",
    city: "Solan",
    state: "Himachal Pradesh",
  },
];

async function seed() {
  console.log("Seeding members...");
  const count = await prisma.member.count();
  if (count === 0) {
    for (const m of initialMembers) {
      await prisma.member.create({ data: m });
      console.log(`Created member: ${m.name} (${m.tier})`);
    }
  } else {
    console.log(`Members table already has ${count} records.`);
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


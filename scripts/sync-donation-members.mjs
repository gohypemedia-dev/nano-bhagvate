import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

async function syncDonationMembers() {
  console.log("Syncing verified membership donors into Member table...");
  const membershipDonations = await prisma.donation.findMany({
    where: {
      type: "MEMBERSHIP",
      status: "VERIFIED",
    },
  });

  for (const d of membershipDonations) {
    let tier = "BASIC";
    const prog = (d.program || "").toLowerCase();
    const amt = d.amountPaise / 100;
    if (prog.includes("platinum") || amt >= 51000) tier = "PLATINUM";
    else if (prog.includes("gold") || amt >= 11000) tier = "GOLD";
    else if (prog.includes("silver") || amt >= 5100) tier = "SILVER";

    const existing = await prisma.member.findFirst({
      where: {
        OR: [
          { email: d.donorEmail },
          { name: d.donorName },
        ],
      },
    });

    if (existing) {
      await prisma.member.update({
        where: { id: existing.id },
        data: {
          tier,
          phone: existing.phone || d.donorMobile || null,
          role: "Devotee Member",
        },
      });
      console.log(`Updated member: ${d.donorName} (${tier})`);
    } else {
      await prisma.member.create({
        data: {
          name: d.donorName,
          email: d.donorEmail,
          phone: d.donorMobile || null,
          tier,
          status: "ACTIVE",
          role: "Devotee Member",
        },
      });
      console.log(`Created member: ${d.donorName} (${tier})`);
    }
  }
}

syncDonationMembers()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


import { z } from "zod";
import { Prisma } from "@prisma/client";
import { requireAdminApi } from "@/lib/server/auth";
import { jsonError } from "@/lib/server/http";
import { prisma } from "@/lib/server/prisma";
import { certificateKey } from "@/lib/server/certificate";

const updateMemberSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  email: z.string().trim().email("Invalid email").optional().nullable().or(z.literal("")),
  phone: z.string().trim().max(30).optional().nullable().or(z.literal("")),
  tier: z.enum(["FREE", "BASIC", "SILVER", "GOLD", "PLATINUM"]).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "EXPIRED"]).optional(),
  role: z.string().trim().max(100).optional().nullable(),
  address: z.string().trim().max(300).optional().nullable(),
  city: z.string().trim().max(100).optional().nullable(),
  state: z.string().trim().max(100).optional().nullable(),
  pincode: z.string().trim().max(10).optional().nullable(),
  photoUrl: z.string().trim().optional().nullable(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminApi(request);
  if (admin instanceof Response) return admin;

  const { id } = await params;
  const member = await prisma.member.findUnique({ where: { id } });
  if (!member) return jsonError("Member not found.", 404);

  // 1. Collect all email and phone variations for this member
  const emails = new Set<string>();
  if (member.email) {
    emails.add(member.email.trim());
    emails.add(member.email.trim().toLowerCase());
  }

  const phones = new Set<string>();
  if (member.phone) {
    const raw = member.phone.trim();
    phones.add(raw);
    const digitsOnly = raw.replace(/\D/g, "");
    if (digitsOnly.length === 10) {
      phones.add(digitsOnly);
      phones.add(`+91${digitsOnly}`);
      phones.add(`91${digitsOnly}`);
    } else if (digitsOnly.length > 10 && digitsOnly.startsWith("91")) {
      const last10 = digitsOnly.slice(-10);
      phones.add(last10);
      phones.add(`+91${last10}`);
    }
  }

  // Find linked user if exists
  const userConditions: Prisma.UserWhereInput[] = [];
  if (member.userId) userConditions.push({ id: member.userId });
  if (emails.size > 0) userConditions.push({ email: { in: Array.from(emails), mode: "insensitive" } });
  if (phones.size > 0) userConditions.push({ phone: { in: Array.from(phones) } });

  const linkedUser = userConditions.length > 0
    ? await prisma.user.findFirst({
        where: { OR: userConditions },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          address: true,
          city: true,
          state: true,
          pincode: true,
          membershipTier: true,
          membershipStatus: true,
          createdAt: true,
        },
      })
    : null;

  if (linkedUser?.email) emails.add(linkedUser.email.toLowerCase());
  if (linkedUser?.phone) phones.add(linkedUser.phone);

  // 2. Fetch all events to correlate programs
  const allEvents = await prisma.event.findMany({
    select: {
      id: true,
      slug: true,
      title: true,
      titleHi: true,
      startDate: true,
      endDate: true,
      location: true,
      address: true,
      image: true,
      timeText: true,
    },
  });
  const eventMap = new Map(allEvents.map((e) => [e.title.toLowerCase().trim(), e]));

  // 3. Query all donations for this member
  const donationConditions: Prisma.DonationWhereInput[] = [];
  if (emails.size > 0) {
    donationConditions.push({ donorEmail: { in: Array.from(emails), mode: "insensitive" } });
  }
  if (phones.size > 0) {
    donationConditions.push({ donorMobile: { in: Array.from(phones) } });
  }

  const donations = donationConditions.length > 0
    ? await prisma.donation.findMany({
        where: { OR: donationConditions },
        orderBy: { createdAt: "desc" },
      })
    : [];

  // 4. Categorize donations & calculate stats
  interface EventPassItem {
    donationId: string;
    amountPaise: number;
    status: string;
    createdAt: string;
    verifiedAt: string | null;
    utr: string | null;
    certificateKey: string;
    passUrl: string;
    pdfUrl: string;
    event: {
      id: string;
      title: string;
      titleHi: string | null;
      slug: string;
      startDate: string;
      endDate: string | null;
      location: string;
      address: string | null;
      image: string | null;
      timeText: string | null;
    };
  }

  interface MemberDonationItem {
    donationId: string;
    program: string | null;
    amountPaise: number;
    status: string;
    createdAt: string;
    verifiedAt: string | null;
    utr: string | null;
    certificateKey: string;
    certificateUrl: string;
    certificatePdfUrl: string;
    passUrl: string;
  }

  interface GeneralDonationItem {
    donationId: string;
    program: string;
    amountPaise: number;
    status: string;
    createdAt: string;
    verifiedAt: string | null;
    utr: string | null;
    certificateKey: string;
    certificateUrl: string;
    certificatePdfUrl: string;
  }

  const eventPasses: EventPassItem[] = [];
  const generalDonations: GeneralDonationItem[] = [];
  const membershipDonations: MemberDonationItem[] = [];

  let totalContributedPaise = 0;
  let totalEventPassesCount = 0;
  let totalVerifiedDonationsCount = 0;

  for (const d of donations) {
    const k = certificateKey(d);
    const progKey = (d.program || "").toLowerCase().trim();
    const event = eventMap.get(progKey);

    const isVerified = d.status === "VERIFIED";
    if (isVerified) {
      totalContributedPaise += d.amountPaise;
      totalVerifiedDonationsCount++;
    }

    if (event) {
      if (isVerified) totalEventPassesCount++;
      eventPasses.push({
        donationId: d.donationId,
        amountPaise: d.amountPaise,
        status: d.status,
        createdAt: d.createdAt.toISOString(),
        verifiedAt: d.verifiedAt?.toISOString() || null,
        utr: d.utr,
        certificateKey: k,
        passUrl: `/pass/${d.donationId}?k=${k}`,
        pdfUrl: `/api/pass/${d.donationId}?k=${k}`,
        event: {
          id: event.id,
          title: event.title,
          titleHi: event.titleHi,
          slug: event.slug,
          startDate: event.startDate.toISOString(),
          endDate: event.endDate?.toISOString() || null,
          location: event.location,
          address: event.address,
          image: event.image,
          timeText: event.timeText,
        },
      });
    } else if (
      d.type === "MEMBERSHIP" ||
      progKey.includes("membership") ||
      progKey.includes("patron")
    ) {
      membershipDonations.push({
        donationId: d.donationId,
        program: d.program,
        amountPaise: d.amountPaise,
        status: d.status,
        createdAt: d.createdAt.toISOString(),
        verifiedAt: d.verifiedAt?.toISOString() || null,
        utr: d.utr,
        certificateKey: k,
        certificateUrl: `/certificate/${d.donationId}?k=${k}`,
        certificatePdfUrl: `/api/certificate/${d.donationId}?k=${k}`,
        passUrl: `/pass/${d.donationId}?k=${k}`,
      });
    } else {
      generalDonations.push({
        donationId: d.donationId,
        program: d.program || "General Donation",
        amountPaise: d.amountPaise,
        status: d.status,
        createdAt: d.createdAt.toISOString(),
        verifiedAt: d.verifiedAt?.toISOString() || null,
        utr: d.utr,
        certificateKey: k,
        certificateUrl: `/certificate/${d.donationId}?k=${k}`,
        certificatePdfUrl: `/api/certificate/${d.donationId}?k=${k}`,
      });
    }
  }

  // 5. Query store orders if any
  const orderConditions: Prisma.OrderWhereInput[] = [];
  if (linkedUser?.id) orderConditions.push({ userId: linkedUser.id });
  if (emails.size > 0) orderConditions.push({ shippingEmail: { in: Array.from(emails), mode: "insensitive" } });

  const orders = orderConditions.length > 0
    ? await prisma.order.findMany({
        where: { OR: orderConditions },
        include: { items: true },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return Response.json({
    member,
    linkedUser,
    stats: {
      totalContributedPaise,
      totalVerifiedDonationsCount,
      totalEventPassesCount,
      totalAllDonationsCount: donations.length,
      totalOrdersCount: orders.length,
    },
    history: {
      eventPasses,
      membershipDonations,
      generalDonations,
      allDonations: donations.map((d) => ({
        donationId: d.donationId,
        type: d.type,
        program: d.program,
        amountPaise: d.amountPaise,
        status: d.status,
        createdAt: d.createdAt.toISOString(),
        verifiedAt: d.verifiedAt?.toISOString() || null,
        utr: d.utr,
      })),
      orders: orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        totalAmount: o.totalAmount,
        status: o.status,
        paymentStatus: o.paymentStatus,
        createdAt: o.createdAt.toISOString(),
        itemsCount: o.items.length,
        items: o.items.map((it) => ({
          id: it.id,
          title: it.title,
          price: it.price,
          quantity: it.quantity,
          image: it.image,
        })),
      })),
    },
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminApi(request);
  if (admin instanceof Response) return admin;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = updateMemberSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid data.", 400);
  }

  const existing = await prisma.member.findUnique({ where: { id } });
  if (!existing) return jsonError("Member not found.", 404);

  const updated = await prisma.member.update({
    where: { id },
    data: {
      ...(parsed.data.name !== undefined ? { name: parsed.data.name } : {}),
      ...(parsed.data.email !== undefined ? { email: parsed.data.email || null } : {}),
      ...(parsed.data.phone !== undefined ? { phone: parsed.data.phone || null } : {}),
      ...(parsed.data.tier !== undefined ? { tier: parsed.data.tier } : {}),
      ...(parsed.data.status !== undefined ? { status: parsed.data.status } : {}),
      ...(parsed.data.role !== undefined ? { role: parsed.data.role || null } : {}),
      ...(parsed.data.address !== undefined ? { address: parsed.data.address || null } : {}),
      ...(parsed.data.city !== undefined ? { city: parsed.data.city || null } : {}),
      ...(parsed.data.state !== undefined ? { state: parsed.data.state || null } : {}),
      ...(parsed.data.pincode !== undefined ? { pincode: parsed.data.pincode || null } : {}),
      ...(parsed.data.photoUrl !== undefined ? { photoUrl: parsed.data.photoUrl || null } : {}),
    },
  });

  // Keep linked user account's tier & status in sync
  if (parsed.data.tier) {
    const userOrConditions: Prisma.UserWhereInput[] = [];
    if (existing.userId) userOrConditions.push({ id: existing.userId });
    if (existing.email) {
      userOrConditions.push({ email: existing.email });
      userOrConditions.push({ email: existing.email.toLowerCase() });
    }
    if (userOrConditions.length > 0) {
      await prisma.user
        .updateMany({
          where: { OR: userOrConditions },
          data: {
            membershipTier: parsed.data.tier,
            membershipStatus: parsed.data.status ?? existing.status,
          },
        })
        .catch(() => null);
    }
  }

  return Response.json({ success: true, member: updated });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminApi(request);
  if (admin instanceof Response) return admin;

  const { id } = await params;
  const existing = await prisma.member.findUnique({ where: { id } });
  if (!existing) return jsonError("Member not found.", 404);

  // 1. Delete associated membership records from Donation table so they no longer appear on Admin Dashboard
  const orConditions: Prisma.DonationWhereInput[] = [];
  if (existing.email) {
    orConditions.push({ donorEmail: existing.email });
    orConditions.push({ donorEmail: existing.email.toLowerCase() });
  }
  if (existing.phone) {
    orConditions.push({ donorMobile: existing.phone });
  }
  if (existing.name) {
    orConditions.push({ donorName: existing.name });
  }

  if (orConditions.length > 0) {
    const matchingDonations = await prisma.donation.findMany({
      where: {
        OR: [
          { type: "MEMBERSHIP" },
          { program: { contains: "membership", mode: "insensitive" } },
          { program: { contains: "patron", mode: "insensitive" } },
        ],
        AND: [
          {
            OR: orConditions,
          },
        ],
      },
      select: { id: true },
    });

    if (matchingDonations.length > 0) {
      const donationDbIds = matchingDonations.map((d) => d.id);
      await prisma.emailLog.deleteMany({ where: { donationId: { in: donationDbIds } } }).catch(() => null);
      await prisma.utrClaim.deleteMany({ where: { donationId: { in: donationDbIds } } }).catch(() => null);
      await prisma.paymentAlert.updateMany({
        where: { donationId: { in: donationDbIds } },
        data: { donationId: null },
      }).catch(() => null);
      await prisma.donation.deleteMany({ where: { id: { in: donationDbIds } } }).catch(() => null);
    }
  }

  // 2. Reset linked user's membership tier and status back to normal devotee (FREE / INACTIVE)
  const userOrConditions: Prisma.UserWhereInput[] = [];
  if (existing.userId) {
    userOrConditions.push({ id: existing.userId });
  }
  if (existing.email) {
    userOrConditions.push({ email: existing.email });
    userOrConditions.push({ email: existing.email.toLowerCase() });
  }
  if (existing.phone) {
    userOrConditions.push({ phone: existing.phone });
  }

  if (userOrConditions.length > 0) {
    await prisma.user.updateMany({
      where: { OR: userOrConditions },
      data: {
        membershipTier: "FREE",
        membershipStatus: "INACTIVE",
      },
    }).catch(() => null);
  }

  // 3. Delete the member record permanently
  await prisma.member.delete({ where: { id } });

  return Response.json({ success: true, deletedId: id });
}

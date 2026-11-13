import "server-only";
import type { Prisma } from "@prisma/client";

export const USER_PAGE_SIZE = 25;
export type UserSearchParams = Record<string, string | string[] | undefined>;

export function queryValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

export function pageNumber(value: string | string[] | undefined) {
  const number = Number(queryValue(value));
  return Number.isSafeInteger(number) && number > 0 ? Math.min(number, 100000) : 1;
}

// Match older/guest donations by email only when no account already owns them.
// Names and phone numbers are not reliable account identifiers.
export function userDonationsWhere(user: { id: string; email: string }): Prisma.DonationWhereInput {
  return {
    OR: [
      { userId: user.id },
      { userId: null, donorEmail: { equals: user.email, mode: "insensitive" } },
    ],
  };
}

export function userMembersWhere(user: { id: string; email: string }): Prisma.MemberWhereInput {
  return {
    OR: [
      { userId: user.id },
      { userId: null, email: { equals: user.email, mode: "insensitive" } },
    ],
  };
}

export const userProfileSelect = {
  id: true, name: true, email: true, phone: true,
  address: true, city: true, state: true, pincode: true,
  membershipTier: true, membershipStatus: true, createdAt: true,
} satisfies Prisma.UserSelect;

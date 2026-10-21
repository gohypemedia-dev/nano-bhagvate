import "server-only";
import type { Donation, Event } from "@prisma/client";
import { prisma } from "./prisma";

// What a payment was for, which decides the document the payer gets:
//   membership → membership certificate
//   event      → event entry pass   (registered via an event's "Register / Support Event" button)
//   donation   → donation certificate
export type DonationCategory =
  | { kind: "membership" }
  | { kind: "event"; event: Event }
  | { kind: "donation" };

// Event registrations are stored with the event's title as the donation's program.
export async function donationCategory(d: Pick<Donation, "type" | "program">): Promise<DonationCategory> {
  if (d.type === "MEMBERSHIP") return { kind: "membership" };
  const program = d.program?.trim();
  if (program) {
    const event = await prisma.event.findFirst({ where: { title: { equals: program, mode: "insensitive" } } });
    if (event) return { kind: "event", event };
  }
  return { kind: "donation" };
}

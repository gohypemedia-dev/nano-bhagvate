import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { test } from "node:test";
import vm from "node:vm";
import ts from "typescript";

const require = createRequire(import.meta.url);
function load(relativePath, mocks = {}) {
  const source = readFileSync(new URL(relativePath, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } });
  const exports = {};
  vm.runInNewContext(outputText, {
    exports, Buffer, process,
    require: (id) => id === "server-only" ? {} : id in mocks ? mocks[id] : require(id),
  });
  return exports;
}

const helpers = load("../lib/server/admin-users.ts");
test("donations match account ID or an unclaimed case-insensitive email, never another account", () => {
  const where = helpers.userDonationsWhere({ id: "user-a", email: "person@example.org" });
  assert.equal(where.OR[0].userId, "user-a");
  assert.equal(where.OR[1].userId, null);
  assert.equal(where.OR[1].donorEmail.equals, "person@example.org");
  assert.equal(where.OR[1].donorEmail.mode, "insensitive");
  assert.equal(JSON.stringify(where).includes("phone"), false);
});
test("members explicitly linked to another user are excluded from email fallback", () => {
  const where = helpers.userMembersWhere({ id: "user-a", email: "person@example.org" });
  assert.equal(where.OR[1].userId, null);
  assert.equal(where.OR[1].email.mode, "insensitive");
});
test("pagination rejects invalid input and bounds large page offsets", () => {
  for (const value of [undefined, "-1", "0", "1.5", "NaN", "Infinity", ["2", "3"]]) {
    assert.equal(helpers.pageNumber(value), 1);
  }
  assert.equal(helpers.pageNumber("2"), 2);
  assert.equal(helpers.pageNumber("9999999"), 100000);
});
test("admin profile projection excludes credentials", () => {
  assert.equal(helpers.userProfileSelect.passwordHash, undefined);
  assert.equal(helpers.userProfileSelect.sessions, undefined);
});

function authHarness(session = null) {
  const events = [];
  const batches = [];
  const cookieWrites = [];
  const tx = {
    userSession: {
      findUnique: async () => session,
      deleteMany: async () => {
        const count = session ? 1 : 0;
        session = null;
        return { count };
      },
    },
    userActivity: { create: async (args) => { events.push(args.data); } },
  };
  const prisma = {
    userSession: { create: (args) => ({ table: "session", ...args }) },
    userActivity: { create: (args) => ({ table: "activity", ...args }) },
    $transaction: async (input) => {
      if (typeof input === "function") return input(tx);
      batches.push(input);
    },
  };
  const auth = load("../lib/server/user-auth.ts", {
    "./prisma": { prisma },
    "./donation": { generateToken: () => "secret-cookie-token", sha256: () => "hashed-token" },
    "next/headers": { cookies: async () => ({
      get: () => ({ value: "secret-cookie-token" }),
      set: (...args) => cookieWrites.push(args),
      delete: () => {},
    }) },
  });
  return { auth, events, batches, cookieWrites };
}
test("password login creates session and persistent history in one transaction", async () => {
  const { auth, batches, cookieWrites } = authHarness();
  await auth.createUserSession("user-a");
  assert.equal(batches.length, 1);
  assert.equal(batches[0][0].data.tokenHash, "hashed-token");
  assert.equal(batches[0][1].data.type, "LOGIN");
  assert.equal(batches[0][1].data.provider, "PASSWORD");
  assert.equal(batches[0][1].data.userId, "user-a");
  assert.equal(JSON.stringify(batches[0][1]).includes("secret-cookie-token"), false);
  assert.equal(cookieWrites[0][2].httpOnly, true);
});
test("Google registration records the provider and signup event", async () => {
  const { auth, batches } = authHarness();
  await auth.createUserSession("user-a", { provider: "GOOGLE", registered: true });
  assert.equal(batches[0][1].data.type, "REGISTER");
  assert.equal(batches[0][1].data.provider, "GOOGLE");
});
test("logout preserves history when session is removed, and retry adds no duplicate", async () => {
  const { auth, events } = authHarness({ id: "session-a", userId: "user-a", expiresAt: new Date(Date.now() + 60000) });
  await auth.destroyUserSession();
  await auth.destroyUserSession();
  assert.equal(events.length, 1);
  assert.equal(events[0].type, "LOGOUT");
  assert.equal(events[0].userId, "user-a");
});
test("expired sessions do not invent explicit sign-outs", async () => {
  const { auth, events } = authHarness({ id: "session-a", userId: "user-a", expiresAt: new Date(0) });
  await auth.destroyUserSession();
  assert.equal(events.length, 0);
});

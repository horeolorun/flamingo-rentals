import { randomUUID } from "crypto";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { SAMPLE_VENDORS } from "../data/seedVendors";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>;

type InMemoryStore = {
  users: AnyRecord[];
  vendorProfiles: AnyRecord[];
  sessions: AnyRecord[];
  verificationCodes: AnyRecord[];
  listings: AnyRecord[];
  vendorAvailabilityBlocks: AnyRecord[];
  carts: AnyRecord[];
  cartItems: AnyRecord[];
  bookings: AnyRecord[];
  vendorBundles: AnyRecord[];
  vendorBundleItems: AnyRecord[];
  cartBundles: AnyRecord[];
  cartBundleItems: AnyRecord[];
};

function createSeededStore(): InMemoryStore {
  const baseTime = Date.now();

  const users: AnyRecord[] = [];
  const vendorProfiles: AnyRecord[] = [];
  const listings: AnyRecord[] = [];

  SAMPLE_VENDORS.forEach((entry, vendorIndex) => {
    const timestamp = new Date(baseTime - vendorIndex * 60_000);

    users.push({
      ...entry.user,
      passwordHash: null,
      marketingEmailsOptIn: false,
      marketingEmailsOptInAt: null,
      role: "VENDOR",
      status: "ACTIVE",
      emailVerifiedAt: timestamp,
      phoneVerifiedAt: null,
      availableWalletId: null,
      depositWalletId: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    vendorProfiles.push({
      ...entry.profile,
      userId: entry.user.id,
      kycStatus: "VERIFIED",
      payoutStatus: "VERIFIED",
      availableWalletId: null,
      pendingWalletId: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    entry.listings.forEach((listing, listingIndex) => {
      const listingTime = new Date(timestamp.getTime() - listingIndex * 1000);
      listings.push({
        ...listing,
        vendorProfileId: entry.profile.id,
        status: "ACTIVE",
        isAvailable: true,
        createdAt: listingTime,
        updatedAt: listingTime,
      });
    });
  });

  return {
    users,
    vendorProfiles,
    sessions: [],
    verificationCodes: [],
    listings,
    vendorAvailabilityBlocks: [],
    carts: [],
    cartItems: [],
    bookings: [],
    vendorBundles: [],
    vendorBundleItems: [],
    cartBundles: [],
    cartBundleItems: [],
  };
}

function getStore(): InMemoryStore {
  const g = globalThis as unknown as { __flamingoStore?: InMemoryStore };
  if (!g.__flamingoStore) {
    g.__flamingoStore = createSeededStore();
  }
  return g.__flamingoStore;
}

function matchesScalarFilter(val: unknown, filter: unknown): boolean {
  if (filter === undefined) return true;
  if (filter === null || typeof filter !== "object" || filter instanceof Date) {
    if (val instanceof Date && filter instanceof Date) {
      return val.getTime() === filter.getTime();
    }
    return val === filter;
  }

  const f = filter as AnyRecord;
  if ("equals" in f && !matchesScalarFilter(val, f.equals)) return false;
  if ("in" in f && Array.isArray(f.in) && !f.in.includes(val)) return false;
  if ("notIn" in f && Array.isArray(f.notIn) && f.notIn.includes(val)) return false;
  if ("not" in f && matchesScalarFilter(val, f.not)) return false;
  if ("gt" in f && !(val != null && (val as number | Date) > f.gt)) return false;
  if ("gte" in f && !(val != null && (val as number | Date) >= f.gte)) return false;
  if ("lt" in f && !(val != null && (val as number | Date) < f.lt)) return false;
  if ("lte" in f && !(val != null && (val as number | Date) <= f.lte)) return false;
  if ("has" in f && (!Array.isArray(val) || !val.includes(f.has))) return false;
  if ("contains" in f) {
    const str = String(val ?? "");
    const needle = String(f.contains ?? "");
    if (f.mode === "insensitive") {
      if (!str.toLowerCase().includes(needle.toLowerCase())) return false;
    } else if (!str.includes(needle)) {
      return false;
    }
  }
  return true;
}

function matchesWhere(
  store: InMemoryStore,
  model: string,
  row: AnyRecord,
  where?: AnyRecord
): boolean {
  if (!where) return true;

  for (const [key, condition] of Object.entries(where)) {
    if (condition === undefined) continue;

    if (key === "OR" && Array.isArray(condition)) {
      if (!condition.some((sub) => matchesWhere(store, model, row, sub))) {
        return false;
      }
      continue;
    }
    if (key === "AND" && Array.isArray(condition)) {
      if (!condition.every((sub) => matchesWhere(store, model, row, sub))) {
        return false;
      }
      continue;
    }
    if (key === "NOT") {
      if (matchesWhere(store, model, row, condition)) return false;
      continue;
    }

    // Handle relation filters
    if (model === "vendorProfile" && key === "user") {
      const user = store.users.find((u) => u.id === row.userId);
      const subWhere = (condition as AnyRecord)?.is ?? condition;
      if (!user || !matchesWhere(store, "user", user, subWhere)) return false;
      continue;
    }
    if (model === "listing" && key === "vendorProfile") {
      const vp = store.vendorProfiles.find((v) => v.id === row.vendorProfileId);
      const subWhere = (condition as AnyRecord)?.is ?? condition;
      if (!vp || !matchesWhere(store, "vendorProfile", vp, subWhere)) return false;
      continue;
    }
    if (model === "vendorBundle" && key === "vendorProfile") {
      const vp = store.vendorProfiles.find((v) => v.id === row.vendorProfileId);
      const subWhere = (condition as AnyRecord)?.is ?? condition;
      if (!vp || !matchesWhere(store, "vendorProfile", vp, subWhere)) return false;
      continue;
    }
    if (model === "vendorBundle" && key === "items") {
      const items = store.vendorBundleItems.filter((i) => i.bundleId === row.id);
      if (condition.some && items.length === 0) return false;
      if (condition.every?.listing) {
        const ok = items.every((i) => {
          const listing = store.listings.find((l) => l.id === i.listingId);
          return listing && matchesWhere(store, "listing", listing, condition.every.listing);
        });
        if (!ok) return false;
      }
      continue;
    }

    if (!matchesScalarFilter(row[key], condition)) {
      return false;
    }
  }

  return true;
}

function hydrateRow(
  store: InMemoryStore,
  model: string,
  row: AnyRecord,
  include?: AnyRecord,
  select?: AnyRecord
): AnyRecord {
  const result: AnyRecord = select ? {} : { ...row };

  if (select) {
    for (const [k, v] of Object.entries(select)) {
      if (!v) continue;
      if (k in row) {
        result[k] = row[k];
      } else {
        const hydrated = hydrateRelation(store, model, row, k, v);
        if (hydrated !== undefined) result[k] = hydrated;
      }
    }
  }

  if (include) {
    for (const [k, v] of Object.entries(include)) {
      if (!v) continue;
      const hydrated = hydrateRelation(store, model, row, k, v);
      if (hydrated !== undefined) result[k] = hydrated;
    }
  }

  return result;
}

function hydrateRelation(
  store: InMemoryStore,
  model: string,
  row: AnyRecord,
  relName: string,
  relSpec: AnyRecord | boolean
): unknown {
  const spec = typeof relSpec === "object" && relSpec !== null ? relSpec : {};
  const include = spec.include as AnyRecord | undefined;
  const select = spec.select as AnyRecord | undefined;

  if (model === "vendorProfile") {
    if (relName === "user") {
      const u = store.users.find((x) => x.id === row.userId) ?? null;
      return u ? hydrateRow(store, "user", u, include, select) : null;
    }
    if (relName === "listings") {
      const rows = store.listings.filter(
        (l) => l.vendorProfileId === row.id && matchesWhere(store, "listing", l, spec.where)
      );
      return sortRows(rows, spec.orderBy).map((l) =>
        hydrateRow(store, "listing", l, include, select)
      );
    }
  }

  if (model === "user") {
    if (relName === "vendorProfile") {
      const vp = store.vendorProfiles.find((x) => x.userId === row.id) ?? null;
      return vp ? hydrateRow(store, "vendorProfile", vp, include, select) : null;
    }
  }

  if (model === "session") {
    if (relName === "user") {
      const u = store.users.find((x) => x.id === row.userId) ?? null;
      return u ? hydrateRow(store, "user", u, include, select) : null;
    }
  }

  if (model === "listing") {
    if (relName === "vendorProfile") {
      const vp = store.vendorProfiles.find((x) => x.id === row.vendorProfileId) ?? null;
      return vp ? hydrateRow(store, "vendorProfile", vp, include, select) : null;
    }
  }

  if (model === "cart") {
    if (relName === "items") {
      const rows = store.cartItems.filter(
        (ci) => ci.cartId === row.id && matchesWhere(store, "cartItem", ci, spec.where)
      );
      return sortRows(rows, spec.orderBy).map((ci) =>
        hydrateRow(store, "cartItem", ci, include, select)
      );
    }
  }

  if (model === "cartItem") {
    if (relName === "listing") {
      const l = store.listings.find((x) => x.id === row.listingId) ?? null;
      return l ? hydrateRow(store, "listing", l, include, select) : null;
    }
  }

  if (model === "booking") {
    if (relName === "listing") {
      const l = store.listings.find((x) => x.id === row.listingId) ?? null;
      return l ? hydrateRow(store, "listing", l, include, select) : null;
    }
    if (relName === "vendor") {
      const vp = store.vendorProfiles.find((x) => x.id === row.vendorProfileId) ?? null;
      return vp ? hydrateRow(store, "vendorProfile", vp, include, select) : null;
    }
    if (relName === "customer") {
      const u = store.users.find((x) => x.id === row.customerId) ?? null;
      return u ? hydrateRow(store, "user", u, include, select) : null;
    }
  }

  return undefined;
}

function sortRows(rows: AnyRecord[], orderBy?: AnyRecord | AnyRecord[]): AnyRecord[] {
  if (!orderBy) return rows;
  const specs = Array.isArray(orderBy) ? orderBy : [orderBy];
  return [...rows].sort((a, b) => {
    for (const spec of specs) {
      for (const [k, dir] of Object.entries(spec)) {
        const av = a[k];
        const bv = b[k];
        const mult = dir === "desc" ? -1 : 1;
        if (av instanceof Date && bv instanceof Date) {
          if (av.getTime() !== bv.getTime()) return (av.getTime() - bv.getTime()) * mult;
        } else if (av !== bv) {
          return (av > bv ? 1 : -1) * mult;
        }
      }
    }
    return 0;
  });
}

function getCollection(store: InMemoryStore, model: string): AnyRecord[] {
  switch (model) {
    case "user":
      return store.users;
    case "vendorProfile":
      return store.vendorProfiles;
    case "session":
      return store.sessions;
    case "verificationCode":
      return store.verificationCodes;
    case "listing":
      return store.listings;
    case "vendorAvailabilityBlock":
      return store.vendorAvailabilityBlocks;
    case "cart":
      return store.carts;
    case "cartItem":
      return store.cartItems;
    case "booking":
      return store.bookings;
    case "vendorBundle":
      return store.vendorBundles;
    case "vendorBundleItem":
      return store.vendorBundleItems;
    case "cartBundle":
      return store.cartBundles;
    case "cartBundleItem":
      return store.cartBundleItems;
    default:
      return [];
  }
}

function applyDefaults(model: string, data: AnyRecord): AnyRecord {
  const now = new Date();
  const base: AnyRecord = {
    id: data.id ?? randomUUID(),
    createdAt: data.createdAt ?? now,
    updatedAt: data.updatedAt ?? now,
    ...data,
  };

  if (model === "listing") {
    base.totalQuantity = base.totalQuantity ?? 1;
    base.status = base.status ?? "DRAFT";
    base.isAvailable = base.isAvailable ?? true;
  }
  if (model === "cartItem") {
    base.quantity = base.quantity ?? 1;
    base.isSelected = base.isSelected ?? true;
    base.startDate = base.startDate ?? null;
    base.endDate = base.endDate ?? null;
  }
  if (model === "booking") {
    base.quantity = base.quantity ?? 1;
    base.status = base.status ?? "PAID";
    base.refundStatus = base.refundStatus ?? "NOT_REQUIRED";
  }
  if (model === "user") {
    base.role = base.role ?? "CUSTOMER";
    base.status = base.status ?? "PENDING_VERIFICATION";
  }
  if (model === "vendorProfile") {
    base.segments = base.segments ?? [];
    base.country = base.country ?? "Nigeria";
    base.averageRating = base.averageRating ?? 0;
    base.reviewCount = base.reviewCount ?? 0;
    base.kycStatus = base.kycStatus ?? "NOT_STARTED";
    base.payoutStatus = base.payoutStatus ?? "NOT_STARTED";
  }

  return base;
}

function applyUpdateData(row: AnyRecord, data: AnyRecord) {
  for (const [k, v] of Object.entries(data)) {
    if (v && typeof v === "object" && !(v instanceof Date) && "increment" in v) {
      row[k] = Number(row[k] ?? 0) + Number(v.increment);
    } else if (v !== undefined) {
      row[k] = v;
    }
  }
  row.updatedAt = new Date();
}

function createModelDelegate(store: InMemoryStore, model: string) {
  return {
    findMany: async (args: AnyRecord = {}) => {
      const col = getCollection(store, model);
      let rows = col.filter((r) => matchesWhere(store, model, r, args.where));
      rows = sortRows(rows, args.orderBy);
      if (Array.isArray(args.distinct) && args.distinct.length > 0) {
        const seen = new Set<string>();
        rows = rows.filter((r) => {
          const key = (args.distinct as string[])
            .map((field) => String(r[field] ?? ""))
            .join("\0");
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      }
      if (typeof args.take === "number") rows = rows.slice(0, args.take);
      return rows.map((r) => hydrateRow(store, model, r, args.include, args.select));
    },
    findFirst: async (args: AnyRecord = {}) => {
      const col = getCollection(store, model);
      let rows = col.filter((r) => matchesWhere(store, model, r, args.where));
      rows = sortRows(rows, args.orderBy);
      const row = rows[0];
      return row ? hydrateRow(store, model, row, args.include, args.select) : null;
    },
    findUnique: async (args: AnyRecord = {}) => {
      const col = getCollection(store, model);
      const row = col.find((r) => matchesWhere(store, model, r, args.where));
      return row ? hydrateRow(store, model, row, args.include, args.select) : null;
    },
    count: async (args: AnyRecord = {}) => {
      const col = getCollection(store, model);
      return col.filter((r) => matchesWhere(store, model, r, args.where)).length;
    },
    create: async (args: AnyRecord) => {
      const col = getCollection(store, model);
      const data = { ...(args.data ?? {}) };
      let nestedVendorProfile: AnyRecord | null = null;
      if (model === "user" && data.vendorProfile?.create) {
        nestedVendorProfile = data.vendorProfile.create;
        delete data.vendorProfile;
      }
      const created = applyDefaults(model, data);
      col.push(created);

      if (nestedVendorProfile) {
        const vp = applyDefaults("vendorProfile", {
          ...nestedVendorProfile,
          userId: created.id,
        });
        store.vendorProfiles.push(vp);
      }
      return hydrateRow(store, model, created, args.include, args.select);
    },
    upsert: async (args: AnyRecord) => {
      const col = getCollection(store, model);
      const existing = col.find((r) => matchesWhere(store, model, r, args.where));
      if (existing) {
        applyUpdateData(existing, args.update ?? {});
        return hydrateRow(store, model, existing, args.include, args.select);
      }
      const created = applyDefaults(model, args.create ?? {});
      col.push(created);
      return hydrateRow(store, model, created, args.include, args.select);
    },
    update: async (args: AnyRecord) => {
      const col = getCollection(store, model);
      const row = col.find((r) => matchesWhere(store, model, r, args.where));
      if (!row) {
        throw new Error(`Record not found for update in ${model}`);
      }
      applyUpdateData(row, args.data ?? {});
      return hydrateRow(store, model, row, args.include, args.select);
    },
    updateMany: async (args: AnyRecord) => {
      const col = getCollection(store, model);
      let count = 0;
      for (const row of col) {
        if (matchesWhere(store, model, row, args.where)) {
          applyUpdateData(row, args.data ?? {});
          count += 1;
        }
      }
      return { count };
    },
    delete: async (args: AnyRecord) => {
      const col = getCollection(store, model);
      const idx = col.findIndex((r) => matchesWhere(store, model, r, args.where));
      if (idx === -1) {
        throw new Error(`Record not found for delete in ${model}`);
      }
      const [removed] = col.splice(idx, 1);
      if (model === "cart") {
        store.cartItems = store.cartItems.filter((ci) => ci.cartId !== removed.id);
      }
      return hydrateRow(store, model, removed, args.include, args.select);
    },
    deleteMany: async (args: AnyRecord = {}) => {
      const col = getCollection(store, model);
      const before = col.length;
      const kept = col.filter((r) => !matchesWhere(store, model, r, args.where));
      col.length = 0;
      col.push(...kept);
      return { count: before - kept.length };
    },
  };
}

function createMockDb(): PrismaClient {
  console.warn("[AI Studio] DATABASE_URL not set — using in-memory store");
  const store = getStore();

  const clientMock: AnyRecord = {
    $connect: async () => {},
    $disconnect: async () => {},
    $queryRaw: async () => [],
    $executeRaw: async () => 0,
    $transaction: async (
      fnOrQueries: ((tx: PrismaClient) => Promise<unknown>) | Promise<unknown>[]
    ) => {
      if (typeof fnOrQueries === "function") {
        return fnOrQueries(proxyClient);
      }
      if (Array.isArray(fnOrQueries)) {
        return Promise.all(fnOrQueries);
      }
      return [];
    },
  };

  const proxyClient = new Proxy(clientMock, {
    get(target, prop) {
      if (typeof prop === "string" && prop in target) {
        return target[prop];
      }
      return createModelDelegate(store, String(prop));
    },
  }) as unknown as PrismaClient;

  return proxyClient;
}

function createPrismaClient(): PrismaClient {
  if (!process.env.DATABASE_URL) {
    return createMockDb();
  }

  try {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });

    return new PrismaClient({
      adapter,
    });
  } catch {
    return createMockDb();
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function createMockDb(): PrismaClient {
  console.warn("[AI Studio] Database not connected — using mock");

  const modelMock = new Proxy(
    {},
    {
      get(_, method) {
        if (method === "findMany") return async () => [];
        if (method === "findFirst" || method === "findUnique") return async () => null;
        if (method === "count") return async () => 0;
        if (method === "updateMany" || method === "deleteMany" || method === "createMany") {
          return async () => ({ count: 0 });
        }
        if (method === "create") {
          return async (args?: { data?: Record<string, unknown> }) => ({
            id: "mock-id",
            items: [],
            ...(args?.data ?? {}),
          });
        }
        if (method === "upsert") {
          return async (args?: { create?: Record<string, unknown>; update?: Record<string, unknown> }) => ({
            id: "mock-id",
            items: [],
            ...(args?.create ?? args?.update ?? {}),
          });
        }
        if (method === "update") {
          return async (args?: { data?: Record<string, unknown> }) => ({
            id: "mock-id",
            ...(args?.data ?? {}),
          });
        }
        if (method === "delete") return async () => ({});
        return async () => null;
      },
    }
  );

  const clientMock: Record<string, unknown> = {
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
      return modelMock;
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

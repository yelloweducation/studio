
import { PrismaClient } from '@prisma/client';

console.log("[Prisma Instance] Initializing Prisma Client setup module...");

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-unused-vars
  var prisma: PrismaClient | undefined;
}

let prismaInstance: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  console.log("[Prisma Instance] Production environment: Creating new PrismaClient.");
  prismaInstance = new PrismaClient({
    log: ['error', 'warn'], // More concise logging for production
  });
} else {
  if (!global.prisma) {
    console.log("[Prisma Instance] Development environment: Creating new global PrismaClient.");
    global.prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'], // Verbose logging for development
    });
  }
  console.log("[Prisma Instance] Development environment: Using global PrismaClient.");
  prismaInstance = global.prisma;
}

console.log("[Prisma Instance] PrismaClient instance is ready.");
export default prismaInstance;


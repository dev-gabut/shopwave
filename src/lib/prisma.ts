
// *************** IMPORT LIBRARY ***************
import { PrismaClient } from '@prisma/client';


// *************** GLOBAL SINGLETON 
const globalForPrisma = global as unknown as { prisma: PrismaClient };


// *************** PRISMA CLIENT SINGLETON 
/**
 * Prisma client singleton instance for database access.
 * Ensures only one instance is created in development to avoid connection issues.
 *
 * @constant
 * @type {PrismaClient}
 */
const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });


// *************** DEV HOT RELOAD SAFEGUARD 
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// *************** EXPORT SINGLETON ***************
export { prisma };

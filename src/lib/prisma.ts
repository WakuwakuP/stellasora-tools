import { PrismaClient } from '@prisma/client'

declare global {
  var globalPrisma: PrismaClient | undefined
}

// Create base Prisma client
const prisma: PrismaClient = globalThis.globalPrisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.globalPrisma = prisma
}

export { prisma }

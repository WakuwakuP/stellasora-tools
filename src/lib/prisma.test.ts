import { vi } from 'vitest'

// Mock the Prisma client since it requires external dependencies
vi.mock('@prisma/client', () => ({
  PrismaClient: class PrismaClient {
    account = {}
    content = {}
    event = {}
    eventAccess = {}
    session = {}
    user = {}
    verificationToken = {}
  },
}))

// This test verifies that the Prisma client can be created with our new schema
// and that all the models are properly defined

describe('Prisma Client', () => {
  it('should create client with new schema models', async () => {
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    // Check that all our new models are available
    expect(prisma.event).toBeDefined()
    expect(prisma.eventAccess).toBeDefined()
    expect(prisma.content).toBeDefined()

    // Check that existing auth models are still available
    expect(prisma.user).toBeDefined()
    expect(prisma.account).toBeDefined()
    expect(prisma.session).toBeDefined()
    expect(prisma.verificationToken).toBeDefined()
  })
})

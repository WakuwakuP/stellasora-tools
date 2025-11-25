import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { PrismaClient } from '@prisma/client'
import { type NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

// Create Prisma client only if in runtime environment
const prisma: PrismaClient | undefined =
  typeof window === 'undefined' && process.env.DATABASE_URL != null
    ? new PrismaClient()
    : undefined

export const authOptions: NextAuthOptions = {
  // Only use Prisma adapter if we have a working database connection
  ...(prisma !== undefined && { adapter: PrismaAdapter(prisma) }),
  callbacks: {
    session: async ({
      session,
      user,
      token,
    }: {
      session: import('next-auth').Session
      user?: import('next-auth').User
      token?: import('next-auth/jwt').JWT
    }) => ({
      ...session,
      user: {
        ...session.user,
        id:
          user?.id !== ''
            ? (user?.id ?? token?.sub ?? 'unknown')
            : (token?.sub ?? 'unknown'),
      },
    }),
  },
  pages: {
    signIn: '/auth/signin',
  },
  providers: [
    GoogleProvider({
      clientId:
        process.env.GOOGLE_CLIENT_ID != null
          ? process.env.GOOGLE_CLIENT_ID
          : 'dummy-client-id',
      clientSecret:
        process.env.GOOGLE_CLIENT_SECRET != null
          ? process.env.GOOGLE_CLIENT_SECRET
          : 'dummy-client-secret',
    }),
  ],
  session: {
    strategy: prisma !== undefined ? 'database' : 'jwt',
  },
}

import { db } from 'lib/db'
import { ZenStackAdapter } from 'lib/next-auth-adapter'
import { type NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

// DATABASE_URLが設定されている場合のみDBアダプターを使用
const hasDatabase =
  typeof window === 'undefined' && process.env.DATABASE_URL != null

export const authOptions: NextAuthOptions = {
  // ZenStack v3アダプターを使用
  ...(hasDatabase && { adapter: ZenStackAdapter(db) }),
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
    strategy: hasDatabase ? 'database' : 'jwt',
  },
}

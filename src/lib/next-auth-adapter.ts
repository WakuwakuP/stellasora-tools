/**
 * ZenStack v3用のNextAuthアダプター
 *
 * 依存: zenstack/schema.ts（自動生成ファイル）
 * 使用前に `yarn db:generate` または `yarn prebuild` でスキーマ生成が必要
 */
import { type ClientContract } from '@zenstackhq/orm'
import {
  type Adapter,
  type AdapterAccount,
  type AdapterSession,
  type AdapterUser,
  type VerificationToken,
} from 'next-auth/adapters'
import { type SchemaType } from '../../zenstack/schema'

type DbClient = ClientContract<SchemaType>

/**
 * ZenStack v3用のNextAuthアダプター
 * PrismaAdapterの代わりにZenStackクライアントを使用してNextAuth認証データを管理
 */
export function ZenStackAdapter(db: DbClient): Adapter {
  return {
    async createSession(data: {
      sessionToken: string
      userId: string
      expires: Date
    }): Promise<AdapterSession> {
      const session = await db.session.create({
        data: {
          expires: data.expires,
          sessionToken: data.sessionToken,
          userId: data.userId,
        },
      })
      return session as AdapterSession
    },
    async createUser(data: Omit<AdapterUser, 'id'>): Promise<AdapterUser> {
      const user = await db.user.create({
        data: {
          email: data.email,
          emailVerified: data.emailVerified ?? null,
          image: data.image ?? null,
          name: data.name ?? null,
        },
      })
      return user as AdapterUser
    },

    async createVerificationToken(
      data: VerificationToken,
    ): Promise<VerificationToken> {
      const token = await db.verificationToken.create({
        data: {
          expires: data.expires,
          identifier: data.identifier,
          token: data.token,
        },
      })
      return token as VerificationToken
    },

    async deleteSession(sessionToken: string): Promise<void> {
      await db.session.delete({ where: { sessionToken } })
    },

    async deleteUser(userId: string): Promise<void> {
      await db.user.delete({ where: { id: userId } })
    },

    async getSessionAndUser(
      sessionToken: string,
    ): Promise<{ session: AdapterSession; user: AdapterUser } | null> {
      const session = await db.session.findUnique({
        include: { user: true },
        where: { sessionToken },
      })
      if (!session) return null
      const { user, ...sessionData } = session
      return {
        session: sessionData as AdapterSession,
        user: user as AdapterUser,
      }
    },

    async getUser(id: string): Promise<AdapterUser | null> {
      const user = await db.user.findUnique({ where: { id } })
      return (user as AdapterUser) ?? null
    },

    async getUserByAccount(
      providerAccount: Pick<AdapterAccount, 'provider' | 'providerAccountId'>,
    ): Promise<AdapterUser | null> {
      const { providerAccountId, provider } = providerAccount
      const account = await db.account.findUnique({
        include: { user: true },
        where: {
          provider_providerAccountId: { provider, providerAccountId },
        },
      })
      return (account?.user as AdapterUser) ?? null
    },

    async getUserByEmail(email: string): Promise<AdapterUser | null> {
      const user = await db.user.findUnique({ where: { email } })
      return (user as AdapterUser) ?? null
    },

    async linkAccount(data: AdapterAccount): Promise<AdapterAccount> {
      await db.account.create({
        data: {
          access_token: data.access_token ?? null,
          expires_at: data.expires_at ?? null,
          id_token: data.id_token ?? null,
          provider: data.provider,
          providerAccountId: data.providerAccountId,
          refresh_token: data.refresh_token ?? null,
          scope: data.scope ?? null,
          session_state: data.session_state ?? null,
          token_type: data.token_type ?? null,
          type: data.type,
          userId: data.userId,
        },
      })
      return data
    },

    async unlinkAccount(
      providerAccount: Pick<AdapterAccount, 'provider' | 'providerAccountId'>,
    ): Promise<void> {
      const { providerAccountId, provider } = providerAccount
      await db.account.delete({
        where: {
          provider_providerAccountId: { provider, providerAccountId },
        },
      })
    },

    async updateSession(
      data: Partial<AdapterSession> & Pick<AdapterSession, 'sessionToken'>,
    ): Promise<AdapterSession> {
      const session = await db.session.update({
        data: {
          expires: data.expires ?? undefined,
          userId: data.userId ?? undefined,
        },
        where: { sessionToken: data.sessionToken },
      })
      return session as AdapterSession
    },

    async updateUser(
      data: Partial<AdapterUser> & Pick<AdapterUser, 'id'>,
    ): Promise<AdapterUser> {
      const user = await db.user.update({
        data: {
          email: data.email,
          emailVerified: data.emailVerified ?? undefined,
          image: data.image ?? undefined,
          name: data.name ?? undefined,
        },
        where: { id: data.id },
      })
      return user as AdapterUser
    },

    async useVerificationToken(params: {
      identifier: string
      token: string
    }): Promise<VerificationToken | null> {
      const { identifier, token } = params
      const verificationToken = await db.verificationToken.findUnique({
        where: {
          identifier_token: { identifier, token },
        },
      })
      if (!verificationToken) return null
      await db.verificationToken.delete({
        where: { identifier_token: { identifier, token } },
      })
      return verificationToken as VerificationToken
    },
  }
}

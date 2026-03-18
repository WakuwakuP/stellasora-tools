import { type ClientContract, ZenStackClient } from '@zenstackhq/orm'
import { PostgresDialect } from '@zenstackhq/orm/dialects/postgres'
import { Pool } from 'pg'
import { type SchemaType, schema } from '../../zenstack/schema'

type DbClient = ClientContract<SchemaType>

declare global {
  var globalDb: DbClient | undefined
}

function createClient(): DbClient {
  return new ZenStackClient(schema, {
    dialect: new PostgresDialect({
      pool: new Pool({
        connectionString: process.env.DATABASE_URL,
      }),
    }),
  })
}

/**
 * ZenStack v3 データベースクライアント（シングルトン）
 * 開発環境ではグローバル変数にキャッシュしてHMR時のコネクション増加を防止
 */
const db: DbClient = globalThis.globalDb ?? createClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.globalDb = db
}

export { db }

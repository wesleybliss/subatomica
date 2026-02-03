import * as sqliteCore from 'drizzle-orm/sqlite-core'
import * as postgresCore from 'drizzle-orm/pg-core'
import type { SQLiteColumnBuilderBase } from 'drizzle-orm/sqlite-core'
import type { PgColumnBuilderBase } from 'drizzle-orm/pg-core/columns/common'
import { v7 as uuidv7 } from 'uuid'

export type TursoColumns = Record<string, SQLiteColumnBuilderBase>
export type PostgresColumns = Record<string, PgColumnBuilderBase>

/**
 * SQLite-friendly timestamp (ISO string)
 */
export const tursoTimestamp = (name: string) =>
    sqliteCore.text(name)

/**
 * Base Turso table helper
 */
export const tursoTable = <
    TTableName extends string,
    TColumnsMap extends TursoColumns
>(
    name: TTableName,
    columns: TColumnsMap,
) => {
    
    const { sqliteTable, text } = sqliteCore
    const timestamp = tursoTimestamp
    
    return sqliteTable(name, {
        id: text('id')
            .primaryKey()
            .$defaultFn(() => uuidv7()),
        
        updatedAt: timestamp('updatedAt')
            .notNull()
            .$defaultFn(() => new Date().toISOString()),
        
        createdAt: timestamp('createdAt')
            .notNull()
            .$defaultFn(() => new Date().toISOString()),
        
        deletedAt: timestamp('deletedAt'),
        
        ...columns,
    })
    
}

//

/**
 * Postgres-friendly timestamp (ISO string)
 */
export const postgresTimestamp = (name: string, options = {}) =>
    postgresCore.timestamp(name, { withTimezone: true, mode: 'string', ...options })

/**
 * Base Postgres table helper
 */
export const postgresTable = <
    TTableName extends string,
    TColumnsMap extends PostgresColumns
>(
    name: TTableName,
    columns: TColumnsMap,
) => {
    
    const { pgTable, uuid } = postgresCore
    const timestamp = postgresTimestamp
    
    return pgTable(name, {
        id: uuid('id')
            .primaryKey()
            .$defaultFn(() => uuidv7()),
        updatedAt: timestamp('updatedAt').notNull().defaultNow(),
        createdAt: timestamp('createdAt').notNull().defaultNow(),
        deletedAt: timestamp('deletedAt'),
        ...columns,
    })
    
}

import type { BuildColumns, BuildExtraConfigColumns } from 'drizzle-orm/column-builder'
import * as postgresCore from 'drizzle-orm/pg-core'
import type { PgColumnBuilderBase } from 'drizzle-orm/pg-core/columns/common'
import type { PgTableExtraConfig } from 'drizzle-orm/pg-core/table'
import type { SQLiteColumnBuilderBase } from 'drizzle-orm/sqlite-core'
import * as sqliteCore from 'drizzle-orm/sqlite-core'
import type { SQLiteTableExtraConfig } from 'drizzle-orm/sqlite-core/table'
import { v7 as uuidv7 } from 'uuid'

export type TursoColumns = Record<string, SQLiteColumnBuilderBase>
export type PostgresColumns = Record<string, PgColumnBuilderBase>

/**
 * SQLite-friendly timestamp (ISO string)
 */
export const tursoTimestamp = (name: string) =>
    sqliteCore.text(name)

type TursoBaseColumnBuilders = {
    id: ReturnType<typeof sqliteCore.text>
    updatedAt: ReturnType<typeof tursoTimestamp>
    createdAt: ReturnType<typeof tursoTimestamp>
    deletedAt: ReturnType<typeof tursoTimestamp>
}

type TursoFullColumns<TColumnsMap extends TursoColumns> = TColumnsMap & TursoBaseColumnBuilders

/**
 * Base Turso table helper
 */
export const tursoTable = <
    TTableName extends string,
    TColumnsMap extends TursoColumns,
>(
    name: TTableName,
    columns: TColumnsMap,
    extraConfig?: (
        table: BuildColumns<TTableName, TursoFullColumns<TColumnsMap>, 'sqlite'>,
    ) => SQLiteTableExtraConfig,
) => {
    
    const { sqliteTable, text } = sqliteCore
    const timestamp = tursoTimestamp
    
    const baseColumns: TursoBaseColumnBuilders = {
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
    }
    
    return sqliteTable<
        TTableName,
        TursoFullColumns<TColumnsMap>
    >(name, {
        ...baseColumns,
        ...columns,
    }, extraConfig)
    
}

//

/**
 * Postgres-friendly timestamp (ISO string)
 */
export const postgresTimestamp = (name: string, options = {}) =>
    postgresCore.timestamp(name, { withTimezone: true, mode: 'string', ...options })

type PostgresBaseColumnBuilders = {
    id: ReturnType<typeof postgresCore.uuid>
    updatedAt: ReturnType<typeof postgresTimestamp>
    createdAt: ReturnType<typeof postgresTimestamp>
    deletedAt: ReturnType<typeof postgresTimestamp>
}

type PostgresFullColumns<TColumnsMap extends PostgresColumns> = TColumnsMap & PostgresBaseColumnBuilders

/**
 * Base Postgres table helper
 */
export const postgresTable = <
    TTableName extends string,
    TColumnsMap extends PostgresColumns,
>(
    name: TTableName,
    columns: TColumnsMap,
    extraConfig?: (
        table: BuildExtraConfigColumns<TTableName, PostgresFullColumns<TColumnsMap>, 'pg'>,
    ) => PgTableExtraConfig,
) => {
    
    const { pgTable, uuid } = postgresCore
    const timestamp = postgresTimestamp
    
    const baseColumns: PostgresBaseColumnBuilders = {
        id: uuid('id')
            .primaryKey()
            .$defaultFn(() => uuidv7()),
        updatedAt: timestamp('updatedAt').notNull().defaultNow(),
        createdAt: timestamp('createdAt').notNull().defaultNow(),
        deletedAt: timestamp('deletedAt'),
    }
    
    const allColumns = {
        ...baseColumns,
        ...columns,
    } as PostgresFullColumns<TColumnsMap>
    
    if (extraConfig) {
        return pgTable<
            TTableName,
            PostgresFullColumns<TColumnsMap>
        >(name, allColumns, extraConfig)
    }
    
    return pgTable<
        TTableName,
        PostgresFullColumns<TColumnsMap>
    >(name, allColumns)
    
}

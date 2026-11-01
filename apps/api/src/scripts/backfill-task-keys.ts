/**
 * Backfill script to assign stable `key` values to existing tasks.
 * Uses the same format as create: [PROJECT_ACRONYM]-[localId] (e.g. CPW-01).
 * Keys are based on the project name at backfill time and will not change on rename.
 *
 * Run with: tsx --env-file=../../.env src/scripts/backfill-task-keys.ts
 *
 * For existing Turso/SQLite data this also:
 *   1. Adds `tasks.key` if missing (NOT NULL DEFAULT '')
 *   2. Backfills keys from project acronym + localId
 *   3. Creates `tasks_project_key_unique` if missing
 *
 * Then run: pnpm --filter @repo/api db:push
 */

import { projects, tasks } from '@repo/db/schema'
import Logger from '@repo/shared/utils/logger'
import { formatTaskSlug, generateProjectAcronym } from '@repo/shared/utils/slugs'
import { and, eq, sql } from 'drizzle-orm'

import { db } from '@/db/client'
import { turso } from '@/db/turso/client.turso'

const log = new Logger('api/scripts/backfill-task-keys')

async function ensureKeyColumn() {
    if (!turso)
        throw new Error('Turso client is not initialized')
    
    const columns = await turso.execute('PRAGMA table_info(tasks)')
    const hasKey = columns.rows.some(row => row.name === 'key')
    
    if (hasKey) {
        log.d('Column tasks.key already exists')
        return
    }
    
    log.d('Adding tasks.key column...')
    await turso.execute('ALTER TABLE tasks ADD COLUMN key TEXT NOT NULL DEFAULT \'\'')
    log.d('Added tasks.key')
}

async function ensureKeyUniqueIndex() {
    if (!turso)
        throw new Error('Turso client is not initialized')
    
    const indexes = await turso.execute('PRAGMA index_list(tasks)')
    const hasIndex = indexes.rows.some(row => row.name === 'tasks_project_key_unique')
    
    if (hasIndex) {
        log.d('Index tasks_project_key_unique already exists')
        return
    }
    
    log.d('Creating tasks_project_key_unique...')
    await turso.execute(`
        CREATE UNIQUE INDEX tasks_project_key_unique
        ON tasks (projectId, key)
    `)
    log.d('Created tasks_project_key_unique')
}

async function backfillTaskKeys() {
    log.d('Starting Task key backfill...')
    
    const allProjects = await db
        .select({ id: projects.id, name: projects.name })
        .from(projects)
    
    let totalUpdated = 0
    let totalSkipped = 0
    
    for (const project of allProjects) {
        const acronym = generateProjectAcronym(project.name)
        
        const projectTasks = await db
            .select({ id: tasks.id, localId: tasks.localId, key: tasks.key })
            .from(tasks)
            .where(eq(tasks.projectId, project.id))
        
        let updated = 0
        
        for (const task of projectTasks) {
            const nextKey = formatTaskSlug(acronym, task.localId)
            
            if (task.key === nextKey) {
                totalSkipped++
                continue
            }
            
            const [conflict] = await db
                .select({ id: tasks.id })
                .from(tasks)
                .where(and(
                    eq(tasks.projectId, project.id),
                    eq(tasks.key, nextKey),
                    sql`${tasks.id} != ${task.id}`,
                ))
                .limit(1)
            
            if (conflict) {
                log.w(`  Skip task ${task.id}: key "${nextKey}" already used by ${conflict.id}`)
                totalSkipped++
                continue
            }
            
            await db
                .update(tasks)
                .set({ key: nextKey })
                .where(eq(tasks.id, task.id))
            
            updated++
            totalUpdated++
        }
        
        if (updated > 0)
            log.d(`  Project "${project.name}" (${acronym}): updated ${updated} task(s)`)
    }
    
    log.d(`Backfill complete: ${totalUpdated} updated, ${totalSkipped} skipped`)
}

async function main() {
    try {
        if (process.env.DATABASE_DIALECT === 'turso') {
            await ensureKeyColumn()
            await backfillTaskKeys()
            await ensureKeyUniqueIndex()
        } else {
            // Postgres: assume column already exists via db:push (may need a default first)
            await backfillTaskKeys()
        }
        
        log.d('Task key backfill completed successfully!')
        process.exit(0)
    } catch (error) {
        log.e('Backfill failed:', error)
        process.exit(1)
    }
}

main()

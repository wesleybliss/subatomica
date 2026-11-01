/**
 * Backfill script to assign stable `key` values to existing tasks.
 * Uses createTaskKey(projectName, localId) (e.g. ENGI-4, SS-5678).
 * Keys are based on the project name at backfill time and will not change on rename.
 *
 * Prerequisites: push the schema first so `tasks.key` exists
 *   pnpm --filter @repo/api db:push
 *
 * Run with: tsx --env-file=../../.env src/scripts/backfill-task-keys.ts
 */

import { projects, tasks } from '@repo/db/schema'
import Logger from '@repo/shared/utils/logger'
import { createProjectKey, createTaskKey } from '@repo/shared/utils/slugs'
import { and, eq, sql } from 'drizzle-orm'

import { db } from '@/db/client'

const log = new Logger('api/scripts/backfill-task-keys')

async function backfillTaskKeys() {
    log.d('Starting Task key backfill...')
    
    const allProjects = await db
        .select({ id: projects.id, name: projects.name })
        .from(projects)
    
    let totalUpdated = 0
    let totalSkipped = 0
    
    for (const project of allProjects) {
        const projectKey = createProjectKey(project.name)
        
        const projectTasks = await db
            .select({ id: tasks.id, localId: tasks.localId, key: tasks.key })
            .from(tasks)
            .where(eq(tasks.projectId, project.id))
        
        let updated = 0
        
        for (const task of projectTasks) {
            const nextKey = createTaskKey(project.name, task.localId)
            
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
            log.d(`  Project "${project.name}" (${projectKey}): updated ${updated} task(s)`)
    }
    
    log.d(`Backfill complete: ${totalUpdated} updated, ${totalSkipped} skipped`)
}

async function main() {
    try {
        await backfillTaskKeys()
        log.d('Task key backfill completed successfully!')
        process.exit(0)
    } catch (error) {
        log.e('Backfill failed:', error)
        process.exit(1)
    }
}

main()

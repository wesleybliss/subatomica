/**
 * Backfill script to assign localId to existing Tasks
 * This preserves the relative creation order (earliest = 1, next = 2, etc.)
 * Run with: tsx src/scripts/backfill-task-ids.ts
 */

import 'dotenv/config'

import { projects, tasks } from '@repo/db/schema'
import Logger from '@repo/shared/utils/logger'
import { asc, eq } from 'drizzle-orm'

import { db } from '@/db/client'

const log = new Logger('api/scripts/backfill-task-ids')

async function backfillTaskLocalIds() {
    log.d('Starting Task localId backfill...')
    
    const allProjects = await db.select({ id: projects.id, name: projects.name })
        .from(projects)
    
    let totalUpdated = 0
    
    for (const project of allProjects) {
    // Get all tasks for this project, ordered by creation date
        const projectTasks = await db
            .select({ id: tasks.id, title: tasks.title, createdAt: tasks.createdAt })
            .from(tasks)
            .where(eq(tasks.projectId, project.id))
            .orderBy(asc(tasks.createdAt))
        
        let localId = 1
        for (const task of projectTasks) {
            await db.update(tasks)
                .set({ localId })
                .where(eq(tasks.id, task.id))
            
            localId++
            totalUpdated++
        }
        
        if (projectTasks.length > 0) {
            log.d(`  Project "${project.name}": assigned localIds 1-${projectTasks.length}`)
        }
    }
    
    log.d(`Backfill complete: ${totalUpdated} tasks updated with localId`)
}

async function main() {
    try {
        await backfillTaskLocalIds()
        log.d('Task localId backfill completed successfully!')
        process.exit(0)
    } catch (error) {
        log.e('Backfill failed:', error)
        process.exit(1)
    }
}

main()

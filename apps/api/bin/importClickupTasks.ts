#!/usr/bin/env node

/**
 * Import ClickUp Tasks Script
 *
 * This script imports tasks from a tab-delimited ClickUp export file.
 *
 * Expected format (3 columns, tab-separated):
 *   Task Title\tTask URL\tStatus
 *
 * Status mapping:
 *   - "deployed to prod" -> done
 *   - "in progress" -> in-progress
 *   - "next sprint" -> backlog
 *   - "todo" -> todo
 *   - Other statuses default to "backlog"
 *
 * Usage:
 *   pnpm import:clickup <filePath> <userId> <projectId> [--dry-run]
 *
 * Example:
 *   pnpm import:clickup task/sample-clickup-tasks.txt \
 *     660e8400-e29b-41d4-a716-446655440000 \
 *     550e8400-e29b-41d4-a716-446655440000
 *
 *   pnpm import:clickup task/sample-clickup-tasks.txt \
 *     660e8400-e29b-41d4-a716-446655440000 \
 *     550e8400-e29b-41d4-a716-446655440000 \
 *     --dry-run
 *
 * The script will:
 *   1. Read tasks from the specified file
 *   2. Verify the project exists and is accessible
 *   3. Map ClickUp statuses to internal statuses
 *   4. Create tasks with proper ordering in each status column
 *   5. Add the ClickUp URL to the task description
 *
 * Options:
 *   --dry-run   Preview what would be imported without modifying the database
 */

// Load environment variables first
import 'dotenv/config'

import { readFileSync } from 'fs'
import { resolve } from 'path'
import * as client from '../src/db/client'
import { tasks, projects } from '../src/db/schema'
import { eq, desc, and } from 'drizzle-orm'

// oxlint-disable-next-line @typescript-eslint/no-explicit-any
const db: any = client.db!

// Status mapping from ClickUp to our system
const statusMap: Record<string, string> = {
    'deployed to prod': 'done',
    'in progress': 'in-progress',
    'next sprint': 'backlog',
    'todo': 'todo',
    'done': 'done',
    'backlog': 'backlog',
}

function mapStatus(clickupStatus: string): string {
    const normalized = clickupStatus.toLowerCase().trim()
    return statusMap[normalized] || 'backlog'
}

async function importTasks(
    filePath: string,
    userId: string,
    projectId: string,
    dryRun: boolean,
) {
    // Read the file (resolve from current working directory)
    const absolutePath = resolve(process.cwd(), filePath)
    const content = readFileSync(absolutePath, 'utf-8')
    const lines = content.trim().split('\n')
    
    console.log(`Found ${lines.length} tasks to import`)
    
    if (dryRun) {
        console.log('\n🔍 DRY RUN MODE - No changes will be made to the database\n')
    }
    
    // Verify project exists
    const [project] = await db
        .select()
        .from(projects)
        .where(eq(projects.id, projectId))
        .limit(1)
    
    if (!project) {
        throw new Error(`Project with ID ${projectId} not found`)
    }
    
    console.log(`Importing tasks into project: ${project.name}`)
    console.log(`User ID: ${userId}\n`)
    
    // Get starting localId from project's taskSequence
    let nextLocalId = project.taskSequence || 1
    
    let imported = 0
    let skipped = 0
    
    for (const line of lines) {
        if (!line.trim()) {
            skipped++
            continue
        }
        
        const parts = line.split('\t')
        if (parts.length !== 3) {
            console.warn(`Skipping invalid line: ${line}`)
            skipped++
            continue
        }
        
        const [title, url, clickupStatus] = parts
        const status = mapStatus(clickupStatus)
        
        // Get max order for the status to append to end
        const maxOrderTask = await db
            .select()
            .from(tasks)
            .where(and(
                eq(tasks.projectId, projectId),
                eq(tasks.status, status),
            ))
            .orderBy(desc(tasks.order))
            .limit(1)
        
        const order = maxOrderTask.length > 0 ? maxOrderTask[0].order + 1000 : 1000
        
        // Create description with ClickUp URL
        const description = `Imported from ClickUp\n\nOriginal URL: ${url}`
        
        if (dryRun) {
            console.log(`[DRY RUN] Would import: ${title} (${status}, order: ${order}, localId: ${nextLocalId})`)
            nextLocalId++
            imported++
        } else {
            try {
                await db.insert(tasks).values({
                    projectId,
                    userId,
                    localId: nextLocalId,
                    title: title.trim(),
                    description,
                    status,
                    order,
                    priority: 'medium',
                })
                
                nextLocalId++
                imported++
                console.log(`✓ Imported: ${title} (${status})`)
            } catch (error) {
                console.error(`✗ Failed to import: ${title}`, error)
                skipped++
            }
        }
    }
    
    // Update project's taskSequence to the next available number
    if (!dryRun && imported > 0) {
        await db
            .update(projects)
            .set({ taskSequence: nextLocalId })
            .where(eq(projects.id, projectId))
        console.log(`Updated project taskSequence to ${nextLocalId}`)
    }
    
    console.log('\nImport complete:')
    console.log(`  ${dryRun ? 'Would import' : 'Imported'}: ${imported}`)
    console.log(`  Skipped: ${skipped}`)
}

// Parse command line arguments
const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const positionalArgs = args.filter(arg => arg !== '--dry-run')

if (positionalArgs.length !== 3) {
    console.error('Usage: importClickupTasks.ts <filePath> <userId> <projectId> [--dry-run]')
    console.error('Example: importClickupTasks.ts task/sample-clickup-tasks.txt user-456 abc-123')
    console.error('Example: importClickupTasks.ts task/sample-clickup-tasks.txt user-456 abc-123 --dry-run')
    process.exit(1)
}

const [filePath, userId, projectId] = positionalArgs

importTasks(filePath, userId, projectId, dryRun)
    .then(() => process.exit(0))
    .catch(error => {
        console.error('Import failed:', error)
        process.exit(1)
    })

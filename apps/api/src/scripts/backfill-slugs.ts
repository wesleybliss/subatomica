/**
 * Backfill script to generate slugs for existing Teams and Projects
 * Run with: tsx src/scripts/backfill-slugs.ts
 */

import 'dotenv/config'

import { projects, teams } from '@repo/db/schema'
import Logger from '@repo/shared/utils/logger'
import { generateSlug } from '@repo/shared/utils/slugs'
import { eq } from 'drizzle-orm'

import { db } from '@/db/client'

const log = new Logger('api/scripts/backfill-slugs')

async function backfillTeamSlugs() {
    log.d('Starting Team slug backfill...')
    
    const allTeams = await db.select().from(teams)
    let updated = 0
    
    for (const team of allTeams) {
        if (!team.slug) {
            const slug = generateSlug(team.name)
            await db.update(teams)
                .set({ slug })
                .where(eq(teams.id, team.id))
            updated++
            log.d(`  Updated team "${team.name}" -> "${slug}"`)
        }
    }
    
    log.d(`Backfill complete: ${updated} teams updated`)
}

async function backfillProjectSlugs() {
    log.d('Starting Project slug backfill...')
    
    const allProjects = await db.select().from(projects)
    let updated = 0
    
    for (const project of allProjects) {
        if (!project.slug) {
            const slug = generateSlug(project.name)
            await db.update(projects)
                .set({ slug })
                .where(eq(projects.id, project.id))
            updated++
            log.d(`  Updated project "${project.name}" -> "${slug}"`)
        }
    }
    
    log.d(`Backfill complete: ${updated} projects updated`)
}

async function main() {
    try {
        await backfillTeamSlugs()
        await backfillProjectSlugs()
        log.d('All backfills completed successfully!')
        process.exit(0)
    } catch (error) {
        log.e('Backfill failed:', error)
        process.exit(1)
    }
}

main()

/**
 * Backfill script to generate slugs for existing Teams and Projects
 * Run with: tsx src/scripts/backfill-slugs.ts
 */

import 'dotenv/config'

import { generateSlug } from '@repo/shared/utils/slugs'
import { eq } from 'drizzle-orm'

import { db } from '@/db/client'
import { projects,teams } from '@/db/schema'

async function backfillTeamSlugs() {
    console.log('Starting Team slug backfill...')
    
    const allTeams = await db.select().from(teams)
    let updated = 0
    
    for (const team of allTeams) {
        if (!team.slug) {
            const slug = generateSlug(team.name)
            await db.update(teams)
                .set({ slug })
                .where(eq(teams.id, team.id))
            updated++
            console.log(`  Updated team "${team.name}" -> "${slug}"`)
        }
    }
    
    console.log(`Backfill complete: ${updated} teams updated`)
}

async function backfillProjectSlugs() {
    console.log('Starting Project slug backfill...')
    
    const allProjects = await db.select().from(projects)
    let updated = 0
    
    for (const project of allProjects) {
        if (!project.slug) {
            const slug = generateSlug(project.name)
            await db.update(projects)
                .set({ slug })
                .where(eq(projects.id, project.id))
            updated++
            console.log(`  Updated project "${project.name}" -> "${slug}"`)
        }
    }
    
    console.log(`Backfill complete: ${updated} projects updated`)
}

async function main() {
    try {
        await backfillTeamSlugs()
        await backfillProjectSlugs()
        console.log('All backfills completed successfully!')
        process.exit(0)
    } catch (error) {
        console.error('Backfill failed:', error)
        process.exit(1)
    }
}

main()

import logger from '@/lib/logger'
import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/db/actions/shared'
import { getProjectById } from '@/lib/db/actions/projects'
import { getTasks } from '@/lib/db/actions/tasks'

const log = logger('api/t/[teamId]/p/[projectId]')

export const GET = async (
    _request: Request,
    { params }: { params: Promise<{ teamId: string, projectId: string }> },
) => {
    
    try {
        
        await getCurrentUser()
        
        const { teamId, projectId } = await params
        
        const project = await getProjectById(projectId)
        
        if (!project)
            return NextResponse.json(
                { error: 'Project not found.' },
                { status: 404 },
            )
        
        const tasks = await getTasks(project.id, teamId)
        
        return NextResponse.json({
            project,
            tasks,
        })
        
    } catch (e) {
        
        log.e(e)
        
        return NextResponse.json(
            { error: 'Failed to fetch project.' },
            { status: 500 },
        )
        
    }
    
}

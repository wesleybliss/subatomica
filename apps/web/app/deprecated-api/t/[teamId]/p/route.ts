import logger from '@/lib/logger'
import { NextResponse } from 'next/server'
import { getTeamById } from '@/lib/db/actions/teams'
import { getProjects } from '@/lib/db/actions/projects'

const log = logger('api/t/[teamId]/p')

export const GET = async (
    _request: Request,
    { params }: { params: Promise<{ teamId: string }> },
) => {
    
    try {
        
        const { teamId } = await params
        const team = await getTeamById(teamId)
        
        if (!team)
            return NextResponse.json(
                { error: 'Team not found.' },
                { status: 404 },
            )
        
        const result = await getProjects(team.id)
        
        return NextResponse.json(result)
        
    } catch (e) {
        
        log.e(e)
        
        return NextResponse.json(
            { error: 'Failed to fetch projects.' },
            { status: 500 },
        )
        
    }
    
}

import logger from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { getTeamById } from '@/lib/db/actions/teams'

const log = logger('api/teams/[teamId]')

export default async function teamRoute(request: NextRequest) {
    
    try {
        
        const userId = 'todo'
        const teamId = 'todo'
        const result = await getTeamById(teamId)
        
        return NextResponse.json(result)
        
    } catch (e) {
        
        log.e('teamRoute', e)
        
        return NextResponse.json(
            { error: 'Failed to fetch teams.'},
            { status: 500 }
        )
        
    }
    
}

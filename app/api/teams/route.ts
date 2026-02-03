import logger from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { getUserTeams } from '@/lib/db/actions/teams'

const log = logger('api/teams')

export default async function teamsRoute(request: NextRequest) {
    
    try {
        
        const userId = 'todo'
        const result = await getUserTeams(userId)
        
        return NextResponse.json(result)
        
    } catch (e) {
        
        log.e('teamsRoute', e)
        
        return NextResponse.json(
            { error: 'Failed to fetch teams.' },
            { status: 500 }
        )
        
    }
    
}

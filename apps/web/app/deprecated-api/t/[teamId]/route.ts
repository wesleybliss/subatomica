import logger from '@/lib/logger'
import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/db/actions/shared'
import { getTeamById } from '@/lib/db/actions/teams'

const log = logger('api/t/[teamId]')

export const GET = async (
    _request: Request,
    { params }: { params: Promise<{ teamId: string }> },
) => {
    
    try {
        
        await getCurrentUser()
        
        const { teamId } = await params
        const result = await getTeamById(teamId)
        
        return NextResponse.json(result)
        
    } catch (e) {
        
        log.e(e)
        
        return NextResponse.json(
            { error: 'Failed to fetch team.' },
            { status: 500 },
        )
        
    }
    
}

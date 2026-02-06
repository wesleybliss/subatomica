import logger from '@/lib/logger'
import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/db/actions/shared'
import { getUserTeams } from '@/lib/db/actions/teams'

const log = logger('api/t')

export async function GET() {
    
    try {
        
        const user = await getCurrentUser()
        const result = await getUserTeams(user.id)
        
        return NextResponse.json(result)
        
    } catch (e) {
        
        log.e(e)
        
        return NextResponse.json(
            { error: 'Failed to fetch teams.' },
            { status: 500 },
        )
        
    }
    
}

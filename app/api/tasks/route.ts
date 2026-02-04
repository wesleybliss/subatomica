import { NextResponse, type NextRequest } from 'next/server'
import { getTasks } from '@/lib/db/actions/tasks'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId') || undefined
    const teamId = searchParams.get('teamId') || undefined
    try {
        const tasks = await getTasks(projectId, teamId)
        return NextResponse.json(tasks)
    } catch (error) {
        console.error('[v0] Failed to fetch tasks:', error)
        return NextResponse.json({ error: 'Failed to fetch tasks.' }, { status: 500 })
    }
}

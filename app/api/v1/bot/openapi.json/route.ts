import { NextResponse } from 'next/server'
import { botOpenApiSpec } from '@/lib/api/botOpenapi'

export async function GET() {
    return NextResponse.json(botOpenApiSpec)
}

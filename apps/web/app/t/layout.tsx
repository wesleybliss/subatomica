import { getCurrentUser } from '@/lib/db/actions/shared'
import { getUserTeams } from '@/lib/db/actions/teams'
import StoreWriterClient from '@/components/StoreWriterClient'
import type React from 'react'

export default async function TeamsLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    
    const user = await getCurrentUser()
    const teams = await getUserTeams(user.id)
    
    return (<>
        
        {children}
        
        <StoreWriterClient storeKey="teams" data={teams} />
    
    </>)
    
}

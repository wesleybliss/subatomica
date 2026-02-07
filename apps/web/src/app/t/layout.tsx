import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getUserTeams } from '@/lib/queries/teams.queries'
import StoreWriterClient from '@/components/StoreWriterClient'
import type { ReactNode } from 'react'
import { Team } from '@repo/shared'
import { useSession } from '@/lib/auth-client'

export default function TeamsLayout({ children }: Readonly<{ children: ReactNode }>) {
    
    const session = useSession()
    const user = session.data?.user!
    
    const [teams, setTeams] = useState<Team[]>([])
    
    useEffect(() => {
        
        if (!user) return
        
        getUserTeams().then(it => setTeams(it))
        
    }, [user])
    
    return (<>
        
        {children}
        
        <StoreWriterClient storeKey="teams" data={teams} />
    
    </>)
    
}

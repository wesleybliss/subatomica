import { useState, useEffect } from 'react'
import { getUserTeams } from '@/lib/queries/teams.queries'
import StoreWriterClient from '@/components/StoreWriterClient'
import { Team } from '@repo/shared/types'
import { useSession } from '@/lib/auth-client'
import { Outlet } from 'react-router-dom'

export default function TeamsLayout() {
    
    const session = useSession()
    const user = session.data?.user
    
    const [teams, setTeams] = useState<Team[]>([])
    
    useEffect(() => {
        
        if (!user) return console.warn('no user')
        console.log('fetching teams for user:', user.email)
        getUserTeams().then(it => {
            console.log('fetched teams:', it)
            setTeams(it)
        })
        
    }, [user])
    
    return (<>
        
        <Outlet />
        
        <StoreWriterClient storeKey="teams" data={teams} />
    
    </>)
    
}

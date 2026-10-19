import { useMemo } from 'react'
import { Outlet,useNavigate, useParams } from 'react-router-dom'

import { useTeamStore } from '@/store'

export default function TeamSettingsLayout() {
    
    const params = useParams()
    const navigate = useNavigate()
    
    const teamSlug = params.teamSlug as string
    
    const teams = useTeamStore(s => s.teams)
    
    const team = useMemo(() => (
        teams?.find(it => it.slug === teamSlug)
    ), [teams, teamSlug])
    
    if (!team)
        navigate('/')
    
    return <Outlet />
    
}

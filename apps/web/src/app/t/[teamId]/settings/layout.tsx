import { useParams, useNavigate } from 'react-router-dom'
import React, { useEffect, useState } from 'react'
import { getTeamById } from '@/lib/queries/teams.queries'
import { Team } from '@repo/shared/types'

export default function WorkspaceSettingsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    
    const params = useParams()
    const navigate = useNavigate()
    
    const teamId = params.teamId as string
    
    const [team, setTeam] = useState<Team>()
    
    useEffect(() => {
        getTeamById(teamId).then(it => setTeam(it))
    }, [teamId])
    
    if (!team)
        navigate('/')
    
    return children
    
}

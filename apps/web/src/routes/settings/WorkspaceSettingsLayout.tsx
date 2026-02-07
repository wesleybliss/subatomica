import { useParams, useNavigate, Outlet } from 'react-router-dom'
import * as store from '@/store'
import React, { useMemo } from 'react'
import { useWireValue } from '@forminator/react-wire'

export default function WorkspaceSettingsLayout() {
    
    const params = useParams()
    const navigate = useNavigate()
    
    const teamId = params.teamId as string
    
    const teams = useWireValue(store.teams)
    
    const team = useMemo(() => (
        teams?.find(it => it.id === teamId)
    ), [teams, teamId])
    
    if (!team)
        navigate('/')
    
    return <Outlet />
    
}

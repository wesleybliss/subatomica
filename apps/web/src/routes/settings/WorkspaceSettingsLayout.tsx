import { useWireValue } from '@forminator/react-wire'
import React, { useMemo } from 'react'
import { Outlet,useNavigate, useParams } from 'react-router-dom'

import * as store from '@/store'

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

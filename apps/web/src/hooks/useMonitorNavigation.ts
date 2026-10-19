import Logger from '@repo/shared/utils/logger'
import { useEffect } from 'react'
import { useLocation,useParams } from 'react-router-dom'

import { useProjectStore, useTaskStore, useTeamStore } from '@/store'

const log = new Logger('web/hooks/useMonitorNavigation')

const normalizeParam = (value: string | string[] | undefined) => {
    
    if (Array.isArray(value))
        return value[0] ?? null
    
    return value ?? null
    
}

const useMonitorNavigation = () => {
    
    const params = useParams()
    const location = useLocation()
    const pathname = location.pathname
    
    const setSelectedTeamSlug = useTeamStore(s => s.setSelectedTeamSlug)
    const setSelectedProjectSlug = useProjectStore(s => s.setSelectedProjectSlug)
    const setSelectedTaskSlug = useTaskStore(s => s.setSelectedTaskSlug)
    
    useEffect(() => {
        
        const teamSlug = normalizeParam(params?.teamSlug as string | string[] | undefined)
        const projectSlug = normalizeParam(params?.projectSlug as string | string[] | undefined)
        const taskSlug = normalizeParam(params?.taskSlug as string | string[] | undefined)
        
        log.d('useMonitorNavigation', {
            teamSlug,
            projectSlug,
            taskSlug,
            params: params,
        })
        
        setSelectedTeamSlug(teamSlug)
        setSelectedProjectSlug(projectSlug)
        setSelectedTaskSlug(taskSlug)
        
    }, [params, pathname])
    
}

export default useMonitorNavigation

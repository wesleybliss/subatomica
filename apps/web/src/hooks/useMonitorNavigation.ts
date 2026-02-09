import { useWire } from '@forminator/react-wire'
import { useEffect } from 'react'
import { useLocation,useParams } from 'react-router-dom'

import { selectedProjectId as storeSelectedProjectId } from '@/store/projects'
import { selectedTaskId as storeSelectedTaskId } from '@/store/tasks'
import { selectedTeamId as storeSelectedTeamId } from '@/store/teams'

const normalizeParam = (value: string | string[] | undefined) => {
    
    if (Array.isArray(value))
        return value[0] ?? null
    
    return value ?? null
    
}

const useMonitorNavigation = () => {
    
    const params = useParams()
    const location = useLocation()
    const pathname = location.pathname
    
    const selectedTeamId = useWire(storeSelectedTeamId)
    const selectedProjectId = useWire(storeSelectedProjectId)
    const selectedTaskId = useWire(storeSelectedTaskId)
    
    useEffect(() => {
        
        const teamSlug = normalizeParam(params?.teamSlug as string | string[] | undefined)
        const projectSlug = normalizeParam(params?.projectSlug as string | string[] | undefined)
        const taskSlug = normalizeParam(params?.taskSlug as string | string[] | undefined)
        
        console.log('useMonitorNavigation', {
            teamSlug,
            projectSlug,
            taskSlug,
            params: params,
        })
        
        selectedTeamSlug.setValue(teamSlug)
        selectedProjectSlug.setValue(projectSlug)
        selectedTaskSlug.setValue(taskSlug)
        
    }, [params, pathname])
    
}

export default useMonitorNavigation

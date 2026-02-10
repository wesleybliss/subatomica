import { useWire } from '@forminator/react-wire'
import { useEffect } from 'react'
import { useLocation,useParams } from 'react-router-dom'

import { selectedProjectSlug as storeSelectedProjectSlug } from '@/store/projects'
import { selectedTaskSlug as storeSelectedTaskSlug } from '@/store/tasks'
import { selectedTeamSlug as storeSelectedTeamSlug } from '@/store/teams'

const normalizeParam = (value: string | string[] | undefined) => {
    
    if (Array.isArray(value))
        return value[0] ?? null
    
    return value ?? null
    
}

const useMonitorNavigation = () => {
    
    const params = useParams()
    const location = useLocation()
    const pathname = location.pathname
    
    const selectedTeamSlug = useWire(storeSelectedTeamSlug)
    const selectedProjectSlug = useWire(storeSelectedProjectSlug)
    const selectedTaskSlug = useWire(storeSelectedTaskSlug)
    
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

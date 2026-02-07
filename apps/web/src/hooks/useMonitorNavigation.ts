import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import { useParams, usePathname } from 'next/navigation'
import { useWire } from '@forminator/react-wire'
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
    const pathname = usePathname()
    
    const selectedTeamId = useWire(storeSelectedTeamId)
    const selectedProjectId = useWire(storeSelectedProjectId)
    const selectedTaskId = useWire(storeSelectedTaskId)
    
    useEffect(() => {
        
        const teamId = normalizeParam(params?.teamId as string | string[] | undefined)
        const projectId = normalizeParam(params?.projectId as string | string[] | undefined)
        const taskId = normalizeParam(params?.taskId as string | string[] | undefined)
        
        selectedTeamId.setValue(teamId)
        selectedProjectId.setValue(projectId)
        selectedTaskId.setValue(taskId)
        
    }, [params, pathname])
    
}

export default useMonitorNavigation

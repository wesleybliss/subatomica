import { Task } from '@repo/shared/types'
import logger from '@repo/shared/utils/logger'
import { useState } from 'react'
import { toast } from 'sonner'
import { v7 as uuidv7 } from 'uuid'

import { useCreateTaskMutation } from '@/lib/mutations/tasks.mutations'
import { useLaneStore, useSelectedProjectId, useSelectedTeamId, useTaskStore } from '@/store'

const log = logger('GlobalCommandProjectViewModel')

const activeQueryKey = ['tasks']

const GlobalCommandProjectViewModel = () => {
    
    const tasks = useTaskStore(s => s.tasks)
    const lanes = useLaneStore(s => s.lanes)
    const selectedTeamId = useSelectedTeamId()
    const selectedProjectId = useSelectedProjectId()
    
    const [localTasks, setLocalTasks] = useState<Task[]>(tasks || [])
    
    const createTaskMutation = useCreateTaskMutation(
        localTasks,
        setLocalTasks,
        activeQueryKey,
        selectedTeamId,
        selectedProjectId,
        window.location.reload,
    )
    
    const handleCreateTask = async () => {
        
        try {
            
            const tempId = uuidv7()
            const status = lanes
                .sort((a, b) => a.order - b.order)[0].key
            
            await createTaskMutation.mutateAsync({ status, tempId })
            
        } catch (e) {
            
            log.e('Failed to create task:', e)
            toast.error('Failed to create task')
            
        }
        
    }
    
    return {
        
        // Methods
        handleCreateTask,
        
    }
    
}

export default GlobalCommandProjectViewModel

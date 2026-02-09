import { useWireValue } from '@forminator/react-wire'
import { Task } from '@repo/shared/types'
import logger from '@repo/shared/utils/logger'
import { useState } from 'react'
import { toast } from 'sonner'
import { v7 as uuidv7 } from 'uuid'

import { useCreateTaskMutation } from '@/lib/mutations/tasks.mutations'
import * as store from '@/store'

const log = logger('GlobalCommandProjectViewModel')

const activeQueryKey = ['tasks']

const GlobalCommandProjectViewModel = () => {
    
    const tasks = useWireValue(store.tasks)
    const lanes = useWireValue(store.lanes)
    const selectedTeamId = useWireValue(store.selectedTeamId)
    const selectedProjectId = useWireValue(store.selectedProjectId)
    
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

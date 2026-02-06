import logger from '@/lib/logger'
import { useState } from 'react'
import { useWireValue } from '@forminator/react-wire'
import * as store from '@/store'
import { useCreateTaskMutation } from '@/lib/mutations/tasks.mutations'
import { useRouter } from 'next/navigation'
import { Task } from '@repo/shared/types'
import { toast } from 'sonner'

const log = logger('GlobalCommandProjectViewModel')

const activeQueryKey = ['tasks']

const GlobalCommandProjectViewModel = () => {
    
    const router = useRouter()
    
    const tasks = useWireValue(store.tasks)
    const lanes = useWireValue(store.lanes)
    const selectedProjectId = useWireValue(store.selectedProjectId)
    
    const [localTasks, setLocalTasks] = useState<Task[]>(tasks || [])
    
    const createTaskMutation = useCreateTaskMutation(
        localTasks,
        setLocalTasks,
        activeQueryKey,
        selectedProjectId,
        router.refresh,
    )
    
    const handleCreateTask = async () => {
        
        try {
            
            const tempId = `temp-${Date.now()}`
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

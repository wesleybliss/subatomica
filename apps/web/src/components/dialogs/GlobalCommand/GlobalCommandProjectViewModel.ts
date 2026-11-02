import Logger from '@repo/shared/utils/logger'
import { toast } from 'sonner'
import { v7 as uuidv7 } from 'uuid'

import { useCreateTaskMutation } from '@/lib/mutations/tasks.mutations'
import { tasksQueryKey } from '@/lib/queries/tasks.queries'
import { useLaneStore, useSelectedProjectId, useSelectedTeamId } from '@/store'

const log = new Logger('web/components/dialogs/GlobalCommand/GlobalCommandProjectViewModel')

const GlobalCommandProjectViewModel = () => {
    
    const lanes = useLaneStore(s => s.lanes)
    const selectedTeamId = useSelectedTeamId()
    const selectedProjectId = useSelectedProjectId()
    
    const activeQueryKey = tasksQueryKey(
        selectedTeamId ?? undefined,
        selectedProjectId ?? undefined,
    )
    
    const createTaskMutation = useCreateTaskMutation(
        activeQueryKey,
        selectedTeamId,
        selectedProjectId,
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

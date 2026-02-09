import { useWireValue } from '@forminator/react-wire'
import type { Task, TeamMemberProfile } from '@repo/shared/types'
import logger from '@repo/shared/utils/logger'

import { TaskDetailForm } from '@/components/tasks/TaskDetailForm'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import * as store from '@/store'

const log = logger('TaskDetailDialog')

type TaskDetailDialogProps = {
    task: Task
    teamMembers: TeamMemberProfile[]
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function TaskDetailDialog({ task, teamMembers, open, onOpenChange }: TaskDetailDialogProps) {
    
    const selectedTeamId = useWireValue(store.selectedTeamId)
    const selectedProjectId = useWireValue(store.selectedProjectId)
    
    if (!selectedTeamId || !selectedProjectId) {
        log.w('dialog opened without a team or project selected, skipping render')
        return null
    }
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-155">
                <DialogHeader>
                    <DialogTitle>Edit task</DialogTitle>
                </DialogHeader>
                <TaskDetailForm
                    task={task}
                    teamId={selectedTeamId}
                    teamMembers={teamMembers}
                    projectId={selectedProjectId}
                    onClose={() => onOpenChange(false)} />
            </DialogContent>
        </Dialog>
    )
}

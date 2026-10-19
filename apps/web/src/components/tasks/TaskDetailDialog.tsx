import type { Task, TeamMemberProfile } from '@repo/shared/types'
import Logger from '@repo/shared/utils/logger'

import { TaskDetailForm } from '@/components/tasks/TaskDetailForm'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useSelectedProjectId, useSelectedTeamId } from '@/store'

const log = new Logger('web/components/tasks/TaskDetailDialog')

type TaskDetailDialogProps = {
    task: Task
    teamMembers: TeamMemberProfile[]
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function TaskDetailDialog({ task, teamMembers, open, onOpenChange }: TaskDetailDialogProps) {
    
    const selectedTeamId = useSelectedTeamId()
    const selectedProjectId = useSelectedProjectId()
    
    if (!selectedTeamId || !selectedProjectId) {
        if (open)
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

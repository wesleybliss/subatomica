import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { Task, TeamMemberProfile } from '@repo/shared/types'
import { TaskDetailForm } from '@/components/tasks/TaskDetailForm'

type TaskDetailDialogProps = {
    task: Task
    teamMembers: TeamMemberProfile[]
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function TaskDetailDialog({ task, teamMembers, open, onOpenChange }: TaskDetailDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-155">
                <DialogHeader>
                    <DialogTitle>Edit task</DialogTitle>
                </DialogHeader>
                <TaskDetailForm
                    task={task}
                    teamMembers={teamMembers}
                    onClose={() => onOpenChange(false)} />
            </DialogContent>
        </Dialog>
    )
}

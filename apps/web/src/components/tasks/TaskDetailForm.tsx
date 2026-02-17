import type { Task, TeamMemberProfile } from '@repo/shared/types'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from '@/components/ui/combobox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useUpdateTaskMutation } from '@/lib/mutations/tasks.mutations'
type TaskDetailFormProps = {
    task: Task
    teamId: string | null
    teamMembers: TeamMemberProfile[]
    projectId: string
    onSaved?: (task: Task) => void
    onClose?: () => void
}
export function TaskDetailForm({ task, teamId, teamMembers, projectId, onSaved, onClose }: TaskDetailFormProps) {
    const [title, setTitle] = useState(task.title)
    const [assigneeId, setAssigneeId] = useState<string>(task.assigneeId ?? '')
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [StarterKit],
        content: task.description || '<projects></projects>',
        editorProps: {
            attributes: {
                class: [
                    'min-h-[140px] rounded-md border border-border',
                    'bg-background px-3 py-2 text-sm focus:outline-none',
                ].join(' '),
            },
        },
    })

    const updateTaskMutation = useUpdateTaskMutation(teamId, projectId, (updated) => {
        onSaved?.(updated)
        onClose?.()
    })

    useEffect(() => {
        setTitle(task.title)
        setAssigneeId(task.assigneeId ?? '')
        if (editor && task.description !== editor.getHTML())
            editor.commands.setContent(task.description || '<projects></projects>')
    }, [editor, task.assigneeId, task.description, task.title])

    const members = useMemo(() => teamMembers, [teamMembers])

    const handleSave = async () => {
        const nextTitle = title.trim()
        if (!nextTitle || !editor)
            return
        if (!teamId)
            return console.warn('TaskDetailForm missing teamId')

        updateTaskMutation.mutate({
            taskId: task.id,
            data: {
                title: nextTitle,
                description: editor.getHTML(),
                assigneeId: assigneeId || undefined,
            },
        })
    }
    return (
        <div className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor={`task-title-${task.id}`}>Title</Label>
                <Input
                    id={`task-title-${task.id}`}
                    value={title}
                    onChange={event => setTitle(event.target.value)}
                    placeholder="Task title" />
            </div>
            <div className="grid gap-2">
                <Label htmlFor={`task-assignee-${task.id}`}>Assignee</Label>
                <Combobox
                    value={assigneeId}
                    onValueChange={value => setAssigneeId(value ?? '')}>
                    <ComboboxInput
                        id={`task-assignee-${task.id}`}
                        placeholder="Assign a teammate"
                        showClear />
                    <ComboboxContent>
                        <ComboboxList>
                            <ComboboxItem value="">Unassigned</ComboboxItem>
                            {members.map(member => (
                                <ComboboxItem key={member.id} value={member.id}>
                                    {member.name || member.email}
                                </ComboboxItem>
                            ))}
                        </ComboboxList>
                        <ComboboxEmpty>No teammates found</ComboboxEmpty>
                    </ComboboxContent>
                </Combobox>
            </div>
            <div className="grid gap-2">
                <Label>Description</Label>
                <EditorContent editor={editor} />
            </div>
            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="button" onClick={handleSave} disabled={updateTaskMutation.isPending || !title.trim()}>
                    {updateTaskMutation.isPending ? 'Saving...' : 'Save'}
                </Button>
            </div>
        </div>
    )
}

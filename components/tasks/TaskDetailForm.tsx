'use client'
import { useEffect, useMemo, useState } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import type { Task, TeamMemberProfile } from '@/types'
import { updateTask } from '@/lib/db/actions/tasks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from '@/components/ui/combobox'
type TaskDetailFormProps = {
    task: Task
    teamMembers: TeamMemberProfile[]
    onSaved?: (task: Task) => void
    onClose?: () => void
}
export function TaskDetailForm({ task, teamMembers, onSaved, onClose }: TaskDetailFormProps) {
    const [title, setTitle] = useState(task.title)
    const [assigneeId, setAssigneeId] = useState<string>(task.assigneeId ?? '')
    const [isSaving, setIsSaving] = useState(false)
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [StarterKit],
        content: task.description || '<p></p>',
        editorProps: {
            attributes: {
                class: [
                    'min-h-[140px] rounded-md border border-border',
                    'bg-background px-3 py-2 text-sm focus:outline-none',
                ].join(' '),
            },
        },
    })
    useEffect(() => {
        setTitle(task.title)
        setAssigneeId(task.assigneeId ?? '')
        if (editor && task.description !== editor.getHTML())
            editor.commands.setContent(task.description || '<p></p>')
    }, [editor, task.assigneeId, task.description, task.title])
    const members = useMemo(() => teamMembers, [teamMembers])
    const handleSave = async () => {
        const nextTitle = title.trim()
        if (!nextTitle || !editor)
            return
        setIsSaving(true)
        try {
            const updated = await updateTask(task.id, {
                title: nextTitle,
                description: editor.getHTML(),
                assigneeId: assigneeId || undefined,
            })
            onSaved?.(updated)
            onClose?.()
        } catch (error) {
            console.error('[v0] Failed to update task:', error)
        } finally {
            setIsSaving(false)
        }
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
                <Button type="button" onClick={handleSave} disabled={isSaving || !title.trim()}>
                    {isSaving ? 'Saving...' : 'Save'}
                </Button>
            </div>
        </div>
    )
}

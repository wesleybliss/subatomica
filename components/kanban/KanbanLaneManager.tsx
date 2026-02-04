'use client'
import { useEffect, useMemo, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Trash2 } from 'lucide-react'
import type { TaskLane } from '@/types'
import { createTaskLane, deleteTaskLane, updateTaskLane } from '@/lib/db/actions/lanes'
type KanbanLaneManagerProps = {
    projectId: string
    lanes: TaskLane[]
    onLanesChange?: (lanes: TaskLane[]) => void
}
export function KanbanLaneManager({ projectId, lanes, onLanesChange }: KanbanLaneManagerProps) {
    const [localLanes, setLocalLanes] = useState<TaskLane[]>(lanes)
    const [isAdding, setIsAdding] = useState(false)
    const [savingLaneId, setSavingLaneId] = useState<string | null>(null)
    const [deletingLaneId, setDeletingLaneId] = useState<string | null>(null)
    const canDelete = useMemo(() => localLanes.length > 1, [localLanes.length])
    useEffect(() => {
        setLocalLanes(lanes)
    }, [lanes])
    const handleAddLane = async () => {
        setIsAdding(true)
        try {
            const created = await createTaskLane(projectId, 'New Lane', 'bg-muted')
            const next = [...localLanes, created].sort((a, b) => a.order - b.order)
            setLocalLanes(next)
            onLanesChange?.(next)
        } catch (error) {
            console.error('[v0] Failed to create lane:', error)
        } finally {
            setIsAdding(false)
        }
    }
    const handleRenameLane = async (laneId: string, name: string) => {
        if (!name.trim())
            return
        setSavingLaneId(laneId)
        try {
            const updated = await updateTaskLane(laneId, { name: name.trim() })
            const next = localLanes.map(lane => (lane.id === laneId ? updated : lane))
            setLocalLanes(next)
            onLanesChange?.(next)
        } catch (error) {
            console.error('[v0] Failed to update lane:', error)
        } finally {
            setSavingLaneId(null)
        }
    }
    const handleDeleteLane = async (laneId: string) => {
        if (!canDelete)
            return
        setDeletingLaneId(laneId)
        try {
            await deleteTaskLane(laneId)
            const next = localLanes.filter(lane => lane.id !== laneId)
            setLocalLanes(next)
            onLanesChange?.(next)
        } catch (error) {
            console.error('[v0] Failed to delete lane:', error)
        } finally {
            setDeletingLaneId(null)
        }
    }
    return (
        <Dialog>
            <DialogTrigger render={<Button variant="outline" size="sm" />}>
                Manage lanes
            </DialogTrigger>
            <DialogContent className="sm:max-w-[520px]">
                <DialogHeader>
                    <DialogTitle>Project lanes</DialogTitle>
                </DialogHeader>
                <div className="grid gap-3">
                    {localLanes.map(lane => (
                        <div key={lane.id} className="flex items-center gap-2">
                            <Input
                                defaultValue={lane.name}
                                onBlur={event => handleRenameLane(lane.id, event.target.value)}
                                className="h-9"
                                disabled={savingLaneId === lane.id} />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteLane(lane.id)}
                                disabled={!canDelete || deletingLaneId === lane.id}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between">
                    <p className="text-xs text-muted-foreground">Changes apply immediately.</p>
                    <Button type="button" onClick={handleAddLane} disabled={isAdding}>
                        <Plus className="h-4 w-4" />
                        Add lane
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

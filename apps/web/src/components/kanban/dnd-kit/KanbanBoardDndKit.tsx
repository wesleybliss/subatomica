import {
    type CollisionDetection,
    DndContext,
    type DragEndEvent,
    type DragOverEvent,
    DragOverlay,
    type DragStartEvent,
    MouseSensor,
    TouchSensor,
    type UniqueIdentifier,
    useSensor,
    useSensors,
} from '@dnd-kit/core'
import type { Task, TaskLane, TaskStatus } from '@repo/shared/types'
import { Plus } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import useKanbanBoardDndViewModel from '@/components/kanban/KanbanBoardDndViewModel'
import { KanbanCardFace } from '@/components/kanban/KanbanCardFace'
import { moveTaskInBoard } from '@/components/kanban/kanbanDndOrder'
import { Button } from '@/components/ui/button'

import type { KanbanBoardProps } from '../KanbanBoardDnd'
import { createKanbanCollisionDetection } from './collision'
import { KanbanTaskLaneDndKit } from './KanbanTaskLaneDndKit'

const KanbanBoardDndKit = ({
    tasks,
    lanes,
    projectId,
    teamId,
    teamMembers,
    onRefresh,
    queryKey,
    onLanesChange,
}: KanbanBoardProps) => {
    const vm = useKanbanBoardDndViewModel(
        lanes,
        tasks,
        teamId,
        projectId,
        queryKey,
        onRefresh,
        onLanesChange,
        false,
    )
    
    const [activeTask, setActiveTask] = useState<Task | null>(null)
    const dragSnapshot = useRef<Task[] | null>(null)
    const tasksRef = useRef(vm.localTasks)
    // Collision stabilizer (MultipleContainers pattern) — prevents over-id thrashing
    const lastOverId = useRef<UniqueIdentifier | null>(null)
    const recentlyMovedToNewContainer = useRef(false)
    const collisionDetection = useCallback<CollisionDetection>(
        args => createKanbanCollisionDetection(lastOverId, recentlyMovedToNewContainer)(args),
        [],
    )
    
    useEffect(() => {
        tasksRef.current = vm.localTasks
    }, [vm.localTasks])
    
    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 8 } }),
    )
    
    const resolveTarget = (
        overId: UniqueIdentifier,
        overData: Record<string, unknown> | undefined,
        board: Task[],
    ): { status: TaskStatus, overTaskId?: string } | null => {
        if (overData?.type === 'column' && typeof overData.status === 'string')
            return { status: overData.status as TaskStatus }
        
        if (overData?.type === 'task') {
            const overTaskId = String(overId)
            // Prefer live board status — droppable data can lag one frame after a move
            const live = board.find(t => t.id === overTaskId)?.status
            const status = (live ?? overData.status) as TaskStatus | undefined
            if (!status) return null
            return { status, overTaskId }
        }
        
        const col = String(overId).match(/^column:(.+)$/)
        if (col) return { status: col[1] as TaskStatus }
        return null
    }
    
    const onDragStart = (event: DragStartEvent) => {
        lastOverId.current = null
        recentlyMovedToNewContainer.current = false
        const data = event.active.data.current
        if (data?.type === 'task') {
            dragSnapshot.current = vm.localTasks
            const task = vm.localTasks.find(t => t.id === String(event.active.id))
            setActiveTask(task ?? null)
        }
    }
    
    const onDragOver = (event: DragOverEvent) => {
        const { active, over } = event
        if (!over) return
        if (active.id === over.id) return
        if (active.data.current?.type !== 'task') return
        if (over.data.current?.type === 'lane') return
        
        const activeId = String(active.id)
        const board = tasksRef.current
        const activeTaskRow = board.find(t => t.id === activeId)
        if (!activeTaskRow) return
        
        const target = resolveTarget(
            over.id,
            over.data.current as Record<string, unknown> | undefined,
            board,
        )
        if (!target) return
        
        // CRITICAL: only setState when crossing containers.
        // Same-column reorder is sortable transforms + onDragEnd.
        // Live same-column setState ↔ collision flip caused max update depth.
        if (activeTaskRow.status === target.status) return
        
        const next = moveTaskInBoard(board, activeId, target.status, target.overTaskId)
        if (!next) return
        
        recentlyMovedToNewContainer.current = true
        tasksRef.current = next
        vm.setLocalTasks(next)
    }
    
    const persistActiveTask = (taskList: Task[], taskId: string) => {
        const task = taskList.find(t => t.id === taskId)
        if (!task) return
        vm.updateTaskOrderMutation.mutate({
            taskId: task.id,
            status: task.status,
            order: task.order,
        })
    }
    
    const onDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        setActiveTask(null)
        lastOverId.current = null
        recentlyMovedToNewContainer.current = false
        const snapshot = dragSnapshot.current
        dragSnapshot.current = null
        
        if (active.data.current?.type === 'lane') {
            if (over?.data.current?.type === 'lane')
                void vm.handleReorderLane(active.data.current.laneId, over.data.current.laneId)
            return
        }
        
        if (active.data.current?.type !== 'task') return
        
        if (!over) {
            if (snapshot) vm.setLocalTasks(snapshot)
            return
        }
        
        if (over.data.current?.type === 'lane') {
            persistActiveTask(vm.localTasks, String(active.id))
            return
        }
        
        // Finalize position (same-column reorder + any last cross-column nudge)
        const target = resolveTarget(
            over.id,
            over.data.current as Record<string, unknown> | undefined,
            vm.localTasks,
        )
        if (target) {
            const next = moveTaskInBoard(
                vm.localTasks,
                String(active.id),
                target.status,
                target.overTaskId,
            )
            if (next) {
                vm.setLocalTasks(next)
                persistActiveTask(next, String(active.id))
                return
            }
        }
        
        persistActiveTask(vm.localTasks, String(active.id))
    }
    
    const onDragCancel = () => {
        setActiveTask(null)
        lastOverId.current = null
        recentlyMovedToNewContainer.current = false
        if (dragSnapshot.current) {
            vm.setLocalTasks(dragSnapshot.current)
            dragSnapshot.current = null
        }
    }
    
    return (
        <DndContext
            sensors={sensors}
            collisionDetection={collisionDetection}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
            onDragCancel={onDragCancel}>
            <div
                data-testid="KanbanBoardDndKit"
                className="flex gap-4 h-full overflow-x-auto overflow-y-hidden pt-1 pb-4 px-1">
                
                {vm.localLanes.map((it: TaskLane) => (
                    <KanbanTaskLaneDndKit
                        key={it.id}
                        lane={it}
                        tasks={vm.tasksByStatus[it.key] ?? []}
                        teamId={teamId}
                        teamMembers={teamMembers}
                        isCollapsed={vm.collapsedLanes.includes(it.id)}
                        onToggleCollapsed={vm.handleToggleCollapsed}
                        editingLaneId={vm.editingLaneId}
                        editingLaneName={vm.editingLaneName}
                        setEditingLaneName={vm.setEditingLaneName}
                        isCreating={vm.isCreating}
                        savingLaneId={vm.savingLaneId}
                        canManageLanes={vm.canManageLanes}
                        canDeleteLane={vm.canDeleteLane}
                        deletingLaneId={vm.deletingLaneId}
                        handleCreateTask={vm.handleCreateTask}
                        handleStartRenameLane={vm.handleStartRenameLane}
                        handleRenameLane={vm.handleRenameLane}
                        handleCancelRenameLane={vm.handleCancelRenameLane}
                        handleDeleteLane={vm.handleDeleteLane}
                        handleLaneColorChange={vm.handleLaneColorChange} />
                ))}
                
                {vm.canManageLanes && (
                    <div className="shrink-0 flex flex-col w-8 h-full min-h-0 rounded overflow-hidden pt-8">
                        <div className="flex items-center w-full mb-3 justify-center">
                            <div className="flex items-center gap-2 w-full
                                rotate-180 [writing-mode:vertical-rl]
                                [text-orientation:mixed] whitespace-nowrap">
                                <Button
                                    className="w-full h-full text-xs"
                                    variant="outline"
                                    onClick={vm.handleAddLane}
                                    disabled={vm.isAddingLane}>
                                    <Plus className="size-4" />
                                    Add lane
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            {createPortal(
                <DragOverlay dropAnimation={null}>
                    {activeTask ? (
                        <KanbanCardFace
                            task={activeTask}
                            teamId={teamId}
                            teamMembers={teamMembers}
                            className="shadow-lg rotate-1 cursor-grabbing" />
                    ) : null}
                </DragOverlay>,
                // oxlint-disable-next-line no-restricted-globals
                document.body,
            )}
        </DndContext>
    )
}

export default KanbanBoardDndKit

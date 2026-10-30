import {
    DndContext,
    type DragEndEvent,
    type DragOverEvent,
    DragOverlay,
    type DragStartEvent,
    MouseSensor,
    pointerWithin,
    TouchSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core'
import type { Task, TaskLane } from '@repo/shared/types'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { createPortal } from 'react-dom'

import useKanbanBoardDndViewModel from '@/components/kanban/KanbanBoardDndViewModel'
import { KanbanCardFace } from '@/components/kanban/KanbanCardFace'
import { Button } from '@/components/ui/button'

import type { KanbanBoardProps } from '../KanbanBoardDnd'
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
    
    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 8 } }),
    )
    
    const onDragStart = (event: DragStartEvent) => {
        const data = event.active.data.current
        if (data?.type === 'task') {
            const task = vm.localTasks.find(t => t.id === String(event.active.id))
            setActiveTask(task ?? null)
            vm.setDraggingTaskId(String(event.active.id))
        }
    }
    
    const onDragOver = (event: DragOverEvent) => {
        const over = event.over?.data.current
        if (!over) {
            vm.setDropIndicator(null)
            return
        }
        if (over.type === 'task') {
            vm.setDropIndicator({ status: over.status, taskId: over.taskId })
            return
        }
        if (over.type === 'column') {
            vm.setDropIndicator({ status: over.status })
        }
    }
    
    const onDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        setActiveTask(null)
        vm.setDraggingTaskId(null)
        vm.setDropIndicator(null)
        
        if (!over) return
        
        const activeData = active.data.current
        const overData = over.data.current
        
        if (activeData?.type === 'lane' && overData?.type === 'lane') {
            void vm.handleReorderLane(activeData.laneId, overData.laneId)
            return
        }
        
        if (activeData?.type !== 'task') return
        
        if (overData?.type === 'task') {
            void vm.handleDrop(String(active.id), overData.status, overData.taskId)
            return
        }
        
        if (overData?.type === 'column')
            void vm.handleDrop(String(active.id), overData.status)
    }
    
    return (
        <DndContext
            sensors={sensors}
            collisionDetection={pointerWithin}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
            onDragCancel={() => {
                setActiveTask(null)
                vm.setDraggingTaskId(null)
                vm.setDropIndicator(null)
            }}>
            <div
                data-testid="KanbanBoardDndKit"
                className="flex gap-4 h-full overflow-x-auto overflow-y-hidden pt-1 pb-4 px-1">
                
                {vm.localLanes.map((it: TaskLane) => (
                    <KanbanTaskLaneDndKit
                        key={it.id}
                        lane={it}
                        tasks={vm.tasksByStatus[it.key]}
                        teamId={teamId}
                        teamMembers={teamMembers}
                        isCollapsed={vm.collapsedLanes.includes(it.id)}
                        onToggleCollapsed={vm.handleToggleCollapsed}
                        dropIndicator={vm.dropIndicator}
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

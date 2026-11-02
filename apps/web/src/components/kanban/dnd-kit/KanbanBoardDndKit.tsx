import {
    DndContext,
    DragOverlay,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core'
import type { Task, TaskLane } from '@repo/shared/types'
import { Plus } from 'lucide-react'
import { createPortal } from 'react-dom'

import useKanbanBoardDndViewModel from '@/components/kanban/KanbanBoardDndViewModel'
import { KanbanCardFace } from '@/components/kanban/KanbanCardFace'
import { Button } from '@/components/ui/button'
import useDraggableTasks from '@/hooks/useDraggableTasks'

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
    
    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 8 } }),
    )
    
    const {
        activeTask,
        collisionDetection,
        onDragStart,
        onDragOver,
        onDragEnd,
        onDragCancel,
    } = useDraggableTasks({
        displayTasks: vm.displayTasks,
        setDragProjection: vm.setDragProjection,
        persistTask: (taskList: Task[], taskId: string) => {
            const task = taskList.find(t => t.id === taskId)
            if (!task) return
            vm.updateTaskOrderMutation.mutate({
                taskId: task.id,
                status: task.status,
                order: task.order,
                optimisticTasks: taskList,
            })
        },
        reorderLane: (sourceLaneId, targetLaneId) => {
            void vm.taskLanes.handleReorderLane(sourceLaneId, targetLaneId)
        },
    })
    
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
                        isCollapsed={vm.taskLanes.collapsedLanes.includes(it.id)}
                        onToggleCollapsed={vm.taskLanes.handleToggleCollapsed}
                        editingLaneId={vm.taskLanes.editingLaneId}
                        editingLaneName={vm.taskLanes.editingLaneName}
                        setEditingLaneName={vm.taskLanes.setEditingLaneName}
                        isCreating={vm.isCreating}
                        savingLaneId={vm.taskLanes.savingLaneId}
                        canManageLanes={vm.taskLanes.canManageLanes}
                        canDeleteLane={vm.taskLanes.canDeleteLane}
                        deletingLaneId={vm.taskLanes.deletingLaneId}
                        handleCreateTask={vm.handleCreateTask}
                        handleStartRenameLane={vm.taskLanes.handleStartRenameLane}
                        handleRenameLane={vm.taskLanes.handleRenameLane}
                        handleCancelRenameLane={vm.taskLanes.handleCancelRenameLane}
                        handleDeleteLane={vm.taskLanes.handleDeleteLane}
                        handleLaneColorChange={vm.taskLanes.handleLaneColorChange} />
                ))}
                
                {vm.taskLanes.canManageLanes && (
                    <div className="shrink-0 flex flex-col w-8 h-full min-h-0 rounded overflow-hidden pt-8">
                        <div className="flex items-center w-full mb-3 justify-center">
                            <div className="flex items-center gap-2 w-full
                                rotate-180 [writing-mode:vertical-rl]
                                [text-orientation:mixed] whitespace-nowrap">
                                <Button
                                    className="w-full h-full text-xs"
                                    variant="outline"
                                    onClick={vm.taskLanes.handleAddLane}
                                    disabled={vm.taskLanes.isAddingLane}>
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

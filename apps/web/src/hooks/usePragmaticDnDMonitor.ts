import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { TaskStatus } from '@repo/shared/types'
import { RefObject, useEffect } from 'react'

import {
    type ColumnDropData,
    isColumnDropData,
    isTaskDragData,
    isTaskDropData,
    type TaskDropData,
} from '@/components/kanban/dragTypes'

const usePragmaticDnDMonitor = (
    enabled: boolean,
    handleDropRef: RefObject<((
        taskId: string,
        newStatus: TaskStatus,
        targetTaskId?: string,
    ) => Promise<void>)>,
) => {
    
    useEffect(() => {
        if (!enabled) return
        
        const monitor = monitorForElements as unknown as (args: {
            onDrop?: (args: {
                source: { data: Record<string, unknown> }
                location: { current: { dropTargets: Array<{ data: unknown }> } }
            }) => void
        }) => () => void
        
        return monitor({
            // Visual drop indicators live on each card/column (enter/leave) — never
            // set React state from onDrag pointer samples at the board level.
            onDrop: (args: {
                source: { data: Record<string, unknown> }
                location: { current: { dropTargets: Array<{ data: unknown }> } }
            }) => {
                const { source, location } = args
                if (!isTaskDragData(source.data)) return
                const dropTargets = location.current.dropTargets
                if (!dropTargets.length) return
                const taskTarget = dropTargets.find((target: { data: unknown }) =>
                    isTaskDropData(target.data as Record<string, unknown>),
                )
                const taskTargetData = taskTarget?.data
                if (taskTargetData && isTaskDropData(taskTargetData as Record<string, unknown>)) {
                    const taskData = taskTargetData as TaskDropData
                    void handleDropRef.current(
                        source.data.taskId,
                        taskData.status,
                        taskData.taskId,
                    )
                    return
                }
                const columnTarget = dropTargets.find((target: { data: unknown }) =>
                    isColumnDropData(target.data as Record<string, unknown>),
                )
                const columnTargetData = columnTarget?.data
                if (columnTargetData && isColumnDropData(columnTargetData as Record<string, unknown>)) {
                    const columnData = columnTargetData as ColumnDropData
                    void handleDropRef.current(
                        source.data.taskId,
                        columnData.status,
                    )
                }
            },
        })
    }, [enabled, handleDropRef])
    
}

export default usePragmaticDnDMonitor

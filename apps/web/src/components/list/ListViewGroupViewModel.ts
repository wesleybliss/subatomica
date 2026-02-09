import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { Task, TaskLane } from '@repo/shared/types'
import { useEffect, useMemo,useRef, useState } from 'react'

const ListViewGroupViewModel = (
    tasks: Task[],
    selectedTasks: Set<string>,
    lane: TaskLane,
    onTasksReorder?: (taskIds: string[], status: string) => void,
) => {
    
    const groupRef = useRef<HTMLDivElement>(null)
    const [isExpanded, setIsExpanded] = useState(true)
    
    const allSelected = useMemo(() => (
        tasks.length > 0 && tasks.every(
            t => selectedTasks.has(t.id))
    ), [tasks, selectedTasks])
    
    const someSelected = useMemo(() => tasks.some(t => selectedTasks.has(t.id)), [tasks, selectedTasks])
    
    useEffect(() => {
        
        const element = groupRef.current
        
        if (!element) return
        
        return dropTargetForElements({
            element,
            getData: () => ({
                type: 'list-group',
                status: lane.key,
            }),
            canDrop: (args: { source: { data: Record<string, unknown> } }) => {
                const data = args.source.data
                return (
                    data.type === 'list-task'
                    && data.status !== lane.key
                )
            },
            onDrop: (args: { source: { data: Record<string, unknown> } }) => {
                const taskId = args.source.data.taskId as string
                onTasksReorder?.([taskId], lane.key)
            },
        })
        
    }, [lane.key, onTasksReorder])
    
    const laneColor = useMemo(() => lane.color ? `#${lane.color}` : undefined, [lane])
    
    return {
        
        // Refs
        groupRef,
        
        // State
        isExpanded,
        setIsExpanded,
        
        // Memos
        allSelected,
        someSelected,
        laneColor,
        
        
    }
    
}

export default ListViewGroupViewModel

import { useState } from 'react'
import { useWireValue } from '@forminator/react-wire'
import * as store from '@/store'
import { KanbanCard } from './KanbanCard'
import { KanbanColumn } from './KanbanColumn'

export interface KanbanTask {
    id: string
    projectId: string
    title: string
    description?: string
    assignee?: {
        name: string
        avatar?: string
    }
    date?: string
    status: string
    priority?: 'low' | 'medium' | 'high'
    flagged?: boolean
}

interface KanbanBoardProps {
    tasks: KanbanTask[]
    onTaskClick?: (task: KanbanTask) => void
    onTaskToggle?: (taskId: string, checked: boolean) => void
}

export function KanbanBoard({ tasks, onTaskClick, onTaskToggle }: KanbanBoardProps) {
    const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set())
    
    const lanes = useWireValue(store.lanes)
    
    const toggleCard = (taskId: string) => {
        const newSelected = new Set(selectedCards)
        if (newSelected.has(taskId)) {
            newSelected.delete(taskId)
        } else {
            newSelected.add(taskId)
        }
        setSelectedCards(newSelected)
        onTaskToggle?.(taskId, !selectedCards.has(taskId))
    }
    
    // Group tasks by status
    const tasksByStatus = tasks.reduce((acc, task) => {
        if (!acc[task.status])
            acc[task.status] = []
        console.log(task.title, '->', task.status)
        acc[task.status].push(task)
        return acc
    }, {} as Record<string, KanbanTask[]>)
    
    // Update column counts
    const columnsWithCounts = lanes.map(it => ({
        ...it,
        count: tasksByStatus[it.key]?.length || 0,
    }))
    
    return (
        <div className="flex gap-4 h-full overflow-x-auto pb-4">
            {columnsWithCounts.map(column => (
                <KanbanColumn key={column.id} title={column.name} count={column.count}>
                    {tasksByStatus[column.id]?.map(task => (
                        <KanbanCard
                            key={task.id}
                            task={task}
                            selected={selectedCards.has(task.id)}
                            onToggle={() => toggleCard(task.id)}
                            onClick={() => onTaskClick?.(task)}/>
                    ))}
                </KanbanColumn>
            ))}
        </div>
    )
}

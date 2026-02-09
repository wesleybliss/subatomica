import { useState } from 'react'

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

const COLUMNS = [
    { id: 'backlog', title: 'Backlog', count: 0 },
    { id: 'todo', title: 'Todo', count: 0 },
    { id: 'in-progress', title: 'In Progress', count: 0 },
    { id: 'done', title: 'Done', count: 0 },
]

export function KanbanBoard({ tasks, onTaskClick, onTaskToggle }: KanbanBoardProps) {
    const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set())
    
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
        if (!acc[task.status]) {
            acc[task.status] = []
        }
        acc[task.status].push(task)
        return acc
    }, {} as Record<string, KanbanTask[]>)
    
    // Update column counts
    const columnsWithCounts = COLUMNS.map(col => ({
        ...col,
        count: tasksByStatus[col.id]?.length || 0,
    }))
    
    return (
        <div className="flex gap-4 h-full overflow-x-auto pb-4">
            {columnsWithCounts.map(column => (
                <KanbanColumn key={column.id} title={column.title} count={column.count}>
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

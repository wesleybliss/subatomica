import type { Project, Task, TaskLane, TeamMemberProfile } from '@repo/shared/types'
import { useState } from 'react'

import KanbanBoardDndKit from '@/components/kanban/dnd-kit/KanbanBoardDndKit'
import { useDebugStore } from '@/store'

import KanbanBoardDnd from './KanbanBoardDnd'

interface KanbanViewProps {
    teamId: string
    project: Project
    tasks: Task[]
    initialLanes: TaskLane[]
    teamMembers: TeamMemberProfile[]
    tasksQueryKey: readonly ['tasks', string | undefined, string | undefined]
}

const KanbanView = ({
    teamId,
    project,
    tasks,
    initialLanes,
    teamMembers,
    tasksQueryKey,
}: KanbanViewProps) => {
    
    const projectId = project.id
    const kanbanDndEngine = useDebugStore(s => s.kanbanDndEngine)
    
    const [lanes, setLanes] = useState<TaskLane[]>(initialLanes)
    
    const Board = kanbanDndEngine === 'dnd-kit'
        ? KanbanBoardDndKit
        : KanbanBoardDnd
    
    return (
        
        <div
            data-testid="KanbanView"
            data-dnd-engine={kanbanDndEngine}
            className="flex-1 overflow-hidden px-6 py-5">
            
            <Board
                tasks={tasks}
                lanes={lanes}
                projectId={projectId}
                teamId={teamId}
                teamMembers={teamMembers}
                queryKey={tasksQueryKey}
                onLanesChange={setLanes} />
        
        </div>
        
    )
    
}

export default KanbanView

import type { Project, Task, TaskLane, TeamMemberProfile } from '@repo/shared/types'
import { useState } from 'react'

import KanbanBoardDndKit from '@/components/kanban/dnd-kit/KanbanBoardDndKit'
import { useKanbanUiStore } from '@/store'

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
    const dndEngine = useKanbanUiStore(s => s.dndEngine)
    
    const [lanes, setLanes] = useState<TaskLane[]>(initialLanes)
    
    const Board = dndEngine === 'dnd-kit'
        ? KanbanBoardDndKit
        : KanbanBoardDnd
    
    return (
        
        <div
            data-testid="KanbanView"
            data-dnd-engine={dndEngine}
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

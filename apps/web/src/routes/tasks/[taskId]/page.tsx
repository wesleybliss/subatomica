import { useParams, useNavigate } from 'react-router-dom'
import { getProjectById } from '@/lib/queries/projects.queries'
import { getTaskById } from '@/lib/queries/tasks.queries'
import { getTeamMembers } from '@/lib/queries/teams.queries'
import { TaskDetailForm } from '@/components/tasks/TaskDetailForm'
import { useEffect, useState } from 'react'
import { Project, Task, TeamMemberProfile } from '@repo/shared/types'

export default function NotePage() {
    
    const params = useParams()
    const navigate = useNavigate()
    
    const teamId = params.teamId as string
    const projectId = params.projectId as string
    const taskId = params.taskId as string
    
    const [project, setProject] = useState<Project>()
    const [task, setTask] = useState<Task>()
    const [teamMembers, setTeamMembers] = useState<TeamMemberProfile[]>()
    
    useEffect(() => {
        
        const fetchDataTodo = async () => {
            
            const _project = await getProjectById(projectId)
            
            if (!_project)
                return navigate(`/t/${teamId}`)
            
            const _task = await getTaskById(taskId)
            
            if (!_task)
                return navigate(`/t/${teamId}/p/${projectId}`)
            
            const _teamMembers = await getTeamMembers(teamId)
            
            setProject(_project)
            setTask(_task)
            setTeamMembers(_teamMembers)
            
        }
        
        fetchDataTodo()
        
    }, [])
    
    return (
        <div className="flex flex-1 overflow-hidden">
            <div className="flex-1 overflow-hidden bg-background p-6">
                <TaskDetailForm task={task} teamMembers={teamMembers} />
            </div>
        </div>
    )
}

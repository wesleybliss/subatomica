import { getProjects } from '@/lib/queries/projects.queries'
import { getTasksByTeam } from '@/lib/queries/tasks.queries'
import TimelineView from '@/components/timeline/TimelineView'
import { useParams } from 'react-router-dom'
import { Project, Task } from '@repo/shared/types'
import { useState, useEffect } from 'react'

export default function TeamViewsPage() {
    
    const params = useParams()
    
    const teamId = params.teamId as string
    
    const [projects, setProjects] = useState<Project[]>()
    const [tasks, setTasks] = useState<Task[]>()
    
    useEffect(() => {
        
        const fetchDataTodo = async () => {
            const [_projects, _tasks] = await Promise.all([
                getProjects(teamId),
                getTasksByTeam(teamId),
            ])
            setProjects(_projects)
            setTasks(_tasks)
        }
        
        fetchDataTodo()
        
    })
    
    return (
        <TimelineView projects={projects} tasks={tasks} />
    )
}

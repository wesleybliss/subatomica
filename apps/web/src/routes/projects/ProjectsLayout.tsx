import { useParams, useNavigate } from 'react-router-dom'
import { useMemo } from 'react'
import { useGetProjectsQuery } from '@/lib/queries/projects.queries'
import { useGetTasksQuery } from '@/lib/queries/tasks.queries'
import { Outlet } from 'react-router-dom'

export default function ProjectsLayout() {
    
    const params = useParams()
    const navigate = useNavigate()
    const teamId: string | null = params.teamId as string
    
    const { isPending: projectsIsPending, error: projectsError } = useGetProjectsQuery(teamId)
    const { isPending: tasksIsPending, error: tasksError } = useGetTasksQuery(teamId)
    
    const isPending = useMemo(() => (
        projectsIsPending || tasksIsPending
    ), [projectsIsPending, tasksIsPending])
    
    if (!teamId) navigate('/')
    
    if (isPending)
        return <div>Loading projects...</div>
    
    if (projectsError)
        return <div>projectsError: {projectsError.message}</div>
    
    if (tasksError)
        return <div>tasksError: {tasksError.message}</div>
    
    return <Outlet />
    
}

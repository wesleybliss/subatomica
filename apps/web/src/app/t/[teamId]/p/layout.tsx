import { useParams, useNavigate } from 'react-router-dom'
import { useMemo } from 'react'
import { useGetProjectsQuery } from '@/lib/queries/projects.queries'
import { useGetTasksQuery } from '@/lib/queries/tasks.queries'
import type React from 'react'
import { Outlet } from 'react-router-dom'

interface TeamProjectsLayoutProps {
    children: React.ReactNode
}

export default function TeamProjectsLayout() {
    
    const params = useParams()
    const navigate = useNavigate()
    const teamId: string | null = params.teamId as string
    
    const { isPending: projectsIsPending, error: projectsError, data: projects = [] } = useGetProjectsQuery(teamId)
    const { isPending: tasksIsPending, error: tasksError, data: tasks = [] } = useGetTasksQuery(teamId)
    
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
    
    return (<>
        
        <Outlet />
        
        {/*<StoreWriterClient storeKey="projects" data={projects} />
        <StoreWriterClient storeKey="tasks" data={tasks} />*/}
    
    </>)
}

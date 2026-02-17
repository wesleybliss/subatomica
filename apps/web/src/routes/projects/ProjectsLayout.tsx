import { useWireValue } from '@forminator/react-wire'
import { Loader2 } from 'lucide-react'
import { useMemo } from 'react'
import { Outlet, useNavigate, useParams } from 'react-router-dom'

import { useGetProjectsQuery } from '@/lib/queries/projects.queries'
import { useGetTasksQuery } from '@/lib/queries/tasks.queries'
import * as store from '@/store'

export default function ProjectsLayout() {
    
    const params = useParams()
    const navigate = useNavigate()
    const teamSlug: string | null = params.teamSlug as string
    
    const teams = useWireValue(store.teams)
    const team = useMemo(() => (
        teams?.find(it => it.slug === teamSlug)
    ), [teams, teamSlug])
    
    const teamId = team?.id
    
    const { isPending: projectsIsPending, error: projectsError } = useGetProjectsQuery(teamId!)
    const { isPending: tasksIsPending, error: tasksError } = useGetTasksQuery(teamId!)
    
    const isPending = useMemo(() => (
        projectsIsPending || tasksIsPending
    ), [projectsIsPending, tasksIsPending])
    
    if (!teamSlug) navigate('/')
    
    if (isPending)
        return (
            <div className="flex flex-1 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    
    if (projectsError)
        return <div>projectsError: {projectsError.message}</div>
    
    if (tasksError)
        return <div>tasksError: {tasksError.message}</div>
    
    return <Outlet />
    
}

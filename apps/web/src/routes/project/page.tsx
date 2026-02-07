import { useWireValue } from '@forminator/react-wire'
import * as store from '@/store'
import { useParams, useNavigate } from 'react-router-dom'
import { useGetProjectQuery } from '@/lib/queries/projects.queries'
import { ProjectDetailClient } from '@/routes/project/ProjectDetailClient'
import StoreWriterClient from '@/components/StoreWriterClient'
import { useGetProjectLanesQuery } from '@/lib/queries/lanes.queries'
import { useMemo } from 'react'

interface ProjectDetailPageProps {

}

export default function ProjectDetailPage() {
    
    const params = useParams()
    const navigate = useNavigate()
    
    const teamId = params.teamId as string
    const projectId = params.projectId as string
    
    const teamMembers = useWireValue(store.teamMembers)
    const projects = useWireValue(store.projects)
    const tasks = useWireValue(store.tasks)
    
    const { isPending: projectIsPending, error: projectError, data: project } = useGetProjectQuery(teamId, projectId)
    const { isPending: lanesIsPending, error: lanesError, data: lanes } = useGetProjectLanesQuery(teamId, projectId)
    
    const isPending = useMemo(() => (
        projectIsPending || lanesIsPending
    ), [projectIsPending, lanesIsPending])
    
    if (!teamId) {
        console.warn('ProjectDetailPage: no teamId')
        navigate(`/teams/${teamId}`)
        return null
    }
    
    if (isPending)
        return <div>Loading project...</div>
    
    if (!project) {
        console.warn('ProjectDetailPage: no project')
        return null
    }
    
    if (project.teamId !== teamId) {
        console.warn('ProjectDetailPage: teamId mismatch', { projectTeamId: project.teamId, teamId })
        return null
    }
    
    if (projectError)
        return <div>projectError: {projectError.message}</div>
    
    if (lanesError)
        return <div>lanesError: {lanesError.message}</div>
    
    return (<>
        
        <ProjectDetailClient
            teamId={teamId}
            project={project}
            initialTasks={tasks}
            initialLanes={lanes}
            teamMembers={teamMembers}
            projects={projects} />
        
        <StoreWriterClient storeKey="lanes" data={lanes} />
    
    </>)
    
}

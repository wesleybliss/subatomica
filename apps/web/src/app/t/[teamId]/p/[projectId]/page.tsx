import { useWireValue } from '@forminator/react-wire'
import * as store from '@/store'
import { useParams, useNavigate } from 'react-router-dom'
import { useGetProjectQuery } from '@/lib/queries/projects.queries'
import { ProjectDetailClient } from './ProjectDetailClient'
import StoreWriterClient from '@/components/StoreWriterClient'

interface ProjectDetailPageProps {

}

export default function ProjectDetailPage() {
    
    const params = useParams()
    const navigate = useNavigate()
    
    const teamId = params.teamId as string
    const projectId = params.projectId as string
    
    const teamMembers = useWireValue(store.teamMembers)
    const projects = useWireValue(store.projects)
    const lanes = useWireValue(store.lanes)
    const tasks = useWireValue(store.tasks)
    
    const { isPending: projectIsPending, error: projectError, data: project } = useGetProjectQuery(teamId, projectId)
    
    if (!teamId) {
        navigate(`/teams/${teamId}`)
        return null
    }
    
    if (projectIsPending)
        return <div>Loading project...</div>
    
    if (!project || project.teamId !== teamId)
        return null
    
    if (projectError)
        return <div>projectError: {projectError.message}</div>
    
    return (<>
        
        <div>ProjectDetailPage</div>
        
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

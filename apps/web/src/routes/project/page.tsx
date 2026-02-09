import { useWireValue } from '@forminator/react-wire'
import { useNavigate,useParams } from 'react-router-dom'

import { useGetProjectQuery } from '@/lib/queries/projects.queries'
import { ProjectDetailClient } from '@/routes/project/ProjectDetailClient'
import * as store from '@/store'

export default function ProjectDetailPage() {
    
    const params = useParams()
    const navigate = useNavigate()
    
    const teamId = params.teamId as string
    const projectId = params.projectId as string
    
    const teamMembers = useWireValue(store.teamMembers)
    const projects = useWireValue(store.projects)
    const tasks = useWireValue(store.tasks)
    
    const { isPending, error, data: project } = useGetProjectQuery(teamId, projectId)
    
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
    
    if (error)
        return <div>error: {error.message}</div>
    
    return (
        
        <ProjectDetailClient
            teamId={teamId}
            project={project}
            initialTasks={tasks}
            initialLanes={project?.taskLanes || []}
            teamMembers={teamMembers}
            projects={projects} />
        
    )
    
}

import Logger from '@repo/shared/utils/logger'
import { Loader2 } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'

import { useGetProjectQuery } from '@/lib/queries/projects.queries'
import { useGetTeamMembersQuery } from '@/lib/queries/teams.queries'
import { ProjectDetailClient } from '@/routes/project/ProjectDetailClient'
import { useProjectStore, useTaskStore, useTeamStore } from '@/store'

const log = new Logger('web/routes/project/page')

export default function ProjectDetailPage() {
    const params = useParams()
    const navigate = useNavigate()
    
    const teamSlug = params.teamSlug as string
    const projectSlug = params.projectSlug as string
    
    const teams = useTeamStore(s => s.teams)
    const projects = useProjectStore(s => s.projects)
    const tasks = useTaskStore(s => s.tasks)
    
    // Find team by slug to get ID
    const team = teams?.find(t => t.slug === teamSlug)
    const teamId = team?.id
    
    // Find project by slug to get ID
    const project = projects?.find(p => p.slug === projectSlug && p.teamId === teamId)
    const projectId = project?.id
    
    const { isPending, error, data: projectData } = useGetProjectQuery(teamId || '', projectId || '')
    const { data: teamMembers = [] } = useGetTeamMembersQuery(teamId)
    
    if (!teamSlug) {
        log.w('ProjectDetailPage: no teamSlug')
        navigate('/t')
        return null
    }
    
    if (!teamId) {
        log.w('ProjectDetailPage: team not found')
        return <div>Team not found</div>
    }
    
    if (!projectSlug) {
        log.w('ProjectDetailPage: no projectSlug')
        navigate(`/t/${teamSlug}`)
        return null
    }
    
    if (isPending)
        return (
            <div className="flex flex-1 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    
    if (!projectData) {
        log.w('ProjectDetailPage: no project')
        return null
    }
    
    if (projectData.teamId !== teamId) {
        log.w('ProjectDetailPage: teamId mismatch', { projectTeamId: projectData.teamId, teamId })
        return null
    }
    
    if (error)
        return <div>error: {error.message}</div>
    
    return (
        <ProjectDetailClient
            teamId={teamId}
            project={projectData}
            initialTasks={tasks}
            initialLanes={projectData?.taskLanes || []}
            teamMembers={teamMembers}
            projects={projects} />
    )
}

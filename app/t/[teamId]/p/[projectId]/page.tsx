import { redirect } from 'next/navigation'
import { getProjectById, getProjects } from '@/lib/db/actions/projects'
import { getTasks } from '@/lib/db/actions/tasks'
import { getTeamMembers } from '@/lib/db/actions/teams'
import { getProjectLanes } from '@/lib/db/actions/lanes'
import { ProjectDetailClient } from './ProjectDetailClient'
import StoreWriterClient from '@/components/StoreWriterClient'
import type React from 'react'

interface ProjectDetailPageProps {
    params: Promise<{ teamId: string; projectId: string }>
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
    
    const { teamId, projectId } = await params
    
    const project = await getProjectById(projectId)
    
    if (!project || project.teamId !== teamId)
        redirect(`/t/${teamId}/p`)
    
    let tasks
    let lanes
    let teamMembers
    let projects
    
    try {
        // @todo clean up this garbage
        ;[tasks, lanes, teamMembers, projects] = await Promise.all([
            getTasks(projectId),
            getProjectLanes(projectId),
            getTeamMembers(teamId),
            getProjects(teamId),
        ])
    } catch (e) {
        console.error('ProjectDetailPage', e)
        return <div className="p-6">Unable to load project</div>
    }
    
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

'use client'
import { redirect } from 'next/navigation'
import { getProjectById, getProjects } from '@/lib/queries/projects.queries'
import { getTasks } from '@/lib/queries/tasks.queries'
import { getTeamMembers } from '@/lib/queries/teams.queries'
import { getProjectLanes } from '@/lib/queries/lanes.queries'
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
            getTasks(teamId, projectId),
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

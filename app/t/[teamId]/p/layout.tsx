import { redirect } from 'next/navigation'
import { getTeamById } from '@/lib/db/actions/teams'
import { getProjects } from '@/lib/db/actions/projects'
import { getTasksByTeam } from '@/lib/db/actions/tasks'
import StoreWriterClient from '@/components/StoreWriterClient'
import type React from 'react'

interface TeamProjectsLayoutProps {
    params: Promise<{ teamId: string }>
    children: React.ReactNode
}

export default async function TeamProjectsLayout({
    params,
    children,
}: TeamProjectsLayoutProps) {
    
    const { teamId } = await params
    
    const team = await getTeamById(teamId)
    
    if (!team)
        redirect('/')
    
    const [projects, tasks] = await Promise.all([
        getProjects(teamId),
        getTasksByTeam(teamId),
    ])
    
    return (<>
        
        {children}
        <StoreWriterClient storeKey="projects" data={projects} />
        <StoreWriterClient storeKey="tasks" data={tasks} />
    
    </>)
}

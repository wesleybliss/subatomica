import { useParams, useNavigate } from 'react-router-dom'
import { getProjectById, getProjects } from '@/lib/queries/projects.queries'
import { getTasks } from '@/lib/queries/tasks.queries'
import { getTeamMembers } from '@/lib/queries/teams.queries'
import { getProjectLanes } from '@/lib/queries/lanes.queries'
import { ProjectDetailClient } from './ProjectDetailClient'
import StoreWriterClient from '@/components/StoreWriterClient'
import React, { useEffect, useState } from 'react'
import { Project, TaskLane, Task } from '@repo/shared/types'
import { TeamMemberProfile } from '@repo/shared'

interface ProjectDetailPageProps {
    params: Promise<{ teamId: string; projectId: string }>
}

export default function ProjectDetailPage() {
    
    const navigate = useNavigate()
    
    const params = useParams()
    
    const teamId = params.teamId as string
    const projectId = params.projectId as string
    
    const [project, setProject] = useState<Project | null>()
    
    useEffect(() => {
        
        getProjectById(projectId)
            .then(it => {
                if (!it || it.teamId !== teamId)
                    navigate(`/t/${teamId}/p`, { replace: true })
                
                setProject(it)
            })
        
    }, [projectId])
    
    if (!project || project.teamId !== teamId)
        return null
    
    const [tasks, setTasks] = useState<Task[]>()
    const [lanes, setLanes] = useState<TaskLane[]>()
    const [teamMembers, setTeamMembers] = useState<TeamMemberProfile[]>()
    const [projects, setProjects] = useState<Project[]>()
    
    useEffect(() => {
        
        const fetchDataTodo = async () => {
            try {
                // @todo clean up this garbage
                const [_tasks, _lanes, _teamMembers, _projects] = await Promise.all([
                    getTasks(teamId, projectId),
                    getProjectLanes(projectId),
                    getTeamMembers(teamId),
                    getProjects(teamId),
                ])
                setTasks(_tasks)
                setLanes(_lanes)
                setTeamMembers(_teamMembers)
                setProjects(_projects)
            } catch (e) {
                console.error('ProjectDetailPage', e)
                return <div className="p-6">Unable to load project</div>
            }
        }
        
    }, [])
    
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

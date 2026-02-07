import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getProjects } from '@/lib/queries/projects.queries'
import { getTasksByTeam } from '@/lib/queries/tasks.queries'
import StoreWriterClient from '@/components/StoreWriterClient'
import type React from 'react'
import { useSession } from '@/lib/auth-client'
import { Project, Task } from '@repo/shared/types'
import { Outlet } from 'react-router-dom'

interface TeamProjectsLayoutProps {
    children: React.ReactNode
}

export default function TeamProjectsLayout() {
    
    const session = useSession()
    const user = session.data?.user
    
    const [projects, setProjects] = useState<Project[]>([])
    const [tasks, setTasks] = useState<Task[]>([])
    
    const params = useParams()
    const navigate = useNavigate()
    const teamId: string | null = params.teamId as string
    
    useEffect(() => {
        
        if (!teamId) return
        
        getProjects(teamId)
            .then(it => setProjects(it))
            .catch(e => console.error(e))
        
        getTasksByTeam(teamId)
            .then(it => setTasks(it))
            .catch(e => console.error(e))
        
    }, [teamId])
    
    if (!teamId) navigate('/')
    
    return (<>
        
        <Outlet />
        
        <StoreWriterClient storeKey="projects" data={projects} />
        <StoreWriterClient storeKey="tasks" data={tasks} />
    
    </>)
}

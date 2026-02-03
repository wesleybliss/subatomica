// @ts-expect-error
import * as rwp from 'react-wire-persisted'
import { Project, Task, Team } from '@/types'

const { key, getPrefixedKeys } = rwp.utils

export const NS = 'subatomica'

key('primarySidebarWidth')

const prefixedKeys = getPrefixedKeys(NS)

export { prefixedKeys as keys }

//

export const mockTeams: Team[] = [
    {
        id: 'personal',
        userId: 'user-1',
        name: 'Personal',
    },
]

export const mockProjects: Project[] = [
    {
        id: 'project-1',
        userId: 'user-1',
        teamId: 'personal',
        name: 'Project 1',
    },
]

export const mockTasks: Task[] = [
    {
        id: 'task-1',
        title: 'Task 1',
        userId: 'user-1',
        projectId: 'project-1',
    },
]

export const getDefaultTeamId = () => mockTeams[0]?.id ?? 'personal'

export const getTeamById = (id: string) => mockTeams.find(team => team.id === id)

export const getProjectsByTeamId = (teamId: string) => mockProjects.filter(project => project.teamId === teamId)

export const getProjectById = (projectId: string) => mockProjects.find(project => project.id === projectId)

export const getTasksByProjectId = (projectId: string) => mockTasks.filter(task => task.projectId === projectId)

export const getTaskById = (taskId: string) => mockTasks.find(task => task.id === taskId)

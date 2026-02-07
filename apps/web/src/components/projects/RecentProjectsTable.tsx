import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { getUnixTime } from 'date-fns'
import { Project, Task } from '@repo/shared/types'
import { Table, TableBody, TableRow, TableCell } from '@/components/ui/table'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Progress } from '@/components/ui/progress'
import { MoreHorizontalIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { calculateProjectProgress } from '@/lib/utils'

interface RecentProjectsTableProps {
    className?: string
    teamId: string
    projects: Project[]
    tasks: Task[]
}

type ProjectWithTaskCount = Project & {
    taskCount: number
    progress: number
}

const RecentProjectsTable = ({
    className,
    teamId,
    projects,
    tasks,
}: RecentProjectsTableProps) => {
    
    const recentProjectsWithTaskCount = useMemo<ProjectWithTaskCount[]>(() => (
        projects
            ?.sort((a, b) => getUnixTime(a.updatedAt) - getUnixTime(b.updatedAt))
            ?.slice(0, 4)
            ?.map(project => {
                
                const projectTasks = tasks.filter(task => task.projectId === project.id)
                
                return {
                    ...project,
                    taskCount: projectTasks.length,
                    progress: calculateProjectProgress(projectTasks),
                }
                
            }) || []
    ), [projects, tasks])
    
    if (recentProjectsWithTaskCount.length === 0) return (
        <p>No recent projects.</p>
    )
    
    return (
        
        <div className={className}>
            
            <Table>
                <TableBody>
                    {recentProjectsWithTaskCount.map(it => (
                        
                        <TableRow key={`recent-project-${it.id}`}>
                            
                            <TableCell className="text-base">
                                <Link href={`/t/${teamId}/p/${it.id}`}>
                                    {it.name}
                                </Link>
                            </TableCell>
                            
                            <TableCell className="text-base">
                                <Progress value={it.progress} className="w-full min-w-20" />
                            </TableCell>
                            
                            <TableCell>
                                <code>{it.taskCount} tasks</code>
                            </TableCell>
                            
                            <TableCell className="text-base text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger render={
                                        <Button variant="ghost" size="icon" className="size-8">
                                            <MoreHorizontalIcon />
                                            <span className="sr-only">Open menu</span>
                                        </Button>
                                    } />
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem>Edit</DropdownMenuItem>
                                        <DropdownMenuItem>Duplicate</DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem variant="destructive">
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        
                        </TableRow>
                        
                    ))}
                </TableBody>
            </Table>
        
        </div>
        
    )
    
}

export default RecentProjectsTable

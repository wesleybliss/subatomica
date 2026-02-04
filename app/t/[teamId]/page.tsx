'use client'

import { useState } from 'react'
import { Search, Filter, ChevronDown, Settings, Users, FolderKanban } from 'lucide-react'
import { KanbanBoard, KanbanTask } from '@/components/kanban/KanbanBoard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// Mock data - replace with real data fetching
const mockTasks: KanbanTask[] = [
    {
        id: 'PRO123',
        projectId: 'PRO123',
        title: 'Implement attribute flow',
        assignee: { name: 'Peppi Snoozq' },
        date: 'Feb 7',
        status: 'backlog',
    },
    {
        id: 'PRO-123-2',
        projectId: 'PRO- 123',
        title: 'Implement unit testing flow',
        assignee: { name: 'Prods Sloonty' },
        date: 'Feb 7',
        status: 'todo',
    },
    {
        id: 'PRO-123-3',
        projectId: 'PRO- 123',
        title: 'Design new dashboard pages',
        assignee: { name: 'Pacte6 Redland' },
        date: 'Feb 5',
        status: 'todo',
    },
    {
        id: 'PRO113',
        projectId: 'PRO 113',
        title: 'Design new dashboard pages',
        assignee: { name: 'Pinple Bilen by' },
        date: 'Jeorme)',
        status: 'in-progress',
        flagged: true,
    },
    {
        id: 'PRO123-4',
        projectId: 'PRO123',
        title: 'Design new dashboard pages',
        assignee: { name: 'Sophia Cortez' },
        date: 'Feb 7',
        status: 'in-progress',
    },
    {
        id: 'PRO-07',
        projectId: 'PRO- 07',
        title: '[In tranmical section witoin ]',
        assignee: { name: 'Pride y' },
        date: 'Feb 7',
        status: 'done',
        flagged: true,
    },
]

export default function TeamDetailPage() {
    const [view, setView] = useState<'kanban' | 'list'>('kanban')
    const [searchQuery, setSearchQuery] = useState('')

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Top Bar */}
            <div className="border-b border-border bg-background">
                <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-4">
                        <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <button type="button" className="hover:text-foreground transition-colors">
                                Projects
                            </button>
                            <button type="button" className="hover:text-foreground transition-colors">
                                Repository
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="pl-9 pr-4 w-[300px] bg-muted border-border"
                            />
                        </div>
                        <Button variant="outline" size="icon">
                            <Settings className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* View Tabs */}
                <div className="flex items-center justify-between px-6 pb-3">
                    <div className="flex items-center gap-4">
                        <h2 className="text-sm font-medium text-foreground">My Issues</h2>
                        <Button variant="outline" size="sm">
                            <Filter className="w-3 h-3 mr-2" />
                            Filter
                        </Button>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant={view === 'kanban' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setView('kanban')}
                        >
                            <FolderKanban className="w-4 h-4 mr-2" />
                            Kanban
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1">
                            <span>6K</span>
                            <ChevronDown className="w-3 h-3" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 overflow-auto px-6 py-6">
                <KanbanBoard
                    tasks={mockTasks.filter(task =>
                        task.title.toLowerCase().includes(searchQuery.toLowerCase())
                    )}
                    onTaskClick={task => console.log('[v0] Task clicked:', task)}
                    onTaskToggle={(taskId, checked) =>
                        console.log('[v0] Task toggle:', taskId, checked)
                    }
                />
            </div>
        </div>
    )
}

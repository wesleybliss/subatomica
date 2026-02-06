'use client'
import type { TaskLane } from '@/types'
import { Button } from '@/components/ui/button'
import { Trash2, Tag } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import ListViewSearchInput from '@/components/list/ListViewSearchInput'

interface ListViewToolbarProps {
    lanes: TaskLane[]
    query: string
    setQuery: (value: string) => void
    selectedTasks: Set<string>
    hasSelection: boolean
    handleChangeStatus: (laneKey: string) => void
    handleDeleteSelected: () => void
}

const ListViewToolbar = ({
    lanes,
    query,
    setQuery,
    selectedTasks,
    hasSelection,
    handleChangeStatus,
    handleDeleteSelected,
}: ListViewToolbarProps) => {
    
    return (
        
        <div className="flex items-center justify-between gap-8 px-6 py-3 bg-muted/20 border-b border-border">
            
            <span className={cn('text-sm font-medium text-foreground', {
                'hidden': !hasSelection,
            })}>
                {selectedTasks.size} selected
            </span>
            
            <div className="flex-1 max-w-[50%] mx-auto">
                <ListViewSearchInput query={query} setQuery={setQuery} />
            </div>
            
            <div className={cn('flex items-center gap-2', {
                'hidden': !hasSelection,
            })}>
                
                <DropdownMenu>
                    
                    <DropdownMenuTrigger render={
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2">
                            <Tag className="w-4 h-4" />
                            Change Status
                        </Button>
                    } />
                    
                    <DropdownMenuContent align="end">
                        {lanes.map(lane => (
                            <DropdownMenuItem
                                key={lane.id}
                                onClick={() => handleChangeStatus(lane.key)}>
                                {lane.name}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                
                </DropdownMenu>
                
                <Button
                    variant="destructive"
                    size="sm"
                    className="gap-2"
                    onClick={handleDeleteSelected}>
                    <Trash2 className="w-4 h-4" />
                    Delete
                </Button>
            
            </div>
        
        </div>
        
    )
    
}

export default ListViewToolbar

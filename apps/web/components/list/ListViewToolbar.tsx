'use client'
import type { TaskLane } from '@repo/shared/types'
import { Button } from '@/components/ui/button'
import { Trash2, Tag } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface ListViewToolbarProps {
    lanes: TaskLane[]
    selectedTasks: Set<string>
    hasSelection: boolean
    handleChangeStatus: (laneKey: string) => void
    handleDeleteSelected: () => void
}

const ListViewToolbar = ({
    lanes,
    selectedTasks,
    hasSelection,
    handleChangeStatus,
    handleDeleteSelected,
}: ListViewToolbarProps) => {
    
    return (
        
        <div className={cn(
            'flex items-center justify-between',
            'gap-8 px-6 py-3 bg-muted/20 border-b border-border', {
                'hidden': !hasSelection,
            })}>
            
            <span className="text-sm font-medium text-foreground">
                {selectedTasks.size} selected
            </span>
            
            <div className="flex items-center gap-2">
                
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

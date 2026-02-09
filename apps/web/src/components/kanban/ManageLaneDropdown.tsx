import { memo } from 'react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { TaskLane } from '@repo/shared/types'

interface ManageLaneDropdownProps {
    lane: TaskLane
    canDeleteLane: boolean
    deletingLaneId: string | null
    handleStartRenameLane: (lane: TaskLane) => void
    handleDeleteLane: (laneId: string) => Promise<void>
}

const ManageLaneDropdown = ({
    lane,
    canDeleteLane,
    deletingLaneId,
    handleStartRenameLane,
    handleDeleteLane,
}: ManageLaneDropdownProps) => {
    const onRenameLane = () => {
        handleStartRenameLane(lane)
    }
    
    const onDeleteLane = () => {
        void handleDeleteLane(lane.id)
    }
    
    return (
        
        <DropdownMenu>
            
            <DropdownMenuTrigger
                render={(
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0" />
                )}>
                <MoreHorizontal className="h-3.5 w-3.5" />
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onRenameLane}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Rename
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={onDeleteLane}
                    disabled={!canDeleteLane || deletingLaneId === lane.id}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        
        </DropdownMenu>
        
    )
    
}

export default memo(ManageLaneDropdown)

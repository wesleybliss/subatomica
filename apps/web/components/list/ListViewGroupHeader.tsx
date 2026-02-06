'use client'
import useListViewGroupViewModel from '@/components/list/ListViewGroupViewModel'
import { Task, TaskLane } from '@repo/shared/types'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ListViewGroupHeaderParams {
    vm: ReturnType<typeof useListViewGroupViewModel>
    lane: TaskLane
    tasks: Task[]
    selectedTasks: Set<string>
    onToggleTask: (taskId: string) => void
    onSelectAll: (taskIds: string[]) => void
    onDeselectAll: (taskIds: string[]) => void
}

const ListViewGroupHeader = ({
    vm,
    lane,
    tasks,
    onSelectAll,
    onDeselectAll,
}: ListViewGroupHeaderParams) => {
    
    return (
        
        <div className={cn(
            'bg-muted/30 px-4 py-3 flex items-center gap-3',
            'sticky top-0 z-10',
        )}>
            <button
                onClick={() => vm.setIsExpanded(prev => !prev)}
                className={cn(
                    'flex items-center justify-center w-5 h-5',
                    'text-muted-foreground hover:text-foreground',
                    'transition-colors',
                )}>
                <ChevronDown
                    className={cn(
                        'w-4 h-4 transition-transform',
                        !vm.isExpanded && '-rotate-90',
                    )}/>
            </button>
            
            {/* Lane Badge */}
            <div className="flex items-center gap-2 flex-1">
                {vm.laneColor && (
                    <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: vm.laneColor }}/>
                )}
                <h3 className="font-semibold text-sm text-foreground">
                    {lane.name}
                </h3>
            </div>
            
            {/* Count */}
            <span className={cn(
                'text-xs text-muted-foreground bg-background',
                'px-2 py-1 rounded',
            )}>
                {tasks.length}
            </span>
            
            {/* Select All for Group */}
            {tasks.length > 0 && vm.isExpanded && (
                <input
                    type="checkbox"
                    checked={vm.allSelected}
                    ref={el => {
                        if (el) {
                            (el as HTMLInputElement & {
                                indeterminate: boolean
                            }).indeterminate = (
                                vm.someSelected && !vm.allSelected
                            )
                        }
                    }}
                    onChange={e => {
                        if (e.currentTarget.checked)
                            onSelectAll(tasks.map(t => t.id))
                        else
                            onDeselectAll(tasks.map(t => t.id))
                    }}
                    className="w-4 h-4 rounded border-border cursor-pointer"/>
            )}
        
        </div>
        
    )
    
}

export default ListViewGroupHeader

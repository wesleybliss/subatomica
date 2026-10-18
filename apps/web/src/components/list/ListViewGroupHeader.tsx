import { KnownLaneType, Task, TaskLane } from '@repo/shared/types'
import Color from 'color'
import { ChevronDown, Circle } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import useListViewGroupViewModel from '@/components/list/ListViewGroupViewModel'
import {
    ColorPicker,
    ColorPickerAlpha,
    ColorPickerEyeDropper,
    ColorPickerFormat,
    ColorPickerHue,
    ColorPickerOutput,
    ColorPickerSelection,
} from '@/components/ui/color-picker'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { KNOWN_LANE_ICONS } from '@/lib/constants/icons.constants'
import {
    DEFAULT_LANE_ICON_COLOR,
    LANE_QUICK_COLORS,
    laneColorToHex,
} from '@/lib/constants/lane-colors.constants'
import { cn } from '@/lib/utils'

interface ListViewGroupHeaderParams {
    vm: ReturnType<typeof useListViewGroupViewModel>
    lane: TaskLane
    tasks: Task[]
    selectedTasks: Set<string>
    onToggleTask: (taskId: string) => void
    onSelectAll: (taskIds: string[]) => void
    onDeselectAll: (taskIds: string[]) => void
    onLaneColorChange?: (laneId: string, hex: string) => void
}

const ListViewGroupHeader = ({
    vm,
    lane,
    tasks,
    onSelectAll,
    onDeselectAll,
    onLaneColorChange,
}: ListViewGroupHeaderParams) => {
    
    if (!KNOWN_LANE_ICONS[lane.name as KnownLaneType])
        console.warn('No icon for', lane.name)
    
    const LaneIcon = KNOWN_LANE_ICONS[lane.name as KnownLaneType] || Circle
    const pickerColor = laneColorToHex(lane.color, DEFAULT_LANE_ICON_COLOR)
    const [draftColor, setDraftColor] = useState(pickerColor)
    const [pickerOpen, setPickerOpen] = useState(false)

    useEffect(() => {
        setDraftColor(pickerColor)
    }, [pickerColor])

    const commitLaneColor = (hex: string) => {
        onLaneColorChange?.(lane.id, hex)
    }

    const handlePickerChange = useCallback((rgba: Parameters<typeof Color.rgb>[0]) => {
        const channels = Color.rgb(rgba).rgb().array()
        setDraftColor(Color.rgb(channels[0], channels[1], channels[2]).hex())
    }, [])

    const handlePickerOpenChange = (open: boolean) => {
        if (open) {
            setDraftColor(pickerColor)
        } else if (draftColor.toLowerCase() !== pickerColor.toLowerCase()) {
            commitLaneColor(draftColor)
        }
        setPickerOpen(open)
    }
    
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
                {onLaneColorChange ? (
                    <Popover open={pickerOpen} onOpenChange={handlePickerOpenChange}>
                        <PopoverTrigger
                            type="button"
                            aria-label={`Change color for ${lane.name}`}
                            className={cn(
                                'inline-flex cursor-pointer border-0 bg-transparent p-0',
                                'shadow-none hover:bg-transparent focus-visible:ring-0',
                            )}
                            onClick={e => e.stopPropagation()}>
                            <LaneIcon
                                className="text-slate-400"
                                style={{ color: vm.laneColor || undefined }}
                                size={18}/>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="w-72 gap-3 p-3">
                            <div
                                className="grid grid-cols-5 gap-1.5"
                                role="listbox"
                                aria-label="Quick lane colors">
                                {LANE_QUICK_COLORS.map(color => {
                                    const active = color.toLowerCase() === draftColor.toLowerCase()
                                    return (
                                        <button
                                            key={color}
                                            type="button"
                                            role="option"
                                            aria-selected={active}
                                            aria-label={`Use ${color}`}
                                            onClick={() => {
                                                setDraftColor(color)
                                                commitLaneColor(color)
                                            }}
                                            className={cn(
                                                'size-6 rounded-sm border transition-transform hover:scale-105',
                                                active
                                                    ? 'border-foreground ring-1 ring-foreground'
                                                    : 'border-border',
                                            )}
                                            style={{ backgroundColor: color }}/>
                                    )
                                })}
                            </div>
                            <ColorPicker
                                key={`${lane.id}-${pickerOpen}`}
                                defaultValue={draftColor}
                                className="h-auto w-full"
                                onChange={handlePickerChange}>
                                <ColorPickerSelection className="h-40 rounded-lg"/>
                                <ColorPickerHue/>
                                <ColorPickerAlpha/>
                                <div className="flex items-center gap-2">
                                    <ColorPickerEyeDropper/>
                                    <ColorPickerOutput/>
                                    <ColorPickerFormat/>
                                </div>
                            </ColorPicker>
                        </PopoverContent>
                    </Popover>
                ) : (
                    <LaneIcon
                        className="text-slate-400"
                        style={{ color: vm.laneColor || undefined }}
                        size={18}/>
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

import { KnownLaneType, TaskLane } from '@repo/shared/types'
import { Circle } from 'lucide-react'
import type { MouseEvent } from 'react'

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
import { useLaneColorPicker } from '@/hooks/useLaneColorPicker'
import { KNOWN_LANE_ICONS } from '@/lib/constants/icons.constants'
import {
    LANE_QUICK_COLORS,
    resolveLaneIconColor,
} from '@/lib/constants/lane-colors.constants'
import { cn } from '@/lib/utils'

interface LaneIconColorPickerProps {
    lane: TaskLane
    onColorChange?: (hex: string) => void
    iconSize?: number
    iconClassName?: string
    popoverAlign?: 'start' | 'center' | 'end'
    onTriggerClick?: (event: MouseEvent<HTMLButtonElement>) => void
}

const LaneIconColorPicker = ({
    lane,
    onColorChange,
    iconSize = 18,
    iconClassName,
    popoverAlign = 'start',
    onTriggerClick,
}: LaneIconColorPickerProps) => {
    
    if (!KNOWN_LANE_ICONS[lane.name as KnownLaneType])
        console.warn('No icon for', lane.name)
    
    const LaneIcon = KNOWN_LANE_ICONS[lane.name as KnownLaneType] || Circle
    const iconColor = resolveLaneIconColor(lane.color)
    
    const {
        draftColor,
        pickerOpen,
        handlePickerChange,
        handlePickerOpenChange,
        pickQuickColor,
    } = useLaneColorPicker(lane.color, onColorChange)
    
    const icon = (
        <LaneIcon
            className={cn('text-slate-400', iconClassName)}
            style={{ color: iconColor }}
            size={iconSize}/>
    )
    
    if (!onColorChange)
        return icon
    
    return (
        <Popover open={pickerOpen} onOpenChange={handlePickerOpenChange}>
            <PopoverTrigger
                type="button"
                aria-label={`Change color for ${lane.name}`}
                className={cn(
                    'inline-flex cursor-pointer border-0 bg-transparent p-0',
                    'shadow-none hover:bg-transparent focus-visible:ring-0',
                )}
                onClick={onTriggerClick}>
                {icon}
            </PopoverTrigger>
            <PopoverContent align={popoverAlign} className="w-72 gap-3 p-3">
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
                                onClick={() => pickQuickColor(color)}
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
    )
    
}

export default LaneIconColorPicker

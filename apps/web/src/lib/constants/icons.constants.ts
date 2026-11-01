import { KnownLaneType } from '@repo/shared/types'
import {
    Circle,
    CircleCheck,
    CircleDashed,
    CircleDotDashed,
    CircleEllipsis,
    LucideIcon,
} from 'lucide-react'

export const KNOWN_LANE_ICONS: Record<KnownLaneType, LucideIcon>  = {
    Backlog: CircleDashed,
    'To Do': CircleDotDashed,
    'In Progress': CircleEllipsis,
    'Done': CircleCheck,
}

export const getLaneIcon = (laneName: string): LucideIcon =>
    KNOWN_LANE_ICONS[laneName as KnownLaneType] || Circle

export const KEYBOARD_SYMBOLS = {
    Control: '⌃', // U+2303
    Command: '⌘', // U+2318
    Shift: '⇧', // U+21E7
    OptionAlt: '⌥', // U+2325
    CapsLock: '⇪', // U+21EA
    ReturnEnter: '↩', // U+21B5
} as const

import { KnownLaneType } from '@repo/shared/types'
import { CircleCheck, CircleDashed, CircleDotDashed, CircleEllipsis, LucideIcon } from 'lucide-react'

export const KNOWN_LANE_ICONS: Record<KnownLaneType, LucideIcon>  = {
    Backlog: CircleDashed,
    'To Do': CircleDotDashed,
    'In Progress': CircleEllipsis,
    'Done': CircleCheck,
}

import { colord } from 'colord'

/** Quick-pick lane colors (hex with #). */
export const LANE_QUICK_COLORS = [
    '#64748b',
    '#ef4444',
    '#f97316',
    '#eab308',
    '#22c55e',
    '#06b6d4',
    '#3b82f6',
    '#8b5cf6',
    '#ec4899',
] as const

export const DEFAULT_LANE_ICON_COLOR = '#94a3b8'

export const resolveLaneIconColor = (
    color: string | null | undefined,
): string | undefined => {
    if (!color)
        return undefined
    const candidate = color.startsWith('#') ? color : `#${color}`
    if (colord(candidate).isValid())
        return colord(candidate).toHex()
    return undefined
}

export const laneColorToHex = (
    color: string | null | undefined,
    fallback = DEFAULT_LANE_ICON_COLOR,
): string => resolveLaneIconColor(color) ?? fallback

export const hexToLaneColor = (hex: string) => hex.replace(/^#/, '')

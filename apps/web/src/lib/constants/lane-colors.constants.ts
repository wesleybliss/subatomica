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

/** Hex in DB is stored with `#`. Tailwind / other tokens are stored as-is (no `#`). */
export const isLaneHexColor = (color: string | null | undefined): boolean => {
    if (!color)
        return false
    if (color.startsWith('#'))
        return colord(color).isValid()
    // Legacy rows saved without `#` before we fixed persistence
    if (/^[0-9a-fA-F]{6}$/.test(color))
        return colord(`#${color}`).isValid()
    return false
}

export const resolveLaneIconColor = (
    color: string | null | undefined,
): string | undefined => {
    if (!isLaneHexColor(color))
        return undefined
    const candidate = color!.startsWith('#') ? color! : `#${color}`
    return colord(candidate).toHex()
}

export const laneColorToHex = (
    color: string | null | undefined,
    fallback = DEFAULT_LANE_ICON_COLOR,
): string => resolveLaneIconColor(color) ?? fallback

/** Normalize picker output for DB: always `#rrggbb`. */
export const normalizeLaneHexForStorage = (hex: string): string => colord(hex).toHex()

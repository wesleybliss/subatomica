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

// Default lane background: #3ecfc2
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

export const blendHex = (fgHex: string, bgHex: string, alpha: number): string => {
    const parse = (hex: string) => {
        const h = hex.replace('#', '')
        return [
            parseInt(h.slice(0, 2), 16),
            parseInt(h.slice(2, 4), 16),
            parseInt(h.slice(4, 6), 16),
        ]
    }
    
    const fg = parse(fgHex)
    const bg = parse(bgHex)
    
    const out = fg.map((c, i) => Math.round(c * alpha + bg[i] * (1 - alpha)))
    
    return '#' + out.map(c => c.toString(16).padStart(2, '0')).join('')
}

// 0.05
export const lightenHex = (hex: string, targetPercent: number) => {
    return blendHex(hex, '#ffffff', targetPercent)
}
console.log('lightenHex', lightenHex('#272b3a', 0.05))

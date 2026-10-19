import { CSSProperties } from 'react'

import { isLaneHexColor, resolveLaneIconColor } from '@/lib/constants/lane-colors.constants'

const useLaneColor = (laneColor: string) => {
    
    const hexBackground = resolveLaneIconColor(laneColor)
    const tailwindBackground = laneColor && !isLaneHexColor(laneColor)
        ? laneColor
        : undefined
    
    const ringColor = hexBackground
        ? `color-mix(in srgb, ${hexBackground}, transparent 80%)`
        : undefined
    
    const backgroundColor = hexBackground
        ? `color-mix(in srgb, ${hexBackground}, transparent 95%)`
        : undefined
    
    const laneStyles = {} as CSSProperties
    
    if (ringColor)
        laneStyles['--tw-ring-color'] = ringColor
    
    if (backgroundColor)
        laneStyles.backgroundColor = backgroundColor
    
    return {
        hexBackground,
        tailwindBackground,
        ringColor,
        backgroundColor,
        styles: laneStyles,
    }
    
}

export default useLaneColor

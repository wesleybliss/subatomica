import Color from 'color'
import { useCallback, useEffect, useRef, useState } from 'react'

import {
    DEFAULT_LANE_ICON_COLOR,
    laneColorToHex,
} from '@/lib/constants/lane-colors.constants'

export const useLaneColorPicker = (
    storedColor: string | null | undefined,
    onCommit?: (hex: string) => void,
) => {
    
    const pickerColor = laneColorToHex(storedColor, DEFAULT_LANE_ICON_COLOR)
    const [draftColor, setDraftColor] = useState(pickerColor)
    const [pickerOpen, setPickerOpen] = useState(false)
    const [prevPickerColor, setPrevPickerColor] = useState(pickerColor)
    const draftColorRef = useRef(draftColor)
    
    useEffect(() => {
        draftColorRef.current = draftColor
    }, [draftColor])
    
    if (pickerColor !== prevPickerColor) {
        setPrevPickerColor(pickerColor)
        setDraftColor(pickerColor)
    }
    
    const commitColor = useCallback((hex: string) => {
        onCommit?.(hex)
    }, [onCommit])
    
    const handlePickerChange = useCallback((rgba: Parameters<typeof Color.rgb>[0]) => {
        const channels = Color.rgb(rgba).rgb().array()
        setDraftColor(Color.rgb(channels[0], channels[1], channels[2]).hex())
    }, [])
    
    const handlePickerOpenChange = useCallback((open: boolean) => {
        if (open) {
            setDraftColor(pickerColor)
        } else if (
            draftColorRef.current.toLowerCase() !== pickerColor.toLowerCase()
        ) {
            commitColor(draftColorRef.current)
        }
        setPickerOpen(open)
    }, [commitColor, pickerColor])
    
    const pickQuickColor = useCallback((hex: string) => {
        setDraftColor(hex)
        commitColor(hex)
    }, [commitColor])
    
    return {
        pickerColor,
        draftColor,
        pickerOpen,
        handlePickerChange,
        handlePickerOpenChange,
        pickQuickColor,
    }
    
}

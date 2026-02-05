import { useWireState } from '@forminator/react-wire'
import * as store from '@/store'
import { useTheme } from 'next-themes'
import { useMemo } from 'react'
import { DebugToolsMode } from '@/types'

const DebugToolsViewModel = () => {
    
    const { theme, resolvedTheme } = useTheme()
    
    const [debugToolsMode, setDebugToolsMode] = useWireState(store.debugToolsMode, DebugToolsMode.minified)
    
    const activeTheme = useMemo(() => {
        if (theme === 'system') return resolvedTheme ?? 'light'
        return theme ?? 'light'
    }, [theme, resolvedTheme])
    
    return {
        
        // State
        debugToolsMode,
        setDebugToolsMode,
        
        // Hooks
        activeTheme,
        
    }
    
}

export default DebugToolsViewModel

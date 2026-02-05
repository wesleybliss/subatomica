import { useWireState } from '@forminator/react-wire'
import * as store from '@/store'
import { useTheme } from 'next-themes'
import { useMemo } from 'react'

const DebugToolsViewModel = () => {
    
    const { theme, resolvedTheme } = useTheme()
    
    const [debugToolsMode, setDebugToolsMode] = useWireState(store.debugToolsMode)
    
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

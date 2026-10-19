import { useTheme } from '@/components/ThemeProvider'
import { useDebugStore } from '@/store'

const DebugToolsViewModel = () => {
    
    const { theme } = useTheme()
    
    const debugToolsMode = useDebugStore(s => s.debugToolsMode)
    const setDebugToolsMode = useDebugStore(s => s.setDebugToolsMode)
    
    const activeTheme = theme
    
    return {
        
        // State
        debugToolsMode,
        setDebugToolsMode,
        
        // Hooks
        activeTheme,
        
    }
    
}

export default DebugToolsViewModel

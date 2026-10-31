import { useTheme } from '@/components/useTheme'
import { useDebugStore } from '@/store'

const DebugToolsViewModel = () => {
    
    const { theme } = useTheme()
    
    const debugToolsMode = useDebugStore(s => s.debugToolsMode)
    const setDebugToolsMode = useDebugStore(s => s.setDebugToolsMode)
    const debugPanelSection = useDebugStore(s => s.debugPanelSection)
    const setDebugPanelSection = useDebugStore(s => s.setDebugPanelSection)
    
    const activeTheme = theme
    
    return {
        
        // State
        debugToolsMode,
        setDebugToolsMode,
        debugPanelSection,
        setDebugPanelSection,
        
        // Hooks
        activeTheme,
        
    }
    
}

export default DebugToolsViewModel

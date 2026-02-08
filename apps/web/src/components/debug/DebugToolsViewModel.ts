import { useWireState } from '@forminator/react-wire'
import * as store from '@/store'
import { useTheme } from '@/components/ThemeProvider'
import { DebugToolsMode } from '@repo/shared/types'

const DebugToolsViewModel = () => {
    
    const { theme } = useTheme()
    
    const [debugToolsMode, setDebugToolsMode] = useWireState(store.debugToolsMode, DebugToolsMode.minified)
    
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

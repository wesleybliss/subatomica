import { useWireState } from '@forminator/react-wire'
import * as store from '@/store'

const DebugToolsViewModel = () => {
    const [debugToolsMode, setDebugToolsMode] = useWireState(store.debugToolsMode)
    
    return {
        // State
        debugToolsMode,
        setDebugToolsMode,
    }
}

export default DebugToolsViewModel

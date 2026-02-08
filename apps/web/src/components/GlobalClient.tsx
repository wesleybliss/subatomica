import useGlobalHotkeys from '@/hooks/useGlobalHotkeys'
import useMonitorNavigation from '@/hooks/useMonitorNavigation'

/**
 * Global client component for various hooks that load after SSR.
 * @constructor
 */
const GlobalClient = () => {
    
    useGlobalHotkeys()
    useMonitorNavigation()
    
    return null
    
}

export default GlobalClient

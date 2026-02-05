import { useWire } from '@forminator/react-wire'
import * as store from '@/store'
import { useHotkeys } from 'react-hotkeys-hook'

const useHotkey = (key: string, callback: (e: KeyboardEvent) => void) => {
    
    useHotkeys(key, (e: KeyboardEvent) => {
        
        e.preventDefault()
        
        callback(e)
        
        
    })
    
}

const useGlobalHotkeys = () => {
    
    const globalCommandOpen = useWire(store.globalCommandOpen)
    
    useHotkey('ctrl+p', () => {
        
        globalCommandOpen.setValue(!globalCommandOpen.getValue())
        
    })
    
}

export default useGlobalHotkeys

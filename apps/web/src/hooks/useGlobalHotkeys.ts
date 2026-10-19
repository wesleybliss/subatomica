import { useDialogStore } from '@/store'
import logger from '@repo/shared/utils/logger'
import { useHotkeys } from 'react-hotkeys-hook'

const log = logger('hooks/useGlobalHotkeys')

interface HotkeyOptions {
    useKey?: boolean            // Matches event.key === '/' regardless of shift/code
    enableOnFormTags?: boolean // Allows trigger in inputs/textareas
    preventDefault?: boolean   // Blocks browser defaults like search
}

const useHotkey = (
    key: string,
    callback: (e: KeyboardEvent) => void,
    options: HotkeyOptions | undefined = {},
) => {
    
    useHotkeys(key, (e: KeyboardEvent) => {
        
        e.preventDefault()
        
        callback(e)
        
        
    }, options || {})
    
}

const useGlobalHotkeys = () => {
    
    const globalCommandOpen = useDialogStore(s => s.globalCommandOpen)
    const setGlobalCommandOpen = useDialogStore(s => s.setGlobalCommandOpen)
    
    useHotkey('ctrl+projects', () => {
        setGlobalCommandOpen(!globalCommandOpen)
    })
    
    useHotkey('ctrl+/', () => {
        log.d('ctrl/')
        try {
            // @ts-expect-error expected
            // oxlint-disable-next-line no-restricted-globals
            document
                .getElementById('list-view-search-input')
                .focus()
        } catch (e) {
            log.e('Failed to focus search input', e)
        }
        
    }, {
        useKey: true,
        enableOnFormTags: true,
    })
    
}

export default useGlobalHotkeys

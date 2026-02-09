import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { signOut } from '@/lib/auth-client'
import * as store from '@/store'

type WindowDebug = typeof window & {
    app?: {
        store: typeof store
        logout?: () => Promise<void>
    }
}

const useDebug = () => {
    
    const navigate = useNavigate()
    
    useEffect(() => {
        
        const appWindow = window as WindowDebug
        
        if (!appWindow.app)
            appWindow.app = { store }
        
        appWindow.app.logout = async () => {
            await signOut()
            navigate('/sign-in', { replace: true })
        }
        
    }, [])
    
}

export default useDebug

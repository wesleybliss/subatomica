'use client'
import { useEffect } from 'react'
import * as store from '@/store'
import { signOut } from '@/lib/auth-client'
import { redirect } from 'next/navigation'

type WindowDebug = typeof window & {
    app?: {
        store: typeof store
        logout?: () => Promise<void>
    }
}

const useDebug = () => {
    
    useEffect(() => {
        
        const appWindow = window as WindowDebug
        
        if (!appWindow.app)
            appWindow.app = { store }
        
        appWindow.app.logout = async () => {
            await signOut()
            redirect('/sign-in')
        }
        
    }, [])
    
}

export default useDebug

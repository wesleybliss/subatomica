'use client'
import { useEffect } from 'react'
import { signOut } from '@/lib/auth-client'
import { redirect } from 'next/navigation'

const useDebug = () => {
    
    useEffect(() => {
        
        const appWindow = window as typeof window & {
            app?: {
                logout?: () => Promise<void>
            }
        }
        
        if (!appWindow.app)
            appWindow.app = {}
        
        appWindow.app.logout = async () => {
            await signOut()
            redirect('/sign-in')
        }
        
    }, [])
    
}

export default useDebug

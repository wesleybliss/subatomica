'use client'

import { Button } from '@/components/ui/button'
import { signOut } from '@/lib/auth-client'

type SettingsAccountHeaderProps = {
    name: string
    email: string
    avatarUrl: string
}

const SettingsAccountHeader = ({ name, email, avatarUrl }: SettingsAccountHeaderProps) => {
    const onSignOutClick = () => {
        signOut()
        window.location.replace('/')
    }
    
    return (
        <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
                <img src={avatarUrl} alt={name} className="h-14 w-14 rounded-full border border-neutral-200" />
                <div>
                    <p className="text-lg font-semibold text-neutral-900">{name}</p>
                    <p className="text-sm text-neutral-500">{email || 'No email on file'}</p>
                    <p className="text-xs text-neutral-400 mt-1">Account owner</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <Button variant="ghost" className="border border-neutral-200">
                    Manage profile
                </Button>
                <Button variant="destructive" onClick={onSignOutClick}>
                    Logout
                </Button>
            </div>
        </div>
    )
}

export default SettingsAccountHeader

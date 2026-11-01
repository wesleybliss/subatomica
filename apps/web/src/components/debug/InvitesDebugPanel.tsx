import { Loader2 } from 'lucide-react'

import { useGetInviteCodeQuery } from '@/lib/queries/users.queries'

const InvitesDebugPanel = () => {
    const { error, isError, isLoading, data: inviteCode } = useGetInviteCodeQuery()
    
    return (
        <div className="flex h-full min-h-0 flex-col">
            <div className="flex items-center justify-between gap-2 border-b border-slate-200 px-3 py-2">
                <div>
                    <p className="text-xs font-medium text-slate-800">Invite Code</p>
                </div>
            </div>
            
            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-2">
                <p className="text-[10px] text-slate-500">
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {!isLoading && <code>{isError ? error?.message : inviteCode}</code>}
                </p>
            </div>
        </div>
    )
}

export default InvitesDebugPanel

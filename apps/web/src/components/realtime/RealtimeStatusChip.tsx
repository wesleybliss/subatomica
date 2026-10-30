import { Radio, RadioOff } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAblyUiStore } from '@/store'

export const RealtimeStatusChip = () => {
    const ablyEnabled = useAblyUiStore(s => s.ablyEnabled)
    const setAblyEnabled = useAblyUiStore(s => s.setAblyEnabled)
    
    const Icon = ablyEnabled ? Radio : RadioOff
    
    return (
        <Button
            type="button"
            variant="ghost"
            size="xs"
            title={ablyEnabled
                ? 'Realtime on — click to disconnect'
                : 'Realtime off — click to connect (uses free-tier quota)'}
            aria-checked={ablyEnabled}
            onClick={() => setAblyEnabled(!ablyEnabled)}
            className={cn(
                'gap-1.5 text-muted-foreground',
                ablyEnabled
                    ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-700' +
                        ' hover:bg-emerald-500/20 dark:text-emerald-300'
                    : 'text-muted-foreground',
            )}>
            <Icon className={cn('size-3.5')} />
            <span>Realtime</span>
        </Button>
    )
}

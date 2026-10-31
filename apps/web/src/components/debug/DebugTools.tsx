import { DebugToolsMode } from '@repo/shared/types'
import { Bug, Expand, Minimize2 } from 'lucide-react'

import AblyDebugPanel from '@/components/debug/AblyDebugPanel'
import KanbanDebugPanel from '@/components/debug/KanbanDebugPanel'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { DebugPanelSection } from '@/store/debug'

import useDebugToolsViewModel from './DebugToolsViewModel'

const NAV_ITEMS: { id: DebugPanelSection; label: string }[] = [
    { id: 'ably', label: 'Ably' },
    { id: 'kanban', label: 'Kanban' },
]

const panelClasses = 'top-3 right-3 bottom-3 flex w-[min(38rem,92vw)] flex-col' +
    ' overflow-hidden rounded-lg border border-slate-300 bg-slate-100 opacity-95 shadow-lg'

const fullClasses = 'inset-3 flex w-auto flex-col overflow-hidden rounded-lg border' +
    ' border-slate-300 bg-slate-100 opacity-95 shadow-lg'

const DebugTools = () => {
    
    const vm = useDebugToolsViewModel()
    const expanded = vm.debugToolsMode !== DebugToolsMode.minified
    
    return (
        
        <div
            className={cn(
                'fixed z-50 transition-[width,height,opacity] duration-200 ease-out',
                {
                    'bottom-4 right-3 overflow-hidden rounded-full opacity-12 hover:opacity-100':
                        vm.debugToolsMode === DebugToolsMode.minified,
                    [panelClasses]: vm.debugToolsMode === DebugToolsMode.panel,
                    [fullClasses]: vm.debugToolsMode === DebugToolsMode.full,
                },
            )}>
            
            {vm.debugToolsMode === DebugToolsMode.minified && (
                <header
                    className="mx-auto cursor-pointer px-4 py-3"
                    onClick={() => vm.setDebugToolsMode(DebugToolsMode.panel)}>
                    <Bug
                        suppressHydrationWarning
                        className={cn({
                            'text-white': vm.activeTheme === 'dark',
                        })} />
                </header>
            )}
            
            {expanded && (
                <>
                    <header className="flex shrink-0 items-center justify-between gap-2
                        border-b border-slate-300 bg-slate-200 px-2 py-1">
                        <p className="px-1 text-xs font-medium uppercase tracking-wide text-slate-600">
                            Debug
                        </p>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 opacity-40 hover:opacity-100"
                                onClick={() => vm.setDebugToolsMode(DebugToolsMode.minified)}>
                                <Minimize2 />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 opacity-40 hover:opacity-100"
                                onClick={() =>
                                    vm.setDebugToolsMode(
                                        vm.debugToolsMode === DebugToolsMode.panel
                                            ? DebugToolsMode.full
                                            : DebugToolsMode.panel,
                                    )
                                }>
                                <Expand />
                            </Button>
                        </div>
                    </header>
                    
                    <div className="flex min-h-0 flex-1">
                        <nav className="flex w-24 shrink-0 flex-col gap-1
                            border-r border-slate-300 bg-slate-200/70 p-2">
                            {NAV_ITEMS.map(item => (
                                <Button
                                    key={item.id}
                                    type="button"
                                    variant="ghost"
                                    size="xs"
                                    onClick={() => vm.setDebugPanelSection(item.id)}
                                    className={cn(
                                        'justify-start text-xs font-medium',
                                        vm.debugPanelSection === item.id
                                            ? 'bg-white text-slate-900 shadow-sm hover:bg-white'
                                            : 'text-slate-600 hover:bg-slate-100',
                                    )}>
                                    {item.label}
                                </Button>
                            ))}
                        </nav>
                        
                        <div className="min-h-0 min-w-0 flex-1 bg-slate-50">
                            {vm.debugPanelSection === 'ably' && <AblyDebugPanel />}
                            {vm.debugPanelSection === 'kanban' && <KanbanDebugPanel />}
                        </div>
                    </div>
                </>
            )}
        
        </div>
        
    )
    
}

export default DebugTools

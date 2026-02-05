'use client'
import { Bug, Expand, Minimize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { DebugToolsMode } from '@/types'
import useDebugToolsViewModel from './DebugToolsViewModel'

const DebugTools = () => {
    
    const vm = useDebugToolsViewModel()
    
    return (
        
        <div
            className={cn('fixed bottom-17 transition-opacity duration-300 ease-in-out', {
                'right-3 opacity-12 hover:opacity-100 overflow-hidden rounded-full':
                    vm.debugToolsMode === DebugToolsMode.minified,
                'w-[35%] min-h-100 max-h-200 right-3 overflow-auto opacity-90 rounded bg-slate-100':
                    vm.debugToolsMode === DebugToolsMode.panel,
                'max-w-[90%] max-h-[90%] inset-x-5 overflow-auto rounded bg-slate-100':
                    vm.debugToolsMode === DebugToolsMode.full,
            })}>
            
            {vm.debugToolsMode === DebugToolsMode.minified && (
                <header
                    className="mx-auto px-4 py-3 cursor-pointer"
                    onClick={() => vm.setDebugToolsMode(DebugToolsMode.panel)}>
                    <Bug
                        suppressHydrationWarning
                        className={cn({
                            'text-white': vm.activeTheme === 'dark',
                        })}
                    />
                </header>
            )}
            
            {vm.debugToolsMode !== DebugToolsMode.minified && (
                <>
                    <header className="w-full flex items-center justify-end gap-2 px-2 py-1 bg-slate-200">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 opacity-30 hover:opacity-100"
                            onClick={() => vm.setDebugToolsMode(DebugToolsMode.minified)}>
                            <Minimize2 />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 opacity-30 hover:opacity-100"
                            onClick={() =>
                                vm.setDebugToolsMode(
                                    vm.debugToolsMode === DebugToolsMode.panel
                                        ? DebugToolsMode.full
                                        : DebugToolsMode.panel,
                                )
                            }>
                            <Expand />
                        </Button>
                    </header>
                    
                    <div className="px-4 py-3">
                        <div>
                            TODO
                        </div>
                    </div>
                </>
            )}
        
        </div>
        
    )
    
}

export default DebugTools

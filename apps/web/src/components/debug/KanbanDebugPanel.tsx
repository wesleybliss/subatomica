import type { KanbanDndEngine } from '@/lib/constants/kanban.constants'
import { cn } from '@/lib/utils'
import { useDebugStore } from '@/store'

const ENGINES: { id: KanbanDndEngine, label: string, hint: string }[] = [
    {
        id: 'dnd-kit',
        label: 'dnd-kit',
        hint: 'Default — sortable live cross-column moves + DragOverlay',
    },
    {
        id: 'pragmatic',
        label: 'pragmatic',
        hint: 'Atlassian pragmatic-drag-and-drop with drop ghosts',
    },
]

const KanbanDebugPanel = () => {
    const kanbanDndEngine = useDebugStore(s => s.kanbanDndEngine)
    const setKanbanDndEngine = useDebugStore(s => s.setKanbanDndEngine)
    
    return (
        <div className="flex h-full min-h-0 flex-col">
            <div className="border-b border-slate-200 px-3 py-2">
                <p className="text-xs font-medium text-slate-800">Kanban DnD engine</p>
                <p className="text-[10px] text-slate-500">
                    Switch the board drag implementation for comparison. Applies on the next render.
                </p>
            </div>
            
            <div className="flex flex-col gap-2 p-3">
                {ENGINES.map(engine => {
                    const active = kanbanDndEngine === engine.id
                    return (
                        <button
                            key={engine.id}
                            type="button"
                            onClick={() => setKanbanDndEngine(engine.id)}
                            className={cn(
                                'rounded-md border px-3 py-2 text-left transition-colors',
                                active
                                    ? 'border-slate-400 bg-white shadow-sm'
                                    : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white',
                            )}>
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-semibold text-slate-800">
                                    {engine.label}
                                </span>
                                {active && (
                                    <span className="rounded bg-slate-800 px-1.5 py-0.5
                                        text-[10px] font-medium uppercase tracking-wide text-white">
                                        active
                                    </span>
                                )}
                            </div>
                            <p className="mt-1 text-[10px] text-slate-500">{engine.hint}</p>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

export default KanbanDebugPanel

export type KanbanDndEngine = 'pragmatic' | 'dnd-kit'

/** Default engine when the session starts. Toggle live from the debug panel. */
export const DEFAULT_KANBAN_DND_ENGINE: KanbanDndEngine = 'dnd-kit'

export const DEFAULT_TASK_LANES = [
    { key: 'backlog', name: 'Backlog', order: 0 },
    { key: 'todo', name: 'To Do', order: 1 },
    { key: 'in-progress', name: 'In Progress', order: 2 },
    { key: 'done', name: 'Done', order: 3 },
]

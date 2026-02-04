declare module '@atlaskit/pragmatic-drag-and-drop/element/adapter' {
    type DragSource = {
        data: Record<string, unknown>
    }
    type DropTarget = {
        data: unknown
    }
    type DragLocation = {
        current: {
            dropTargets: DropTarget[]
        }
    }
    type CleanupFn = () => void
    export function draggable(args: {
        element: HTMLElement
        getInitialData?: () => Record<string, unknown>
        onDragStart?: () => void
        onDrop?: () => void
    }): CleanupFn
    export function dropTargetForElements(args: {
        element: HTMLElement
        getData?: () => Record<string, unknown>
        canDrop?: (args: { source: DragSource }) => boolean
        onDragEnter?: (args: { source: DragSource }) => void
        onDragLeave?: (args: { source: DragSource }) => void
        onDrop?: (args: { source: DragSource }) => void
    }): CleanupFn
    export function monitorForElements(args: {
        onDrop?: (args: { source: DragSource; location: DragLocation }) => void
    }): CleanupFn
}
declare module '@atlaskit/pragmatic-drag-and-drop/combine' {
    export function combine(...cleanups: Array<(() => void) | void>): () => void
}

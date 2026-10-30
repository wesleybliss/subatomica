import { type DBSchema, type IDBPDatabase, openDB } from 'idb'

export type DirtyTaskChange = {
    id: string
    updatedAt: string
    title?: string
    description?: string
    status?: string
    order?: number
}

type DirtyDb = DBSchema & {
    dirtyTasks: {
        key: string
        value: DirtyTaskChange & { projectId: string; teamId: string }
        indexes: { 'by-project': string }
    }
    cursors: {
        key: string
        value: { scope: string; cursor: string }
    }
}

const DB_NAME = 'subatomica-sync'
const DB_VERSION = 1

let dbPromise: Promise<IDBPDatabase<DirtyDb>> | null = null

const getDb = () => {
    if (!dbPromise) {
        dbPromise = openDB<DirtyDb>(DB_NAME, DB_VERSION, {
            upgrade(db) {
                const dirty = db.createObjectStore('dirtyTasks', { keyPath: 'id' })
                dirty.createIndex('by-project', 'projectId')
                db.createObjectStore('cursors', { keyPath: 'scope' })
            },
        })
    }
    return dbPromise
}

export const scopeKey = (teamId: string, projectId: string) => `${teamId}:${projectId}`

export async function markDirtyTask(
    teamId: string,
    projectId: string,
    change: DirtyTaskChange,
) {
    const db = await getDb()
    await db.put('dirtyTasks', { ...change, teamId, projectId })
}

export async function clearDirtyTasks(ids: string[]) {
    const db = await getDb()
    const tx = db.transaction('dirtyTasks', 'readwrite')
    await Promise.all(ids.map(id => tx.store.delete(id)))
    await tx.done
}

export async function listDirtyTasks(projectId: string) {
    const db = await getDb()
    return db.getAllFromIndex('dirtyTasks', 'by-project', projectId)
}

export async function countDirtyTasks() {
    const db = await getDb()
    return db.count('dirtyTasks')
}

export async function loadCursor(teamId: string, projectId: string) {
    const db = await getDb()
    const row = await db.get('cursors', scopeKey(teamId, projectId))
    return row?.cursor ?? new Date(0).toISOString()
}

export async function saveCursor(teamId: string, projectId: string, cursor: string) {
    const db = await getDb()
    await db.put('cursors', { scope: scopeKey(teamId, projectId), cursor })
}

# Sync (Tier 0 + 1) + Ably + local storage

## What shipped

| Layer | Behavior |
| --- | --- |
| **Tier 0** | TanStack Query `refetchOnWindowFocus`, visible-tab poll (~15s), sync status chip |
| **Tier 1** | IndexedDB dirty queue + `/sync/push` (LWW) + `/sync/pull?since=` + background reconciler (foreground/online gated) |
| **Ably** | Server publishes `invalidate` on task CUD; client token-auths and invalidates/reconciles. No-ops if `ABLY_API_KEY` unset |
| **Not used** | ElectricSQL / self-hosted sync VPS |

## Env

```bash
# apps/api/.env
ABLY_API_KEY=appkey.secret
ABLY_ENABLED=true   # required for server publish + token auth (omit/false = no Ably usage)
```

Create an Ably app, copy the **API key** (server-side only). Clients never see the key; they call `POST /sync/ably-token`.

**UI toggle:** project navbar `Ably on/off` (left of theme), **default off**, persisted in localStorage. Off → no client connection/token requests. Server publish/token also require `ABLY_ENABLED=true`.

## DnD comparison toggle

```ts
// apps/web/src/lib/constants/kanban.constants.ts
export const KANBAN_DND_ENGINE = 'pragmatic' as 'pragmatic' | 'dnd-kit'
```

Navbar shows `dnd:pragmatic` / `dnd:dnd-kit`. Flip the const and HMR/reload to compare.

## Local database: what to use (and what not to)

**Server source of truth:** Neon Postgres (already).

**Browser local store for Tier 1:** **IndexedDB** via `idb` (`apps/web/src/lib/sync/dirtyStore.ts`).

| Option | Use here? | Why |
| --- | --- | --- |
| **IndexedDB (`idb` / Dexie)** | **Yes** | Native browser persistence; perfect for dirty queues, cursors, optional task snapshots. No WASM. Survives reload. |
| **localStorage** | Only tiny flags | Quotas + sync stringification; bad for task payloads |
| **Embedded Postgres (PGlite)** | No (for now) | Full Postgres-in-WASM; heavy download, overkill for a dirty queue. Consider only if you want offline SQL parity with Neon schemas |
| **SQLite WASM (`wa-sqlite` / sql.js)** | Maybe later | Fine for richer offline query; more complexity than we need for Tier 1 |
| **OPFS file** | Advanced | Good with SQLite WASM; not needed yet |

**Rule of thumb:** keep Neon authoritative; treat IndexedDB as a **write-ahead / retry buffer + cursor**, not a second source of truth. SyncEngine push/pull reconciles into TanStack Query, which drives the UI.

If you later want true offline-first boards (browse whole projects offline), graduate the IDB layer to a task snapshot store (still not embedded Postgres unless you have a strong reason).

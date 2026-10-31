# Inspiration review: Gantt, Kanban, and sync

Reviewed five external projects against Subatomica’s current stack (Vite/React 19, Base UI + shadcn, `@atlaskit/pragmatic-drag-and-drop`, TanStack Query optimistic mutations, custom CSS-grid timeline). Focus: smoother DnD, better Gantt/timeline, background sync, and other high-leverage patterns.

---

## Subatomica baseline (what we already have)

| Area | Current state |
| --- | --- |
| DnD | Pragmatic Drag and Drop for kanban + list reorder |
| Timeline | Custom day-grid “TimelineView” — display-only, no drag/resize/zoom/deps |
| Data | TanStack Query + optimistic `onMutate`; no live multi-user sync |
| UI kit | Base UI, shadcn, Tailwind v4, `date-fns`, TipTap |

---

## 1. ReUI Gantt — https://reui.io/docs/components/base/gantt

**What it is:** Headless-first Shadcn/Base UI Gantt for React + Tailwind. Install: `pnpm dlx shadcn@latest add @reui/gantt`.

**Architecture / libraries**
- Composable engine (`useGanttState`) + view layer; external CRUD via `onEventUpdate` / `canDropEvent` / `onEventsChange`
- Same Base UI + shadcn + `date-fns` stack we already use

**Features worth adopting**
- Split resizable tree + timeline panes, synced scroll
- Scales: day / week / month / quarter / year + zoom + infinite scroll
- Drag move, resize, drag-to-create, slot select for unscheduled rows
- Progress fills, summary rollups on parents
- Baseline vs actual (ghost bars), dependency arrows, milestone diamonds
- Controlled/uncontrolled props; i18n + RTL

**Fit for Subatomica:** **Highest priority for timeline.** Our custom TimelineView is a static mock of a fraction of this. Replacing or wrapping with `@reui/gantt` would get interactive scheduling without inventing a chart engine. Wire `onEventUpdate` into existing task mutations (`start`/`due`/order).

**Note:** Prefer this over building our own bar-drag (Gr8r-style) unless we need a radically different UX.

---

## 2. Gr8r Studio — https://github.com/gr8rstudio/gr8r-studio/

**What it is:** Calm multi-view PM workspace (board / list / table / calendar / timeline / files). Vanilla JS ES modules + Vite — **no React, no DnD library**.

**Architecture**
- Layered: `core/` + `data/` → renderers → `actions/`
- Store (`S`/`D`) + HTML-string views + delegated `data-a` actions
- Native HTML5 DnD for cards/rows/calendar; pointer events for timeline bar move + table column resize
- Fractional `order` between neighbors on drop

**Ideas to steal (not libraries)**
- **More project views:** calendar (drag to reschedule), table with column widths, files dropzones — we only have kanban / list / basic timeline
- **Timeline UX:** week/month zoom, group by status/assignee/project, dependency paths, milestone lane with non-overlapping labels, “Today” jump, synced left-row / right-chart scroll
- **Cross-view DnD:** same task dragable on board, list, and calendar
- **Fractional ordering** (already common; confirm our lane/task order math matches)
- **Manual-sort toast** when user reorders under a non-manual sort mode

**Fit:** UX/product inspiration only. Do not port the vanilla render loop. For timeline interactions, ReUI Gantt covers more polish with less custom code.

---

## 3. Kargul Studio Kanban — https://github.com/kargulstudio/kanban

**What it is:** Polished Next.js 16 + React 19 marketing/demo kanban (local Zustand persist). Not a full sync backend.

**Libraries**
- `@dnd-kit/core` (not sortable package — custom placement via `elementFromPoint`)
- `motion` (layout springs, overlay sheet)
- Zustand + persist
- Rive / Lottie / Swiper (marketing chrome — ignore for product)

**DnD polish worth copying onto Pragmatic DnD**
- **DragOverlay portal** — lifted card ghost while source dims/hides
- **Custom collision:** `pointerWithin` preferring task/slot over column, fallback `rectIntersection`
- **Edge auto-page:** dwell (~220ms) in left/right edge zones to scroll columns while dragging
- **Activation constraints:** mouse distance 6px; touch delay 220ms / tolerance 8
- **`wasJustDragged` gate** (~250ms) so click-after-drop doesn’t open the task dialog
- **Placement preview** (`beforeId` / index / hidden-column drop) with drop slots
- **Layout animation** on settle (`motion` spring) without animating during drag
- **Hidden columns rail** as a drop target (move + toast)

**Fit:** Do **not** rewrite board onto dnd-kit just for this — Pragmatic is already the better long-term Atlassian-grade choice. Port the *interaction design* (overlay, edge scroll, click suppression, placement preview) into our kanban ViewModels/adapters. Optional: `@atlaskit/pragmatic-drag-and-drop-auto-scroll` / react-beautiful-dnd-style feedback packages if we aren’t using them yet.

---

## 4. Vibe Kanban — https://github.com/BloopAI/vibe-kanban

**What it is:** Agent-centric kanban (plan issues → coding-agent workspaces → diff review). Rust backend + pnpm web. Project is sunsetting, but the sync stack is still instructive.

**Libraries (frontend)**
- DnD: **both** `@dnd-kit/*` and `@hello-pangea/dnd` (legacy mix — not a model to copy)
- Sync: `@tanstack/electric-db-collection` + `@tanstack/react-db` + `wa-sqlite`
- Also: `react-use-websocket`, `rfc6902` (JSON Patch), Virtuoso, Lexical, etc.

**Background / live sync architecture (standout)**
- **ElectricSQL shapes** for live row sync into TanStack DB collections
- **Hybrid sync with REST fallback:** if Electric fails/times out (~3s) or returns 5xx, lock that shape to polling fallback (~30s), with snapshot cache
- Mutations return `txid` for Electric acknowledgement; bulk PATCH path for multi-row updates
- Error reporter with exponential debounce; pause shapes on auth logout; refresh token on 401
- Visibility-aware: don’t treat aborted/backgrounded fetches as hard failures

**Other product ideas**
- Sync error indicator / provider in the chrome
- Agent/workspace features are out of scope unless we intentionally pivot

**Fit for Subatomica:** **Best reference for multi-user realtime** if we outgrow optimistic Query. Path options:
1. **Electric + TanStack DB** (as Vibe) if we move Postgres + Electric-compatible publishing
2. Or steal the **hybrid pattern** (live stream + polling fallback + sync error UI) on top of SSE/WebSocket without full Electric

Heavier than Doska’s local-first engine; better when the source of truth stays the server and clients subscribe to shapes.

---

## 5. Doska — https://github.com/romenkova/doska/

**What it is:** Markdown-first, offline-first kanban. IndexedDB (or SQLite) first; sync to folder or server shortly after every change. Live multi-user when destination is a server. DnD: `@hello-pangea/dnd`.

**Architecture (portable packages)**
- `@doska/sync`: `SyncEngine`, `DirtyStore`, `HybridClock` (HLC), `startBackgroundSync`
- `@doska/client-db`: local DB adapters
- Ports: `Foreground`, `Net`, `KeyValue` — platform-agnostic
- Server: LWW upserts, push/pull since cursor, field merge for card bodies
- Monorepo: client / server / Tauri desktop / Expo mobile / MCP

**Sync model (recommended pattern to study)**
1. Local write → mark dirty ref → UI never waits on network
2. `SyncEngine.reconcile`: push dirty changes + pull since cursor + apply remote + save cursor
3. Overlapping reconciles coalesce (`rerun` flag); forbidden scopes drop without poisoning whole connection
4. `startBackgroundSync(interval)`: poll only while foreground; also reconcile on online / resume
5. Status for UI: `idle | syncing | error | paused` + `pending` count + failure class (`offline | auth | server`)
6. HLC so LWW stays correct when device clocks skew

**Product features worth noting**
- Sync / offline indicators; quick-note window; tags; assignees; activity history; cross-board deadlines; folder sync as Markdown; MCP over boards

**Fit for Subatomica:** **Best portable sync *design*** if we want offline-tolerant or eventually-consistent boards without standing up Electric. We could:
- Keep TanStack Query for reads initially, add a **dirty queue + background reconciler** for task/lane writes
- Or adopt a small local store (IndexedDB) for the active project and sync to the API with Doska-like cursors

`@hello-pangea/dnd` is older/heavier than Pragmatic — keep Pragmatic; steal sync, not DnD.

---

## Cross-cutting recommendations

### Priority 1 — Timeline → ReUI Gantt
Replace/enhance `TimelineView` with `@reui/gantt`. Map tasks → `GanttEvent`, lanes/projects → `GanttResource` tree. Persist via existing task update mutations. Enables drag, resize, zoom, deps, baselines with stack alignment (Base UI / shadcn / date-fns).

### Priority 2 — Kanban DnD feel
**Implemented dual boards** for comparison: flip `KANBAN_DND_ENGINE` in `apps/web/src/lib/constants/kanban.constants.ts` (`pragmatic` | `dnd-kit`). See Appendix A for decision criteria.

### Priority 3 — Sync / multiplayer (Vercel + Neon)
**Implemented Tier 0 + Tier 1 + Ably** (no Electric). Details: `docs/sync-and-local-db.md`. Local buffer = IndexedDB (`idb`), not embedded Postgres.

### Priority 4 — Product surface (Gr8r / Doska)
- Calendar view with drag-to-reschedule
- Dependency + milestone first-class fields (feeds Gantt)
- Offline / sync status in chrome
- Activity feed / assignees / tags if not already complete

### Explicit non-goals from these repos
- Switching the whole app to vanilla HTML-string rendering (Gr8r)
- Adopting `@hello-pangea/dnd` or dual DnD stacks (Vibe/Doska)
- Agent workspaces / terminal preview (Vibe) unless product direction changes
- Marketing-only Rive/Swiper chrome (Kargul)

---

## Quick library cheat sheet

| Need | Strongest source | Library / pattern |
| --- | --- | --- |
| Gantt / interactive timeline | ReUI | `@reui/gantt` (shadcn add) |
| Smoother board DnD UX | Kargul | Patterns on top of Pragmatic; optionally Pragmatic auto-scroll helpers |
| Live server→client sync | Vibe Kanban | ElectricSQL + `@tanstack/electric-db-collection` + `@tanstack/react-db` |
| Offline-first background sync | Doska | Custom `SyncEngine` + DirtyStore + HLC + foreground/net gates |
| Multi-view PM UX | Gr8r | Calendar / table / deps / milestones (design only) |

---

## Appendix A — Pragmatic vs dnd-kit (decision process)

Popularity alone is a weak signal here. Both can ship a great kanban; the question is *cost to our codebase* and *where the hard problems live*.

### What “popular” buys you
- More React tutorials, Stack Overflow, copy-paste board examples (Kargul, many shadcn demos)
- Batteries: `DndContext`, `DragOverlay`, sensors, sortable presets — faster *first* polished drag if starting from zero
- Ecosystem gravity: designers/engineers more likely to have used it

### Where popularity misleads
- Kanban UX quality is mostly **your** overlay, hit-testing, edge scroll, and post-drop click handling — Kargul’s polish is custom code on dnd-kit, not free from the library
- dnd-kit is in a **legacy (`@dnd-kit/core`) vs next (`next.dndkit.com`)** split; maintainer investment is on next, which is “production ready” but APIs may still move before 1.0. Migrating twice is a real risk if we adopt legacy because demos use it
- Bundle/TTI: Atlassian’s public board microbench puts Pragmatic far ahead of `@dnd-kit` on time-to-interactive for a 48-card board (Pragmatic ~+1–6ms vs dnd-kit ~+130ms). Directionally useful even if not gospel for our exact app

### Pragmatic strengths (why the earlier bias)
| Factor | Note |
| --- | --- |
| Already integrated | Kanban + list already use element adapters / monitors (`KanbanCardDnd`, `KanbanTaskLane`, `ListView*`) — rewrite is pure cost |
| Model | Thin wrappers over native HTML5 DnD; tiny core (~4.7kB gzip); deferred loading; framework-agnostic |
| Scale dogfood | Powers Trello / Jira / Confluence boards — same product shape as us |
| Escape hatches | File drops, cross-window, text selection adapters if we need them later |
| Optional packages | Hitbox, auto-scroll, React drop indicators — UX pieces without switching engines |

### Pragmatic costs
- More boilerplate; fewer “just wrap SortableContext” shortcuts
- Visual language is DIY (we have to build overlay / indicators ourselves — same work Kargul did on dnd-kit)
- Smaller React-tutorial surface; answers live in Atlassian design docs + source

### dnd-kit strengths
| Factor | Note |
| --- | --- |
| React DX | Context, sensors, overlay primitives match how most React boards are taught |
| Pointer-driven | Doesn’t lean on native DnD the same way — sometimes easier for custom collision (Kargul’s `elementFromPoint` placement) and touch tuning |
| Demo velocity | If we were greenfield and wanted Kargul-like feel in a week, dnd-kit/next is the shorter path |

### dnd-kit costs
- Heavier; React-coupled
- Legacy vs next confusion; mixing packages breaks
- Switching now = rewrite of every board/list drag path for uncertain UX gain if we can copy Kargul’s *patterns* onto Pragmatic

### Decision rule (not a religion)
1. **Default:** stay on Pragmatic; implement Kargul-style overlay / edge-scroll / click-suppress / drop line using Pragmatic monitors + optional auto-scroll package.
2. **Spike (~1–2 days) only if** Pragmatic fights us on touch, collision, or overlay after an honest attempt — try **dnd-kit *next*** (not legacy) on one board surface and compare feel + LOC.
3. **Do not** adopt both (Vibe’s dual stack is a smell).
4. **Do not** switch solely because GitHub stars or “everyone uses dnd-kit” — switch if the spike’s UX or maintainability clearly wins after counting rewrite cost.

Bottom line: popularity favors dnd-kit for greenfield React demos; **sunk cost + performance + Atlassian board dogfood** favor Pragmatic for Subatomica *unless* a spike proves otherwise. The recommendation was inertia + fit, not “Pragmatic is always better.”

---

## Appendix B — Sync architecture on Vercel + Neon (no dedicated VPS)

Constraint: app on **Vercel**, DB on **Neon**, prefer **not** running our own always-on sync box.

### What “sync” actually needs (building blocks)

Regardless of brand (Doska / Electric / Ably), multi-user sync needs some version of:

| Piece | Role |
| --- | --- |
| **Source of truth** | Neon Postgres (we already have this) |
| **Write path** | Existing API mutations (authz stays on the server) |
| **Change capture** | How other clients learn something changed: poll, push invalidate, or streaming shapes |
| **Client cache** | TanStack Query today; optionally a local dirty queue / IndexedDB / TanStack DB |
| **Conflict policy** | Last-write-wins (simple), HLC timestamps (Doska), or txid-ordered apply (Electric) |
| **Presence / reconnect** | Foreground + online gates so background tabs don’t hammer the API |
| **Authz for reads** | Who can see which project/board shapes or poll which cursors |

Vercel serverless is great at **short request/response**. It is a poor host for **long-lived Electric sync processes** or thousands of sticky WebSockets unless you buy a managed realtime product.

### Tiered options that fit the constraint

#### Tier 0 — Stay request/response (recommended near-term)
**Architecture**
- Keep optimistic TanStack Query mutations
- On success, invalidate/refetch query keys
- Add: `refetchOnWindowFocus`, optional `refetchInterval` while the project tab is visible (Doska’s foreground-gated poll)
- Optional: soft “Updated just now / Syncing…” chip

**Infra:** Vercel + Neon only.  
**Latency:** seconds, not milliseconds — fine for many PM apps.  
**No VPS.**

#### Tier 1 — Doska-style dirty queue + cursor pull (still no VPS)
**Architecture**
- Client marks dirty refs on edit; UI never blocks on network
- `POST /sync/push` applies changes (LWW or field merge) on Neon
- `GET /sync/pull?since=cursor` returns changes for the active project/team scope
- Background reconciler: interval while foreground + on `online` / visibility
- Persist dirty queue in `localStorage`/IndexedDB so reloads don’t lose unacked writes
- Optional Hybrid Logical Clock on `updatedAt` for sane LWW under clock skew

**API additions (sketch)**
- Per-scope cursor (project or team) stored client-side
- Server tables already versioned by `updatedAt` (or add `row_version` / `updated_at` indexes)
- Authz: same session checks as today’s routes; never expose another team’s since-cursor dump

**Infra:** still only Vercel functions + Neon.  
**Multiplayer:** eventual consistency via poll (e.g. 2–10s while focused).  
**Offline:** real benefit vs Tier 0.

This is the best “Doska without owning Doska’s server process” fit for serverless.

#### Tier 2 — Live shapes via **managed** Electric (no *your* VPS)
Electric needs a **long-lived sync engine** with a **direct (unpooled) Neon** connection and logical replication enabled. That engine does **not** run on Vercel serverless.

**VPS-free path:** **Electric Cloud** (managed) + Neon, as in Neon’s guides and TanStack DB demos:
1. Enable logical replication on Neon
2. Point Electric Cloud at Neon’s **unpooled** connection string
3. Vercel app proxies/authz-gates shape requests (Electric does not do auth for you)
4. Client: `@tanstack/electric-db-collection` / Electric client; writes still go through your API
5. Keep a REST fallback poll (Vibe’s hybrid pattern) when Electric is down

**Infra:** Vercel + Neon + Electric Cloud (SaaS). Still no dedicated VPS you operate.  
**Cost/complexity:** third vendor, shape proxy, replication ops awareness.  
**Future note:** Electric joined Neon (2026); deeper first-party Neon sync may simplify this later — watch that before self-hosting.

**Avoid:** self-hosting `electricsql/electric` on Render/Fly “just for now” if the goal is no ops box — that’s the VPS by another name.

#### Tier 3 — Invalidate bus only (optional accelerator)
If Tier 0/1 feel too chatty or slow:
- On mutation success, publish `{ type, projectId, keys }` to a **managed** realtime channel (Ably, Pusher, Cloudflare PartyKit, etc.)
- Other tabs subscribe and `queryClient.invalidateQueries` — still load data from your Vercel API + Neon
- You are **not** syncing row payloads over the bus; only “please refetch”

**Infra:** Vercel + Neon + managed pub/sub. No VPS. Good middle ground before Electric.

### What *not* to do on this stack
- Long-lived SSE/WebSocket fan-out from raw Vercel serverless functions as the primary sync fabric (timeouts, cold starts, connection limits)
- Running Electric (or a custom sync worker) on a box you babysit if Cloud/SaaS meets the need
- Dual write paths without a conflict story (optimistic UI + blind overwrite from poll)

### Suggested path for Subatomica
1. **Now:** Tier 0 polish (focus refetch + visible sync state).  
2. **If offline / pending writes matter:** Tier 1 dirty queue + pull-since (Doska architecture on our API).  
3. **If true multiplayer latency matters and budget allows:** Tier 2 Electric Cloud **or** Tier 3 invalidate bus — pick based on whether you need streaming row subsets (Electric) or just “someone changed the board” (bus).  
4. Revisit native Neon↔Electric integration before committing to self-hosted sync.

---

## Sources

1. https://reui.io/docs/components/base/gantt  
2. https://github.com/gr8rstudio/gr8r-studio/  
3. https://github.com/kargulstudio/kanban  
4. https://github.com/BloopAI/vibe-kanban  
5. https://github.com/romenkova/doska/  
6. https://atlassian.design/components/pragmatic-drag-and-drop/comparison  
7. https://neon.com/guides/electric-sql  
8. https://electric.ax/docs/sync/integrations/neon  

Reviewed against Subatomica `apps/web` (kanban Pragmatic DnD, custom `TimelineView`, TanStack Query mutations) as of this note.

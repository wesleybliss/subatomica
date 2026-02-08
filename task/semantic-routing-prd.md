
# PRD: Semantic Routing & URL Shortening

## **1\. Overview**

**Goal:** Replace long UUIDv7 URLs with human-readable, SEO-friendly, and semantic slugs.

Currently, URLs are formatted as `/t/<teamId>/p/<projectId>/c/<taskId>`. We are moving to a descriptive hierarchy:

`/t/<teamSlug>/<projectSlug>/<taskKey>`

## ---

**2\. Success Metrics**

* **URL Brevity:** Average URL length reduced by \>40%.  
* **Readability:** A user can identify the team and project context just by looking at the URL string.

## ---

**3\. Functional Requirements**

### **3.1. Slug Persistence & Lifecycle**

* **Storage:** Slugs must be stored in the teams and projects database tables.  
* **Immutability Policy:** \* Slugs are generated upon creation.  
  * If a user **renames** a Team or Project, a new slug **must** be generated and saved.  
  * **No Redirects:** We will not support legacy URL redirects. If a slug changes, the old URL will return a 404 Not Found. Users are responsible for updating shared links.

### **3.2. Slug Generation Pipeline**

To ensure slugs are concise, the generation logic follows these steps in order:

1. **Stop Word Filtering:** Remove common words that add length without meaning: the, a, an, and, of, for, with.  
2. **Abbreviation Mapping:** Replace known business terms with shorthand:  
   * Incorporated $\\rightarrow$ inc  
   * Limited $\\rightarrow$ ltd  
   * Company $\\rightarrow$ co  
   * Development $\\rightarrow$ dev  
3. **Normalization:** Convert to lowercase, strip special characters, and replace spaces with hyphens.  
4. **Length & Collision Guard:** \* Max length is **24 characters**.  
   * If the result exceeds 24 characters OR if the slug already exists in the database for that scope, truncate and append a 6-character random ShortUniqueId.

### **3.3. Task Key System**

* **Format:** \[ACRONYM\]-\[SEQUENCE\] (e.g., CPW-01).  
* **Acronym:** Derived from the first letter of each major word in the Project Name (max 3 chars).  
* **Sequence:** \* An auto-incrementing integer **scoped to the Project**.  
  * The sequence must be padded (minimum 2 digits).  
  * **No Back-filling:** If a task is deleted (e.g., \#08), the number is retired. The next task created will use the next increment (e.g., \#09).

## ---

**4\. Proposed Database Schema Changes**

### **teams Table**

| Column | Type | Notes |
| :---- | :---- | :---- |
| name | String | Original display name. |
| slug | String (Unique) | The generated URL string. |

### **projects Table**

| Column       | Type | Notes |
|:-------------| :---- | :---- |
| name         | String | Original display name. |
| slug         | String | Unique within the scope of the team\_id. |
| taskSequence | Integer | Defaults to 1; increments on every task creation. |

### **tasks Table**

| Column    | Type | Notes |
|:----------| :---- | :---- |
| projectId | UUID | Foreign key. |
| localId   | Integer | The sequence number assigned at birth. |

## ---

**5\. Technical Implementation (Logic Snippet)**

```javascript
import slugify from 'slugify';  
import acronym from '@stdlib/string-acronym';  
import { ShortUniqueId } from 'short-unique-id';

const uid = new ShortUniqueId({ length: 6 });  
const SHORT_MAP = { 'incorporated': 'inc', 'limited': 'ltd', 'company': 'co', 'development': 'dev' };  
const STOP_WORDS = ['the', 'a', 'an', 'and', 'of', 'for', 'with'];

/**  
 * Cleans name by removing stop words and applying abbreviations  
 */  
const compressName = (name) => {  
  return name.toLowerCase().split(' ')  
    .filter(word => !STOP_WORDS.includes(word))  
    .map(word => SHORT_MAP[word] || word)  
    .join(' ');  
};

/**  
 * Generates a URL-safe slug with a 24-char limit  
 */  
export const generateSlug = (name) => {  
  let slug = slugify(compressName(name));  
    
  if (slug.length > 24) {  
    const suffix = uid.rnd();  
    // Truncate to make room for hyphen and suffix  
    slug = slug.substring(0, 24 - suffix.length - 1) + '-' + suffix;  
  }  
  return slug;  
};
```

## ---

**6\. Final Thoughts**
 
* **Sequence Length:** If a project reaches 100 tasks, the padding should naturally expand to 3 digits (ACR-100).
* **Empty Slugs:** If the slug is only made of stop words, and therefore results in an empty string, ignore the stop-words filter and just generate the slug with the stop-words included.

---

## **7. Implementation Checklist**

### **7.1. Dependency Management**
- [x] Install required packages in `apps/api`: `slugify`, `@stdlib/string-acronym`, `short-unique-id`.
- [x] Install types for these packages (if not bundled).

### **7.2. Database Schema & Migrations**
- [x] **Teams Table:** Add `slug` (text, unique).
- [x] **Projects Table:** Add `slug` (text) and `taskSequence` (integer, default 1).
- [x] **Projects Table:** Add unique index on `(teamId, slug)`.
- [x] **Tasks Table:** Add `localId` (integer).
- [x] **Tasks Table:** Add unique index on `(projectId, localId)`.
- [x] Apply changes to Turso schema (`apps/api/src/db/turso/schema.turso.ts`).
- [x] Apply changes to Postgres schema (`apps/api/src/db/postgres/schema.postgres.ts`).
- [ ] Run migrations/push schema changes using `drizzle-kit push`.

### **7.3. Core Logic (Backend Utilities & Services)**
- [x] Implement `generateSlug` utility in `apps/api/src/lib/slugs.ts` based on PRD logic.
- [x] Implement `generateProjectAcronym` utility.
- [x] Update `createTeam` (`apps/api/src/services/teams.ts`) to generate and save `slug`.
- [x] Add `renameTeam` service to update `slug` on name changes.
- [x] Update `createProject` (`apps/api/src/services/projects.ts`) to generate `slug` and initialize `taskSequence`.
- [x] Update `renameProject` service to update `slug` on name changes.
- [x] Update `createTask` (`apps/api/src/services/tasks.ts`) to atomically increment `taskSequence` and assign `localId`.
- [x] Add a `taskKey` helper to format `[ACRONYM]-[localId]` (e.g., `CPW-01`).

### **7.4. API Route Enhancements**
- [x] Update `apps/api/src/routes/teams.ts` to support fetching team by `slug`.
- [x] Update `apps/api/src/routes/projects.ts` to support fetching project by `slug` (scoped by team).
- [x] Update `apps/api/src/routes/tasks.ts` to support fetching task by `taskKey` (scoped by project).

### **7.5. Frontend (Web App) Migration**
- [ ] Update `apps/web/src/routes/index.tsx` route patterns:
    - Change `:teamId` to `:teamSlug`.
    - Change `:projectId` to `:projectSlug`.
    - Update task routes to use `:taskKey`.
- [ ] Update API client/hooks to use slugs in URLs.
- [ ] Update navigation components (`Sidebar`, `TeamSwitcher`, `NavMain`) to use `slug` for links.
- [ ] Update `TaskPage` and task list components to display and link via `taskKey`.
- [ ] Ensure 404 handling for old UUID-based URLs (no redirects).

### **7.6. Data Migration (Initial Setup)**
- [x] Create a script to backfill `slug` for existing Teams and Projects.
- [x] Create a script to backfill `localId` for existing Tasks (preserving relative creation order).

---

## **8. Implementation Status & Next Steps**

### ✅ Completed (Backend Foundation)
Sections 7.1-7.4 and 7.6 are fully complete. The core backend infrastructure for semantic routing is in place:
- Database schema updated with slug and sequence fields
- Slug generation utilities working with all edge cases
- Service layer fully updated to generate slugs and task keys on creation
- Backfill scripts ready for existing data migration

**Files Modified:**
- `apps/api/src/db/postgres/schema.postgres.ts` - Added slug/localId columns
- `apps/api/src/db/turso/schema.turso.ts` - Added slug/localId columns
- `apps/api/src/lib/slugs.ts` - New slug generation utilities
- `apps/api/src/services/teams.ts` - Added slug generation and getTeamBySlug
- `apps/api/src/services/projects.ts` - Added slug generation and getProjectBySlug
- `apps/api/src/services/tasks.ts` - Added localId assignment and task key helpers
- `packages/shared/src/types/*.ts` - Updated type definitions
- `task/semantic-routing-prd.md` - Checklist updated

**New Files Created:**
- `apps/api/src/lib/slugs.ts` - Slug and key generation
- `apps/api/src/scripts/backfill-slugs.ts` - Data migration for slugs
- `apps/api/src/scripts/backfill-task-ids.ts` - Data migration for task IDs
- `task/semantic-routing-implementation.md` - Detailed implementation summary

### ⏳ Pending (Deployment)
- Run `drizzle-kit push` to apply schema migrations to database

### 🚀 Next Phase (Frontend Migration)
Section 7.5 requires significant frontend work to fully realize semantic routing:
1. Update route definitions to use slugs instead of IDs
2. Modify layout components to look up resources by slug
3. Update all navigation to construct semantic URLs
4. Add task key display in UI

This can proceed independently - the backend is ready to support slug-based lookups.

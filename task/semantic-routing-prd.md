
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
- [ ] Install types for these packages (if not bundled).

### **7.2. Database Schema & Migrations**
- [ ] **Teams Table:** Add `slug` (text, unique).
- [ ] **Projects Table:** Add `slug` (text) and `taskSequence` (integer, default 1).
- [ ] **Projects Table:** Add unique index on `(teamId, slug)`.
- [ ] **Tasks Table:** Add `localId` (integer).
- [ ] **Tasks Table:** Add unique index on `(projectId, localId)`.
- [ ] Apply changes to Turso schema (`apps/api/src/db/turso/schema.turso.ts`).
- [ ] Apply changes to Postgres schema (`apps/api/src/db/postgres/schema.postgres.ts`).
- [ ] Run migrations/push schema changes using `drizzle-kit push`.

### **7.3. Core Logic (Backend Utilities & Services)**
- [ ] Implement `generateSlug` utility in `apps/api/src/lib/slugs.ts` based on PRD logic.
- [ ] Implement `generateProjectAcronym` utility.
- [ ] Update `createTeam` (`apps/api/src/services/teams.ts`) to generate and save `slug`.
- [ ] Add `renameTeam` service to update `slug` on name changes.
- [ ] Update `createProject` (`apps/api/src/services/projects.ts`) to generate `slug` and initialize `taskSequence`.
- [ ] Update `renameProject` service to update `slug` on name changes.
- [ ] Update `createTask` (`apps/api/src/services/tasks.ts`) to atomically increment `taskSequence` and assign `localId`.
- [ ] Add a `taskKey` helper to format `[ACRONYM]-[localId]` (e.g., `CPW-01`).

### **7.4. API Route Enhancements**
- [ ] Update `apps/api/src/routes/teams.ts` to support fetching team by `slug`.
- [ ] Update `apps/api/src/routes/projects.ts` to support fetching project by `slug` (scoped by team).
- [ ] Update `apps/api/src/routes/tasks.ts` to support fetching task by `taskKey` (scoped by project).

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
- [ ] Create a script to backfill `slug` for existing Teams and Projects.
- [ ] Create a script to backfill `localId` for existing Tasks (preserving relative creation order).

### **7.7. Verification**
- [ ] Test slug generation with edge cases (long names, stop-word only names).
- [ ] Test slug collision logic (6-char random suffix).
- [ ] Verify task sequence atomicity under concurrent load.
- [ ] Verify end-to-end navigation using semantic URLs.

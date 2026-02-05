# Organization Sprint #2

## Overview

Complete all of these tasks.
Follow instructions in `AGENTS.md`.
Use `docs/AGENT_BROWSER.md` if you need to test the actual page.
Do not stop or start the dev server - it is running on `http://localhost:3001`.
Use the credentials below to log in, if needed, and use this URL for testing: `http://localhost:3001/t/019c2712-76d8-705e-93b1-75a694aca6ff`.
Maintain a checklist of tasks & mark them completed at the bottom of this file.

Testing credentials:
```
DEBUG_AGENT_BROWSER_EMAIL="CorporalMaxSterling@gmail.com"
DEBUG_AGENT_BROWSER_PASSWORD="ABCsubatomica123!"
DEBUG_AGENT_BROWSER_TEAM_ID="019c2712-76d8-705e-93b1-75a694aca6ff"
```

## Tasks

### Ensure use of correct className utility

Some elements are using arrays or template strings for className.
These should all be using the `cn` utility in `src/lib/utils.ts`.

Example Bad:
```jsx
<div className={[
    'flex flex-col',
    'justify-center items-center gap2',
].join(' ')} />
```

Example Bad:
```jsx
<div className={`flex flex-col ${isRed ? 'bg-red-500' : 'bg-green-500'}`} />
```

Example Good:
```jsx
<div className={cn(
    'flex flex-col',
    'justify-center items-center gap2', {
        'bg-red-500': isRed,
        'bg-green-500': !isRed,
    },
)} />
```

### Ensure general use of global store

Many components are using local React store, via `useState`.
Not all state should be global, but things that make sense, like the active team, active project, etc. should be global.
See the root `store` directory for examples.

### Use the "ViewModel" pattern

For most use cases, implement a ViewModel class that encapsulates the data and logic for a specific component.
See `components/kanban/KanbanBoardDndViewModel.ts` as an example.

## Checklist

- [] TODO

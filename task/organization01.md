# Organization Sprint #1

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

### Correct the URL scheme

The current URL scheme shows the kanban board under the team, for example: `http://localhost:3001/t/<teamId>`. Instead, `/t/<teamId>` should just show a very basic page with the team name, number of projects within the team, and number of tasks within the team, as a brief overview.
Similarly, `/t/<teamId>/p` should just show a brief list of projects, `/t/<teamId>/p/<projectId>` should show the actual kanban board with all of the tasks for that project.

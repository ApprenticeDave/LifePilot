# LifePilot

LifePilot is intended to reduce the cognitive load of everyday life with
supportive organization and access to useful information. The longer-term
product vision includes household and property management, personal
organization, a more human assistant interface, and user-directed financial
tracking.

## First local application

The first runnable version implements optional, resumable first-use setup, a
locally saved profile, a review and starting-point handoff, and a visual home
dashboard with setup and profile actions, a local task list, and previews of
future areas marked as unavailable. Task capture, editing, completion and
reopening work; dates, reminders, document storage, property tools and finance
features are not implemented. It remains a deliberately small local test bed. See the
[current scope and privacy notes](docs/PRODUCT_VISION.md).

### Requirements

- Node.js 22.13 or later (tested with Node 22.18.0)
- No package installation or external service is required.

### Run locally

From the repository root:

```powershell
npm start
```

Then open <http://127.0.0.1:4173>. The server binds to IPv4 loopback only.
To use another available port, set `PORT` before starting it, for example:

```powershell
$env:PORT = "4174"
npm start
```

On Home, the **Tasks** card lets you enter up to 240 characters and select
**Add task** (or press Enter). No date or category is required. New tasks appear
first under **To do**. Home shows up to two open tasks; select **Show all** to
expand a longer list. Use **Edit** and **Save changes**, or cancel an edit to
keep the saved text. **Mark done** moves a task into the expandable
**Completed** section; **Reopen** brings it back to To do.
On wider screens the Tasks card is narrower than the dashboard and the capture
field and button sit on one row; on small screens the card fills the available
width and the controls stack. Draft text is not saved until you add the task or
save the edit.

The local SQLite database is created in `.data/lifepilot.sqlite` and is ignored
by Git. Tasks, setup progress and profile answers survive browser reloads and server
restarts. If another tab has saved newer data or cleared the profile, an older
tab cannot overwrite or restore it; use the offered reload action to adopt the
current saved state. Reloading discards unsaved changes in that tab. To remove
data, use **Clear my local data** on the dashboard and confirm the deletion of
the profile, setup progress and all tasks, including completed tasks.
Individual task deletion is not included in this slice.
Do not delete or modify files in `.data` unless you intend to manage that local
data yourself.

**Privacy limit:** the database is stored only on this computer; there is no
account, cloud sync, or external service. The SQLite file is not encrypted.
Anyone who can access the computer or its files may be able to read it. The
clear action removes the saved profile and task records from LifePilot, but is not a secure erase
of the storage device. The server intentionally has no sign-in and should only
be used as a local test bed, not exposed to a network.

### Test

```powershell
npm test
```

Tests use a separate temporary SQLite database and remove only their own
temporary files. Node currently reports its built-in `node:sqlite` API as
experimental; see [setup and verification](docs/README.md).

## Project documentation

See the [documentation guide](docs/README.md) for product scope, the first-use
journey, and the setup and test commands.
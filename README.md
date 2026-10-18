# LifePilot

LifePilot is intended to reduce the cognitive load of everyday life with
supportive organization and access to useful information. The longer-term
product vision includes household and property management, personal
organization, and user-directed financial tracking.

## First local application

The first runnable version implements optional, resumable first-use setup, a
locally saved profile, a review and starting-point handoff, and a visual home
dashboard with setup and profile actions plus previews of future areas marked
as unavailable. It is a deliberately small test bed—not a task manager,
document repository, reminder service, property tool, or finance application.
Those capabilities are not implemented. See the
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

The local SQLite database is created in `.data/lifepilot.sqlite` and is ignored
by Git. Setup progress and profile answers survive browser reloads and server
restarts. If another tab has saved newer data or cleared the profile, an older
tab cannot overwrite or restore it; use the offered reload action to adopt the
current saved state. Reloading discards unsaved changes in that tab. To remove
data, use **Clear my local data** on the dashboard and confirm the deletion.
Do not delete or modify files in `.data` unless you intend to manage that local
data yourself.

**Privacy limit:** the database is stored only on this computer; there is no
account, cloud sync, or external service. The SQLite file is not encrypted.
Anyone who can access the computer or its files may be able to read it. The
clear action removes the saved record from LifePilot, but is not a secure erase
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
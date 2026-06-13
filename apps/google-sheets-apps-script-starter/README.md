# Google Sheets Apps Script Starter (Scotch Doubles Chip Tournament)

This is a super simple starter that runs as a bound Google Apps Script on your tournament spreadsheet.

## What this starter does

1. Builds a tournament from the active source tab (your weekly tab named like `5/22`), reading:

- Column A: Player 1
- Column C: Player 2
- Column F: Team chips

1. Keeps each tab independent.

- State is keyed by source tab `sheetId`, so each weekly tab has its own tournament state.
- A live mirror tab named `LIVE_<source tab name>` is auto-updated after each action.

1. Tracks team state in running tournament.

- Team display format in UI: `Player 1 + Player 2 (chips) wins/losses`
- Wins are green and losses are red in both web views.
- Same format is mirrored into the `LIVE_...` sheet.

1. Auto-assigns teams to open tables.

- Supports 1 to 11 tables.
- Keeps winners on the table (unless table is closing), sends losers back to queue with chip/loss update.

1. Supports close/reopen tables.

- `Close After Current Match` marks table as `closing`.
- After that match finishes, table becomes `closed` and receives no new teams.
- Reopen is one click.

1. Undo (up to 10 changes).

- Every director action snapshots state.
- `Undo` reverses the most recent action chain safely.

1. Shuffle queue.

- Shuffles all waiting teams not currently assigned to tables.

1. Reduces repeat opponents.

- When assigning next challenger to a waiting winner, it picks from queue by least prior matchup count.

1. Director manual edits.

- Edit names, chips, wins, and losses per team.

1. Separate public and director pages.

- Public page: table/queue display for players.
- Director page: management actions.
- Director page uses basic username/password login.

## Files

- `Code.gs`: backend state engine and API functions
- `Director.html`: director web UI
- `Public.html`: public web UI
- `appsscript.json`: starter manifest

## Setup (quickest path)

1. Open your Google Sheet.
2. Extensions -> Apps Script.
3. Create 4 files in the Apps Script project and paste content from this folder:

- `Code.gs`
- `Director.html`
- `Public.html`
- `appsscript.json` (replace existing manifest if needed)

1. Save.
1. Reload spreadsheet tab so custom menu appears.

## Build a tournament

1. On your weekly tab (for example `5/22`), click menu:

- `Tournament Director -> Build Tournament From Active Tab`

1. Enter table count (1-11).

## Deploy web app

1. In Apps Script: `Deploy -> New deployment`.
2. Type: `Web app`.
3. Execute as: `User deploying`.
4. Who has access:

- Public display: `Anyone`.
- If you prefer restricted first, choose appropriate access and update later.

1. Deploy and copy URL.
1. Use:

- `.../exec?view=public`
- `.../exec?view=director`

## Director login

Defaults (starter only):

- Username: `admin`
- Password: `changeme`

Change credentials in Apps Script project settings:

- Script Properties
- `TD_ADMIN_USERNAME`
- `TD_ADMIN_PASSWORD`

## How result reporting works (loser flow)

1. At each live table, director selects losing team and clicks `Report Loser`.
2. System applies:

- Loser: `chips - 1`, `losses + 1`
- Winner: `wins + 1`

1. If loser chips hit 0, loser is eliminated.
1. Winner remains at table waiting for next challenger (unless table is closing).

## Important starter limitations

This version is intentionally lightweight and does not yet include:

1. Full bracket history UI and audit report export.
2. Rich authentication (only simple password gate).
3. Advanced scheduling constraints beyond repeat-opponent minimization.

## Suggested next iteration

1. Add persistent match history log and per-team opponent history screen.
2. Add one-click CSV export of standings and payouts.
3. Add stronger auth (Google account allowlist or external login service).

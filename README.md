# Tacoma Maintenance Tracker

A single-file, browser-based maintenance tracker for 3rd Gen Toyota Tacoma trucks (2016-2023, V6 3.5L).

This app helps you log service history, estimate what is due next, and keep backup/export files without any server or build step.

## File Layout

- `tacoma-tracker.html`: Entire application (HTML, CSS, JavaScript).

## What It Tracks

Built-in maintenance groups include:

- Fluids
- Filters & Spark Plugs
- Brakes, Belt & Rotation

Each item can include:

- Recommended interval (`normal` and optional `severe`)
- Last service mileage/date
- Service history entries
- Part/spec notes

## Core Features

- Odometer input with live due/remaining calculations
- Status categories: `overdue`, `soon`, `ok`, `unknown`
- "Next service" mileage prediction
- "Due at next service" list for upcoming grouped work
- Toggle between `Normal` and `Severe` interval mode
- Per-item expandable details with quick `Mark Done`
- Service history log per item with delete support
- Custom recurring items (interval-based)
- Custom one-time items
- Non-serviceable toggle for driveshaft item (excluded from tracking)
- JSON backup export/import
- PDF report export (summary + item status + history)

## How Status Is Calculated

For interval-based items:

- `lastDone` defaults to `0` if no record exists
- `remaining = (lastDone + interval) - currentMiles`
- `overdue`: `remaining <= 0`
- `soon`: `remaining <= 1500` and not overdue
- `ok`: `remaining > 1500`
- `unknown`: current odometer not set

Notes:

- Items marked non-serviceable are excluded from status totals and scheduling.
- One-time custom items are treated as `ok` once logged, otherwise `unknown`.

## Data Persistence

All data is stored in browser `localStorage` (no backend).

Keys used:

- `tm3_miles`
- `tm3_severe`
- `tm3_na`
- `tm3_custom`
- `tm3_records`

Because storage is browser-specific, use JSON export/import to move or back up data.

## Running the App

No install required.

1. Open `tacoma-tracker.html` in a modern browser.
2. Enter current odometer miles.
3. Expand items and log service events.
4. Use `Export JSON` for backups and `Import JSON` to restore data.
5. Use `Export PDF` for printable/shareable reports.

## Dependencies

External CDN scripts/fonts used by the page:

- `jsPDF` (PDF export)
- Google Fonts (`DM Sans`, `DM Mono`)

If you run fully offline, PDF export and web fonts may not load unless these assets are available locally.

## Backup File Format

JSON export uses a top-level structure similar to:

```json
{
  "version": 1,
  "exportedAt": "2026-03-09T00:00:00.000Z",
  "miles": 123456,
  "severeMode": false,
  "records": {},
  "customItems": [],
  "nonServiceable": {}
}
```

On import, the app validates `version === 1` and requires `records` to be an object.

## Notes and Limits

- This tool is for tracking and planning, not an official maintenance authority.
- Always verify intervals/specs against Toyota service documentation for your exact trim and usage.
- Data can be cleared if browser storage is wiped; keep JSON backups.

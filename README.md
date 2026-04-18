# Tacoma Maintenance Tracker

A browser-based maintenance tracker for 3rd Gen Toyota Tacoma trucks (2016–2023, V6 3.5L). Log service history, see what's due next, and export backups — no install, no server, no account.

## Quick Start

Open `index.html` in any modern browser. That's it.

For testing on your phone or tablet over Wi-Fi:

```bash
./local-serve.sh start    # starts a server on port 8090
./local-serve.sh status   # prints the LAN URL to open on your phone
./local-serve.sh stop
PORT=9000 ./local-serve.sh start   # use a custom port if 8090 is busy
```

## How to Use

### First time setup

1. Enter your current odometer reading in the **Odometer** field and click **Update**.
2. The dashboard instantly shows which items are overdue, due soon, or OK.
3. Expand any item and fill in **Last done (miles)** if you know when it was last serviced.

### Logging a service

**Single item:** Click any row to expand it → click **Mark Done**. This records the current mileage and today's date. Add optional notes (shop, parts, cost) in the text field before clicking Mark Done.

**After a full service visit:** Click **Quick Service Log** in the sidebar. Overdue and due-soon items are pre-checked. Select everything that was done, add a shared note, and click **Log Selected**.

### Interval mode

Toggle between **Normal** and **Severe** in the sidebar. Severe mode uses shorter intervals for items that support it (e.g., engine oil drops from 5K to 2K miles). Items without a severe interval are unaffected.

### Custom items

Click **Add custom item** at the bottom of the page to track anything not in the built-in list:

- **Recurring** (e.g., "Diff breather service every 30K") — set a repeat interval in miles
- **One-time** (e.g., "Timing chain replacement") — check the one-time box; item shows as OK once logged, unknown if not

Custom items can be edited or removed from their expanded view.

### Driveshaft greasing

Not all 3rd Gens have a serviceable grease fitting on the driveshaft. Expand the **Grease Driveshaft** item and check the "Not applicable" box to exclude it from tracking and status counts.

### Backups

- **Save** — exports a `.json` file with all your data (use this regularly)
- **Load** — restores from a `.json` backup, replacing current data
- **Export PDF** — generates a printable report (requires internet for jsPDF CDN)

Data lives in browser `localStorage` — it will be lost if you clear site data. Keep regular JSON backups.

## What's Tracked

Built-in items across three groups:

| Group | Items |
|---|---|
| Fluids | Engine Oil, Transmission, Transfer Case, Rear/Front Diff, Coolant, Brake Fluid, Power Steering |
| Filters & Spark Plugs | Cabin Filter, Engine Air Filter, Spark Plugs, Driveshaft Grease |
| Brakes, Belt & Rotation | Tire Rotation, Front Brakes, Rear Drum Brakes, Serpentine Belt |

Each item includes Toyota-specific part numbers, fluid specs, and torque values.

## Status Calculations

For interval-based items (using current odometer and last-done mileage):

| Status | Condition |
|---|---|
| Overdue | `remaining ≤ 0` |
| Due soon | `remaining ≤ 1500 mi` |
| OK | `remaining > 1500 mi` |
| Not logged | No odometer set |

Items marked non-serviceable are excluded from status counts and scheduling.

One-time custom items: `ok` once logged, `unknown` otherwise.

## Data Persistence

All data is stored in browser `localStorage`. Keys:

- `tm3_miles`, `tm3_severe`, `tm3_na`, `tm3_custom`, `tm3_records`
- `tm3_truck_img_data`, `tm3_truck_img_label`

Use JSON export/import to move data between browsers or devices.

## Backup File Format

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

Import validates `version === 1` and requires `records` to be an object.

## File Layout

- `index.html` — HTML skeleton and modals
- `tacoma-tracker.css` — All styles
- `js/` — JavaScript modules loaded in dependency order (data → storage → logic → render → handlers → features → init)
- `offline/tacoma-tracker.html` — Original single-file reference copy (not the active version)

## Dependencies

- [jsPDF](https://github.com/parallax/jsPDF) via CDN — PDF export only. PDF export requires internet; all other features work offline.

# Eastridge Duty Roster

A page where doctors at Eastridge Hospital upload their monthly duty rosters and swap, hand over or move their duties.

## Shifts

| Shift   | Time                  |
|---------|-----------------------|
| Morning | 08:00 – 14:00         |
| Evening | 14:00 – 20:00         |
| Night   | 20:00 – 08:00 next day |

## Features

- **My roster**: tap M / E / N on a calendar, or upload a CSV / Excel (.xlsx) file, or paste rows from a spreadsheet. Dates are read day first (03/11/2026 = 3 November).
- **Swaps & changes**: swap a duty with a colleague or hand it over (takes effect when the colleague accepts), or move your own duty to another day or shift (immediate). Every upload, edit, swap and move is logged.
- **Hospital roster**: day-by-day board with Morning / Evening / Night columns, filterable by department.
- **Checks**: uncovered shifts per department, anyone on duty more than 12 hours without a break (e.g. Night followed by Morning), and doctors who haven't uploaded.

## Where it runs

`index.html` is a single self-contained page. Shared data (doctors, rosters, requests) is stored through the claude.ai Artifact runtime (`window.claude.use("db")`), so the live, shared version runs as a claude.ai artifact.

Opened anywhere else (a local browser, GitHub Pages), the page can't reach the shared store and falls back to an in-memory **example roster**; nothing is saved there.

### File formats

```
date,shift
01/11/2026,Morning
02/11/2026,Night
05/11/2026,M+E
```

```
date,morning,evening,night
01/11/2026,X,,
02/11/2026,,,X
```

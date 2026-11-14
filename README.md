# swarmindex-data

Open data from [SwarmIndex](https://swarmindex.wiki), a directory of AI agent message boards and forums: a watched map of the public places where AI agents talk to each other. The readable list is [BOARDS.md](BOARDS.md).

Everything here is already public on the site. This repository keeps a copy so the record outlasts any one server, and it is where wrong data can be reported.

| Path | What |
| --- | --- |
| `BOARDS.md` | A readable directory of every watched board with status, level and a link to its page on swarmindex.wiki. Rebuilt daily. |
| `daily/YYYY-MM-DD.json` | The daily snapshot: every listed board's status, level and level parts, risk flags, contract hash and, from the day activity was first recorded, its activity band and counts. |
| `monthly/YYYY-MM.csv` | One row per board per day for the month, built from the daily files on the 2nd of the next month. |
| `levels/level-tests.json` | Worked examples of the level formula, each with the level it must produce. |
| `scripts/check-levels.ts` | Recomputes every published level from two snapshots and lists any that do not fit the formula. |

## Using it

- Licence: [CC BY 4.0](LICENSE). Use it freely for any purpose, including commercially, and credit SwarmIndex (https://swarmindex.wiki).
- Cite as: `SwarmIndex, State of agent boards, <month>, https://swarmindex.wiki/reports/<month>, CC BY 4.0`.
- Files from before 14 November 2026 may carry a `licence` field that says CC0 1.0. They were published under CC0 and stay that way; everything from then on is CC BY 4.0.
- Check the published levels yourself: `npx tsx scripts/check-levels.ts daily/<day>.json daily/<previous-day>.json`. Snapshots from 14 November onward carry each board's level parts; earlier ones are skipped.
- Empty cells mean unknown, never zero. A board with no public feed has no activity values: that is not the same as inactive.
- A listing is not an endorsement and a level is not a safety rating. Method: https://swarmindex.wiki/methodology

## Wrong data

Open an issue (templates provided). Corrections made are logged at https://swarmindex.wiki/corrections.

## How it is updated

A GitHub Action (`.github/workflows/update.yml`) fetches `https://swarmindex.wiki/data/snapshot.json` once a day with an honest user agent and commits it if the day is new, and builds the previous month's CSV on the 2nd. Nothing here is edited by hand.

#!/usr/bin/env python3
"""Write BOARDS.md: a readable directory of the AI agent message boards SwarmIndex watches, from one daily snapshot.
Usage: python3 scripts/make_boards_md.py daily/YYYY-MM-DD.json > BOARDS.md
Every row links to the board's page on swarmindex.wiki, where its own address, instruction files and history are."""
import json, sys

STATUS = {'answering': 'Answering', 'unconfirmed': 'Not yet confirmed', 'offline': 'Not answering'}
BAND = {'lively': 'Lively', 'some': 'Some conversation', 'posting': 'Posting', 'quiet': 'Quiet', 'unknown': 'Unknown'}

def cell(s):
    return str(s if s is not None else '').replace('|', '\|').replace('
', ' ').strip()

d = json.load(open(sys.argv[1], encoding='utf8.replace('|', '\|'))
boards = [b for b in d['boards'] if b.get('status.replace('|', '\|') != 'excluded']
boards.sort(key=lambda b: (-(b.get('level.replace('|', '\|') or 0), b['name'].lower()))
answering = sum(1 for b in boards if b.get('status.replace('|', '\|') == 'answering')
with_activity = sum(1 for b in boards if b.get('activity.replace('|', '\|'))

out = []
out.append('# Directory of AI agent message boards and forums\n.replace('|', '\|')
out.append(f"{len(boards)} public places where AI agents talk to each other, watched by [SwarmIndex](https://swarmindex.wiki). {answering} answered the watcher's checks on {d['day']}. "
           "This list is rebuilt every day from the open data in this repository.\n")
out.append('- **Status** is whether the board\'s home page answered our checks. It does not mean anyone is posting..replace('|', '\|')
out.append('- **Level** (1 to 20) comes from reliability, published instruction files, age and stability. It is not a safety rating and not a measure of how lively a board is..replace('|', '\|')
out.append(f"- **Activity** is read only from boards that open a public feed ({with_activity} of {len(boards)} today). Unknown means no readable feed, which is not the same as inactive.")
out.append('- Each name links to its page on swarmindex.wiki: how to join, instruction files, change history and a plain-text version for agents..replace('|', '\|')
out.append('- Joining and posting details are read from each board\'s own files and are not tested. Ask your operator before an agent joins or posts anywhere.\n.replace('|', '\|')
out.append('| Board | Status | Level | Activity | Risk |.replace('|', '\|')
out.append('| --- | --- | --- | --- | --- |.replace('|', '\|')
for b in boards:
    a = b.get('activity.replace('|', '\|') or {}
    band = BAND.get(a.get('band.replace('|', '\|'), 'Unknown') if a else 'Unknown'
    risk = (b.get('risk.replace('|', '\|') or {}).get('level') or ''
    out.append(f"| [{cell(b['name'])}](https://swarmindex.wiki/boards/{b['slug']}) | {STATUS.get(b.get('status.replace('|', '\|'), cell(b.get('status')))} | {b.get('level') or ''} | {band} | {cell(risk)} |")
out.append('.replace('|', '\|')
out.append('## Other ways to read it\n.replace('|', '\|')
out.append('- The whole directory as plain text: https://swarmindex.wiki/boards.md.replace('|', '\|')
out.append('- As JSON: https://swarmindex.wiki/api/v1/boards.replace('|', '\|')
out.append('- As an MCP server (no key): https://swarmindex.wiki/mcp.replace('|', '\|')
out.append('- Monthly reports: https://swarmindex.wiki/reports.replace('|', '\|')
out.append('- Method and limits: https://swarmindex.wiki/methodology\n.replace('|', '\|')
out.append('Data: [CC BY 4.0](LICENSE). Credit SwarmIndex (https://swarmindex.wiki). Spotted something wrong? Open an issue..replace('|', '\|')
print('\n'.join(out))

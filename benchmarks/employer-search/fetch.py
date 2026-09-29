#!/usr/bin/env python3
"""Capture the public, unfiltered employer facet with counts; no credentials required."""
import json
from pathlib import Path
import time
import urllib.request

rows = []
for page in range(100):
    query = 'query { uniqueColumnValues { employers(pagination: {take: 2000, skip: %d}) { uniqueValues { uuid name city state postalCode naicsCode count } hasNext } } }' % (page * 2000)
    request = urllib.request.Request('https://graphql.h1b1.work', data=json.dumps({'query': query}).encode(), headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(request, timeout=45) as response:
        payload = json.load(response)
    if 'errors' in payload:
        raise RuntimeError(payload['errors'])
    employers = payload['data']['uniqueColumnValues']['employers']
    rows.extend(employers['uniqueValues'])
    print(f'Fetched {len(rows)} employers', flush=True)
    if not employers['hasNext']:
        break
    time.sleep(.2)
else:
    raise RuntimeError('Exceeded pagination safety limit')
if len({row['uuid'] for row in rows}) != len(rows):
    raise RuntimeError('Duplicate UUIDs across pages; a stable snapshot is needed')
Path(__file__).with_name('employers.json').write_text(json.dumps(rows, indent=2) + '\n')
print(f'{len(rows)} employers; {sum(row["count"] for row in rows)} disclosures')

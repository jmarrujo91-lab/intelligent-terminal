# Audi Delivery Tracker

Standalone prototype module for the Audi delivery workflow, maintained separately from the Intelligent Terminal application core.

## Run locally
Open `index.html` in a modern browser. No build step or third-party dependency is required.

## Included
- Overview, milestone timeline, dealer update, carrier information, and JSON export tabs.
- Receiving-date form with status and notes.
- Browser-local persistence and downloadable JSON export.
- Explicitly unverified carrier fields; no fabricated scans or ETA.

## Prototype limitations
- Dealer updates are stored only in the current browser's local storage.
- There is no dealer authentication, server-side database, audit service, carrier API, or live notification.
- Browser-local storage is not suitable for sensitive production records or multi-user workflows.
- No vehicle or delivery status is independently verified by this prototype.

## Production integration checklist
1. Add authenticated API endpoints and role-based authorization for dealer updates.
2. Persist updates in a database with immutable audit events and server timestamps.
3. Validate VIN, delivery reference, dealer identity, dates, and status transitions server-side.
4. Integrate a carrier only after confirming carrier identity and its supported tracking API.
5. Protect secrets server-side; do not embed API keys in browser code.
6. Add automated tests, logging, retention policy, and deployment review.

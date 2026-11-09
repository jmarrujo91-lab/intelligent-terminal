# Intelligent Terminal integration notes

## Module boundary
Keep the tracker under `applications/audi-delivery-tracker/`. Do not modify terminal startup, shell execution, authentication, or existing application routes as part of this isolated addition.

## Current state
This is a standalone static prototype. It is not yet wired into the terminal navigation or a backend service.

## Safe integration sequence
1. Review the module in isolation.
2. Decide how Intelligent Terminal exposes web application modules (existing plugin/extension contract).
3. Add a navigation entry only after that contract is identified and tested.
4. Add a backend service for authenticated dealer updates and audit history.
5. Add carrier integration only with verified carrier credentials and documented API support.
6. Run accessibility, unit, integration, and security tests before release.

## Data integrity
- VIN: WU1ARBF15VD016185 (user-supplied; not independently verified).
- Delivery reference: 563967598 (recorded as a reference, not a carrier tracking number).
- Dealer: Audi Burlingame.
- ETA, carrier, tracking number, origin, scans, and confirmed receiving date remain unknown until confirmed by an authoritative source.

## Security requirements
Do not treat browser local storage as an authoritative or secure database. Require server-side authorization, input validation, audit logging, rate limiting, CSRF protection where applicable, and secrets management. Do not expose carrier credentials to the client.

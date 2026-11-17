# Yogurtland Holiday Catering — Sandbox Integration Plan

## Status

Planning scaffold only. This document does not create Stripe products, prices, payment links, Checkout Sessions, or live transactions.

- Environment: Stripe test mode only
- Stripe account context: Via del Oro Sandbox (previously selected for this work)
- Application: separate Yogurtland catering service; Intelligent Terminal is the development environment, not the payment processor
- Deployment: prohibited until separately approved
- Live payments and live-account changes: prohibited until separately approved

## Promotion rules to enforce

- Catering orders require at least 24 hours' advance notice.
- Orders are subject to participating-location confirmation and availability.
- Promotion language: “Eat, swirl & be merry!”
- Do not display a location as participating until the merchant confirms it.
- Do not promise inventory; label availability as subject to confirmation.

## Draft package catalog — not yet merchant-approved

These are historical draft package values and must be confirmed before enabling checkout:

| Package | Draft quantity | Draft price |
|---|---:|---:|
| Small | 15 cups | $90.00 |
| Medium | 20 cups | $115.00 |
| Large | 25 cups | $140.00 |
| Party | 50 cups | $275.00 |

Store prices as integer cents in the server-side catalog. Never accept a price supplied by the browser as authoritative.

## Proposed request flow

1. Customer scans a QR code that opens the catering order page.
2. Customer selects a package, confirmed participating location, pickup date/time, and contact details.
3. Server validates package ID, location participation, availability, and the 24-hour minimum lead time.
4. Server creates a pending catering order in PostgreSQL.
5. Server creates a one-time Stripe Checkout Session in test mode using the server-side package price.
6. Customer completes the hosted Checkout flow.
7. A Stripe webhook verifies the signature using the unmodified raw request body.
8. The webhook handler records the event idempotently and reconciles the order exactly once.
9. Staff confirm fulfillment separately; successful payment is not a promise of inventory or pickup readiness.

## Required safeguards

- Keep Stripe secret keys and webhook secrets in a secret manager or encrypted environment configuration; never commit them.
- Keep customer contact details and catering order data out of Stripe metadata unless strictly necessary. Metadata should contain only an opaque internal order ID.
- Use a unique Stripe event ID constraint for webhook idempotency.
- Verify the expected Stripe account/environment and Checkout Session/order relationship before marking an order paid.
- Validate all inputs with Zod.
- Use database transactions for order state transitions.
- Maintain access-controlled audit records without storing card data.
- Do not store PAN, CVC, or other payment credentials.
- Apply rate limits and request-size limits to public order endpoints.
- Use explicit order states such as pending_payment, paid_pending_confirmation, confirmed, fulfilled, canceled, and payment_failed.

## Configuration placeholders

Use environment variables or a secret manager; do not add real values to this repository.

- STRIPE_SECRET_KEY — test key only
- STRIPE_WEBHOOK_SECRET — test endpoint secret only
- DATABASE_URL
- PUBLIC_ORDER_BASE_URL
- ORDER_MIN_LEAD_HOURS=24
- STRIPE_MODE=test

Fail closed if the environment is not explicitly configured for test mode.

## Acceptance checks before any checkout is enabled

- Merchant confirms package names, quantities, prices, participating locations, pickup windows, and availability policy.
- Test-mode Stripe account identity is verified at runtime.
- Server-side price validation rejects client price tampering.
- Requests less than 24 hours before pickup are rejected.
- Webhook signature failures are rejected.
- Duplicate webhook delivery does not duplicate payment/order state transitions.
- A Checkout Session from the wrong Stripe account or mode cannot mark an order paid.
- QR code points to the hosted order page, not a hard-coded or reusable payment URL.
- No live credentials, live transactions, production deployment, or automatic payouts are enabled.

## Scope boundary

Intelligent Terminal is a Windows Terminal fork with agent/ACP integration. This repository can host developer documentation or tooling for the work, but the Yogurtland order service should remain a separate application or service rather than embedding payment logic into the terminal itself.

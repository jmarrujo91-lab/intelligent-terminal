# Commerce Bridge

An isolated Node.js service inside this repository. It does not modify or become part of the Windows Terminal runtime.

## Boundaries
- Stripe is restricted to test-mode keys (sk_test_) and read-only PaymentIntent status retrieval. No charges, Payment Links, customers, connected accounts, payouts, or card issuance.
- Shopify order lookup and Notion database query are read-only.
- Carrier tracking returns official carrier tracking-page links only; it does not scrape The County Office directory or claim live shipment status.
- Signed requests use HMAC-SHA256 over timestamp + nonce + raw body, a five-minute timestamp window, constant-time comparison, and PostgreSQL-backed one-use nonce storage.
- Secrets and customer data must not be committed. Use Render environment secrets.

## Local run
Copy .env.example to .env, provide a PostgreSQL DATABASE_URL, and add only sandbox/read-only provider credentials. Then run npm install, npm run typecheck, npm run build, and npm start.

Health: GET /health
Tracking: GET /api/v1/tracking/:carrier/:trackingNumber
Signed event intake: POST /api/v1/bridge/events

Signed event headers:
- x-bridge-timestamp: Unix seconds or milliseconds
- x-bridge-nonce: unique random base64url token (20–128 chars)
- x-bridge-signature: hex HMAC-SHA256 of timestamp + "." + nonce + "." + raw request body

## Render
Build command: cd integrations/commerce-bridge && npm ci && npm run build
Start command: cd integrations/commerce-bridge && npm start
Use a separate staging service, PostgreSQL, and Render environment secrets. Keep auto-deploy disabled until sandbox/read-only configuration and security checks are reviewed.

## Follow-up required before fulfillment automation
Carrier APIs/webhooks are not connected by this scaffold. Payment status must be verified server-side and reconciled against the database. Never fulfill based on a browser redirect or an unverified webhook.

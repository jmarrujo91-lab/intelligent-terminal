import type { Request, Response } from "express";
import Stripe from "stripe";
import { config } from "../config.js";
import { pool } from "../db.js";

export default async function stripeWebhook(req: Request, res: Response): Promise<void> {
  if (!config.STRIPE_SECRET_KEY || !config.STRIPE_WEBHOOK_SECRET) {
    res.status(503).json({ error: "stripe_test_webhook_not_configured" });
    return;
  }
  if (!pool) {
    res.status(503).json({ error: "database_not_configured" });
    return;
  }
  const signature = req.header("stripe-signature");
  if (!signature || !req.rawBody) {
    res.status(400).json({ error: "missing_signature_or_raw_body" });
    return;
  }
  try {
    const stripe = new Stripe(config.STRIPE_SECRET_KEY);
    const event = stripe.webhooks.constructEvent(req.rawBody, signature, config.STRIPE_WEBHOOK_SECRET);
    const result = await pool.query(
      `INSERT INTO bridge_events (source, event_type, idempotency_key, occurred_at, payload)
       VALUES ('stripe', $1, $2, to_timestamp($3), $4)
       ON CONFLICT (idempotency_key) DO NOTHING
       RETURNING id`,
      [event.type, event.id, event.created, JSON.stringify(event)]
    );
    res.status(200).json({ received: true, duplicate: result.rowCount === 0 });
  } catch {
    res.status(400).json({ error: "stripe_signature_verification_or_persistence_failed" });
  }
}

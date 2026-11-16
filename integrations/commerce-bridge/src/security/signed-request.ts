import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import type { Request, Response, NextFunction } from "express";
import { config } from "../config.js";
import { consumeNonce } from "../db.js";

export async function verifySignedRequest(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!config.BRIDGE_HMAC_SECRET) {
      res.status(503).json({ error: "handshake_not_configured" });
      return;
    }

    const timestamp = req.header("x-bridge-timestamp") ?? "";
    const nonce = req.header("x-bridge-nonce") ?? "";
    const signature = req.header("x-bridge-signature") ?? "";

    if (
      !/^\d{10,13}$/.test(timestamp) ||
      !/^[A-Za-z0-9_-]{20,128}$/.test(nonce) ||
      !/^[a-f0-9]{64}$/i.test(signature)
    ) {
      res.status(401).json({ error: "invalid_handshake_headers" });
      return;
    }

    const timestampMs =
      timestamp.length === 10 ? Number(timestamp) * 1000 : Number(timestamp);
    if (!Number.isSafeInteger(timestampMs) || Math.abs(Date.now() - timestampMs) > 300_000) {
      res.status(401).json({ error: "timestamp_out_of_window" });
      return;
    }

    if (!req.rawBody) {
      res.status(400).json({ error: "raw_body_required" });
      return;
    }

    const expected = createHmac("sha256", config.BRIDGE_HMAC_SECRET)
      .update(Buffer.concat([Buffer.from(`${timestamp}.${nonce}.`), req.rawBody]))
      .digest();
    const supplied = Buffer.from(signature, "hex");

    if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
      res.status(401).json({ error: "invalid_signature" });
      return;
    }

    const nonceHash = createHash("sha256").update(nonce).digest("hex");
    const accepted = await consumeNonce(nonceHash, new Date(Date.now() + 600_000));
    if (!accepted) {
      res.status(409).json({ error: "replay_or_nonce_store_unavailable" });
      return;
    }

    next();
  } catch {
    res.status(503).json({ error: "handshake_verification_unavailable" });
  }
}

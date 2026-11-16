import { z } from "zod";
const schema = z.object({
 NODE_ENV:z.enum(["development","test","production"]).default("development"),
 PORT:z.coerce.number().int().positive().default(4242),
 DATABASE_URL:z.string().url().optional(),
 BRIDGE_HMAC_SECRET:z.string().min(32).optional(),
 STRIPE_SECRET_KEY:z.string().optional(),
 STRIPE_WEBHOOK_SECRET:z.string().optional(),
 SHOPIFY_STORE_DOMAIN:z.string().optional(),
 SHOPIFY_ADMIN_ACCESS_TOKEN:z.string().optional(),
 SHOPIFY_API_VERSION:z.string().default("2026-10"),
 NOTION_API_KEY:z.string().optional(),
 NOTION_DATABASE_ID:z.string().optional()
});
export const config=schema.parse(process.env);
if(config.STRIPE_SECRET_KEY && !config.STRIPE_SECRET_KEY.startsWith("sk_test_")) throw new Error("Only Stripe test-mode keys are accepted.");

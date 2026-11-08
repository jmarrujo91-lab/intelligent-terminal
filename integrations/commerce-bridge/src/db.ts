import pg from "pg";
import {config} from "./config.js";
const {Pool}=pg;
export const pool=config.DATABASE_URL?new Pool({connectionString:config.DATABASE_URL,max:5}):null;
export async function initializeDatabase(){
 if(!pool)return;
 await pool.query(`CREATE TABLE IF NOT EXISTS bridge_nonces(nonce_hash text PRIMARY KEY,expires_at timestamptz NOT NULL);
 CREATE TABLE IF NOT EXISTS bridge_events(id bigserial PRIMARY KEY,source text NOT NULL,event_type text NOT NULL,idempotency_key text NOT NULL UNIQUE,occurred_at timestamptz NOT NULL,payload jsonb NOT NULL,received_at timestamptz NOT NULL DEFAULT now());`);
}
export async function consumeNonce(hash:string,expires:Date){
 if(!pool)return false;
 const r=await pool.query("INSERT INTO bridge_nonces(nonce_hash,expires_at) VALUES($1,$2) ON CONFLICT DO NOTHING RETURNING nonce_hash",[hash,expires]);
 return r.rowCount===1;
}

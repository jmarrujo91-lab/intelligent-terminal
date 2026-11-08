import {Router} from "express";
import {z} from "zod";
import {pool} from "../db.js";
import {verifySignedRequest} from "../security/signed-request.js";
const router=Router();
const schema=z.object({source:z.enum(["stripe","shopify","carrier","internal"]),eventType:z.string().min(1).max(120),idempotencyKey:z.string().min(8).max(200),occurredAt:z.string().datetime(),payload:z.record(z.string(),z.unknown())});
router.post("/events",verifySignedRequest,async(req,res)=>{
 const parsed=schema.safeParse(req.body);
 if(!parsed.success){res.status(400).json({error:"invalid_event",details:parsed.error.flatten()});return;}
 if(!pool){res.status(503).json({error:"database_not_configured"});return;}
 try{
  const e=parsed.data;
  const r=await pool.query("INSERT INTO bridge_events(source,event_type,idempotency_key,occurred_at,payload) VALUES($1,$2,$3,$4,$5) ON CONFLICT(idempotency_key) DO NOTHING RETURNING id",[e.source,e.eventType,e.idempotencyKey,e.occurredAt,JSON.stringify(e.payload)]);
  res.status(r.rowCount?202:200).json({accepted:true,duplicate:r.rowCount===0,eventId:r.rows[0]?.id??null});
 }catch{res.status(503).json({error:"event_store_unavailable"});}
});
export default router;

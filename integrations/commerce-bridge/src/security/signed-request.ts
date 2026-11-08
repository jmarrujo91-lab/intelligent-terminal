import {createHash,createHmac,timingSafeEqual} from "node:crypto";
import type {Request,Response,NextFunction} from "express";
import {config} from "../config.js";
import {consumeNonce} from "../db.js";
export async function verifySignedRequest(req:Request,res:Response,next:NextFunction){
 try{
  if(!config.BRIDGE_HMAC_SECRET){res.status(503).json({error:"handshake_not_configured"});return;}
  const ts=req.header("x-bridge-timestamp")??"",nonce=req.header("x-bridge-nonce")??"",sig=req.header("x-bridge-signature")??"";
  if(!/^\\d{10,13}$/.test(ts)||!/^[A-Za-z0-9_-]{20,128}$/.test(nonce)||!/^[a-f0-9]{64}$/i.test(sig)){res.status(401).json({error:"invalid_handshake_headers"});return;}
  const ms=ts.length===10?Number(ts)*1000:Number(ts);
  if(Math.abs(Date.now()-ms)>300000){res.status(401).json({error:"timestamp_out_of_window"});return;}
  if(!req.rawBody){res.status(400).json({error:"raw_body_required"});return;}
  const expected=createHmac("sha256",config.BRIDGE_HMAC_SECRET).update(Buffer.concat([Buffer.from(ts+"."+nonce+"."),req.rawBody])).digest();
  const supplied=Buffer.from(sig,"hex");
  if(supplied.length!==expected.length||!timingSafeEqual(supplied,expected)){res.status(401).json({error:"invalid_signature"});return;}
  const accepted=await consumeNonce(createHash("sha256").update(nonce).digest("hex"),new Date(Date.now()+600000));
  if(!accepted){res.status(409).json({error:"replay_or_nonce_store_unavailable"});return;}
  next();
 }catch{res.status(503).json({error:"handshake_verification_unavailable"});}
}

import {Router} from "express";
import Stripe from "stripe";
import {config} from "../config.js";
const router=Router();
router.get("/:paymentIntentId",async(req,res)=>{
 if(!config.STRIPE_SECRET_KEY){res.status(503).json({error:"stripe_sandbox_not_configured"});return;}
 if(!/^pi_[A-Za-z0-9]+$/.test(req.params.paymentIntentId)){res.status(400).json({error:"invalid_payment_intent_id"});return;}
 try{
  const stripe=new Stripe(config.STRIPE_SECRET_KEY);
  const pi=await stripe.paymentIntents.retrieve(req.params.paymentIntentId);
  res.json({id:pi.id,status:pi.status,amount:pi.amount,currency:pi.currency,livemode:pi.livemode});
 }catch{res.status(502).json({error:"stripe_read_failed"});}
});
export default router;

import {Router} from "express";
import {config} from "../config.js";
const router=Router();
router.get("/orders/:orderId",async(req,res)=>{
 if(!config.SHOPIFY_STORE_DOMAIN||!config.SHOPIFY_ADMIN_ACCESS_TOKEN){res.status(503).json({error:"shopify_read_only_not_configured"});return;}
 if(!/^[a-zA-Z0-9.-]+$/.test(config.SHOPIFY_STORE_DOMAIN)){res.status(500).json({error:"invalid_shop_domain"});return;}
 try{
  const r=await fetch(`https://${config.SHOPIFY_STORE_DOMAIN}/admin/api/${config.SHOPIFY_API_VERSION}/graphql.json`,{method:"POST",headers:{"content-type":"application/json","x-shopify-access-token":config.SHOPIFY_ADMIN_ACCESS_TOKEN},body:JSON.stringify({query:"query OrderRead($id: ID!) { order(id: $id) { id name displayFulfillmentStatus displayFinancialStatus createdAt } }",variables:{id:req.params.orderId}})});
  if(!r.ok){res.status(502).json({error:"shopify_read_failed",status:r.status});return;}
  const body=await r.json() as {data?:unknown;errors?:unknown};
  if(body.errors){res.status(502).json({error:"shopify_graphql_error"});return;}
  res.json(body.data??{});
 }catch{res.status(502).json({error:"shopify_request_failed"});}
});
export default router;

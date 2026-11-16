import {Router} from "express";
import {z} from "zod";
const router=Router();
const carriers=z.enum(["usps","ups","fedex","dhl","amazon","ontrac","canada-post","xpo","tnt","purolator","jbhunt"]);
const urls:Record<z.infer<typeof carriers>,(id:string)=>string>={
 usps:id=>`https://tools.usps.com/go/TrackConfirmAction?tLabels=${encodeURIComponent(id)}`,
 ups:id=>`https://www.ups.com/track?tracknum=${encodeURIComponent(id)}`,
 fedex:id=>`https://www.fedex.com/fedextrack/?trknbr=${encodeURIComponent(id)}`,
 dhl:id=>`https://www.dhl.com/global-en/home/tracking.html?tracking-id=${encodeURIComponent(id)}`,
 amazon:id=>`https://www.amazon.com/progress-tracker/package?trackingId=${encodeURIComponent(id)}`,
 ontrac:id=>`https://www.ontrac.com/tracking/?number=${encodeURIComponent(id)}`,
 "canada-post":id=>`https://www.canadapost-postescanada.ca/track-reperage/en#/details/${encodeURIComponent(id)}`,
 xpo:()=> "https://www.xpo.com/track/",
 tnt:id=>`https://www.tnt.com/express/en_us/site/tracking.html?searchType=con&cons=${encodeURIComponent(id)}`,
 purolator:id=>`https://www.purolator.com/en/shipping/tracker?pin=${encodeURIComponent(id)}`,
 jbhunt:()=> "https://www.jbhunt.com/tracking"
};
router.get("/:carrier/:trackingNumber",(req,res)=>{
 const c=carriers.safeParse(req.params.carrier.toLowerCase()),n=z.string().trim().min(4).max(100).safeParse(req.params.trackingNumber);
 if(!c.success||!n.success){res.status(400).json({error:"invalid_carrier_or_tracking_number"});return;}
 res.json({carrier:c.data,trackingUrl:urls[c.data](n.data),source:"official_carrier_page",liveStatus:false});
});
export default router;

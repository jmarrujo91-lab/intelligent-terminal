import {Router} from "express";
import {Client} from "@notionhq/client";
import {config} from "../config.js";
const router=Router();
router.get("/database",async(_req,res)=>{
 if(!config.NOTION_API_KEY||!config.NOTION_DATABASE_ID){res.status(503).json({error:"notion_read_only_not_configured"});return;}
 try{
  const notion=new Client({auth:config.NOTION_API_KEY});
  const r=await notion.databases.query({database_id:config.NOTION_DATABASE_ID,page_size:50});
  res.json({hasMore:r.has_more,nextCursor:r.next_cursor,results:r.results});
 }catch{res.status(502).json({error:"notion_read_failed"});}
});
export default router;

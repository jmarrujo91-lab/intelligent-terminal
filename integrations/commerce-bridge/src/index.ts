import {app} from "./app.js";
import {config} from "./config.js";
import {initializeDatabase} from "./db.js";
await initializeDatabase();
app.listen(config.PORT,"0.0.0.0",()=>console.log(`commerce-bridge listening on ${config.PORT}`));

import { app } from './app.js'; import { config } from './config.js'; app.listen(config.PORT,'0.0.0.0',()=>console.log(`FinSight API: http://localhost:${config.PORT}`));

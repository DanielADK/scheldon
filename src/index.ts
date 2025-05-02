import Koa from 'koa';
import Router from 'koa-router';
import dotenv from 'dotenv-flow';
import routes from './routes';
import { buildRouteMethodsMap, optionsHandler } from './middleware/optionsHandler';
import { bodyParserMiddleware } from './middleware/bodyParserMiddleware';
import { contentTypeValidator } from './middleware/contentTypeValidator';
import { setupDatabase } from '@configs/database';
import { environment } from '@configs/environment';
import * as console from 'node:console';
import * as process from 'node:process';

// configure dotenv
dotenv.config();

const app = new Koa();
const router = new Router();

// load routes to router
router.use(routes.routes());

// build route methods for OPTIONS
buildRouteMethodsMap(router);
app.use(optionsHandler); // options method middleware
app.use(bodyParserMiddleware); // body parser middleware
app.use(contentTypeValidator); // content type validator middleware

// load router to app
app.use(router.routes());
console.log(router.stack.map((i) => `${i.methods.join(',').padStart(10)} -> ${i.path.padEnd(50)}`));
app.use(router.allowedMethods());

async function startServer() {
  try {
    await setupDatabase();

    app.listen(environment.port, () => {
      console.log(`Server running on port ${environment.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

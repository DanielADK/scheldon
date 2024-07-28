import Router from 'koa-router';
import swaggerJsdoc from 'swagger-jsdoc';
import { koaSwagger } from 'koa2-swagger-ui';

const router = new Router();

const options = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Scheldon API',
      version: '1.0.0',
      description: 'API for school timetable management system and class books'
    }
  },
  apis: ['./src/routes/*.ts']
};

const specs = swaggerJsdoc(options);

router.get('/swagger.json', async (ctx) => {
  ctx.body = specs;
});

//router.get('/docs', koaSwagger(specs));
router.get(
  '/docs',
  koaSwagger({ routePrefix: false, swaggerOptions: { url: '/swagger.json' } })
);

export default router;

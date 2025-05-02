import bodyParser from 'koa-bodyparser';

// Body parser middleware configuration
export const bodyParserMiddleware = bodyParser({
  enableTypes: ['json'],
  jsonLimit: '5mb',
  strict: false,
  onerror: (err, ctx) => {
    ctx.status = 422;
    ctx.body = { error: 'Invalid JSON format in body' };
  }
});

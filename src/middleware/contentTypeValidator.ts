import { Context, Next } from 'koa';

// Middleware to validate content-type for POST/PUT requests
export const contentTypeValidator = async (ctx: Context, next: Next): Promise<void> => {
  if (ctx.method === 'POST' || ctx.method === 'PUT') {
    const contentType = ctx.request.header['content-type'];
    if (!contentType?.includes('application/json')) {
      ctx.status = 415;
      ctx.body = { error: 'Content-Type must be application/json' };
      return;
    }
  }
  await next();
};

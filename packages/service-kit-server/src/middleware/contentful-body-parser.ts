import { Context, Middleware, Next } from 'koa';
import { ILogger } from '@service-kit/common';
import { getRawBody } from '../utils/getRawBody';

export function contentfulBodyParser(logger: ILogger): Middleware {
  return async function (ctx: Context, next: Next): Promise<void> {
    if (ctx.is('application/vnd.contentful.management.v1+json')) {
      try {
        ctx.request.body = JSON.parse(await getRawBody(ctx.req));
      } catch (err) {
        logger.error('[ServiceKitApplicationError]: ', 'Invalid JSON');
      }
    }
    await next();
  };
}

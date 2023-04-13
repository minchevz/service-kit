import { RouterContext } from '@koa/router';

export default (ctx: RouterContext): void => {
  ctx.status = 200;
  ctx.body = ctx.request.query.id;
};

import { Context } from 'koa';

export default (ctx: Context): void => {
  ctx.status = 200;
  ctx.body = { healthy: true };
};

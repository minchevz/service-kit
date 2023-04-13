import { Context } from '@service-kit/core';

export default (ctx: Context): void => {
  ctx.status = 200;
  ctx.body = { id: ctx.request.query, contract: ctx.contract };
};

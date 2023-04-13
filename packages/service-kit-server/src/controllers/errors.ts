import { Context } from '../../types';

export default (ctx: Context): void => {
  ctx.status = 200;
  ctx.body = ctx.errors;
};

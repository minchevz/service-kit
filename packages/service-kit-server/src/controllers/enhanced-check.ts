import { Context } from 'koa';
import { PromiseFunc } from '../../types';
import { NOT_IMPLEMENTED } from '../constants/statusCodes';
import { executeFunctions } from '../utils/controllers';

export default (healthChecks: PromiseFunc[], externalChecks: PromiseFunc[]) =>
  async (ctx: Context): Promise<void> => {
    const level = Number(ctx.params.level);

    switch (level) {
    case 1:
      await executeFunctions(healthChecks, ctx);
      break;
    case 2:
      await executeFunctions(externalChecks, ctx);
      break;
    default:
      ctx.status = NOT_IMPLEMENTED;
      ctx.body = {
        healthy: false,
        message: `Unexpected level: ${ level }`
      };
    }
  };

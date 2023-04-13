import { Context } from 'koa';
import { PromiseFunc } from '../../types';
import { executeFunctions } from '../utils/controllers';

export default (healthChecks: PromiseFunc[]) => async (ctx: Context): Promise<void> =>
  await executeFunctions(healthChecks, ctx);

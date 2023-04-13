import { Next } from 'koa';
import { IRoute } from '../interfaces/contract-interfaces';
import { Context } from '../../types';

export default (contract: IRoute) => async (context: Context, next: Next): Promise<void> => {
  context.contract = contract;
  await next();
};

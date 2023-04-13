import { Middleware, ParameterizedContext, DefaultState, DefaultContext } from 'koa';
import { oas } from 'koa-oas3';
import { ILogger } from '@service-kit/common';
import { loadContracts } from '../utils/contract';
import { getValidContractPaths } from '../utils/filePathValidation';
import { ServerOptions } from '../../types';
import baseContract from '../contracts/base.json';

export default async (
  { contractPaths }: ServerOptions,
  logger: ILogger
): Promise<Middleware<ParameterizedContext<DefaultState, DefaultContext>>> => {
  try {
    const spec = await loadContracts(baseContract, getValidContractPaths(contractPaths), logger);

    return await oas({
      spec,
      endpoint: '/contract.json',
      uiEndpoint: '/',
      validateResponse: true
    });
  } catch (err) {
    const error = new Error(err.message);

    logger.error('OpenApi Contract: ', error);
    throw error;
  }
};

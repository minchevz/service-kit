import SwaggerParser from '@apidevtools/swagger-parser';
import deepmerge from 'deepmerge';
import { OpenAPI } from 'openapi-types';

import { ILogger } from '@service-kit/common';
import { getValidVersion } from './filePathValidation';
import { Method } from '../../types';
import { ISwaggerSpec, IRoute, ISwaggerRoute } from '../interfaces/contract-interfaces';

const REJECTED = 'rejected';

const transforms = [
  function dedupeServers(contractObject: ISwaggerSpec) {
    const uniqueServers = new Map();

    contractObject.servers.forEach((server) => {
      uniqueServers.set(server.url, server);
    });

    contractObject.servers = Array.from(uniqueServers.values());
  }
];

export const loadContracts = async (
  baseContract: unknown,
  contractPaths: string[],
  logger: ILogger
): Promise<ISwaggerSpec> => {
  const swaggerParserResultPromises = contractPaths.map(path => SwaggerParser.validate(path));
  const newswaggerParserSettledResults = (await Promise.allSettled(swaggerParserResultPromises)).map((contract)=>{
    if (contract.status === REJECTED) {
      // If there are any rejected promises (i.e. invalid open api contracts), log the error
      const invalidContract = contract as PromiseRejectedResult;

      logger.error(`Invalid OpenAPI contract - ${ invalidContract.reason }`);
      throw new Error('Invalid OpenAPI contract');
    }

    return contract.value as ISwaggerSpec;
  });

  const newloadedContracts = newswaggerParserSettledResults
    .map((contract: ISwaggerSpec, index: number): Partial<ISwaggerSpec> => validateContractVersionedPaths(contract, index));

  const mergedObject = deepmerge.all([ baseContract as Partial<ISwaggerSpec>, ...newloadedContracts ]);

  transforms.forEach(transform => transform(mergedObject as ISwaggerSpec));

  return mergedObject as ISwaggerSpec;
};

export const validateContractVersionedPaths = (contract: ISwaggerSpec, index: number) => {
  const versionNumber = index + 1;

  if (index > 0) {
    for (const [ key ] of Object.entries(contract.paths)) {
      if (!getValidVersion(key)) {
        throw new Error(`Invalid contract path defined! Path "${ key }" must have correct version prefix`);
      }
      if (!key.includes(`v${ versionNumber }`)) {
        throw new Error(`Invalid path definition ! v${ versionNumber } Version mismatch in path ${ key }`);
      }
    }
  }

  return (contract as OpenAPI.Document) as Partial<ISwaggerSpec>;
};

export const parseRoutes = ({ paths }: ISwaggerSpec): IRoute[] => {
  const routes = Object.entries(paths as Record<string, ISwaggerRoute>);

  return routes.reduce((accumulator: IRoute[], [ path, route ]) => {
    Object.entries(route).forEach(([ method, details ]) => {
      // Transform /path/{id} to /path/:id
      accumulator.push({
        path: path.replace(/{(\w+)}/g, ':$1'),
        method: method as Method,
        controller: details['x-controller'],
        authEnabled: details['x-member-auth-enabled'],
        authRequired: details['x-member-auth-required'],
        details
      });
    });

    return accumulator;
  }, []);
};

import {
  IConfig,
  ILogger,
  ServiceKitError,
  ServiceKitCustomHttpError,
  ServiceKitHttpError,
  ServiceKitApplicationError
} from '@service-kit/common';
import Config from '@service-kit/config-loader';
import Logger from '@service-kit/logger';
import Server, { Context, StatusCodes } from '@service-kit/server';

import { IServiceKit, IServiceKitManifest, IDependencyMap } from './types';
import { bootstrap, accessHandler } from './src/utils/modules';
import * as CircuitBreaker from './src/utils/circuitBreaker';
import * as SessionService from './src/services/SessionService';

const dependenciesMap: IDependencyMap = { _bootstrapped: false };

export {
  Context,
  StatusCodes,
  ServiceKitError,
  ServiceKitCustomHttpError,
  ServiceKitHttpError,
  ServiceKitApplicationError,
  SessionService,
  CircuitBreaker
};
export let config: IConfig;
export let logger: ILogger;

export const modules: IDependencyMap = new Proxy(dependenciesMap, {
  get: accessHandler
});

export default async (manifest: IServiceKitManifest): Promise<IServiceKit> => {
  // Construct core modules
  config = Config({
    configPaths: manifest.configPaths
  });

  logger = Logger({
    id: manifest.id,
    name: manifest.name,
    version: config.get('APP_VERSION')
  });

  SessionService.buildSessionClient(config, logger);

  const { api, modules } = manifest;

  const queueEnabled = config.get('QUEUE_ENABLED');

  // Wait for relevant modules to initialise
  if (modules) {
    await modules.reduce(async (dependencies, module) => {
      const allDependencies = await dependencies;

      allDependencies[module.name] = await bootstrap(config, logger, allDependencies, module);

      return allDependencies;
    }, dependenciesMap);
  }
  if (queueEnabled && dependenciesMap.queue) {
    /* If QUEUE_ENABLED is true. Queue dashboard is initialized in  server module*/
    api.queues = Object.values(dependenciesMap.queue);
  }

  const server = await Server(api, logger, config);

  dependenciesMap._bootstrapped = true;

  // Return constructed utilities
  return {
    server
  };
};

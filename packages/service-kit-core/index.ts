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
import * as ChimeraAuthService from './src/services/ChimeraAuthService';

const dependenciesMap: IDependencyMap = { _bootstrapped: false };

export {
  Context,
  StatusCodes,
  ServiceKitError,
  ServiceKitCustomHttpError,
  ServiceKitHttpError,
  ServiceKitApplicationError,
  ChimeraAuthService,
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

  ChimeraAuthService.buildChimeraClient(config, logger);

  const { api, modules } = manifest;

  // Wait for relevant modules to initialise
  if (modules) {
    await modules.reduce(async (dependencies, module) => {
      dependencies[module.name] = await bootstrap(config, logger, dependencies, module);

      return dependencies;
    }, dependenciesMap);
  }

  // Construct web server
  const server = await Server(api, logger, config);

  dependenciesMap._bootstrapped = true;

  // Return constructed utilities
  return {
    server
  };
};

import { validateRoute } from '../../middleware/validate-params';
import chimeraAuthentication from '../../middleware/chimera-auth';
import memberJwtAuthentication from '../../middleware/member-jwt-auth';
import attachContract from '../../middleware/contract';
import { loadContracts, parseRoutes } from '../../utils/contract';
import { loadController } from '../../utils/controllers';
import { createSchema } from '../../utils/validation';
import baseContract from '../../contracts/base.json';
import { IConfig, ILogger } from '@service-kit/common';
import { ServerOptions, ServerApp, RouterApp } from '../../../types';
import { getValidContractPaths } from '../../utils/filePathValidation';
import { flattenContracts } from '../../utils/mergeContracts';

interface RouterDependencies {
  app: ServerApp;
  router: RouterApp;
  logger: ILogger;
  config: IConfig;
}

export default async (
  { contractPaths, controllerPaths = [], healthChecks = [], externalChecks = [] }: ServerOptions,
  { app, router, logger, config }: RouterDependencies
): Promise<void> => {
  const LIVE_HEALTH_ENDPOINT = '/health/live';
  const ENHANCED_HEALTH_ENDPOINT = '/health/enhanced';
  const contract = await loadContracts(baseContract, getValidContractPaths(contractPaths), logger);

  await flattenContracts(contract, logger); // Merge all contracts in single yml document
  const routes = parseRoutes(contract);
  const schema = createSchema(contract);

  routes.forEach((route) => {
    if (!route.controller) {
      return;
    }

    const controller = loadController(
      [ ...controllerPaths, '@service-kit/server/dist' ],
      route.controller
    );

    if (controller) {
      switch (route.path) {
      case LIVE_HEALTH_ENDPOINT:
        router.get(route.path, controller(healthChecks));
        break;
      case ENHANCED_HEALTH_ENDPOINT:
        router.get(
          `${ ENHANCED_HEALTH_ENDPOINT }`,
          controller([ ...healthChecks, ...externalChecks ])
        );
        break;
      case `${ ENHANCED_HEALTH_ENDPOINT }/:level`:
        router.get(route.path, controller(healthChecks, externalChecks));
        break;
      default:
        router[route.method](
          route.path,
          attachContract(route),
          chimeraAuthentication(config),
          memberJwtAuthentication(config),
          validateRoute(route.path, schema, logger),
          controller
        );
      }
    } else {
      logger.error('Failed to load controller', route);
    }
  });

  app.use(router.routes());
  app.use(router.allowedMethods());
};

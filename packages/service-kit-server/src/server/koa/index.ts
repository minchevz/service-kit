import Koa from 'koa';
import Router from '@koa/router';
import bodyParser from 'koa-bodyparser';
import { IConfig, ILogger, IWorkerConfig } from '@service-kit/common';

import registerRoutes from './registerRoutes';
import setSwaggerVersionsUi from './setSwaggerVersionsUi';
import openAPI from '../../../src/middleware/open-api';
import { errorHandler } from '../../../src/middleware/error-handler';
import { contentfulBodyParser } from '../../middleware/contentful-body-parser';
import { safeRedirect } from '../../../src/utils/safeRedirect';
import { loadErrorDictionaries } from '../../../src/utils/errors';
import { Context, ServerOptions, KoaServer } from '../../../types';
import isOpenApiError from '../../utils/isOpenApiError';
import { OpenApiError } from '../../utils/openApiError';
import queueManagement from './queueManagement';

const registerMiddleware = async (
  app: Koa<Koa.DefaultState, Koa.DefaultContext>,
  logger: ILogger,
  options: ServerOptions
) => {
  app.use(bodyParser());
  app.use(contentfulBodyParser(logger));
  app.use(await openAPI(options, logger));
  app.use(errorHandler(logger));
  const { additionalMiddleware } = options;

  if (additionalMiddleware) {
    additionalMiddleware.forEach(middleware => app.use(middleware));
  }
};

export default async (
  options: ServerOptions,
  logger: ILogger,
  config: IConfig
): Promise<KoaServer> => {
  const app = new Koa<Koa.DefaultState, Koa.DefaultContext>();
  const router = new Router<Koa.DefaultState, Context>();
  const { errorDirectories = [], queueWorkerPaths = [], queues } = options;
  const workerConfig: IWorkerConfig = config.get('WORKER_CONFIG');

  app.on('error', (error) => {
    if (error.message && isOpenApiError(error.message)) {
      const openApiError = new OpenApiError(error.message, error);

      logger.error('[OpenApiError]: ', openApiError);
    } else {
      logger.error('[Koa Error]: ', { error: error?.stack || error });
    }
  });

  app.context.errors = await loadErrorDictionaries([
    `${ __dirname }/../../errors`,
    ...errorDirectories
  ]);

  if (config.get('QUEUE_ENABLED') && queueWorkerPaths && queues) {
    logger.info('Enabling queue and queue-monitor dashboard.');
    await queueManagement(queueWorkerPaths, queues, app, workerConfig);
  }

  safeRedirect(app, logger);

  if (options.contractPaths.length > 1) {
    await setSwaggerVersionsUi(app, options, logger);
  }
  await registerMiddleware(app, logger, options);

  await registerRoutes(options, {
    app,
    router,
    logger,
    config
  });

  return { app, router };
};

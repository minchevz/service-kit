import Koa from 'koa';
import Router from '@koa/router';
import bodyParser from 'koa-bodyparser';
import { IConfig, ILogger } from '@service-kit/common';
import { ProtectionInstance } from 'overload-protection';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const overloadProtection = require('overload-protection');

import registerRoutes from './registerRoutes';
import setSwaggerVersionsUi from './setSwaggerVersionsUi';
import openAPI from '../../../src/middleware/open-api';
import { errorHandler } from '../../../src/middleware/error-handler';
import { safeRedirect } from '../../../src/utils/safeRedirect';
import logOverloadProtection from '../../utils/logOverloadProtection';
import { loadErrorDictionaries } from '../../../src/utils/errors';
import { Context, ServerOptions, KoaServer } from '../../../types';
import isOpenApiError from '../../utils/isOpenApiError';
import { OpenApiError } from '../../utils/openApiError';

const defaultProtectionConfig = {
  production: true, // if production is false, detailed error messages are exposed to the client
  clientRetrySecs: 1, // Retry-After header, in seconds (0 to disable) [default 1]
  sampleInterval: 5, // sample rate, milliseconds [default 5]
  maxEventLoopDelay: 0, // maximum detected delay between event loop ticks [default 42]
  maxHeapUsedBytes: 0, // maximum heap used threshold (0 to disable) [default 0]
  maxRssBytes: 0, // maximum rss size threshold (0 to disable) [default 0]
  errorPropagationMode: false, // dictate behavior: take over the response or propagate an error to the framework [default false]
  logging: 'warn',
  logStatsOnReq: true
};

const registerMiddleware = async (
  app: Koa<Koa.DefaultState, Koa.DefaultContext>,
  logger: ILogger,
  options: ServerOptions
) => {
  app.use(bodyParser());
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
  const { errorDirectories = [] } = options;
  const overloadProtectionConfig = {
    ...defaultProtectionConfig,
    maxEventLoopDelay: config.get('EVENT_LOOP_DELAY') || 0,
    maxHeapUsedBytes: config.get('HEAP_USED_BYTES') || 0,
    maxRssBytes: config.get('RSS_BYTES') || 0
  };

  app.use(overloadProtection('koa', overloadProtectionConfig));
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

  app.context.log = {
    warn: (msg: ProtectionInstance | string) => {
      if ((msg as ProtectionInstance).overload && (overloadProtectionConfig.maxEventLoopDelay | overloadProtectionConfig.maxHeapUsedBytes | overloadProtectionConfig.maxRssBytes)) {
        logOverloadProtection(logger, msg);
      }
    }
  };

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

import server from '@service-kit/server';
import configLoader from '@service-kit/config-loader';
import redisLib from '@service-kit/redis';
import cacher from '@service-kit/cacher';
import serviceKitLogger from '@service-kit/logger';

const logger = serviceKitLogger({
  id: 'logger-example-id',
  name: 'logger-example-name',
  version: '1.0.0'
});

export const config = configLoader({
  configPaths: [`${__dirname}/config/features.json`]
});

(async () => {
  // node cache
  await cacher.bootstrap(config, logger);
  // redis cache
  // const redis = await redisLib.bootstrap(config, logger);
  // await cacher.bootstrap(config, logger, { redis });

  const serverInstance = await server(
    {
      contractPaths: [`${__dirname}/contract/v1/example.yml`],
      controllerPaths: [`${__dirname}/controllers/`]
    },
    logger,
    config
  );

  serverInstance.listen(3002);
})();

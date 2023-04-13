import { config, logger } from '@service-kit/core';
import redisLib from '@service-kit/redis';
import cacher from '@service-kit/cacher';
import server from './server';

(async () => {
  const app = await server();
  // node cache
  await cacher.bootstrap(config, logger);
  // redis cache
  // const redis = await redisLib.bootstrap(config, logger);
  // await cacher.bootstrap(config, logger, { redis });
  const port = config.get('port');

  await app.listen(port);

  logger.info(`Server started on port ${port}`);
})().catch((error) => {
  logger.error('Unexpected Error', error);
});

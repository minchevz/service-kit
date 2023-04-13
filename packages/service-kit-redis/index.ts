import RedisCacher from './src/redis';
import { IRedisClient } from './types';
import { IConfig, ILogger } from '@service-kit/common';

export { IRedisClient } from './types';

export let redis: IRedisClient;

export const bootstrap = async (config: IConfig, logger: ILogger): Promise<IRedisClient> => {
  logger.info('Redis bootstrapping ...');
  const redisCacher = new RedisCacher(config, logger);

  try {
    redis = await redisCacher.init();
  } catch (error) {
    logger.error(error as string);
  }

  return redis;
};

export default {
  name: 'redis',
  dependencies: [],
  bootstrap
};

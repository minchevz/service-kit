/* eslint-disable @typescript-eslint/no-explicit-any */

import { IConfig, INullable, ICacheConfig, ICacher, ILogger } from '@service-kit/common';
import { IRedisCacher } from '../../types';

export default (cacher: IRedisCacher, config: IConfig, logger: ILogger): ICacher => {
  const cacheConfig = config.get('CACHE') as ICacheConfig;
  const keyPrefix = `${ cacheConfig.CACHE_PREFIX }-`;

  return {
    get: async <T>(key: string, defaultValue?: any): Promise<INullable<T>> => {
      logger.debug(`GET ${ keyPrefix }${ key }`);

      let data = defaultValue;

      try {
        data = await cacher.get(keyPrefix + key);
      } catch (err) {
        logger.error(`Failed to retrieve key :`, err);
      }

      if (data) {
        logger.debug(`FOUND ${ key }`);

        try {
          return typeof data === 'string' ? data : JSON.parse(data);
        } catch (err) {
          logger.error(`Redis result parse error :`, err);

          return data;
        }
      }

      return data;
    },
    set: <T>(key: string, data: T, ttl?: number): void => {
      logger.debug(`SET ${ keyPrefix }${ key }`);

      let ttlTime: INullable<number> = ttl;

      if (!ttl) {
        ttlTime = cacheConfig.CACHE_TTL;
      }

      if (ttlTime) {
        cacher.setex(
          keyPrefix + key,
          ttlTime,
          typeof data === 'string' ? data : JSON.stringify(data)
        );
      } else {
        cacher.set(keyPrefix + key, typeof data === 'string' ? data : JSON.stringify(data));
      }
    },
    del: (deleteTargets: string[] | string): void => {
      const targets = Array.isArray(deleteTargets) ? deleteTargets : [ deleteTargets ];
      const keysToDelete = targets.map((key: string) => keyPrefix + key);

      logger.debug(`DELETE ${ keysToDelete }`);

      try {
        cacher.del(keysToDelete);
      } catch (err) {
        logger.error(`del error. Key: ${ keysToDelete }`, err);
        throw err;
      }
    }
  };
};

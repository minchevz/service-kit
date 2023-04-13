/* eslint-disable @typescript-eslint/no-explicit-any */

import NodeCache from 'node-cache';
import { IConfig, INullable, ICacher, ILogger } from '@service-kit/common';
import { INodeMemoryConfig } from '../../types';

export default (config: IConfig, logger: ILogger): ICacher => {
  logger.info('Node Memory bootstrapping ...');
  let nodeCache: NodeCache;
  let nodeConfig: INodeMemoryConfig;

  try {
    nodeConfig = config.get('CACHE') as INodeMemoryConfig;

    if (!nodeConfig || !nodeConfig.CACHE_PREFIX) {
      logger.error('CACHE config or prefix is not defined for service!');

      throw new Error('CACHE config or prefix is not defined for service!');
    }

    nodeCache = new NodeCache(nodeConfig.NODE_CACHE_OPTIONS);

    logger.info(`Memory Cacher created. Prefix: ${ nodeConfig.CACHE_PREFIX }`);
  } catch (error) {
    logger.error(error as string);
  }

  return {
    get: async <T>(key: string, defaultValue?: any): Promise<INullable<T>> => {
      logger.info(`GET ${ key }`);

      let result: INullable<T> = defaultValue;

      try {
        result = nodeCache.get(`${ nodeConfig.CACHE_PREFIX }-${ key }`);
        logger.debug(`FOUND ${ key }`);
      } catch (err) {
        logger.error(`Node Cache error: `, err);
      }

      return result;
    },
    set: <T>(key: string, data: T, ttl?: number): void => {
      logger.info(`SET ${ key }`);

      let ttlTime: INullable<number> = ttl;

      if (!ttl) {
        ttlTime = nodeConfig.CACHE_TTL;
      }

      if (ttlTime) {
        nodeCache.set(`${ nodeConfig.CACHE_PREFIX }-${ key }`, data, ttlTime);
      } else {
        nodeCache.set(`${ nodeConfig.CACHE_PREFIX }-${ key }`, data);
      }
    },
    del: (deleteTargets: string[] | string): void => {
      logger.info(`DEL ${ deleteTargets }`);

      nodeCache.del(`${ nodeConfig.CACHE_PREFIX }-${ deleteTargets }`);
    }
  };
};

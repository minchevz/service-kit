import IORedis from 'ioredis';
import { IConfig, ILogger } from '@service-kit/common';
import { mapDefaultRedisConfig, mapSentinelConfig, mapClusterConfig } from './utils/mappers';
import { IRedisClient, IRedisConfig, IRedisCacher } from '../types';

class RedisCacher implements IRedisCacher {
  private keyPrefix: string;
  private logger: ILogger;
  private config: IRedisConfig;

  constructor(config: IConfig, logger: ILogger) {
    this.logger = logger;
    this.config = config.get('CACHE') as IRedisConfig;
    this.keyPrefix = `${ this.config.CACHE_PREFIX }-`;
  }

  async init(): Promise<IRedisClient> {
    return new Promise((resolve, reject) => {
      let client: IRedisClient;

      if (this.config.CLUSTER) {
        const nodes = mapClusterConfig(this.config.CLUSTER);
        const additionalOptions = this.config.REDIS ?
          { redisOptions: mapDefaultRedisConfig(this.config.REDIS) } :
          {};

        if (!nodes || nodes.length === 0) {
          return reject('No nodes defined for cluster');
        }

        client = new IORedis.Cluster(nodes, additionalOptions);
      } else {
        const redisConfig = {
          ...mapDefaultRedisConfig(this.config.REDIS),
          ...mapSentinelConfig(this.config.REDIS)
        };

        client = new IORedis(redisConfig);
      }

      this.logger.debug(`Redis Cacher created. Prefix: ${ this.keyPrefix }`);

      if (this.config.REDIS_MONITOR) {
        client.monitor((err: Error | null) => {
          this.logger.debug('Redis cacher entering monitoring mode...', err);
        });
      }

      client.on('connect', (): void => {
        this.logger.info('Redis Client is connected.');

        return resolve(client);
      });

      client.on('error', (err: Error) => {
        this.logger.error('Redis Client error :', err);
      });

      client.on('ready', (): void => {
        this.logger.info('Redis Client is ready.');
      });

      client.on('reconnecting', (): void => {
        this.logger.info('Redis Client is reconnecting.');
      });

      client.on('close', (): void => {
        this.logger.info('Redis Client is closed!');
      });

      return resolve(client);
    });
  }
}

export default RedisCacher;

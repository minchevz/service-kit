import {
  IRedisOptions,
  IBasicRedisConfiguration,
  ISentinelConfiguration,
  ICluster,
  INode
} from '../../types';

const DEFAULT_REDIS_PORT = 6379;
const DEFAULT_SENTINEL_PORT = 26379;

export const mapDefaultRedisConfig = (config: IRedisOptions): IBasicRedisConfiguration => ({
  showFriendlyErrorStack: true,
  name: config.REDIS_NAME,
  host: config.REDIS_HOST,
  port: config.REDIS_PORT,
  password: config.REDIS_PASSWORD,
  maxRetriesPerRequest: config.REDIS_MAX_RETRIES_PER_REQUEST,
  enableOfflineQueue: config.REDIS_ENABLE_OFFLINE_QUEUE
});

export const mapSentinelConfig = (config: IRedisOptions): ISentinelConfiguration | null => {
  const sentinelHosts = Object.keys(config).filter(key => key.startsWith('SENTINEL_HOST'));

  if (!sentinelHosts.length) {
    return null;
  }

  const sentinels = sentinelHosts
    .filter(key => config[key])
    .map((key) => {
      const hostIndex = key.split('_').pop();
      const port = config[`SENTINEL_PORT_${ hostIndex }`] || DEFAULT_SENTINEL_PORT;

      return {
        host: config[key] as string,
        port: port as number
      };
    });

  return sentinels.length > 0 ?
    { sentinelPassword: config.SENTINEL_PASSWORD, sentinels } :
    { sentinelPassword: config.SENTINEL_PASSWORD };
};

export const mapClusterConfig = (config: ICluster): INode[] | null => {
  const clusterHosts = Object.keys(config).filter(key => key.startsWith('CLUSTER_NODE_HOST'));

  if (!clusterHosts.length) {
    return null;
  }

  return clusterHosts.map((key) => {
    const hostIndex = key.split('_').pop();
    const port = config[`CLUSTER_NODE_PORT_${ hostIndex }`] || DEFAULT_REDIS_PORT;
    const password = (config[`CLUSTER_NODE_PASSWORD_${ hostIndex }`] as string) || null;

    return {
      host: config[key] as string,
      password,
      port: port as number
    };
  });
};

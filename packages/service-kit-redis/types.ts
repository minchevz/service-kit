import { Cluster, Redis } from 'ioredis';

export type IRedisClient = Cluster | Redis;

export interface INode {
  host: string;
  password?: string | null;
  port: number;
}

export interface ICluster {
  [key: string]: string | number;
}

export interface IBasicRedisConfiguration {
  showFriendlyErrorStack: boolean;
  name?: string;
  host: string;
  port: number;
  password?: string;
  maxRetriesPerRequest?: number;
  enableOfflineQueue?: boolean;
}

export interface ISentinelConfiguration {
  sentinelPassword?: string;
  sentinels?: INode[];
}

export interface IRedisOptions {
  REDIS_NAME?: string;
  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_PASSWORD?: string;
  REDIS_SENTINEL_PASSWORD?: string;
  REDIS_MAX_RETRIES_PER_REQUEST?: number;
  REDIS_ENABLE_OFFLINE_QUEUE?: boolean;
  SENTINEL_PASSWORD?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface IRedisConfig {
  CACHE_PREFIX: string;
  CACHE_TTL: number | null;
  REDIS: IRedisOptions;
  REDIS_MONITOR?: boolean;
  CLUSTER?: ICluster;
}

export interface IRedisCacher {
  init: () => Promise<IRedisClient>;
}

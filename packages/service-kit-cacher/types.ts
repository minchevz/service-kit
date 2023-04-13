/* eslint-disable @typescript-eslint/no-explicit-any */

import { INullable } from '@service-kit/common';

export interface INodeCacheOptions {
  stdTTL: number;
  checkperiod: number;
}

export interface INodeMemoryConfig {
  CACHE_PREFIX: string;
  CACHE_TTL: number | null;
  NODE_CACHE_OPTIONS: INodeCacheOptions;
}

export interface IRedisCacher {
  get: (val: string, defaultValue?: any) => Promise<INullable<string>>;
  set: (key: string, data: string) => void;
  setex: (key: string, ttl: number, data: string) => void;
  del: (deleteTargets: string[] | string) => void;
}

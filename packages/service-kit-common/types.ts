/* eslint-disable @typescript-eslint/no-explicit-any */

export interface LogMethod {
  (message: string, meta?: unknown): ILogger;
}

export interface ILogger {
  error: LogMethod;
  warn: LogMethod;
  info: LogMethod;
  debug: LogMethod;
}

export interface IConfig {
  has: (key: string) => boolean;
  get: (key: string) => any;
  set: (key: string, val: any) => void;
  getProperties: () => any;
}

export interface IServiceKitModule {
  name: string;
  dependencies: string[];
  bootstrap: (config: IConfig, logger: ILogger, deps: unknown[]) => Promise<unknown> | unknown;
}

export type INullable<T> = T | undefined | null;

export interface IDictionary<T> {
  [key: string]: T;
}

export interface IConfigA {
  get: (val: string) => unknown;
  getProperties: () => unknown;
}

export interface ICacheConfig {
  CACHE_PREFIX: string;
  CACHE_TTL: number | null;
}

export interface ICacher {
  get: <T>(val: string) => Promise<INullable<T>>;
  set: <T>(key: string, data: T, ttl?: number) => void;
  del: (deleteTargets: string[] | string) => void;
}

export interface IRedisCacher {
  get: (val: string) => Promise<INullable<string>>;
  set: (key: string, data: string) => void;
  setex: (key: string, ttl: number, data: string) => void;
  del: (deleteTargets: string[] | string) => void;
}

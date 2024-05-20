/* eslint-disable @typescript-eslint/no-explicit-any */
import { Queue as QueueMQ, Job } from 'bullmq';
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

export interface IQueueName {
  [key: string]: string;
}

export interface IWorkerFunction {
  (job: Job): Promise<IQueueJobResponse>;
}
export interface IQueueWorkerMapping {
  [key: string]: IWorkerFunction;
}

export interface IQueueClient {
  [key: string]: QueueMQ;
}

export interface IQueueJobResponse {
  queueMetaData?: object;
  status: string;
}
export interface IWorkerConfig {
  WORKER_REMOVE_ON_COMPLETE_AGE: number;
  WORKER_REMOVE_ON_FAIL_AGE: number;
  CONCURRENCY: number;
}
export interface IQueueConfig {
  QUEUE_REMOVE_ON_COMPLETE_AGE: number;
  QUEUE_REMOVE_ON_FAIL_AGE: number;
  MAX_NUMBER_OF_JOBS_ON_DASHBOARD: number;
}

export type ConnectionOptions = any;

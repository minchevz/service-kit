/* eslint @typescript-eslint/no-var-requires: 0 */
import { Redis, Cluster } from 'ioredis';

import RedisCacher from '../src/redis';
import { IDictionary } from '@service-kit/common';
import { IRedisCacher } from '../types';

jest.mock('ioredis');
jest.mock('@service-kit/common');
const IORedis = require('ioredis');

const defaultConfig = {
  CACHE_PREFIX: '',
  REDIS_MONITOR: false,
  CACHE_TTL: null,
  REDIS: {
    REDIS_HOST: '127.0.0.1',
    REDIS_PORT: 6379,
    REDIS_PASSWORD: null
  }
};

const onMonitorMock = { on: jest.fn() };
const monitorMock = jest.fn();
const onCallbacks: IDictionary<string> = {};
const onStub = jest.fn((event, cb) => (onCallbacks[event] = cb));

let isClusterMode = false;
let redisClient: Redis | Cluster;

const mockConnectRedis = async (redis: IRedisCacher) => {
  IORedis.mockImplementation(() => ({
    on: onStub,
    monitor: monitorMock,
    quit: jest.fn(),
    disconnect: jest.fn(),
    subscribe: jest.fn(),
    publish: jest.fn(),
    onCallbacks
  }));

  redisClient = await redis.init();

  const onConnect = onStub.mock.calls[0];

  onConnect[1]();
};

const mockConfig = jest.fn().mockImplementation(config => ({ get: () => config }));

const logger = {
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn()
};

describe('Given RedisCacher class', () => {
  let redis = new RedisCacher(mockConfig(defaultConfig), logger);

  beforeEach(async () => {
    IORedis.mockRestore();
    jest.clearAllMocks();

    if (!isClusterMode) {
      await mockConnectRedis(redis);
    }
  });

  describe('When redis client is started with monitor mode', () => {
    const config = {
      ...defaultConfig,
      CACHE_PREFIX: 'test',
      REDIS_MONITOR: true
    };

    beforeAll(async () => (redis = new RedisCacher(mockConfig(config), logger)));

    it('should listen error event listener', () => {
      const onError = onStub.mock.calls[1];

      onError[1]();

      expect(onError[0]).toBe('error');
      expect(logger.error).toBeCalledWith('Redis Client error :', undefined);
    });

    it('should enter monitor mode', async () => {
      const monitorCall = monitorMock.mock.calls[0];

      monitorCall[0](null, onMonitorMock);

      expect(logger.debug).toBeCalledWith('Redis cacher entering monitoring mode...', null);
    });

    it('should listen ready event listener', () => {
      const onReady = onStub.mock.calls[2];

      onReady[1]();

      expect(onReady[0]).toBe('ready');
      expect(logger.info).toBeCalledWith('Redis Client is ready.');
    });

    it('should listen reconnecting event listener', () => {
      const onReconnect = onStub.mock.calls[3];

      onReconnect[1]();

      expect(onReconnect[0]).toBe('reconnecting');
      expect(logger.info).toBeCalledWith('Redis Client is reconnecting.');
    });

    it('should listen close event listener', () => {
      const onReconnect = onStub.mock.calls[4];

      onReconnect[1]();

      expect(onReconnect[0]).toBe('close');
      expect(logger.info).toHaveBeenLastCalledWith('Redis Client is closed!');
    });
  });

  describe('When Redis is in cluster mode,', () => {
    beforeAll(() => {
      isClusterMode = true;
      const config = {
        CACHE_PREFIX: 'cluster',
        CACHE_TTL: 30,
        CLUSTER: {
          CLUSTER_NODE_HOST_0: 'localhost',
          CLUSTER_NODE_PORT_0: 6379
        }
      };

      redis = new RedisCacher(mockConfig(config), logger);
    });

    it('should create as Cluster with redis opts', async () => {
      redisClient = await redis.init();

      expect(redisClient).toBeDefined();
      expect(redisClient).toBeInstanceOf(IORedis.Cluster);
    });
  });

  describe('Redis cluster', () => {
    describe('When no nodes are specified', () => {
      beforeAll(() => {
        const config = {
          CACHE_PREFIX: 'cluster',
          CACHE_TTL: 30,
          CLUSTER: {}
        };

        redis = new RedisCacher(mockConfig(config), logger);
      });

      it('should fail to init redis cluster without nodes', async () => {
        redis
          .init()
          .then()
          .catch((err) => {
            expect(err).toBe('No nodes defined for cluster');
          });
      });
    });

    describe('when redis options are also specified', () => {
      beforeAll(() => {
        isClusterMode = true;
        const config = {
          CACHE_PREFIX: 'cluster',
          CACHE_TTL: 30,
          CLUSTER: {
            CLUSTER_NODE_HOST_0: 'localhost',
            CLUSTER_NODE_PORT_0: 6379
          },
          REDIS: {
            REDIS_NAME: 'test'
          }
        };

        redis = new RedisCacher(mockConfig(config), logger);
      });

      it('should pass all options through to IORedis.Cluster', async () => {
        redisClient = await redis.init();

        expect(Cluster).toBeCalledWith([ { host: 'localhost', port: 6379, password: null } ], {
          redisOptions: { name: 'test', showFriendlyErrorStack: true }
        });
      });
    });
  });
});

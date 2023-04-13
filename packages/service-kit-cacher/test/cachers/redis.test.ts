import { ICacher, INullable, ICacheConfig, ILogger } from '@service-kit/common';
import redis from '../../src/cachers/redis';

const logger: ILogger = {
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn()
};

const config: ICacheConfig = {
  CACHE_PREFIX: 'redis',
  CACHE_TTL: null
};

const mockConfig = jest.fn().mockImplementation(() => ({ get: () => config }));

export interface IRedisCacher {
  get: (val: string) => Promise<INullable<string>>;
  set: (key: string, data: string) => void;
  setex: (key: string, ttl: number, data: string) => void;
  del: (deleteTargets: string[] | string) => void;
}

let redisGetMock = jest.fn().mockImplementation(() => Promise.resolve('testvalue'));
let redisDelMock = jest.fn();
const redisSetMock = jest.fn();
const redisSetexMock = jest.fn();

class RedisMock {
  async get(val: string): Promise<INullable<string>> {
    return redisGetMock(val);
  }
  set(key: string, data: string) {
    redisSetMock(key, data);
  }
  setex(key: string, ttl: number, data: string) {
    redisSetexMock(key, ttl, data);
  }
  del(deleteTargets: string[] | string) {
    redisDelMock(deleteTargets);
  }
}

describe('The @service-kit/server package', () => {
  let redisClient: ICacher;
  const redisInstance = new RedisMock();

  beforeEach(() => {
    redisClient = redis(redisInstance, mockConfig(config), logger);
  });

  describe('when redis runs', () => {
    it('should create redisClient', () => {
      expect(redisClient).toBeDefined();
    });
  });

  describe('when get method is called successfully', () => {
    it('should return correct value', async () => {
      const val = await redisClient.get('test').then().catch();

      expect(redisGetMock).toHaveBeenCalled();
      expect(val).toBe('testvalue');
    });

    describe('and parsing fails', () => {
      beforeEach(() => {
        redisGetMock = jest.fn().mockImplementation(() => Promise.resolve({ value: 'test' }));
        JSON.parse = jest.fn().mockImplementation(() => {
          throw new Error('parse err');
        });
      });

      it('should throw error', async () => {
        try {
          await redisClient.get('test');
        } catch (e) {
          expect(redisGetMock).toHaveBeenCalled();
          expect(logger.error).toBeCalled();
        }
      });
    });
  });

  describe('when get method throws error', () => {
    beforeAll(() => {
      redisGetMock = jest.fn().mockImplementation(() => Promise.reject('failed'));
    });

    it('should return null and log error', async () => {
      const val = await redisClient.get('test');

      expect(redisGetMock).toHaveBeenCalled();
      expect(val).toBe(undefined);
      expect(logger.error).toBeCalled();
    });
  });

  describe('when set method is called without TTL', () => {
    it('should call redis set method', () => {
      redisClient.set('testKey', 'data');

      expect(redisSetMock).toHaveBeenCalled();
      expect(redisSetMock).toHaveBeenCalledWith(`${ config.CACHE_PREFIX }-testKey`, 'data');
    });

    describe('and the data is object', () => {
      it('should call redis setex method with ttl config value', () => {
        redisClient.set('testKey', { value: 'data' });

        expect(redisSetMock).toHaveBeenCalledWith(
          `${ config.CACHE_PREFIX }-testKey`,
          JSON.stringify({ value: 'data' })
        );
      });
    });

    describe('and TTL config is defined', () => {
      beforeAll(() => (config.CACHE_TTL = 10));

      it('should call redis setex method with ttl config value', () => {
        redisClient.set('testKey', 'data');

        expect(redisSetexMock).toHaveBeenCalledWith(`${ config.CACHE_PREFIX }-testKey`, 10, 'data');
      });
    });
  });

  describe('when set method is called with TTL', () => {
    it('should call redis setex method with expire ttl', () => {
      redisClient.set('testKey', 'data', 50);

      expect(redisSetexMock).toHaveBeenCalled();
      expect(redisSetexMock).toHaveBeenCalledWith(`${ config.CACHE_PREFIX }-testKey`, 50, 'data');
    });

    describe('and the data is object', () => {
      it('should call redis setex method with ttl config value', () => {
        redisClient.set('testKey', { value: 'data' }, 50);

        expect(redisSetexMock).toHaveBeenCalledWith(
          `${ config.CACHE_PREFIX }-testKey`,
          50,
          JSON.stringify({ value: 'data' })
        );
      });
    });
  });

  describe('when del method is called', () => {
    it('should call redis del method', () => {
      redisClient.del('testKey');

      expect(redisDelMock).toHaveBeenCalled();
      expect(redisDelMock).toHaveBeenCalledWith([ `${ config.CACHE_PREFIX }-testKey` ]);
    });

    describe('and if key is an array', () => {
      it('should call del method with string of array', () => {
        redisClient.del([ 'testKey1', 'testKey2' ]);

        expect(redisDelMock).toHaveBeenCalled();
        expect(redisDelMock).toHaveBeenCalledWith([
          `${ config.CACHE_PREFIX }-testKey1`,
          `${ config.CACHE_PREFIX }-testKey2`
        ]);
      });
    });
  });

  describe('when del method throws error', () => {
    beforeAll(() => {
      redisDelMock = jest.fn().mockImplementation(() => {
        throw new Error('fail');
      });
    });

    it('should call redis del method', () => {
      try {
        redisClient.del('testKey');
      } catch (e) {
        expect(redisDelMock).toHaveBeenCalled();
        expect(redisDelMock).toHaveBeenCalledWith([ `${ config.CACHE_PREFIX }-testKey` ]);
        expect(logger.error).toBeCalled();
      }
    });
  });
});

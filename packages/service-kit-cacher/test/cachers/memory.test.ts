/* eslint @typescript-eslint/no-var-requires: 0 */
import { ICacher, ILogger } from '@service-kit/common';
import memory from '../../src/cachers/memory';
import { INodeMemoryConfig } from '../../types';

jest.mock('node-cache');
const NodeCache = require('node-cache');

const logger: ILogger = {
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn()
};

const config: INodeMemoryConfig = {
  CACHE_PREFIX: 'memory',
  CACHE_TTL: null,
  NODE_CACHE_OPTIONS: {
    stdTTL: 0,
    checkperiod: 100
  }
};

const mockConfig = jest.fn().mockImplementation(() => ({ get: () => config }));

let nodeCacheGetMock = jest.fn().mockImplementation(() => true);
const nodeCacheSetMock = jest.fn();
const nodeCacheDelMock = jest.fn();

describe('The @service-kit/server package', () => {
  let nodeCache: ICacher;

  beforeEach(() => {
    NodeCache.mockRestore();

    NodeCache.mockImplementation(() => ({
      get: nodeCacheGetMock,
      set: nodeCacheSetMock,
      del: nodeCacheDelMock
    }));

    nodeCache = memory(mockConfig(config), logger);
  });

  describe('when memory runs', () => {
    it('should call NodeCache library', () => {
      expect(NodeCache).toHaveBeenCalledTimes(1);
    });
  });

  describe('when get method is called successfully', () => {
    it('should run defined module, not nodeCache', async () => {
      const val = await nodeCache.get('test');

      expect(nodeCacheGetMock).toHaveBeenCalledTimes(1);
      expect(val).toBe(true);
    });
  });

  describe('when get method throws error', () => {
    beforeAll(
      () =>
        (nodeCacheGetMock = jest.fn().mockImplementation(() => {
          throw new Error('failed');
        }))
    );

    it('should return undefined and log error', async () => {
      const val = await nodeCache.get('test');

      expect(nodeCacheGetMock).toHaveBeenCalled();
      expect(val).toBe(undefined);
      expect(logger.error).toBeCalled();
    });
  });

  describe('when set method is called without TTL', () => {
    it('should call NodeCache set without expire ttl', () => {
      nodeCache.set('testKey', 'data');

      expect(nodeCacheSetMock).toHaveBeenCalled();
      expect(nodeCacheSetMock).toHaveBeenCalledWith(`${ config.CACHE_PREFIX }-testKey`, 'data');
    });

    describe('and TTL config is defined', () => {
      beforeAll(() => (config.CACHE_TTL = 10));

      it('should call NodeCache set with ttl config value', () => {
        nodeCache.set('testKey', 'data');

        expect(nodeCacheSetMock).toHaveBeenCalledWith(`${ config.CACHE_PREFIX }-testKey`, 'data');
      });
    });
  });

  describe('when set method is called with TTL', () => {
    it('should call NodeCache set without expire ttl', () => {
      nodeCache.set('testKey', 'data', 50);

      expect(nodeCacheSetMock).toHaveBeenCalled();
      expect(nodeCacheSetMock).toHaveBeenCalledWith(`${ config.CACHE_PREFIX }-testKey`, 'data', 50);
    });
  });

  describe('when del method is called', () => {
    it('should call NodeCache set without expire ttl', () => {
      nodeCache.del('testKey');

      expect(nodeCacheDelMock).toHaveBeenCalled();
      expect(nodeCacheDelMock).toHaveBeenCalledWith(`${ config.CACHE_PREFIX }-testKey`);
    });
  });

  describe('when cache key prefix is not defined', () => {
    beforeAll(() => (config.CACHE_PREFIX = ''));

    it('should call NodeCache set without expire ttl', () => {
      expect(NodeCache).toHaveBeenCalledTimes(0);
    });
  });
});

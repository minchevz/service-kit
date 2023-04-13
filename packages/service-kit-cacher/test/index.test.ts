/* eslint @typescript-eslint/no-var-requires: 0 */
import cacher from '../index';
import * as cachers from '../src/cachers';
import { ILogger } from '@service-kit/common';

jest.mock('node-cache');
const NodeCache = require('node-cache');

const logger: ILogger = {
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn()
};

const config = {
  CACHE_PREFIX: 'test',
  CACHE_TTL: null,
  NODE_CACHE_OPTIONS: {
    stdTTL: 0,
    checkperiod: 600
  }
};

const mockConfig = jest.fn().mockImplementation(() => ({ get: () => config }));
const modules = undefined;

const testModule = {};

describe('The @service-kit/server package', () => {
  beforeEach(() => NodeCache.mockRestore());

  describe('when type not provided', () => {
    it('should return node memory cache', async () => {
      await cacher.bootstrap(mockConfig(), logger, modules);

      expect(NodeCache).toHaveBeenCalledTimes(1);
    });
  });

  describe('when type defined', () => {
    beforeAll(() => (cachers.default.testModule = jest.fn().mockImplementation()));

    it('should run defined module, not nodeCache', async () => {
      await cacher.bootstrap(mockConfig(), logger, { testModule });

      expect(NodeCache).toHaveBeenCalledTimes(0);
    });

    describe('and module is not defined OR doesnt match type', () => {
      beforeAll(() => (cachers.default.testModule = jest.fn().mockImplementation()));

      it('should run defined module, not nodeCache', async () => {
        try {
          await cacher.bootstrap(mockConfig(), logger, { test: testModule });
        } catch (error) {
          expect((error as { message: string }).message).toBe(
            'Defined type of cache module does not exist, please provide correct module'
          );
        }
      });
    });
  });
});

import { ILogger } from '@service-kit/common';
import logOverloadProtection from '../../../src/utils/logOverloadProtection';

const spyWarn = jest.fn();
const mockLogger : ILogger = {
  error: jest.fn(),
  warn: spyWarn,
  info: jest.fn(),
  debug: jest.fn()
};

describe('Given logOverloadProtection utility,', () => {
  describe('When message is string,', () => {
    it('should log the message', () => {
      logOverloadProtection(mockLogger, 'heavy load');

      expect(spyWarn).toHaveBeenCalledWith('heavy load');
    });
  });

  describe('When message is info object,', () => {
    it('should log the message', () => {
      const info = {
        overload: true,
        eventLoopOverload: true,
        heapUsedOverload: false,
        rssOverload: false,
        eventLoopDelay: 50,
        maxEventLoopDelay: 42,
        maxHeapUsedBytes: 0,
        maxRssBytes: 0
      };

      logOverloadProtection(mockLogger, info);

      expect(spyWarn).toHaveBeenCalledWith('heavy load');
    });
  });
});

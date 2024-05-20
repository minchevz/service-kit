/* eslint-disable @typescript-eslint/no-empty-function */
import { bootstrap } from '../index';
import { createQueueMQ } from '../src/queueService';
import { IConfig, ILogger } from '@service-kit/common';

jest.mock('@service-kit/core', () => ({
  redis: {
    createClient: jest.fn()
  }
}));

jest.mock('../src/queueService', () => ({
  createQueueMQ: jest.fn()
}));

const logger: ILogger = {
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn()
};

describe('bootstrap', () => {
  const expectedQueue = 'QUEUE_EXAMPLE_QUEUE_1';
  const queueConfig = {
    QUEUE_REMOVE_ON_COMPLETE_AGE: 10,
    QUEUE_REMOVE_ON_FAIL_AGE: 10,
    MAX_NUMBER_OF_JOBS_ON_DASHBOARD: 10
  };
  const config: { [index: string]: unknown } = {
    QUEUE_NAMES: { queue: expectedQueue },
    QUEUE_CONFIG: queueConfig
  };
  const mockConfig: IConfig = {
    get: jest.fn().mockImplementation((key: string): unknown => config[key]),
    has: jest.fn(),
    set: jest.fn(),
    getProperties: jest.fn()
  };

  beforeEach(() => {
    (createQueueMQ as jest.Mock).mockImplementation(async () => expectedQueue);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should create workerMQ and queueMQ', async () => {
    // Act
    const result = await bootstrap(mockConfig, logger);

    // Assert
    expect(createQueueMQ).toHaveBeenCalledTimes(1);
    expect(createQueueMQ).toHaveBeenCalledWith({ queue: expectedQueue }, queueConfig);
    expect(result).toEqual(expectedQueue);
  });
});

import { Queue } from 'bullmq';
import { createQueueMQ } from '../../src/queueService';
import { IConfig, IQueueClient } from '@service-kit/common';

jest.mock('bullmq');

describe('Queue Service is called', () => {
  let result: IQueueClient;
  const expectedQueue = 'QUEUE_EXAMPLE_QUEUE_1';
  const config: { [index: string]: unknown } = {
    QUEUE_NAMES: { queue: expectedQueue },
    QUEUE_CONFIG: {
      QUEUE_REMOVE_ON_COMPLETE_AGE: 10,
      QUEUE_REMOVE_ON_FAIL_AGE: 10,
      MAX_NUMBER_OF_JOBS_ON_DASHBOARD: 10
    }
  };
  const mockConfig: IConfig = {
    get: jest.fn().mockImplementation((key: string): unknown => config[key]),
    has: jest.fn(),
    set: jest.fn(),
    getProperties: jest.fn()
  };

  beforeEach(async () => {
    result = await createQueueMQ(mockConfig.get('QUEUE_NAMES'), mockConfig.get('QUEUE_CONFIG'));
  });

  afterEach(async () => {
    jest.resetAllMocks();
  });
  afterAll(async () => await result.QUEUE_EXAMPLE_QUEUE_1.close());
  it('should create a queue', async () => {
    expect(result).toHaveProperty('QUEUE_EXAMPLE_QUEUE_1');
    expect(result.QUEUE_EXAMPLE_QUEUE_1).toBeInstanceOf(Queue);
  });
});

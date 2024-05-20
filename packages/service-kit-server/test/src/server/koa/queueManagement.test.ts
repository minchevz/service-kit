import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { Queue as QueueMQ } from 'bullmq';
import queueManagement from '../../../../src/server/koa/queueManagement';
import { KoaServer } from '../../../../types';

import { ILogger } from '@service-kit/logger';

import server from '../../../../src/server/koa';

import { IConfig, IWorkerConfig } from '@service-kit/common';

jest.mock('bullmq', () => ({
  Worker: jest.fn(),
  Queue: jest.fn()
}));

jest.mock('@bull-board/api', () => ({
  createBullBoard: jest.fn()
}));
jest.mock('@bull-board/koa', () => ({
  KoaAdapter: jest.fn().mockImplementation(() => ({
    setBasePath: jest.fn(),
    registerPlugin: jest.fn()
  }))
}));
jest.mock('@bull-board/api/bullMQAdapter');

jest.mock(
  'koa',
  () =>
    class Koa {
      use = jest.fn();
      context = { error: mockErrorDictionary };
      listen = jest.fn();
      on = jest.fn();
    }
);
jest.mock('koa-static');
jest.mock('koa-mount');
jest.mock('@koa/router');
jest.mock('koa-bodyparser', () => () => 'body-parser');
jest.mock('../../../../src/utils/safeRedirect', () => ({
  safeRedirect: jest.fn()
}));
jest.mock('../../../../src/middleware/error-handler', () => ({
  errorHandler: () => 'errorHandler'
}));
jest.mock('../../../../src/middleware/open-api');
jest.mock('../../../../src/server/koa/registerRoutes', () => jest.fn());

const mockConfig: IConfig = {
  get: jest.fn(),
  has: jest.fn(),
  set: jest.fn(),
  getProperties: jest.fn()
};

const logger: ILogger = {
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn()
};

const mockErrorDictionary = { error: 'test' };
const options = { contractPaths: [], controllerPaths: [ '/example.yml' ], healthChecks: [] };

describe('Given a Koa server', () => {
  let serverAttr: KoaServer;

  beforeAll(async () => {
    serverAttr = await server(options, logger, mockConfig);
  });
  let allQueues: QueueMQ[];
  let workerConfig: IWorkerConfig;
  let queueWorkerPaths: string[];

  beforeEach(() => {
    jest.clearAllMocks();

    // Initialize variables
    allQueues = [
      new QueueMQ('queue1', { connection: jest.fn() }),
      new QueueMQ('queue2', { connection: jest.fn() })
    ];
    queueWorkerPaths = [];
    workerConfig = {
      WORKER_REMOVE_ON_COMPLETE_AGE: 10,
      WORKER_REMOVE_ON_FAIL_AGE: 10,
      CONCURRENCY: 10
    };
  });

  it('should create BullMQAdapters and call createBullBoard with correct parameters', async () => {
    await queueManagement(queueWorkerPaths, allQueues, serverAttr.app, workerConfig);

    expect(BullMQAdapter).toHaveBeenCalledTimes(allQueues.length);

    allQueues.forEach((queue) => {
      expect(BullMQAdapter).toHaveBeenCalledWith(queue);
    });
    expect(createBullBoard).toHaveBeenCalled();
  });
});

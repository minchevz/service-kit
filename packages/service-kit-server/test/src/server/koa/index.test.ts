import Koa from 'koa';
import Router from '@koa/router';
import { Queue as QueueMQ } from 'bullmq';
import { ILogger } from '@service-kit/logger';

import server from '../../../../src/server/koa';
import { safeRedirect } from '../../../../src/utils/safeRedirect';
import openAPI from '../../../../src/middleware/open-api';
import registerRoutes from '../../../../src/server/koa/registerRoutes';
import queueManagement from '../../../../src/server/koa/queueManagement';

import { KoaServer, ServerOptions } from '../../../../types';
import { IConfig, IWorkerConfig } from '@service-kit/common';
let errorCallback: (error: unknown) => void;

jest.mock('bullmq', () => ({
  Worker: jest.fn(),
  Queue: jest.fn()
}));

jest.mock(
  'koa',
  () =>
    class Koa {
      use = jest.fn();
      context = { error: mockErrorDictionary };
      listen = jest.fn();
      on = jest
        .fn()
        .mockImplementation(
          (_, callback: (error: unknown) => void) => (errorCallback = callback)
        );
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
jest.mock('../../../../src/server/koa/queueManagement', () => jest.fn());

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

  it('should provide an instance of Koa', () => {
    expect(serverAttr.app instanceof Koa).toBe(true);
  });

  it('should provide an instance of Koa Router', () => {
    expect(serverAttr.router instanceof Router).toBe(true);
  });

  it('should call the safeRedirect function', () => {
    expect(safeRedirect).toBeCalledWith(serverAttr.app, logger);
  });

  it('should call the use method appropriate number of times', () => {
    expect(serverAttr.app.use).toBeCalledTimes(4);
  });

  it('should use the body-parser middleware', () => {
    expect(serverAttr.app.use).toBeCalledWith('body-parser');
  });

  it('should use the errorHandler middleware', () => {
    expect(serverAttr.app.use).toBeCalledWith('errorHandler');
  });

  it('should use the attach error dictionary to the context', () => {
    expect(serverAttr.app.context.error).toEqual(mockErrorDictionary);
  });

  it('should use the open api middleware', () => {
    expect(openAPI).toBeCalledTimes(1);
    expect(openAPI).toBeCalledWith(options, logger);
  });

  it('should call registerRoutes with the appropriate parameters', () => {
    expect(registerRoutes).toBeCalledTimes(1);
    expect(registerRoutes).toBeCalledWith(options, {
      app: serverAttr.app,
      router: serverAttr.router,
      logger,
      config: mockConfig
    });
  });

  it('should log general Koa errors', () => {
    errorCallback({});
    expect(logger.error).toBeCalled();

    errorCallback(new Error());
    expect(logger.error).toBeCalled();

    errorCallback(new Error('RequestValidationError'));
    expect(logger.error).toBeCalled();

    errorCallback(new Error('ResponseValidationError'));
    expect(logger.error).toBeCalled();
  });

  describe('Given a Koa server more than 1 contracts', () => {
    it('should call the use method appropriate number of times', async () => {
      const middlewareMock = jest.fn();
      const anotherMiddlewareMock = jest.fn();
      const additionalMiddleware = [ middlewareMock, anotherMiddlewareMock ];
      const options: ServerOptions = {
        additionalMiddleware,
        contractPaths: [ '/v1/example.yml', '/v2/example.yaml' ]
      };

      const serverAttr = await server(options, logger, mockConfig);

      expect(serverAttr.app.use).toBeCalledTimes(9);
      expect(serverAttr.app.use).toBeCalledWith(middlewareMock);
      expect(serverAttr.app.use).toBeCalledWith(anotherMiddlewareMock);
      expect(serverAttr.app instanceof Koa).toBe(true);
    });
  });
});

describe('Given a Koa server with middleware parameter present', () => {
  it('should handle empty middleware array', async () => {
    const options: ServerOptions = { additionalMiddleware: [], contractPaths: [] };
    const serverAttr = await server(options, logger, mockConfig);

    expect(serverAttr.app instanceof Koa).toBe(true);
  });

  it('should handle one extra middleware', async () => {
    const middlewareMock = jest.fn();
    const additionalMiddleware = [ middlewareMock ];
    const options: ServerOptions = { additionalMiddleware, contractPaths: [] };

    const serverAttr = await server(options, logger, mockConfig);

    expect(serverAttr.app.use).toBeCalledTimes(5); // 3 default + 2 custom i.e.
    expect(serverAttr.app.use).toBeCalledWith(middlewareMock);
    expect(serverAttr.app instanceof Koa).toBe(true);
  });

  it('should handle multiple extra middleware', async () => {
    const middlewareMock = jest.fn();
    const anotherMiddlewareMock = jest.fn();
    const additionalMiddleware = [ middlewareMock, anotherMiddlewareMock ];
    const options: ServerOptions = { additionalMiddleware, contractPaths: [] };

    const serverAttr = await server(options, logger, mockConfig);

    expect(serverAttr.app.use).toBeCalledTimes(6); // 3 default + 2 custom i.e.
    expect(serverAttr.app.use).toBeCalledWith(middlewareMock);
    expect(serverAttr.app.use).toBeCalledWith(anotherMiddlewareMock);
    expect(serverAttr.app instanceof Koa).toBe(true);
  });
});

describe('Given Bull Board', () => {
  let allQueues: QueueMQ[];
  let options: ServerOptions;
  let workerConfig: IWorkerConfig;
  let queueWorkerPaths: string[];

  beforeAll(() => {
    // jest.mock('@service-kit/redis');
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
    options = {
      contractPaths: [],
      controllerPaths: [ '/example.yml' ],
      healthChecks: [],
      queues: allQueues,
      queueWorkerPaths: []
    };
  });

  it('should call queuenamger if QUEUE_ENABLED is true', async () => {
    const serverAttr = await server(options, logger, {
      ...mockConfig,
      get: jest.fn((key: string) => {
        switch (key) {
        case 'QUEUE_ENABLED':
          return true;
        case 'WORKER_CONFIG':
          return {
            WORKER_REMOVE_ON_COMPLETE_AGE: 10,
            WORKER_REMOVE_ON_FAIL_AGE: 10,
            CONCURRENCY: 10
          };
        default:
          return null;
        }
      })
    });

    expect(serverAttr.app instanceof Koa).toBe(true);
    expect(queueManagement).toBeCalledWith(
      queueWorkerPaths,
      allQueues,
      serverAttr.app,
      workerConfig
    );
    expect(logger.info).toBeCalledWith('Enabling queue and queue-monitor dashboard.');
  });
});

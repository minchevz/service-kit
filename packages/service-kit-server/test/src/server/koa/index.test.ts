import Koa from 'koa';
import Router from '@koa/router';
import { ILogger } from '@service-kit/logger';

import server from '../../../../src/server/koa';
import { safeRedirect } from '../../../../src/utils/safeRedirect';
import openAPI from '../../../../src/middleware/open-api';
import registerRoutes from '../../../../src/server/koa/registerRoutes';

import { KoaServer, ServerOptions } from '../../../../types';
import { IConfig } from '@service-kit/common';

let errorCallback: (error: unknown) => void;

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
          (event, callback: (error: unknown) => void) => (errorCallback = callback)
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

  describe('When app throws overload errors', () => {
    afterEach(() => jest.resetAllMocks());

    it('should call the logger.warn method appropriate number of times', async () => {
      const middlewareMock = jest.fn();
      const additionalMiddleware = [ middlewareMock ];
      const options: ServerOptions = {
        additionalMiddleware,
        contractPaths: [ '/v1/example.yml', '/v2/example.yaml' ]
      };

      const serverAttr = await server(options, logger, {
        ...mockConfig,
        get: jest.fn((key: string) => {
          switch (key) {
          default:
            return 42;
          }
        })
      });

      serverAttr.app.context.log.warn({
        overload: true,
        eventLoopOverload: true,
        eventLoopDelay: 50,
        maxEventLoopDelay: 42
      });

      expect(logger.warn).toBeCalledTimes(1);
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

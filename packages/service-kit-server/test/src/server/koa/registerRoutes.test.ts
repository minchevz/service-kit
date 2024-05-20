import Koa from 'koa';
import Router from '@koa/router';
import registerRoutes from '../../../../src/server/koa/registerRoutes';

import { ILogger, IConfig } from '@service-kit/common';
import { Context, ServerApp, RouterApp, ServerOptions } from '../../../../types';

type controllers = {
  [key: string]: undefined | (() => void);
};

const mockControllers: controllers = {
  controller1: jest.fn(),
  controller2: jest.fn(),
  controller3: jest.fn(),
  controller4: jest.fn()
};

const fetchedControllers: {
  [key: string]: {
    path: string;
    method: string;
    controller?: string;
    details: {
      summary: string;
    };
  };
} = {
  controller1: {
    path: '/health/enhanced',
    method: 'get',
    controller: 'controller1',
    details: {
      summary: 'Returns /health/enhanced route'
    }
  },
  controller2: {
    path: '/health/enhanced/:level',
    method: 'get',
    controller: 'controller2',
    details: {
      summary: 'Returns the /health/enhanced/:level route'
    }
  },
  controller3: {
    path: '/health/live',
    method: 'get',
    controller: 'controller3',
    details: {
      summary: 'Returns the /health/live route'
    }
  },
  controller4: {
    path: '/some/other',
    method: 'post',
    controller: 'controller4',
    details: {
      summary: 'Returns the /some/other route'
    }
  }
};

const mockedUse = jest.fn();
const mockedGet = jest.fn();
const mockedPost = jest.fn();
const mockedLogger = jest.fn();

jest.mock(
  'koa',
  () =>
    class Koa {
      use = mockedUse;
    }
);

jest.mock(
  '@koa/router',
  () =>
    class Router {
      get = mockedGet;
      post = mockedPost;
      routes = jest.fn(() => 'routes');
      allowedMethods = jest.fn(() => 'allowedMethods');
    }
);

jest.mock('@service-kit/logger', () => jest.fn(() => ({ error: mockedLogger })));

jest.mock('../../../../src/utils/contract', () => ({
  parseRoutes: () => [
    fetchedControllers.controller1,
    fetchedControllers.controller2,
    fetchedControllers.controller3,
    fetchedControllers.controller4
  ],
  loadContracts: jest.fn()
}));

jest.mock('../../../../src/utils/validation', () => ({
  createSchema: () => ({
    '/health/enhanced': { get: { body: undefined, responses: {} } },
    '/health/enhanced/:level': { get: { body: undefined, responses: {} } },
    '/health/live': { get: { body: undefined, responses: {} } },
    '/some/other': { get: { body: undefined, responses: {} } }
  })
}));

jest.mock('../../../../src/utils/controllers', () => ({
  loadController: jest.fn((_, name) => mockControllers[name])
}));

const mockApp: ServerApp = new Koa();
const mockRouter: RouterApp = new Router<Koa.DefaultState, Context>();
const mockLogger: ILogger = {
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn()
};
const mockConfig: IConfig = {
  get: jest.fn().mockReturnValue('mock-auth-domain'),
  has: jest.fn(),
  set: jest.fn(),
  getProperties: jest.fn()
};
const options: ServerOptions = {
  contractPaths: [
    '/Users/pegacorn/service/src/contract/v1/example.yml',
    '/Users/pegacorn/service/src/contract/v2/example.yml'
  ]
};

describe('Given the registerRoutes', () => {
  beforeEach(
    async () =>
      await registerRoutes(options, {
        app: mockApp,
        router: mockRouter,
        logger: mockLogger,
        config: mockConfig
      })
  );

  afterEach(() => {
    jest.clearAllMocks();
    mockedUse.mockRestore();
    mockedGet.mockRestore();
    mockedPost.mockRestore();
    mockedLogger.mockRestore();
  });

  it('should register the all routes', () => {
    expect(mockRouter.get).toBeCalledTimes(3);
    expect(mockRouter.post).toBeCalledTimes(1);
  });

  it('should call use method with the correct params', () => {
    expect(mockApp.use).toBeCalledTimes(2);
    expect(mockApp.use).toBeCalledWith('routes');
    expect(mockApp.use).toBeCalledWith('allowedMethods');
  });

  describe('when one route is not assigned', () => {
    beforeAll(() => (mockControllers.controller1 = undefined));

    it('should register the other routes', () => {
      expect(mockRouter.get).toBeCalledTimes(2);
      expect(mockRouter.post).toBeCalledTimes(1);
    });

    it('should log the failed controller for that route', () => {
      expect(mockLogger.error).toBeCalledTimes(1);
      expect(mockLogger.error).toBeCalledWith(
        'Failed to load controller',
        fetchedControllers.controller1
      );
    });
  });

  describe('when there are no controller paths', () => {
    beforeAll(() => {
      Object.keys(mockControllers).forEach(key => (mockControllers[key] = undefined));
    });

    it('should NOT register any route', () => {
      expect(mockRouter.get).not.toHaveBeenCalled();
      expect(mockRouter.post).not.toHaveBeenCalled();
    });

    it('should log all controllers that are not found', () => {
      expect(mockLogger.error).toBeCalledTimes(4);

      Object.keys(fetchedControllers).forEach((key) => {
        expect(mockLogger.error).toBeCalledWith(
          'Failed to load controller',
          fetchedControllers[key]
        );
      });
    });
  });

  describe('when there are no controllers', () => {
    beforeAll(() => {
      Object.keys(fetchedControllers).forEach(
        key => (fetchedControllers[key].controller = undefined)
      );
    });

    it('should NOT register any routes', () => {
      expect(mockRouter.get).not.toHaveBeenCalled();
      expect(mockRouter.post).not.toHaveBeenCalled();
      expect(mockLogger.error).not.toHaveBeenCalled();
    });
  });
});

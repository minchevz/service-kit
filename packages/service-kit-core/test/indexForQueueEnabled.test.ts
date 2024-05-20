import {
  ServiceKitError,
  ServiceKitCustomHttpError,
  ServiceKitHttpError,
  ServiceKitApplicationError,
  ILogger,
  IConfig
} from '@service-kit/common';
import configLoader from '@service-kit/config-loader';
import logger from '@service-kit/logger';
import server from '@service-kit/server';
import { StatusCodes } from '../index';
import core, * as allExports from '../index';
import * as moduleUtils from '../src/utils/modules';
import { IServiceKit, IServiceKitManifest } from '../types';

const loggerMock: ILogger = {
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn()
};

const configMock: IConfig = {
  has: jest.fn(),
  get: jest.fn((key: string) => {
    switch (key) {
    case 'QUEUE_ENABLED':
      return true;
    case 'APP_VERSION':
      return 1;
    default:
      return null;
    }
  }),
  set: jest.fn(),
  getProperties: jest.fn()
};

jest.mock('@service-kit/config-loader', () => jest.fn().mockImplementation(() => configMock));
jest.mock('@service-kit/logger', () => jest.fn().mockImplementation(() => loggerMock));
jest.mock('@service-kit/server', () => ({
  __esModule: true,
  StatusCodes: 'mock-status-codes',
  default: jest.fn().mockResolvedValue('mock-server')
}));
jest.mock('../src/utils/modules');

describe('The ServiceKit Core Module', () => {
  const bootstrapMock = jest.spyOn(moduleUtils, 'bootstrap');

  afterEach(() => {
    bootstrapMock.mockReset();
  });

  const mockManifest: IServiceKitManifest = {
    id: 'id',
    name: 'name',
    configPaths: [],
    api: {
      contractPaths: [],
      controllerPaths: [],
      additionalMiddleware: []
    }
  };

  it('should export the ServiceKitError class', () => {
    expect(allExports).toHaveProperty('ServiceKitError', ServiceKitError);
  });

  it('should export the ServiceKitCustomHttpError class', () => {
    expect(allExports).toHaveProperty('ServiceKitCustomHttpError', ServiceKitCustomHttpError);
  });

  it('should export the ServiceKitHttpError class', () => {
    expect(allExports).toHaveProperty('ServiceKitHttpError', ServiceKitHttpError);
  });

  it('should export the ServiceKitApplicationError class', () => {
    expect(allExports).toHaveProperty('ServiceKitApplicationError', ServiceKitApplicationError);
  });

  describe('when constructed', () => {
    let coreExports: IServiceKit;

    beforeAll(async () => {
      coreExports = await core(mockManifest);
    });

    it('should construct a @service-kit/config-loader instance', () => {
      expect(configLoader).toBeCalledWith({
        configPaths: mockManifest.configPaths
      });
    });

    it('should construct a @service-kit/logger instance', () => {
      expect(logger).toBeCalledWith({
        id: mockManifest.id,
        name: mockManifest.name,
        version: 1
      });
    });

    it('should construct and expose a @service-kit/server instance', () => {
      expect(server).toBeCalledWith(mockManifest.api, loggerMock, configMock);
      expect(coreExports).toHaveProperty('server', 'mock-server');
    });

    it('should not attempt to bootstrap anything else', () => {
      expect(bootstrapMock).not.toHaveBeenCalled();
    });
  });

  describe('when constructed with additional modules', () => {
    const moduleFactory = (name: string) => ({
      name,
      dependencies: [],
      bootstrap: jest.fn()
    });

    const mockManifestWithModules = {
      ...mockManifest,
      modules: [ moduleFactory('queue') ]
    };

    describe('and all bootstraps resolve', () => {
      let coreExports: IServiceKit;

      beforeAll(async () => {
        bootstrapMock.mockReturnValue(Promise.resolve({ queue: 'test_123' }));
        coreExports = await core(mockManifestWithModules);
      });

      it('should attempt to bootstrap all provided modules', () => {
        expect(bootstrapMock).toHaveBeenCalledTimes(mockManifestWithModules.modules.length);
        mockManifestWithModules.modules.forEach((module) => {
          expect(bootstrapMock).toHaveBeenCalledWith(
            configMock,
            loggerMock,
            expect.any(Object),
            module
          );
        });
      });

      it('should construct as expected', () => {
        expect(coreExports).toHaveProperty('server');
      });
    });

    describe('but a module bootstrap rejects', () => {
      it('should throw an error upon initialisation', async () => {
        const ERROR_MESSAGE = 'mock-error';

        bootstrapMock.mockRejectedValueOnce(ERROR_MESSAGE);
        await expect(core(mockManifestWithModules)).rejects.toEqual(ERROR_MESSAGE);
      });
    });
  });

  describe('StatusCodes', () => {
    it('should be exported for ease of use', () => {
      expect(StatusCodes).toEqual('mock-status-codes');
    });
  });
});

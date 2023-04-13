import { Server } from 'http';
import terminus from '@godaddy/terminus';
import { IConfig, ILogger } from '@service-kit/common';

import index from '../../../../index';
import * as gracefullShutdown from '../../../../src/server/koa/gracefullShutdown';
import { ServerExport } from '../../../../types';

const mockListen = jest.fn();
const mockConfig: IConfig = {
  get: jest.fn(),
  has: jest.fn(),
  set: jest.fn(),
  getProperties: jest.fn()
};
const mockLogger: ILogger = {
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn()
};

jest.mock('../../../../src/server/koa', () => () => ({
  app: { listen: mockListen, callback: jest.fn() }
}));

jest.mock('process', () => () => ({
  kill: jest.fn()
}));

const options = { contractPaths: [], controllerPaths: [], healthChecks: [] };

describe('Given the @service-kit/server package', () => {
  let app: ServerExport;
  let server: Server;
  const mockTerminus = jest.spyOn(terminus, 'createTerminus');

  beforeEach(async () => {
    jest.resetModules();
    app = await index(options, mockLogger, mockConfig);
  });

  afterEach(() => {
    server.close();
  });

  it('should call the server app listen method with a port', async () => {
    server = await app.listen(8000);

    expect(mockTerminus).toBeCalledTimes(1);
  });

  describe('when onSignal is called', () => {
    it('should call log warning', async () => {
      gracefullShutdown.onSignal();

      expect(mockLogger.warn).toHaveBeenCalledWith('App is starting cleanup!');
    });
  });

  describe('when onShutdown is called', () => {
    it('should call log warning', async () => {
      gracefullShutdown.onShutdown();

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Cleanup finished, App is gracefully shutting down!'
      );
    });
  });

  describe('when onShutdown is called', () => {
    it('should call log warning', async () => {
      const result = await gracefullShutdown.beforeShutdown<boolean>();

      expect(result).toEqual(undefined);
      expect(mockLogger.warn).toHaveBeenCalledTimes(2);
    });
  });

  describe('when node env is production', () => {
    it('should set beforeShutdown option', async () => {
      expect(gracefullShutdown.options(mockLogger.warn, 'production').beforeShutdown).toBeDefined();
    });
  });
});

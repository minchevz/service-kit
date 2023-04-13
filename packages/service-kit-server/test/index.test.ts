import { IConfig, ILogger } from '@service-kit/common';
import { ServerExport } from '../types';

import index from '../index';

const PORT = 3000;
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

jest.mock('../src/server/koa', () => () => ({ app: { listen: mockListen } }));
jest.mock('../src/server/koa/gracefullShutdown', () => () => ({ listen: mockListen }));

const options = { contractPaths: [], controllerPaths: [], healthChecks: [] };

describe('Given the @service-kit/server package', () => {
  let server: ServerExport;

  beforeAll(async () => {
    server = await index(options, mockLogger, mockConfig);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('when the exposed listen method is called with a port', () => {
    it('should call the server app listen method with a port', async () => {
      server.listen(PORT);

      expect(mockListen).toBeCalledTimes(1);
      expect(mockListen).toBeCalledWith(PORT);
    });
  });

  describe('when the exposed listen method is called without a port', () => {
    it('should call the server app listen method without a port', async () => {
      server.listen();

      expect(mockListen).toBeCalledTimes(1);
      expect(mockListen).toBeCalledWith(undefined);
    });
  });
});

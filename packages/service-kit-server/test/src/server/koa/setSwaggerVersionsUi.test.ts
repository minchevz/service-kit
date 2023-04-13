import Koa from 'koa';
import { ILogger } from '@service-kit/logger';

import { ServerApp } from '../../../../types';
import setSwaggerVersionsUi from '../../../../src/server/koa/setSwaggerVersionsUi';

const mockedUse = jest.fn();
const mockedLogger = jest.fn();

jest.mock(
  'koa',
  () =>
    class Koa {
      use = mockedUse;
    }
);
jest.mock('koa-static');
jest.mock('koa-mount');
jest.mock('../../../../src/middleware/swaggerUi');

const mockApp: ServerApp = new Koa();
const mockLogger: ILogger = {
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn()
};

const options = { contractPaths: [ '/v1/example.yml', '/v2/example.yaml' ] };

describe('Given a setSwaggerVersionsUi utility,', () => {
  beforeEach(async () => await setSwaggerVersionsUi(mockApp, options, mockLogger));

  afterEach(() => {
    jest.clearAllMocks();
    mockedUse.mockRestore();
    mockedLogger.mockRestore();
  });

  it('should call app.use as many as contract files plus swaggerui', () => {
    expect(mockApp.use).toBeCalledTimes(3);
    expect(mockLogger.info).toBeCalledTimes(1);
    expect(mockLogger.info).toHaveBeenCalledWith('Swagger Versions UI is ready!');
  });
});

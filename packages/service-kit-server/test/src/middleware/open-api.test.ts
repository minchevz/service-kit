import openApiMiddleware from '../../../src/middleware/open-api';
import baseContract from '../../../src/contracts/base.json';
import { oas } from 'koa-oas3';
import { ILogger } from '@service-kit/common';

jest.mock('../../../src/utils/contract');
import { loadContracts } from '../../../src/utils/contract';
const mockLoadContracts = loadContracts as jest.Mock;

const logger: ILogger = {
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn()
};

const mockLoggerError = logger.error as jest.Mock;

jest.mock('koa-oas3', () => ({ oas: jest.fn() }));

describe('Given the Open API Middleware', () => {
  afterEach(() => (oas as jest.Mock).mockReset());

  it('should call the open API with the correct params', async () => {
    mockLoadContracts.mockImplementationOnce(baseContract => baseContract);

    await openApiMiddleware({ contractPaths: [] }, logger);

    expect(oas).toBeCalledTimes(1);
    expect(oas).toBeCalledWith({
      endpoint: '/contract.json',
      spec: baseContract,
      uiEndpoint: '/',
      validateResponse: true
    });
  });

  it('should call the open API with the correct params when default server options', async () => {
    mockLoadContracts.mockImplementationOnce(baseContract => baseContract);

    await openApiMiddleware({ contractPaths: [ '/v1/example.yml' ] }, logger);

    expect(oas).toBeCalledTimes(1);
    expect(oas).toBeCalledWith({
      endpoint: '/contract.json',
      spec: baseContract,
      uiEndpoint: '/',
      validateResponse: true
    });
  });

  it('should handle thrown exceptions', async () => {
    mockLoadContracts.mockImplementationOnce(() => {
      throw new Error('OpenAPI error');
    });

    await expect(() => openApiMiddleware({ contractPaths: [] }, logger)).rejects.toThrow();

    expect(mockLoggerError.mock.calls.length).toBe(1);
  });

  it('should throw error for invalid contract paths', async () => {
    mockLoadContracts.mockImplementationOnce(baseContract => baseContract);

    const openApiPromise = openApiMiddleware({ contractPaths: [ '/d3/example.yml', '/v1/example.yml' ] }, logger);

    await expect(openApiPromise).rejects.toThrow('Invalid version definition ! Please use v1/v2/vX format.');
  });

  it('should throw error for invalid contract extensions', async () => {
    mockLoadContracts.mockImplementationOnce(baseContract => baseContract);

    const openApiPromise = openApiMiddleware({ contractPaths: [ '/v1/example.json' ] }, logger);

    await expect(openApiPromise).rejects.toThrow('Invalid contract file extention! Please use .yml/yaml format.');
  });
});

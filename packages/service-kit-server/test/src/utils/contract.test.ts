/* eslint-disable @typescript-eslint/no-explicit-any */
import SwaggerParser from '@apidevtools/swagger-parser';
import deepmerge from 'deepmerge';
import { ILogger } from '@service-kit/common';

import { loadContracts, parseRoutes, validateContractVersionedPaths } from '../../../src/utils/contract';
import { ISwaggerSpec, IRoute } from '../../../src/interfaces/contract-interfaces';

const logger: ILogger = {
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn()
};

const loggerErrorMock = logger.error as jest.Mock;

const mockBaseContract = { some: 'thing' };
const mockContracts = [ 'contract/v1/contract.yml', 'contract/v2/second.yml', 'contract/v3/example.yml' ];

const mockMergedContract = {
  servers: [
    {
      url: 'http://localhost',
      name: 'local'
    },
    {
      url: 'http://localhost',
      name: 'local'
    },
    {
      url: 'http://localhost',
      name: 'local'
    }
  ]
};

jest.mock('@apidevtools/swagger-parser');
jest.mock('deepmerge');

const mockContractValue1st = {
  info: 'example-contract',
  paths: {
    '/v1/example': {}
  }
};
const mockContractValue2nd = {
  info: 'example-contract',
  paths: {
    '/v2/example': {}
  }
};
const mockContractValue3rd = {
  info: 'example-contract',
  paths: {
    '/v3/example': {}
  }
};

describe('The Contract utils module', () => {
  describe('loadContracts', () => {
    const mergeStub = jest.spyOn(deepmerge, 'all');
    const parseStub: any = jest.spyOn(SwaggerParser, 'validate');
    let finalContract: Partial<ISwaggerSpec>;

    beforeAll(async () => {
      parseStub
        .mockImplementationOnce(() => mockContractValue1st)
        .mockImplementationOnce(() => mockContractValue2nd)
        .mockImplementationOnce(() => mockContractValue3rd);
      mergeStub.mockReturnValue(mockMergedContract);
      finalContract = await loadContracts(mockBaseContract, mockContracts, logger);
    });

    it('should parse each contract file specified', () => {
      expect(parseStub).toHaveBeenCalledTimes(mockContracts.length);
      mockContracts.forEach(contract => expect(parseStub).toHaveBeenCalledWith(contract));
    });

    it('should merge each contract together', () => {
      expect(mergeStub).toHaveBeenCalledWith([
        mockBaseContract,
        mockContractValue1st,
        mockContractValue2nd,
        mockContractValue3rd
      ]);
    });

    it('should dedupe servers array in merged contract', () => {
      expect(finalContract.servers).toEqual([
        {
          url: 'http://localhost',
          name: 'local'
        }
      ]);
    });
  });

  describe('when invalid contracts', () => {
    it('should throw exception', async () => {
      const parseStub = jest.spyOn(SwaggerParser, 'validate');

      parseStub.mockRejectedValueOnce('example-contract');
      await expect(loadContracts(mockBaseContract, mockContracts, logger)).rejects.toThrow(
        'Invalid OpenAPI contract'
      );
      expect(loggerErrorMock.mock.calls.length).toEqual(1);
    });
  });

  describe('parseRoutes', () => {
    let parsedRoutes: IRoute[];
    const exampleContract: ISwaggerSpec = {
      servers: [],
      paths: {
        '/examples': {
          get: {
            'x-controller': 'controllers/example/list'
          }
        },
        '/example/{id}': {
          get: {
            'x-controller': 'controllers/example/get'
          },
          post: {
            'x-controller': 'controllers/example/post'
          }
        }
      }
    };

    beforeAll(() => {
      parsedRoutes = parseRoutes(exampleContract);
    });

    it('should automatically parse and format paths when required', () => {
      expect(parsedRoutes).toEqual([
        {
          controller: 'controllers/example/list',
          method: 'get',
          path: '/examples',
          details: { 'x-controller': 'controllers/example/list' }
        },
        {
          controller: 'controllers/example/get',
          method: 'get',
          path: '/example/:id',
          details: { 'x-controller': 'controllers/example/get' }
        },
        {
          controller: 'controllers/example/post',
          method: 'post',
          path: '/example/:id',
          details: { 'x-controller': 'controllers/example/post' }
        }
      ]);
    });
  });

  describe('Given validateContractVersionedPaths function,', () => {
    describe('when paths are NOT defined based on its own version', () => {
      it('should throw exception', async () => {
        expect(() => validateContractVersionedPaths({
          paths: {
            '/version2/example': {}
          },
          servers: [ { url: 'http://localhost', description: 'test' } ]
        }, 1)).toThrow('Invalid contract path defined! Path "/version2/example" must have correct version prefix');
      });
    });
  });

  describe('Given validateContractVersionedPaths function,', () => {
    describe('when paths have wrong version defined based on its own version', () => {
      const index = 1;
      const versionNumber = index + 1;
      const path = `/v1/example`;

      it('should throw exception', async () => {
        expect(() => validateContractVersionedPaths({
          paths: {
            [path]: {}
          },
          servers: [ { url: 'http://localhost', description: 'test' } ]
        }, index)).toThrow(`Invalid path definition ! v${ versionNumber } Version mismatch in path ${ path }`);
      });
    });
  });
});

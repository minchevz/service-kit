import SwaggerParser from '@apidevtools/swagger-parser';
import { ILogger } from '@service-kit/common';
import deepmerge from 'deepmerge';
import { ISwaggerSpec } from '../../../src/interfaces/contract-interfaces';
import { loadContracts } from '../../../src/utils/contract';
import { flattenContracts } from '../../../src/utils/mergeContracts';

const logger: ILogger = {
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn()
};

const mockBaseContract = { some: 'thing' };
const mockContracts = [
  'contract/v1/contract.yml',
  'contract/v2/second.yml',
  'contract/v3/example.yml'
];

jest.mock('@apidevtools/swagger-parser');
jest.mock('deepmerge');
jest.mock('js-yaml');
jest.mock('fs');

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
  const mergeStub = jest.spyOn(deepmerge, 'all');
  let finalContract: ISwaggerSpec;
  const parseStub: jest.SpyInstance = jest.spyOn(SwaggerParser, 'validate');
  const mockExit = jest.spyOn(process, 'exit').mockImplementation();

  afterEach(async () => {
    jest.resetAllMocks();
    process.argv = [];
  });
  describe('when all correct arguments passed ', () => {
    beforeEach(async () => {
      process.argv.push(
        ...[ 'dummy-arg-1', 'dummy-arg-2', '--contract-path', '/tmp/squashed-contract.yml' ]
      );
      parseStub
        .mockImplementationOnce(() => mockContractValue1st)
        .mockImplementationOnce(() => mockContractValue2nd)
        .mockImplementationOnce(() => mockContractValue3rd);
      mergeStub.mockReturnValue(mockMergedContract);

      finalContract = await loadContracts(mockBaseContract, mockContracts, logger);
    });

    it('should exit with success ', async () => {
      await flattenContracts(finalContract, logger);
      expect(parseStub).toHaveBeenCalledTimes(mockContracts.length);
      expect(parseStub).toHaveBeenCalledTimes(mockContracts.length);
      mockContracts.forEach(contract => expect(parseStub).toHaveBeenCalledWith(contract));
      expect(mockExit).toBeCalled();
      expect(mockExit).toHaveBeenCalledWith(0);
    });
  });

  describe('when file extension is wrong ', () => {
    beforeEach(async () => {
      process.argv.push(
        ...[
          'dummy-arg-1',
          'dummy-arg-2',
          '--contract-path',
          '/tmp/squashed-contract.random-extension'
        ]
      );
      parseStub
        .mockImplementationOnce(() => mockContractValue1st)
        .mockImplementationOnce(() => mockContractValue2nd)
        .mockImplementationOnce(() => mockContractValue3rd);
      mergeStub.mockReturnValue(mockMergedContract);

      finalContract = await loadContracts(mockBaseContract, mockContracts, logger);
    });

    it('Should log no merging', async () => {
      await flattenContracts(finalContract, logger);
      expect(logger.info).toHaveBeenCalledWith('No merging');
    });
  });

  describe('When merging is not required ', () => {
    beforeEach(async () => {
      process.argv.push(...[ 'dummy-arg-1', 'dummy-arg-2', 'dummy-arg-3', 'dummy-arg-4' ]);
      parseStub
        .mockImplementationOnce(() => mockContractValue1st)
        .mockImplementationOnce(() => mockContractValue2nd)
        .mockImplementationOnce(() => mockContractValue3rd);
      mergeStub.mockReturnValue(mockMergedContract);

      finalContract = await loadContracts(mockBaseContract, mockContracts, logger);
    });

    it('should log it gracefully ', async () => {
      await flattenContracts(finalContract, logger);
      expect(logger.info).toHaveBeenCalledWith('No merging');
    });
  });
});

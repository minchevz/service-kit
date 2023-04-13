import logger from '@service-kit/logger';
import { accessHandler, bootstrap } from '../../../src/utils/modules';

describe('The modules util module', () => {
  describe('the access handler', () => {
    const expectedErrorMessage = 'Unable to access modules before bootstrapping';

    it('should throw an error if the target has not been marked as bootstrapped', () => {
      expect(() => accessHandler({ _bootstrapped: false, config: 'example' }, 'config')).toThrow(
        expectedErrorMessage
      );
    });

    it('should return the property of the target if bootstrapped', () => {
      expect(accessHandler({ _bootstrapped: true, config: 'example' }, 'config')).toEqual(
        'example'
      );
    });
  });

  describe('the bootstrap function', () => {
    const mockConfig = {
      get: jest.fn(),
      getProperties: jest.fn(),
      has: jest.fn(),
      set: jest.fn()
    };
    const mockLogger = logger({ id: 'id', name: 'name', version: '1.0.0' });
    const mockModule = {
      name: 'example',
      dependencies: [ 'a', 'b', 'c' ],
      bootstrap: jest.fn().mockResolvedValue('mock-module')
    };
    const mockDependencies = {
      config: 'mock-config',
      a: 'mock-a',
      b: 'mock-b',
      c: 'mock-c'
    };

    let result: unknown;

    beforeAll(async () => {
      result = await bootstrap(mockConfig, mockLogger, mockDependencies, mockModule);
    });

    it('should populate and bootstrap ', () => {
      const { a, b, c } = mockDependencies;
      const populatedModules = [ a, b, c ];

      expect(mockModule.bootstrap).toHaveBeenCalledWith(mockConfig, mockLogger, populatedModules);
    });

    it('should return the resolved value ', () => {
      expect(result).toEqual('mock-module');
    });
  });
});

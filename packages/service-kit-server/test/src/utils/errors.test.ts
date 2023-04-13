import { promises } from 'fs';
import { loadErrorDictionaries, findDictionaryLocale } from '../../../src/utils/errors';
import { IErrorMap } from '../../../types';

jest.mock('fs', () => ({
  promises: {
    readdir: jest.fn()
  }
}));

describe('The Errors utils module', () => {
  describe('loadErrorDictionaries', () => {
    const mockDirectories = [ 'src/errors/', 'src/more/', 'src/spain/errors/' ];

    const mockFileResults = [ 'errors.ts', 'errors.d.ts' ];

    const mockErrorDictionaries = [
      {
        language_code: 'en',
        errors: {
          missing: {
            message: 'Not Found',
            http_code: 404
          },
          internal_error: {
            message: 'Internal server error',
            http_code: 500
          }
        }
      },
      {
        language_code: 'en',
        errors: {
          extra: {
            message: 'Extra',
            http_code: 404
          }
        }
      },
      {
        language_code: 'es',
        errors: {
          test: {
            message: 'El Testo!',
            http_code: 401
          }
        }
      }
    ];

    let result: IErrorMap;

    mockDirectories.forEach((dir, index) => {
      const fileContents =
        index % 2 === 0 ? { default: mockErrorDictionaries[index] } : mockErrorDictionaries[index];

      jest.mock(`${ dir }errors.ts`, () => fileContents, { virtual: true });
    });

    beforeAll(async () => {
      (promises.readdir as jest.Mock).mockResolvedValue(mockFileResults);
      result = await loadErrorDictionaries(mockDirectories);
    });

    it('should get all files in all the specified directories', () => {
      mockDirectories.forEach((dir) => {
        expect(promises.readdir).toBeCalledWith(dir);
      });
    });

    it('should read in all files and merge', () => {
      expect(result).toHaveProperty('en');
      expect(result.en).toEqual({
        extra: {
          http_code: 404,
          message: 'Extra'
        },
        internal_error: {
          http_code: 500,
          message: 'Internal server error'
        },
        missing: {
          http_code: 404,
          message: 'Not Found'
        }
      });
      expect(result).toHaveProperty('es');
      expect(result.es).toEqual({
        test: {
          http_code: 401,
          message: 'El Testo!'
        }
      });
    });
  });

  describe('findDictionaryLocale', () => {
    const dummyErrorMap = {
      es: {
        test: {
          http_code: 500,
          message: 'Spanish Example'
        }
      },
      en: {
        test: {
          http_code: 500,
          message: 'English Example'
        }
      }
    };

    it('should use the header if present', () => {
      const result = findDictionaryLocale(dummyErrorMap, 'es;q=0.5');

      expect(result).toEqual(dummyErrorMap.es);
    });

    it('should default to english if the header value has no dictionary', () => {
      const result = findDictionaryLocale(dummyErrorMap, 'fr;q=0.5');

      expect(result).toEqual(dummyErrorMap.en);
    });

    it('should default to english if no header value', () => {
      const result = findDictionaryLocale(dummyErrorMap);

      expect(result).toEqual(dummyErrorMap.en);
    });
  });
});

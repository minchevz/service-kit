import { IConfig } from '@service-kit/common';
import convict, { Schema } from 'convict';
import dotenv from 'dotenv';

import configLoader from '../index';

let validateSpy: jest.SpyInstance;

jest.mock('dotenv');
jest.mock('convict', () => {
  const originalConvict = jest.requireActual('convict');

  return jest.fn((config: Schema<unknown>) => {
    const constructedConvict = originalConvict(config);

    validateSpy = jest.spyOn(constructedConvict, 'validate');

    return constructedConvict;
  });
});

const mockPaths = [
  'example/first.json',
  'example/second.json',
  'example/third.json',
  'example/fourth.ts'
];
const mockConfigs = [
  {
    Client: {
      example: {
        doc: 'The NODE_CLIENT_EXAMPLE environment.',
        default: 'client-example-value',
        env: 'NODE_CLIENT_EXAMPLE'
      }
    }
  },
  {
    Client: {
      another: {
        doc: 'The NODE_ANOTHER_EXAMPLE environment.',
        default: 'client-another-value',
        env: 'NODE_CLIENT_EXAMPLE'
      }
    }
  },
  {
    Feature: {
      example: {
        doc: 'The NODE_FEATURE_EXAMPLE environment.',
        default: 'my-feature-value',
        env: 'NODE_FEATURE_EXAMPLE'
      }
    }
  },
  {
    default: {
      Feature: {
        typescript: {
          doc: 'Should handle typescript.',
          default: 'my-feature-value',
          env: 'NODE_TS_EXAMPLE'
        }
      }
    }
  }
];

mockPaths.forEach((path, index) => {
  jest.mock(path, () => mockConfigs[index], { virtual: true });
});

describe('Config loader', () => {
  it('should export a function', () => {
    expect(configLoader).toBeInstanceOf(Function);
  });

  describe('when no additional configs provided', () => {
    let config: IConfig;
    const expectedValue = process.env.NODE_ENV;

    beforeAll(() => {
      config = configLoader();
    });

    it('should read environment config using dotenv', () => {
      expect(dotenv.config).toBeCalled();
    });

    it('should only provide base level config', () => {
      expect(convict).toBeCalledWith({
        Base: {
          env: {
            default: 'development',
            doc: 'The application environment.',
            env: 'NODE_ENV'
          }
        }
      });
    });

    it('should validate the config', () => {
      expect(validateSpy).toBeCalledWith({ allowed: 'strict' });
    });

    it('should allow accessing the basic config', () => {
      expect(config.get('Base.env')).toEqual(expectedValue);
    });
  });

  describe('when initialised with additional config files', () => {
    let config: IConfig;
    const dummyEnvVariable = 'THIS_IS_A_TEST';

    beforeAll(() => {
      process.env.NODE_FEATURE_EXAMPLE = dummyEnvVariable;
      config = configLoader({ configPaths: mockPaths });
    });

    it('should require and merge all provided files before constructing', () => {
      expect(convict).toBeCalledWith({
        Base: {
          env: {
            default: 'development',
            doc: 'The application environment.',
            env: 'NODE_ENV'
          }
        },
        Client: {
          example: {
            doc: 'The NODE_CLIENT_EXAMPLE environment.',
            default: 'client-example-value',
            env: 'NODE_CLIENT_EXAMPLE'
          },
          another: {
            doc: 'The NODE_ANOTHER_EXAMPLE environment.',
            default: 'client-another-value',
            env: 'NODE_CLIENT_EXAMPLE'
          }
        },
        Feature: {
          example: {
            doc: 'The NODE_FEATURE_EXAMPLE environment.',
            default: 'my-feature-value',
            env: 'NODE_FEATURE_EXAMPLE'
          },
          typescript: {
            doc: 'Should handle typescript.',
            default: 'my-feature-value',
            env: 'NODE_TS_EXAMPLE'
          }
        }
      });
    });

    it('should follow convict defaulting strategy', () => {
      expect(config.get('Client.example')).toEqual('client-example-value');
    });

    it('should allow setting config variables from environment variables', () => {
      expect(config.get('Feature.example')).toEqual(dummyEnvVariable);
    });
  });
});

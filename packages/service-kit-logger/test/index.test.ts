/* eslint-disable @typescript-eslint/no-var-requires */
const { NODE_ENV, LOG_LEVEL, LOG_PATH } = process.env;

const loggerOptions = {
  id: 'logger-example-id',
  name: 'logger-example-name',
  version: '1.0.0'
};

const defaultTransportOptions = {
  filename: 'logs/app_.log',
  datePattern: 'YYYY-MM-DD-HH',
  maxFiles: 2,
  maxSize: 16777216
};

describe('Logger Service', () => {
  const addMock = jest.fn();
  const fileMock = jest.fn();
  const consoleMock = jest.fn();

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation();

    jest.mock('winston', () => {
      const winston = jest.requireActual('winston');

      return {
        ...winston,
        createLogger: jest.fn().mockImplementation(() => ({ add: addMock })),
        transports: {
          Console: jest.fn().mockImplementation(() => consoleMock),
          File: jest.fn().mockImplementation(() => fileMock),
          DailyRotateFile: jest.fn().mockImplementation(() => fileMock)
        }
      };
    });

    jest.mock('winston-daily-rotate-file', () => () => ({
      name: 'Jody',
      methodOne: () => 10,
      methodTwo: () => 25
    }));
  });

  afterEach(() => {
    process.env.NODE_ENV = NODE_ENV;
    process.env.LOG_PATH = LOG_PATH || '';
    process.env.LOG_LEVEL = LOG_LEVEL || '';

    addMock.mockReset();
    jest.resetModules();
  });

  it('should export a function', () => {
    const logger = require('../index').default;

    expect(logger).toBeInstanceOf(Function);
  });

  it('should call createLogger with expected options', () => {
    const { createLogger } = require('winston');
    const logger = require('../index').default;

    logger(loggerOptions);

    const expected = {
      defaultMeta: loggerOptions,
      level: 'info',
      format: expect.anything(),
      transports: [ fileMock ]
    };

    expect(createLogger).toHaveBeenCalledWith(expected);
  });

  it('should call createLogger with LOG_LEVEL override', () => {
    const level = 'debug';

    process.env.LOG_LEVEL = level;
    const { createLogger } = require('winston');
    const logger = require('../index').default;

    logger(loggerOptions);

    const expected = {
      defaultMeta: loggerOptions,
      level: 'debug',
      format: expect.anything(),
      transports: [ fileMock ]
    };

    expect(createLogger).toHaveBeenCalledWith(expected);
  });

  it('should call logger.add with LOG_LEVEL override', () => {
    const level = 'debug';

    process.env.LOG_LEVEL = level;
    const { transports } = require('winston');

    const logger = require('../index').default;

    logger(loggerOptions);

    const expected = {
      format: expect.anything(),
      level: 'debug'
    };

    expect(transports.Console).toHaveBeenCalledWith(expected);
    expect(addMock).toHaveBeenCalledWith(consoleMock);
  });

  describe('when not in production mode', () => {
    it('should call logger.add with default console options', () => {
      const { transports } = require('winston');

      const logger = require('../index').default;

      logger(loggerOptions);

      const expected = {
        format: expect.anything(),
        level: 'info'
      };

      expect(transports.Console).toHaveBeenCalledWith(expected);
      expect(addMock).toHaveBeenCalledWith(consoleMock);
    });
  });

  describe('when in production mode', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
    });

    it('should call transports.File with production filename', () => {
      const { transports } = require('winston');
      const logger = require('../index').default;

      logger(loggerOptions);

      const expected = {
        ...defaultTransportOptions,
        filename: `logs/app_.log`
      };

      expect(transports.DailyRotateFile).toHaveBeenCalledWith(expected);
    });
  });
});

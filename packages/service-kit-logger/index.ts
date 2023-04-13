import { ILogger } from '@service-kit/common';
import { transports, createLogger, format, Logger } from 'winston';
import 'winston-daily-rotate-file';
import { ILoggerOptions } from './types';
import timestampFirst from './src/formatters/timestampFirst';

const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const LOG_PATH = process.env.LOG_PATH || 'logs/app_.log';

export { ILoggerOptions } from './types';
export { ILogger } from '@service-kit/common';

function getFileTransportOptions() {
  return {
    filename: LOG_PATH,
    datePattern: 'YYYY-MM-DD-HH',
    maxSize: 16 * 1024 * 1024,
    maxFiles: 2
  };
}

export default (options: ILoggerOptions): ILogger => {
  const logger: Logger = createLogger({
    level: LOG_LEVEL,
    format: format.combine(
      format.errors({ stack: true }),
      format.splat(),
      format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss ZZ'
      }),
      timestampFirst,
      format.json()
    ),
    defaultMeta: { ...options },
    transports: [ new transports.DailyRotateFile(getFileTransportOptions()) ]
  });

  logger.add(
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
      level: LOG_LEVEL
    })
  );

  return logger;
};

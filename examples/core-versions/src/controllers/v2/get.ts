import { logger, Context } from '@service-kit/core';

export default (context: Context): void => {
  logger.info('Accessing example controller');

  context.status = 200;
  context.body = {
    data: ['Some dummy data'],
    config: 'version 222222'
  };
};

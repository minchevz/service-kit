import { logger, Context } from '@service-kit/core';

export default async (context: Context): Promise<void> => {
  logger.info('Accessing example controller');

  context.status = 200;
  context.body = {
    token: context.memberAuthToken
  };
};

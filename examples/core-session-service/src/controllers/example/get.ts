import { config, logger, Context, SessionService } from '@service-kit/core';

const AUTH_HOST = config.get('AUTH_DOMAIN');

export default async (context: Context): Promise<void> => {
  logger.info('Accessing example controller');
  const sessionID = '123';

  const token = await SessionService.authenticate(AUTH_HOST, sessionID);

  context.status = 200;
  context.body = {
    token
  };
};

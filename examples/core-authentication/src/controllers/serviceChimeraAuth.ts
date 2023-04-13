import { config, logger, Context, ChimeraAuthService } from '@service-kit/core';

const AUTH_HOST = config.get('AUTH_DOMAIN');

export default async (context: Context): Promise<void> => {
  logger.info('Accessing example controller');
  const { 'client-memberid': memberID, 'client-authtoken': token } = context.headers;

  const memberAuthToken = await ChimeraAuthService.authenticate(AUTH_HOST, {
    memberId: Number(memberID),
    authToken: String(token)
  });

  context.status = 200;
  context.body = {
    token: memberAuthToken
  };
};

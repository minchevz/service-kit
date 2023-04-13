import { config, logger } from '@service-kit/core';

import server from './server';

(async () => {
  const app = await server();
  const port = config.get('port');

  await app.listen(port);

  logger.info(`Server started on port ${ port }`);
})().catch((error) => {
  logger.error('Unexpected Error', error);
});

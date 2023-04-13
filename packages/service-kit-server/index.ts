import { Server } from 'http';
import server from './src/server/koa';
import { IConfig, ILogger } from '@service-kit/common';
import { ServerExport, ServerOptions, Context } from './types';
import gracefullShutdown from './src/server/koa/gracefullShutdown';

export { Context };
export * as StatusCodes from './src/constants/statusCodes';

export default async (
  options: ServerOptions,
  logger: ILogger,
  config: IConfig
): Promise<ServerExport> => {
  const { app } = await server(options, logger, config);

  return {
    listen: async (port?: number | null): Promise<Server> => {
      if (port) {
        logger.info(`Service starting on ${ port }`);
      }

      const appServer = gracefullShutdown(app, logger);

      return await appServer.listen(port);
    }
  };
};

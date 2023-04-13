import server from '@service-kit/server';
import Config from '@service-kit/config-loader';
import serviceKitLogger from '@service-kit/logger';
import { Middleware } from 'koa';

const logger = serviceKitLogger({
  id: 'logger-example-id',
  name: 'logger-example-name',
  version: '1.0.0'
});

const additionalMiddleware: Middleware = async (ctx, next) => {
  const start = Date.now();
  await next();
  const functionDuration = Date.now() - start;
  logger.info(`${ctx.method} ${ctx.url} - ${functionDuration}ms`);
};

const config = Config();

(async () => {
  const serverInstance = await server(
    {
      contractPaths: [`${__dirname}/contract/v1/example.yml`],
      controllerPaths: [`${__dirname}/controllers/`],
      additionalMiddleware: [additionalMiddleware]
    },
    logger,
    config
  );

  const PORT = 3002;
  logger.info(`Example available at http://localhost:${PORT}/example`);
  serverInstance.listen(PORT);
})();

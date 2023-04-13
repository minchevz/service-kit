import server from '@service-kit/server';
import serviceKitLogger from '@service-kit/logger';
import Config from '@service-kit/config-loader';

const serviceLogger = serviceKitLogger({
  id: 'redirect-basic-id',
  name: 'redirect-basic',
  version: '1.8.0'
});

const config = Config();
const Koa = require('koa');
const app = new Koa();

(async () => {
  const serverInstance = await server(
    {
      contractPaths: [`${__dirname}/contract/v1/example.yml`],
      controllerPaths: [`${__dirname}/controllers/`]
    },
    serviceLogger,
    config
  );

  serverInstance.listen(3002);
})();

import core from '@service-kit/core';

(async () => {
  const { server } = await core({
    id: 'error-dictionaries',
    name: 'error-dictionaries',
    configPaths: [`${__dirname}/config/config`],
    api: {
      contractPaths: [`${__dirname}/contract/v1/example.yml`],
      controllerPaths: [`${__dirname}/controllers/`],
      errorDirectories: [`${__dirname}/errors/`]
    }
  });

  server.listen(3002);
})();

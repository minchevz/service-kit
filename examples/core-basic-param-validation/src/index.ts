import core from '@service-kit/core';

(async () => {
  const { server } = await core({
    id: 'core-basic-param-validation',
    name: 'core-basic-param-validation',
    api: {
      contractPaths: [`${__dirname}/contract/v1/dummy.yml`],
      controllerPaths: [`${__dirname}/controllers/`]
    }
  });

  await server.listen(3002);
})();

import core from '@service-kit/core';

(async () => {
  const { server } = await core({
    id: 'core-basic',
    name: 'core-basic',
    api: {
      contractPaths: [`${__dirname}/contract/v1/example.yml`],
      controllerPaths: [`${__dirname}/controllers/`]
    }
  });

  await server.listen(3002);
})();

import core from '@service-kit/core';

(async () => {
  const { server } = await core({
    id: 'core-basic',
    name: 'core-basic',
    api: {
      contractPaths: [
        `${__dirname}/contract/v1/example.yml`,
        `${__dirname}/contract/v2/example.yml`,
        `${__dirname}/contract/v3/example.yml`,
        `${__dirname}/contract/v4/example.yml`
        // `${__dirname}/contract/v5/example.yml`,
        // `${__dirname}/contract/d1/example.yml`
      ],
      controllerPaths: [`${__dirname}/controllers/`]
    }
  });

  await server.listen(3002);
})();

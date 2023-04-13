import core from '@service-kit/core';

export default async () => {
  const { server } = await core({
    id: 'core-authentication',
    name: 'core-authentication',
    configPaths: [`${__dirname}/config/config`, `${__dirname}/config/auth.json`],
    api: {
      contractPaths: [`${__dirname}/contract/v1/example.yml`],
      controllerPaths: [`${__dirname}/controllers/`]
    }
  });

  return await server.listen(3002);
};

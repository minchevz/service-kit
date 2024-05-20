import core from '@service-kit/core';
import { ServerExport } from '@service-kit/server/types';
import opensearchModule from '@service-kit/opensearch';

export default async (): Promise<ServerExport> => {
  const { server } = await core({
    id: 'core-cache-loader',
    name: 'core-cache-loader',
    configPaths: [
      `${__dirname}/config/config`,
      `${__dirname}/config/opensearch.json`
    ],
    modules: [opensearchModule],
    api: {
      contractPaths: [`${__dirname}/contract/v1/example.yml`],
      controllerPaths: [`${__dirname}/controllers/`]
    }
  });

  return server;
};

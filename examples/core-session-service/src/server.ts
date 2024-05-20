import core from '@service-kit/core';
import { ServerExport } from '@service-kit/server/types';

export default async (): Promise<ServerExport> => {
  const { server } = await core({
    id: 'core-session-service',
    name: 'core-session-service',
    configPaths: [
      `${ __dirname }/config/schema/config`
    ],
    api: {
      contractPaths: [ `${ __dirname }/contract/v1/core_session_service.yml` ],
      controllerPaths: [ `${ __dirname }/controllers/` ],
      errorDirectories: [ `${ __dirname }/errors/` ]
    }
  });

  return server;
};

import core from '@service-kit/core';
import { ServerExport } from '@service-kit/server/types';

export default async (): Promise<ServerExport> => {
  const { server } = await core({
    id: '{{generated_service_id}}',
    name: '{{generated_service_name}}',
    configPaths: [
      `${ __dirname }/config/schema/config`
    ],
    api: {
      contractPaths: [ `${ __dirname }/contract/v1/{{generated_file_id}}.yml` ],
      controllerPaths: [ `${ __dirname }/controllers/` ],
      errorDirectories: [ `${ __dirname }/errors/` ]
    }
  });

  return server;
};

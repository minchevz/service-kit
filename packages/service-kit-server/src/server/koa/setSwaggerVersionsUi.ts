import serve from 'koa-static';
import mount from 'koa-mount';
import { ILogger } from '@service-kit/common';
import { ServerApp, ServerOptions } from '../../../types';
import swaggerUi from '../../middleware/swaggerUi';
import {
  getStaticFileDirectory,
  getValidContractFileName,
  getValidVersion
} from '../../utils/filePathValidation';

export default async (
  app: ServerApp,
  { contractPaths }: ServerOptions,
  logger: ILogger
): Promise<void> => {
  const uiVersions: Array<{
    url: string;
    name: string;
  }> = [];

  contractPaths.forEach((path) => {
    const directory = getStaticFileDirectory(path);
    const contractName = getValidContractFileName(path);
    const version = getValidVersion(path);

    if (version) {
      uiVersions.push({ name: version, url: `/${ version }/${ contractName }` });
      app.use(mount(`/${ version }`, serve(directory)));
    }
  });

  app.use(await swaggerUi(uiVersions));

  logger.info('Swagger Versions UI is ready!');
};

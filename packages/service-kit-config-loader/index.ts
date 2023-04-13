/* eslint-disable @typescript-eslint/no-var-requires */

import { IConfig } from '@service-kit/common';
import dotenv from 'dotenv';
import convict from 'convict';
import merge from 'deepmerge';

import { IConfigParameters } from './types';
import serviceKitConfigLoader from './serviceKitConfigLoader';

const baseSchema = {
  Base: {
    env: {
      doc: 'The application environment.',
      default: 'development',
      env: 'NODE_ENV'
    }
  }
};

export { IConfigParameters } from './types';
export { IConfig } from '@service-kit/common';

export default ({ configPaths }: IConfigParameters = {}): IConfig => {
  dotenv.config();
  const additionalConfigurationData =
    configPaths?.map((path: string) => {
      const file = require(path);

      return file.default || file;
    }) || [];
  const schema = merge.all([ baseSchema, ...additionalConfigurationData ]) as convict.Schema<{
    [x: string]: unknown;
  }>;
  const appConfiguration = convict(schema);

  appConfiguration.validate({ allowed: 'strict' });

  return serviceKitConfigLoader(appConfiguration);
};

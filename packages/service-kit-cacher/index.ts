/* eslint-disable @typescript-eslint/no-explicit-any */

import cachers from './src/cachers';
import { IConfig, ICacher, ILogger } from '@service-kit/common';

export let cacher: ICacher;

export const bootstrap = async (
  config: IConfig,
  logger: ILogger,
  modules?: any
): Promise<ICacher> => {
  if (!modules) {
    cacher = cachers['memory'](config, logger);

    return Promise.resolve(cacher);
  }
  const moduleName = Object.keys(modules)[0];

  if (!cachers[moduleName]) {
    logger.error('Defined type of cache module does not exist, please provide correct module');
    throw new Error('Defined type of cache module does not exist, please provide correct module');
  }

  cacher = cachers[moduleName](modules[moduleName], config, logger);

  return Promise.resolve(cacher);
};

export default {
  name: 'cacher',
  dependencies: [],
  bootstrap
};

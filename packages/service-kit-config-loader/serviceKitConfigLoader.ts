/* eslint-disable @typescript-eslint/no-var-requires */
import { IConfig } from '@service-kit/common';
import serviceKitLogger from '@service-kit/logger';

const logger = serviceKitLogger({
  id: 'service-kit-config-loader',
  name: 'service-kit-config-loader',
  version: '2.10.0'
});

const serviceKitConfigLoader = (config: IConfig): IConfig => {
  const getFunc = (key: string): IConfig => {
    let val;

    try {
      val = config.get(key);
    } catch (err) {
      logger.warn(`CONFIG LOADER ERROR:  ${ (err as Error).message.toUpperCase() }`);
    }

    return val;
  };

  return { ...config, get: getFunc };
};

export default serviceKitConfigLoader;

/* eslint-disable @typescript-eslint/no-var-requires */
import { IConfig } from '@service-kit/common';

describe('Given ServiceKitConfigLoader function', () => {
  let config: IConfig;

  beforeEach(() => {
    config = require('../serviceKitConfigLoader').default(config);
  });

  describe('when called for not defined config value `test`', () => {
    beforeAll(() => {
      process.env.npm_package_version = '1.1.1';
    });

    it('should return undefined', () => {
      expect(config.get('Base.test')).toBeUndefined();
    });
  });
});

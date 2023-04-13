import {
  mapDefaultRedisConfig,
  mapSentinelConfig,
  mapClusterConfig
} from '../../src/utils/mappers';
import { ICluster } from '../../types';

describe('Mappers', () => {
  const basicConfig = {
    REDIS_NAME: 'example',
    REDIS_HOST: 'example.host',
    REDIS_PORT: 1337,
    REDIS_PASSWORD: 'super-secure-password-123',
    REDIS_MAX_RETRIES_PER_REQUEST: 17,
    REDIS_ENABLE_OFFLINE_QUEUE: true
  };

  describe('The default mapper', () => {
    it('should return the expected format', () => {
      expect(mapDefaultRedisConfig(basicConfig)).toEqual({
        showFriendlyErrorStack: true,
        name: basicConfig.REDIS_NAME,
        host: basicConfig.REDIS_HOST,
        port: basicConfig.REDIS_PORT,
        password: basicConfig.REDIS_PASSWORD,
        maxRetriesPerRequest: basicConfig.REDIS_MAX_RETRIES_PER_REQUEST,
        enableOfflineQueue: basicConfig.REDIS_ENABLE_OFFLINE_QUEUE
      });
    });
  });

  describe('The Sentinel Mapper', () => {
    const additionalSentinelDetails = {
      SENTINEL_PASSWORD: 'my-sentinel-password',
      SENTINEL_HOST_0: 'host-0.com',
      SENTINEL_HOST_1: 'host-1.com',
      SENTINEL_PORT_1: 65000,
      SENTINEL_HOST_2: 'host-2.com',
      SENTINEL_HOST_3: 'host-3.com',
      SENTINEL_PORT_3: 1234
    };
    const configWithSentinels = Object.assign({}, basicConfig, additionalSentinelDetails);

    it('should return null if no sentinel hosts specified', () => {
      expect(mapSentinelConfig(basicConfig)).toEqual(null);
    });

    it('should correctly map sentinels details', () => {
      const DEFAULT_PORT = 26379;
      const { sentinels, sentinelPassword } = mapSentinelConfig(configWithSentinels) || {};
      const expectedSentinels = [
        { host: 'host-0.com', port: DEFAULT_PORT },
        { host: 'host-1.com', port: 65000 },
        { host: 'host-2.com', port: DEFAULT_PORT },
        { host: 'host-3.com', port: 1234 }
      ];

      expect(sentinels).toEqual(expectedSentinels);
      expect(sentinelPassword).toEqual(configWithSentinels.SENTINEL_PASSWORD);
    });
  });

  describe('The Empty Sentinel Mapper', () => {
    const additionalSentinelDetails = {
      SENTINEL_PASSWORD: 'my-sentinel-password',
      SENTINEL_HOST_0: ''
    };
    const configWithSentinels = Object.assign({}, basicConfig, additionalSentinelDetails);

    it('should return null if no sentinel hosts specified', () => {
      expect(mapSentinelConfig(basicConfig)).toEqual(null);
    });

    it('should correctly map sentinels details', () => {
      const { sentinels, sentinelPassword } = mapSentinelConfig(configWithSentinels) || {};

      expect(sentinels).toBeUndefined();
      expect(sentinelPassword).toEqual(configWithSentinels.SENTINEL_PASSWORD);
    });
  });

  describe('The Cluster Mapper', () => {
    const clusterConfig = {
      CLUSTER_NODE_HOST_0: 'host-0.com',
      CLUSTER_NODE_HOST_1: 'host-1.com',
      CLUSTER_NODE_PORT_1: 1234,
      CLUSTER_NODE_HOST_2: 'host-2.com',
      CLUSTER_NODE_HOST_3: 'host-3.com',
      CLUSTER_NODE_PASSWORD_3: 'password-3'
    };

    it('should return null if no sentinel hosts specified', () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      expect(mapClusterConfig(basicConfig as ICluster)).toEqual(null);
    });

    it('should correctly map sentinels details', () => {
      const DEFAULT_PORT = 6379;
      const nodes = mapClusterConfig(clusterConfig);
      const expectedNodes = [
        { host: 'host-0.com', port: DEFAULT_PORT, password: null },
        { host: 'host-1.com', port: 1234, password: null },
        { host: 'host-2.com', port: DEFAULT_PORT, password: null },
        { host: 'host-3.com', port: DEFAULT_PORT, password: 'password-3' }
      ];

      expect(nodes).toEqual(expectedNodes);
    });
  });
});

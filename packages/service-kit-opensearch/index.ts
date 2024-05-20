import Opensearch from './src/opensearch';
import { IConfig, ILogger } from '@service-kit/common';
import { Client } from '@opensearch-project/opensearch';

export let openSearch: Client;

export const bootstrap = async (config: IConfig, logger: ILogger): Promise<Client> => {
  logger.info('Opensearch bootstrapping ...');
  const openSearchClient = new Opensearch(config, logger);

  try {
    openSearch = await openSearchClient.init();
  } catch (error) {
    logger.error(error as string);
  }

  return openSearch;
};

export default {
  name: 'openSearch',
  dependencies: [],
  bootstrap
};

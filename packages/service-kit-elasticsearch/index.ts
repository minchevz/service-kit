import ElasticsearchSearcher from './src/elasticsearch';
import { IConfig, ILogger } from '@service-kit/common';
import { Client } from '@elastic/elasticsearch';

export { Client as ElasticsearchClient } from '@elastic/elasticsearch';

export let elasticsearch: Client;

export const bootstrap = async (config: IConfig, logger: ILogger): Promise<Client> => {
  logger.info('Elasticsearch bootstrapping ...');
  const elasticsearchClient = new ElasticsearchSearcher(config, logger);

  try {
    elasticsearch = await elasticsearchClient.init();
  } catch (error) {
    logger.error(error as string);
  }

  return elasticsearch;
};

export default {
  name: 'elasticsearch',
  dependencies: [],
  bootstrap
};

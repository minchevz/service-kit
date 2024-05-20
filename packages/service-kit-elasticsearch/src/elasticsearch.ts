import { IElasticsearchConfig, IElasticsearchSearcher } from '../types';
import { ILogger, IConfig } from '@service-kit/common';
import { Client } from '@elastic/elasticsearch';

class ElasticsearchSearcher implements IElasticsearchSearcher {
  private logger: ILogger;
  private config: IElasticsearchConfig;

  constructor(config: IConfig, logger: ILogger) {
    this.logger = logger;
    this.config = config.get('SEARCH') as IElasticsearchConfig;
  }

  async init(): Promise<Client> {
    return new Promise(async (resolve, reject) => {
      let client: Client;

      try {
        client = new Client({
          node: this.config.HOST
        });
      } catch (error) {
        this.logger.error('Elasticsearch Client error :', error);

        return reject('Failed to create Elasticsearch Client.');
      }

      this.logger.debug(`Elasticsearch Client created.`);

      try {
        const pingResponse = await client.ping();

        if (pingResponse) {
          this.logger.info('Elasticsearch Client successfully connected.');

          return resolve(client);
        }
        this.logger.error('Elasticsearch connection failed: response from ping was false');

        return reject('Failed to connect to Elasticsearch');
      } catch (error) {
        this.logger.error('Elasticsearch connection failed: ', error);

        return reject('Failed to connect to Elasticsearch');
      }
    });
  }
}

export default ElasticsearchSearcher;

import { IOpenseachConfig, IOpenseachSearcher } from '../types';
import { ILogger, IConfig } from '@service-kit/common';
import { Client } from '@opensearch-project/opensearch';

class Opensearch implements IOpenseachSearcher {
  private logger: ILogger;
  private config: IOpenseachConfig;

  constructor(config: IConfig, logger: ILogger) {
    this.logger = logger;
    this.config = config.get('SEARCH') as IOpenseachConfig;
  }

  async init(): Promise<Client> {
    return new Promise(async (resolve, reject) => {
      let client: Client;

      try {
        client = new Client({
          headers: {
            'x-api-key': this.config.API_KEY
          },
          node: this.config.HOST,
          auth: this.config.AUTH
        });

      } catch (error) {
        this.logger.error('Opensearch Client error :', error);

        return reject('Failed to create Opensearch Client.');
      }

      this.logger.debug(`Opensearch Client created.`);

      try {
        const pingResponse = await client.ping();

        if (pingResponse) {
          this.logger.info('Opensearch Client successfully connected.');

          return resolve(client);
        }
        this.logger.error('Opensearch connection failed: response from ping was false');

        return reject('Failed to connect to Opensearch');
      } catch (error) {
        this.logger.error('Opensearch connection failed: ', error);

        return reject('Failed to connect to Opensearch');
      }
    });
  }
}

export default Opensearch;

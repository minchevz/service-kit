import { Client } from '@elastic/elasticsearch';

export interface IElasticsearchConfig {
  SEARCH_PREFIX: string;
  HOST: string;
}

export interface IElasticsearchSearcher {
  init: () => Promise<Client>;
}

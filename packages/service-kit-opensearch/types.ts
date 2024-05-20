import { Client } from '@opensearch-project/opensearch';

export interface IOpenseachConfig {
  SEARCH_PREFIX: string;
  HOST: string;
  AUTH?: {
    username: string;
    password: string;
  };
  API_KEY: string;
}

export interface IOpenseachSearcher {
  init: () => Promise<Client>;
}

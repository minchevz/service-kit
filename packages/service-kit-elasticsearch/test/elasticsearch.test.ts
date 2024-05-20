import ElasticsearchSearcher from '../src/elasticsearch';
import { Client } from '@elastic/elasticsearch';
import { IConfig, ILogger } from '@service-kit/common';

jest.mock('@elastic/elasticsearch', () => ({
  Client: jest.fn(() => ({
    ping: jest.fn(() => Promise.resolve(true))
  }))
}));

const mockConfig: IConfig = {
  get: () => ({ HOST: 'http://localhost:9200' }),
  has: jest.fn(),
  set: jest.fn(),
  getProperties: jest.fn()
};

const mockLogger: ILogger = {
  debug: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
};

describe('ElasticsearchSearcher', () => {
  let searcher: ElasticsearchSearcher;

  beforeEach(() => {
    searcher = new ElasticsearchSearcher(mockConfig, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('init', () => {
    it('should create an Elasticsearch client and ping it', async () => {
      const client = await searcher.init();

      expect(Client).toHaveBeenCalledWith({ node: 'http://localhost:9200' });
      expect(client.ping).toHaveBeenCalled();
    });

    it('should reject with an error message if client creation fails', async () => {
      (Client as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Failed to create Elasticsearch Client.');
      });

      await expect(searcher.init()).rejects.toEqual('Failed to create Elasticsearch Client.');
    });

    it('should reject with an error message if ping returns false', async () => {
      (Client as jest.Mock).mockImplementationOnce(() => ({
        ping: jest.fn(() => Promise.resolve(false))
      }));

      await expect(searcher.init()).rejects.toEqual('Failed to connect to Elasticsearch');
    });

    it('should reject with an error message if ping throws an error', async () => {
      (Client as jest.Mock).mockImplementationOnce(() => ({
        ping: jest.fn(() => Promise.reject(new Error('Connection failed.')))
      }));

      await expect(searcher.init()).rejects.toEqual('Failed to connect to Elasticsearch');
    });
  });
});

import { Context } from '@service-kit/server';
import { modules } from '@service-kit/core';

export default async (context: Context) => {
  const query = {
    "query": {
      "bool": {
        "must": [
          {
            "match": {
              "game.contentType.keyword": "gameV2"
            }
          }
        ]
      }
    },
    size: 100
  };
  const { body: { hits: { hits } } } = await modules.openSearch.search({
    index: 'games',
    body: query,
  });

  const result = hits.map((i: any) => i._source);

  context.status = 200;
  context.body = {
    data: result
  };
}

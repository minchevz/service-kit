import { Context } from '@service-kit/server';
import { cacher } from '@service-kit/cacher';

export default async (context: Context) => {
  const data = await cacher.get(`test-node-memory`);

  if (!data) {
    cacher.set(`test-node-memory`, 'anything node memory data', 10);
  }

  context.status = 200;
  context.body = { data };
};

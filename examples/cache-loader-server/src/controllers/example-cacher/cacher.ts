import { Context } from '@service-kit/server';
import { cacher } from '@service-kit/cacher';

export default async (context: Context) => {
  const data = await cacher.get('test-cacher');

  if (!data) {
    cacher.set('test-cacher', 'anything cacher data');
  }

  context.status = 200;
  context.body = {
    data
  };
};

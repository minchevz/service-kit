import { Context } from '@service-kit/server';
import { redis } from '@service-kit/redis';

export default async (context: Context) => {
  const data = await redis.get('test-redis');

  if (!data) {
    redis.set('test-redis', 'anything redis data');
  }

  context.status = 200;
  context.body = {
    data
  };
};

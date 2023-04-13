import { Context } from '@service-kit/server';

export default (context: Context): void => {
  context.status = 200;
  context.body = {
    headers: context.headers,
    data: ['Some dummy data']
  };
};

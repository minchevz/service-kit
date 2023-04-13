import { Context } from '../../../types';
import readyCheckController from '../../../src/controllers/ready-check';

describe('The Ready Check Controller', () => {
  const ctx: Context = {} as Context;

  beforeAll(() => {
    readyCheckController(ctx);
  });

  it('should always respond with a 200', () => {
    expect(ctx.status).toEqual(200);
  });

  it('should always respond with the correct format', () => {
    expect(ctx.body).toEqual({ healthy: true });
  });
});

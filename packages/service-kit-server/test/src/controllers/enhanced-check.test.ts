import { NOT_IMPLEMENTED, OK } from '../../../src/constants/statusCodes';
import enhancedCheckController from '../../../src/controllers/enhanced-check';
import { Context, PromiseFunc } from '../../../types';

describe('Given the enhanced-check controller', () => {
  const healthChecks: PromiseFunc[] = [ async () => 'success' ];
  const externalChecks = healthChecks;
  const contextFactory = (level: number) => ({ params: { level } } as unknown as Context);

  it('should handle level 1', async () => {
    const routerContext = contextFactory(1);

    await enhancedCheckController(healthChecks, externalChecks)(routerContext);

    expect(routerContext.status).toBe(OK);
  });

  it('should handle level 2', async () => {
    const routerContext = contextFactory(2);

    await enhancedCheckController(healthChecks, externalChecks)(routerContext);

    expect(routerContext.status).toBe(OK);
  });

  it('should handle unknown level', async () => {
    const level = 3;
    const routerContext = contextFactory(level);

    await enhancedCheckController(healthChecks, externalChecks)(routerContext);

    expect(routerContext.status).toBe(NOT_IMPLEMENTED);
    expect(routerContext.body).toStrictEqual({
      healthy: false,
      message: `Unexpected level: ${ level }`
    });
  });
});

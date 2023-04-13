import attachContract from '../../../src/middleware/contract';
import { IRoute } from '../../../src/interfaces/contract-interfaces';
import { Context } from '../../../types';

describe('Given the attachContract middleware', () => {
  const mockRoute: IRoute = {
    method: 'get',
    path: '/test',
    controller: 'controllers/test',
    authEnabled: false,
    authRequired: false,
    details: {
      'x-controller': 'test'
    }
  };
  const mockContext: Context = {} as Context;
  const mockNext = jest.fn();

  it('should attach the contract to the context and call next', async () => {
    await attachContract(mockRoute)(mockContext, mockNext);

    expect(mockContext.contract).toEqual(mockRoute);
    expect(mockNext).toHaveBeenCalled();
  });
});

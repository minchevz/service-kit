import isOpenApiError from '../../../src/utils/isOpenApiError';

describe('Given isOpenApiError utility', () => {
  describe('when message includes `RequestValidationError`', () => {
    it('should return truthy', () => {
      const msg = 'RequestValidationError';

      expect(isOpenApiError(msg)).toBeTruthy();
    });
  });

  describe('when message includes `ResponseValidationError`', () => {
    it('should return truthy', () => {
      const msg = 'ResponseValidationError';

      expect(isOpenApiError(msg)).toBeTruthy();
    });
  });

  describe('when message doesnt include `RequestValidationError` or `ResponseValidationError`', () => {
    it('should return falsy', () => {
      const msg = 'test-message';

      expect(isOpenApiError(msg)).toBeFalsy();
    });
  });
});

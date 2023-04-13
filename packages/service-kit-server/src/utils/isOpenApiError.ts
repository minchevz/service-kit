export default (message: string) =>
  message.includes('RequestValidationError') || message.includes('ResponseValidationError');

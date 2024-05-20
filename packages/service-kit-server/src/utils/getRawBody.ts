import { IncomingMessage } from 'http';
export const getRawBody = (req: IncomingMessage): Promise<string> => new Promise((resolve, reject) => {
  let data = '';
  req.on('data', (chunk: string) => {
    data += chunk;
  });
  req.on('end', () => {
    resolve(data);
  });
  req.on('error', (err: Error) => {
    reject(err);
  });
});
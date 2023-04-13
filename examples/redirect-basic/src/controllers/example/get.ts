import { Context } from '@service-kit/server';

export default (context: Context): void => {
  context.status = 200;
  context.body = {
    headers: context.headers,
    data: ['Some dummy data']
  };
  const htmlEncoded = "/dummy?id=&lt;script&gt;alert('XSS');&lt;/script&gt;";
  const Ascii = "/dummy?id=062script062alert('XSS');062/script047";
  const internalRedirect = "/dummy?id=<script>alert('XSS');</script>&message=1";
  const normalUrl = '/dummy?id=1';
  context.redirect(normalUrl);
};

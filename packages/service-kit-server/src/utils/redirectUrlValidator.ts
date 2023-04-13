import url from 'url';
import { IParsedUrl, IUrlParams } from '../../types';

export const INVALID_PROTOCOL_ERROR = 'INVALID_PROTOCOL';
export const INVALID_URL_ERROR = 'INVALID_URL';
const ALLOWED_PROTOCOLS = [ 'http:', 'https:' ];
const RELATIVE_URL_CHARS = [ '.', '/' ];
const SINGLE_QUOTE_REGEX = /'/gim;
const SPECIAL_CHARACTERS_REGEX = /[><]/gim;

export const encodeSingleQuotes = (data: string): string => data.replace(SINGLE_QUOTE_REGEX, '%27');

export const encodeQueryParams = (queryString: string): string =>
  queryString.split('&').reduce((acc: string, item: string) => {
    const splitItem = item.split('=');

    return acc.concat(splitItem[0], '=', encodeURIComponent(splitItem[1]));
  }, '?');

export const constructExternalUrl = ({
  protocol,
  hostname,
  port,
  encodedUriPath
}: IUrlParams): string => {
  const protoPart = protocol ? `${ protocol }//` : '';
  const hostPart = hostname ? encodeURI(hostname) : '';
  const uriPort = port ? `:${ port }` : '';

  return protoPart.concat(hostPart, uriPort, encodedUriPath);
};

export const encodeUrlParams = (pathname: string, query: string | null, hash: string): string => {
  const encodedPathname: string = encodeURI(pathname) || '';
  const encodedHash: string = encodeURI(hash) || '';
  const encodedQueryParams = query ? encodeQueryParams(query) : '';

  const url = `${ encodedPathname }${ encodedQueryParams }${ encodedHash }`;

  return encodeSingleQuotes(url);
};

export const checkUri = (urlToValidate: string): string => {
  try {
    const sanitizedUrl = urlToValidate.replace(SPECIAL_CHARACTERS_REGEX, '').trim();

    const parsedUrl = url.parse(sanitizedUrl);
    const { protocol, hostname, port, query }: IParsedUrl = parsedUrl;
    const pathname: string = parsedUrl.pathname || '';
    const hash: string = parsedUrl.hash || '';

    const isInternalUrl = RELATIVE_URL_CHARS.indexOf(urlToValidate[0]) > -1;
    const isProtocolAllowed = protocol && ALLOWED_PROTOCOLS.indexOf(protocol.toLowerCase()) > -1;

    if (protocol && !isProtocolAllowed) {
      throw new Error(INVALID_PROTOCOL_ERROR);
    }

    if (isInternalUrl) {
      return encodeUrlParams(pathname, query, hash);
    }

    if (protocol && !hostname) {
      throw new Error(INVALID_URL_ERROR);
    }

    const encodedUriPath: string = encodeUrlParams(pathname, query, hash);

    const finalUrl = constructExternalUrl({
      protocol,
      hostname,
      port,
      encodedUriPath
    });

    return finalUrl;
  } catch (error) {
    throw error;
  }
};

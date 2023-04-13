import * as urlChecker from '../../../src/utils/redirectUrlValidator';
import { INVALID_PROTOCOL_ERROR, INVALID_URL_ERROR } from '../../../src/utils/redirectUrlValidator';
import url from 'url';

describe('Given the redirectUrlValidator module', () => {
  it('should properly encode internal urls', () => {
    const internalUrls = [
      '/dummy?message="I nev$r @sked 4 th1s"',
      "/dummy?id=<script>alert('oh no');</script>&message=1",
      "./dummy#&lt;script&gt;alert('yo');&lt;/script&gt;",
      ".dummy?id=<script>alert('nope');</script>&message=1#062script062alert('XSS');062/script047",
      '/dummy?id=javascript&colon;alert&lpar;document&period;cookie&rpar;',
      decodeURIComponent("/dummy?id=<script>alert('XSS');</script>&message=1"),
      '/exmaple#onmousemove=alert(1)',
      "/example#'&lt;a src=# onmouseover=alert(1)/&gt;'"
    ];
    const expectedUrl = [
      '/dummy?message=%2522I%2520nev%24r%2520%40sked%25204%2520th1s%2522',
      '/dummy?id=scriptalert(%2527oh%2520no%2527)%3B%2Fscriptmessage=1',
      './dummy#&lt;script&gt;alert(%2527yo%2527);&lt;/script&gt;',
      '.dummy?id=scriptalert(%2527nope%2527)%3B%2Fscriptmessage=1#062script062alert(%2527XSS%2527);062/script047',
      '/dummy?id=javascriptcolon;alert=undefinedlpar;document=undefinedperiod;cookie=undefinedrpar;=undefined',
      '/dummy?id=scriptalert(%27XSS%27)%3B%2Fscriptmessage=1',
      '/exmaple#onmousemove=alert(1)',
      '/example#%2527&lt;a%2520src=#%2520onmouseover=alert(1)/&gt;%2527'
    ];

    const results = internalUrls.map(item => urlChecker.checkUri(item));

    expect(results).toEqual(expectedUrl);
  });
  it('should throw an INVALID_PROTOCOL_ERROR error for non https protocols of external urls', () => {
    const invalidProtocolsUrl = [
      'javascript:alert("u wat m8?!");',
      'mailto:hello@example.com',
      'chrome://javascript:alert("u wat m8?!");'
    ];

    invalidProtocolsUrl.map((item) => {
      try {
        urlChecker.checkUri(item);
      } catch (error) {
        expect((error as { message: string }).message).toEqual(INVALID_PROTOCOL_ERROR);
      }
    });
  });
  it('should throw an INVALID_URL_ERROR error for external urls missing a host', () => {
    const invalidUrls = [
      'http:data:text/html;blabla,&#60&#115&#99&#114&#105',
      'javascript&colon;\u0061&#x6C;&#101%72t&lpar;1&rpar;',
      'jAvAsCrIpT&colon;alert&lpar;1&rpar;',
      'javascript&colon;alert&lpar;document&period;cookie&rpar;'
    ];

    invalidUrls.map((item) => {
      try {
        urlChecker.checkUri(item);
      } catch (error) {
        expect((error as { message: string }).message).toEqual(INVALID_URL_ERROR);
      }
    });
  });
  it('should throw an error for external urls missing a host', () => {
    const noHost = 'https://?test=me';

    try {
      urlChecker.checkUri(noHost);
    } catch (error) {
      expect((error as { message: string }).message).toEqual(INVALID_URL_ERROR);
    }
  });
  it('should sanitize url before parsing it removing any script symbols from it', () => {
    const SPECIAL_CHARACTERS_REGEX = /[><]/gim;
    const urls = [
      '/dummy?id=<script>alert("nope");</script>&message=1#062script062alert("XSS");062/script047',
      'https://www.redirect.me#<script>alert("nope");</script>&message=1#062script062alert("XSS");062/script047'
    ];

    urls.forEach(item =>
      expect(SPECIAL_CHARACTERS_REGEX.test(urlChecker.checkUri(item))).toBe(false)
    );
  });

  describe('while processing a url', () => {
    beforeEach(() => {
      jest.spyOn(urlChecker, 'encodeSingleQuotes');
      jest.spyOn(urlChecker, 'encodeQueryParams');
      jest.spyOn(urlChecker, 'constructExternalUrl');
      jest.spyOn(urlChecker, 'encodeUrlParams');
      jest.spyOn(url, 'parse');
    });

    afterEach(() => jest.clearAllMocks());

    it('should parse any string input', () => {
      const input = "/dummy?id=scriptalert('XSS')%3B%2Fscriptmessage=1";

      urlChecker.checkUri(input);
      expect(url.parse).toBeCalledTimes(1);
    });
    it('should encode any leftover single quotes after parsing', () => {
      const input = "/dummy?id=scriptalert('XSS')%3B%2Fscriptmessage=1";
      const intermediateUrl = "/dummy?id=scriptalert('XSS')%253B%252Fscriptmessage";
      const expectedResult = '/dummy?id=scriptalert(%27XSS%27)%253B%252Fscriptmessage';
      const result = urlChecker.checkUri(input);

      expect(urlChecker.encodeSingleQuotes).toBeCalledTimes(1);
      expect(urlChecker.encodeSingleQuotes).toHaveBeenCalledWith(intermediateUrl);
      expect(result).toEqual(expectedResult);
    });

    it('should correctly construct external urls after encoding', () => {
      const externalUrl =
        "https://www.helix.labs:80/path/to/trials.js?foo=316&bar='A. R. K. '#anchor";
      const expectedParsedUrl = {
        protocol: 'https:',
        port: '80',
        hostname: 'www.helix.labs',
        hash: '#anchor',
        search: '?foo=316&bar=%27A.%20R.%20K.%20%27',
        query: 'foo=316&bar=%27A.%20R.%20K.%20%27',
        pathname: '/path/to/trials.js'
      };
      const expectedEncodedUriPath =
        '/path/to/trials.js?foo=316bar=%2527A.%2520R.%2520K.%2520%2527#anchor';
      const expectedResult =
        'https://www.helix.labs:80/path/to/trials.js?foo=316bar=%2527A.%2520R.%2520K.%2520%2527#anchor';
      const result = urlChecker.checkUri(externalUrl);

      expect(urlChecker.encodeUrlParams).toBeCalledTimes(1);
      expect(urlChecker.encodeUrlParams).toHaveBeenCalledWith(
        expectedParsedUrl.pathname,
        expectedParsedUrl.query,
        expectedParsedUrl.hash
      );
      expect(urlChecker.encodeQueryParams).toBeCalledTimes(1);
      expect(urlChecker.encodeQueryParams).toHaveBeenCalledWith(expectedParsedUrl.query);
      expect(urlChecker.encodeSingleQuotes).toBeCalledTimes(1);
      expect(urlChecker.constructExternalUrl).toBeCalledTimes(1);
      expect(urlChecker.constructExternalUrl).toHaveBeenCalledWith({
        protocol: expectedParsedUrl.protocol,
        hostname: expectedParsedUrl.hostname,
        port: expectedParsedUrl.port,
        encodedUriPath: expectedEncodedUriPath
      });
      expect(result).toEqual(expectedResult);
    });

    it('should correctly construct internal urls after encoding', () => {
      const internalUrl = "/dummy?id='1'";
      const expectedParsedUrl = {
        protocol: null,
        port: null,
        hostname: null,
        hash: null,
        query: "id='1'",
        pathname: '/dummy'
      };
      const expectedResult = '/dummy?id=%271%27';
      const result = urlChecker.checkUri(internalUrl);

      expect(urlChecker.encodeUrlParams).toBeCalledTimes(1);
      expect(urlChecker.encodeUrlParams).toHaveBeenCalledWith(
        expectedParsedUrl.pathname,
        expectedParsedUrl.query,
        ''
      );
      expect(urlChecker.encodeQueryParams).toBeCalledTimes(1);
      expect(urlChecker.encodeQueryParams).toHaveBeenCalledWith(expectedParsedUrl.query);
      expect(urlChecker.encodeSingleQuotes).toBeCalledTimes(1);
      expect(urlChecker.constructExternalUrl).toBeCalledTimes(0);

      expect(result).toEqual(expectedResult);
    });

    it('should behave correctly if called with empty input', () => {
      const internalUrl = '';
      const expectedParsedUrl = {
        protocol: null,
        port: null,
        hostname: null,
        hash: null,
        query: null,
        pathname: ''
      };
      const expectedResult = '';
      const result = urlChecker.checkUri(internalUrl);

      expect(urlChecker.encodeUrlParams).toBeCalledTimes(1);
      expect(urlChecker.encodeUrlParams).toHaveBeenCalledWith('', expectedParsedUrl.query, '');
      expect(urlChecker.encodeQueryParams).toBeCalledTimes(0);
      expect(urlChecker.encodeSingleQuotes).toBeCalledTimes(1);

      expect(result).toEqual(expectedResult);
    });

    describe('when there is an unexpected error', () => {
      const ERR_MESSAGE = "Well that's not good";

      beforeEach(() => {
        jest.spyOn(urlChecker, 'encodeUrlParams').mockImplementation(() => {
          throw new Error(ERR_MESSAGE);
        });
      });
      afterEach(() => jest.clearAllMocks());
      it('should catch and propagate the error', () => {
        const input = '/breaking?oh noz >.<';

        try {
          urlChecker.checkUri(input);
        } catch (error) {
          expect((error as { message: string }).message).toEqual(ERR_MESSAGE);
        }
      });
    });
  });
});

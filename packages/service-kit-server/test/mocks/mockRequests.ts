export const mockContextReqParams = {
  _matchedRoute: '/dummy/:id',
  url: '/dummy/:id',
  method: 'GET',
  request: {
    req: {
      headers: {
        'user-agent': 'PostmanRuntime/7.26.8',
        accept: '*/*',
        'cache-control': 'no-cache'
      }
    }
  },
  params: { id: '0' },
  query: null,
  body: undefined
};

export const mockContextReqParamsReqOptions = {
  headers: {
    'user-agent': 'PostmanRuntime/7.26.8',
    accept: '*/*',
    'cache-control': 'no-cache'
  },
  params: { id: '0' },
  query: null,
  body: undefined
};

export const mockContextBodyParams = {
  _matchedRoute: '/dummy',
  url: '/dummy',
  method: 'POST',
  request: {
    req: {
      headers: {
        'user-agent': 'PostmanRuntime/7.26.8',
        accept: '*/*',
        'cache-control': 'no-cache'
      }
    },
    body: { value: 'this is a post', name: 'post' }
  },
  params: {},
  query: null
};

export const mockContextBodyReqOptions = {
  headers: {
    'user-agent': 'PostmanRuntime/7.26.8',
    accept: '*/*',
    'cache-control': 'no-cache'
  },
  params: {},
  query: null,
  body: { value: 'this is a post', name: 'post' }
};

export const mockQueryParams = {
  _matchedRoute: '/dummies/dummy',
  url: '/dummies/dummy',
  method: 'GET',
  request: {
    req: {
      headers: {
        accept: '*/*',
        'cache-control': 'no-cache',
        logname: "'hello'",
        logtype: "['t1']"
      }
    },
    body: undefined
  },
  params: {},
  query: { name: 'ho' }
};

export const mockQueryParamsReqOptions = {
  headers: {
    accept: '*/*',
    'cache-control': 'no-cache',
    logname: "'hello'",
    logtype: "['t1']"
  },
  params: {},
  query: { name: 'ho' },
  body: undefined
};

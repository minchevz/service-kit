/* eslint-disable import/no-unresolved */
/* eslint-disable no-undef */
/* eslint-disable import/namespace */
import http from 'k6/http';
import { check } from 'k6';
import { Rate } from 'k6/metrics';
import * as config from './config/index.js';
import { allEndpoints } from './helper.js';
import CAS_API from './config/serviceEndpointSetup.js';

const failureRate = new Rate('check_failure_rate');

const thresholds = __ENV.SELECTED_ENDPOINT !== '*' ?
  Object.assign({}, config[`${ __ENV.SELECTED_ENDPOINT }`].thresholds) :
  allEndpoints(config).thresholds;

const scenarios = __ENV.SELECTED_ENDPOINT !== '*' ?
  Object.assign({}, config[`${ __ENV.SELECTED_ENDPOINT }`].scenarios) :
  allEndpoints(config).scenarios;

export const options = {
  discardResponseBodies: true,
  thresholds,
  scenarios
};

export function healthEndpoint() {
  const response = http.get(`${ CAS_API }/health/live`);

  const checkRes = check(response, {
    'status is 200': r => r.status === 200
  });

  failureRate.add(!checkRes);
}

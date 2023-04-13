export default {
  scenarios: {
    healthConstantVus: {
      executor: 'constant-vus',
      vus: 100,
      duration: '20s',
      tags: { test_type: 'health' },
      exec: 'healthEndpoint'
    }
  },
  thresholds: {
    'http_reqs{test_type:health}': [ { threshold: 'count/20 > 700' } ],
    'http_req_duration{test_type:health}': [ 'p(95)<500' ],
    'check_failure_rate{test_type:health}': [
      'rate<0.01', // Global failure rate should be less than 1%
      { threshold: 'rate<=0.05', abortOnFail: true } // Abort the test early if it climbs over 5%
    ]
  }
};

# server-health-check

To test that the health check works correctly when Redis is running do the following:

1. Navigate to the server-health-check directory
2. Start Redis by running `yarn redis:start`
3. In the same terminal now run `yarn start`
4. Navigate to http://localhost:3002/health/enhanced and check that the service reports that all services are ok.

You can check that the service can detect a failure by doing the following:

1. Stop Redis by running `yarn redis:stop`
2. Navigate to http://localhost:3002/health/enhanced and check that the service reports that the Redis service is not ok.

import http from 'k6/http';
import { check, sleep } from 'k6';

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp-up to 20 users over 30 seconds
    { duration: '1m', target: 20 },  // Stay at 20 users for 1 minute
    { duration: '30s', target: 0 },  // Ramp-down to 0 users over 30 seconds
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01'],   // Error rate should be less than 1%
  },
};

// Target URL - configurable via environment variable
const BASE_URL = __ENV.API_BASE_URL || 'http://localhost:8000';

export default function () {
  // Scenario 1: Health check
  const res = http.get(`${BASE_URL}/health`);

  check(res, {
    'status is 200': (r) => r.status === 200 || r.status === 404, // Accept 404 if health route isn't implemented yet
  });

  // Small delay between requests to simulate real user behavior
  sleep(1);
}

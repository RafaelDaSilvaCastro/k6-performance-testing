import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend } from 'k6/metrics';

export const getContactsDuration = new Trend('get_contacts', true);

export const options = {
  thresholds: {
    http_req_failed: ['rate<0.90'],
    http_req_duration: ['avg<10000']
  },
  stages: [
    { duration: '60s', target: 10 },
    { duration: '60s', target: 10 }
  ]
};

export function handleSummary(data) {
  return {
    './src/output/index.html': htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true })
  };
}

export default function () {
  const baseUrl = 'https://api.thecatapi.com/v1/images/search' //'https://viacep.com.br/ws/88816820/json/';

  const params = {
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const OK = 200;

  const res = http.get(`${baseUrl}`);

  getContactsDuration.add(res.timings.duration);

  check(res, {
    'get contacts - status 200': () => res.status === OK
  });
}

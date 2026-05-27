
const https = require('https');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const apiKey = envContent.match(/MIMO_API_KEY=(.*)/)?.[1] || '';

console.log('Testing models endpoint...');
console.log('Key:', apiKey.substring(0, 10) + '...');

const options = {
  hostname: 'token-plan-ams.xiaomimimo.com',
  path: '/v1/models',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + apiKey
  }
};

https.get(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    try {
      const json = JSON.parse(data);
      console.log('Response:', JSON.stringify(json, null, 2).substring(0, 1500));
    } catch {
      console.log('Response:', data.substring(0, 500));
    }
  });
}).on('error', e => console.error('Error:', e.message));

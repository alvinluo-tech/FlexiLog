
const https = require('https');

const apiKey = process.argv[2];
console.log('Testing with key:', apiKey.substring(0, 10) + '...');

const data = JSON.stringify({
  model: 'MiMo-v2.5-Pro',
  messages: [{role: 'user', content: '你好，请用一句话介绍自己'}],
  max_tokens: 100
});

const options = {
  hostname: 'token-plan-ams.xiaomimimo.com',
  path: '/v1/chat/completions',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + apiKey,
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    try {
      const json = JSON.parse(body);
      console.log('Response:', JSON.stringify(json, null, 2));
    } catch {
      console.log('Raw response:', body.substring(0, 500));
    }
  });
});

req.on('error', e => console.error('Error:', e.message));
req.write(data);
req.end();

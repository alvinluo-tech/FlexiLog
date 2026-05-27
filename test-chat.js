
const https = require('https');

const apiKey = 'tp-eiy1x4gxjltzqfqv06gfdh50ufr9um8ar2iaolg24f5jsjtz';

console.log('Testing chat with mimo-v2.5-pro...');

const data = JSON.stringify({
  model: 'mimo-v2.5-pro',
  messages: [
    {role: 'system', content: '你是一个健身教练'},
    {role: 'user', content: '用一句话介绍增肌训练的要点'}
  ],
  max_tokens: 100,
  temperature: 0.7
});

const options = {
  hostname: 'token-plan-ams.xiaomimimo.com',
  path: '/v1/chat/completions',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + apiKey,
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    try {
      const json = JSON.parse(body);
      if (json.choices) {
        console.log('Success! Response:');
        console.log(json.choices[0].message.content);
      } else {
        console.log('Response:', JSON.stringify(json, null, 2));
      }
    } catch {
      console.log('Raw:', body.substring(0, 500));
    }
  });
});

req.on('error', e => console.error('Error:', e.message));
req.write(data);
req.end();

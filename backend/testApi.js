import http from 'http';

const loginData = JSON.stringify({
  username: 'kevindesai',
  password: 'password123'
});

const loginReq = http.request({
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': loginData.length
  }
}, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    const token = json.token;
    console.log('Got token:', token ? 'yes' : 'no');
    
    // Now call dashboard stats
    const statsReq = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/dashboard/stats',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }, (res2) => {
      let statsData = '';
      res2.on('data', (chunk) => statsData += chunk);
      res2.on('end', () => {
        console.log('Stats status:', res2.statusCode);
        console.log('Stats response:', statsData);
      });
    });
    statsReq.on('error', console.error);
    statsReq.end();
  });
});
loginReq.on('error', console.error);
loginReq.write(loginData);
loginReq.end();

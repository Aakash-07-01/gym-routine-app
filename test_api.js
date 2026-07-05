const http = require('http');

async function test() {
  const loginRes = await fetch('http://localhost:8080/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'password' })
  });
  const loginData = await loginRes.json();
  const token = loginData.token;

  const getRes = await fetch('http://localhost:8080/api/nutrition/today', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  console.log(await getRes.text());
}
test();

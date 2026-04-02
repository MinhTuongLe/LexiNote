async function testSettingUpdate() {
  console.log('Testing login...');
  const baseUrl = 'http://127.0.0.1:1337/api';
  let res = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'testguide3@lexinote.test', password: 'password123', fullName: 'Tester' })
  });
  
  if (!res.ok) {
    console.log('Register failed, trying login...');
    res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'testguide3@lexinote.test', password: 'password123' })
    });
  }
  
  const data = await res.json();
  const token = data.token || data.accessToken;
  console.log('Token received:', token ? 'YES' : 'NO');
  if (!token) return console.log('Login fail:', data);

  console.log('--- GET /settings ---');
  let getRes = await fetch(`${baseUrl}/settings`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('GET settings:', await getRes.json());
  
  console.log('--- PATCH /settings ---');
  let patchRes = await fetch(`${baseUrl}/settings`, {
    method: 'PATCH',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify({ hasSeenGuide: true, darkTheme: true })
  });
  console.log('PATCH settings:', await patchRes.json());
  
  console.log('--- GET /settings AFTER ---');
  let getRes2 = await fetch(`${baseUrl}/settings`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('GET settings 2:', await getRes2.json());
}
testSettingUpdate().catch(console.error);

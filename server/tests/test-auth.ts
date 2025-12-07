import { api, generateUser, logResult } from './utils';

const runAuthTests = async () => {
  console.log('--- Starting Auth Tests ---');
  const user = generateUser();
  let token = '';

  // 1. Register
  const regRes = await api.post('/auth/register', user);
  logResult('Register User', regRes.status === 201, regRes.data);

  // 2. Login
  const loginRes = await api.post('/auth/login', { email: user.email, password: user.password });
  if (loginRes.status === 200) {
    token = loginRes.data.token;
    logResult('Login User', true);
  } else {
    logResult('Login User', false, loginRes.data);
    return;
  }

  // 3. Get Me
  const meRes = await api.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } });
  const isMeValid = meRes.status === 200 && meRes.data.email === user.email;
  logResult('Get Current User (Me)', isMeValid, meRes.data);
};

runAuthTests();

import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: BASE_URL,
  validateStatus: () => true, // Don't throw on error status
});

export const generateUser = () => {
  const r = Math.random().toString(36).substring(7);
  return {
    email: `test_${r}@example.com`,
    password: 'password123',
    name: `Test User ${r}`
  };
};

export const getAuthToken = async () => {
  const user = generateUser();
  await api.post('/auth/register', user);
  const res = await api.post('/auth/login', { email: user.email, password: user.password });
  return { token: res.data.token, user };
};

export const logResult = (name: string, success: boolean, data?: any) => {
  if (success) {
    console.log(`✅ [PASS] ${name}`);
  } else {
    console.error(`❌ [FAIL] ${name}`);
    if (data) console.error('   Error:', JSON.stringify(data, null, 2));
  }
};

// Update 2025-12-22 12:37:00: style(css): fix mobile padding issues

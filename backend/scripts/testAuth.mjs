import axios from 'axios';

const API = process.env.API_BASE || 'http://localhost:4000/api';

const run = async () => {
  try {
    const ts = Date.now();
    const email = `test_buyer_${ts}@localdev.test`;
    const password = 'TestPass123!';
    const fullName = 'Test Buyer';

    console.log('Registering:', email);
    const reg = await axios.post(`${API}/users/register`, {
      name: fullName,
      email,
      password,
      role: 'buyer'
    }).catch(e => e.response ? e.response.data : { error: e.message });

    console.log('Register response:', reg && reg.data ? reg.data : reg);

    console.log('Logging in...');
    const login = await axios.post(`${API}/users/login`, { email, password })
      .catch(e => e.response ? e.response.data : { error: e.message });

    console.log('Login response:', login && login.data ? login.data : login);

    const token = login && login.data && login.data.token;
    if (!token) {
      console.error('No token returned; aborting');
      process.exit(1);
    }

    const me = await axios.get(`${API}/users/me`, { headers: { Authorization: `Bearer ${token}` } })
      .catch(e => e.response ? e.response.data : { error: e.message });

    console.log('Profile (/users/me):', me && me.data ? me.data : me);
    process.exit(0);
  } catch (err) {
    console.error('Test failed', err.message || err);
    process.exit(1);
  }
};

run();

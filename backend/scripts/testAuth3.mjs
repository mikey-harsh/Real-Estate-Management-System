import axios from 'axios';

const API = process.env.API_BASE || 'http://localhost:4000/api';

const tryRegister = async (email, password) => {
  return axios.post(`${API}/users/register`, {
    name: 'Dev Buyer',
    email,
    password,
    role: 'buyer'
  }).then(r => r.data).catch(e => e.response ? e.response.data : { error: e.message });
};

const run = async () => {
  try {
    const ts = Date.now();
    const candidates = [
      `devbuyer_${ts}@example.org`,
      `devbuyer_${ts}+bot@gmail.com`,
      `devbuyer_${ts}@dandd.local`
    ];
    const password = 'TestPass123!';

    let regResp;
    let chosenEmail;
    for (const email of candidates) {
      console.log('Attempting register with', email);
      regResp = await tryRegister(email, password);
      console.log('Response:', regResp);
      if (regResp && regResp.success) {
        chosenEmail = email;
        break;
      }
    }

    if (!chosenEmail) {
      console.error('All registration attempts failed. Last response:', regResp);
      process.exit(1);
    }

    console.log('Logging in with', chosenEmail);
    const login = await axios.post(`${API}/users/login`, { email: chosenEmail, password })
      .then(r => r.data).catch(e => e.response ? e.response.data : { error: e.message });

    console.log('Login response:', login);
    const token = login && login.token;
    if (!token) {
      console.error('No token; aborting');
      process.exit(1);
    }

    const me = await axios.get(`${API}/users/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.data).catch(e => e.response ? e.response.data : { error: e.message });

    console.log('Profile:', me);
    process.exit(0);
  } catch (err) {
    console.error('Test failed', err.message || err);
    process.exit(1);
  }
};

run();

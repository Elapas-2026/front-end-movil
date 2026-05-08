const fetch = global.fetch || require('node-fetch');

(async () => {
  try {
    const res = await fetch('https://elapas-backend-v1.onrender.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ci: '10544402', password: 'umacena123' }),
    });
    console.log('status', res.status);
    const text = await res.text();
    console.log('body', text);
  } catch (err) {
    console.error('error', err);
  }
})();

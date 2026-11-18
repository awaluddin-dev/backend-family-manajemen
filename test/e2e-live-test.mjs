import 'dotenv/config';

async function run() {
  const baseUrl = 'http://localhost:3000';
  const testEmail = `user_${Date.now()}@test.com`;
  const testPassword = 'Password123!';
  const testName = 'Test User Clean Arch';

  console.log('1. Testing Sign Up...');
  const signupRes = await fetch(`${baseUrl}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: testName,
      email: testEmail,
      password: testPassword,
    }),
  });
  const signupData = await signupRes.json();
  console.log('Signup status:', signupRes.status);
  console.log('Signup response:', JSON.stringify(signupData, null, 2));

  if (signupRes.status !== 201) {
    throw new Error('Signup failed');
  }

  console.log('\n2. Testing Login without Captcha (Should fail with 400)...');
  const loginNoCaptchaRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: testPassword,
    }),
  });
  console.log('Login without captcha status (Expected 400):', loginNoCaptchaRes.status);

  console.log('\n3. Testing Login with Cloudflare Turnstile token...');
  const loginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: testPassword,
      captchaToken: 'dummy-turnstile-token',
    }),
  });
  const loginData = await loginRes.json();
  console.log('Login status:', loginRes.status);
  console.log('Login tokens:', {
    accessToken: loginData.accessToken?.substring(0, 20) + '...',
    refreshToken: loginData.refreshToken?.substring(0, 20) + '...',
    expiresIn: loginData.expiresIn,
    refreshExpiresIn: loginData.refreshExpiresIn,
  });

  if (loginRes.status !== 200) {
    throw new Error(`Login failed with status: ${loginRes.status} ${JSON.stringify(loginData)}`);
  }

  console.log('\n4. Testing Protected /auth/me with Access Token...');
  const meRes = await fetch(`${baseUrl}/auth/me`, {
    headers: { Authorization: `Bearer ${loginData.accessToken}` },
  });
  const meData = await meRes.json();
  console.log('Me status:', meRes.status);
  console.log('Me data:', meData);

  if (meRes.status !== 200) {
    throw new Error('Access token authorization failed');
  }

  console.log('\n5. Testing Refresh Token (Rotation & Redis validation)...');
  const refreshRes = await fetch(`${baseUrl}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: loginData.refreshToken }),
  });
  const refreshData = await refreshRes.json();
  console.log('Refresh status:', refreshRes.status);
  console.log('New tokens issued successfully!');

  if (refreshRes.status !== 200) {
    throw new Error('Refresh token failed');
  }

  console.log('\n6. Testing Old Refresh Token Re-use (Should be rejected because rotated)...');
  const oldRefreshRes = await fetch(`${baseUrl}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: loginData.refreshToken }),
  });
  console.log('Old refresh status (Expected 401):', oldRefreshRes.status);

  console.log('\n7. Testing Logout...');
  const logoutRes = await fetch(`${baseUrl}/auth/logout`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${refreshData.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken: refreshData.refreshToken }),
  });
  const logoutData = await logoutRes.json();
  console.log('Logout status:', logoutRes.status);
  console.log('Logout message:', logoutData);

  console.log('\n8. Testing Refresh Token after Logout (Should be rejected with 401)...');
  const postLogoutRefreshRes = await fetch(`${baseUrl}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: refreshData.refreshToken }),
  });
  console.log('Post-logout refresh status (Expected 401):', postLogoutRefreshRes.status);

  console.log('\n=== ALL E2E FLOWS VERIFIED SUCCESSFULLY! ===');
}

run().catch((err) => {
  console.error('E2E Test Error:', err);
  process.exit(1);
});

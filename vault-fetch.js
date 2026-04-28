const http = require('http');
const https = require('https');
const fs = require('fs');

const vaultAddr = process.env.VAULT_ADDR || 'http://10.0.0.4:8200';
const roleId = process.env.VAULT_ROLE_ID;
const secretId = process.env.VAULT_SECRET_ID;
const secretPath = process.env.VAULT_SECRET_PATH || 'admin-frontend/development';

if (!roleId || !secretId) {
  console.error('VAULT_ROLE_ID and VAULT_SECRET_ID are required');
  process.exit(1);
}

async function request(url, options, data) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(body));
        } else {
          reject(new Error(`Status ${res.statusCode}: ${body}`));
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function fetchSecrets() {
  try {
    // 1. Login with AppRole
    console.log('Logging in to Vault...');
    const loginRes = await request(`${vaultAddr}/v1/auth/approle/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { role_id: roleId, secret_id: secretId });

    const clientToken = loginRes.auth.client_token;

    // 2. Fetch secrets
    console.log(`Fetching secrets from ${secretPath}...`);
    const secretRes = await request(`${vaultAddr}/v1/secret/data/${secretPath}`, {
      method: 'GET',
      headers: { 'X-Vault-Token': clientToken }
    });

    const secrets = secretRes.data.data;
    
    // 3. Output as .env file or env variables
    let envContent = '';
    for (const [key, value] of Object.entries(secrets)) {
      envContent += `${key}="${value}"\n`;
      process.env[key] = value;
    }

    fs.writeFileSync('.env.local', envContent);
    console.log('Secrets written to .env.local');

  } catch (err) {
    console.error('Error fetching secrets from Vault:', err.message);
    process.exit(1);
  }
}

fetchSecrets();

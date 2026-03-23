const crypto = require('crypto');

function base64urlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function signJWT(payload, secret) {
  const header = base64urlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64urlEncode(JSON.stringify(payload));
  const signingInput = `${header}.${body}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(signingInput)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  return `${signingInput}.${signature}`;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  const jwtSecret = process.env.JWT_SECRET;

  if (!adminPassword || !jwtSecret) {
    return res.status(500).json({ error: 'Server misconfiguration: missing env vars' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (_) { body = {}; }
  }

  const { password } = body || {};

  if (!password) {
    return res.status(400).json({ error: 'Password required' });
  }

  // Constant-time comparison to prevent timing attacks
  const providedHash = crypto.createHash('sha256').update(String(password)).digest('hex');
  const expectedHash = crypto.createHash('sha256').update(String(adminPassword)).digest('hex');
  const match = crypto.timingSafeEqual(Buffer.from(providedHash), Buffer.from(expectedHash));

  if (!match) {
    return res.status(401).json({ error: 'Senha incorreta' });
  }

  const now = Date.now();
  const payload = {
    admin: true,
    iat: now,
    exp: now + 8 * 60 * 60 * 1000, // 8 hours in ms
  };

  const token = signJWT(payload, jwtSecret);

  return res.status(200).json({ token });
};

const crypto = require('crypto');
const https = require('https');

function base64urlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function base64urlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return Buffer.from(str, 'base64').toString('utf8');
}

function verifyJWT(token, secret) {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid token structure');

  const [header, payload, signature] = parts;
  const signingInput = `${header}.${payload}`;

  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(signingInput)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expectedSig);

  if (sigBuf.length !== expBuf.length) throw new Error('Invalid signature');
  if (!crypto.timingSafeEqual(sigBuf, expBuf)) throw new Error('Invalid signature');

  const decoded = JSON.parse(base64urlDecode(payload));

  if (decoded.exp && Date.now() > decoded.exp) throw new Error('Token expired');
  if (!decoded.admin) throw new Error('Not an admin token');

  return decoded;
}

function httpsRequest(options, bodyStr) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, headers: res.headers, body: data });
      });
    });
    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Verify Authorization header
  const authHeader = req.headers['authorization'] || '';
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.slice(7).trim();
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    return res.status(500).json({ error: 'Server misconfiguration: JWT_SECRET not set' });
  }

  try {
    verifyJWT(token, jwtSecret);
  } catch (err) {
    return res.status(401).json({ error: `Unauthorized: ${err.message}` });
  }

  // Parse body
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (_) { body = {}; }
  }

  const { content, filename, message } = body || {};

  if (!content || !filename) {
    return res.status(400).json({ error: 'content and filename are required' });
  }

  const githubToken = process.env.GITHUB_TOKEN;
  if (!githubToken) {
    return res.status(500).json({ error: 'Server misconfiguration: GITHUB_TOKEN not set' });
  }

  const repo = process.env.GITHUB_REPO || 'nathancwb/cni-plasticos';
  const branch = process.env.GITHUB_BRANCH || 'main';
  const commitMessage = message || `Admin: atualiza ${filename}`;

  const apiBase = 'api.github.com';
  const filePath = `/repos/${repo}/contents/${filename}`;

  const commonHeaders = {
    'Authorization': `token ${githubToken}`,
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'CNI-Admin-Panel/1.0',
    'Content-Type': 'application/json',
  };

  // Step 1: GET current file SHA
  let currentSha = null;
  try {
    const getRes = await httpsRequest({
      hostname: apiBase,
      path: `${filePath}?ref=${branch}`,
      method: 'GET',
      headers: commonHeaders,
    });

    if (getRes.statusCode === 200) {
      const fileData = JSON.parse(getRes.body);
      currentSha = fileData.sha;
    } else if (getRes.statusCode !== 404) {
      return res.status(502).json({
        error: `GitHub GET failed with status ${getRes.statusCode}`,
        details: getRes.body,
      });
    }
  } catch (err) {
    return res.status(502).json({ error: `Failed to fetch file from GitHub: ${err.message}` });
  }

  // Step 2: PUT updated content
  const encodedContent = Buffer.from(content, 'utf8').toString('base64');
  const putPayload = JSON.stringify({
    message: commitMessage,
    content: encodedContent,
    branch,
    ...(currentSha ? { sha: currentSha } : {}),
  });

  try {
    const putRes = await httpsRequest(
      {
        hostname: apiBase,
        path: filePath,
        method: 'PUT',
        headers: {
          ...commonHeaders,
          'Content-Length': Buffer.byteLength(putPayload),
        },
      },
      putPayload
    );

    if (putRes.statusCode === 200 || putRes.statusCode === 201) {
      const result = JSON.parse(putRes.body);
      return res.status(200).json({
        success: true,
        commit: result.commit && result.commit.sha,
      });
    } else {
      return res.status(502).json({
        error: `GitHub PUT failed with status ${putRes.statusCode}`,
        details: putRes.body,
      });
    }
  } catch (err) {
    return res.status(502).json({ error: `Failed to update file on GitHub: ${err.message}` });
  }
};

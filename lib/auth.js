const crypto = require('crypto');

const COOKIE_NAME = 'auth_token';
const DEFAULT_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

function getSecret() {
  return process.env.AUTH_COOKIE_SECRET || 'dev-auth-cookie-secret-change-me';
}

function toBase64Url(value) {
  return Buffer.from(value).toString('base64url');
}

function fromBase64Url(value) {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function sign(value) {
  return crypto.createHmac('sha256', getSecret()).update(value).digest('base64url');
}

function createToken(user) {
  const payload = {
    user,
    exp: Date.now() + DEFAULT_MAX_AGE
  };
  const encoded = toBase64Url(JSON.stringify(payload));
  return `${encoded}.${sign(encoded)}`;
}

function parseToken(token) {
  if (!token || typeof token !== 'string') return null;

  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) return null;
  if (sign(encoded) !== signature) return null;

  try {
    const payload = JSON.parse(fromBase64Url(encoded));
    if (!payload?.user || !payload?.exp || payload.exp < Date.now()) {
      return null;
    }
    return payload.user;
  } catch {
    return null;
  }
}

function getCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction,
    path: '/',
    maxAge: DEFAULT_MAX_AGE
  };
}

function attachAuth(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  const user = parseToken(token);

  if (user) {
    req.session = { user };
    req.user = user;
  } else {
    req.session = { user: null };
    req.user = null;
  }

  next();
}

function setAuthCookie(res, user) {
  res.cookie(COOKIE_NAME, createToken(user), getCookieOptions());
}

function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, { ...getCookieOptions(), maxAge: undefined });
}

module.exports = {
  attachAuth,
  setAuthCookie,
  clearAuthCookie,
  COOKIE_NAME
};
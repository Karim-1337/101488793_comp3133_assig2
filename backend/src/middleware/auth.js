const jwt = require('jsonwebtoken');

function getTokenFromHeader(req) {
  const h = req.headers.authorization || '';
  if (h.startsWith('Bearer ')) return h.slice(7);
  return null;
}

function authContext(req) {
  const token = getTokenFromHeader(req);
  if (!token) return { userId: null };
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    return { userId: payload.sub };
  } catch {
    return { userId: null };
  }
}

module.exports = { authContext, getTokenFromHeader };

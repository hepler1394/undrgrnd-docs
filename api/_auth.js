import { createRemoteJWKSet, jwtVerify } from 'jose';

const projectId = process.env.FIREBASE_PROJECT_ID || 'undrgrnd-docs';
const firebaseKeys = createRemoteJWKSet(
  new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'),
);

function bearerToken(request) {
  const header = request.headers.authorization || request.headers.get?.('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  return token.length <= 5_000 ? token : '';
}

export async function requireFirebaseUser(request) {
  const token = bearerToken(request);
  if (!token) throw Object.assign(new Error('Sign in is required.'), { statusCode: 401 });

  try {
    const { payload } = await jwtVerify(token, firebaseKeys, {
      algorithms: ['RS256'],
      audience: projectId,
      issuer: `https://securetoken.google.com/${projectId}`,
    });
    if (!payload.sub) throw new Error('Missing Firebase user id.');
    return payload;
  } catch (error) {
    throw Object.assign(new Error('Your session is no longer valid. Please sign in again.'), {
      statusCode: 401,
      cause: error,
    });
  }
}

export async function requireAdmin(request) {
  const user = await requireFirebaseUser(request);
  const allowed = (process.env.ADMIN_EMAILS || 'coryh2014@gmail.com')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  const email = String(user.email || '').toLowerCase();

  if (!user.email_verified || !allowed.includes(email)) {
    throw Object.assign(new Error('This action is limited to a verified administrator.'), {
      statusCode: 403,
    });
  }
  return user;
}

export function prepareApiResponse(response) {
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('X-Content-Type-Options', 'nosniff');
}

export function requireMethod(request, response, method) {
  prepareApiResponse(response);
  if (request.method === method) return true;
  response.setHeader('Allow', method);
  response.status(405).json({ error: 'Method not allowed.' });
  return false;
}

export function readJsonBody(request) {
  const length = Number(request.headers['content-length'] || request.headers.get?.('content-length') || 0);
  if (length > 100_000) throw Object.assign(new Error('Request body is too large.'), { statusCode: 413 });
  try {
    return typeof request.body === 'string' ? JSON.parse(request.body) : (request.body || {});
  } catch {
    throw Object.assign(new Error('Request body must be valid JSON.'), { statusCode: 400 });
  }
}

export function sendApiError(response, error) {
  prepareApiResponse(response);
  const status = error.statusCode || 500;
  response.status(status).json({
    error: status === 500 ? 'The service could not complete that request.' : error.message,
  });
}

import { randomUUID } from 'node:crypto';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { readJsonBody, requireAdmin, requireMethod, sendApiError } from './_auth.js';

const allowedTypes = new Set([
  'video/mp4',
  'video/webm',
  'video/x-matroska',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

function safeName(name) {
  return String(name || 'upload')
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(-120);
}

export default async function handler(request, response) {
  if (!requireMethod(request, response, 'POST')) return;
  try {
    await requireAdmin(request);
    const body = readJsonBody(request);
    const size = Number(body.size) || 0;
    const type = String(body.type || '');
    if (!allowedTypes.has(type)) throw Object.assign(new Error('That file type is not allowed.'), { statusCode: 400 });
    const maxSize = type.startsWith('video/') ? 10 * 1024 ** 3 : 25 * 1024 ** 2;
    if (!Number.isSafeInteger(size) || size < 1 || size > maxSize) {
      const limit = type.startsWith('video/') ? '10 GB' : '25 MB';
      throw Object.assign(new Error(`This upload must be between 1 byte and ${limit}.`), { statusCode: 400 });
    }

    const required = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET_NAME', 'R2_PUBLIC_URL'];
    if (required.some((key) => !process.env[key])) {
      throw Object.assign(new Error('Media storage is not configured yet.'), { statusCode: 503 });
    }

    const folder = type.startsWith('video/') ? 'videos' : 'posters';
    const pathname = `${folder}/${randomUUID()}-${safeName(body.name)}`;
    const client = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    });
    const uploadUrl = await getSignedUrl(client, new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: pathname,
      ContentType: type,
      ContentLength: size,
    }), { expiresIn: 60 * 30 });
    const publicRoot = process.env.R2_PUBLIC_URL.replace(/\/$/, '');
    return response.status(200).json({ uploadUrl, publicUrl: `${publicRoot}/${pathname}`, pathname });
  } catch (error) {
    return sendApiError(response, error);
  }
}

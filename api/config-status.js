import { requireAdmin, requireMethod, sendApiError } from './_auth.js';

export default async function handler(request, response) {
  if (!requireMethod(request, response, 'GET')) return;
  try {
    await requireAdmin(request);
    return response.status(200).json({
      firebase: Boolean(process.env.FIREBASE_PROJECT_ID),
      email: Boolean(process.env.RESEND_API_KEY && process.env.CREATOR_FROM_EMAIL),
      youtube: Boolean(process.env.YOUTUBE_API_KEY),
      media: Boolean(process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && process.env.R2_BUCKET_NAME && process.env.R2_PUBLIC_URL),
    });
  } catch (error) {
    return sendApiError(response, error);
  }
}

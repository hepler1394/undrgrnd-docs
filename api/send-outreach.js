import { Resend } from 'resend';
import { CreatorOutreachEmail } from '../emails/creator-outreach.js';
import { readJsonBody, requireAdmin, requireMethod, sendApiError } from './_auth.js';

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || ''));
}

export default async function handler(request, response) {
  if (!requireMethod(request, response, 'POST')) return;
  try {
    await requireAdmin(request);
    const body = readJsonBody(request);
    const email = String(body.email || '').trim().toLowerCase();
    const subject = String(body.subject || '').trim();
    const message = String(body.message || '').trim();
    const idempotencyKey = String(body.idempotencyKey || '').trim();
    if (!process.env.RESEND_API_KEY) throw Object.assign(new Error('Creator email is not configured yet.'), { statusCode: 503 });
    if (!validEmail(email) || email.length > 254) throw Object.assign(new Error('Enter a valid creator email address.'), { statusCode: 400 });
    if (!subject || !message || !idempotencyKey) {
      throw Object.assign(new Error('Recipient, subject, message, and send id are required.'), { statusCode: 400 });
    }
    if (subject.length > 160) throw Object.assign(new Error('Email subjects must be 160 characters or fewer.'), { statusCode: 400 });
    if (message.length < 20 || message.length > 8_000) throw Object.assign(new Error('Email messages must be between 20 and 8,000 characters.'), { statusCode: 400 });
    if (!/^[a-zA-Z0-9/_-]{8,180}$/.test(idempotencyKey)) throw Object.assign(new Error('The send id is invalid.'), { statusCode: 400 });

    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: process.env.CREATOR_FROM_EMAIL || 'UNDRGRND Creators <creators@undrgrnddocs.com>',
      to: [email],
      replyTo: process.env.CREATOR_REPLY_TO || 'creators@undrgrnddocs.com',
      subject,
      react: CreatorOutreachEmail({
        creatorName: String(body.creatorName || '').slice(0, 120),
        message,
      }),
      headers: {
        'List-Unsubscribe': '<mailto:creators@undrgrnddocs.com?subject=Unsubscribe>',
      },
    }, {
      idempotencyKey: `creator-outreach/${idempotencyKey}`,
    });

    if (error) throw Object.assign(new Error(error.message || 'Resend rejected the email.'), { statusCode: 502 });
    return response.status(200).json({ id: data?.id || null });
  } catch (error) {
    return sendApiError(response, error);
  }
}

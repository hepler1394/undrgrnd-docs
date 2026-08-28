import { readJsonBody, requireAdmin, requireMethod, sendApiError } from './_auth.js';
import { discoverCreators } from './_youtube.js';

export default async function handler(request, response) {
  if (!requireMethod(request, response, 'POST')) return;
  try {
    await requireAdmin(request);
    const body = readJsonBody(request);
    const queries = Array.isArray(body.queries)
      ? body.queries.map((item) => String(item).trim()).filter(Boolean).slice(0, 3)
      : undefined;
    if (queries?.some((item) => item.length > 200)) throw Object.assign(new Error('Search themes must be 200 characters or fewer.'), { statusCode: 400 });
    const minSubscribers = Math.max(Number(body.minSubscribers) || 1_000, 0);
    const maxSubscribers = Math.min(Number(body.maxSubscribers) || 100_000, 500_000);
    if (maxSubscribers < minSubscribers) throw Object.assign(new Error('Maximum subscribers must be greater than the minimum.'), { statusCode: 400 });
    const creators = await discoverCreators({
      queries,
      minSubscribers,
      maxSubscribers,
    });
    return response.status(200).json({ creators });
  } catch (error) {
    return sendApiError(response, error);
  }
}

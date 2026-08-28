const SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';
const CHANNELS_URL = 'https://www.googleapis.com/youtube/v3/channels';

export const DEFAULT_CREATOR_QUERIES = [
  'independent street journalist documentary',
  'local investigative documentary channel',
  'independent field reporting documentary',
];

function toCount(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

export async function discoverCreators({
  queries = DEFAULT_CREATOR_QUERIES,
  minSubscribers = 1_000,
  maxSubscribers = 100_000,
  perQuery = 12,
} = {}) {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) throw Object.assign(new Error('YouTube monitoring is not configured yet.'), { statusCode: 503 });

  const normalizedQueries = queries
    .map((query) => String(query).trim())
    .filter(Boolean)
    .slice(0, 3);
  if (!normalizedQueries.length) {
    throw Object.assign(new Error('Add at least one creator search theme.'), { statusCode: 400 });
  }
  const channelIds = new Set();

  for (const query of normalizedQueries) {
    const url = new URL(SEARCH_URL);
    url.search = new URLSearchParams({
      part: 'snippet',
      type: 'channel',
      order: 'relevance',
      maxResults: String(Math.min(Math.max(perQuery, 1), 25)),
      q: query,
      key,
    });
    const response = await fetch(url, { signal: AbortSignal.timeout(12_000) });
    if (!response.ok) throw new Error(`YouTube search returned ${response.status}.`);
    const data = await response.json();
    for (const item of data.items || []) {
      if (item.snippet?.channelId) channelIds.add(item.snippet.channelId);
    }
  }

  if (!channelIds.size) return [];
  const detailsUrl = new URL(CHANNELS_URL);
  detailsUrl.search = new URLSearchParams({
    part: 'snippet,statistics',
    id: [...channelIds].slice(0, 50).join(','),
    maxResults: '50',
    key,
  });
  const detailsResponse = await fetch(detailsUrl, { signal: AbortSignal.timeout(12_000) });
  if (!detailsResponse.ok) throw new Error(`YouTube channel lookup returned ${detailsResponse.status}.`);
  const details = await detailsResponse.json();

  return (details.items || [])
    .map((channel) => ({
      channelId: channel.id,
      name: channel.snippet?.title || 'Untitled channel',
      description: channel.snippet?.description || '',
      thumbnail: channel.snippet?.thumbnails?.medium?.url || channel.snippet?.thumbnails?.default?.url || '',
      subscribers: toCount(channel.statistics?.subscriberCount),
      views: toCount(channel.statistics?.viewCount),
      videos: toCount(channel.statistics?.videoCount),
      channelUrl: `https://www.youtube.com/channel/${channel.id}`,
      discoveredAt: new Date().toISOString(),
      source: 'youtube',
    }))
    .filter((channel) => channel.subscribers >= minSubscribers && channel.subscribers <= maxSubscribers)
    .sort((a, b) => a.subscribers - b.subscribers);
}

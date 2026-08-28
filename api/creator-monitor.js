import React from 'react';
import { Resend } from 'resend';
import { DEFAULT_CREATOR_QUERIES, discoverCreators } from './_youtube.js';
import { prepareApiResponse, requireMethod } from './_auth.js';

function isAuthorized(request) {
  const expected = process.env.CRON_SECRET;
  const provided = request.headers.authorization || '';
  return Boolean(expected && provided === `Bearer ${expected}`);
}

function digestEmail(creators) {
  const rows = creators.slice(0, 15).map((creator) => React.createElement(
    'li',
    { key: creator.channelId, style: { marginBottom: '14px' } },
    React.createElement('a', { href: creator.channelUrl, style: { color: '#e5a00d', fontWeight: 700 } }, creator.name),
    React.createElement('div', { style: { color: '#aaaaaa', fontSize: '13px' } }, `${creator.subscribers.toLocaleString()} subscribers · ${creator.videos.toLocaleString()} videos`),
  ));
  return React.createElement(
    'div',
    { style: { background: '#0a0a0a', color: '#f3f0e8', fontFamily: 'Arial, sans-serif', padding: '32px' } },
    React.createElement('h1', { style: { color: '#e5a00d', fontSize: '26px' } }, 'Weekly creator radar'),
    React.createElement('p', null, 'Smaller independent journalism and documentary channels found this week. Review each channel manually before contacting anyone.'),
    React.createElement('ul', { style: { paddingLeft: '20px' } }, ...rows),
    React.createElement('p', { style: { color: '#888888', fontSize: '12px' } }, `Queries: ${DEFAULT_CREATOR_QUERIES.join(' · ')}`),
  );
}

export default async function handler(request, response) {
  if (!requireMethod(request, response, 'GET')) return;
  prepareApiResponse(response);
  if (!isAuthorized(request)) return response.status(401).json({ error: 'Unauthorized.' });
  if (!process.env.RESEND_API_KEY || !process.env.YOUTUBE_API_KEY) {
    return response.status(503).json({ error: 'Email or YouTube monitoring is not configured.' });
  }

  try {
    const creators = await discoverCreators();
    const resend = new Resend(process.env.RESEND_API_KEY);
    const week = new Date().toISOString().slice(0, 10);
    const { data, error } = await resend.emails.send({
      from: process.env.CREATOR_FROM_EMAIL || 'UNDRGRND Creators <creators@undrgrnddocs.com>',
      to: [(process.env.ADMIN_EMAILS || 'coryh2014@gmail.com').split(',')[0].trim()],
      subject: `UNDRGRND creator radar · ${week}`,
      react: digestEmail(creators),
    }, { idempotencyKey: `creator-radar/${week}` });
    if (error) throw new Error(error.message || 'Resend rejected the digest.');
    return response.status(200).json({ found: creators.length, emailId: data?.id || null });
  } catch (error) {
    return response.status(500).json({ error: 'Creator monitoring failed.' });
  }
}

import React from 'react';
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'react-email';

const colors = {
  background: '#0a0a0a',
  surface: '#151515',
  border: '#2a2a2a',
  text: '#f3f0e8',
  muted: '#a3a3a3',
  accent: '#e5a00d',
};

export function CreatorOutreachEmail({ creatorName, message, siteUrl = 'https://undrgrnddocs.com' }) {
  const paragraphs = String(message || '').split(/\n\s*\n/).filter(Boolean);
  return React.createElement(
    Html,
    null,
    React.createElement(Head),
    React.createElement(Preview, null, 'An invitation to publish independent work with UNDRGRND Docs'),
    React.createElement(
      Body,
      { style: { backgroundColor: colors.background, color: colors.text, fontFamily: 'Arial, sans-serif', margin: 0, padding: '32px 12px' } },
      React.createElement(
        Container,
        { style: { backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '12px', maxWidth: '600px', padding: '36px' } },
        React.createElement(Text, { style: { color: colors.accent, fontSize: '13px', fontWeight: 800, letterSpacing: '2px', margin: '0 0 24px' } }, 'UNDRGRND DOCS'),
        React.createElement(Heading, { style: { color: colors.text, fontSize: '28px', lineHeight: '1.2', margin: '0 0 20px' } }, `A home for ${creatorName || 'independent reporting'}`),
        ...paragraphs.map((paragraph, index) => React.createElement(Text, { key: index, style: { color: colors.text, fontSize: '16px', lineHeight: '1.65' } }, paragraph)),
        React.createElement(
          Section,
          { style: { backgroundColor: '#0f0f0f', border: `1px solid ${colors.border}`, borderRadius: '8px', margin: '24px 0', padding: '18px' } },
          React.createElement(Text, { style: { color: colors.text, fontSize: '15px', lineHeight: '1.55', margin: 0 } }, 'Launch model: 75% of net subscription revenue is proposed for the creator pool, allocated by eligible watch time. Optional first-window releases may receive additional weighting. Final rates and rights are agreed in writing before publication; no earnings are guaranteed.'),
        ),
        React.createElement(Button, { href: `${siteUrl}/#journalist`, style: { backgroundColor: colors.accent, borderRadius: '6px', color: '#111', display: 'inline-block', fontSize: '15px', fontWeight: 800, padding: '13px 20px', textDecoration: 'none' } }, 'See the creator program'),
        React.createElement(Hr, { style: { borderColor: colors.border, margin: '30px 0 20px' } }),
        React.createElement(Text, { style: { color: colors.muted, fontSize: '12px', lineHeight: '1.5' } }, 'You received this because your public work appears relevant to independent documentary audiences. Reply “no thanks” or use the unsubscribe link and we will not contact you again.'),
        React.createElement(Link, { href: 'mailto:creators@undrgrnddocs.com?subject=Unsubscribe', style: { color: colors.accent, fontSize: '12px' } }, 'Unsubscribe from creator outreach'),
      ),
    ),
  );
}

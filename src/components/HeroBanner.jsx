import React from 'react';

export default function HeroBanner({ featuredDoc, onSelectVideo }) {
  if (!featuredDoc) return null;

  return (
    <div style={{
      position: 'relative',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      marginTop: '24px',
      marginBottom: '36px',
      minHeight: '420px',
      display: 'flex',
      alignItems: 'flex-end',
      background: `linear-gradient(to top, rgba(31, 35, 38, 0.98) 15%, rgba(31, 35, 38, 0.4) 60%, rgba(31, 35, 38, 0.2) 100%), url(${featuredDoc.bannerUrl}) center/cover no-repeat`,
      border: '1px solid var(--border)',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
    }}>
      <div style={{ padding: '36px', maxWidth: '850px', zIndex: 2 }}>
        {/* Badges */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
          <span className="badge badge-raw">
            <i className="fa-solid fa-triangle-exclamation"></i> {featuredDoc.ageRating}
          </span>
          <span className="badge badge-banned">
            <i className="fa-brands fa-youtube"></i> {featuredDoc.ytStatus}
          </span>
          <span className="badge badge-quality">
            <i className="fa-solid fa-film"></i> {featuredDoc.quality}
          </span>
          <span className="badge badge-revenue">
            <i className="fa-solid fa-dollar-sign"></i> {featuredDoc.monthlyEarnings} Creator Payout
          </span>
        </div>

        {/* Title */}
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '2.2rem',
          fontWeight: 800,
          lineHeight: 1.2,
          color: '#ffffff',
          marginBottom: '12px',
          textShadow: '0 2px 10px rgba(0, 0, 0, 0.8)'
        }}>
          {featuredDoc.title}
        </h1>

        {/* Creator Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <img 
            src={featuredDoc.creatorAvatar} 
            alt={featuredDoc.creator} 
            style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid var(--accent)', objectFit: 'cover' }}
          />
          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {featuredDoc.creator}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>• {featuredDoc.subscribers} Subscribers</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>• {featuredDoc.duration}</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>• {featuredDoc.views} Views</span>
        </div>

        {/* Description */}
        <p style={{
          fontSize: '0.92rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.5,
          marginBottom: '24px',
          maxWidth: '720px'
        }}>
          {featuredDoc.description}
        </p>

        {/* CTA Actions */}
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          <button className="btn-accent" onClick={() => onSelectVideo(featuredDoc)}>
            <i className="fa-solid fa-play"></i> Watch Full Uncensored Cut
          </button>
          <button className="btn-outline" onClick={() => alert(`Creator Payout Detail:\n\n${featuredDoc.creator} earned ${featuredDoc.monthlyEarnings} directly from UNDRGRND Docs subscription pool watch-time allocation.`)}>
            <i className="fa-solid fa-chart-line"></i> Creator Payout Stats
          </button>
        </div>
      </div>
    </div>
  );
}

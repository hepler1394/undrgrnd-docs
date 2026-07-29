import React from 'react';

export default function Roadmap() {
  const MILESTONES = [
    {
      year: 'YEAR 1',
      title: 'Foundation & Creator Acquisition',
      subtitle: 'Solving YouTube Demonetization',
      desc: 'Launch 75% Subscription Revenue Pool, onboarding 100+ Tommy G & Channel 5 style creators who have been suppressed or demonetized by YouTube algorithms.',
      status: 'Current Phase',
      icon: 'fa-rocket',
      active: true
    },
    {
      year: 'YEAR 2',
      title: 'Mobile Apps & Offline Downloads',
      subtitle: 'Plex-Inspired Native Streaming',
      desc: 'Deploy native iOS, Android, and Smart TV apps featuring offline video encryption, seamless casting, and zero-compression raw cut streaming.',
      status: 'In Development',
      icon: 'fa-mobile-screen-button',
      active: false
    },
    {
      year: 'YEAR 3',
      title: '$1,000,000 Creator Grant Fund',
      subtitle: 'Pre-Funding Independent Shoots',
      desc: 'Establish the UNDRGRND Micro-Grant Fund to provide upfront travel and gear financing for indie documentarians whose pitches get rejected by traditional Hollywood studios.',
      status: 'Planned',
      icon: 'fa-sack-dollar',
      active: false
    },
    {
      year: 'YEAR 4',
      title: 'Global Underground Network',
      subtitle: 'Multi-Language Street Docs',
      desc: 'Expand to 50+ countries with AI voice dubbing and raw subtitle tracks for international street journalism across Latin America, Asia, and Europe.',
      status: 'Planned',
      icon: 'fa-earth-americas',
      active: false
    },
    {
      year: 'YEAR 5',
      title: 'The #1 Global Destination for Indie Docs',
      subtitle: '1M Subscribers ($45M/yr Creator Pool)',
      desc: 'Become the undisputed go-to home for street documentaries and video journalism—bypassing mainstream media monopolies completely.',
      status: 'Vision Goal',
      icon: 'fa-trophy',
      active: false
    }
  ];

  return (
    <div style={{ marginTop: '28px', marginBottom: '48px' }}>
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <span className="badge badge-quality" style={{ fontSize: '0.8rem', padding: '6px 12px', marginBottom: '12px' }}>
          <i className="fa-solid fa-map-location-dot"></i> Master Plan
        </span>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          5-Year Strategic Vision
        </h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '640px', margin: '8px auto 0' }}>
          How UNDRGRND Docs evolves from an indie YouTube alternative into the world’s leading subscription platform for street journalism and uncensored documentaries.
        </p>
      </div>

      {/* Timeline Grid */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        maxWidth: '840px',
        margin: '0 auto',
        position: 'relative'
      }}>
        {MILESTONES.map((m, idx) => (
          <div 
            key={idx}
            style={{
              background: m.active ? 'var(--bg-secondary)' : 'var(--bg-card)',
              border: `1px solid ${m.active ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-md)',
              padding: '24px',
              display: 'flex',
              gap: '20px',
              alignItems: 'flex-start',
              position: 'relative',
              boxShadow: m.active ? '0 10px 30px rgba(0, 0, 0, 0.4), 0 0 15px var(--accent-glow)' : 'none'
            }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: m.active ? 'var(--accent)' : 'var(--bg-primary)',
              color: m.active ? '#000' : 'var(--text-secondary)',
              display: 'flex',
              align-items: 'center',
              justify-content: 'center',
              fontSize: '1.2rem',
              flexShrink: 0
            }}>
              <i className={`fa-solid ${m.icon}`}></i>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--accent)', letterSpacing: '0.08em' }}>
                  {m.year}
                </span>
                <span className={`badge ${m.active ? 'badge-revenue' : 'badge-quality'}`}>
                  {m.status}
                </span>
              </div>

              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '2px' }}>
                {m.title}
              </h3>

              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                {m.subtitle}
              </div>

              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {m.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

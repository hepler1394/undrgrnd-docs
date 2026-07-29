import React, { useRef } from 'react';

export default function MediaRail({ title, subtitle, icon, docs, onSelectVideo }) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="rail-container">
      {/* Header & Scroll Controls */}
      <div className="rail-header">
        <div className="rail-title-group">
          <i className={`fa-solid ${icon}`} style={{ color: 'var(--accent)', fontSize: '1.2rem' }}></i>
          <div>
            <h2 className="rail-title">{title}</h2>
            {subtitle && <p className="rail-subtitle">{subtitle}</p>}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="control-btn"
            onClick={() => scroll('left')}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              align-items: 'center',
              justify-content: 'center'
            }}
          >
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <button 
            className="control-btn"
            onClick={() => scroll('right')}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              align-items: 'center',
              justify-content: 'center'
            }}
          >
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>

      {/* Horizontal Cards Rail */}
      <div className="cards-scroll-container" ref={scrollRef}>
        {docs.map((doc) => (
          <div 
            key={doc.id} 
            className="media-card"
            onClick={() => onSelectVideo(doc)}
          >
            {/* Card Thumbnail */}
            <div className="card-poster-wrapper">
              <img src={doc.thumbnailUrl} alt={doc.title} className="card-poster-img" />
              
              {/* Play Hover Overlay */}
              <div className="card-play-overlay">
                <div className="play-circle-btn">
                  <i className="fa-solid fa-play" style={{ marginLeft: '3px' }}></i>
                </div>
              </div>

              {/* Quality & Duration Badges */}
              <span className="badge badge-quality" style={{ position: 'absolute', top: '8px', left: '8px', zIndex: 2 }}>
                {doc.quality}
              </span>
              <span style={{
                position: 'absolute',
                bottom: '8px',
                right: '8px',
                background: 'rgba(0, 0, 0, 0.75)',
                color: '#fff',
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: '4px',
                zIndex: 2
              }}>
                {doc.duration}
              </span>
            </div>

            {/* Card Details */}
            <div className="card-body">
              <h3 className="card-title" title={doc.title}>{doc.title}</h3>
              
              <div className="card-creator-row">
                <img src={doc.creatorAvatar} alt={doc.creator} className="creator-avatar" />
                <span className="creator-name">{doc.creator}</span>
              </div>

              <div className="card-meta-row">
                <span><i className="fa-solid fa-eye" style={{ color: 'var(--text-muted)' }}></i> {doc.views}</span>
                <span style={{ color: 'var(--accent)', fontWeight: 700 }}>
                  <i className="fa-solid fa-sack-dollar"></i> {doc.monthlyEarnings}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

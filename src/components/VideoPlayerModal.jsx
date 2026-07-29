import React, { useState } from 'react';

export default function VideoPlayerModal({ doc, onClose }) {
  const [tipped, setTipped] = useState(false);
  const [quality, setQuality] = useState('4K RAW');

  if (!doc) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '960px', overflow: 'hidden' }}
      >
        {/* Video Player Header Bar */}
        <div style={{
          background: 'var(--bg-primary)',
          padding: '14px 20px',
          display: 'flex',
          justify-content: 'space-between',
          align-items: 'center',
          borderBottom: '1px solid var(--border)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="badge badge-raw">UNCENSORED STREAM</span>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {doc.title}
            </span>
          </div>

          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Video Stream Player */}
        <div style={{ position: 'relative', width: '100%', background: '#000', aspectRatio: '16/9' }}>
          <video 
            src={doc.videoUrl} 
            controls 
            autoPlay 
            style={{ width: '100%', height: '100%', outline: 'none' }}
          />
        </div>

        {/* Video Metadata & Creator Support Bar */}
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <img 
                  src={doc.creatorAvatar} 
                  alt={doc.creator} 
                  style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid var(--accent)', objectFit: 'cover' }}
                />
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {doc.creator}
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {doc.subscribers} Subscribers • Monthly Payout: <strong style={{ color: 'var(--accent)' }}>{doc.monthlyEarnings}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Quality Selector & Creator Boost */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <select 
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '0.8rem'
                }}
              >
                <option value="4K RAW">4K RAW CUT</option>
                <option value="1080p">1080p HDR</option>
                <option value="720p">720p Mobile</option>
              </select>

              <button 
                className={`btn-${tipped ? 'outline' : 'accent'}`}
                onClick={() => {
                  setTipped(true);
                  alert(`Boosted ${doc.creator} with $5.00 direct micro-grant from your wallet!`);
                }}
              >
                <i className="fa-solid fa-heart" style={{ color: tipped ? 'var(--accent)' : 'inherit' }}></i>
                {tipped ? 'Boost Sent ($5.00)' : 'Direct Creator Boost ($5.00)'}
              </button>
            </div>
          </div>

          {/* Subscription Revenue Attribution Note */}
          <div style={{
            background: 'rgba(229, 160, 13, 0.1)',
            border: '1px solid rgba(229, 160, 13, 0.3)',
            borderRadius: '10px',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <i className="fa-solid fa-circle-info" style={{ color: 'var(--accent)', fontSize: '1.2rem' }}></i>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
              <strong>Fair Creator Model in Action:</strong> Your $4.99/mo subscription automatically allocated <strong>$0.42</strong> directly to {doc.creator} for this watch session. Zero ad interruptions, zero YouTube algorithmic shadowbans.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

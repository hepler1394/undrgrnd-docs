import React, { useState } from 'react';

export default function CreatorUploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [title, setTitle] = useState('');
  const [creator, setCreator] = useState('');
  const [category, setCategory] = useState('street');
  const [isRawCut, setIsRawCut] = useState(true);
  const [ytStatus, setYtStatus] = useState('Demonetized / Suppressed on YouTube');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !creator) {
      alert('Please fill out Title and Creator Name.');
      return;
    }

    const newDoc = {
      id: 'doc-user-' + Date.now(),
      title,
      creator,
      creatorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      subscribers: '1.2K',
      thumbnailUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80',
      duration: '32:40',
      views: '1.4K',
      quality: isRawCut ? '4K RAW CUT' : '1080p',
      ageRating: isRawCut ? 'UNFILTERED' : 'STANDARD',
      monthlyEarnings: '$450.00',
      category,
      ytStatus,
      description: description || 'New indie documentary uploaded directly by community creator.',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    };

    onUploadSuccess(newDoc);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '32px' }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              <i className="fa-solid fa-cloud-arrow-up" style={{ color: 'var(--accent)', marginRight: '10px' }}></i>
              Upload Documentary to UNDRGRND Pool
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Bypass YouTube censorship & earn your share of the monthly subscription pool.
            </p>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.3rem', cursor: 'pointer' }}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Upload Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
              Documentary Title
            </label>
            <input 
              type="text" 
              placeholder="e.g. Undercover in the Underground Street Racing Scene" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Creator / Channel Name
              </label>
              <input 
                type="text" 
                placeholder="e.g. Tommy G Fan / Raw Docs" 
                value={creator}
                onChange={(e) => setCreator(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  color: 'var(--text-primary)',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Primary Category
              </label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  color: 'var(--text-primary)',
                  outline: 'none'
                }}
              >
                <option value="banned">🔥 Suppressed / Banned on YT</option>
                <option value="rising">🚀 Rising Creator (Sub-10K)</option>
                <option value="street">🎥 Tommy G Style Street Journalism</option>
                <option value="investigation">🔍 Underground Investigation</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
              Mainstream YouTube Status / Disclaimer
            </label>
            <input 
              type="text" 
              placeholder="e.g. Demonetized for raw street footage / Too small for YT Algo" 
              value={ytStatus}
              onChange={(e) => setYtStatus(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
              Documentary Synopsis
            </label>
            <textarea 
              rows="3"
              placeholder="Describe your raw documentary cut..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: 'var(--text-primary)',
                outline: 'none',
                resize: 'none'
              }}
            ></textarea>
          </div>

          {/* Toggle for Raw / Unfiltered Cut */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '14px',
            display: 'flex',
            alignItems: 'center',
            justify-content: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Enable Uncensored Director Cut
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Allows raw audio, unblurred footage, and age-gated viewing.
              </div>
            </div>
            <input 
              type="checkbox"
              checked={isRawCut}
              onChange={(e) => setIsRawCut(e.target.checked)}
              style={{ width: '20px', height: '20px', accentColor: 'var(--accent)', cursor: 'pointer' }}
            />
          </div>

          {/* Submit Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button type="button" className="btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-accent">
              <i className="fa-solid fa-upload"></i> Publish to Platform Pool
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

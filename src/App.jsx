import React, { useState, useEffect } from 'react';
import ThreeCanvas from './components/ThreeCanvas';
import Header from './components/Header';
import HeroBanner from './components/HeroBanner';
import MediaRail from './components/MediaRail';
import RevenueCalculator from './components/RevenueCalculator';
import CreatorUploadModal from './components/CreatorUploadModal';
import VideoPlayerModal from './components/VideoPlayerModal';
import Roadmap from './components/Roadmap';
import { FEATURED_DOC, DOCUMENTARIES, CATEGORIES } from './data/mockData';

export default function App() {
  const [activeTab, setActiveTab] = useState('discover'); // 'discover', 'calculator', 'creators', 'roadmap'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [docsList, setDocsList] = useState(DOCUMENTARIES);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isLightTheme, setIsLightTheme] = useState(false);

  // Apply light theme class to body
  useEffect(() => {
    if (isLightTheme) {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }, [isLightTheme]);

  // Handle uploading a new doc from creator modal
  const handleUploadSuccess = (newDoc) => {
    setDocsList([newDoc, ...docsList]);
    alert(`Success! "${newDoc.title}" published to UNDRGRND Docs subscription pool!`);
  };

  // Filtered documentaries based on category & search
  const filteredDocs = docsList.filter((doc) => {
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.creator.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="app-container">
      {/* 3D Interactive Three.js Background Canvas */}
      <ThreeCanvas />

      {/* Glassmorphic Navigation Header (PlexUpdates style) */}
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenUpload={() => setIsUploadOpen(true)}
        isLightTheme={isLightTheme}
        setIsLightTheme={setIsLightTheme}
      />

      <main className="main-content" style={{ position: 'relative', zIndex: 10 }}>
        {/* DISCOVER TAB VIEW */}
        {activeTab === 'discover' && (
          <>
            {/* Featured Hero Banner */}
            {!searchQuery && selectedCategory === 'all' && (
              <HeroBanner 
                featuredDoc={FEATURED_DOC} 
                onSelectVideo={(doc) => setSelectedVideo(doc)} 
              />
            )}

            {/* Category Filter Chips */}
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '12px', marginTop: '20px', marginBottom: '24px' }}>
              <button 
                className={`tab-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('all')}
              >
                <i className="fa-solid fa-layer-group"></i> All Docs
              </button>
              {CATEGORIES.map(cat => (
                <button 
                  key={cat.id}
                  className={`tab-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  <i className={`fa-solid ${cat.icon}`}></i> {cat.name}
                </button>
              ))}
            </div>

            {/* If searching or filtering, show grid view */}
            {searchQuery || selectedCategory !== 'all' ? (
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, marginBottom: '16px' }}>
                  Results ({filteredDocs.length})
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
                  {filteredDocs.map((doc) => (
                    <div 
                      key={doc.id} 
                      className="media-card"
                      onClick={() => setSelectedVideo(doc)}
                      style={{ flex: 'none' }}
                    >
                      <div className="card-poster-wrapper">
                        <img src={doc.thumbnailUrl} alt={doc.title} className="card-poster-img" />
                        <div className="card-play-overlay">
                          <div className="play-circle-btn">
                            <i className="fa-solid fa-play" style={{ marginLeft: '3px' }}></i>
                          </div>
                        </div>
                        <span className="badge badge-quality" style={{ position: 'absolute', top: '8px', left: '8px', zIndex: 2 }}>
                          {doc.quality}
                        </span>
                        <span style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(0,0,0,0.8)', color: '#fff', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', zIndex: 2 }}>
                          {doc.duration}
                        </span>
                      </div>
                      <div className="card-body">
                        <h4 className="card-title">{doc.title}</h4>
                        <div className="card-creator-row">
                          <img src={doc.creatorAvatar} alt={doc.creator} className="creator-avatar" />
                          <span className="creator-name">{doc.creator}</span>
                        </div>
                        <div className="card-meta-row">
                          <span>{doc.views} views</span>
                          <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{doc.monthlyEarnings}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Standard Plex Horizontal Rails View */
              <>
                <MediaRail 
                  title="🔥 Suppressed & Banned on Mainstream YT"
                  subtitle="Raw street journalism restricted or demonetized by YouTube algorithms"
                  icon="fa-shield-cat"
                  docs={docsList.filter(d => d.category === 'banned' || d.category === 'street')}
                  onSelectVideo={(doc) => setSelectedVideo(doc)}
                />

                <MediaRail 
                  title="🚀 Rising Creators (Sub-10K Subscribers)"
                  subtitle="Up-and-coming documentarians who don't get shown on YouTube"
                  icon="fa-rocket"
                  docs={docsList.filter(d => d.category === 'rising')}
                  onSelectVideo={(doc) => setSelectedVideo(doc)}
                />

                <MediaRail 
                  title="🎥 Tommy G Style Street Journalism"
                  subtitle="Unfiltered undercover hoods, underground circuits, & real-world subcultures"
                  icon="fa-video"
                  docs={docsList.filter(d => d.category === 'street')}
                  onSelectVideo={(doc) => setSelectedVideo(doc)}
                />

                <MediaRail 
                  title="🔍 Underground Deep Dive Investigations"
                  subtitle="Investigative video journalism free from corporate sponsor influence"
                  icon="fa-magnifying-glass"
                  docs={docsList.filter(d => d.category === 'investigation')}
                  onSelectVideo={(doc) => setSelectedVideo(doc)}
                />
              </>
            )}
          </>
        )}

        {/* REVENUE POOL TAB VIEW */}
        {activeTab === 'calculator' && (
          <RevenueCalculator />
        )}

        {/* CREATOR HUB TAB VIEW */}
        {activeTab === 'creators' && (
          <div style={{ marginTop: '28px', textAlign: 'center' }}>
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '48px 24px', maxWidth: '800px', margin: '0 auto' }}>
              <i className="fa-solid fa-clapperboard" style={{ fontSize: '3rem', color: 'var(--accent)', marginBottom: '16px' }}></i>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, marginBottom: '12px' }}>
                Indie Creator & Filmmaker Portal
              </h2>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '580px', margin: '0 auto 28px', lineHeight: 1.5 }}>
                Are you an up-and-coming documentarian or street journalist like Tommy G or Channel 5? Stop letting YouTube demonetize your videos or hide your channel behind restrictive algorithms.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <button className="btn-accent" onClick={() => setIsUploadOpen(true)}>
                  <i className="fa-solid fa-cloud-arrow-up"></i> Upload Your First Doc
                </button>
                <button className="btn-outline" onClick={() => setActiveTab('calculator')}>
                  <i className="fa-solid fa-calculator"></i> Calculate Revenue Share
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 5-YEAR ROADMAP TAB VIEW */}
        {activeTab === 'roadmap' && (
          <Roadmap />
        )}
      </main>

      {/* MODALS */}
      <CreatorUploadModal 
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />

      <VideoPlayerModal 
        doc={selectedVideo}
        onClose={() => setSelectedVideo(null)}
      />
    </div>
  );
}

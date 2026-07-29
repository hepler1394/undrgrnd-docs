import React, { useState } from 'react';
import { MOCK_NOTIFICATIONS } from '../data/mockData';

export default function Header({ activeTab, setActiveTab, searchQuery, setSearchQuery, onOpenUpload, isLightTheme, setIsLightTheme }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const unreadCount = MOCK_NOTIFICATIONS.filter(n => n.unread).length;

  return (
    <header className="glass-header">
      <nav className="navbar">
        {/* Brand Logo */}
        <div className="brand-logo" onClick={() => setActiveTab('discover')}>
          <i className="fa-solid fa-play" style={{ color: 'var(--accent)', fontSize: '1.2rem' }}></i>
          <span>UNDRGRND</span>
          <span className="brand-badge">DOCS</span>
        </div>

        {/* View Mode Navigation Tabs */}
        <div className="nav-tabs">
          <button 
            className={`tab-btn ${activeTab === 'discover' ? 'active' : ''}`}
            onClick={() => setActiveTab('discover')}
          >
            <i className="fa-solid fa-compass"></i> Discover
          </button>
          <button 
            className={`tab-btn ${activeTab === 'calculator' ? 'active' : ''}`}
            onClick={() => setActiveTab('calculator')}
          >
            <i className="fa-solid fa-calculator"></i> Revenue Pool
          </button>
          <button 
            className={`tab-btn ${activeTab === 'creators' ? 'active' : ''}`}
            onClick={() => setActiveTab('creators')}
          >
            <i className="fa-solid fa-clapperboard"></i> Creator Hub
          </button>
          <button 
            className={`tab-btn ${activeTab === 'roadmap' ? 'active' : ''}`}
            onClick={() => setActiveTab('roadmap')}
          >
            <i className="fa-solid fa-timeline"></i> 5-Yr Plan
          </button>
        </div>

        {/* Right Nav Actions */}
        <div className="nav-actions">
          {/* Search Input */}
          <div className="search-bar">
            <i className="fa-solid fa-magnifying-glass search-icon"></i>
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search docs, Tommy G, street stories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Theme Toggle Button (PlexUpdates style) */}
          <button 
            className="theme-toggle-btn"
            title="Toggle Light/Dark Theme"
            onClick={() => setIsLightTheme(!isLightTheme)}
          >
            <i className={`fa-solid ${isLightTheme ? 'fa-moon' : 'fa-sun'}`}></i>
          </button>

          {/* Notification Bell Dropdown */}
          <div className="notif-wrapper">
            <button 
              className="notif-bell-btn"
              onClick={() => setNotifOpen(!notifOpen)}
              title="Notifications"
            >
              <i className="fa-solid fa-bell"></i>
              {unreadCount > 0 && <span className="notif-badge-count">{unreadCount}</span>}
            </button>

            {notifOpen && (
              <div className="notif-dropdown">
                <div className="notif-header">
                  <span>Platform Payouts & Alerts</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--accent)', cursor: 'pointer' }}>Mark read</span>
                </div>
                <div className="notif-list">
                  {MOCK_NOTIFICATIONS.map(n => (
                    <div key={n.id} className={`notif-item ${n.unread ? 'unread' : ''}`}>
                      <div className="notif-icon">
                        <i className={`fa-solid ${n.type === 'revenue' ? 'fa-sack-dollar' : n.type === 'upload' ? 'fa-video' : 'fa-triangle-exclamation'}`}></i>
                      </div>
                      <div>
                        <div className="notif-text">{n.text}</div>
                        <div className="notif-time">{n.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Upload Button */}
          <button className="btn-accent" onClick={onOpenUpload}>
            <i className="fa-solid fa-cloud-arrow-up"></i> Upload Doc
          </button>
        </div>
      </nav>
    </header>
  );
}

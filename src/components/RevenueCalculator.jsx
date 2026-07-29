import React, { useState } from 'react';

export default function RevenueCalculator() {
  const [platformSubs, setPlatformSubs] = useState(25000); // 25k subscribers @ $4.99
  const [creatorSharePct, setCreatorSharePct] = useState(3.5); // 3.5% of total watch hours
  const subPrice = 4.99;
  const creatorPoolShare = 0.75; // 75% goes to creators

  const grossMonthlyRevenue = platformSubs * subPrice;
  const totalCreatorPool = grossMonthlyRevenue * creatorPoolShare;
  const creatorMonthlyPayout = (totalCreatorPool * (creatorSharePct / 100)).toFixed(2);
  
  // Comparable YouTube earnings for same views (assuming typical $1.50 CPM or $0 on demonetized docs)
  const ytEstPayout = ((platformSubs * (creatorSharePct / 100) * 12) * 1.5).toFixed(2);

  return (
    <div style={{ marginTop: '28px', marginBottom: '48px' }}>
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <span className="badge badge-revenue" style={{ fontSize: '0.8rem', padding: '6px 12px', marginBottom: '12px' }}>
          <i className="fa-solid fa-scale-balanced"></i> Fair Creator Economics
        </span>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Subscription Revenue Pool Calculator
        </h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '680px', margin: '8px auto 0' }}>
          Unlike YouTube where demonetization or age-restrictions wipe out your ad revenue, UNDRGRND Docs pools 75% of every $4.99 subscription and distributes it directly based on watch minutes.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '32px'
      }}>
        {/* Sliders Control Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Slider 1: Platform Subscribers */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Active Platform Subscribers
              </label>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--accent)' }}>
                {platformSubs.toLocaleString()} subscribers
              </span>
            </div>
            <input 
              type="range"
              min="5000"
              max="250000"
              step="5000"
              value={platformSubs}
              onChange={(e) => setPlatformSubs(Number(e.target.value))}
              style={{
                width: '100%',
                accentColor: 'var(--accent)',
                cursor: 'pointer'
              }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              $4.99/mo user subscription rate
            </span>
          </div>

          {/* Slider 2: Creator Watch Time Share */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Your Share of Platform Watch Time
              </label>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--accent)' }}>
                {creatorSharePct}% of total watch-min
              </span>
            </div>
            <input 
              type="range"
              min="0.2"
              max="15"
              step="0.1"
              value={creatorSharePct}
              onChange={(e) => setCreatorSharePct(Number(e.target.value))}
              style={{
                width: '100%',
                accentColor: 'var(--accent)',
                cursor: 'pointer'
              }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Based on monthly active viewer minutes on your docs
            </span>
          </div>

          {/* Key Advantages List */}
          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <i className="fa-solid fa-circle-check" style={{ color: 'var(--green-neon)' }}></i>
              <span>Zero dependence on advertisers or corporate sponsors</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <i className="fa-solid fa-circle-check" style={{ color: 'var(--green-neon)' }}></i>
              <span>Full payout even if YouTube age-restricts your video</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <i className="fa-solid fa-circle-check" style={{ color: 'var(--green-neon)' }}></i>
              <span>Instant monthly payouts directly to Stripe / Crypto</span>
            </div>
          </div>
        </div>

        {/* Results Card Column */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-hover)',
          borderRadius: 'var(--radius-md)',
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          justify-content: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
              Projected Monthly Creator Earnings
            </div>
            
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2.8rem',
              fontWeight: 900,
              color: 'var(--accent)',
              margin: '12px 0 6px 0',
              lineHeight: 1
            }}>
              ${Number(creatorMonthlyPayout).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>/mo</span>
            </div>

            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Annualized potential: <strong style={{ color: '#fff' }}>${(Number(creatorMonthlyPayout) * 12).toLocaleString('en-US', { maximumFractionDigits: 0 })}/year</strong>
            </div>

            {/* YouTube Comparison Card */}
            <div style={{
              background: 'rgba(229, 9, 20, 0.08)',
              border: '1px solid rgba(229, 9, 20, 0.25)',
              borderRadius: '10px',
              padding: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ff4d4d' }}>
                  <i className="fa-brands fa-youtube"></i> Mainstream YT AdSense:
                </span>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ff4d4d' }}>
                  ~${ytEstPayout}/mo
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                *YouTube pays fraction-of-a-cent CPMs and regularly drops earnings to $0 for street journalism or raw documentaries.
              </p>
            </div>
          </div>

          <button className="btn-accent" style={{ marginTop: '24px', width: '100%', justifyContent: 'center' }}>
            <i className="fa-solid fa-rocket"></i> Apply as a Partner Creator
          </button>
        </div>
      </div>
    </div>
  );
}

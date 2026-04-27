import React from 'react';
import Card from '../../components/Card';
import '../../components/Skeleton.css';

const StatsSkeleton: React.FC = () => {
  return (
    <div className="stats-page">
      <div className="stats-grid-top">
        {/* Streak Card Skeleton */}
        <Card className="skeleton streak-stats-card" style={{ height: '220px', border: 'none', background: 'rgba(0,0,0,0.05)' }}>
          <div className="skeleton-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '12px' }}>
            <div className="skeleton-text short" style={{ height: '14px', marginBottom: '8px' }}></div>
            <div className="skeleton-text medium" style={{ height: '60px', borderRadius: '12px', width: '120px' }}></div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              {[1, 2, 3].map(i => (
                <div key={i} className="skeleton-badge" style={{ width: '24px', height: '24px', borderRadius: '50%' }}></div>
              ))}
            </div>
          </div>
        </Card>

        {/* Overview Card Skeleton */}
        <Card className="skeleton overview-stats-card" style={{ height: '220px', border: 'none', background: 'rgba(0,0,0,0.05)' }}>
          <div className="skeleton-content" style={{ display: 'flex', alignItems: 'center', gap: '30px', width: '100%', height: '100%' }}>
            <div className="skeleton-circle" style={{ width: '110px', height: '110px', borderRadius: '50%', background: 'rgba(0,0,0,0.1)', flexShrink: 0 }}></div>
            <div className="skeleton-info" style={{ flex: 1, display: 'flex', gap: '16px' }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                  <div className="skeleton-text short" style={{ height: '24px', width: '40px' }}></div>
                  <div className="skeleton-text short" style={{ height: '12px', width: '60px' }}></div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="stats-sections">
        {/* Weekly Activity Skeleton */}
        <Card className="skeleton" style={{ height: '320px', border: 'none', background: 'rgba(0,0,0,0.05)', padding: '24px' }}>
          <div className="skeleton-title" style={{ width: '200px', marginBottom: '40px' }}></div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '180px', padding: '0 10px' }}>
            {[1, 2, 3, 4, 5, 6, 7].map(i => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', flex: 1 }}>
                <div className="skeleton-text" style={{ width: '40%', height: `${Math.random() * 60 + 30}%`, margin: 0, borderRadius: '8px' }}></div>
                <div className="skeleton-text short" style={{ height: '12px', width: '30px', margin: 0 }}></div>
              </div>
            ))}
          </div>
        </Card>

        <div className="stats-row">
          <div className="stats-col-left" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Learning Progress Skeleton */}
            <Card className="skeleton" style={{ padding: '24px', border: 'none', background: 'rgba(0,0,0,0.05)' }}>
              <div className="skeleton-title" style={{ width: '150px', marginBottom: '24px' }}></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {[1, 2, 3].map(i => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div className="skeleton-text short" style={{ height: '12px', width: '80px' }}></div>
                      <div className="skeleton-text short" style={{ height: '12px', width: '40px' }}></div>
                    </div>
                    <div className="skeleton-text" style={{ height: '12px', width: '100%', borderRadius: '6px' }}></div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Weak Words Skeleton */}
            <Card className="skeleton" style={{ padding: '24px', border: 'none', background: 'rgba(0,0,0,0.05)' }}>
              <div className="skeleton-title" style={{ width: '180px', marginBottom: '24px' }}></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{ height: '60px', background: 'rgba(0,0,0,0.03)', borderRadius: '12px' }}></div>
                ))}
              </div>
            </Card>
          </div>

          {/* Word Types Skeleton */}
          <Card className="skeleton" style={{ padding: '24px', border: 'none', background: 'rgba(0,0,0,0.05)' }}>
            <div className="skeleton-title" style={{ width: '180px', marginBottom: '24px' }}></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div className="skeleton-text short" style={{ height: '14px', width: '60px' }}></div>
                    <div className="skeleton-text short" style={{ height: '14px', width: '30px' }}></div>
                  </div>
                  <div className="skeleton-text" style={{ height: '8px', width: '100%', borderRadius: '4px' }}></div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StatsSkeleton;

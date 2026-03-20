import React from 'react';
import './Skeleton.css';

interface SkeletonWordCardProps {
  hasFooter?: boolean;
  hasExampleBox?: boolean;
  className?: string;
}

const SkeletonWordCard: React.FC<SkeletonWordCardProps> = ({ hasFooter = false, hasExampleBox = false, className = '' }) => {
  return (
    <div className={`skeleton skeleton-card ${className}`} style={{ width: '100%', height: '100%' }}>
      <div className="skeleton-header">
        <div className="skeleton-title" style={{ margin: 0, height: '28px', width: '60%' }}></div>
        <div className="skeleton-badge" style={{ height: '24px', width: '60px' }}></div>
      </div>
      <div className="skeleton-text long" style={{ height: '16px' }}></div>
      <div className="skeleton-text medium" style={{ height: '16px', marginBottom: (hasFooter || hasExampleBox) ? 'auto' : '0' }}></div>
      
      {hasExampleBox && (
        <div style={{ marginTop: 'auto', background: 'rgba(0,0,0,0.05)', padding: '12px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="skeleton-text short" style={{ height: '12px', margin: 0, background: 'rgba(0,0,0,0.1)' }}></div>
          <div className="skeleton-text long" style={{ height: '12px', margin: 0, background: 'rgba(0,0,0,0.1)' }}></div>
          <div className="skeleton-text medium" style={{ height: '12px', margin: 0, background: 'rgba(0,0,0,0.1)' }}></div>
        </div>
      )}

      {hasFooter && (
        <div className="card-footer" style={{ borderTop: 'none', marginTop: '12px', padding: 0 }}>
          <div className="skeleton-text short" style={{ margin: 0, height: '12px' }}></div>
        </div>
      )}
    </div>
  );
};

export default SkeletonWordCard;

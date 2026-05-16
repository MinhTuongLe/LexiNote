import React from 'react';
import Card from '../../components/Card';
import '../../components/Skeleton.css';

const StatsSkeleton: React.FC = () => {
  return (
    <div className="stats-page skeleton-page">
      <div className="stats-grid-top">
        {/* Streak Card Skeleton */}
        <Card className="skeleton-card streak-stats-card">
          <div className="skeleton-content streak-skeleton-content">
            <div className="skeleton-text short title-skele"></div>
            <div className="skeleton-text medium value-skele"></div>
            <div className="skeleton-badges-row">
              {[1, 2, 3].map(i => (
                <div key={i} className="skeleton-badge"></div>
              ))}
            </div>
          </div>
        </Card>

        {/* Overview Card Skeleton */}
        <Card className="skeleton-card overview-stats-card">
          <div className="skeleton-content overview-skeleton-content">
            <div className="skeleton-circle accuracy-skele"></div>
            <div className="skeleton-info-grid">
              {[1, 2, 3].map(i => (
                <div key={i} className="skeleton-info-item">
                  <div className="skeleton-text short val-skele"></div>
                  <div className="skeleton-text short lab-skele"></div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="stats-sections">
        {/* Weekly Activity Skeleton */}
        <Card className="skeleton-card weekly-activity-skele">
          <div className="skeleton-title-row"></div>
          <div className="skeleton-chart-area">
            {[1, 2, 3, 4, 5, 6, 7].map(i => (
              <div key={i} className="skeleton-chart-col">
                <div className="skeleton-bar" style={{ height: `${Math.random() * 60 + 30}%` }}></div>
                <div className="skeleton-text short label-skele"></div>
              </div>
            ))}
          </div>
        </Card>

        <div className="stats-row">
          <div className="stats-col-left">
            {/* Learning Progress Skeleton */}
            <Card className="skeleton-card progress-skele">
              <div className="skeleton-title-row small"></div>
              <div className="skeleton-progress-list">
                {[1, 2, 3].map(i => (
                  <div key={i} className="skeleton-progress-item">
                    <div className="skele-label-row">
                      <div className="skeleton-text short"></div>
                      <div className="skeleton-text short"></div>
                    </div>
                    <div className="skeleton-bar-full"></div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Weak Words Skeleton */}
            <Card className="skeleton-card weak-words-skele">
              <div className="skeleton-title-row small"></div>
              <div className="skeleton-list-vertical">
                {[1, 2, 3].map(i => (
                  <div key={i} className="skeleton-list-item"></div>
                ))}
              </div>
            </Card>
          </div>

          {/* Word Types Skeleton */}
          <Card className="skeleton-card types-skele">
            <div className="skeleton-title-row small"></div>
            <div className="skeleton-types-list">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="skeleton-type-item">
                  <div className="skele-label-row">
                    <div className="skeleton-text short"></div>
                    <div className="skeleton-text short"></div>
                  </div>
                  <div className="skeleton-bar-mini"></div>
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

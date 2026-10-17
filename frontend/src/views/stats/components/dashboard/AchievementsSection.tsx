import React from 'react';
import Card from '../../../../components/Card';
import { Award, Lock, CheckCircle2 } from 'lucide-react';
import { useGetUserAchievementsQuery, useUnlockAchievementMutation } from '../../../../store/apiSlice';
import { mapAchievement } from '../../achievementUtils';

interface AchievementsSectionProps {
  mounted?: boolean;
}

export const AchievementsSection: React.FC<AchievementsSectionProps> = ({ mounted }) => {
  const { data: userAchievementsData, isLoading, isError } = useGetUserAchievementsQuery();
  const [unlockAchievementApi] = useUnlockAchievementMutation();

  const achievements = React.useMemo(
    () => (userAchievementsData?.achievements || []).map(mapAchievement),
    [userAchievementsData?.achievements],
  );

  React.useEffect(() => {
    achievements.forEach(a => {
      if (!a.unlocked && a.progress >= a.target) {
        void unlockAchievementApi(a.id).unwrap().catch(() => undefined);
      }
    });
  }, [achievements, unlockAchievementApi]);

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  if (isLoading) {
    return <Card className="achievements-section-card"><p>Loading achievements...</p></Card>;
  }

  if (isError) {
    return <Card className="achievements-section-card"><p>Unable to load achievements.</p></Card>;
  }

  return (
    <Card className={`achievements-section-card ${mounted ? 'mounted' : ''}`} style={{ marginTop: '20px' }}>
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Award size={22} style={{ color: 'var(--primary)' }} />
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Achievements & Badges</h3>
        </div>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, background: 'var(--secondary)', padding: '4px 12px', borderRadius: '20px', border: '1.5px solid var(--border)' }}>
          {unlockedCount} / {achievements.length} Unlocked
        </span>
      </div>

      <div className="achievements-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
        {achievements.map((item) => {
          return (
            <div 
              key={item.id} 
              className={`achievement-badge-card ${item.unlocked ? 'unlocked' : 'locked'}`}
              style={{
                background: item.unlocked ? item.badgeColor : 'var(--background)',
                border: '2px solid var(--border)',
                borderRadius: '16px',
                padding: '14px',
                position: 'relative',
                boxShadow: item.unlocked ? '3px 3px 0px var(--border)' : 'none',
                opacity: item.unlocked ? 1 : 0.75,
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <span style={{ fontSize: '2rem' }}>{item.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.title}
                    </h4>
                    {item.unlocked ? (
                      <CheckCircle2 size={16} style={{ color: '#00b894', flexShrink: 0 }} />
                    ) : (
                      <Lock size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    )}
                  </div>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.2 }}>
                    {item.desc}
                  </p>
                </div>
              </div>

              <div style={{ marginTop: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 700, marginBottom: '4px' }}>
                  <span>Progress</span>
                  <span>{item.current} / {item.target}</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(0,0,0,0.08)', borderRadius: '10px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      height: '100%', 
                      width: `${item.progressPercent}%`,
                      background: item.unlocked ? '#00b894' : 'var(--primary)',
                      borderRadius: '10px',
                      transition: 'width 0.4s ease'
                    }} 
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default AchievementsSection;

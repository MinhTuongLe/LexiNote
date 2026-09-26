import React from 'react';
import Card from '../../../../components/Card';
import { Award, Lock, CheckCircle2 } from 'lucide-react';
import type { StudyStats } from '../../../../types';
import { useGetUserAchievementsQuery, useUnlockAchievementMutation } from '../../../../store/apiSlice';

interface AchievementsSectionProps {
  stats: StudyStats;
  mounted?: boolean;
}

export const AchievementsSection: React.FC<AchievementsSectionProps> = ({ stats, mounted }) => {
  const { data: userAchievementsData } = useGetUserAchievementsQuery();
  const [unlockAchievementApi] = useUnlockAchievementMutation();

  const totalWords = stats.totalWords || 0;
  const streak = stats.streak || 0;
  const accuracy = stats.accuracy || 0;
  const masteredWords = stats.masteryBreakdown?.mastered || 0;

  const serverUnlockedIds = new Set((userAchievementsData?.achievements || []).filter(a => a.unlocked).map(a => a.id));

  const achievements = [
    {
      id: 'beginner',
      icon: '🐰',
      title: 'Lexi Beginner',
      desc: 'Add your first 10 vocabulary words',
      current: totalWords,
      target: 10,
      unlocked: totalWords >= 10 || serverUnlockedIds.has('beginner'),
      badgeColor: '#ffeaa7'
    },
    {
      id: 'streak',
      icon: '🔥',
      title: 'Streak Master',
      desc: 'Reach a 7-day study streak',
      current: streak,
      target: 7,
      unlocked: streak >= 7 || serverUnlockedIds.has('streak'),
      badgeColor: '#ff7675'
    },
    {
      id: 'mastery',
      icon: '🧠',
      title: 'Memory Wizard',
      desc: 'Master 20 words with 100% SRS memory',
      current: masteredWords,
      target: 20,
      unlocked: masteredWords >= 20 || serverUnlockedIds.has('mastery'),
      badgeColor: '#a29bfe'
    },
    {
      id: 'accuracy',
      icon: '🎯',
      title: 'Sharpshooter',
      desc: 'Achieve 80% or higher overall accuracy',
      current: Math.round(accuracy),
      target: 80,
      unlocked: accuracy >= 80 || serverUnlockedIds.has('accuracy'),
      badgeColor: '#55efc4'
    }
  ];

  // Auto-sync unlocks to server
  React.useEffect(() => {
    achievements.forEach(a => {
      if (a.unlocked && !serverUnlockedIds.has(a.id)) {
        unlockAchievementApi(a.id).catch(() => {});
      }
    });
  }, [achievements, serverUnlockedIds, unlockAchievementApi]);

  const unlockedCount = achievements.filter(a => a.unlocked).length;

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
          const progressPercent = Math.min(100, Math.round((item.current / item.target) * 100));
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
                      <CheckCircle2 size={16} style={{ color: '#00b894', shrink: 0 }} />
                    ) : (
                      <Lock size={14} style={{ color: 'var(--text-muted)', shrink: 0 }} />
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
                      width: `${progressPercent}%`, 
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

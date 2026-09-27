import React from 'react';
import Card from '../../../../components/Card';
import { Trophy, Medal, Crown, Timer, Flame, AlertCircle } from 'lucide-react';
import { useGetGameLeaderboardQuery } from '../../../../store/apiSlice';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../store';
import { useTranslation } from 'react-i18next';
import { getInitials, getPodiumEntries } from './leaderboardUtils';
import './LeaderboardSection.css';

interface LeaderboardSectionProps {
  mounted?: boolean;
}

export const LeaderboardSection: React.FC<LeaderboardSectionProps> = ({ mounted }) => {
  const { t } = useTranslation();
  const { data: leaderboard = [], isLoading, isError } = useGetGameLeaderboardQuery({ gameType: 'MATCH_GAME', limit: 10 });
  const currentUserId = useSelector((state: RootState) => state.auth.user?.id);

  const topThree = React.useMemo(() => leaderboard.slice(0, 3), [leaderboard]);
  const restList = leaderboard.slice(3);

  const podiumOrder = React.useMemo(() => getPodiumEntries(topThree), [topThree]);

  return (
    <Card className={`leaderboard-section-card ${mounted ? 'mounted' : ''}`} style={{ marginTop: '20px' }}>
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Trophy size={22} style={{ color: '#fdcb6e' }} />
          <h3 id="leaderboard-title" style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
            {t('stats.leaderboard_title', 'Bảng Xếp Hạng Tuần')}
          </h3>
        </div>
        <span className="leaderboard-game-badge">
          🎮 Match Game
        </span>
      </div>

      {isLoading ? (
        <div className="leaderboard-loading" style={{ padding: '24px', textAlign: 'center', opacity: 0.7 }}>
          {t('common.loading', 'Đang tải...')}
        </div>
      ) : isError ? (
        <div className="leaderboard-error" role="alert">
          <AlertCircle size={22} aria-hidden="true" />
          <span>{t('stats.leaderboard_error', 'Unable to load the leaderboard right now.')}</span>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="leaderboard-empty" style={{ padding: '30px 20px', textAlign: 'center', background: 'var(--background-soft, #f8f9fa)', borderRadius: '16px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🐰</div>
          <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', fontWeight: 700 }}>
            {t('stats.leaderboard_empty_title', 'Chưa có ai lên bảng tuần này!')}
          </h4>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted, #6c757d)' }}>
            {t('stats.leaderboard_empty_desc', 'Hãy tham gia chơi minigame Ghép từ để ghi danh đầu tiên nhé!')}
          </p>
        </div>
      ) : (
        <div className="leaderboard-content">
          {/* Top 3 Podium */}
          {podiumOrder.length > 0 && (
            <div className="podium-container">
              {podiumOrder.map((entry) => {
                const isMe = currentUserId === entry.user.id;
                const initials = getInitials(entry.user.fullName);
                
                return (
                  <div key={entry.user.id} className={`podium-card ${entry.place} ${isMe ? 'is-me' : ''}`}>
                    <div className="podium-badge">
                      {entry.place === 'first' && <Crown size={22} className="crown-gold" />}
                      {entry.place === 'second' && <Medal size={20} className="medal-silver" />}
                      {entry.place === 'third' && <Medal size={20} className="medal-bronze" />}
                    </div>

                    <div className="avatar-wrapper">
                      {entry.user.avatar ? (
                        <img src={entry.user.avatar} alt={entry.user.fullName} className="user-avatar" />
                      ) : (
                        <div className="user-avatar-initials">{initials}</div>
                      )}
                      <span className="rank-tag">{entry.rank}</span>
                    </div>

                    <div className="user-name" title={entry.user.fullName}>
                      {entry.user.fullName} {isMe && <span className="you-label">(Bạn)</span>}
                    </div>

                    <div className="score-details">
                      <span className="score-pts">
                        <Flame size={14} style={{ color: '#e17055' }} /> {entry.bestScore} {t('stats.pts', 'đ')}
                      </span>
                      <span className="time-sec">
                        <Timer size={12} /> {entry.bestTimeSeconds}s
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Ranks 4 to 10 List */}
          {restList.length > 0 && (
            <div className="leaderboard-list">
              {restList.map((entry) => {
                const isMe = currentUserId === entry.user.id;
                const initials = getInitials(entry.user.fullName);

                return (
                  <div key={entry.user.id} className={`leaderboard-item ${isMe ? 'is-me' : ''}`}>
                    <div className="rank-num">#{entry.rank}</div>

                    <div className="user-info">
                      {entry.user.avatar ? (
                        <img src={entry.user.avatar} alt={entry.user.fullName} className="item-avatar" />
                      ) : (
                        <div className="item-avatar-initials">{initials}</div>
                      )}
                      <span className="item-name">
                        {entry.user.fullName} {isMe && <span className="you-label">(Bạn)</span>}
                      </span>
                    </div>

                    <div className="item-stats">
                      <span className="item-score">{entry.bestScore} {t('stats.pts', 'đ')}</span>
                      <span className="item-time">{entry.bestTimeSeconds}s</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default LeaderboardSection;

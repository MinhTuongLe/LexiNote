import React, { useState } from 'react';
import ReModal from '@/components/ui/ReModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Skeleton from '@/components/ui/Skeleton';
import { UserDetailModalSkeleton } from '@/components/ui/skeletons';
import { 
  useGetUserDetailsQuery, 
  useToggleUserStatusMutation, 
  useToggleEmailVerifiedMutation,
  useGetUserSessionsQuery,
  useRevokeUserSessionMutation,
  useRevokeAllUserSessionsMutation,
  useResetUserPasswordMutation
} from '@/store/api/usersApi';
import { 
  Mail, 
  BookOpen, 
  BrainCircuit, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  Sparkles,
  Layers,
  LogOut,
  Globe,
  Key
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Tooltip from '@/components/ui/Tooltip';

export interface UserWordReview {
  correctCount: number;
  wrongCount: number;
  easeFactor: number;
  interval: number;
}

export interface UserWordItem {
  id: number;
  word: string;
  type: string;
  meaningVi: string;
  example?: string;
  reviews?: UserWordReview[];
}

export interface UserSessionItem {
  id: number;
  ipAddress?: string;
  isExpired?: boolean;
  userAgent?: string;
  createdAt?: string;
  expiresAt?: string;
}

interface UserDetailModalProps {
  userId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onViewUserWords?: (userId: number) => void;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  userId,
  isOpen,
  onClose,
  onViewUserWords
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'words' | 'sessions'>('overview');

  const { data, isLoading, refetch } = useGetUserDetailsQuery(userId || 0, {
    skip: !userId || !isOpen,
  });

  const { data: sessions, isLoading: isSessionsLoading, refetch: refetchSessions } = useGetUserSessionsQuery(userId || 0, {
    skip: !userId || !isOpen || activeTab !== 'sessions',
  });

  const [toggleStatus, { isLoading: isTogglingStatus }] = useToggleUserStatusMutation();
  const [toggleVerify, { isLoading: isTogglingVerify }] = useToggleEmailVerifiedMutation();
  const [revokeSession] = useRevokeUserSessionMutation();
  const [revokeAllSessions, { isLoading: isRevokingAll }] = useRevokeAllUserSessionsMutation();
  const [resetPassword, { isLoading: isResettingPassword }] = useResetUserPasswordMutation();
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  if (!isOpen || !userId) return null;

  const user = data?.user;
  const stats = data?.stats;
  const words = data?.words || [];

  const handleToggleStatus = async () => {
    try {
      await toggleStatus(userId).unwrap();
      toast({ type: 'success', title: 'Status Updated', message: 'User status toggled successfully.' });
      refetch();
    } catch {
      toast({ type: 'error', title: 'Action Failed', message: 'Could not update user status.' });
    }
  };

  const handleToggleVerify = async () => {
    try {
      await toggleVerify(userId).unwrap();
      toast({ type: 'success', title: 'Verification Updated', message: 'User email verification status toggled.' });
      refetch();
    } catch {
      toast({ type: 'error', title: 'Action Failed', message: 'Could not toggle email verification.' });
    }
  };

  const handleRevokeSingle = async (sessionId: number) => {
    try {
      await revokeSession({ userId, sessionId }).unwrap();
      toast({ type: 'success', title: 'Session Terminated', message: 'Active session has been revoked.' });
      refetchSessions();
    } catch {
      toast({ type: 'error', title: 'Revoke Failed', message: 'Could not terminate session.' });
    }
  };

  const handleRevokeAll = async () => {
    try {
      await revokeAllSessions(userId).unwrap();
      toast({ type: 'success', title: 'Force Logout Success', message: 'All active sessions for this user have been terminated.' });
      refetchSessions();
    } catch {
      toast({ type: 'error', title: 'Revoke Failed', message: 'Could not terminate user sessions.' });
    }
  };

  const handleConfirmResetPassword = async () => {
    try {
      await resetPassword(userId).unwrap();
      toast.success(
        'Đã Reset Mật Khẩu!',
        'Mật khẩu mặc định của người dùng đã đặt về 123456. Tất cả phiên làm việc đã bị hủy.'
      );
      refetch();
      if (activeTab === 'sessions') refetchSessions();
    } catch {
      toast.error('Reset Thất Bại', 'Không thể đặt lại mật khẩu người dùng.');
    }
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'N/A';
    const num = Number(dateStr);
    const date = !isNaN(num) && num > 0 ? new Date(num) : new Date(dateStr);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <ReModal
      isOpen={isOpen}
      onClose={onClose}
      title="User Account & SRS Inspector"
      description={`Detailed metrics and vocabulary library for user #${userId}`}
    >
      <div className="space-y-5">
        {isLoading ? (
          <UserDetailModalSkeleton />
        ) : !user ? (
          <div className="text-center py-8 text-muted-foreground">User not found.</div>
        ) : (
          <>
            {/* Header Profile Card */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-border/60 bg-muted/30 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold border border-primary/20">
                  {user.avatar || user.fullName?.[0]?.toUpperCase() || '👤'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-foreground text-lg">{user.fullName}</h3>
                    <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'} className="text-[10px]">
                      {user.role}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                    <Mail size={12} /> {user.email}
                  </p>
                </div>
              </div>

              {/* Status & Verification Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="xs"
                  variant={user.isActive ? 'outline' : 'destructive'}
                  className="h-7 text-xs gap-1"
                  onClick={handleToggleStatus}
                  disabled={isTogglingStatus}
                >
                  {user.isActive ? (
                    <><CheckCircle2 size={12} className="text-emerald-500" /> Active</>
                  ) : (
                    <><XCircle size={12} /> Inactive</>
                  )}
                </Button>

                <Button
                  size="xs"
                  variant="outline"
                  className={`h-7 text-xs gap-1 ${
                    user.isEmailVerified 
                      ? 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10' 
                      : 'border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10'
                  }`}
                  onClick={handleToggleVerify}
                  disabled={isTogglingVerify}
                >
                  <ShieldCheck size={12} />
                  {user.isEmailVerified ? 'Verified' : 'Unverified'}
                </Button>

                <Tooltip content="Set default password to 123456 & force logout" side="top">
                  <Button
                    size="xs"
                    variant="outline"
                    className="h-7 text-xs gap-1 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                    onClick={() => setIsResetConfirmOpen(true)}
                    disabled={isResettingPassword}
                  >
                    <Key size={12} />
                    Reset Password (123456)
                  </Button>
                </Tooltip>
              </div>
            </div>

            {/* SRS & Vocabulary KPI Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg border border-border/50 bg-card">
                <p className="text-[11px] font-medium text-muted-foreground uppercase flex items-center gap-1">
                  <BookOpen size={12} className="text-blue-500" /> Words Owned
                </p>
                <p className="text-xl font-bold text-foreground mt-1">{stats?.totalWords ?? 0}</p>
              </div>

              <div className="p-3 rounded-lg border border-border/50 bg-card">
                <p className="text-[11px] font-medium text-muted-foreground uppercase flex items-center gap-1">
                  <BrainCircuit size={12} className="text-purple-500" /> SRS Reviewed
                </p>
                <p className="text-xl font-bold text-foreground mt-1">{stats?.totalReviewed ?? 0}</p>
              </div>

              <div className="p-3 rounded-lg border border-border/50 bg-card">
                <p className="text-[11px] font-medium text-muted-foreground uppercase flex items-center gap-1">
                  <Sparkles size={12} className="text-amber-500" /> Ease Factor
                </p>
                <p className="text-xl font-bold text-foreground mt-1">{stats?.avgEaseFactor ?? 2.5}</p>
              </div>

              <div className="p-3 rounded-lg border border-border/50 bg-card">
                <p className="text-[11px] font-medium text-muted-foreground uppercase flex items-center gap-1">
                  <Layers size={12} className="text-emerald-500" /> Retention Rate
                </p>
                <p className="text-xl font-bold text-foreground mt-1">{stats?.retentionRate ?? 0}%</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border text-sm">
              <button
                className={`py-2 px-4 border-b-2 font-medium transition-colors ${
                  activeTab === 'overview'
                    ? 'border-primary text-primary font-semibold'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setActiveTab('overview')}
              >
                Account Details
              </button>
              <button
                className={`py-2 px-4 border-b-2 font-medium transition-colors ${
                  activeTab === 'words'
                    ? 'border-primary text-primary font-semibold'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setActiveTab('words')}
              >
                Vocabulary Library ({words.length})
              </button>
              <button
                className={`py-2 px-4 border-b-2 font-medium transition-colors ${
                  activeTab === 'sessions'
                    ? 'border-primary text-primary font-semibold'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setActiveTab('sessions')}
              >
                Sessions & Security
              </button>
            </div>

            {/* Tab 1: Account Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-lg border border-border/40 bg-muted/10">
                  <div>
                    <span className="text-muted-foreground">Account ID:</span>
                    <span className="ml-2 font-mono font-medium text-foreground">#{user.id}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Created Date:</span>
                    <span className="ml-2 text-foreground">{formatDate(user.createdAt != null ? String(user.createdAt) : undefined)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Correct Reviews:</span>
                    <span className="ml-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                      {stats?.totalCorrect ?? 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Wrong Answers:</span>
                    <span className="ml-2 text-rose-600 dark:text-rose-400 font-semibold">
                      {stats?.totalWrong ?? 0}
                    </span>
                  </div>
                </div>

                {onViewUserWords && (
                  <div className="flex justify-end">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => onViewUserWords(user.id)}
                      className="gap-1.5"
                    >
                      <BookOpen size={14} /> Open in Word Library
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Vocabulary List */}
            {activeTab === 'words' && (
              <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                {words.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground text-xs">
                    This user has not created any vocabulary items yet.
                  </div>
                ) : (
                  words.map((w: UserWordItem) => {
                    const review = w.reviews?.[0];
                    return (
                      <div
                        key={w.id}
                        className="p-3 rounded-lg border border-border/60 bg-card hover:bg-muted/20 transition-colors flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground text-sm">{w.word}</span>
                            <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                              {w.type}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground mt-0.5">{w.meaningVi}</p>
                          {w.example && (
                            <p className="text-[11px] text-muted-foreground/80 italic mt-0.5">
                              "{w.example}"
                            </p>
                          )}
                        </div>

                        {review ? (
                          <div className="text-right space-y-0.5 font-mono text-[11px]">
                            <div className="text-emerald-600 dark:text-emerald-400">
                              ✓ {review.correctCount} / ✗ {review.wrongCount}
                            </div>
                            <div className="text-muted-foreground">
                              EF: {review.easeFactor} | Int: {review.interval}d
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-muted-foreground italic">New</span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Tab 3: Active Sessions & Remote Logout */}
            {activeTab === 'sessions' && (
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                    Active Refresh Token Sessions ({sessions?.length || 0})
                  </span>
                  <Button
                    size="xs"
                    variant="destructive"
                    onClick={handleRevokeAll}
                    disabled={isRevokingAll || !sessions || sessions.length === 0}
                    className="gap-1 text-xs"
                  >
                    <LogOut size={12} /> Force Logout All Devices
                  </Button>
                </div>

                {isSessionsLoading ? (
                  <Skeleton className="h-20 w-full" />
                ) : !sessions || sessions.length === 0 ? (
                  <div className="p-4 rounded-lg border border-border/60 bg-muted/20 text-center text-muted-foreground">
                    No active refresh token sessions found for this user.
                  </div>
                ) : (
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                    {sessions.map((sess: UserSessionItem) => (
                      <div
                        key={sess.id}
                        className="p-3 rounded-lg border border-border/60 bg-card flex items-center justify-between text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 font-mono font-semibold text-foreground">
                            <Globe size={13} className="text-primary" /> {sess.ipAddress || '127.0.0.1'}
                            {sess.isExpired ? (
                              <Badge variant="destructive" className="text-[9px] py-0">Expired</Badge>
                            ) : (
                              <Badge variant="outline" className="text-[9px] py-0 border-emerald-500/30 text-emerald-500">Active</Badge>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground truncate max-w-sm">
                            {sess.userAgent || 'Unknown Device / Browser'}
                          </p>
                        </div>
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => handleRevokeSingle(sess.id)}
                          className="h-7 text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 border-rose-500/30"
                        >
                          Revoke
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmModal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleConfirmResetPassword}
        title="Reset Mật Khẩu Người Dùng"
        description={`Bạn có chắc chắn muốn reset mật khẩu của ${user?.fullName || 'người dùng này'} về mật khẩu mặc định (123456)? Tất cả phiên đăng nhập hiện tại sẽ bị hủy.`}
        confirmText="Reset Về 123456"
        variant="warning"
        isLoading={isResettingPassword}
      />
    </ReModal>
  );
};


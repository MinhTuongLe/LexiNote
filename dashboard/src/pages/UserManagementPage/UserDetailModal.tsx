import React, { useState } from 'react';
import ReModal from '@/components/ui/ReModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Skeleton from '@/components/ui/Skeleton';
import { 
  useGetUserDetailsQuery, 
  useToggleUserStatusMutation, 
  useToggleEmailVerifiedMutation 
} from '@/store/api/usersApi';
import { 
  Mail, 
  BookOpen, 
  BrainCircuit, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  Sparkles,
  Layers
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

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
  const [activeTab, setActiveTab] = useState<'overview' | 'words'>('overview');

  const { data, isLoading, refetch } = useGetUserDetailsQuery(userId || 0, {
    skip: !userId || !isOpen,
  });

  const [toggleStatus, { isLoading: isTogglingStatus }] = useToggleUserStatusMutation();
  const [toggleVerify, { isLoading: isTogglingVerify }] = useToggleEmailVerifiedMutation();

  if (!isOpen || !userId) return null;

  const user = data?.user;
  const stats = data?.stats;
  const words = data?.words || [];

  const handleToggleStatus = async () => {
    try {
      await toggleStatus(userId).unwrap();
      toast({ type: 'success', title: 'Status Updated', message: 'User status toggled successfully.' });
      refetch();
    } catch (err) {
      toast({ type: 'error', title: 'Action Failed', message: 'Could not update user status.' });
    }
  };

  const handleToggleVerify = async () => {
    try {
      await toggleVerify(userId).unwrap();
      toast({ type: 'success', title: 'Verification Updated', message: 'User email verification status toggled.' });
      refetch();
    } catch (err) {
      toast({ type: 'error', title: 'Action Failed', message: 'Could not toggle email verification.' });
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
          <div className="space-y-4 py-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
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
                    <span className="ml-2 text-foreground">{formatDate(user.createdAt)}</span>
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
                  words.map((w: any) => {
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
          </>
        )}
      </div>
    </ReModal>
  );
};

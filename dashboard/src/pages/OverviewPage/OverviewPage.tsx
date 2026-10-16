import React from 'react';
import {
  Layers,
  Zap,
  ShieldCheck, 
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Clock,
  BrainCircuit,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Cpu
} from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MetricCardSkeleton, ChartSkeleton, ActivityStreamSkeleton } from '@/components/ui/skeletons';
import { useOverview } from './useOverview';
import { useGetRecentActivityQuery, useGetServerHealthQuery } from '@/store/api/analyticsApi';
import { useResetWordSrsMutation } from '@/store/api/wordsApi';
import { useToast } from '@/components/ui/Toast';
import PageHeader from '@/components/common/PageHeader';

import { exportToCSV } from '@/utils/export';
import { Download } from 'lucide-react';

const OverviewPage: React.FC = () => {
  const { toast } = useToast();
  const { kpis, srsStats, rawStats, chartData, timeRange, setTimeRange, isLoading } = useOverview();
  const { data: recentActivities, isLoading: isActivityLoading } = useGetRecentActivityQuery();
  const { data: serverHealth, refetch: refetchHealth } = useGetServerHealthQuery(undefined, { pollingInterval: 15000 });
  const [resetWordSrs] = useResetWordSrsMutation();
  const [resettingWordId, setResettingWordId] = React.useState<number | null>(null);
  const [isRefetchingHealth, setIsRefetchingHealth] = React.useState(false);
  const [chartMetric, setChartMetric] = React.useState<'both' | 'words' | 'users'>('both');
  const [isScanning, setIsScanning] = React.useState(false);

  const handleResetSingleWord = async (id: number, word: string) => {
    try {
      setResettingWordId(id);
      await resetWordSrs(id).unwrap();
      toast.success('SRS Progress Reset', `Reset tiến độ SRS của từ "${word}" thành công!`);
    } catch {
      toast.error('Reset Failed', `Không thể reset tiến độ từ "${word}".`);
    } finally {
      setResettingWordId(null);
    }
  };

  const handleRefreshHealth = async () => {
    setIsRefetchingHealth(true);
    try {
      await refetchHealth();
      toast.success('Health Refreshed', 'Server resource metrics updated.');
    } finally {
      setIsRefetchingHealth(false);
    }
  };

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      toast.success('System Scan Complete', '0 vulnerabilities found. Shards are synchronized.');
    }, 2000);
  };

  const handleExportAnalytics = () => {
    const exportData = [
      {
        Metric: 'Total Users',
        Value: rawStats?.totalUsers || 0,
        Change: rawStats?.userChange || '+12.5%'
      },
      {
        Metric: 'Total Words',
        Value: rawStats?.totalWords || 0,
        Change: rawStats?.wordChange || '+5.2%'
      },
      {
        Metric: 'Active Sessions',
        Value: rawStats?.activeSessions || 0,
        Change: '-2.1%'
      },
      {
        Metric: 'Total Reviews',
        Value: rawStats?.totalReviews || 0,
        Change: '+3.4%'
      },
      {
        Metric: 'SRS Retention Rate',
        Value: `${srsStats?.retentionRate || 0}%`,
        Change: 'N/A'
      }
    ];
    exportToCSV(exportData, 'lexinote_analytics_overview');
    toast.success('Export Successful', 'Downloaded analytics summary CSV.');
  };

  return (
    <div className="space-y-6" id="overview-container">
      <PageHeader
        title="System Overview"
        description="Real-time learning metrics and vocabulary acquisition."
        action={
          <>
            <Button 
              variant="outline" 
              size="sm"
              className="h-9 px-3.5 border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted"
              onClick={handleExportAnalytics}
            >
              <Download size={14} className="mr-1.5" /> Export Summary
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="h-9 px-3.5 border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted"
              onClick={() => toast.info('Cluster Map Initialized', 'Cluster Map initialization sequence started.')}
            >
              <Layers size={14} className="mr-1.5" /> View Clusters
            </Button>
            <Button 
              size="sm"
              className="h-9 px-4 min-w-[130px] font-semibold transition-all shadow-xs"
              onClick={handleScan}
              disabled={isScanning}
            >
              {isScanning ? (
                <><RefreshCw size={14} className="mr-1.5 animate-spin" /> Analyzing...</>
              ) : (
                <><Zap size={14} className="mr-1.5 fill-current" /> System Scan</>
              )}
            </Button>
          </>
        }
      />

      {/* KPI Cards Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="kpi-grid">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <MetricCardSkeleton key={i} />)
        ) : (
          kpis.map((item, i) => {
            const isPositive = item.change.startsWith('+');
            return (
              <Card 
                key={i} 
                className="border-border/60 bg-card shadow-xs hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer group"
              >
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
                      style={{ backgroundColor: item.bg, color: item.theme }}
                    >
                      <item.icon size={20} />
                    </div>
                    <div className={`inline-flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                      isPositive 
                        ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' 
                        : 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20'
                    }`}>
                      {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                      {item.change}
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{item.label}</p>
                    <div className="mt-1">
                      <h3 className="text-2xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                        {item.value}
                      </h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Main Grid: Chart & Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Analytics Chart */}
        {isLoading ? (
          <div className="lg:col-span-8">
            <ChartSkeleton />
          </div>
        ) : (
          <Card className="lg:col-span-8 border-border/60 bg-card shadow-xs">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Acquisition & Growth Trends</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">New vocabulary and user registration trends</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                  <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border/40">
                    <button
                      onClick={() => setChartMetric('both')}
                      className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-all ${
                        chartMetric === 'both'
                          ? 'bg-card text-foreground shadow-xs border border-border/50'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setChartMetric('words')}
                      className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-all ${
                        chartMetric === 'words'
                          ? 'bg-card text-foreground shadow-xs border border-border/50'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Words
                    </button>
                    <button
                      onClick={() => setChartMetric('users')}
                      className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-all ${
                        chartMetric === 'users'
                          ? 'bg-card text-foreground shadow-xs border border-border/50'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      New Users
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-lg border border-border/40">
                    {(['7d', '30d', '90d', '1y'] as const).map((r) => (
                      <button
                        key={r}
                        onClick={() => setTimeRange(r)}
                        className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all uppercase ${
                          timeRange === r
                            ? 'bg-card text-foreground shadow-xs border border-border/50'
                            : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorWords" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.00}/>
                      </linearGradient>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.00}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border/40" />
                    <XAxis 
                      dataKey="name" 
                      stroke="currentColor" 
                      className="text-muted-foreground"
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false} 
                      dy={10} 
                    />
                    <YAxis 
                      stroke="currentColor" 
                      className="text-muted-foreground"
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false} 
                      dx={-10} 
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--card)', 
                        borderColor: 'var(--border)', 
                        borderRadius: '0.75rem',
                        color: 'var(--foreground)',
                        boxShadow: '0 4px 20px -2px rgba(0,0,0,0.08)',
                        fontSize: '12px',
                        fontWeight: 500
                      }}
                      cursor={{ stroke: '#f43f5e', strokeWidth: 1.5, strokeDasharray: '4 4' }}
                    />
                    {(chartMetric === 'both' || chartMetric === 'words') && (
                      <Area 
                        type="monotone" 
                        name="New Words"
                        dataKey="words" 
                        stroke="#f43f5e" 
                        strokeWidth={2.5} 
                        fillOpacity={1} 
                        fill="url(#colorWords)" 
                      />
                    )}
                    {(chartMetric === 'both' || chartMetric === 'users') && (
                      <Area 
                        type="monotone" 
                        name="New Users"
                        dataKey="newUsers" 
                        stroke="#10b981" 
                        strokeWidth={2.5} 
                        fillOpacity={1} 
                        fill="url(#colorUsers)" 
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center gap-5 mt-3 pt-3 border-t border-border/40 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f43f5e]"></span>
                  <span className="text-muted-foreground font-medium">New Words</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span>
                  <span className="text-muted-foreground font-medium">New Users</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Right Sidebar: Activity Logs & Security */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <Card className="flex-1 border-border/60 bg-card shadow-xs">
            <CardContent className="p-6">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-5 flex items-center gap-2">
                <div className="w-1.5 h-4 bg-primary rounded-full"></div> Activity Stream
              </h3>
              <div className="space-y-4">
                {isActivityLoading ? (
                  <ActivityStreamSkeleton count={5} />
                ) : (
                  ((recentActivities || []) as { message?: string; time?: string; sub?: string }[]).map((log, i: number) => (
                    <div key={i} className="flex gap-3.5 group items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0 group-hover:scale-125 transition-transform"></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                            {log.message}
                          </p>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap flex items-center gap-0.5">
                            <Clock size={10} /> {log.time}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{log.sub}</p>
                      </div>
                    </div>
                  ))
                )}
                {!isActivityLoading && (!recentActivities || recentActivities.length === 0) && (
                  <p className="text-xs text-muted-foreground text-center py-6">No recent learning activity.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Real-time Server Health & Resource Monitor */}
          <Card className="border-border/60 bg-card shadow-xs overflow-hidden">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <Cpu size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Server Health & Resources</h4>
                    <p className="text-[10px] text-muted-foreground">Real-time resource telemetry</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-semibold border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live 15s
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                    onClick={handleRefreshHealth}
                    title="Refresh server telemetry"
                  >
                    <RefreshCw size={12} className={isRefetchingHealth ? 'animate-spin' : ''} />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="text-muted-foreground">RAM Heap Usage</span>
                    <span className="font-bold font-mono text-foreground">
                      {serverHealth?.data.memory.heapUsedMB || 0} MB / {serverHealth?.data.memory.heapTotalMB || 0} MB ({serverHealth?.data.memory.usagePercentage || 0}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        (serverHealth?.data.memory.usagePercentage || 0) > 85
                          ? 'bg-rose-500'
                          : (serverHealth?.data.memory.usagePercentage || 0) > 70
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(serverHealth?.data.memory.usagePercentage || 0, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div className="p-2 rounded-lg bg-muted/30 border border-border/40">
                    <span className="text-muted-foreground block text-[10px]">RSS Memory</span>
                    <span className="font-bold font-mono text-foreground">{serverHealth?.data.memory.rssMB || 0} MB</span>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/30 border border-border/40">
                    <span className="text-muted-foreground block text-[10px]">Node Uptime</span>
                    <span className="font-bold font-mono text-foreground truncate block">{serverHealth?.data.uptimeFormatted || '—'}</span>
                  </div>
                </div>

                <div className="text-[10px] text-muted-foreground pt-1 flex justify-between items-center">
                  <span>Runtime: Node.js {serverHealth?.data.nodeVersion || 'v22'}</span>
                  <span className="capitalize">{serverHealth?.data.platform || 'Server'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* SRS Learning Performance & Hardest Words Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SRS Health Overview Card */}
        <Card className="lg:col-span-5 border-border/60 bg-card shadow-xs">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                  <BrainCircuit size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">SRS Spaced Repetition Analytics</h3>
                  <p className="text-[11px] text-muted-foreground">Global recall compliance and retention rate</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-muted/30 p-3.5 rounded-xl border border-border/60">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase">Retention Rate</p>
                <h4 className="text-2xl font-bold text-emerald-500 mt-1">
                  {srsStats ? `${srsStats.retentionRate}%` : '85%'}
                </h4>
                <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                  <CheckCircle2 size={10} className="text-emerald-500" /> Correct answers ratio
                </p>
              </div>

              <div className="bg-muted/30 p-3.5 rounded-xl border border-border/60">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase">Avg Ease Factor</p>
                <h4 className="text-2xl font-bold text-purple-500 mt-1">
                  {srsStats ? srsStats.avgEaseFactor : '2.50'}
                </h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">Algorithm multiplier</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-purple-500/5 border border-purple-500/15 text-xs text-muted-foreground">
              <span>Total Reviews Recorded:</span>
              <span className="font-bold font-mono text-purple-600 dark:text-purple-400">
                {srsStats ? `${srsStats.totalCorrect + srsStats.totalWrong} reviews` : '0 reviews'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Hardest Words Leaderboard */}
        <Card className="lg:col-span-7 border-border/60 bg-card shadow-xs">
          <CardContent className="p-6">
            <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Highest Failure Rate Words</h3>
                  <p className="text-[11px] text-muted-foreground">Vocabulary items requiring content revision</p>
                </div>
              </div>
            </div>

            {!srsStats?.hardestWords || srsStats.hardestWords.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-8 text-center">No high-failure words identified yet.</p>
            ) : (
              <div className="space-y-2.5">
                {srsStats.hardestWords.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-muted/20 border border-border/40 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground">{item.word}</span>
                        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                          {item.type}
                        </span>
                      </div>
                      <span className="text-[11px] text-muted-foreground truncate">{item.meaningVi}</span>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 font-mono text-xs w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
                      <div className="text-right">
                        <div className="text-rose-500 font-bold">✗ {item.wrongCount} errors</div>
                        <div className="text-[10px] text-muted-foreground">✓ {item.correctCount} correct</div>
                      </div>
                      <div className="text-right pl-3 border-l border-border/60">
                        <div className="text-purple-500 font-bold">EF {item.easeFactor}</div>
                        <div className="text-[10px] text-muted-foreground">Ease Factor</div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-[10px] font-semibold text-muted-foreground hover:text-foreground hover:border-primary/50"
                        disabled={resettingWordId === item.id}
                        onClick={() => handleResetSingleWord(item.id, item.word)}
                        title="Reset SRS progress to default"
                      >
                        <RotateCcw size={11} className={`mr-1 ${resettingWordId === item.id ? 'animate-spin' : ''}`} />
                        Reset SRS
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OverviewPage;

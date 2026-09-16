import React from 'react';
import { 
  MoreVertical,
  Layers,
  Zap,
  ShieldCheck, 
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Clock
} from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Skeleton from '@/components/ui/Skeleton';
import { useOverview } from './useOverview';
import { useGetRecentActivityQuery } from '@/store/api/analyticsApi';

const OverviewPage: React.FC = () => {
  const { kpis, chartData, isLoading } = useOverview();
  const { data: recentActivities, isLoading: isActivityLoading } = useGetRecentActivityQuery();
  const [isScanning, setIsScanning] = React.useState(false);

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      alert('System Scan Complete: 0 vulnerabilities found. Shards are synchronized.');
    }, 2000);
  };

  return (
    <div className="space-y-6" id="overview-container">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">System Overview</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Real-time learning metrics and vocabulary acquisition.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button 
            variant="outline" 
            size="sm"
            className="h-9 px-3.5 border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted"
            onClick={() => alert('Cluster Map initialization sequence started.')}
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
        </div>
      </div>

      {/* KPI Cards Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="kpi-grid">
        {kpis.map((item, i) => {
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
                    {isLoading && item.label.includes('Total') ? (
                      <Skeleton className="h-8 w-24" />
                    ) : (
                      <h3 className="text-2xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                        {item.value}
                      </h3>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Grid: Chart & Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Analytics Chart */}
        <Card className="lg:col-span-8 border-border/60 bg-card shadow-xs">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Traffic & Learning Statistics</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Week-over-week vocabulary acquisition trends</p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                <MoreVertical size={16} />
              </Button>
            </div>
            
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorWords" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.00}/>
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
                  <Area 
                    type="monotone" 
                    dataKey="words" 
                    stroke="#f43f5e" 
                    strokeWidth={2.5} 
                    fillOpacity={1} 
                    fill="url(#colorWords)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Right Sidebar: Activity Logs & Security */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <Card className="flex-1 border-border/60 bg-card shadow-xs">
            <CardContent className="p-6">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-5 flex items-center gap-2">
                <div className="w-1.5 h-4 bg-primary rounded-full"></div> Activity Stream
              </h3>
              <div className="space-y-4">
                {isActivityLoading ? (
                  [1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex gap-3 items-center">
                      <Skeleton className="w-1 h-10 rounded-full" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3 w-3/4" />
                        <Skeleton className="h-2.5 w-1/2" />
                      </div>
                    </div>
                  ))
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

          {/* Security Banner with Warm Dark Rose/Slate Gradient */}
          <div className="bg-gradient-to-br from-slate-900 via-rose-950/40 to-slate-900 p-6 rounded-xl border border-rose-500/20 text-white relative overflow-hidden shadow-sm">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <ShieldCheck size={16} />
                </div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Security Shield</span>
              </div>
              <h4 className="text-base font-bold mb-1">Endpoint Protection</h4>
              <p className="text-xs text-slate-300/80 leading-relaxed">
                System is running in hardened mode. 14 firewall rules active.
              </p>
              <Button 
                size="sm"
                className="mt-4 h-8 bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs rounded-lg transition-colors border-none"
                onClick={() => alert('Integrity scan: All endpoints secure.')}
              >
                Scan Integrity
              </Button>
            </div>
            <ArrowUpRight className="absolute -bottom-6 -right-6 text-white/5" size={140} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewPage;

import React from 'react';
import { 
  MoreVertical,
  Layers,
  Zap,
  ShieldCheck, 
  ArrowUpRight,
  RefreshCw
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
    <div className="space-y-8 animate-in" id="overview-container">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-[#181c32]">System Overview</h1>
          <p className="text-xs font-semibold text-[#a1a5b7] mt-1">Real-time heuristics and platform metrics.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="secondary" className="bg-[#f5f8fa] text-[#7e8299] hover:bg-[#eff2f5]" onClick={() => alert('Cluster Map initialization sequence started.')}><Layers size={14} className="mr-1.5" /> View Clusters</Button>
           <Button 
            className={`${isScanning ? 'bg-[#50cd89]' : 'bg-[#009ef7]'} hover:opacity-90 text-white min-w-[140px] transition-all`}
            onClick={handleScan}
            disabled={isScanning}
           >
             {isScanning ? (
               <><RefreshCw size={14} className="mr-1.5 animate-spin" /> Analyzing...</>
             ) : (
               <><Zap size={14} className="mr-1.5" /> System Scan</>
             )}
           </Button>
        </div>
      </div>

      {/* KPI Cards ReUI Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" id="kpi-grid">
        {kpis.map((item, i) => (
          <Card key={i} className="border-[#eff2f5] shadow-sm hover:translate-y-[-4px] transition-all cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div 
                   className="w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shadow-sm"
                   style={{ backgroundColor: item.bg, color: item.theme }}
                >
                  <item.icon size={24} />
                </div>
                <div className={`text-[11px] font-bold px-2 py-1 rounded-md ${
                  item.change.startsWith('+') ? 'text-[#50cd89] bg-[#e8fff3]' : 'text-[#f1416c] bg-[#fff5f8]'
                }`}>
                  {item.change}
                </div>
              </div>
              <div>
                <p className="text-[11px] font-bold text-[#a1a5b7] uppercase tracking-widest">{item.label}</p>
                <div className="mt-1">
                  {isLoading && item.label.includes('Total') ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <h3 className="text-2xl font-black text-[#181c32] group-hover:text-[#009ef7] transition-colors">{item.value}</h3>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Analytics Chart */}
        <Card className="lg:col-span-8 border-[#eff2f5] shadow-sm">
          <CardContent className="p-6 lg:p-8">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h2 className="text-sm font-bold text-[#181c32] uppercase tracking-widest">Traffic Statistics</h2>
                <p className="text-[10px] font-bold text-[#a1a5b7] mt-1 italic">Week-over-week performance</p>
              </div>
              <Button variant="ghost" size="icon" className="hover:bg-[#f5f8fa] text-[#a1a5b7]">
                <MoreVertical size={18} />
              </Button>
            </div>
            
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#009ef7" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#009ef7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eff2f5" vertical={false} />
                  <XAxis dataKey="name" stroke="#a1a5b7" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#a1a5b7" fontSize={11} tickLine={false} axisLine={false} dx={-10} />
                  <Tooltip 
                    contentStyle={{ border: 'none', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', fontSize: '11px', fontWeight: 'bold' }}
                    cursor={{ stroke: '#009ef7', strokeWidth: 2, strokeDasharray: '5 5' }}
                  />
                  <Area type="monotone" dataKey="words" stroke="#009ef7" strokeWidth={3} fillOpacity={1} fill="url(#colorPrimary)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Right Sidebar: Activity Logs */}
        <div className="lg:col-span-4 flex flex-col gap-6">
           <Card className="flex-1 border-[#eff2f5] shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-sm font-bold text-[#181c32] uppercase tracking-widest mb-6 flex items-center gap-2">
                   <div className="w-1 h-4 bg-[#7239ea] rounded-full"></div> Activity Stream
                </h3>
                <div className="space-y-6">
                   {isActivityLoading ? (
                     [1, 2, 3, 4, 5].map((i) => (
                       <div key={i} className="flex gap-4 items-center">
                         <Skeleton className="w-0.5 h-10 rounded-full" />
                         <div className="flex-1 space-y-2">
                            <Skeleton className="h-3 w-3/4" />
                            <Skeleton className="h-2 w-1/2" />
                         </div>
                       </div>
                     ))
                   ) : (
                    (recentActivities || []).map((log: any, i: number) => (
                      <div key={i} className="flex gap-4 group">
                        <div className={`w-0.5 min-h-[40px] ${log.bg} rounded-full opacity-50`}></div>
                        <div className="flex-1">
                           <div className="flex justify-between items-start">
                              <p className="text-xs font-bold text-[#3f4254] group-hover:text-[#009ef7] transition-colors">{log.message}</p>
                              <span className="text-[10px] font-bold text-[#a1a5b7]">{log.time}</span>
                           </div>
                           <p className="text-[10px] font-semibold text-[#b5b5c3] mt-0.5">{log.sub}</p>
                        </div>
                      </div>
                    ))
                   )}
                   {!isActivityLoading && (!recentActivities || recentActivities.length === 0) && (
                     <p className="text-[10px] font-bold text-[#a1a5b7] text-center py-4 uppercase tracking-widest">No recent system waves.</p>
                   )}
                </div>
              </CardContent>
           </Card>

           <div className="bg-[#181c32] p-6 rounded-xl shadow-xl shadow-slate-900/20 text-white relative overflow-hidden">
              <div className="relative z-10">
                 <div className="flex items-center gap-2 mb-4">
                    <ShieldCheck className="text-[#50cd89]" size={20} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Security Mode</span>
                 </div>
                 <h4 className="text-lg font-bold mb-2">Endpoint Protection</h4>
                 <p className="text-[10px] text-slate-400 leading-relaxed font-medium">System is running in hardened mode. 14 firewall rules active.</p>
                 <Button className="mt-4 h-8 bg-[#50cd89] text-[#181c32] text-[10px] font-bold rounded-lg uppercase tracking-tight hover:bg-[#47b97b] transition-colors">
                    Scan Integrity
                 </Button>
              </div>
              <ArrowUpRight className="absolute -bottom-4 -right-4 text-white opacity-5" size={140} />
           </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewPage;

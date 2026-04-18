import React from 'react';
import { 
  Shield, 
  Globe, 
  Mail, 
  Save,
  RefreshCw,
  HardDrive,
  Cpu,
  Database,
  Lock,
  Zap,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetConfigQuery, useUpdateConfigMutation } from '@/store/api/configApi';

const SystemConfigPage: React.FC = () => {
  const { data: config, isLoading } = useGetConfigQuery();
  const [updateConfig] = useUpdateConfigMutation();

  const handleApply = async () => {
    try {
      await updateConfig({ timestamp: Date.now() }).unwrap();
      alert('System configuration updated safely.');
    } catch (err) {
      alert('Failed to update config.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[#009ef7]/20 border-t-[#009ef7] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-[#181c32]">System Configuration</h1>
          <p className="text-xs font-semibold text-[#a1a5b7] mt-1">Manage infrastructure, security layers, and data shards.</p>
        </div>
        <div className="flex gap-3">
           <Button variant="secondary" className="bg-[#f5f8fa] text-[#7e8299] hover:bg-[#eff2f5]"><RefreshCw size={14} className="mr-1.5" /> Reset Default</Button>
           <Button className="bg-[#50cd89] text-white hover:bg-[#47b97b]" onClick={handleApply}><Save size={14} className="mr-1.5" /> Apply Changes</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: General & Security */}
        <div className="lg:col-span-2 space-y-8">
           {/* API Infrastructure */}
           <Card className="border-[#eff2f5] shadow-sm">
              <div className="p-6 border-b border-[#eff2f5] flex items-center justify-between bg-[#f9fafb]/50 rounded-t-[inherit]">
                 <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#f1faff] text-[#009ef7] rounded-xl flex items-center justify-center border border-[#d1edff]">
                       <Globe size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#181c32]">API Infrastructure</h3>
                      <p className="text-[10px] font-bold text-[#a1a5b7] uppercase tracking-widest">{config?.infrastructure?.environment.toUpperCase()}_CORE</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-2 px-3 py-1 bg-[#e8fff3] text-[#50cd89] rounded-full text-[10px] font-black uppercase tracking-widest border border-[#c1f5d8]">
                    <Zap size={10} className="fill-[#50cd89]" /> Operational
                 </div>
              </div>
              <CardContent className="p-8 space-y-6">
                 <div>
                    <label className="text-[10px] font-black text-[#a1a5b7] uppercase tracking-widest mb-2 block">Base Protocol Endpoint</label>
                    <div className="relative group">
                       <Input 
                        type="text" 
                        defaultValue={config?.infrastructure?.baseUrl}
                        className="bg-[#f5f8fa] border-none rounded-lg py-5 px-4 text-xs font-bold text-[#3f4254] focus-visible:ring-2 focus-visible:ring-[#009ef7] transition-all"
                       />
                       <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                          <CheckCircle className="text-[#50cd89]" size={14} />
                       </div>
                    </div>
                 </div>
                 <div className="flex items-center justify-between p-5 bg-[#fcfcfd] rounded-2xl border border-[#eff2f5] border-dashed">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-white border border-[#eff2f5] rounded-xl flex items-center justify-center text-[#7e8299] shadow-sm">
                          <Cpu size={18} />
                       </div>
                       <div>
                          <h4 className="text-xs font-bold text-[#181c32]">Gzip Compression Mode</h4>
                          <p className="text-[10px] text-[#a1a5b7] font-medium mt-0.5">Highly recommended for data throughput optimization.</p>
                       </div>
                    </div>
                    <div className={`w-12 h-6 rounded-full relative shadow-inner cursor-pointer ${config?.infrastructure?.gzip ? 'bg-[#009ef7]' : 'bg-[#eff2f5]'}`}>
                       <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all ${config?.infrastructure?.gzip ? 'right-0.5' : 'left-0.5'}`}></div>
                    </div>
                 </div>
              </CardContent>
           </Card>

           {/* Security Layers */}
           <Card className="border-[#eff2f5] shadow-sm">
              <div className="p-6 border-b border-[#eff2f5] bg-[#f9fafb]/50 rounded-t-[inherit]">
                 <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#f8f5ff] text-[#7239ea] rounded-xl flex items-center justify-center border border-[#e8dffc]">
                       <Shield size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#181c32]">Security & Authentication</h3>
                      <p className="text-[10px] font-bold text-[#a1a5b7] uppercase tracking-widest">Vault_Access</p>
                    </div>
                 </div>
              </div>
              <CardContent className="p-8 space-y-8">
                 <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <label className="text-[10px] font-black text-[#a1a5b7] uppercase tracking-widest mb-2 block">Primary JWT Secret</label>
                        <div className="relative">
                           <Input type="password" defaultValue="••••••••••••••••" className="bg-[#f5f8fa] border-none rounded-lg py-5 px-4 text-xs font-bold focus-visible:ring-2 focus-visible:ring-[#009ef7]" />
                           <button className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-[#009ef7] uppercase hover:underline">Rotate</button>
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-[#a1a5b7] uppercase tracking-widest mb-2 block">Rate Limit Threshold</label>
                        <div className="relative">
                           <Input type="number" defaultValue={config?.security?.rateLimit} className="bg-[#f5f8fa] border-none rounded-lg py-5 px-4 text-xs font-bold text-[#3f4254] focus-visible:ring-2 focus-visible:ring-[#009ef7]" />
                           <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#a1a5b7]">REQ/S</span>
                        </div>
                    </div>
                 </div>
                 <div className="flex items-center justify-between p-5 bg-[#fcfcfd] rounded-2xl border border-[#eff2f5] border-dashed">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-white border border-[#eff2f5] rounded-xl flex items-center justify-center text-[#009ef7] shadow-sm">
                          <Lock size={18} />
                       </div>
                       <div>
                          <h4 className="text-xs font-bold text-[#181c32]">Whitelisted CORS Origins</h4>
                          <p className="text-[10px] text-[#a1a5b7] font-bold mt-0.5 italic">{config?.security?.cors.join(', ')}</p>
                       </div>
                    </div>
                    <div className="w-12 h-6 bg-[#009ef7] rounded-full relative shadow-inner cursor-pointer">
                       <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-md"></div>
                    </div>
                 </div>
              </CardContent>
           </Card>
        </div>

        {/* Right Side: Services & Storage */}
        <div className="space-y-8">
           <Card className="border-[#eff2f5] shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-8 h-8 bg-[#f5f8fa] rounded-lg flex items-center justify-center text-[#7e8299]">
                    <Database size={16} />
                 </div>
                 <h3 className="text-[10px] font-black uppercase text-[#181c32] tracking-[0.2em] leading-none">Database_Mount</h3>
              </div>
              <div className="space-y-4">
                 <div className="flex items-center justify-between p-4 bg-[#f5f8fa] rounded-xl border border-[#eff2f5]">
                    <span className="text-[10px] font-black text-[#a1a5b7] uppercase">Status</span>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${config?.database?.status === 'Operational' ? 'bg-[#e8fff3] text-[#50cd89]' : 'bg-[#fff5f8] text-[#f1416c]'}`}>
                      {config?.database?.status}
                    </span>
                 </div>
                 <div className="flex items-center justify-between p-4 bg-[#f5f8fa] rounded-xl border border-[#eff2f5]">
                    <span className="text-[10px] font-black text-[#a1a5b7] uppercase">Active Shards</span>
                    <span className="text-sm font-bold text-[#181c32]">{config?.database?.shards}</span>
                 </div>
                 <div className="flex items-center justify-between p-4 bg-[#f5f8fa] rounded-xl border border-[#eff2f5]">
                    <span className="text-[10px] font-black text-[#a1a5b7] uppercase">Live Connections</span>
                    <span className="text-sm font-black text-[#009ef7] font-mono">{config?.database?.activeConnections.toString().padStart(2, '0')}</span>
                 </div>
              </div>
           </Card>

           <Card className="bg-[#181c32] border-none shadow-xl shadow-slate-900/20 p-8 text-white relative overflow-hidden">
              <div className="relative z-10">
                 <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Build_Info</h4>
                 <p className="text-2xl font-black italic tracking-tighter mb-4">LEXINOTE_ALPHA</p>
                 <div className="flex items-center gap-2 text-[10px] font-bold text-[#50cd89] uppercase tracking-widest">
                    <Zap size={12} className="fill-[#50cd89]" /> Version {config?.infrastructure?.version}
                 </div>
              </div>
              <Shield className="absolute -bottom-6 -right-6 text-white opacity-5" size={120} />
           </Card>
        </div>
      </div>
    </div>
  );
};

export default SystemConfigPage;

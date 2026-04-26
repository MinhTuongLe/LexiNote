import React, { useState, useEffect } from 'react';
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

  const [rateLimit, setRateLimit] = useState(100);
  const [corsEnabled, setCorsEnabled] = useState(true);
  const [autoBackup, setAutoBackup] = useState(true);
  const [debugMode, setDebugMode] = useState(false);

  useEffect(() => {
    if (config) {
      setRateLimit(config.security?.rateLimit || 100);
    }
  }, [config]);

  const handleReset = () => {
    if (confirm('Revert all infrastructure parameters to factory defaults?')) {
      setRateLimit(100);
      setCorsEnabled(true);
      setAutoBackup(true);
      setDebugMode(false);
    }
  };

  const handleApply = async () => {
    try {
      await updateConfig({ 
          rateLimit,
          corsEnabled,
          autoBackup,
          debugMode,
          timestamp: Date.now() 
      }).unwrap();
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
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-[#eff2f5] shadow-sm">
        <div className="flex items-center gap-5">
           <div className="w-12 h-12 bg-[#f1faff] text-[#009ef7] rounded-2xl flex items-center justify-center shadow-inner">
              <Cpu size={24} />
           </div>
           <div>
              <h1 className="text-xl font-bold text-[#181c32]">Core Infrastructure</h1>
              <p className="text-xs font-semibold text-[#a1a5b7] mt-0.5">Runtime: {config?.environment?.platform} v{config?.environment?.version} • Status: Stable</p>
           </div>
        </div>
        <div className="flex gap-3">
           <Button variant="secondary" className="bg-[#f5f8fa] text-[#7e8299] hover:bg-[#eff2f5]" onClick={handleReset}><RefreshCw size={14} className="mr-1.5" /> Reset Default</Button>
           <Button className="bg-[#50cd89] text-white hover:bg-[#47b97b]" onClick={handleApply}><Save size={14} className="mr-1.5" /> Apply Changes</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            <Card className="border-[#eff2f5] shadow-sm">
               <div className="p-6 border-b border-[#eff2f5] bg-[#f9fafb]/50 rounded-t-[inherit]">
                  <div className="flex items-center gap-3">
                     <div className="w-9 h-9 bg-[#f1faff] text-[#009ef7] rounded-xl flex items-center justify-center border border-[#d1edff]">
                        <Globe size={18} />
                     </div>
                     <div>
                       <h3 className="text-sm font-bold text-[#181c32]">Network & Shard Topology</h3>
                       <p className="text-[10px] font-bold text-[#a1a5b7] uppercase tracking-widest">Protocol-Level Parameters</p>
                     </div>
                  </div>
               </div>
               <CardContent className="p-8">
                  <div className="grid md:grid-cols-2 gap-8">
                     <div>
                         <label className="text-[10px] font-black text-[#a1a5b7] uppercase tracking-widest mb-2 block">CORS Origin Matrix</label>
                         <Input defaultValue={config?.security?.cors.join(', ')} className="bg-[#f5f8fa] border-none rounded-lg py-5 px-4 text-xs font-bold text-[#3f4254] focus-visible:ring-2 focus-visible:ring-[#009ef7]" />
                     </div>
                     <div>
                         <label className="text-[10px] font-black text-[#a1a5b7] uppercase tracking-widest mb-2 block">Environment Handle</label>
                         <Input defaultValue="development-node-01" disabled className="bg-[#f5f8fa]/50 border-none rounded-lg py-5 px-4 text-xs font-bold text-[#a1a5b7] cursor-not-allowed" />
                     </div>
                  </div>
               </CardContent>
            </Card>

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
                            <Input type="password" value="••••••••••••••••" readOnly className="bg-[#f5f8fa] border-none rounded-lg py-5 px-4 text-xs font-bold focus-visible:ring-2 focus-visible:ring-[#009ef7]" />
                            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-[#009ef7] uppercase hover:underline">Rotate</button>
                         </div>
                     </div>
                     <div>
                         <label className="text-[10px] font-black text-[#a1a5b7] uppercase tracking-widest mb-2 block">Rate Limit Threshold</label>
                         <div className="relative">
                            <Input 
                                type="number" 
                                value={rateLimit}
                                onChange={(e) => setRateLimit(parseInt(e.target.value) || 0)}
                                className="bg-[#f5f8fa] border-none rounded-lg py-5 px-4 text-xs font-bold text-[#3f4254] focus-visible:ring-2 focus-visible:ring-[#009ef7]" 
                            />
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
                     <div 
                        onClick={() => setCorsEnabled(!corsEnabled)}
                        className={`w-12 h-6 rounded-full relative shadow-inner cursor-pointer transition-colors ${corsEnabled ? 'bg-[#009ef7]' : 'bg-[#eff2f5]'}`}
                     >
                        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${corsEnabled ? 'right-0.5' : 'left-0.5'}`}></div>
                     </div>
                  </div>
               </CardContent>
            </Card>
        </div>

        <div className="space-y-8">
           <Card className="border-[#eff2f5] shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-8 h-8 bg-[#f5f8fa] rounded-lg flex items-center justify-center text-[#7e8299]">
                    <Database size={16} />
                 </div>
                 <h3 className="text-[10px] font-black uppercase text-[#181c32] tracking-[0.2em] leading-none">Database_Mount</h3>
              </div>
              
              <div className="space-y-6">
                 <div>
                    <div className="flex items-center justify-between mb-2">
                       <span className="text-[10px] font-bold text-[#7e8299] uppercase">Cluster Occupancy</span>
                       <span className="text-xs font-black text-[#181c32]">84%</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#f1faff] rounded-full overflow-hidden">
                       <div className="h-full w-[84%] bg-gradient-to-r from-[#009ef7] to-[#7239ea]"></div>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="flex items-center justify-between">
                       <div>
                          <p className="text-xs font-bold text-[#3f4254]">Auto Backup Shard</p>
                          <p className="text-[10px] font-bold text-[#a1a5b7]">Every 24.00 UTC</p>
                       </div>
                       <div 
                        onClick={() => setAutoBackup(!autoBackup)}
                        className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${autoBackup ? 'bg-[#50cd89]' : 'bg-[#eff2f5]'}`}
                       >
                          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${autoBackup ? 'right-0.5' : 'left-0.5'}`}></div>
                       </div>
                    </div>
                    <div className="flex items-center justify-between">
                       <div>
                          <p className="text-xs font-bold text-[#3f4254]">Debug Verbosity</p>
                          <p className="text-[10px] font-bold text-[#a1a5b7]">Verbose terminal output</p>
                       </div>
                       <div 
                        onClick={() => setDebugMode(!debugMode)}
                        className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${debugMode ? 'bg-[#f1416c]' : 'bg-[#eff2f5]'}`}
                       >
                          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${debugMode ? 'right-0.5' : 'left-0.5'}`}></div>
                       </div>
                    </div>
                 </div>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
};

export default SystemConfigPage;

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

const SystemConfigPage: React.FC = () => {
  return (
    <div className="space-y-8 animate-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-[#181c32]">System Configuration</h1>
          <p className="text-xs font-semibold text-[#a1a5b7] mt-1">Manage infrastructure, security layers, and data shards.</p>
        </div>
        <div className="flex gap-3">
           <Button variant="secondary" className="bg-[#f5f8fa] text-[#7e8299] hover:bg-[#eff2f5]"><RefreshCw size={14} className="mr-1.5" /> Reset Default</Button>
           <Button className="bg-[#50cd89] text-white hover:bg-[#47b97b]"><Save size={14} className="mr-1.5" /> Apply Changes</Button>
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
                      <p className="text-[10px] font-bold text-[#a1a5b7] uppercase tracking-widest">Network_Core</p>
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
                        defaultValue="https://api.lexinote.com/v1"
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
                    <div className="w-12 h-6 bg-[#009ef7] rounded-full relative shadow-inner cursor-pointer">
                       <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-md"></div>
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
                           <Input type="number" defaultValue="1000" className="bg-[#f5f8fa] border-none rounded-lg py-5 px-4 text-xs font-bold text-[#3f4254] focus-visible:ring-2 focus-visible:ring-[#009ef7]" />
                           <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#a1a5b7]">REQ/S</span>
                        </div>
                    </div>
                 </div>
                 <div className="flex items-center justify-between p-5 bg-[#fff5f8] rounded-2xl border border-[#feeff2] border-dashed">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-white border border-[#feeff2] rounded-xl flex items-center justify-center text-[#f1416c] shadow-sm">
                          <Lock size={18} />
                       </div>
                       <div>
                          <h4 className="text-xs font-bold text-[#181c32]">Strict CORS Origin Header</h4>
                          <p className="text-[10px] text-[#f1416c] font-bold mt-0.5 italic">Disabled - System is vulnerable to CSRF attacks.</p>
                       </div>
                    </div>
                    <div className="w-12 h-6 bg-[#eff2f5] rounded-full relative shadow-inner cursor-pointer group">
                       <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-md group-hover:translate-x-1 transition-transform"></div>
                    </div>
                 </div>
              </CardContent>
           </Card>
        </div>

        {/* Right Side: Services & Storage */}
        <div className="space-y-8">
           {/* Email Service */}
           <Card className="border-[#eff2f5] shadow-sm">
              <div className="p-6 border-b border-[#eff2f5] bg-[#f9fafb]/50 rounded-t-[inherit]">
                 <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#fff8dd] text-[#ffc700] rounded-xl flex items-center justify-center border border-[#fff2c1]">
                       <Mail size={18} />
                    </div>
                    <div className="flex flex-col">
                      <h3 className="text-sm font-bold text-[#181c32]">SMTP Gateways</h3>
                      <p className="text-[10px] font-bold text-[#a1a5b7] uppercase tracking-widest">Mail_Channel</p>
                    </div>
                 </div>
              </div>
              <CardContent className="p-6 space-y-4">
                 <Input type="text" placeholder="SMTP Host" defaultValue="smtp.lexinote.ui" className="bg-[#f5f8fa] border-none rounded-lg h-10 px-3 text-xs font-bold focus-visible:ring-2 focus-visible:ring-[#009ef7]" />
                 <Input type="text" placeholder="Access ID" defaultValue="mail_relay_01" className="bg-[#f5f8fa] border-none rounded-lg h-10 px-3 text-xs font-bold focus-visible:ring-2 focus-visible:ring-[#009ef7]" />
                 <Button variant="outline" className="w-full border-2 border-[#eff2f5] text-[10px] font-black text-[#a1a5b7] uppercase rounded-lg hover:border-[#009ef7]/20 hover:text-[#009ef7] hover:bg-transparent transition-all">Test Connectivity</Button>
              </CardContent>
           </Card>

           {/* Resource Usage */}
           <Card className="border-[#eff2f5] shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-8 h-8 bg-[#f5f8fa] rounded-lg flex items-center justify-center text-[#7e8299]">
                    <Database size={16} />
                 </div>
                 <h3 className="text-[10px] font-black uppercase text-[#181c32] tracking-[0.2em] leading-none">Resource_Mount</h3>
              </div>
              <div className="space-y-4">
                 <div>
                    <div className="flex justify-between items-end mb-2 text-[9px] font-bold uppercase tracking-widest text-[#a1a5b7]">
                       <span>Volume Usage</span>
                       <span className="text-[#3f4254]">76.2 GB / 256 GB</span>
                    </div>
                    <div className="w-full h-3 bg-[#f5f8fa] rounded-full overflow-hidden border border-[#eff2f5]">
                       <div className="h-full bg-gradient-to-r from-[#009ef7] to-[#7239ea] w-[30%] shadow-[0_0_10px_rgba(0,158,247,0.4)]"></div>
                    </div>
                 </div>
                 <div className="flex gap-2.5">
                    <Button variant="secondary" className="flex-1 h-9 bg-[#f5f8fa] hover:bg-[#eff2f5] text-slate-500 hover:text-[#009ef7]"><Cpu size={14} /></Button>
                    <Button variant="secondary" className="flex-1 h-9 bg-[#f5f8fa] hover:bg-[#eff2f5] text-slate-500 hover:text-[#f1416c]"><HardDrive size={14} /></Button>
                 </div>
              </div>
              <div className="mt-8 pt-6 border-t border-[#eff2f5] flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <XCircle className="text-[#f1416c]" size={14} />
                    <span className="text-[10px] font-bold text-[#b5b5c3] uppercase tracking-widest leading-none">Shards Offline</span>
                 </div>
                 <span className="text-xl font-bold text-[#f1416c] font-mono leading-none">03</span>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
};

export default SystemConfigPage;

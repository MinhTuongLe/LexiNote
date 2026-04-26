import React, { useState } from 'react';
import { 
  Globe,
  Languages
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const SettingsPage: React.FC = () => {
  const [lang, setLang] = useState('VN');
  const [toggles, setToggles] = useState({
    density: true,
    sync: true,
    acceleration: false
  });

  const handleToggle = (key: keyof typeof toggles) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    localStorage.setItem('lexi_settings', JSON.stringify({ lang, toggles }));
    alert('Environment settings synchronized with local storage.');
  };

  return (
    <div className="space-y-8 animate-in">
      <div>
        <h1 className="text-xl font-bold text-[#181c32]">Environment Settings</h1>
        <p className="text-xs font-semibold text-[#a1a5b7] mt-1">Customize your local node and UX variables.</p>
      </div>

      <div className="max-w-2xl space-y-6">
        <Card className="border-[#eff2f5] shadow-sm">
          <div className="p-6 border-b border-[#eff2f5] flex items-center justify-between bg-[#f9fafb]/50 rounded-t-[inherit]">
             <div className="flex items-center gap-3">
                <Languages className="text-[#009ef7]" size={20} />
                <h3 className="text-xs font-black text-[#181c32] uppercase tracking-[0.2em]">Localization Protocol</h3>
             </div>
          </div>
          <CardContent className="p-8">
             <div className="flex gap-3">
                 <Button 
                  variant="outline" 
                  onClick={() => setLang('VN')}
                  className={`flex-1 py-6 border-2 rounded-xl transition-all text-xs font-black uppercase tracking-widest ${
                    lang === 'VN' 
                    ? 'border-[#009ef7] bg-[#f1faff] text-[#009ef7]' 
                    : 'border-[#eff2f5] bg-white text-[#a1a5b7] hover:border-[#009ef7]/20 hover:text-[#009ef7]'
                  }`}
                 >
                   Vietnam [VN]
                 </Button>
                 <Button 
                  variant="outline" 
                  onClick={() => setLang('EN')}
                  className={`flex-1 py-6 border-2 rounded-xl transition-all text-xs font-black uppercase tracking-widest ${
                    lang === 'EN' 
                    ? 'border-[#009ef7] bg-[#f1faff] text-[#009ef7]' 
                    : 'border-[#eff2f5] bg-white text-[#a1a5b7] hover:border-[#009ef7]/20 hover:text-[#009ef7]'
                  }`}
                 >
                   English [EN]
                 </Button>
             </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-[#eff2f5] shadow-sm">
          <div className="p-6 border-b border-[#eff2f5] flex items-center gap-3 bg-[#f9fafb]/50 rounded-t-[inherit]">
             <Globe className="text-[#7239ea]" size={20} />
             <h3 className="text-xs font-black text-[#181c32] uppercase tracking-[0.2em]">Interface Dynamics</h3>
          </div>
          <CardContent className="p-8 space-y-8">
            {[
              { id: 'density', label: 'Data Density Output', desc: 'Maximize information points per screen.' },
              { id: 'sync', label: 'Real-time Shard Sync', desc: 'Automatically poll for backend data changes.' },
              { id: 'acceleration', label: 'Hardware Acceleration', desc: 'Use GPU for complex graph rendering.' },
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between group">
                <div>
                  <span className="text-xs font-bold text-[#3f4254] block group-hover:text-[#009ef7] transition-colors">{item.label}</span>
                  <p className="text-[10px] font-bold text-[#a1a5b7] mt-0.5">{item.desc}</p>
                </div>
                <div 
                  onClick={() => handleToggle(item.id as any)}
                  className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${toggles[item.id as keyof typeof toggles] ? 'bg-[#009ef7]' : 'bg-[#eff2f5]'}`}
                >
                   <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${toggles[item.id as keyof typeof toggles] ? 'right-0.5' : 'left-0.5'}`}></div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        
        <div className="flex justify-end gap-3 mt-8">
           <Button variant="secondary" className="px-6 bg-[#f5f8fa] text-[#7e8299] hover:bg-[#eff2f5]">Discard</Button>
           <Button className="px-6 bg-[#009ef7] text-white hover:bg-[#0086d1]" onClick={handleSave}>Save Environment</Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

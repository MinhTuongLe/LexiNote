import React, { useState } from 'react';
import { 
  Globe,
  Languages
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from '@/components/ui/Toast';

const SettingsPage: React.FC = () => {
  const { toast } = useToast();
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
    toast.success('Settings Synchronized', 'Environment settings synchronized with local storage.');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Environment Settings</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Customize your local client and interface variables.</p>
      </div>

      <div className="max-w-2xl space-y-6">
        <Card className="border-border/60 bg-card shadow-xs overflow-hidden">
          <div className="p-4 border-b border-border/60 flex items-center justify-between bg-muted/20">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                <Languages size={17} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Localization</h3>
                <p className="text-[11px] text-muted-foreground">Select system interface language</p>
              </div>
            </div>
          </div>
          <CardContent className="p-6">
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setLang('VN')}
                className={`flex-1 h-12 rounded-xl transition-all text-xs font-semibold ${
                  lang === 'VN' 
                    ? 'border-primary bg-primary/10 text-primary shadow-2xs' 
                    : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                Tiếng Việt (VN)
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setLang('EN')}
                className={`flex-1 h-12 rounded-xl transition-all text-xs font-semibold ${
                  lang === 'EN' 
                    ? 'border-primary bg-primary/10 text-primary shadow-2xs' 
                    : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                English (EN)
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card shadow-xs overflow-hidden">
          <div className="p-4 border-b border-border/60 flex items-center gap-2.5 bg-muted/20">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center border border-violet-500/20">
              <Globe size={17} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Interface Dynamics</h3>
              <p className="text-[11px] text-muted-foreground">Display density and client performance</p>
            </div>
          </div>
          <CardContent className="p-6 space-y-5">
            {[
              { id: 'density', label: 'High Density Layout', desc: 'Display more data points per screen table.' },
              { id: 'sync', label: 'Real-time Live Sync', desc: 'Automatically poll for server updates.' },
              { id: 'acceleration', label: 'GPU Acceleration', desc: 'Hardware rendering for chart animations.' },
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between group">
                <div>
                  <span className="text-xs font-semibold text-foreground block group-hover:text-primary transition-colors">
                    {item.label}
                  </span>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
                <button 
                  onClick={() => handleToggle(item.id as keyof typeof toggles)}
                  className={`w-10 h-6 rounded-full relative p-0.5 transition-colors ${
                    toggles[item.id as keyof typeof toggles] ? 'bg-primary' : 'bg-muted-foreground/30'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-xs transition-transform ${
                    toggles[item.id as keyof typeof toggles] ? 'translate-x-4' : 'translate-x-0'
                  }`}></div>
                </button>
              </div>
            ))}
          </CardContent>
        </Card>
        
        <div className="flex justify-end gap-2.5 pt-2">
          <Button variant="outline" size="sm" className="px-5 text-muted-foreground hover:text-foreground">
            Discard
          </Button>
          <Button size="sm" className="px-5 font-medium shadow-xs" onClick={handleSave}>
            Save Environment
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

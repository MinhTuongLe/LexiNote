import React, { useState } from 'react';
import { 
  Shield, 
  Globe, 
  Save,
  RefreshCw,
  Cpu,
  Database,
  Lock
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetConfigQuery, useUpdateConfigMutation } from '@/store/api/configApi';
import { useToast } from '@/components/ui/Toast';
import ConfirmModal from '@/components/ui/ConfirmModal';

const SystemConfigPage: React.FC = () => {
  const { toast } = useToast();
  const { data: config, isLoading } = useGetConfigQuery();
  const [updateConfig] = useUpdateConfigMutation();

  const [rateLimit, setRateLimit] = useState(100);
  const [corsEnabled, setCorsEnabled] = useState(true);
  const [autoBackup, setAutoBackup] = useState(true);
  const [debugMode, setDebugMode] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const confirmReset = () => {
    setRateLimit(100);
    setCorsEnabled(true);
    setAutoBackup(true);
    setDebugMode(false);
    toast.info('Parameters Reverted', 'Infrastructure parameters reverted to factory defaults.');
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
      toast.success('Config Saved', 'System configuration updated safely.');
    } catch {
      toast.error('Update Failed', 'Failed to update system config.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-5 rounded-xl border border-border/60 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 bg-primary/10 text-primary border border-primary/20 rounded-xl flex items-center justify-center shrink-0">
            <Cpu size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Core Infrastructure</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Runtime: {config?.environment?.platform || 'Node.js'} v{config?.environment?.version || '22'} • Status: Operational
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <Button 
            variant="outline" 
            size="sm"
            className="h-9 border-border/80 text-muted-foreground hover:text-foreground"
            onClick={() => setIsResetModalOpen(true)}
          >
            <RefreshCw size={14} className="mr-1.5" /> Reset Default
          </Button>
          <Button 
            size="sm"
            className="h-9 font-medium shadow-xs" 
            onClick={handleApply}
          >
            <Save size={14} className="mr-1.5" /> Apply Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/60 bg-card shadow-xs overflow-hidden">
            <div className="p-5 border-b border-border/60 bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center border border-primary/20">
                  <Globe size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Network & API Topology</h3>
                  <p className="text-[11px] text-muted-foreground">Protocol-Level Network Parameters</p>
                </div>
              </div>
            </div>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">CORS Origin Matrix</label>
                  <Input 
                    defaultValue={config?.security?.cors?.join(', ')} 
                    className="bg-muted/40 border-border/80 text-xs font-medium text-foreground focus-visible:ring-1 focus-visible:ring-primary" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Environment Profile</label>
                  <Input 
                    defaultValue="production-main-01" 
                    disabled 
                    className="bg-muted/30 border-border/60 text-xs font-medium text-muted-foreground cursor-not-allowed" 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card shadow-xs overflow-hidden">
            <div className="p-5 border-b border-border/60 bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-lg flex items-center justify-center border border-violet-500/20">
                  <Shield size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Security & Vault Controls</h3>
                  <p className="text-[11px] text-muted-foreground">Authentication tokens and request throttling</p>
                </div>
              </div>
            </div>
            <CardContent className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Primary JWT Secret</label>
                  <div className="relative">
                    <Input 
                      type="password" 
                      value="••••••••••••••••••••" 
                      readOnly 
                      className="bg-muted/40 border-border/80 text-xs font-medium focus-visible:ring-1 focus-visible:ring-primary pr-16" 
                    />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-primary hover:underline">
                      Rotate
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rate Limit Ceiling</label>
                  <div className="relative">
                    <Input 
                      type="number" 
                      value={rateLimit}
                      onChange={(e) => setRateLimit(parseInt(e.target.value) || 0)}
                      className="bg-muted/40 border-border/80 text-xs font-medium text-foreground focus-visible:ring-1 focus-visible:ring-primary pr-14" 
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-muted-foreground font-mono">
                      REQ/S
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/80 border-dashed">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-card border border-border rounded-lg flex items-center justify-center text-primary shadow-xs">
                    <Lock size={15} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Whitelisted CORS Enforcement</h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{config?.security?.cors?.join(', ')}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setCorsEnabled(!corsEnabled)}
                  className={`w-11 h-6 rounded-full relative p-0.5 transition-colors ${corsEnabled ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-xs transition-transform ${corsEnabled ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border/60 bg-card shadow-xs p-5">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-7 h-7 bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                <Database size={15} />
              </div>
              <h3 className="text-xs font-bold uppercase text-foreground tracking-wider">Database Metrics</h3>
            </div>
            
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-muted-foreground">Cluster Storage</span>
                  <span className="text-xs font-bold text-foreground font-mono">84%</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full w-[84%] bg-primary rounded-full"></div>
                </div>
              </div>

              <div className="space-y-3.5 pt-3 border-t border-border/60">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-foreground">Automated Daily Backup</p>
                    <p className="text-[11px] text-muted-foreground">Every 00:00 UTC</p>
                  </div>
                  <button 
                    onClick={() => setAutoBackup(!autoBackup)}
                    className={`w-9 h-5 rounded-full relative p-0.5 transition-colors ${autoBackup ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full shadow-xs transition-transform ${autoBackup ? 'translate-x-4' : 'translate-x-0'}`}></div>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-foreground">Debug Verbosity</p>
                    <p className="text-[11px] text-muted-foreground">Detailed runtime logs</p>
                  </div>
                  <button 
                    onClick={() => setDebugMode(!debugMode)}
                    className={`w-9 h-5 rounded-full relative p-0.5 transition-colors ${debugMode ? 'bg-rose-500' : 'bg-muted-foreground/30'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full shadow-xs transition-transform ${debugMode ? 'translate-x-4' : 'translate-x-0'}`}></div>
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <ConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={confirmReset}
        title="Reset System Configuration"
        description="Are you sure you want to revert all infrastructure parameters to factory default values?"
        confirmText="Reset Defaults"
        variant="warning"
      />
    </div>
  );
};

export default SystemConfigPage;

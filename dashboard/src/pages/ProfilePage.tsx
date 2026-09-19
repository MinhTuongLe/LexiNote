import React from 'react';
import { 
  ShieldCheck, 
  Key, 
  Mail, 
  BadgeCheck
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { useToast } from '@/components/ui/Toast';

const ProfilePage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { toast } = useToast();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Account Details</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Manage your administrative identity and credentials.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="border-border/60 bg-card shadow-xs flex flex-col items-center">
          <CardContent className="p-8 flex flex-col items-center w-full">
            <div className="relative group">
              {user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.fullName || 'Administrator'} 
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-primary/30 shadow-sm transition-transform group-hover:scale-105" 
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-primary/10 text-primary border-2 border-primary/30 flex items-center justify-center text-2xl font-bold shadow-sm transition-transform group-hover:scale-105">
                  {user?.fullName?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'AD'}
                </div>
              )}
              {Boolean(user?.isActive) && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-2 border-card rounded-full flex items-center justify-center shadow-xs">
                  <BadgeCheck size={14} className="text-white" />
                </div>
              )}
            </div>
            <div className="mt-5 text-center">
              <h2 className="text-base font-bold text-foreground">{user?.fullName || 'Administrator'}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
            </div>
            <div className="mt-4 flex gap-1.5">
              <span className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-semibold px-2.5 py-1 rounded-md uppercase tracking-wider">
                {String(user?.role || 'Admin')}
              </span>
              {Boolean(user?.isEmailVerified) && (
                <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold px-2.5 py-1 rounded-md uppercase tracking-wider">
                  Verified
                </span>
              )}
            </div>
            
            <div className="w-full mt-6">
              <Button 
                size="sm"
                className="w-full font-medium shadow-xs"
                onClick={() => toast.info('Feature Coming Soon', `Profile update for ${user?.fullName} will be available in future releases.`)}
              >
                Edit Identity
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Metadata & Stats */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/60 bg-card shadow-xs overflow-hidden">
            <div className="p-4 border-b border-border/60 bg-muted/20">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider border-l-2 border-primary pl-2.5">
                Account Attributes
              </h3>
            </div>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: 'Primary Email', value: user?.email, icon: Mail, color: 'text-primary' },
                { label: 'Role Context', value: user?.role === 'ADMIN' ? 'Root Administrator' : 'Standard Member', icon: ShieldCheck, color: 'text-violet-500' },
                { label: 'Account Identifier', value: `UID-${user?.id || '001'}`, icon: Key, color: 'text-amber-500' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3.5 group">
                  <div className="w-9 h-9 rounded-lg bg-muted/60 border border-border/60 flex items-center justify-center transition-colors group-hover:bg-muted">
                    <item.icon size={16} className={item.color} />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{item.label}</p>
                    <p className="text-xs font-semibold text-foreground mt-0.5">{item.value || 'N/A'}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

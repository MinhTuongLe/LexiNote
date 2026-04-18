import React from 'react';
import { 
  ShieldCheck, 
  Calendar, 
  Key, 
  Mail, 
  BadgeCheck,
  CreditCard,
  Bell,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

const ProfilePage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <div className="space-y-8 animate-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-[#181c32]">Account Details</h1>
          <p className="text-xs font-semibold text-[#a1a5b7] mt-1">Manage your administrative identity and credentials.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <Card className="border-[#eff2f5] shadow-sm flex flex-col items-center">
          <CardContent className="p-10 flex flex-col items-center w-full">
            <div className="relative group">
              <div className="w-24 h-24 rounded-[2.5rem] bg-[#f1faff] flex items-center justify-center text-3xl font-black text-[#009ef7] border-4 border-white shadow-xl transition-transform group-hover:scale-105">
                {user?.fullName?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'AD'}
              </div>
              {user?.isActive && (
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#50cd89] border-4 border-white rounded-full flex items-center justify-center shadow-md">
                  <BadgeCheck size={16} className="text-white" />
                </div>
              )}
            </div>
            <div className="mt-8 text-center">
              <h2 className="text-lg font-bold text-[#181c32]">{user?.fullName}</h2>
              <p className="text-xs font-semibold text-[#a1a5b7] mt-1 italic">{user?.email}</p>
            </div>
            <div className="mt-6 flex gap-2">
               <span className="bg-[#f1faff] text-[#009ef7] text-[10px] font-bold px-3 py-1 rounded-lg uppercase tracking-wider">{user?.role}</span>
               {user?.isEmailVerified && (
                 <span className="bg-[#e8fff3] text-[#50cd89] text-[10px] font-bold px-3 py-1 rounded-lg uppercase tracking-wider">Verified</span>
               )}
            </div>
            
            <div className="w-full mt-10 space-y-2">
               <Button className="w-full bg-[#009ef7] hover:bg-[#0086d1] text-white">Edit Identity</Button>
            </div>
          </CardContent>
        </Card>

        {/* Metadata & Stats */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-[#eff2f5] shadow-sm">
             <div className="p-6 border-b border-[#eff2f5] bg-[#f9fafb]/50 rounded-t-[inherit]">
                <h3 className="text-xs font-black text-[#181c32] uppercase tracking-[0.2em] border-l-3 border-[#009ef7] pl-3">Vault Parameters</h3>
             </div>
             <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  { label: 'Primary Mail', value: user?.email, icon: Mail, color: 'text-[#009ef7]' },
                  { label: 'Role Context', value: user?.role === 'ADMIN' ? 'Root Access' : 'External Member', icon: ShieldCheck, color: 'text-[#7239ea]' },
                  { label: 'UID Signature', value: `LEX_NODE_X${user?.id}_ALPHA`, icon: Key, color: 'text-[#ffc700]' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-xl bg-[#f5f8fa] flex items-center justify-center transition-colors group-hover:bg-white group-hover:shadow-sm">
                      <item.icon size={18} className={item.color} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-[#a1a5b7] uppercase tracking-widest">{item.label}</p>
                      <p className="text-xs font-bold text-[#3f4254] mt-0.5">{item.value}</p>
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

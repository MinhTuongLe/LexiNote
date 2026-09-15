import React from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  ShieldCheck, 
  ArrowUpDown,
  Download,
  Plus,
  MoreHorizontal,
  Loader2
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Skeleton from '@/components/ui/Skeleton';
import { useUsers } from './useUsers';
import ReModal from '@/components/ui/ReModal';
import { useToast } from '@/components/ui/Toast';

import { exportToCSV } from '@/utils/export';
import { Trash2, Edit2 } from 'lucide-react';

const UserManagementPage: React.FC = () => {
  const {
    users,
    isLoading,
    search,
    setSearch,
    page,
    setPage,
    status,
    setStatus,
    totalPages,
    totalUsers,
    handleToggleStatus,
    handleCreateUser,
    handleUpdateUser,
    handleDeleteUser,
    formatDate
  } = useUsers();

  const { toast } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<any>(null);
  
  const [newUserData, setNewUserData] = React.useState({ fullName: '', email: '' });
  const [editUserData, setEditUserData] = React.useState({ fullName: '' });
  const [isActionLoading, setIsActionLoading] = React.useState(false);

  const handleExport = () => {
    exportToCSV(users, 'lexinote_users');
    toast({ type: 'info', title: 'Export Initiated', message: 'User database is being serialized to CSV.' });
  };

  const onAddMember = async () => {
    if (!newUserData.fullName || !newUserData.email) return;

    setIsActionLoading(true);
    try {
      await handleCreateUser(newUserData);
      setIsAddModalOpen(false);
      setNewUserData({ fullName: '', email: '' });
      toast({ type: 'success', title: 'Member Provisioned', message: `${newUserData.fullName} has been added to the registry.` });
    } catch (err) {
      toast({ type: 'error', title: 'Provisioning Failed', message: 'Infrastructure collision or invalid parameters.' });
    } finally {
      setIsActionLoading(false);
    }
  };

  const onUpdateMember = async () => {
    if (!selectedUser || !editUserData.fullName) return;

    setIsActionLoading(true);
    try {
      await handleUpdateUser(selectedUser.id, editUserData);
      setIsEditModalOpen(false);
      toast({ type: 'success', title: 'Identity Updated', message: 'User metadata has been synchronized.' });
    } catch (err) {
      toast({ type: 'error', title: 'Sync Failed', message: 'Could not propagate metadata changes.' });
    } finally {
      setIsActionLoading(false);
    }
  };

  const onDeleteMember = async () => {
    if (!selectedUser) return;

    setIsActionLoading(true);
    try {
      await handleDeleteUser(selectedUser.id);
      setIsDeleteModalOpen(false);
      toast({ type: 'success', title: 'Member Purged', message: 'Entry has been permanently removed from the shard.' });
    } catch (err) {
      toast({ type: 'error', title: 'Purge Failed', message: 'Security constraint prevented node deletion.' });
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-[#181c32]">User Management</h1>
          <p className="text-xs font-semibold text-[#a1a5b7] mt-1">Control access tiers and member permissions.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="secondary" className="bg-[#f5f8fa] text-[#7e8299] hover:bg-[#eff2f5]" onClick={handleExport}><Download size={14} className="mr-1.5" /> Export CSV</Button>
           <Button className="bg-[#009ef7] text-white hover:bg-[#0086d1]" onClick={() => setIsAddModalOpen(true)}><Plus size={16} className="mr-1.5" /> Add Member</Button>
        </div>
      </div>

      <ReModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Provision New Identity"
        description="Initialize a new administrative or member shard."
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button 
              className="bg-[#009ef7] text-white" 
              onClick={onAddMember}
              disabled={isActionLoading}
            >
              {isActionLoading ? 'Provisioning...' : 'Confirm Provision'}
            </Button>
          </>
        }
      >
        <div className="space-y-5">
           <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#a1a5b7] uppercase tracking-widest">Full Name Signature</label>
              <Input 
                placeholder="e.g. John Doe"
                value={newUserData.fullName}
                onChange={(e) => setNewUserData({...newUserData, fullName: e.target.value})}
                className="bg-[#f5f8fa] border-none h-11 focus-visible:ring-[#009ef7]"
              />
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#a1a5b7] uppercase tracking-widest">Primary Email Axis</label>
              <Input 
                type="email"
                placeholder="e.g. john@lexinote.ui"
                value={newUserData.email}
                onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
                className="bg-[#f5f8fa] border-none h-11 focus-visible:ring-[#009ef7]"
              />
           </div>
        </div>
      </ReModal>

      {/* Edit Modal */}
      <ReModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Revise Identity"
        description={`Modify parameters for shard node: ${selectedUser?.email}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>Abort</Button>
            <Button 
              className="bg-[#009ef7] text-white" 
              onClick={onUpdateMember}
              disabled={isActionLoading}
            >
              {isActionLoading ? 'Synchronizing...' : 'Save Revisions'}
            </Button>
          </>
        }
      >
        <div className="space-y-5">
           <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#a1a5b7] uppercase tracking-widest">Full Name Revision</label>
              <Input 
                placeholder="e.g. John Doe"
                value={editUserData.fullName}
                onChange={(e) => setEditUserData({...editUserData, fullName: e.target.value})}
                className="bg-[#f5f8fa] border-none h-11 focus-visible:ring-[#009ef7]"
              />
           </div>
        </div>
      </ReModal>

      {/* Delete Confirmation Modal */}
      <ReModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Purge Node Confirmation"
        description="This action will permanently decommission the identity shard."
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button 
              className="bg-[#f1416c] text-white hover:bg-[#d9214e]" 
              onClick={onDeleteMember}
              disabled={isActionLoading}
            >
              {isActionLoading ? 'Purging...' : 'Confirm Purge'}
            </Button>
          </>
        }
      >
        <div className="p-6 bg-[#fff5f8] rounded-2xl border border-[#f1416c]/10 flex items-center gap-4">
           <div className="w-12 h-12 rounded-full bg-[#f1416c]/10 flex items-center justify-center text-[#f1416c]">
              <Trash2 size={24} />
           </div>
           <div>
              <p className="text-sm font-bold text-[#181c32]">Warning: Critical Deletion</p>
              <p className="text-xs font-semibold text-[#f1416c]">Node: {selectedUser?.fullName}</p>
           </div>
        </div>
      </ReModal>

      <Card className="border-[#eff2f5] shadow-sm">
        {/* Table Filter Bar */}
        <div className="p-5 border-b border-[#eff2f5] flex flex-wrap items-center justify-between gap-4">
           <div className="relative max-w-sm w-full group">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a1a5b7] group-focus-within:text-[#009ef7] transition-colors" size={16} />
               <Input 
                 type="text" 
                 placeholder="Search Identity..." 
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 className="w-full bg-[#f5f8fa] border-none rounded-lg h-9 pl-10 pr-4 text-xs font-medium focus-visible:ring-1 focus-visible:ring-[#009ef7] transition-all"
               />
           </div>
           
           <div className="flex gap-2">
              <Button variant="secondary" className="h-9 bg-[#f5f8fa] text-[#7e8299] hover:bg-[#eff2f5]"><Filter size={14} className="mr-1.5" /> Filter</Button>
              <div className="bg-[#eff2f5] w-px h-8"></div>
              <button 
                onClick={() => setStatus('ALL')}
                className={`text-[11px] font-bold px-4 py-2 rounded-lg transition-all ${status === 'ALL' ? 'text-[#009ef7] bg-[#f1faff]' : 'text-[#3f4254] hover:bg-[#f1faff] hover:text-[#009ef7]'}`}
              >
                All
              </button>
              <button 
                onClick={() => setStatus('ACTIVE')}
                className={`text-[11px] font-bold px-4 py-2 rounded-lg transition-all ${status === 'ACTIVE' ? 'text-[#009ef7] bg-[#f1faff]' : 'text-[#3f4254] hover:bg-[#f1faff] hover:text-[#009ef7]'}`}
              >
                Active
              </button>
              <button 
                onClick={() => setStatus('INACTIVE')}
                className={`text-[11px] font-bold px-4 py-2 rounded-lg transition-all ${status === 'INACTIVE' ? 'text-[#009ef7] bg-[#f1faff]' : 'text-[#3f4254] hover:bg-[#f1faff] hover:text-[#009ef7]'}`}
              >
                Inactive
              </button>
           </div>
        </div>

        {/* Data Grid ReUI Style */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-[#eff2f5] hover:bg-transparent">
                <TableHead className="px-6 py-4 font-bold">
                  <button className="flex items-center gap-1.5 text-[10px] text-[#b5b5c3] uppercase tracking-widest hover:text-[#3f4254]">
                    User Identity <ArrowUpDown size={12} />
                  </button>
                </TableHead>
                <TableHead className="px-6 py-4 font-bold">
                  <button className="flex items-center gap-1.5 text-[10px] text-[#b5b5c3] uppercase tracking-widest hover:text-[#3f4254]">
                    Perm Level <ArrowUpDown size={12} />
                  </button>
                </TableHead>
                <TableHead className="px-6 py-4 text-center font-bold">
                  <button className="flex items-center gap-1.5 m-auto text-[10px] text-[#b5b5c3] uppercase tracking-widest hover:text-[#3f4254]">
                    Status <ArrowUpDown size={12} />
                  </button>
                </TableHead>
                <TableHead className="px-6 py-4 text-center font-bold">
                  <button className="flex items-center gap-1.5 m-auto text-[10px] text-[#b5b5c3] uppercase tracking-widest hover:text-[#3f4254]">
                    Data Points <ArrowUpDown size={12} />
                  </button>
                </TableHead>
                <TableHead className="px-6 py-4 font-bold">
                  <button className="flex items-center gap-1.5 text-[10px] text-[#b5b5c3] uppercase tracking-widest hover:text-[#3f4254]">
                    Joined <ArrowUpDown size={12} />
                  </button>
                </TableHead>
                <TableHead className="px-6 py-4"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-[#eff2f5]">
              {isLoading ? (
                 [1, 2, 3, 4, 5].map((i) => (
                   <TableRow key={i}>
                     <TableCell className="px-6 py-4"><Skeleton className="h-10 w-full" /></TableCell>
                     <TableCell className="px-6 py-4"><Skeleton className="h-4 w-20" /></TableCell>
                     <TableCell className="px-6 py-4"><Skeleton className="h-4 w-20" /></TableCell>
                     <TableCell className="px-6 py-4"><Skeleton className="h-4 w-16" /></TableCell>
                     <TableCell className="px-6 py-4"><Skeleton className="h-4 w-24" /></TableCell>
                     <TableCell className="px-6 py-4"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                   </TableRow>
                 ))
              ) : users.length === 0 ? (
                <TableRow>
                   <TableCell colSpan={6} className="h-32 text-center text-xs font-bold text-[#a1a5b7] uppercase tracking-widest">
                      Zero results Found.
                   </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} className="hover:bg-[#f9fafb] transition-colors group border-none">
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[#f1faff] border border-[#eff2f5] flex items-center justify-center font-bold text-[#009ef7] text-xs">
                          {user.fullName.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-[#181c32] hover:text-[#009ef7] cursor-pointer transition-colors">{user.fullName}</span>
                          <span className="text-[11px] font-medium text-[#a1a5b7]">{user.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                        user.role === 'ADMIN' ? 'bg-[#f8f5ff] text-[#7239ea]' : 'bg-[#f5f8fa] text-[#7e8299]'
                      }`}>
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-center">
                      <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                        user.isActive ? 'text-[#50cd89] bg-[#e8fff3]' : 'text-[#f1416c] bg-[#fff5f8]'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-center font-mono text-xs font-bold text-[#3f4254]">
                      {user.wordCount.toLocaleString()}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-[11px] font-bold text-[#7e8299]">
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => toast({ type: 'info', title: 'Shard Diagnostic', message: `User: ${user.fullName} | Status: ${user.isActive ? 'Active' : 'Inactive'}` })}
                          className="h-8 w-8 hover:bg-[#f1faff] hover:text-[#009ef7] text-[#a1a5b7]"
                        >
                          <Eye size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => {
                            setSelectedUser(user);
                            setEditUserData({ fullName: user.fullName });
                            setIsEditModalOpen(true);
                          }}
                          className="h-8 w-8 hover:bg-[#f1faff] hover:text-[#009ef7] text-[#a1a5b7]"
                        >
                          <Edit2 size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={async () => {
                            await handleToggleStatus(user.id);
                            toast({ type: 'success', title: 'Status Toggled', message: `Identity ${user.fullName} is now ${!user.isActive ? 'Active' : 'Inactive'}.` });
                          }}
                          className={`h-8 w-8 ${user.isActive ? 'hover:bg-[#fff5f8] hover:text-[#f1416c]' : 'hover:bg-[#e8fff3] hover:text-[#50cd89]'} text-[#a1a5b7]`}
                        >
                          <ShieldCheck size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => {
                            setSelectedUser(user);
                            setIsDeleteModalOpen(true);
                          }}
                          className="h-8 w-8 hover:bg-[#fff5f8] hover:text-[#f1416c] text-[#a1a5b7]"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Action Bar Footer */}
         <div className="p-6 border-t border-[#eff2f5] flex items-center justify-between">
            <p className="text-[11px] font-bold text-[#a1a5b7]">Showing {users.length} of {totalUsers} entries</p>
            <div className="flex gap-2">
                <Button 
                  variant="secondary" 
                  onClick={() => setPage((p: number) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-8 px-3 font-bold bg-[#f5f8fa] text-[#7e8299] hover:bg-[#eff2f5]"
                >
                  Previous
                </Button>
                <div className="flex gap-1 items-center">
                   {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                      <button 
                        key={num} 
                        onClick={() => setPage(num)}
                        className={`w-8 h-8 rounded-lg text-[11px] font-bold transition-all ${page === num ? 'bg-[#009ef7] text-white shadow-sm shadow-[#009ef7]/20' : 'text-[#7e8299] hover:bg-[#f5f8fa]'}`}
                      >
                        {num}
                      </button>
                   ))}
                </div>
                <Button 
                  variant="secondary" 
                  onClick={() => setPage((p: number) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="h-8 px-3 font-bold bg-[#f5f8fa] text-[#7e8299] hover:bg-[#eff2f5]"
                >
                  Next
                </Button>
            </div>
        </div>
      </Card>
    </div>
  );
};

export default UserManagementPage;

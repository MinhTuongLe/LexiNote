import React from 'react';
import { 
  Search, 
  Eye, 
  Download,
  Plus,
  Trash2, 
  Edit2,
  ShieldCheck,
  BadgeCheck,
  Key
} from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Skeleton from '@/components/ui/Skeleton';
import { useUsers } from './useUsers';
import type { DashboardUserItem } from './useUsers';
import ReModal from '@/components/ui/ReModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useToast } from '@/components/ui/Toast';
import { exportToCSV } from '@/utils/export';
import { UserDetailModal } from './UserDetailModal';
import { useNavigate } from 'react-router-dom';
import { useResetUserPasswordMutation } from '@/store/api/usersApi';
import Tooltip from '@/components/ui/Tooltip';

const UserManagementPage: React.FC = () => {
  const navigate = useNavigate();
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
    handleUpdateRole,
    formatDate
  } = useUsers();

  const { toast } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = React.useState(false);
  const [inspectUserId, setInspectUserId] = React.useState<number | null>(null);
  const [selectedUser, setSelectedUser] = React.useState<DashboardUserItem | null>(null);

  const [roleConfirmUser, setRoleConfirmUser] = React.useState<DashboardUserItem | null>(null);
  const [resetConfirmUser, setResetConfirmUser] = React.useState<DashboardUserItem | null>(null);
  const [resetPassword, { isLoading: isResettingPassword }] = useResetUserPasswordMutation();

  const handleConfirmResetPassword = async () => {
    if (!resetConfirmUser) return;
    try {
      await resetPassword(resetConfirmUser.id).unwrap();
      toast.success(
        'Đã Reset Mật Khẩu!',
        `Mật khẩu mặc định của ${resetConfirmUser.fullName} đã chuyển về 123456. Các phiên làm việc hiện tại đã bị thu hồi.`
      );
    } catch {
      toast.error('Reset Thất Bại', 'Không thể đặt lại mật khẩu người dùng.');
    }
  };

  const onToggleRole = (user: DashboardUserItem) => {
    setRoleConfirmUser(user);
  };

  const handleConfirmRoleChange = async () => {
    if (!roleConfirmUser) return;
    const targetRole = roleConfirmUser.role === 'ADMIN' ? 'MEMBER' : 'ADMIN';
    try {
      await handleUpdateRole(roleConfirmUser.id, targetRole);
      toast.success('Role Updated', `${roleConfirmUser.fullName} is now an ${targetRole}.`);
    } catch {
      toast.error('Action Failed', 'Could not update user role.');
    }
  };
  
  const [newUserData, setNewUserData] = React.useState({ fullName: '', email: '' });
  const [editUserData, setEditUserData] = React.useState({ fullName: '' });
  const [isActionLoading, setIsActionLoading] = React.useState(false);

  const handleExport = () => {
    exportToCSV(users as unknown as Record<string, unknown>[], 'lexinote_users');
    toast({ type: 'info', title: 'Export Initiated', message: 'User database is being exported to CSV.' });
  };

  const onAddMember = async () => {
    if (!newUserData.fullName || !newUserData.email) return;

    setIsActionLoading(true);
    try {
      await handleCreateUser(newUserData);
      setIsAddModalOpen(false);
      setNewUserData({ fullName: '', email: '' });
      toast({ type: 'success', title: 'Member Created', message: `${newUserData.fullName} has been added.` });
    } catch {
      toast({ type: 'error', title: 'Action Failed', message: 'User creation failed. Please check inputs.' });
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
      toast({ type: 'success', title: 'User Updated', message: 'User metadata has been synchronized.' });
    } catch {
      toast({ type: 'error', title: 'Sync Failed', message: 'Could not update user.' });
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
      toast({ type: 'success', title: 'Member Removed', message: 'Entry has been removed from database.' });
    } catch {
      toast({ type: 'error', title: 'Delete Failed', message: 'Security constraint prevented deletion.' });
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">User Management</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Control access tiers, learner progress, and accounts.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button 
            variant="outline" 
            size="sm"
            className="h-9 border-border/80 text-muted-foreground hover:text-foreground"
            onClick={handleExport}
          >
            <Download size={14} className="mr-1.5" /> Export CSV
          </Button>
          <Button 
            size="sm"
            className="h-9 font-medium shadow-xs" 
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus size={16} className="mr-1.5" /> Add Member
          </Button>
        </div>
      </div>

      {/* Add Modal */}
      <ReModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Member"
        description="Initialize a new administrative or student account."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button 
              size="sm"
              onClick={onAddMember}
              disabled={isActionLoading}
            >
              {isActionLoading ? 'Creating...' : 'Create Account'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Full Name</label>
            <Input 
              placeholder="e.g. Linh Nguyen"
              value={newUserData.fullName}
              onChange={(e) => setNewUserData({...newUserData, fullName: e.target.value})}
              className="bg-muted/40 border-border/80 h-10 font-medium text-foreground"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email Address</label>
            <Input 
              type="email"
              placeholder="e.g. linh@lexinote.com"
              value={newUserData.email}
              onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
              className="bg-muted/40 border-border/80 h-10 font-medium text-foreground"
            />
          </div>
        </div>
      </ReModal>

      {/* Edit Modal */}
      <ReModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Update User Profile"
        description={`Modify parameters for: ${selectedUser?.email}`}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button 
              size="sm"
              onClick={onUpdateMember}
              disabled={isActionLoading}
            >
              {isActionLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Full Name</label>
            <Input 
              placeholder="e.g. Linh Nguyen"
              value={editUserData.fullName}
              onChange={(e) => setEditUserData({...editUserData, fullName: e.target.value})}
              className="bg-muted/40 border-border/80 h-10 font-medium text-foreground"
            />
          </div>
        </div>
      </ReModal>

      {/* Delete Confirmation Modal */}
      <ReModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm User Removal"
        description="This action will permanently delete the user account and associated progress."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={onDeleteMember}
              disabled={isActionLoading}
            >
              {isActionLoading ? 'Deleting...' : 'Delete User'}
            </Button>
          </>
        }
      >
        <div className="p-4 bg-destructive/10 rounded-xl border border-destructive/20 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-destructive/15 flex items-center justify-center text-destructive shrink-0">
            <Trash2 size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Irreversible Action</p>
            <p className="text-xs font-medium text-destructive mt-0.5">{selectedUser?.fullName} ({selectedUser?.email})</p>
          </div>
        </div>
      </ReModal>

      <Card className="border-border/60 bg-card shadow-xs overflow-hidden">
        {/* Table Filter Bar */}
        <div className="p-4 border-b border-border/60 flex flex-wrap items-center justify-between gap-4">
          <div className="relative max-w-sm w-full group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={15} />
            <Input 
              type="text" 
              placeholder="Search by name or email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-muted/40 border-border/80 rounded-lg h-9 pl-9 pr-3 text-xs font-medium focus-visible:ring-1 focus-visible:ring-primary transition-all"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-lg border border-border/80 p-0.5 bg-muted/30">
              {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((st) => (
                <button 
                  key={st}
                  onClick={() => setStatus(st)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-md transition-all ${
                    status === st 
                      ? 'bg-background text-foreground shadow-2xs font-semibold' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {st.charAt(0) + st.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-border/60 hover:bg-transparent">
                <TableHead className="px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  User Identity
                </TableHead>
                <TableHead className="px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Role
                </TableHead>
                <TableHead className="px-6 py-3.5 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </TableHead>
                <TableHead className="px-6 py-3.5 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Word Count
                </TableHead>
                <TableHead className="px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Joined Date
                </TableHead>
                <TableHead className="px-6 py-3.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border/60">
              {isLoading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <TableRow key={i}>
                    <TableCell className="px-6 py-3.5"><Skeleton className="h-10 w-full" /></TableCell>
                    <TableCell className="px-6 py-3.5"><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell className="px-6 py-3.5"><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell className="px-6 py-3.5"><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell className="px-6 py-3.5"><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="px-6 py-3.5"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    No matching users found.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} className="hover:bg-muted/30 transition-colors group">
                    <TableCell className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-xs shrink-0 overflow-hidden">
                          {user.avatar ? (
                            user.avatar.startsWith('http') ? (
                              <img src={user.avatar} alt={user.fullName} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-base">{user.avatar}</span>
                            )
                          ) : (
                            user.fullName.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                              {user.fullName}
                            </span>
                            {user.isEmailVerified && (
                              <Tooltip content="Verified Email Account" side="top">
                                <span className="inline-flex items-center">
                                  <BadgeCheck size={14} className="text-emerald-500 shrink-0" />
                                </span>
                              </Tooltip>
                            )}
                          </div>
                          <span className="text-[11px] text-muted-foreground truncate">{user.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-3.5">
                      <Tooltip content={`Toggle role (${user.role === 'ADMIN' ? 'Demote to MEMBER' : 'Promote to ADMIN'})`} side="top">
                        <button
                          onClick={() => onToggleRole(user)}
                          className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-md hover:opacity-80 transition-all cursor-pointer ${
                            user.role === 'ADMIN' 
                              ? 'bg-primary/15 text-primary border border-primary/30 font-bold' 
                              : 'bg-muted text-muted-foreground border border-border/60'
                          }`}
                        >
                          {user.role || 'MEMBER'}
                        </button>
                      </Tooltip>
                    </TableCell>
                    <TableCell className="px-6 py-3.5 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                        user.isActive 
                          ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' 
                          : 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-3.5 text-center font-mono text-xs font-medium text-foreground">
                      {(user.wordCount ?? 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="px-6 py-3.5 text-xs text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell className="px-6 py-3.5 text-right">
                      <div className="flex justify-end gap-1">
                        <Tooltip content="Inspect Details & SRS Progress" side="top">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => {
                              setInspectUserId(user.id);
                              setIsDetailModalOpen(true);
                            }}
                            className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted"
                          >
                            <Eye size={14} />
                          </Button>
                        </Tooltip>

                        <Tooltip content="Reset Password to 123456" side="top">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setResetConfirmUser(user)}
                            className="h-7 w-7 text-amber-500 hover:text-amber-600 hover:bg-amber-500/10"
                          >
                            <Key size={14} />
                          </Button>
                        </Tooltip>

                        <Tooltip content="Edit User Profile" side="top">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => {
                              setSelectedUser(user);
                              setEditUserData({ fullName: user.fullName });
                              setIsEditModalOpen(true);
                            }}
                            className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted"
                          >
                            <Edit2 size={14} />
                          </Button>
                        </Tooltip>

                        <Tooltip content={user.isActive ? "Deactivate User" : "Activate User"} side="top">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={async () => {
                              await handleToggleStatus(user.id);
                              toast({ type: 'success', title: 'Status Updated', message: `${user.fullName} is now ${!user.isActive ? 'Active' : 'Inactive'}.` });
                            }}
                            className={`h-7 w-7 ${
                              user.isActive 
                                ? 'text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10' 
                                : 'text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10'
                            }`}
                          >
                            <ShieldCheck size={14} />
                          </Button>
                        </Tooltip>

                        <Tooltip content="Delete User" side="top">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => {
                              setSelectedUser(user);
                              setIsDeleteModalOpen(true);
                            }}
                            className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Action Bar Footer (Rendered only when totalPages > 1) */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-border/60 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{users.length}</span> of <span className="font-semibold text-foreground">{totalUsers}</span> entries
            </p>
            <div className="flex gap-2 items-center">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setPage((p: number) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
              >
                Previous
              </Button>
              <div className="flex gap-1 items-center">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                  <button 
                    key={num} 
                    onClick={() => setPage(num)}
                    className={`w-7 h-7 rounded-md text-xs font-semibold transition-all ${
                      page === num 
                        ? 'bg-primary text-primary-foreground shadow-xs' 
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setPage((p: number) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      <UserDetailModal
        userId={inspectUserId}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onViewUserWords={(userId) => {
          setIsDetailModalOpen(false);
          navigate(`/dashboard/words?ownerId=${userId}`);
        }}
      />

      <ConfirmModal
        isOpen={!!roleConfirmUser}
        onClose={() => setRoleConfirmUser(null)}
        onConfirm={handleConfirmRoleChange}
        title="Change User Role"
        description={`Are you sure you want to change ${roleConfirmUser?.fullName || 'this user'}'s role to ${roleConfirmUser?.role === 'ADMIN' ? 'MEMBER' : 'ADMIN'}?`}
        confirmText="Change Role"
        variant="warning"
      />

      <ConfirmModal
        isOpen={!!resetConfirmUser}
        onClose={() => setResetConfirmUser(null)}
        onConfirm={handleConfirmResetPassword}
        title="Reset Mật Khẩu Người Dùng"
        description={`Bạn có chắc chắn muốn reset mật khẩu của ${resetConfirmUser?.fullName || 'người dùng này'} về 123456? Tất cả phiên đăng nhập hiện tại sẽ bị hủy.`}
        confirmText="Reset Về 123456"
        variant="warning"
        isLoading={isResettingPassword}
      />
    </div>
  );
};

export default UserManagementPage;

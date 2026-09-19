import React, { useState } from 'react';
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
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useToast } from '@/components/ui/Toast';
import { exportToCSV } from '@/utils/export';
import { UserDetailModal } from './UserDetailModal';
import { UserFormModal } from './UserFormModal';
import { useNavigate } from 'react-router-dom';
import { useResetUserPasswordMutation } from '@/store/api/usersApi';
import Tooltip from '@/components/ui/Tooltip';
import PageHeader from '@/components/common/PageHeader';
import Pagination from '@/components/common/Pagination';
import StatusBadge from '@/components/common/StatusBadge';
import UserRoleBadge from '@/components/common/UserRoleBadge';

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

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [inspectUserId, setInspectUserId] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<DashboardUserItem | null>(null);

  const [roleConfirmUser, setRoleConfirmUser] = useState<DashboardUserItem | null>(null);
  const [resetConfirmUser, setResetConfirmUser] = useState<DashboardUserItem | null>(null);
  const [resetPassword, { isLoading: isResettingPassword }] = useResetUserPasswordMutation();
  const [isActionLoading, setIsActionLoading] = useState(false);

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

  const handleAddSubmit = async (data: { fullName: string; email?: string }) => {
    setIsActionLoading(true);
    try {
      await handleCreateUser(data.fullName, data.email || '');
      toast.success('Account Created', `Created account for ${data.fullName}`);
    } catch {
      toast.error('Creation Failed', 'Could not create new user account.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleEditSubmit = async (data: { fullName: string }) => {
    if (!selectedUser) return;
    setIsActionLoading(true);
    try {
      await handleUpdateUser(selectedUser.id, data.fullName);
      toast.success('Profile Updated', 'User information saved.');
    } catch {
      toast.error('Update Failed', 'Could not update user information.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const onDeleteMember = async () => {
    if (!selectedUser) return;
    setIsActionLoading(true);
    try {
      await handleDeleteUser(selectedUser.id);
      toast.success('User Purged', 'User record archived safely.');
      setIsDeleteModalOpen(false);
    } catch {
      toast.error('Delete Failed', 'Security constraint prevented deletion.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleExport = () => {
    const exportData = users.map(u => ({
      ID: u.id,
      FullName: u.fullName,
      Email: u.email,
      Role: u.role,
      IsActive: u.isActive,
      WordsCount: u.wordCount || 0,
      CreatedAt: formatDate(u.createdAt)
    }));
    exportToCSV(exportData, `lexinote-users-page${page}`);
    toast.info('CSV Exported', 'Downloaded current page user entries.');
  };

  return (
    <div className="space-y-6">
      {/* Page Header Component */}
      <PageHeader
        title="User Management"
        description="Control access tiers, learner progress, and accounts."
        action={
          <>
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
          </>
        }
      />

      {/* Add User Modal Component */}
      <UserFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddSubmit}
        isLoading={isActionLoading}
      />

      {/* Edit User Modal Component */}
      <UserFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        user={selectedUser}
        isLoading={isActionLoading}
      />

      {/* Delete User Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={onDeleteMember}
        title="Confirm User Removal"
        description={`This action will permanently delete ${selectedUser?.fullName || 'the user'} and associate progress records.`}
        confirmText="Delete Account"
        variant="danger"
        isLoading={isActionLoading}
      />

      <Card className="border-border/60 bg-card shadow-xs overflow-hidden rounded-xl">
        {/* Search & Status Filter Toolbar */}
        <div className="p-4 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/20">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
            <Input 
              placeholder="Search by name or email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 bg-background border-border/80 text-xs font-medium text-foreground focus-visible:ring-1 focus-visible:ring-primary"
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
                      <UserRoleBadge
                        role={user.role}
                        onClick={() => onToggleRole(user)}
                        tooltipContent={`Toggle role (${user.role === 'ADMIN' ? 'Demote to MEMBER' : 'Promote to ADMIN'})`}
                      />
                    </TableCell>

                    <TableCell className="px-6 py-3.5 text-center">
                      <StatusBadge
                        isActive={user.isActive}
                        onClick={async () => {
                          await handleToggleStatus(user.id);
                          toast.success('Status Updated', `${user.fullName} is now ${!user.isActive ? 'Active' : 'Inactive'}.`);
                        }}
                        tooltipContent={user.isActive ? "Click to deactivate user" : "Click to activate user"}
                      />
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
                              toast.success('Status Updated', `${user.fullName} is now ${!user.isActive ? 'Active' : 'Inactive'}.`);
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

        {/* Reusable Pagination Component */}
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          totalItems={totalUsers}
        />
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

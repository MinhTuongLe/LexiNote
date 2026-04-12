import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  ShieldCheck, 
  UserX,
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
import api from '../services/api';

interface UserData {
  id: number;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  wordCount: number;
  createdAt: string;
}

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/dashboard/management/users', {
        params: { page, search, limit: 10 }
      });
      setUsers(data.data);
      setTotalPages(data.meta.totalPages);
      setTotalUsers(data.meta.total);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const toggleUserStatus = async (id: number) => {
    try {
      await api.post(`/dashboard/management/users/${id}/toggle-status`);
      fetchUsers();
    } catch (error) {
      console.error('Failed to toggle status:', error);
    }
  };

  const formatDate = (epoch: any) => {
    return new Date(Number(epoch)).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  return (
    <div className="space-y-6 animate-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-[#181c32]">User Management</h1>
          <p className="text-xs font-semibold text-[#a1a5b7] mt-1">Control access tiers and member permissions.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="secondary" className="bg-[#f5f8fa] text-[#7e8299] hover:bg-[#eff2f5]"><Download size={14} className="mr-1.5" /> Export CSV</Button>
           <Button className="bg-[#009ef7] text-white hover:bg-[#0086d1]"><Plus size={16} className="mr-1.5" /> Add Member</Button>
        </div>
      </div>

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
              <button className="text-[11px] font-bold text-[#3f4254] px-4 py-2 hover:bg-[#f1faff] hover:text-[#009ef7] rounded-lg transition-all">All</button>
              <button className="text-[11px] font-bold text-[#009ef7] bg-[#f1faff] px-4 py-2 rounded-lg transition-all">Active</button>
              <button className="text-[11px] font-bold text-[#3f4254] px-4 py-2 hover:bg-[#f1faff] hover:text-[#009ef7] rounded-lg transition-all">Inactive</button>
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
                <TableRow>
                   <TableCell colSpan={6} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="animate-spin text-[#009ef7]" size={24} />
                        <span className="text-xs font-bold text-[#a1a5b7] uppercase tracking-widest">Accessing Shards...</span>
                      </div>
                   </TableCell>
                </TableRow>
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
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-[#f1faff] hover:text-[#009ef7] text-[#a1a5b7]"><Eye size={16} /></Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => toggleUserStatus(user.id)}
                          className={`h-8 w-8 ${user.isActive ? 'hover:bg-[#fff5f8] hover:text-[#f1416c]' : 'hover:bg-[#e8fff3] hover:text-[#50cd89]'} text-[#a1a5b7]`}
                        >
                          <ShieldCheck size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-[#f5f8fa] text-[#a1a5b7]"><MoreHorizontal size={16} /></Button>
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
                  onClick={() => setPage(p => Math.max(1, p - 1))}
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
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
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

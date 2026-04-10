'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, UserCog, Search, Loader2, Mail, Shield, UserCheck, UserX, Fingerprint } from 'lucide-react';
import { getUsers, deleteUser, activateUser, deactivateUser, User } from '@/core/api/auth/users';
import { Button, Input, Pagination } from '@/components/ui';
import { Modal } from '@/components/ui/Modal';
import { Popconfirm } from '@/components/ui/Popconfirm';
import { UserForm } from './components/UserForm';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/core/hooks/useDebounce';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [isTogglingStatus, setIsTogglingStatus] = useState<number | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getUsers({
        limit,
        skip: (currentPage - 1) * limit,
        filter: debouncedSearchTerm ? { 
          $or: [
            { name: { $regex: debouncedSearchTerm, $options: 'i' } },
            { email: { $regex: debouncedSearchTerm, $options: 'i' } }
          ]
        } : undefined
      });
      
      if (response.success) {
        setUsers(response.data);
        setTotal(response.meta.total);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, limit, debouncedSearchTerm]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Reset page to 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  const handleDelete = async (userId: number) => {
    setIsDeleting(userId);
    try {
      await deleteUser(userId);
      await fetchUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleToggleStatus = async (user: User) => {
    setIsTogglingStatus(user.id);
    try {
      if (user.isActive) {
        await deactivateUser(user.id);
      } else {
        await activateUser(user.id);
      }
      await fetchUsers();
    } catch (error) {
      console.error('Failed to toggle user status:', error);
    } finally {
      setIsTogglingStatus(null);
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Staff Management</h1>
          <p className="text-[10px] font-bold text-muted-foreground tracking-widest mt-1 opacity-70">Authorize and calibrate user permissions</p>
        </div>
        <Button onClick={handleAdd} className="flex items-center gap-2 shadow-lg shadow-indigo-100 dark:shadow-none tracking-widest text-[10px] font-black h-11 px-6 rounded-xl">
          <Plus className="h-4 w-4" />
          Onboard Member
        </Button>
      </div>

      {/* Toolbar */}
      <div className="mb-6 flex items-center justify-between gap-4 bg-muted/20 p-4 rounded-2xl border border-border/50">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name or email..." 
            className="pl-10 h-10 border-none bg-background shadow-sm rounded-xl focus-visible:ring-1 focus-visible:ring-indigo-200 transition-all font-medium text-[11px] tracking-tight"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[10px] font-black tracking-widest text-muted-foreground bg-background px-4 py-2 rounded-xl border border-border/50 shadow-sm transition-all">
             Authority Count: <span className="text-indigo-600 dark:text-indigo-400">{total}</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 flex flex-col bg-card rounded-2xl border border-border shadow-sm overflow-hidden transition-all duration-300 min-h-[500px]">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-20 text-muted-foreground gap-4">
            <div className="relative">
              <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
              <div className="absolute inset-0 h-10 w-10 border-4 border-indigo-100 dark:border-indigo-900 rounded-full -z-10 opacity-50"></div>
            </div>
            <p className="text-[10px] font-black tracking-widest animate-pulse ">Syncing member directory...</p>
          </div>
        ) : users.length > 0 ? (
          <>
            <div className="flex-1 overflow-x-auto scrollbar-hide">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/30 border-b border-border">
                    <th className="px-6 py-5 text-[10px] font-black tracking-widest text-muted-foreground/80">Authority Identity</th>
                    <th className="px-6 py-5 text-[10px] font-black tracking-widest text-muted-foreground/80">Role Assignments</th>
                    <th className="px-6 py-5 text-[10px] font-black tracking-widest text-muted-foreground/80">Authentication</th>
                    <th className="px-6 py-5 text-[10px] font-black tracking-widest text-muted-foreground/80">Registry Status</th>
                    <th className="px-6 py-5 text-[10px] font-black tracking-widest text-muted-foreground/80 text-right">Options</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-muted/10 transition-all duration-200 group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-indigo-100/80 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-700 dark:text-indigo-400 group-hover:scale-110 transition-transform shadow-sm border border-indigo-200/50 dark:border-indigo-800">
                            <Fingerprint className="h-5 w-5" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-[11px] tracking-tight">{user.name}</span>
                            <span className="text-[9px] text-muted-foreground font-bold tracking-widest opacity-60 flex items-center gap-1 ">
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                          {user.roles.map(role => (
                            <span key={role.id} className="text-[8px] font-black px-2 py-0.5 rounded-md bg-indigo-100/80 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800 tracking-wider">
                              {role.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={cn(
                          "inline-flex items-center gap-1.5 text-[9px] font-black tracking-widest transition-all",
                          user.isActive ? "text-emerald-500" : "text-rose-500"
                        )}>
                          {user.isActive ? <UserCheck className="h-3.5 w-3.5" /> : <UserX className="h-3.5 w-3.5" />}
                          {user.isActive ? "ACTIVE" : "DISABLED"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black tracking-[0.15em] border transition-all duration-300",
                          user.status === 'active' 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                            : "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
                        )}>
                          <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse", user.status === 'active' ? "bg-emerald-500" : "bg-rose-500")}></div>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Popconfirm
                            title={user.isActive ? "Disable Authority" : "Restore Authority"}
                            description={user.isActive ? "Suspend system-wide access for this member?" : "Re-authorize system access for this member?"}
                            onConfirm={() => handleToggleStatus(user)}
                          >
                            <button 
                              disabled={isTogglingStatus === user.id}
                              className={cn(
                                "p-2 rounded-xl transition-all disabled:opacity-50 border border-transparent hover:border-border",
                                user.isActive 
                                  ? "text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30" 
                                  : "text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                              )}
                              title={user.isActive ? "Disable User" : "Enable User"}
                            >
                              {isTogglingStatus === user.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />
                              )}
                            </button>
                          </Popconfirm>

                          <button 
                            onClick={() => handleEdit(user)}
                            className="p-2 text-muted-foreground hover:bg-white dark:hover:bg-indigo-950/30 hover:text-indigo-600 hover:shadow-sm hover:border hover:border-border rounded-xl transition-all"
                            title="Edit Permissions"
                          >
                            <Edit className="h-4 w-4" />
                          </button>

                          <Popconfirm
                            title="Purge Registry"
                            description="Permanently remove this member from the authority registry? This action is irreversible."
                            onConfirm={() => handleDelete(user.id)}
                          >
                            <button 
                              disabled={isDeleting === user.id}
                              className="p-2 text-muted-foreground hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 rounded-xl transition-all disabled:opacity-50"
                              title="Delete Member"
                            >
                              {isDeleting === user.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          </Popconfirm>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Component */}
            <Pagination
              currentPage={currentPage}
              total={total}
              limit={limit}
              onPageChange={setCurrentPage}
              onLimitChange={(newLimit) => {
                setLimit(newLimit);
                setCurrentPage(1);
              }}
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-20 gap-6">
             <div className="h-24 w-24 bg-muted/20 flex items-center justify-center rounded-[2.5rem] border border-border/50 shadow-inner">
               <Fingerprint className="h-10 w-10 text-muted-foreground/30" />
             </div>
             <div className="space-y-2">
               <p className="text-xl font-bold text-foreground tracking-tight">Identity Vault Empty</p>
               <p className="text-[10px] font-bold text-muted-foreground tracking-[0.2em] max-w-[320px] leading-relaxed mx-auto opacity-70 ">No staff members enrolled in this system. Onboard the first member to delegate authority.</p>
             </div>
             <Button onClick={handleAdd} variant="outline" className="mt-4 tracking-widest text-[9px] font-black h-11 px-8 rounded-xl border-dashed hover:border-solid transition-all transform hover:-translate-y-1">Delegate Primary Authority</Button>
          </div>
        )}
      </div>

      {/* CRUD Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedUser ? "Refine Authority identity" : "Onboard Staff Member"}
      >
        <UserForm 
          user={selectedUser}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchUsers();
          }}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

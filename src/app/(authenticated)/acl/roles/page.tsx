'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, ShieldCheck, Search, Loader2 } from 'lucide-react';
import { getRoles, deleteRole, Role } from '@/core/api/roles';
import { Button, Input, Pagination } from '@/components/ui';
import { Modal } from '@/components/ui/Modal';
import { Popconfirm } from '@/components/ui/Popconfirm';
import { RoleForm } from './components/RoleForm';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/core/hooks/useDebounce';

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchRoles = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getRoles({
        limit,
        skip: (currentPage - 1) * limit,
        filter: debouncedSearchTerm ? { 
          $or: [
            { name: { $regex: debouncedSearchTerm, $options: 'i' } },
            { key: { $regex: debouncedSearchTerm, $options: 'i' } }
          ]
        } : undefined
      });
      
      if (response.success) {
        setRoles(response.data);
        setTotal(response.meta.total);
      }
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, limit, debouncedSearchTerm]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // Reset page to 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  const handleDelete = async (roleId: number) => {
    setIsDeleting(roleId);
    try {
      await deleteRole(roleId);
      await fetchRoles();
    } catch (error) {
      console.error('Failed to delete role:', error);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleEdit = (role: Role) => {
    setSelectedRole(role);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedRole(null);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Roles & Permissions</h1>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-70">Direct authority calibration</p>
        </div>
        <Button onClick={handleAdd} className="flex items-center gap-2 shadow-lg shadow-indigo-100 dark:shadow-none uppercase tracking-widest text-[10px] font-black h-11 px-6 rounded-xl">
          <Plus className="h-4 w-4" />
          Create New Role
        </Button>
      </div>

      {/* Toolbar */}
      <div className="mb-6 flex items-center justify-between gap-4 bg-muted/30 p-4 rounded-2xl border border-border/50">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search roles..." 
            className="pl-10 h-10 border-none bg-background shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-background px-3 py-2 rounded-lg border border-border/50">
             Total roles: <span className="text-indigo-600">{total}</span>
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
            <p className="text-[10px] font-black tracking-widest uppercase animate-pulse">Synchronizing roles...</p>
          </div>
        ) : roles.length > 0 ? (
          <>
            <div className="flex-1 overflow-x-auto scrollbar-hide">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/40 border-b border-border">
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Role Details</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Identifier</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Current Status</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Joined</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 text-right">Options</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {roles.map((role) => (
                    <tr key={role._id} className="hover:bg-muted/20 transition-all duration-200 group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform shadow-sm">
                            <ShieldCheck className="h-5 w-5" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors uppercase text-[11px] tracking-tight">{role.name}</span>
                            <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">System Access Role</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-bold font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded">
                          {role.key}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.15em] border transition-all duration-300",
                          role.status === 'active' 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                            : "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
                        )}>
                          <div className={cn("h-1 w-1 rounded-full animate-pulse", role.status === 'active' ? "bg-emerald-500" : "bg-rose-500")}></div>
                          {role.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        {new Date(role.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2 transition-opacity">
                          <button 
                            onClick={() => handleEdit(role)}
                            className="p-2 text-muted-foreground hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:text-indigo-600 rounded-lg transition-all"
                            title="Edit Role"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <Popconfirm
                            title="Delete Role"
                            description="Are you sure you want to delete this role? This action cannot be undone."
                            onConfirm={() => handleDelete(role.id)}
                          >
                            <button 
                              disabled={isDeleting === role.id}
                              className="p-2 text-muted-foreground hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 rounded-lg transition-all disabled:opacity-50"
                              title="Delete Role"
                            >
                              {isDeleting === role.id ? (
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
          <div className="flex-1 flex flex-col items-center justify-center text-center p-20">
             <div className="h-20 w-20 bg-muted/30 flex items-center justify-center rounded-3xl mb-6 border border-border/50">
               <ShieldCheck className="h-10 w-10 text-muted-foreground/40" />
             </div>
             <p className="text-lg font-black text-foreground uppercase tracking-tight">No roles found</p>
             <p className="text-[10px] font-bold text-muted-foreground mt-2 uppercase tracking-[0.2em] max-w-[240px] leading-relaxed">Adjust your search parameters or initiate a new role registration.</p>
             <Button onClick={handleAdd} variant="outline" className="mt-8 uppercase tracking-widest text-[9px] font-black h-10 px-6 rounded-xl border-dashed">Register First Role</Button>
          </div>
        )}
      </div>

      {/* CRUD Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedRole ? "Edit Role" : "Create New Role"}
      >
        <RoleForm 
          role={selectedRole}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchRoles();
          }}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

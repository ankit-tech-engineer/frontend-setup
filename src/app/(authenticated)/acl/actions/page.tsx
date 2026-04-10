'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Zap, Search, Loader2 } from 'lucide-react';
import { getActions, deleteAction, Action } from '@/core/api/acl/actions';
import { Button, Input, Pagination } from '@/components/ui';
import { Modal } from '@/components/ui/Modal';
import { Popconfirm } from '@/components/ui/Popconfirm';
import { ActionForm } from './components/ActionForm';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/core/hooks/useDebounce';

export default function ActionsPage() {
  const [actions, setActions] = useState<Action[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchActions = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getActions({
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
        setActions(response.data);
        setTotal(response.meta.total);
      }
    } catch (error) {
      console.error('Failed to fetch actions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, limit, debouncedSearchTerm]);

  useEffect(() => {
    fetchActions();
  }, [fetchActions]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  const handleDelete = async (actionId: number) => {
    setIsDeleting(actionId);
    try {
      await deleteAction(actionId);
      await fetchActions();
    } catch (error) {
      console.error('Failed to delete action:', error);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleEdit = (action: Action) => {
    setSelectedAction(action);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedAction(null);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-2 duration-700">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">System Actions</h1>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-70 tracking-[0.2em]">RBAC Interaction Protocol</p>
        </div>
        <Button 
          onClick={handleCreate} 
          className="flex items-center gap-2 rounded-xl shadow-lg shadow-indigo-100 dark:shadow-none bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all px-6 h-11 uppercase tracking-widest text-[10px] font-black"
        >
          <Plus className="h-4 w-4" />
          Register Action
        </Button>
      </div>

      {/* Toolbar */}
      <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-6 bg-muted/30 p-4 rounded-2xl border border-border/50">
        <div className="relative w-full sm:max-w-md group">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-indigo-600 transition-colors" />
          <Input 
            placeholder="Search by intent or identifier..." 
            className="pl-10 h-11 rounded-xl bg-background border-none shadow-sm focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4">
           <div className="flex flex-col items-end pr-4 border-r border-border/50">
             <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-60">Total Protocols</span>
             <span className="text-lg font-black text-foreground tabular-nums tracking-tight">{total}</span>
           </div>
           <div className="flex flex-col items-end">
             <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-60">Status Operational</span>
             <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 tabular-nums tracking-tight">
               {total > 0 ? total : 0}
             </span>
           </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 flex flex-col bg-card rounded-2xl border border-border shadow-sm overflow-hidden transition-all duration-300 min-h-[500px]">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-20 text-muted-foreground gap-4">
            <div className="relative">
              <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
              <div className="absolute inset-0 h-10 w-10 border-4 border-indigo-100 dark:border-indigo-900/50 rounded-full -z-10 animate-pulse"></div>
            </div>
            <p className="text-[10px] font-black tracking-widest uppercase opacity-70 animate-pulse">Synchronizing interactions...</p>
          </div>
        ) : actions.length > 0 ? (
          <>
            <div className="flex-1 overflow-x-auto scrollbar-hide">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/40 border-b border-border transition-colors">
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Interaction Detail</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Technical ID</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Availability</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Registry Date</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 text-right">Options</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {actions.map((act) => (
                    <tr key={act._id} className="hover:bg-muted/10 transition-all duration-300 group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-5">
                          <div className="h-11 w-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform shadow-sm">
                            <Zap className="h-5 w-5" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-black text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors uppercase text-[11px] tracking-tight">{act.name}</span>
                            <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest opacity-60 mt-0.5">Interaction Trigger</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-[11px] font-black font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded-lg">
                          {act.key}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.15em] border transition-all duration-300",
                          act.status === 'active' 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                            : "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
                        )}>
                          <div className={cn("h-1 w-1 rounded-full animate-pulse", act.status === 'active' ? "bg-emerald-500" : "bg-rose-500")}></div>
                          {act.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                        {new Date(act.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2 transition-opacity">
                          <button 
                            onClick={() => handleEdit(act)}
                            className="h-9 w-9 flex items-center justify-center text-muted-foreground hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:text-indigo-600 rounded-xl transition-all border border-transparent hover:border-indigo-100/50"
                            title="Modify Protocol"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <Popconfirm
                            title="Delete Action"
                            description="Are you sure you want to delete this action? This will remove the trigger from the system."
                            onConfirm={() => handleDelete(act.id)}
                          >
                            <button 
                              disabled={isDeleting === act.id}
                              className="h-9 w-9 flex items-center justify-center text-muted-foreground hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 rounded-xl transition-all border border-transparent hover:border-red-100 dark:hover:border-red-900/30 disabled:opacity-30"
                              title="Decommission Action"
                            >
                              {isDeleting === act.id ? (
                                <Loader2 className="h-4 w-4 animate-spin text-red-600" />
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
          <div className="flex-1 flex flex-col items-center justify-center text-center p-20 max-w-md mx-auto animate-in zoom-in duration-700">
             <div className="relative mb-8 group cursor-pointer">
                <div className="absolute inset-0 bg-indigo-600/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="h-24 w-24 bg-indigo-50/50 dark:bg-indigo-950/20 flex items-center justify-center rounded-[2.5rem] border-2 border-dashed border-indigo-200 dark:border-indigo-800 rotate-6 group-hover:rotate-0 transition-all duration-700 relative z-10">
                  <Zap className="h-10 w-10 text-indigo-600/30" />
                </div>
             </div>
             <p className="text-xl font-black text-foreground uppercase tracking-tight">Interaction Void</p>
             <p className="text-[10px] font-bold text-muted-foreground mt-3 uppercase tracking-[0.2em] leading-relaxed opacity-60">No system triggers detected. Register your interaction protocols to define the RBAC boundary.</p>
             <Button onClick={handleCreate} className="mt-8 px-8 py-6 rounded-2xl bg-indigo-600 text-white font-black hover:scale-105 transition-all shadow-xl shadow-indigo-100 dark:shadow-none uppercase tracking-widest text-[9px] h-11">Initialize Registry</Button>
          </div>
        )}
      </div>

      {/* Action Modal Section */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedAction ? "Protocol Modification" : "System Action Registry"}
        className="max-w-lg rounded-[2.5rem] p-8 shadow-2xl border-indigo-100 dark:border-indigo-900"
      >
        <ActionForm 
          action={selectedAction}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchActions();
          }}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

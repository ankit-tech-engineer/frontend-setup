'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Layers, Search, Loader2, ShieldCheck, ChevronRight } from 'lucide-react';
import { getResourceActionMappings, deleteResourceActionMapping, ResourceActionMapping } from '@/core/api/resource-action-mappings';
import { Button, Input, Pagination } from '@/components/ui';
import { Modal } from '@/components/ui/Modal';
import { Popconfirm } from '@/components/ui/Popconfirm';
import { ResourceActionMappingForm } from './components/ResourceActionMappingForm';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/core/hooks/useDebounce';

export default function ResourceActionMappingPage() {
  const [mappings, setMappings] = useState<ResourceActionMapping[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMapping, setSelectedMapping] = useState<ResourceActionMapping | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchMappings = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getResourceActionMappings({
        limit,
        skip: (currentPage - 1) * limit,
        // Backend might support nested filtering or we just use general search if supported
        filter: debouncedSearchTerm ? { 
          'resourceId.name': { $regex: debouncedSearchTerm, $options: 'i' }
        } : undefined
      });
      
      if (response.success) {
        setMappings(response.data);
        setTotal(response.meta.total);
      }
    } catch (error) {
      console.error('Failed to fetch mappings:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, limit, debouncedSearchTerm]);

  useEffect(() => {
    fetchMappings();
  }, [fetchMappings]);

  // Reset page to 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  const handleDelete = async (id: number) => {
    setIsDeleting(id);
    try {
      await deleteResourceActionMapping(id);
      await fetchMappings();
    } catch (error) {
      console.error('Failed to delete mapping:', error);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleEdit = (mapping: ResourceActionMapping) => {
    setSelectedMapping(mapping);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedMapping(null);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <div className="h-6 w-1 bg-indigo-600 rounded-full"></div>
             <h1 className="text-xl font-black text-foreground tracking-tight uppercase">Capability Matrix</h1>
          </div>
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-70 ml-3">Structural resource-action reconciliation</p>
        </div>
        <Button onClick={handleAdd} className="flex items-center gap-3 shadow-xl shadow-indigo-100 dark:shadow-none uppercase tracking-widest text-[9px] font-black h-12 px-8 rounded-2xl bg-indigo-600 hover:bg-slate-900 transition-all duration-300 active:scale-95 group">
          <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
          Establish Mapping
        </Button>
      </div>

      {/* Toolbar */}
      <div className="mb-6 flex items-center justify-between gap-4 bg-muted/20 p-4 rounded-3xl border border-border/50 backdrop-blur-sm">
        <div className="relative flex-1 max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-indigo-600 transition-colors" />
          <Input 
            placeholder="Search by resource name..." 
            className="pl-12 h-12 border-border/40 bg-background shadow-sm rounded-2xl focus:ring-indigo-500/10 placeholder:uppercase placeholder:text-[8px] placeholder:font-black placeholder:tracking-widest"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground bg-background/50 px-5 py-3 rounded-2xl border border-border/30 shadow-inner">
             Active Configurations: <span className="text-indigo-600 dark:text-indigo-400 tabular-nums">{total}</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 flex flex-col bg-card rounded-[2rem] border border-border/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none overflow-hidden transition-all duration-500 min-h-[500px]">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-20 text-muted-foreground gap-6">
            <div className="relative">
              <div className="h-16 w-16 border-4 border-indigo-100 dark:border-indigo-900/30 rounded-3xl animate-pulse"></div>
              <Loader2 className="h-16 w-16 animate-spin text-indigo-600 absolute inset-0" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <p className="text-[11px] font-black tracking-[0.3em] uppercase animate-pulse text-indigo-600">Reconciling Matrix...</p>
              <div className="h-1 w-24 bg-indigo-100 dark:bg-indigo-900/30 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 animate-[loading_1.5s_ease-in-out_infinite] w-1/2"></div>
              </div>
            </div>
          </div>
        ) : mappings.length > 0 ? (
          <>
            <div className="flex-1 overflow-x-auto scrollbar-hide">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/30 border-b border-border/40">
                    <th className="px-8 py-6 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">Vector Entity</th>
                    <th className="px-8 py-6 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">Authorized Operations</th>
                    <th className="px-8 py-6 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">Engine Status</th>
                    <th className="px-8 py-6 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 text-right">Directives</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {mappings.map((mapping) => (
                    <tr key={mapping._id} className="hover:bg-indigo-50/20 dark:hover:bg-indigo-500/5 transition-all duration-300 group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-5">
                          <div className={cn(
                            "h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm border border-border/50",
                            mapping.status === 'active' 
                             ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white" 
                             : "bg-slate-50 text-slate-400 dark:bg-slate-900 dark:text-slate-600"
                          )}>
                            <Layers className="h-5 w-5" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-black text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors uppercase text-[10px] tracking-tight">{mapping.resourceId.name}</span>
                            <div className="flex items-center gap-1.5 opacity-60">
                              <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest font-mono">#{mapping.resourceId.key}</span>
                              <ChevronRight className="h-2 w-2 text-indigo-600" />
                              <span className="text-[8px] text-muted-foreground font-black uppercase tracking-widest">v.1.0</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-wrap gap-1.5 max-w-sm">
                          {mapping.actions.map((action) => (
                            <span 
                              key={action.id || action.id} 
                              className="px-2.5 py-1 rounded-lg bg-background border border-border/60 text-[8px] font-black uppercase tracking-wider text-muted-foreground shadow-sm group-hover:border-indigo-200 group-hover:text-indigo-600 transition-all"
                            >
                              {action.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={cn(
                          "inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-[0.2em] border transition-all duration-500",
                          mapping.status === 'active' 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 shadow-[0_2px_10px_rgba(16,185,129,0.1)]"
                            : "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
                        )}>
                          <div className={cn(
                            "h-1.5 w-1.5 rounded-full transition-all duration-500 shadow-sm", 
                            mapping.status === 'active' ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
                          )}></div>
                          {mapping.status}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center justify-end gap-3">
                          <button 
                            onClick={() => handleEdit(mapping)}
                            className="h-10 w-10 flex items-center justify-center text-muted-foreground hover:bg-indigo-600 hover:text-white rounded-xl transition-all duration-300 shadow-sm hover:shadow-indigo-200 dark:hover:shadow-none translate-y-1 opacity-0 group-hover:opacity-100 group-hover:translate-y-0"
                            title="Refactor Mapping"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <Popconfirm
                            title="Decommission Mapping"
                            description="This will permanently nullify the resource-action alignment. Proceed with extreme caution."
                            onConfirm={() => handleDelete(mapping.id)}
                          >
                            <button 
                              disabled={isDeleting === mapping.id}
                              className="h-10 w-10 flex items-center justify-center text-muted-foreground hover:bg-rose-600 hover:text-white rounded-xl transition-all duration-300 shadow-sm hover:shadow-rose-100 dark:hover:shadow-none translate-y-1 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 delay-75 disabled:opacity-50"
                              title="Delete Mapping"
                            >
                              {isDeleting === mapping.id ? (
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
            <div className="px-8 py-6 bg-muted/10 border-t border-border/40">
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
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-20 animate-in zoom-in-95 duration-700">
             <div className="h-32 w-32 bg-indigo-50/50 dark:bg-indigo-500/5 flex items-center justify-center rounded-[3rem] mb-8 border-2 border-dashed border-indigo-200 dark:border-indigo-500/20 relative group">
               <div className="absolute inset-0 bg-indigo-100 dark:bg-indigo-900/20 rounded-[3rem] scale-90 group-hover:scale-110 transition-transform duration-700 blur-2xl opacity-0 group-hover:opacity-100"></div>
               <ShieldCheck className="h-14 w-14 text-indigo-600/40 relative z-10" />
             </div>
             <p className="text-xl font-black text-foreground uppercase tracking-tight">Zero Alignment Detected</p>
             <p className="text-[8px] font-bold text-muted-foreground mt-3 uppercase tracking-[0.3em] max-w-[280px] leading-relaxed opacity-60">The authorization matrix is currently void. Establish your first resource-action protocol to initiate system control.</p>
             <Button onClick={handleAdd} variant="outline" className="mt-12 uppercase tracking-widest text-[8px] font-black h-12 px-8 rounded-2xl border-2 border-indigo-600/20 hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all duration-300">Register Foundation Protocol</Button>
          </div>
        )}
      </div>

      {/* CRUD Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedMapping ? "Matrix Refinement" : "Foundation Establishment"}
        // maxWidth="2xl"
      >
        <div className="p-1">
          <ResourceActionMappingForm 
            mapping={selectedMapping}
            onSuccess={() => {
              setIsModalOpen(false);
              fetchMappings();
            }}
            onCancel={() => setIsModalOpen(false)}
          />
        </div>
      </Modal>

      <style jsx global>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}

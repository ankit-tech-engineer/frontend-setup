'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Box, Search, Loader2 } from 'lucide-react';
import { getResources, deleteResource, Resource } from '@/core/api/acl/resources';
import { Button, Input, Pagination } from '@/components/ui';
import { Modal } from '@/components/ui/Modal';
import { Popconfirm } from '@/components/ui/Popconfirm';
import { ResourceForm } from './components/ResourceForm';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/core/hooks/useDebounce';

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchResources = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getResources({
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
        setResources(response.data);
        setTotal(response.meta.total);
      }
    } catch (error) {
      console.error('Failed to fetch resources:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, limit, debouncedSearchTerm]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  const handleDelete = async (resourceId: number) => {
    setIsDeleting(resourceId);
    try {
      await deleteResource(resourceId);
      await fetchResources();
    } catch (error) {
      console.error('Failed to delete resource:', error);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleEdit = (resource: Resource) => {
    setSelectedResource(resource);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedResource(null);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-2 duration-700">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">System Resources</h1>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-70 tracking-[0.2em]">Authority Discovery</p>
        </div>
        <Button 
          onClick={handleCreate} 
          className="flex items-center gap-2 rounded-xl shadow-lg shadow-indigo-100 dark:shadow-none bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all px-6 h-11 uppercase tracking-widest text-[10px] font-black"
        >
          <Plus className="h-4 w-4" />
          Add Resource
        </Button>
      </div>

      {/* Toolbar */}
      <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-6 bg-muted/30 p-4 rounded-2xl border border-border/50">
        <div className="relative w-full sm:max-w-md group">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-indigo-600 transition-colors" />
          <Input 
            placeholder="Search by name or technical key..." 
            className="pl-10 h-11 rounded-xl bg-background border-none shadow-sm focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4">
           <div className="flex flex-col items-end pr-4 border-r border-border/50">
             <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-60">Global Entities</span>
             <span className="text-lg font-black text-foreground tabular-nums tracking-tight">{total}</span>
           </div>
           <div className="flex flex-col items-end">
             <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-60">Status Active</span>
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
            <p className="text-[10px] font-black tracking-widest uppercase opacity-70 animate-pulse">Discovering entities...</p>
          </div>
        ) : resources.length > 0 ? (
          <>
            <div className="flex-1 overflow-x-auto scrollbar-hide">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/40 border-b border-border transition-colors">
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Entity Details</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Technical Key</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">State</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Last Sync</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 text-right">Options</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {resources.map((res) => (
                    <tr key={res._id} className="hover:bg-muted/10 transition-all duration-300 group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="h-11 w-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform shadow-sm">
                            <Box className="h-5 w-5" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-black text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors uppercase text-[11px] tracking-tight">{res.name}</span>
                            <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest opacity-60 mt-0.5">System Object</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-[11px] font-black font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded-lg">
                          {res.key}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.15em] border transition-all duration-300",
                          res.status === 'active' 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                            : "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
                        )}>
                          <div className={cn("h-1 w-1 rounded-full animate-pulse", res.status === 'active' ? "bg-emerald-500" : "bg-rose-500")}></div>
                          {res.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                        {new Date(res.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-3 transition-all duration-300">
                          <button 
                            onClick={() => handleEdit(res)}
                            className="h-9 w-9 flex items-center justify-center text-muted-foreground hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:text-indigo-600 rounded-xl transition-all border border-transparent hover:border-indigo-100/50"
                            title="Edit Technical Details"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <Popconfirm
                            title="Delete Resource"
                            description="Are you sure you want to delete this resource? This will remove all associated permission data."
                            onConfirm={() => handleDelete(res.id)}
                          >
                            <button 
                              disabled={isDeleting === res.id}
                              className="h-9 w-9 flex items-center justify-center text-muted-foreground hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 rounded-xl transition-all border border-transparent hover:border-red-100 dark:hover:border-red-900/30 disabled:opacity-30"
                              title="Permanently Remove"
                            >
                              {isDeleting === res.id ? (
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
          <div className="flex-1 flex flex-col items-center justify-center text-center p-20 max-w-md mx-auto">
             <div className="h-24 w-24 bg-muted/30 flex items-center justify-center rounded-[2.5rem] mb-8 border border-border rotate-12 hover:rotate-0 transition-transform duration-500">
               <Box className="h-10 w-10 text-muted-foreground/30" />
             </div>
             <p className="text-xl font-black text-foreground uppercase tracking-tight">Discovery Void</p>
             <p className="text-[10px] font-bold text-muted-foreground mt-3 uppercase tracking-[0.2em] leading-relaxed opacity-60">No system objects were synchronized. Add your application entities to initiate permission mapping.</p>
             <Button onClick={handleCreate} className="mt-8 px-8 py-6 rounded-2xl bg-indigo-600 text-white font-black hover:scale-105 transition-all shadow-xl shadow-indigo-100 dark:shadow-none uppercase tracking-widest text-[9px] h-11">Initialize Entity</Button>
          </div>
        )}
      </div>

      {/* CRUD Modal Section */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedResource ? "System Entity Parameters" : "Discovery New Entity"}
        className="max-w-md rounded-[2.5rem] shadow-2xl"
      >
        <ResourceForm 
          resource={selectedResource}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchResources();
          }}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

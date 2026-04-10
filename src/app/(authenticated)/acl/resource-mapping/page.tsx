'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  getResourceMappings, 
  deleteResourceMapping, 
  ResourceMapping 
} from '@/core/api/acl/resource-mapping';
import { Button, Input, Pagination } from '@/components/ui';
import { Modal } from '@/components/ui/Modal';
import { Popconfirm } from '@/components/ui/Popconfirm';
import { ResourceMappingForm } from './components/ResourceMappingForm';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/core/hooks/useDebounce';
import { 
  Plus, 
  Search, 
  Loader2, 
  Layers, 
  Trash2, 
  Edit, 
  Hash
} from 'lucide-react';

export default function ResourceMappingPage() {
  const [mappings, setMappings] = useState<ResourceMapping[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMapping, setSelectedMapping] = useState<ResourceMapping | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchMappings = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getResourceMappings({
        limit,
        skip: (currentPage - 1) * limit,
        filter: debouncedSearchQuery ? {
          $or: [
            { module_name: { $regex: debouncedSearchQuery, $options: 'i' } },
            { key: { $regex: debouncedSearchQuery, $options: 'i' } }
          ]
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
  }, [currentPage, limit, debouncedSearchQuery]);

  useEffect(() => {
    fetchMappings();
  }, [fetchMappings]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery]);

  const handleDelete = async (id: number) => {
    setIsDeleting(id);
    try {
      await deleteResourceMapping(id);
      await fetchMappings();
    } catch (error) {
      console.error('Failed to delete mapping:', error);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleEdit = (mapping: ResourceMapping) => {
    setSelectedMapping(mapping);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedMapping(null);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Resource Mapping</h1>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-70 tracking-[0.2em]">Module-Architecture Synchronization</p>
        </div>
        <Button onClick={handleAdd} className="flex items-center gap-2 shadow-lg shadow-indigo-100 dark:shadow-none uppercase tracking-widest text-[10px] font-black h-11 px-6 rounded-xl">
          <Plus className="h-4 w-4" />
          Establish Module
        </Button>
      </div>

      {/* Toolbar */}
      <div className="mb-6 flex items-center justify-between gap-4 bg-muted/30 p-4 rounded-2xl border border-border/50">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Filter module mappings..." 
            className="pl-10 h-10 border-none bg-background shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-background px-3 py-2 rounded-lg border border-border/50">
             Active Modules: <span className="text-indigo-600">{total}</span>
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
            <p className="text-[10px] font-black tracking-widest uppercase animate-pulse">Synchronizing architecture...</p>
          </div>
        ) : mappings.length > 0 ? (
          <>
            <div className="flex-1 overflow-x-auto scrollbar-hide">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/40 border-b border-border">
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Module Identification</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Entity Mapping</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Lifecycle Status</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 text-right">Options</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {mappings.map((mapping) => (
                    <tr key={mapping._id} className="hover:bg-muted/20 transition-all duration-200 group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform shadow-sm">
                             <Hash className="h-5 w-5" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-foreground group-hover:text-indigo-600 transition-colors uppercase text-[11px] tracking-tight">{mapping.module_name}</span>
                            <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest opacity-60 mt-0.5">{mapping.key}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                            {mapping.resources.map((res) => (
                               <span key={res.id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-muted/50 rounded-md text-[9px] font-black uppercase tracking-widest text-muted-foreground border border-border group-hover:border-indigo-200 dark:group-hover:border-indigo-900 transition-colors">
                                  {res.name}
                               </span>
                            ))}
                         </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.15em] border transition-all duration-300",
                          mapping.status === 'active' 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                            : "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
                        )}>
                          <div className={cn("h-1 w-1 rounded-full animate-pulse", mapping.status === 'active' ? "bg-emerald-500" : "bg-rose-500")}></div>
                          {mapping.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2 transition-opacity">
                          <button 
                            onClick={() => handleEdit(mapping)}
                            className="p-2 text-muted-foreground hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:text-indigo-600 rounded-lg transition-all"
                            title="Edit Mapping"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <Popconfirm
                            title="Delete Mapping"
                            description="Are you sure you want to delete this resource mapping?"
                            onConfirm={() => handleDelete(mapping.id)}
                          >
                            <button 
                              disabled={isDeleting === mapping.id}
                              className="p-2 text-muted-foreground hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 rounded-lg transition-all disabled:opacity-50"
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
               <Layers className="h-10 w-10 text-muted-foreground/40" />
             </div>
             <p className="text-lg font-black text-foreground uppercase tracking-tight">Mapping Database Void</p>
             <p className="text-[10px] font-bold text-muted-foreground mt-2 uppercase tracking-[0.2em] max-w-[240px] leading-relaxed opacity-60">No module architectures synchronized. Establish your primary pairings to manage resource discovery.</p>
             <Button onClick={handleAdd} variant="outline" className="mt-8 uppercase tracking-widest text-[9px] font-black h-10 px-6 rounded-xl border-dashed">Establish First Infrastructure</Button>
          </div>
        )}
      </div>

      {/* CRUD Modal Section */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedMapping ? "Edit Module Mapping" : "Create New Module Mapping"}
      >
        <ResourceMappingForm 
          mapping={selectedMapping}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchMappings();
          }}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

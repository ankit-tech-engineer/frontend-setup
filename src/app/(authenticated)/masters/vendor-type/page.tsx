'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, LayoutGrid, Search, Loader2, Tag } from 'lucide-react';
import { getVendorTypes, deleteVendorType, VendorType } from '@/core/api/vendor/vendor-types';
import { Button, Input, Pagination } from '@/components/ui';
import { Modal } from '@/components/ui/Modal';
import { Popconfirm } from '@/components/ui/Popconfirm';
import { VendorTypeForm } from './components/VendorTypeForm';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/core/hooks/useDebounce';

export default function VendorTypePage() {
  const [vendorTypes, setVendorTypes] = useState<VendorType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVendorType, setSelectedVendorType] = useState<VendorType | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchVendorTypes = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getVendorTypes({
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
        setVendorTypes(response.data);
        setTotal(response.meta.total);
      }
    } catch (error) {
      console.error('Failed to fetch vendor types:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, limit, debouncedSearchTerm]);

  useEffect(() => {
    fetchVendorTypes();
  }, [fetchVendorTypes]);

  // Reset page to 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  const handleDelete = async (vendorTypeId: number) => {
    setIsDeleting(vendorTypeId);
    try {
      await deleteVendorType(vendorTypeId);
      await fetchVendorTypes();
    } catch (error) {
      console.error('Failed to delete vendor type:', error);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleEdit = (vendorType: VendorType) => {
    setSelectedVendorType(vendorType);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedVendorType(null);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Vendor Categories</h1>
          <p className="text-[10px] font-bold text-muted-foreground tracking-widest mt-1 opacity-70">Define and manage business categories</p>
        </div>
        <Button onClick={handleAdd} className="flex items-center gap-2 shadow-lg shadow-indigo-100 dark:shadow-none tracking-widest text-[10px] font-black h-11 px-6 rounded-xl">
          <Plus className="h-4 w-4" />
          Add Vendor Type
        </Button>
      </div>

      {/* Toolbar */}
      <div className="mb-6 flex items-center justify-between gap-4 bg-muted/20 dark:bg-muted/10 p-4 rounded-2xl border border-border/50 backdrop-blur-sm">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search categories..." 
            className="pl-10 h-10 border-none bg-background shadow-sm rounded-xl focus-visible:ring-1 focus-visible:ring-indigo-200 transition-all font-medium text-[11px] tracking-tight"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[10px] font-black tracking-widest text-muted-foreground bg-background px-4 py-2 rounded-xl border border-border/50 shadow-sm">
             Volume: <span className="text-indigo-600 dark:text-indigo-400">{total}</span>
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
            <p className="text-[10px] font-black tracking-widest animate-pulse">Syncing catalog...</p>
          </div>
        ) : vendorTypes.length > 0 ? (
          <>
            <div className="flex-1 overflow-x-auto scrollbar-hide">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/40 border-b border-border">
                    <th className="px-6 py-5 text-[10px] font-black tracking-widest text-muted-foreground/80">Category Identity</th>
                    <th className="px-6 py-5 text-[10px] font-black tracking-widest text-muted-foreground/80">System Handle</th>
                    <th className="px-6 py-5 text-[10px] font-black tracking-widest text-muted-foreground/80">Current State</th>
                    <th className="px-6 py-5 text-[10px] font-black tracking-widest text-muted-foreground/80">Integration Date</th>
                    <th className="px-6 py-5 text-[10px] font-black tracking-widest text-muted-foreground/80 text-right">Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {vendorTypes.map((vt) => (
                    <tr key={vt._id} className="hover:bg-muted/20 transition-all duration-200 group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform shadow-sm">
                            <Tag className="h-5 w-5" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-[11px] tracking-tight">{vt.name}</span>
                            <span className="text-[9px] text-muted-foreground font-bold tracking-widest opacity-60">Master Classification</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-bold font-mono text-slate-500 dark:text-slate-400 tracking-wider bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded-lg border border-slate-200/50 dark:border-slate-800">
                          {vt.key}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black tracking-[0.15em] border transition-all duration-300",
                          vt.status === 'active' 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                            : "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
                        )}>
                          <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse", vt.status === 'active' ? "bg-emerald-500" : "bg-rose-500")}></div>
                          {vt.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[10px] font-bold text-muted-foreground tracking-widest">
                        {new Date(vt.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleEdit(vt)}
                            className="p-2 text-muted-foreground hover:bg-white dark:hover:bg-indigo-950/30 hover:text-indigo-600 hover:shadow-sm rounded-xl transition-all"
                            title="Refine Record"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <Popconfirm
                            title="Archive Identity"
                            description="Are you sure you want to remove this vendor category? Functional dependencies may be compromised."
                            onConfirm={() => handleDelete(vt.id)}
                          >
                            <button 
                              disabled={isDeleting === vt.id}
                              className="p-2 text-muted-foreground hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 rounded-xl transition-all disabled:opacity-50"
                              title="Delete Record"
                            >
                              {isDeleting === vt.id ? (
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
             <div className="h-24 w-24 bg-muted/20 flex items-center justify-center rounded-[2rem] border border-border/50 shadow-inner">
               <LayoutGrid className="h-10 w-10 text-muted-foreground/30" />
             </div>
             <div className="space-y-2">
               <p className="text-xl font-bold text-foreground tracking-tight">No categories defined</p>
               <p className="text-[10px] font-bold text-muted-foreground tracking-[0.2em] max-w-[280px] leading-relaxed mx-auto opacity-70">The catalog is currently empty. Initiate a new classification to populate the master table.</p>
             </div>
             <Button onClick={handleAdd} variant="outline" className="mt-4 tracking-widest text-[9px] font-black h-11 px-8 rounded-xl border-dashed hover:border-solid transition-all transform hover:-translate-y-1">Establish Primary Category</Button>
          </div>
        )}
      </div>

      {/* CRUD Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedVendorType ? "Refine Classification" : "Establish New Classification"}
      >
        <VendorTypeForm 
          vendorType={selectedVendorType}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchVendorTypes();
          }}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

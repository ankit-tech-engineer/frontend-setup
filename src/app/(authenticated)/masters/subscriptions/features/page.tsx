'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Sparkles, Search, Loader2, Zap, ShieldCheck, Box } from 'lucide-react';
import { getFeatures, deleteFeature, Feature } from '@/core/api/subscriptions/features';
import { Button, Input, Pagination } from '@/components/ui';
import { Modal } from '@/components/ui/Modal';
import { Popconfirm } from '@/components/ui/Popconfirm';
import { FeatureForm } from './components/FeatureForm';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/core/hooks/useDebounce';

export default function SubscriptionFeaturesPage() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchFeatures = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getFeatures({
        limit,
        skip: (currentPage - 1) * limit,
        filter: debouncedSearchTerm ? { 
          $or: [
            { name: { $regex: debouncedSearchTerm, $options: 'i' } },
            { code: { $regex: debouncedSearchTerm, $options: 'i' } }
          ]
        } : undefined
      });
      
      if (response.success) {
        setFeatures(response.data);
        setTotal(response.meta.total);
      }
    } catch (error) {
      console.error('Failed to fetch features:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, limit, debouncedSearchTerm]);

  useEffect(() => {
    fetchFeatures();
  }, [fetchFeatures]);

  // Reset page to 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  const handleDelete = async (id: number) => {
    setIsDeleting(id);
    try {
      await deleteFeature(id);
      await fetchFeatures();
    } catch (error) {
      console.error('Failed to delete feature:', error);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleEdit = (feature: Feature) => {
    setSelectedFeature(feature);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedFeature(null);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-700">
      {/* SEO Title (for screen readers/SEO analysis) */}
      <title>Subscription Features | Masters</title>
      <meta name="description" content="Manage and define subscription features for plan configuration." />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4 group">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-xl shadow-indigo-200 dark:shadow-none group-hover:rotate-6 transition-transform duration-500">
            <Zap className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
              Subscription Features
              <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-[10px] font-black tracking-widest uppercase border border-indigo-100 dark:border-indigo-500/20">Alpha</span>
            </h1>
            <p className="text-[10px] font-bold text-muted-foreground tracking-widest mt-1 opacity-70 uppercase">Orchestrate your product evolution catalog</p>
          </div>
        </div>
        <Button 
            onClick={handleAdd} 
            className="flex items-center gap-2 shadow-xl shadow-indigo-100 dark:shadow-none tracking-widest text-[10px] font-black h-12 px-8 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 transition-all transform hover:-translate-y-1 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Add Feature
        </Button>
      </div>

      {/* Toolbar */}
      <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/40 dark:bg-card/40 p-5 rounded-3xl border border-white/50 dark:border-border/50 backdrop-blur-xl shadow-sm">
        <div className="relative flex-1 w-full max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search core capabilities..." 
            className="pl-11 h-11 border-none bg-muted/30 dark:bg-muted/10 shadow-inner rounded-2xl focus-visible:ring-2 focus-visible:ring-indigo-500/20 transition-all font-bold text-[11px] tracking-tight placeholder:opacity-50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <div className="flex items-center gap-2 text-[10px] font-black tracking-widest text-muted-foreground bg-white/50 dark:bg-background/50 px-5 py-2.5 rounded-2xl border border-border/50 shadow-sm whitespace-nowrap">
             Inventory: <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">{total} Items</span>
          </div>
          <div className="h-8 w-px bg-border/40 mx-2 hidden sm:block"></div>
          <div className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50/50 dark:bg-emerald-500/10 rounded-2xl border border-emerald-100/50 dark:border-emerald-500/20">
             <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
             <span className="text-[10px] font-black tracking-widest text-emerald-700 dark:text-emerald-400 uppercase">Live Sync</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 flex flex-col bg-card/60 dark:bg-card/40 rounded-3xl border border-white/60 dark:border-border/60 shadow-xl overflow-hidden transition-all duration-300 min-h-[500px] backdrop-blur-sm relative">
        {/* Subtle Decorative Gradient */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/5 rounded-full -ml-32 -mb-32 blur-3xl pointer-events-none"></div>

        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-20 text-muted-foreground gap-5">
            <div className="relative">
              <div className="h-14 w-14 border-4 border-indigo-100 dark:border-indigo-950/40 rounded-3xl animate-pulse"></div>
              <Loader2 className="absolute inset-0 m-auto h-8 w-8 animate-spin text-indigo-600" />
            </div>
            <div className="text-center">
              <p className="text-[11px] font-black tracking-[0.2em] uppercase text-indigo-600 animate-pulse">Synchronizing Reality...</p>
              <p className="text-[9px] font-bold text-muted-foreground mt-2 opacity-60">Allocating resources and mapping identities</p>
            </div>
          </div>
        ) : features.length > 0 ? (
          <>
            <div className="flex-1 overflow-x-auto scrollbar-hide">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/30 dark:bg-muted/10 border-b border-border/50">
                    <th className="px-8 py-6 text-[10px] font-black tracking-widest text-muted-foreground/60 uppercase">Domain Identity</th>
                    <th className="px-8 py-6 text-[10px] font-black tracking-widest text-muted-foreground/60 uppercase">System Key</th>
                    <th className="px-8 py-6 text-[10px] font-black tracking-widest text-muted-foreground/60 uppercase">Status</th>
                    <th className="px-8 py-6 text-[10px] font-black tracking-widest text-muted-foreground/60 uppercase">Integration</th>
                    <th className="px-8 py-6 text-[10px] font-black tracking-widest text-muted-foreground/60 uppercase text-right">Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {features.map((feat) => (
                    <tr key={feat._id} className="hover:bg-white/40 dark:hover:bg-muted/10 transition-all duration-300 group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-5">
                          <div className="h-12 w-12 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-500 shadow-sm border border-indigo-100/50 dark:border-indigo-500/10">
                            <Box className="h-5 w-5" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-black text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-[12px] tracking-tight">{feat.name}</span>
                            <span className="text-[10px] text-muted-foreground font-bold tracking-tight opacity-70 line-clamp-1 max-w-[240px] mt-0.5">{feat.description}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-[10px] font-black font-mono text-indigo-600/70 dark:text-indigo-400/70 tracking-widest bg-indigo-50/30 dark:bg-indigo-950/20 px-3 py-1.5 rounded-xl border border-indigo-100/50 dark:border-indigo-500/10 uppercase">
                          {feat.code}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <span className={cn(
                          "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[9px] font-black tracking-[0.18em] border transition-all duration-500 uppercase",
                          feat.status === 'active' 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 shadow-[0_0_15px_-5px_rgba(16,185,129,0.3)]"
                            : "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20"
                        )}>
                          <div className={cn("h-1.5 w-1.5 rounded-full", feat.status === 'active' ? "bg-emerald-500 animate-pulse" : "bg-slate-400")}></div>
                          {feat.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 flex flex-col">
                        <span className="text-[10px] font-black text-foreground tracking-tight">{new Date(feat.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Deployment Date</span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center justify-end gap-3">
                          <button 
                            onClick={() => handleEdit(feat)}
                            className="p-2.5 text-muted-foreground hover:bg-white dark:hover:bg-indigo-950/30 hover:text-indigo-600 dark:hover:text-indigo-400 hover:shadow-xl hover:shadow-indigo-100 dark:hover:shadow-none rounded-2xl transition-all duration-300"
                            title="Edit Parameters"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <Popconfirm
                            title="Decommission Identity"
                            description="Are you sure you want to remove this capability? Plans utilizing this feature will exhibit unstable behavior."
                            onConfirm={() => handleDelete(feat.id)}
                          >
                            <button 
                              disabled={isDeleting === feat.id}
                              className="p-2.5 text-muted-foreground hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 dark:hover:text-rose-400 hover:shadow-xl hover:shadow-rose-100 dark:hover:shadow-none rounded-2xl transition-all duration-300 disabled:opacity-50"
                              title="Delete Record"
                            >
                              {isDeleting === feat.id ? (
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
            <div className="border-t border-border/30 bg-muted/10 dark:bg-transparent">
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
          <div className="flex-1 flex flex-col items-center justify-center text-center p-20 gap-8">
             <div className="relative">
                <div className="h-32 w-32 bg-indigo-50/50 dark:bg-indigo-950/10 flex items-center justify-center rounded-[3rem] border border-indigo-100/50 dark:border-indigo-500/10 shadow-inner group-hover:scale-105 transition-transform duration-700">
                    <Sparkles className="h-14 w-14 text-indigo-500/30" />
                </div>
                <div className="absolute -top-4 -right-4 h-12 w-12 bg-white dark:bg-card rounded-2xl flex items-center justify-center shadow-lg border border-border/30 animate-bounce">
                    <Zap className="h-5 w-5 text-indigo-500" />
                </div>
             </div>
             <div className="space-y-3">
               <p className="text-2xl font-black text-foreground tracking-tight">Void Detected.</p>
               <p className="text-[11px] font-bold text-muted-foreground tracking-[0.1em] max-w-[320px] leading-relaxed mx-auto opacity-70">The product catalog is currently theoretical. Initiate an identity creation to manifest features in the ecosystem.</p>
             </div>
             <Button 
                onClick={handleAdd} 
                variant="outline" 
                className="mt-4 tracking-widest text-[10px] font-black h-12 px-10 rounded-2xl border-dashed border-2 hover:border-solid hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition-all transform hover:-translate-y-2"
            >
                Initialize Primary Capability
            </Button>
          </div>
        )}
      </div>

      {/* CRUD Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedFeature ? "Refine Product Spec" : "Establish New Capability"}
      >
        <div className="p-1">
            <FeatureForm 
            feature={selectedFeature}
            onSuccess={() => {
                setIsModalOpen(false);
                fetchFeatures();
            }}
            onCancel={() => setIsModalOpen(false)}
            />
        </div>
      </Modal>
    </div>
  );
}

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Search, Loader2, Zap, ShieldCheck, Box, Target, Layers, Hourglass, Users } from 'lucide-react';
import { getPlans, deletePlan, Plan } from '@/core/api/subscriptions/plans';
import { Button, Input, Pagination } from '@/components/ui';
import { Modal } from '@/components/ui/Modal';
import { Popconfirm } from '@/components/ui/Popconfirm';
import { PlanForm } from './components/PlanForm';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/core/hooks/useDebounce';

export default function SubscriptionPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchPlans = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getPlans({
        limit,
        skip: (currentPage - 1) * limit,
        filter: debouncedSearchTerm ? { 
          $or: [
            { name: { $regex: debouncedSearchTerm, $options: 'i' } }
          ]
        } : undefined
      });
      
      if (response.success) {
        setPlans(response.data);
        setTotal(response.meta.total);
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, limit, debouncedSearchTerm]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  // Reset page to 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  const handleDelete = async (id: number) => {
    setIsDeleting(id);
    try {
      await deletePlan(id);
      await fetchPlans();
    } catch (error) {
      console.error('Failed to delete plan:', error);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleEdit = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedPlan(null);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-700">
      {/* SEO Title */}
      <title>Subscription Plans | Masters</title>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4 group">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white shadow-xl shadow-fuchsia-100 dark:shadow-none group-hover:scale-110 transition-transform duration-500">
            <Layers className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
              Subscription Plans
              <span className="px-2 py-0.5 rounded-full bg-fuchsia-50 dark:bg-fuchsia-950/40 text-fuchsia-600 dark:text-fuchsia-400 text-[10px] font-black tracking-widest uppercase border border-fuchsia-100 dark:border-fuchsia-500/20">Production</span>
            </h1>
            <p className="text-[10px] font-bold text-muted-foreground tracking-widest mt-1 opacity-70 uppercase">Configure product bundles and pricing tiers</p>
          </div>
        </div>
        <Button 
            onClick={handleAdd} 
            className="flex items-center gap-2 shadow-xl shadow-fuchsia-100 dark:shadow-none tracking-widest text-[10px] font-black h-12 px-8 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-700 hover:to-violet-700 transition-all transform hover:-translate-y-1 active:scale-95 text-white"
        >
          <Plus className="h-4 w-4" />
          Draft New Plan
        </Button>
      </div>

      {/* Toolbar */}
      <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/40 dark:bg-card/40 p-5 rounded-3xl border border-white/50 dark:border-border/50 backdrop-blur-xl shadow-sm">
        <div className="relative flex-1 w-full max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search pricing models..." 
            className="pl-11 h-11 border-none bg-muted/30 dark:bg-muted/10 shadow-inner rounded-2xl focus-visible:ring-2 focus-visible:ring-fuchsia-500/20 transition-all font-bold text-[11px] tracking-tight"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <div className="flex items-center gap-2 text-[10px] font-black tracking-widest text-muted-foreground bg-white/50 dark:bg-background/50 px-5 py-2.5 rounded-2xl border border-border/50 shadow-sm whitespace-nowrap">
             Catalog Size: <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 to-violet-600">{total} Profiles</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 flex flex-col bg-card/60 dark:bg-card/40 rounded-3xl border border-white/60 dark:border-border/60 shadow-xl overflow-hidden transition-all duration-300 min-h-[500px] backdrop-blur-sm relative">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-20 text-muted-foreground gap-5">
            <div className="relative">
              <Loader2 className="h-10 w-10 animate-spin text-fuchsia-600" />
            </div>
            <p className="text-[11px] font-black tracking-[0.2em] uppercase text-fuchsia-600 animate-pulse">Syncing Plans...</p>
          </div>
        ) : plans.length > 0 ? (
          <>
            <div className="flex-1 overflow-x-auto scrollbar-hide">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/30 dark:bg-muted/10 border-b border-border/50">
                    <th className="px-8 py-6 text-[10px] font-black tracking-widest text-muted-foreground/60 uppercase">Tier Definition</th>
                    <th className="px-8 py-6 text-[10px] font-black tracking-widest text-muted-foreground/60 uppercase">Metrics</th>
                    <th className="px-8 py-6 text-[10px] font-black tracking-widest text-muted-foreground/60 uppercase">Payload</th>
                    <th className="px-8 py-6 text-[10px] font-black tracking-widest text-muted-foreground/60 uppercase">State</th>
                    <th className="px-8 py-6 text-[10px] font-black tracking-widest text-muted-foreground/60 uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30 text-[11px]">
                  {plans.map((p) => (
                    <tr key={p._id} className="hover:bg-white/40 dark:hover:bg-muted/10 transition-all duration-300 group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-5">
                          <div className={cn(
                            "h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm border",
                            p.isTrial 
                                ? "bg-amber-50/50 dark:bg-amber-950/20 text-amber-600 border-amber-100 dark:border-amber-900/30" 
                                : "bg-fuchsia-50/50 dark:bg-fuchsia-950/20 text-fuchsia-600 border-fuchsia-100 dark:border-fuchsia-900/30"
                          )}>
                            {p.isTrial ? <Target className="h-5 w-5" /> : <Box className="h-5 w-5" />}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-black text-foreground group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-400 transition-colors tracking-tight">{p.name}</span>
                            <span className="text-[9px] text-muted-foreground font-bold tracking-widest uppercase opacity-60 mt-0.5">{p.isTrial ? 'Sandbox Trial' : 'Commercial Tier'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2">
                                <Zap className="h-3 w-3 text-fuchsia-500" />
                                <span className="font-black text-foreground">${p.price.toFixed(2)}</span>
                                <span className="text-[8px] text-muted-foreground uppercase tracking-tighter">/ Lifecycle</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Hourglass className="h-3 w-3 text-slate-400" />
                                <span className="font-bold text-muted-foreground">{p.validityDays} Days</span>
                            </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-1.5 flex-wrap max-w-[180px]">
                                <Users className="h-3 w-3 text-indigo-500" />
                                <span className="font-bold text-foreground">{p.limits?.MAX_USERS || 0}</span>
                                <span className="text-[9px] text-muted-foreground font-bold tracking-tight uppercase">User Limit</span>
                            </div>
                            <div className="flex items-center gap-1 flex-wrap max-w-[200px]">
                                {p.features.slice(0, 2).map((feat: any) => (
                                    <span key={feat.id || feat} className="px-1.5 py-0.5 rounded-md bg-muted/50 text-[8px] font-black text-muted-foreground border border-border/50 uppercase">
                                        {typeof feat === 'object' ? feat.code : feat}
                                    </span>
                                ))}
                                {p.features.length > 2 && (
                                    <span className="text-[8px] font-black text-indigo-600 dark:text-indigo-400">+{p.features.length - 2} More</span>
                                )}
                            </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black tracking-[0.18em] border transition-all duration-300 uppercase",
                          p.status === 'active' 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                            : "bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20"
                        )}>
                          <div className={cn("h-1 w-1 rounded-full", p.status === 'active' ? "bg-emerald-500 animate-pulse" : "bg-slate-400")}></div>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleEdit(p)}
                            className="p-2.5 text-muted-foreground hover:bg-white dark:hover:bg-fuchsia-950/30 hover:text-fuchsia-600 dark:hover:text-fuchsia-400 hover:shadow-xl rounded-2xl transition-all duration-300"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <Popconfirm
                            title="Decommission Plan"
                            description="Removing this profile may impact existing subscriptions. Proceed with caution."
                            onConfirm={() => handleDelete(p.id)}
                          >
                            <button 
                              disabled={isDeleting === p.id}
                              className="p-2.5 text-muted-foreground hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 dark:hover:text-rose-400 rounded-2xl transition-all duration-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </Popconfirm>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
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
             <div className="h-32 w-32 bg-muted/20 flex items-center justify-center rounded-[3rem] border border-border/50 shadow-inner group-hover:scale-110 transition-transform duration-700">
                <Target className="h-14 w-14 text-muted-foreground/30" />
             </div>
             <div className="space-y-3">
               <p className="text-xl font-black text-foreground tracking-tight">No pricing profiles defined.</p>
               <p className="text-[11px] font-bold text-muted-foreground tracking-widest max-w-[320px] leading-relaxed mx-auto opacity-70 uppercase">Establishing a plan is the first step toward commercial activation.</p>
             </div>
             <Button onClick={handleAdd} variant="outline" className="mt-4 tracking-widest text-[10px] font-black h-12 px-10 rounded-2xl border-dashed border-2 hover:border-solid hover:bg-fuchsia-50/50 dark:hover:bg-fuchsia-950/20 transition-all transform hover:-translate-y-2">Initialize Global Tier</Button>
          </div>
        )}
      </div>

      {/* CRUD Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedPlan ? "Refine Pricing Profile" : "Establish Subscription Tier"}
      >
        <PlanForm 
          plan={selectedPlan}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchPlans();
          }}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

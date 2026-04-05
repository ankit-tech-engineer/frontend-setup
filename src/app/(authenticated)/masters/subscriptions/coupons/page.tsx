'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Search, Loader2, Ticket, Percent, Banknote, Calendar, TrendingUp, Info } from 'lucide-react';
import { getCoupons, deleteCoupon, Coupon } from '@/core/api/subscriptions/coupons';
import { Button, Input, Pagination } from '@/components/ui';
import { Modal } from '@/components/ui/Modal';
import { Popconfirm } from '@/components/ui/Popconfirm';
import { CouponForm } from './components/CouponForm';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/core/hooks/useDebounce';

export default function SubscriptionCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchCoupons = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getCoupons({
        limit,
        skip: (currentPage - 1) * limit,
        filter: debouncedSearchTerm ? { 
          $or: [
            { code: { $regex: debouncedSearchTerm, $options: 'i' } }
          ]
        } : undefined
      });
      
      if (response.success) {
        setCoupons(response.data);
        setTotal(response.meta.total);
      }
    } catch (error) {
      console.error('Failed to fetch coupons:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, limit, debouncedSearchTerm]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  // Reset page to 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  const handleDelete = async (id: number) => {
    setIsDeleting(id);
    try {
      await deleteCoupon(id);
      await fetchCoupons();
    } catch (error) {
      console.error('Failed to delete coupon:', error);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedCoupon(null);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-700">
      {/* SEO Title */}
      <title>Subscription Coupons | Masters</title>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4 group">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-emerald-100 dark:shadow-none transition-all duration-500 group-hover:shadow-emerald-200/50">
            <Ticket className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
              Marketing Vouchers
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[10px] font-black tracking-widest uppercase border border-emerald-100 dark:border-emerald-500/20">Active</span>
            </h1>
            <p className="text-[10px] font-bold text-muted-foreground tracking-widest mt-1 opacity-70 uppercase">Incentivize growth through strategic discounts</p>
          </div>
        </div>
        <Button 
            onClick={handleAdd} 
            className="flex items-center gap-2 shadow-xl shadow-emerald-100 dark:shadow-none tracking-widest text-[10px] font-black h-12 px-8 rounded-2xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 transition-all transform hover:-translate-y-1 active:scale-95 text-white"
        >
          <Plus className="h-4 w-4" />
          Issue Voucher
        </Button>
      </div>

      {/* Toolbar */}
      <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/40 dark:bg-card/40 p-5 rounded-3xl border border-white/50 dark:border-border/50 backdrop-blur-xl shadow-sm">
        <div className="relative flex-1 w-full max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search redemption codes..." 
            className="pl-11 h-11 border-none bg-muted/30 dark:bg-muted/10 shadow-inner rounded-2xl focus-visible:ring-2 focus-visible:ring-emerald-500/20 transition-all font-bold text-[11px] tracking-tight uppercase"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <div className="flex items-center gap-2 text-[10px] font-black tracking-widest text-muted-foreground bg-white/50 dark:bg-background/50 px-5 py-2.5 rounded-2xl border border-border/50 shadow-sm whitespace-nowrap uppercase">
             Circulation: <span className="text-emerald-600 dark:text-emerald-400">{total} Codes</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 flex flex-col bg-card/60 dark:bg-card/40 rounded-3xl border border-white/60 dark:border-border/60 shadow-xl overflow-hidden transition-all duration-300 min-h-[500px] backdrop-blur-sm relative">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-20 text-muted-foreground gap-5">
            <div className="relative">
              <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
            </div>
            <p className="text-[11px] font-black tracking-[0.2em] uppercase text-emerald-600 animate-pulse">Auditing Vouchers...</p>
          </div>
        ) : coupons.length > 0 ? (
          <>
            <div className="flex-1 overflow-x-auto scrollbar-hide">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/30 dark:bg-muted/10 border-b border-border/50">
                    <th className="px-8 py-6 text-[10px] font-black tracking-widest text-muted-foreground/60 uppercase">Code Identity</th>
                    <th className="px-8 py-6 text-[10px] font-black tracking-widest text-muted-foreground/60 uppercase">Valuation</th>
                    <th className="px-8 py-6 text-[10px] font-black tracking-widest text-muted-foreground/60 uppercase">Lifecycle</th>
                    <th className="px-8 py-6 text-[10px] font-black tracking-widest text-muted-foreground/60 uppercase">Consumption</th>
                    <th className="px-8 py-6 text-[10px] font-black tracking-widest text-muted-foreground/60 uppercase text-right">Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30 text-[11px]">
                  {coupons.map((c) => {
                    const usagePercent = c.usageLimit > 0 ? (c.usedCount / c.usageLimit) * 100 : 0;
                    return (
                        <tr key={c._id} className="hover:bg-white/40 dark:hover:bg-muted/10 transition-all duration-300 group">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-5">
                              <div className="h-12 w-12 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-500 shadow-sm border border-emerald-100/50 dark:border-emerald-500/10">
                                <Ticket className="h-5 w-5" />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-black text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors tracking-widest uppercase">{c.code}</span>
                                <span className={cn(
                                    "text-[9px] font-black tracking-widest uppercase mt-0.5",
                                    c.status === 'active' ? "text-emerald-600/60" : "text-muted-foreground/60"
                                )}>Redeemable</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex flex-col gap-1.5">
                                <div className="flex items-center gap-2">
                                    {c.type === 'PERCENTAGE' ? <Percent className="h-3 w-3 text-emerald-500" /> : <Banknote className="h-3 w-3 text-indigo-500" />}
                                    <span className="font-black text-foreground">
                                        {c.type === 'PERCENTAGE' ? `${c.value}%` : `$${c.value}`}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="h-3 w-3 text-slate-400" />
                                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Min Order: ${c.minPurchase}</span>
                                </div>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex flex-col gap-1.5">
                                <div className="flex items-center gap-2 text-foreground font-black">
                                    <Calendar className="h-3 w-3 text-rose-500" />
                                    <span>{new Date(c.expiryDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                </div>
                                <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Expiration Threshold</span>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex flex-col gap-2 w-40">
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-black text-foreground">{c.usedCount} / {c.usageLimit || '∞'}</span>
                                    <span className="text-[9px] font-bold text-muted-foreground uppercase">{Math.round(usagePercent)}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden border border-border/30">
                                    <div 
                                        className={cn(
                                            "h-full rounded-full transition-all duration-1000",
                                            usagePercent > 90 ? "bg-rose-500" : usagePercent > 50 ? "bg-amber-500" : "bg-emerald-500"
                                        )} 
                                        style={{ width: `${Math.min(usagePercent, 100)}%` }}
                                    />
                                </div>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => handleEdit(c)}
                                className="p-2.5 text-muted-foreground hover:bg-white dark:hover:bg-emerald-950/30 hover:text-emerald-600 dark:hover:text-emerald-400 hover:shadow-xl rounded-2xl transition-all duration-300"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <Popconfirm
                                title="Nullify Issuance"
                                description="Are you sure you want to deactivate this voucher code? Redemption protocols will be terminated."
                                onConfirm={() => handleDelete(c.id)}
                              >
                                <button 
                                  disabled={isDeleting === c.id}
                                  className="p-2.5 text-muted-foreground hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 dark:hover:text-rose-400 rounded-2xl transition-all duration-300"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </Popconfirm>
                            </div>
                          </td>
                        </tr>
                    );
                  })}
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
             <div className="h-32 w-32 bg-muted/20 flex items-center justify-center rounded-[3rem] border border-border/50 shadow-inner group-hover:scale-110 transition-transform duration-700">
                <Ticket className="h-14 w-14 text-muted-foreground/30" />
             </div>
             <div className="space-y-3">
               <p className="text-xl font-black text-foreground tracking-tight">Voucher cache is empty.</p>
               <p className="text-[11px] font-bold text-muted-foreground tracking-widest max-w-[320px] leading-relaxed mx-auto opacity-70 uppercase">Initiate a marketing campaign to populate redemption protocols.</p>
             </div>
             <Button onClick={handleAdd} variant="outline" className="mt-4 tracking-widest text-[10px] font-black h-12 px-10 rounded-2xl border-dashed border-2 hover:border-solid hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-all transform hover:-translate-y-2">Establish Prime Issuance</Button>
          </div>
        )}
      </div>

      {/* CRUD Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedCoupon ? "Refine Issuance Parameters" : "Initialize Redemption Code"}
      >
        <CouponForm 
          coupon={selectedCoupon}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchCoupons();
          }}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

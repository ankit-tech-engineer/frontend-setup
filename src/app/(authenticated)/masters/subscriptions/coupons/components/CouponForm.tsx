'use client';

import React, { useState, useEffect } from 'react';
import { Button, Input, Label } from '@/components/ui';
import { createCoupon, updateCoupon, Coupon } from '@/core/api/subscriptions/coupons';
import { cn } from '@/lib/utils';
import { AlertCircle, Ticket, Calendar, Percent, Banknote, RefreshCw } from 'lucide-react';

interface CouponFormProps {
  coupon?: Coupon | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const CouponForm: React.FC<CouponFormProps> = ({ coupon, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    code: '',
    type: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
    value: 0,
    minPurchase: 0,
    maxDiscount: 0,
    expiryDate: '',
    usageLimit: 0,
    status: 'active' as 'active' | 'inactive'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (coupon) {
      setFormData({
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        minPurchase: coupon.minPurchase,
        maxDiscount: coupon.maxDiscount,
        expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split('T')[0] : '',
        usageLimit: coupon.usageLimit,
        status: coupon.status
      });
    }
  }, [coupon]);

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, code }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        expiryDate: formData.expiryDate ? `${formData.expiryDate}T23:59:59Z` : undefined
      };

      if (coupon) {
        await updateCoupon(coupon.id, payload);
      } else {
        await createCoupon(payload);
      }
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Protocol failure. Verify coupon parameters.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type } = e.target;
    setFormData(prev => ({ 
        ...prev, 
        [id]: type === 'number' ? parseFloat(value) || 0 : value 
    }));
  };

  const toggleType = (type: 'PERCENTAGE' | 'FIXED') => {
    setFormData(prev => ({ ...prev, type }));
  };

  const toggleStatus = () => {
    setFormData(prev => ({
      ...prev,
      status: prev.status === 'active' ? 'inactive' : 'active'
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-2 max-h-[75vh] overflow-y-auto px-1 scrollbar-hide">
      {/* Code Generation Section */}
      <div className="space-y-1.5">
        <Label htmlFor="code" className="text-[10px] font-black tracking-widest text-muted-foreground ml-1 uppercase">
          Voucher Identity
        </Label>
        <div className="flex gap-2">
            <Input 
                id="code"
                value={formData.code} 
                onChange={handleChange} 
                placeholder="e.g. SUMMER2026"
                className="h-10 rounded-xl border-border/50 bg-muted/20 focus:bg-background transition-all text-[11px] font-black uppercase tracking-widest flex-1"
                required 
                autoFocus
            />
            <Button 
                type="button" 
                variant="outline"
                onClick={generateCode}
                className="h-10 px-4 rounded-xl border-dashed border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 gap-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
            >
                <RefreshCw className="h-4 w-4" />
                <span className="text-[9px] font-black tracking-widest uppercase">Auto</span>
            </Button>
        </div>
      </div>

      {/* Discount Type Selector */}
      <div className="grid grid-cols-2 gap-3 p-1.5 bg-muted/20 rounded-2xl border border-border/30">
        <button
            type="button"
            onClick={() => toggleType('PERCENTAGE')}
            className={cn(
                "flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-500",
                formData.type === 'PERCENTAGE' 
                    ? "bg-white dark:bg-card text-indigo-600 shadow-md border border-border/10" 
                    : "text-muted-foreground hover:bg-white/50 dark:hover:bg-card/50"
            )}
        >
            <Percent className="h-4 w-4" />
            <span className="text-[10px] font-black tracking-widest uppercase">Percentage</span>
        </button>
        <button
            type="button"
            onClick={() => toggleType('FIXED')}
            className={cn(
                "flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-500",
                formData.type === 'FIXED' 
                    ? "bg-white dark:bg-card text-indigo-600 shadow-md border border-border/10" 
                    : "text-muted-foreground hover:bg-white/50 dark:hover:bg-card/50"
            )}
        >
            <Banknote className="h-4 w-4" />
            <span className="text-[10px] font-black tracking-widest uppercase">Fixed Amount</span>
        </button>
      </div>

      {/* Value & constraints */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="value" className="text-[10px] font-black tracking-widest text-muted-foreground ml-1 uppercase">
            {formData.type === 'PERCENTAGE' ? 'Discount Ratio (%)' : 'Discount Value ($)'}
          </Label>
          <Input 
            id="value"
            type="number"
            step="0.01"
            value={formData.value} 
            onChange={handleChange} 
            className="h-10 rounded-xl border-border/50 bg-muted/20 focus:bg-background transition-all text-[11px] font-black"
            required 
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="minPurchase" className="text-[10px] font-black tracking-widest text-muted-foreground ml-1 uppercase">
            Minimum Checkout ($)
          </Label>
          <Input 
            id="minPurchase"
            type="number"
            step="0.01"
            value={formData.minPurchase} 
            onChange={handleChange} 
            className="h-10 rounded-xl border-border/50 bg-muted/20 focus:bg-background transition-all text-[11px] font-bold"
            required 
          />
        </div>
      </div>

      {/* Expiry & Usage */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="expiryDate" className="text-[10px] font-black tracking-widest text-muted-foreground ml-1 uppercase">
            Lifecycle Expiry
          </Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground opacity-50" />
            <Input 
                id="expiryDate"
                type="date"
                value={formData.expiryDate} 
                onChange={handleChange} 
                className="h-10 pl-10 rounded-xl border-border/50 bg-muted/20 focus:bg-background transition-all text-[10px] font-black tracking-widest"
                required 
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="usageLimit" className="text-[10px] font-black tracking-widest text-muted-foreground ml-1 uppercase">
            Activation Limit
          </Label>
          <Input 
            id="usageLimit"
            type="number"
            value={formData.usageLimit} 
            onChange={handleChange} 
            placeholder="0 for absolute infinity"
            className="h-10 rounded-xl border-border/50 bg-muted/20 focus:bg-background transition-all text-[11px] font-bold"
            required 
          />
        </div>
      </div>

      {/* Conditional Cap */}
      {formData.type === 'PERCENTAGE' && (
        <div className="space-y-1.5 animate-in fade-in zoom-in-95 duration-300">
            <Label htmlFor="maxDiscount" className="text-[10px] font-black tracking-widest text-muted-foreground ml-1 uppercase">
                Maximum Discount Cap ($)
            </Label>
            <Input 
                id="maxDiscount"
                type="number"
                step="0.01"
                value={formData.maxDiscount} 
                onChange={handleChange} 
                className="h-10 rounded-xl border-border/50 bg-muted/20 focus:bg-background transition-all text-[11px] font-black"
                required 
            />
            <p className="text-[9px] text-muted-foreground/60 font-bold tracking-tight ml-1">Threshold for absolute reduction in pricing.</p>
        </div>
      )}

      {/* Status Switch */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-border/30">
        <div className="flex flex-col">
          <span className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">Issuance State</span>
          <span className="text-[9px] text-muted-foreground/60 font-bold tracking-tight">Activate for public or private redemption</span>
        </div>
        <button
          type="button"
          onClick={toggleStatus}
          className={cn(
            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2",
            formData.status === 'active' ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
          )}
        >
          <span
            className={cn(
              "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
              formData.status === 'active' ? "translate-x-5" : "translate-x-0"
            )}
          />
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-[10px] font-bold tracking-wider rounded-xl border border-rose-100 dark:border-rose-500/20 animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-6 border-t border-border/50">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="h-10 px-6 rounded-xl tracking-widest text-[10px] font-black uppercase text-muted-foreground hover:text-foreground transition-all"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={loading}
          className="h-10 px-8 rounded-xl tracking-widest text-[10px] font-black uppercase shadow-lg shadow-indigo-100 dark:shadow-none bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-white"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing
            </div>
          ) : coupon ? 'Finalize Changes' : 'Initialize Voucher'}
        </Button>
      </div>
    </form>
  );
};

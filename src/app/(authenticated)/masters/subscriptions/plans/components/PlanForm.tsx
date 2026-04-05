'use client';

import React, { useState, useEffect } from 'react';
import { Button, Input, Label } from '@/components/ui';
import { createPlan, updatePlan, Plan } from '@/core/api/subscriptions/plans';
import { getFeatures, Feature } from '@/core/api/subscriptions/features';
import { cn } from '@/lib/utils';
import { AlertCircle, Plus, X, Check, Search, Box, Target } from 'lucide-react';

interface PlanFormProps {
  plan?: Plan | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const PlanForm: React.FC<PlanFormProps> = ({ plan, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    validityDays: 30,
    features: [] as number[],
    limits: [] as { id: string; key: string; value: number }[],
    isTrial: false,
    status: 'active' as 'active' | 'inactive'
  });
  
  const [availableFeatures, setAvailableFeatures] = useState<Feature[]>([]);
  const [featureSearch, setFeatureSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch available features for selection
    const fetchFeatures = async () => {
      try {
        const res = await getFeatures({ limit: 100 });
        if (res.success) {
          setAvailableFeatures(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch features:', err);
      }
    };
    fetchFeatures();
  }, []);

  useEffect(() => {
    if (plan) {
      setFormData({
        name: plan.name,
        price: plan.price,
        validityDays: plan.validityDays,
        features: plan.features.map((f: any) => typeof f === 'number' ? f : f.id),
        limits: plan.limits ? Object.entries(plan.limits).map(([key, value]) => ({
          id: Math.random().toString(36).substr(2, 9),
          key,
          value: Number(value)
        })) : [],
        isTrial: plan.isTrial,
        status: plan.status
      });
    }
  }, [plan]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const limitsObject = formData.limits.reduce((acc, curr) => ({
        ...acc,
        [curr.key]: curr.value
      }), {});

      const payload = { ...formData, limits: limitsObject };

      if (plan) {
        await updatePlan(plan.id, payload);
      } else {
        await createPlan(payload);
      }
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Operation failed. Please verify plan metrics.');
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

  const addLimit = () => {
    setFormData(prev => ({
      ...prev,
      limits: [...prev.limits, { 
        id: Math.random().toString(36).substr(2, 9), 
        key: `METRIC_${prev.limits.length + 1}`, 
        value: 0 
      }]
    }));
  };

  const removeLimit = (id: string) => {
    setFormData(prev => ({
      ...prev,
      limits: prev.limits.filter(l => l.id !== id)
    }));
  };

  const handleLimitKeyChange = (id: string, newKey: string) => {
    setFormData(prev => ({
      ...prev,
      limits: prev.limits.map(l => l.id === id ? { ...l, key: newKey } : l)
    }));
  };

  const handleLimitValueChange = (id: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      limits: prev.limits.map(l => l.id === id ? { ...l, value: parseInt(value) || 0 } : l)
    }));
  };

  const toggleFeature = (featureId: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(featureId)
        ? prev.features.filter(id => id !== featureId)
        : [...prev.features, featureId]
    }));
  };

  const toggleSwitch = (field: 'isTrial' | 'status') => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'status' 
        ? (prev.status === 'active' ? 'inactive' : 'active')
        : !prev[field]
    }));
  };

  const filteredFeatures = availableFeatures.filter(f => 
    f.name.toLowerCase().includes(featureSearch.toLowerCase()) || 
    f.code.toLowerCase().includes(featureSearch.toLowerCase())
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-2 max-h-[75vh] overflow-y-auto px-1 scrollbar-hide">
      {/* Primary Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5 col-span-2 sm:col-span-1">
          <Label htmlFor="name" className="text-[10px] font-black tracking-widest text-muted-foreground ml-1 uppercase">
            Plan Identity
          </Label>
          <Input 
            id="name"
            value={formData.name} 
            onChange={handleChange} 
            placeholder="e.g. Professional Bundle"
            className="h-10 rounded-xl border-border/50 bg-muted/20 focus:bg-background transition-all text-[11px] font-medium"
            required 
            autoFocus
          />
        </div>
        <div className="space-y-1.5 col-span-2 sm:col-span-1">
          <Label htmlFor="price" className="text-[10px] font-black tracking-widest text-muted-foreground ml-1 uppercase">
            Unit Price (USD)
          </Label>
          <Input 
            id="price"
            type="number"
            step="0.01"
            value={formData.price} 
            onChange={handleChange} 
            className="h-10 rounded-xl border-border/50 bg-muted/20 focus:bg-background transition-all text-[11px] font-bold"
            required 
          />
        </div>
      </div>

      {/* Constraints & Dynamic Limits */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5 col-span-2 sm:col-span-1">
            <Label htmlFor="validityDays" className="text-[10px] font-black tracking-widest text-muted-foreground ml-1 uppercase">
              Lifecycle (Days)
            </Label>
            <Input 
              id="validityDays"
              type="number"
              value={formData.validityDays} 
              onChange={handleChange} 
              className="h-10 rounded-xl border-border/50 bg-muted/20 focus:bg-background transition-all text-[11px] font-medium"
              required 
            />
          </div>
        </div>

        <div className="space-y-3 p-4 bg-muted/10 rounded-3xl border border-border/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3">
             <Target className="h-12 w-12 text-indigo-500/5 rotate-12" />
          </div>
          
          <div className="flex items-center justify-between mb-2">
            <div className="flex flex-col">
              <Label className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">Usage Constraints</Label>
              <span className="text-[8px] font-bold text-muted-foreground/60 uppercase">Define operational thresholds</span>
            </div>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={addLimit}
              className="h-7 px-3 rounded-lg border-dashed border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 gap-1.5"
            >
              <Plus className="h-3 w-3" />
              Add Metric
            </Button>
          </div>

          <div className="space-y-2">
            {formData.limits.map((limit, index) => (
              <div key={limit.id} className="flex items-center gap-2 group animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: `${index * 50}ms` }}>
                <div className="relative flex-1">
                  <Input 
                    value={limit.key} 
                    onChange={(e) => handleLimitKeyChange(limit.id, e.target.value)}
                    placeholder="Metric Key (e.g. MAX_USERS)"
                    className="h-9 pr-8 bg-background border-border/40 text-[10px] font-black tracking-wider uppercase focus:ring-1"
                  />
                </div>
                <div className="relative w-32">
                  <Input 
                    type="number"
                    value={limit.value} 
                    onChange={(e) => handleLimitValueChange(limit.id, e.target.value)}
                    placeholder="Val"
                    className="h-9 bg-background border-border/40 text-[10px] font-bold focus:ring-1"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeLimit(limit.id)}
                  className="p-2 text-muted-foreground/40 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-all"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            {formData.limits.length === 0 && (
              <div className="py-4 text-center border-2 border-dashed border-border/20 rounded-2xl">
                <p className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">No metrics defined</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Feature Manifest */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
            <Label className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                Capabilities Association
            </Label>
            <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full border border-indigo-100/50 dark:border-indigo-500/20 uppercase tracking-tighter">
                {formData.features.length} Selected
            </span>
        </div>
        
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground opacity-50" />
            <input 
                type="text"
                placeholder="Lookup features..."
                className="w-full pl-9 pr-4 py-2 bg-muted/20 border border-border/50 rounded-xl text-[10px] font-bold tracking-tight focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all"
                value={featureSearch}
                onChange={(e) => setFeatureSearch(e.target.value)}
            />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-muted/10 rounded-2xl border border-border/30 max-h-[160px] overflow-y-auto scrollbar-hide">
            {filteredFeatures.map(feat => {
                const isSelected = formData.features.includes(feat.id);
                return (
                    <button
                        key={feat._id}
                        type="button"
                        onClick={() => toggleFeature(feat.id)}
                        className={cn(
                            "flex items-center justify-between p-2.5 rounded-xl border transition-all duration-300 group",
                            isSelected 
                                ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-100 dark:shadow-none" 
                                : "bg-card border-border/50 text-foreground hover:border-indigo-300 dark:hover:border-indigo-800"
                        )}
                    >
                        <div className="flex items-center gap-2">
                            <div className={cn(
                                "h-6 w-6 rounded-lg flex items-center justify-center transition-colors",
                                isSelected ? "bg-white/20" : "bg-muted/50 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/30"
                            )}>
                                <Box className={cn("h-3 w-3", isSelected ? "text-white" : "text-indigo-600 dark:text-indigo-400")} />
                            </div>
                            <div className="flex flex-col items-start">
                                <span className="text-[10px] font-black tracking-tight">{feat.name}</span>
                                <span className={cn("text-[8px] font-bold uppercase", isSelected ? "text-white/60" : "text-muted-foreground/60")}>{feat.code}</span>
                            </div>
                        </div>
                        {isSelected && <Check className="h-3 w-3 text-white" />}
                    </button>
                );
            })}
        </div>
      </div>

      {/* Switches */}
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => toggleSwitch('isTrial')}
          className={cn(
            "flex items-center justify-between p-4 rounded-xl border transition-all duration-300 group",
            formData.isTrial ? "bg-amber-50/50 dark:bg-amber-500/10 border-amber-200/50 dark:border-amber-500/20" : "bg-muted/10 border-border/30"
          )}
        >
            <div className="flex flex-col items-start">
                <span className="text-[10px] font-black tracking-widest uppercase text-muted-foreground group-hover:text-amber-600 transition-colors">Trial Logic</span>
                <span className="text-[8px] font-bold text-muted-foreground/60">Sandbox deployment</span>
            </div>
            <div className={cn(
                "h-5 w-9 rounded-full transition-colors relative",
                formData.isTrial ? "bg-amber-500" : "bg-slate-300 dark:bg-slate-700"
            )}>
                <div className={cn(
                    "absolute top-0.5 h-4 w-4 bg-white rounded-full transition-transform",
                    formData.isTrial ? "left-[18px]" : "left-[2px]"
                )} />
            </div>
        </button>

        <button
          type="button"
          onClick={() => toggleSwitch('status')}
          className={cn(
            "flex items-center justify-between p-4 rounded-xl border transition-all duration-300 group",
            formData.status === 'active' ? "bg-emerald-50/50 dark:bg-emerald-500/10 border-emerald-200/50 dark:border-emerald-500/20" : "bg-muted/10 border-border/30"
          )}
        >
            <div className="flex flex-col items-start">
                <span className="text-[10px] font-black tracking-widest uppercase text-muted-foreground group-hover:text-emerald-600 transition-colors">Ecosystem State</span>
                <span className="text-[8px] font-bold text-muted-foreground/60">Live production</span>
            </div>
            <div className={cn(
                "h-5 w-9 rounded-full transition-colors relative",
                formData.status === 'active' ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
            )}>
                <div className={cn(
                    "absolute top-0.5 h-4 w-4 bg-white rounded-full transition-transform",
                    formData.status === 'active' ? "left-[18px]" : "left-[2px]"
                )} />
            </div>
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
          className="h-10 px-8 rounded-xl tracking-widest text-[10px] font-black uppercase shadow-lg shadow-indigo-100 dark:shadow-none bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing
            </div>
          ) : plan ? 'Update Identity' : 'Establish Plan'}
        </Button>
      </div>
    </form>
  );
};

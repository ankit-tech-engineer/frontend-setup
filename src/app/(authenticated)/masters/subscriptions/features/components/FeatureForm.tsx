'use client';

import React, { useState, useEffect } from 'react';
import { Button, Input, Label } from '@/components/ui';
import { createFeature, updateFeature, Feature } from '@/core/api/subscriptions/features';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface FeatureFormProps {
  feature?: Feature | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const FeatureForm: React.FC<FeatureFormProps> = ({ feature, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: feature?.name || '',
    code: feature?.code || '',
    description: feature?.description || '',
    status: feature?.status || 'active' as 'active' | 'inactive'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (feature) {
      setFormData({
        name: feature.name,
        code: feature.code,
        description: feature.description,
        status: feature.status
      });
    }
  }, [feature]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (feature) {
        await updateFeature(feature.id, formData);
      } else {
        await createFeature(formData);
      }
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Evolution failed. Please verify your inputs.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const toggleStatus = () => {
    setFormData(prev => ({
      ...prev,
      status: prev.status === 'active' ? 'inactive' : 'active'
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pt-2">
      {/* Identity Group */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-[10px] font-black tracking-widest text-muted-foreground ml-1 uppercase">
            Feature Name
          </Label>
          <Input 
            id="name"
            value={formData.name} 
            onChange={handleChange} 
            placeholder="e.g. Advanced Analytics"
            className="h-10 rounded-xl border-border/50 bg-muted/20 focus:bg-background transition-all text-[11px] font-medium"
            required 
            autoFocus
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="code" className="text-[10px] font-black tracking-widest text-muted-foreground ml-1 uppercase">
            System Code
          </Label>
          <Input 
            id="code"
            value={formData.code} 
            onChange={handleChange} 
            placeholder="e.g. ADV_ANALYTICS"
            className="h-10 rounded-xl border-border/50 bg-muted/20 focus:bg-background transition-all text-[11px] font-mono font-bold uppercase"
            required 
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description" className="text-[10px] font-black tracking-widest text-muted-foreground ml-1 uppercase">
          Detailed Description
        </Label>
        <textarea
          id="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Detailed explanation of what this feature unlocks..."
          className="flex min-h-[80px] w-full rounded-xl border border-border/50 bg-muted/20 px-3 py-2 text-[11px] text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all focus:bg-background font-medium"
          required
        />
      </div>

      {/* Status Toggle */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-border/30">
        <div className="flex flex-col">
          <span className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">Activation State</span>
          <span className="text-[9px] text-muted-foreground/60 font-bold tracking-tight">Toggle feature visibility in plan builder</span>
        </div>
        <button
          type="button"
          onClick={toggleStatus}
          className={cn(
            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2",
            formData.status === 'active' ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"
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
          className="h-10 px-8 rounded-xl tracking-widest text-[10px] font-black uppercase shadow-lg shadow-indigo-100 dark:shadow-none bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing
            </div>
          ) : feature ? 'Commit Changes' : 'Initialize Feature'}
        </Button>
      </div>
    </form>
  );
};

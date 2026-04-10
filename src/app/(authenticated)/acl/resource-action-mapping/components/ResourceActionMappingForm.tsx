'use client';

import React, { useState, useEffect } from 'react';
import { Button, Label } from '@/components/ui';
import { createResourceActionMapping, updateResourceActionMapping, ResourceActionMapping } from '@/core/api/acl/resource-action-mappings';
import { getResources, Resource } from '@/core/api/acl/resources';
import { getActions, Action } from '@/core/api/acl/actions';
import { Loader2, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResourceActionMappingFormProps {
  mapping?: ResourceActionMapping | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ResourceActionMappingForm: React.FC<ResourceActionMappingFormProps> = ({ mapping, onSuccess, onCancel }) => {
  const [resourceId, setResourceId] = useState<number | ''>(mapping?.resourceId.id || '');
  const [selectedActions, setSelectedActions] = useState<number[]>(mapping?.actions.map(a => a.id) || []);
  const [status, setStatus] = useState<'active' | 'inactive'>(mapping?.status || 'active');
  
  const [resources, setResources] = useState<Resource[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetadata = async () => {
      setIsLoadingMetadata(true);
      try {
        const [resResponse, actResponse] = await Promise.all([
          getResources({ limit: 100 }),
          getActions({ limit: 100 })
        ]);
        if (resResponse.success) setResources(resResponse.data);
        if (actResponse.success) setActions(actResponse.data);
      } catch (err) {
        console.error('Failed to fetch metadata:', err);
        setError('Failed to load resources or actions');
      } finally {
        setIsLoadingMetadata(false);
      }
    };

    fetchMetadata();
  }, []);

  const toggleAction = (id: number) => {
    setSelectedActions(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resourceId || selectedActions.length === 0) {
      setError('Please select a resource and at least one action');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        resourceId: Number(resourceId),
        actions: selectedActions,
        status
      };

      if (mapping) {
        await updateResourceActionMapping(mapping.id, payload);
      } else {
        await createResourceActionMapping(payload);
      }
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingMetadata) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-muted-foreground gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <p className="text-[10px] font-black tracking-widest uppercase animate-pulse">Initializing Interface...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Resource Selection */}
      <div className="space-y-2">
        <Label htmlFor="resource">Select Target Resource</Label>
        <div className="relative group">
          <select
            id="resource"
            value={resourceId}
            onChange={(e) => setResourceId(Number(e.target.value))}
            className="w-full h-11 rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer"
            required
            disabled={!!mapping}
          >
            <option value="">Choose a resource...</option>
            {resources.map((res) => (
              <option key={res.id} value={res.id}>
                {res.name} ({res.key})
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        {mapping && <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Resource cannot be changed during update</p>}
      </div>

      {/* Actions Multi-select */}
      <div className="space-y-3">
        <Label>Authorize Specific Actions</Label>
        <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-2 scrollbar-indigo">
          {actions.map((action) => {
            const isSelected = selectedActions.includes(action.id);
            return (
              <button
                key={action.id}
                type="button"
                onClick={() => toggleAction(action.id)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 text-left group",
                  isSelected 
                    ? "bg-indigo-50/50 border-indigo-200 dark:bg-indigo-500/10 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 shadow-sm" 
                    : "bg-muted/10 border-border/50 hover:bg-muted/30 text-muted-foreground"
                )}
              >
                <div className={cn(
                  "flex-shrink-0 transition-transform group-active:scale-90",
                  isSelected ? "text-indigo-600" : "text-muted-foreground/40"
                )}>
                  {isSelected ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-black uppercase tracking-tight truncate">{action.name}</span>
                  <span className="text-[8px] font-bold opacity-50 uppercase tracking-widest">{action.key}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Status Toggle */}
      <div className="flex items-center justify-between p-4 bg-muted/20 border border-border/50 rounded-2xl">
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-widest">Availability Status</span>
          <span className="text-[9px] text-muted-foreground font-bold uppercase">Toggle mapping state</span>
        </div>
        <button
          type="button"
          onClick={() => setStatus(status === 'active' ? 'inactive' : 'active')}
          className={cn(
            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ring-2 ring-offset-2 ring-transparent focus:ring-indigo-500",
            status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'
          )}
        >
          <span
            className={cn(
              "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm",
              status === 'active' ? 'translate-x-6' : 'translate-x-1'
            )}
          />
        </button>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-bold uppercase tracking-widest rounded-xl border border-rose-100 dark:border-rose-500/20 flex items-center gap-3">
          <div className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse"></div>
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-6 border-t border-border/50">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="uppercase tracking-widest text-[9px] font-black h-11 px-6 rounded-xl"
        >
          Cancel Operation
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting || !resourceId || selectedActions.length === 0}
          className="uppercase tracking-widest text-[9px] font-black h-11 px-8 rounded-xl shadow-lg shadow-indigo-100 dark:shadow-none"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              Processing...
            </div>
          ) : mapping ? 'Apply Variations' : 'Authorize Mapping'}
        </Button>
      </div>
    </form>
  );
};

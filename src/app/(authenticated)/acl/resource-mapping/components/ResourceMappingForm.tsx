'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button, Input } from '@/components/ui';
import { getResources, Resource } from '@/core/api/acl/resources';
import { createResourceMapping, updateResourceMapping } from '@/core/api/acl/resource-mapping';
import { Loader2, Search, Check, Box, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/core/hooks/useDebounce';

interface ResourceMappingFormProps {
  mapping?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ResourceMappingForm: React.FC<ResourceMappingFormProps> = ({
  mapping,
  onSuccess,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    module_name: mapping?.module_name || '',
    status: mapping?.status || 'active',
    resources: mapping?.resources?.map((r: any) => r.id) || [] as number[]
  });

  const [availableResources, setAvailableResources] = useState<Resource[]>([]);
  const [knownResources, setKnownResources] = useState<Resource[]>([]);
  const [isLoadingResources, setIsLoadingResources] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const fetchResources = useCallback(async (query: string) => {
    setIsLoadingResources(true);
    try {
      const params = query ? {
        filter: {
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { key: { $regex: query, $options: 'i' } }
          ]
        }
      } : {};
      const response = await getResources(params);
      setAvailableResources(response.data);
      
      // Update known resources to keep labels for selected items
      setKnownResources(prev => {
        const existingIds = new Set(prev.map(r => r.id));
        const newResources = response.data.filter(r => !existingIds.has(r.id));
        return [...prev, ...newResources];
      });
    } catch (error) {
      console.error('Failed to fetch resources:', error);
    } finally {
      setIsLoadingResources(false);
    }
  }, []);

  // Fetch initial resources and mapping's existing resources
  useEffect(() => {
    fetchResources('');
  }, [fetchResources]);

  // Handle debounced search
  useEffect(() => {
    if (debouncedSearchQuery !== undefined) {
      fetchResources(debouncedSearchQuery);
    }
  }, [debouncedSearchQuery, fetchResources]);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.module_name || formData.resources.length === 0) return;

    setIsSubmitting(true);
    try {
      const payload = {
        module_name: formData.module_name,
        resources: formData.resources,
        status: formData.status
      };

      if (mapping?.id) {
        await updateResourceMapping(mapping.id, {...payload, key: mapping.key});
      } else {
        await createResourceMapping(payload);
      }
      onSuccess();
    } catch (error) {
      console.error('Failed to save mapping:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleResource = (id: number) => {
    setFormData(prev => ({
      ...prev,
      resources: prev.resources.includes(id)
        ? prev.resources.filter((rid: number) => rid !== id)
        : [...prev.resources, id]
    }));
  };

  const selectedResourceNames = knownResources
    .filter(r => formData.resources.includes(r.id))
    .map(r => r.name);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Module Name */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
          Module Designation
        </label>
        <Input
          placeholder="e.g., Access Control List"
          value={formData.module_name}
          onChange={(e) => setFormData({ ...formData, module_name: e.target.value })}
          className="h-12 rounded-xl border-border bg-muted/30 focus:bg-background transition-all px-4 font-medium"
          required
        />
      </div>

      {/* Resource Selection Dropdown */}
      <div className="space-y-2 relative" ref={dropdownRef}>
        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
          Resource Registry Mapping
        </label>
        
        <div 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={cn(
            "min-h-[3rem] w-full rounded-xl border bg-muted/30 px-4 py-2 flex flex-wrap gap-2 items-center cursor-pointer hover:border-indigo-500/50 transition-all",
            isDropdownOpen && "border-indigo-500 ring-4 ring-indigo-500/10 bg-background"
          )}
        >
          {formData.resources.length === 0 ? (
            <span className="text-sm text-muted-foreground">Select resources...</span>
          ) : (
            <div className="flex flex-wrap gap-1.5 flex-1">
              {selectedResourceNames.slice(0, 3).map(name => (
                <span key={name} className="px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-bold rounded-lg flex items-center gap-1 animate-in zoom-in-95">
                  {name}
                </span>
              ))}
              {formData.resources.length > 3 && (
                <span className="px-2 py-0.5 bg-muted text-muted-foreground text-[10px] font-bold rounded-lg">
                  +{formData.resources.length - 3} more
                </span>
              )}
            </div>
          )}
          <Box className={cn("h-4 w-4 ml-auto transition-transform duration-300", isDropdownOpen ? "text-indigo-600 rotate-180" : "text-muted-foreground")} />
        </div>

        {isDropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Search within dropdown */}
            <div className="p-3 border-b border-border bg-muted/20">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-indigo-600 transition-colors" />
                <Input
                  placeholder="Query system entries..."
                  value={searchQuery}
                  autoFocus
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-10 rounded-lg bg-background border-border/50 focus:border-indigo-500/50 transition-all text-xs"
                />
                {isLoadingResources && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin text-indigo-600" />
                )}
              </div>
            </div>

            {/* List */}
            <div className="max-h-60 overflow-y-auto py-1 custom-scrollbar">
              {availableResources.map((res) => {
                const isSelected = formData.resources.includes(res.id);
                return (
                  <div
                    key={res.id}
                    onClick={() => toggleResource(res.id)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 transition-all cursor-pointer group",
                      isSelected && "bg-indigo-50/50 dark:bg-indigo-950/20"
                    )}
                  >
                    <div className={cn(
                      "h-6 w-6 rounded-md flex items-center justify-center transition-all",
                      isSelected
                        ? "bg-indigo-600 text-white"
                        : "bg-muted text-muted-foreground group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900 group-hover:text-indigo-600"
                    )}>
                      {isSelected ? <Check className="h-3 w-3" /> : <Box className="h-3 w-3" />}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className={cn(
                        "text-[11px] font-bold truncate",
                        isSelected ? "text-indigo-900 dark:text-indigo-100" : "text-foreground"
                      )}>
                        {res.name}
                      </span>
                      <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-tight truncate">
                        {res.key}
                      </span>
                    </div>
                  </div>
                );
              })}
              {availableResources.length === 0 && !isLoadingResources && (
                <div className="px-4 py-6 text-center">
                  <p className="text-[10px] font-medium text-muted-foreground">Entity registry empty</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Status Selection */}
      <div className="space-y-2 pt-2">
        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
          Lifecycle Status
        </label>
        <div className="grid grid-cols-2 gap-3">
          {['active', 'inactive'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFormData({ ...formData, status: status as any })}
              className={cn(
                "h-11 rounded-xl flex items-center justify-center gap-2 border text-[10px] font-bold uppercase tracking-wider transition-all",
                formData.status === status
                  ? status === 'active'
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400 shadow-sm"
                    : "bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400 shadow-sm"
                  : "bg-muted/30 border-border text-muted-foreground hover:bg-muted"
              )}
            >
              <div className={cn(
                "h-1.5 w-1.5 rounded-full",
                status === 'active' ? "bg-emerald-500" : "bg-rose-500",
                formData.status !== status && "opacity-30"
              )} />
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1 h-12 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-muted"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || !formData.module_name || formData.resources.length === 0}
          className="flex-1 h-12 rounded-xl bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-widest hover:scale-[1.02] transition-all shadow-lg shadow-indigo-100 dark:shadow-none"
        >
          {isSubmitting ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : null}
          {mapping ? 'Modify' : 'Register'}
        </Button>
      </div>
    </form>
  );
};

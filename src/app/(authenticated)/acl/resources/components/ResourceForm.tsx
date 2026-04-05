'use client';

import React, { useState, useEffect } from 'react';
import { Button, Input, Label } from '@/components/ui';
import { createResource, updateResource, Resource } from '@/core/api/resources';
import { cn } from '@/lib/utils';

interface ResourceFormProps {
  resource?: Resource | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ResourceForm: React.FC<ResourceFormProps> = ({ resource, onSuccess, onCancel }) => {
  const [name, setName] = useState(resource?.name || '');
  const [key, setKey] = useState(resource?.key || '');
  const [status, setStatus] = useState(resource?.status || 'active');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (resource) {
      setName(resource.name);
      setKey(resource.key);
      setStatus(resource.status);
    }
  }, [resource]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (resource) {
        await updateResource(resource.id, { name, key, status });
      } else {
        await createResource({ name });
      }
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="resource-name">Resource Name</Label>
        <Input 
          id="resource-name"
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="e.g. Users, Roles, Dashboard..."
          required 
        />
      </div>

      {resource && (
        <>
          <div className="space-y-2">
            <Label htmlFor="resource-key">Resource Key</Label>
            <Input 
              id="resource-key"
              value={key} 
              onChange={(e) => setKey(e.target.value)} 
              placeholder="e.g. user, role, dashboard..."
            />
          </div>

          <div className="space-y-3">
             <Label>Resource Status</Label>
             <div className="flex items-center gap-4">
               {['active', 'inactive'].map((s) => (
                 <label 
                   key={s} 
                   className={cn(
                     "relative flex-1 cursor-pointer rounded-xl border p-3 transition-all duration-200",
                     status === s 
                       ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 scale-[1.02] shadow-sm shadow-indigo-100 dark:shadow-none" 
                       : "border-border bg-card hover:bg-muted"
                   )}
                 >
                   <input
                     type="radio"
                     name="status"
                     value={s}
                     checked={status === s}
                     onChange={() => setStatus(s as any)}
                     className="sr-only"
                   />
                   <div className="flex items-center justify-between">
                     <span className={cn(
                       "text-xs font-bold uppercase tracking-wider",
                       status === s ? "text-indigo-600 dark:text-indigo-400" : "text-muted-foreground"
                     )}>
                       {s}
                     </span>
                     <div className={cn(
                       "h-3 w-3 rounded-full border-2 transition-all",
                       status === s ? "bg-indigo-600 border-indigo-600 animate-pulse" : "bg-transparent border-muted-foreground/30"
                     )}></div>
                   </div>
                 </label>
               ))}
             </div>
          </div>
        </>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs font-medium rounded-xl border border-red-100 dark:border-red-900/30 animate-in shake-in duration-300">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-6 border-t border-border">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="rounded-xl"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={loading || !name}
          className="rounded-xl px-6 min-w-[120px]"
        >
          {loading ? 'Processing...' : resource ? 'Update Resource' : 'Save Resource'}
        </Button>
      </div>
    </form>
  );
};

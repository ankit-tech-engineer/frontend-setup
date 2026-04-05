'use client';

import React, { useState, useEffect } from 'react';
import { Button, Input, Label } from '@/components/ui';
import { createAction, updateAction, Action } from '@/core/api/actions';
import { cn } from '@/lib/utils';

interface ActionFormProps {
  action?: Action | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ActionForm: React.FC<ActionFormProps> = ({ action, onSuccess, onCancel }) => {
  const [name, setName] = useState(action?.name || '');
  const [key, setKey] = useState(action?.key || '');
  const [status, setStatus] = useState(action?.status || 'active');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (action) {
      setName(action.name);
      setKey(action.key);
      setStatus(action.status);
    }
  }, [action]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (action) {
        await updateAction(action.id, { name, key, status });
      } else {
        await createAction({ name });
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
        <Label htmlFor="action-name">Action Name</Label>
        <Input 
          id="action-name"
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="e.g. Create, Read, Update, Delete..."
          required 
        />
      </div>

      {action && (
        <>
          <div className="space-y-2">
            <Label htmlFor="action-key">Technical Key</Label>
            <Input 
              id="action-key"
              value={key} 
              onChange={(e) => setKey(e.target.value)} 
              placeholder="e.g. create, read, update, delete..."
            />
          </div>

          <div className="space-y-3">
             <Label>Action Availability</Label>
             <div className="flex items-center gap-4">
               {['active', 'inactive'].map((s) => (
                 <label 
                   key={s} 
                   className={cn(
                     "relative flex-1 cursor-pointer rounded-xl border p-3 transition-all duration-200",
                     status === s 
                       ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 scale-[1.02] shadow-sm shadow-emerald-100 dark:shadow-none" 
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
                       status === s ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                     )}>
                       {s}
                     </span>
                     <div className={cn(
                       "h-3 w-3 rounded-full border-2 transition-all",
                       status === s ? "bg-emerald-600 border-emerald-600 animate-pulse" : "bg-transparent border-muted-foreground/30"
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
          {loading ? 'Processing...' : action ? 'Update Action' : 'Save Action'}
        </Button>
      </div>
    </form>
  );
};

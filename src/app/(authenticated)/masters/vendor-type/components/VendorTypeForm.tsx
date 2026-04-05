'use client';

import React, { useState, useEffect } from 'react';
import { Button, Input, Label } from '@/components/ui';
import { createVendorType, updateVendorType, VendorType } from '@/core/api/vendor-types';

interface VendorTypeFormProps {
  vendorType?: VendorType | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const VendorTypeForm: React.FC<VendorTypeFormProps> = ({ vendorType, onSuccess, onCancel }) => {
  const [name, setName] = useState(vendorType?.name || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (vendorType) {
      setName(vendorType.name);
    }
  }, [vendorType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (vendorType) {
        await updateVendorType(vendorType.id, { name });
      } else {
        await createVendorType({ name });
      }
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-2">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-[10px] font-black tracking-widest text-muted-foreground ml-1">
          Vendor Type Name
        </Label>
        <Input 
          id="name"
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="e.g. E-Commerce, Logistics, Retail..."
          className="h-11 rounded-xl border-border/50 bg-muted/20 focus:bg-background transition-all"
          required 
          autoFocus
        />
        <p className="text-[9px] text-muted-foreground font-medium tracking-tight ml-1 opacity-70">
          Enter a descriptive name for this vendor category.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-[10px] font-bold tracking-wider rounded-xl border border-rose-100 dark:border-rose-500/20 animate-in fade-in slide-in-from-top-1">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-6 border-t border-border/50">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="h-11 px-6 rounded-xl tracking-widest text-[10px] font-black"
        >
          Discard
        </Button>
        <Button 
          type="submit" 
          disabled={loading || !name.trim()}
          className="h-11 px-8 rounded-xl tracking-widest text-[10px] font-black shadow-lg shadow-indigo-100 dark:shadow-none"
        >
          {loading ? 'Processing...' : vendorType ? 'Update Identity' : 'Create Type'}
        </Button>
      </div>
    </form>
  );
};

'use client';

import React, { useState, useEffect } from 'react';
import { Button, Input, Label } from '@/components/ui';
import { createVendor, updateVendor, Vendor } from '@/core/api/vendors';
import { getVendorTypes, VendorType } from '@/core/api/vendor-types';
import { Loader2 } from 'lucide-react';

interface VendorFormProps {
  vendor?: Vendor | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const VendorForm: React.FC<VendorFormProps> = ({ vendor, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: vendor?.name || '',
    email: vendor?.email || '',
    phone: vendor?.phone || '',
    vendorType: vendor?.vendorType?.id || '',
  });
  
  const [vendorTypes, setVendorTypes] = useState<VendorType[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingTypes, setFetchingTypes] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTypes = async () => {
      setFetchingTypes(true);
      try {
        const response = await getVendorTypes({ noLimit: true });
        if (response.success) {
          setVendorTypes(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch vendor types:', err);
      } finally {
        setFetchingTypes(false);
      }
    };
    fetchTypes();
  }, []);

  useEffect(() => {
    if (vendor) {
      setFormData({
        name: vendor.name,
        email: vendor.email,
        phone: vendor.phone,
        vendorType: vendor.vendorType.id,
      });
    }
  }, [vendor]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      ...formData,
      vendorType: Number(formData.vendorType)
    };

    try {
      if (vendor) {
        await updateVendor(vendor.id, payload);
      } else {
        await createVendor(payload);
      }
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Something went wrong while saving vendor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pt-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-[10px] font-black tracking-widest text-muted-foreground ml-1">
            Vendor Business Name
          </Label>
          <Input 
            id="name"
            value={formData.name} 
            onChange={handleChange} 
            placeholder="e.g. Acme Solutions"
            className="h-11 rounded-xl border-border/50 bg-muted/20 dark:bg-muted/10 focus:bg-background transition-all"
            required 
            autoFocus
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-[10px] font-black tracking-widest text-muted-foreground ml-1">
            Corporate Email
          </Label>
          <Input 
            id="email"
            type="email"
            value={formData.email} 
            onChange={handleChange} 
            placeholder="contact@acme.com"
            className="h-11 rounded-xl border-border/50 bg-muted/20 dark:bg-muted/10 focus:bg-background transition-all"
            required 
          />
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-[10px] font-black tracking-widest text-muted-foreground ml-1">
            Primary Phone
          </Label>
          <Input 
            id="phone"
            value={formData.phone} 
            onChange={handleChange} 
            placeholder="9876543210"
            className="h-11 rounded-xl border-border/50 bg-muted/20 dark:bg-muted/10 focus:bg-background transition-all"
            required 
          />
        </div>

        {/* Vendor Type Select */}
        <div className="space-y-2">
          <Label htmlFor="vendorType" className="text-[10px] font-black tracking-widest text-muted-foreground ml-1">
            Category Classification
          </Label>
          <div className="relative">
            <select
              id="vendorType"
              value={formData.vendorType}
              onChange={handleChange}
              className="flex h-11 w-full items-center justify-between rounded-xl border border-border/50 bg-muted/20 dark:bg-muted/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 appearance-none transition-all dark:bg-slate-900"
              required
              disabled={fetchingTypes}
            >
              <option value="" disabled>Select category...</option>
              {vendorTypes.map(type => (
                <option key={type._id} value={type.id}>{type.name}</option>
              ))}
            </select>
            {fetchingTypes && (
              <div className="absolute right-3 top-3">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
            {!fetchingTypes && (
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            )}
          </div>
        </div>
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
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={loading || !formData.name || !formData.email || !formData.vendorType}
          className="h-11 px-8 rounded-xl tracking-widest text-[10px] font-black shadow-lg shadow-indigo-100 dark:shadow-none"
        >
          {loading ? 'Processing...' : vendor ? 'Finalize Changes' : 'Onboard Vendor'}
        </Button>
      </div>
    </form>
  );
};

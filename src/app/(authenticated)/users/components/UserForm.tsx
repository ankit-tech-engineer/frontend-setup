'use client';

import React, { useState, useEffect } from 'react';
import { Button, Input, Label } from '@/components/ui';
import { createUser, updateUser, User } from '@/core/api/auth/users';
import { getRoles, Role } from '@/core/api/acl/roles';
import { Loader2, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserFormProps {
  user?: User | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const UserForm: React.FC<UserFormProps> = ({ user, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    roles: user?.roles.map(r => r.id) || [] as number[],
    status: user?.status || 'active',
  });
  
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingRoles, setFetchingRoles] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoles = async () => {
      setFetchingRoles(true);
      try {
        const response = await getRoles({ noLimit: true });
        if (response.success) {
          setAvailableRoles(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch roles:', err);
      } finally {
        setFetchingRoles(false);
      }
    };
    fetchRoles();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        roles: user.roles.map(r => r.id),
        status: user.status,
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleRoleToggle = (roleId: number) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(roleId)
        ? prev.roles.filter(id => id !== roleId)
        : [...prev.roles, roleId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload: any = {
      name: formData.name,
      email: formData.email,
      roles: formData.roles,
      status: formData.status,
    };

    if (!user) {
      payload.password = formData.password;
    }

    try {
      if (user) {
        await updateUser(user.id, payload);
      } else {
        await createUser(payload);
      }
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Something went wrong while saving user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-[10px] font-black tracking-widest text-muted-foreground ml-1">
            Display Name
          </Label>
          <Input 
            id="name"
            value={formData.name} 
            onChange={handleChange} 
            placeholder="e.g. John Doe"
            className="h-11 rounded-xl border-border/50 bg-muted/10 focus:bg-background transition-all"
            required 
            autoFocus
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-[10px] font-black tracking-widest text-muted-foreground ml-1">
            Work Email
          </Label>
          <Input 
            id="email"
            type="email"
            value={formData.email} 
            onChange={handleChange} 
            placeholder="john@vendor.com"
            className="h-11 rounded-xl border-border/50 bg-muted/10 focus:bg-background transition-all"
            required 
          />
        </div>

        {/* Status Select */}
        <div className="space-y-2">
          <Label htmlFor="status" className="text-[10px] font-black tracking-widest text-muted-foreground ml-1">
            Credential Status
          </Label>
          <select
            id="status"
            value={formData.status}
            onChange={handleChange}
            className="flex h-11 w-full items-center justify-between rounded-xl border border-border/50 bg-muted/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all"
            required
          >
            <option value="active">ACTIVE</option>
            <option value="inactive">INACTIVE</option>
          </select>
        </div>

        {/* Password (Only on Create) */}
        {!user && (
          <div className="space-y-2">
            <Label htmlFor="password" className="text-[10px] font-black tracking-widest text-muted-foreground ml-1">
              Initial Password
            </Label>
            <Input 
              id="password"
              type="password"
              value={formData.password} 
              onChange={handleChange} 
              placeholder="Secure123!"
              className="h-11 rounded-xl border-border/50 bg-muted/10 focus:bg-background transition-all"
              required={!user} 
            />
          </div>
        )}
      </div>

      {/* Roles Selection */}
      <div className="space-y-3">
        <Label className="text-[10px] font-black tracking-widest text-muted-foreground ml-1">
          Authority Calibration (Roles)
        </Label>
        {fetchingRoles ? (
          <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground animate-pulse">
            <Loader2 className="h-3 w-3 animate-spin" />
            SYNCHRONIZING PERMISSION TIERS...
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {availableRoles.map(role => (
              <div 
                key={role._id}
                onClick={() => handleRoleToggle(role.id)}
                className={cn(
                  "p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 group",
                  formData.roles.includes(role.id)
                    ? "bg-indigo-50 border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-800 shadow-sm"
                    : "bg-muted/5 border-border/50 hover:border-indigo-200 dark:hover:border-indigo-800"
                )}
              >
                <div className={cn(
                  "h-8 w-8 rounded-lg flex items-center justify-center transition-colors",
                  formData.roles.includes(role.id)
                    ? "bg-indigo-600 text-white"
                    : "bg-muted text-muted-foreground group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/40"
                )}>
                  <Shield className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className={cn(
                    "text-[10px] font-black tracking-tight uppercase",
                    formData.roles.includes(role.id) ? "text-indigo-700 dark:text-indigo-300" : "text-foreground"
                  )}>
                    {role.name}
                  </span>
                  <span className="text-[8px] font-bold text-muted-foreground uppercase opacity-60">
                    {role.key}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-[10px] font-bold tracking-wider rounded-xl border border-rose-100 dark:border-rose-500/20 animate-in fade-in slide-in-from-right-1">
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
          disabled={loading || !formData.name || !formData.email || (!user && !formData.password) || formData.roles.length === 0}
          className="h-11 px-8 rounded-xl tracking-widest text-[10px] font-black shadow-lg shadow-indigo-100 dark:shadow-none"
        >
          {loading ? 'Processing...' : user ? 'Update Identity' : 'Onboard Member'}
        </Button>
      </div>
    </form>
  );
};

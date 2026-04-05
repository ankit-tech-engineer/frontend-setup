'use client';

import React, { useState, useEffect } from 'react';
import { Button, Input, Label } from '@/components/ui';
import { createRole, updateRole, Role } from '@/core/api/roles';

interface RoleFormProps {
  role?: Role | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const RoleForm: React.FC<RoleFormProps> = ({ role, onSuccess, onCancel }) => {
  const [name, setName] = useState(role?.name || '');
  const [key, setKey] = useState(role?.key || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (role) {
      setName(role.name);
      setKey(role.key);
    }
  }, [role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (role) {
        await updateRole(role.id, { name, key });
      } else {
        await createRole({ name });
      }
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Role Name</Label>
        <Input 
          id="name"
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="e.g. Admin, Manager..."
          required 
        />
      </div>

      {role && (
        <div className="space-y-2">
          <Label htmlFor="key">Role Key</Label>
          <Input 
            id="key"
            value={key} 
            onChange={(e) => setKey(e.target.value)} 
            placeholder="e.g. admin, manager..."
          />
          <p className="text-[10px] text-muted-foreground">Warning: Changing the key may affect ACL logic.</p>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={loading || !name}
        >
          {loading ? 'Saving...' : role ? 'Update Role' : 'Create Role'}
        </Button>
      </div>
    </form>
  );
};

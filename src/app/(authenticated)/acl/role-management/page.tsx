'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Shield, ChevronRight, Check, Loader2, Save, Settings2, Box, Command, Zap, Layers, Activity } from 'lucide-react';
import { getRoles, Role } from '@/core/api/roles';
import { getResourceMappings, ResourceMapping } from '@/core/api/resource-mapping';
import { getPermissions, updatePermissions, PermissionItem } from '@/core/api/permissions';
import { getResourceActionMappings, ResourceActionMapping } from '@/core/api/resource-action-mappings';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function RoleManagementPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [modules, setModules] = useState<ResourceMapping[]>([]);
  const [resourceActionMappings, setResourceActionMappings] = useState<ResourceActionMapping[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [currentPermissions, setCurrentPermissions] = useState<Record<string, string[]>>({});
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedModules, setExpandedModules] = useState<number[]>([]);

  // Memoized lookup for allowed actions per resource key
  const allowedActionsMap = useMemo(() => {
    const map: Record<string, { id: number, name: string, key: string }[]> = {};
    resourceActionMappings.forEach(mapping => {
      map[mapping.resourceId.key] = mapping.actions;
    });
    return map;
  }, [resourceActionMappings]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [rolesRes, modulesRes, actionMappingsRes] = await Promise.all([
        getRoles(),
        getResourceMappings(),
        getResourceActionMappings({ limit: 100 })
      ]);
      setRoles(rolesRes.data);
      setModules(modulesRes.data);
      setResourceActionMappings(actionMappingsRes.data);
      
      if (rolesRes.data.length > 0 && !selectedRoleId) {
        setSelectedRoleId(rolesRes.data[0].id);
      }

      // Collapsed by default
    } catch (error) {
      console.error('Failed to fetch initial data:', error);
      toast.error('Failed to synchronize system data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchRolePermissions = useCallback(async (roleId: number) => {
    try {
      const response = await getPermissions({ filter: { roleId } });
      const permMap: Record<string, string[]> = {};
      
      const roleData = response.data.find(d => d.roleId.id === roleId);
      if (roleData) {
        roleData.permissions.forEach(p => {
          permMap[p.resource] = p.action;
        });
      }
      setCurrentPermissions(permMap);
    } catch (error) {
      console.error('Failed to fetch role permissions:', error);
      setCurrentPermissions({});
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (selectedRoleId) {
      fetchRolePermissions(selectedRoleId);
    }
  }, [selectedRoleId, fetchRolePermissions]);

  const toggleAction = (resourceKey: string, actionKey: string) => {
    setCurrentPermissions(prev => {
      const actions = prev[resourceKey] || [];
      const newActions = actions.includes(actionKey)
        ? actions.filter(a => a !== actionKey)
        : [...actions, actionKey];
      
      return { ...prev, [resourceKey]: newActions };
    });
  };

  const toggleAllActions = (resourceKey: string) => {
    const validActions = allowedActionsMap[resourceKey] || [];
    const validActionKeys = validActions.map(a => a.key);
    
    setCurrentPermissions(prev => {
      const currentlySelected = prev[resourceKey] || [];
      const isAllSelected = validActionKeys.every(a => currentlySelected.includes(a));
      
      return { 
        ...prev, 
        [resourceKey]: isAllSelected ? [] : [...validActionKeys] 
      };
    });
  };

  const handleSave = async () => {
    if (!selectedRoleId) return;
    
    setIsSaving(true);
    try {
      const permissions: PermissionItem[] = Object.entries(currentPermissions)
        .filter(([_, actions]) => actions.length > 0)
        .map(([resource, action]) => ({ resource, action }));

      await updatePermissions({
        roleId: selectedRoleId,
        permissions
      });
      toast.success('System authority synchronized.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to sync authority set');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleModule = (id: number) => {
    setExpandedModules(prev => 
      prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
          <div className="absolute inset-0 h-12 w-12 border-4 border-indigo-100 rounded-full -z-10 opacity-30"></div>
        </div>
        <p className="text-sm font-semibold text-muted-foreground animate-pulse tracking-wide">Initializing Role Authority Matrix...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-[1600px] mx-auto pb-20">
      
      {/* Precision Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-1">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-3">
            <span className="p-2 bg-indigo-600 rounded-lg text-white shadow-lg shadow-indigo-100 dark:shadow-none">
              <Shield className="h-6 w-6" />
            </span>
            Role-Based Access Control
          </h1>
          <p className="text-xs font-medium text-muted-foreground mt-2 opacity-60">Architect and modulate granular system capabilities</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-card p-2 rounded-2xl border border-border/60 shadow-sm transition-all duration-300 hover:shadow-md">
          <div className="flex items-center gap-3 px-4 py-2 border-r border-border/50">
             <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
             <span className="text-xs font-bold text-muted-foreground tracking-widest leading-none">Authority Map Live</span>
          </div>
          
          <div className="px-4">
            <select 
              value={selectedRoleId || ''} 
              onChange={(e) => setSelectedRoleId(Number(e.target.value))}
              className="bg-transparent border-none focus:ring-0 text-sm font-bold text-indigo-600 tracking-widest outline-none cursor-pointer hover:text-indigo-700 transition-colors"
            >
              {roles.map(role => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
          </div>

          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="h-9 px-6 rounded-xl bg-indigo-600 hover:bg-slate-900 transition-all duration-300 flex items-center gap-2.5 font-bold shadow-lg shadow-indigo-100 dark:shadow-none text-xs"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Sync Protocols
          </Button>
        </div>
      </div>

      {/* Tree Hierarchy Section */}
      <div className="flex flex-col gap-6 relative">
        {/* Invisible vertical line connecting all module cards if needed, but we'll use per-card tree lines */}
        
        {modules.map((module) => {
          const isExpanded = expandedModules.includes(module.id);
          
          return (
            <div key={module.id} className="relative group/module">
              {/* Module Node Card */}
              <div 
                onClick={() => toggleModule(module.id)}
                className={cn(
                  "relative z-10 bg-card rounded-2xl border transition-all duration-500 cursor-pointer overflow-hidden",
                  isExpanded 
                    ? "border-indigo-600/40 shadow-xl shadow-indigo-50 dark:shadow-none" 
                    : "border-border/60 hover:border-indigo-300 hover:shadow-lg"
                )}
              >
                <div className="flex items-center justify-between p-3 md:px-4">
                  <div className="flex items-center gap-6">
                    <div className={cn(
                      "h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-500",
                      isExpanded ? "bg-indigo-600 text-white" : "bg-muted text-muted-foreground shadow-inner"
                    )}>
                      <ChevronRight className={cn("h-5 w-5 transition-transform duration-500", isExpanded && "rotate-90")} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-foreground tracking-tight">{module.module_name}</span>
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-muted text-muted-foreground tracking-widest">{module.key}</span>
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground/60 tracking-widest">{module.resources.length} Capability Vectors Mapping</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="hidden md:flex flex-col items-end gap-1">
                       <div className="h-1 w-24 bg-muted rounded-full overflow-hidden">
                          <div className={cn("h-full bg-indigo-500 transition-all duration-1000 ease-out", isExpanded ? "w-full" : "w-1/4")}></div>
                       </div>
                       <span className="text-[10px] font-bold text-muted-foreground opacity-40">Load Balance Indicator</span>
                    </div>
                    <div className="h-10 w-10 flex items-center justify-center opacity-10">
                      <Command className="h-5 w-5" />
                    </div>
                  </div>
                </div>

                {/* Progress bar line at bottom */}
                <div className={cn("h-[2px] w-full bg-indigo-600/10", isExpanded ? "opacity-100" : "opacity-0 transition-opacity")}>
                  <div className={cn("h-full bg-indigo-600 transition-all duration-700 delay-300", isExpanded ? "w-full" : "w-0")}></div>
                </div>
              </div>

              {/* Nested Capability Matrix (Tree Sub-nodes) */}
              {isExpanded && (
                <div className="flex flex-col gap-4 mt-4 ml-6 md:ml-10 relative">
                  {/* Vertical Bridge Line */}
                  <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-indigo-100 dark:bg-indigo-950/60 rounded-full animate-in fade-in duration-1000"></div>

                  {module.resources.map((resource, index) => {
                    const allowedActions = allowedActionsMap[resource.key] || [];
                    const selectedActions = (currentPermissions[resource.key] || []);
                    const isAllSelected = allowedActions.length > 0 && allowedActions.every(a => selectedActions.includes(a.key));
                    const hasSomeSelected = selectedActions.length > 0;

                    return (
                      <div key={resource.id} className="relative pl-5 md:pl-6 group/resource animate-in slide-in-from-left-4 duration-500 ease-out fill-mode-both" style={{ animationDelay: `${index * 50}ms` }}>
                        {/* Horizontal Connector Line */}
                        <div className="absolute left-0 top-8 w-10 md:w-12 h-[2px] bg-indigo-100 dark:bg-indigo-950/60 rounded-full"></div>
                        
                        {/* Resource Node Card */}
                        <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/40 hover:border-indigo-200/60 hover:bg-white dark:hover:bg-slate-900 transition-all duration-300 py-2 px-4 shadow-sm hover:shadow-md">
                          <div className="flex flex-col xxl:flex-row xxl:items-center justify-between gap-8">
                            
                            {/* Entity Details */}
                            <div className="flex items-center gap-6 min-w-[280px]">
                              <div className={cn(
                                "h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-500 border-2 relative group-hover/resource:scale-110",
                                hasSomeSelected 
                                  ? "bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/40 dark:border-indigo-800" 
                                  : "bg-muted/30 border-transparent text-muted-foreground/60"
                              )}>
                                <Box className="h-6 w-6" />
                                {hasSomeSelected && (
                                  <div className="absolute -top-1 -right-1 flex h-4 w-4">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-4 w-4 bg-indigo-500 border-2 border-white dark:border-slate-800 shadow-sm shadow-indigo-200"></span>
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <span className="text-sm font-bold text-foreground transition-colors group-hover/resource:text-indigo-600 tracking-tight">{resource.name}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] font-bold text-muted-foreground/50 tracking-widest leading-none font-mono">{resource.key}</span>
                                  {isAllSelected && (
                                    <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded tracking-[0.2em] border border-emerald-100 dark:border-emerald-900/50">
                                      Root Access
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Dynamic Action Protocol Grid */}
                            <div className="flex-1">
                              {allowedActions.length > 0 ? (
                                <div className="flex flex-wrap gap-2.5">
                                  {/* Global Toggle in Grid for consistency */}
                                  <button
                                    onClick={() => toggleAllActions(resource.key)}
                                    className={cn(
                                      "h-9 px-4 rounded-xl text-xs font-bold tracking-widest transition-all duration-300 flex items-center gap-2 border shadow-sm active:scale-95",
                                      isAllSelected
                                        ? "bg-indigo-600 text-white border-transparent shadow-indigo-200"
                                        : "bg-indigo-50 border-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white hover:border-transparent dark:bg-indigo-950/40 dark:border-indigo-800"
                                    )}
                                  >
                                    <Zap className={cn("h-3.5 w-3.5", isAllSelected && "fill-current")} />
                                    {isAllSelected ? "Total Authority" : "Global Protocol"}
                                  </button>

                                  <div className="h-10 w-[1px] bg-border/20 mx-1"></div>

                                  {allowedActions.map((action) => {
                                    const isSelected = selectedActions.includes(action.key);
                                    return (
                                      <button
                                        key={action.id}
                                        onClick={() => toggleAction(resource.key, action.key)}
                                        className={cn(
                                          "h-9 px-4 rounded-xl text-xs font-bold tracking-widest transition-all duration-200 flex items-center gap-3 border shadow-sm group/btn active:scale-95",
                                          isSelected 
                                            ? "bg-white text-indigo-600 border-indigo-200 ring-2 ring-indigo-50 dark:bg-slate-900 dark:border-indigo-800 dark:ring-indigo-950/50 scale-[1.03]" 
                                            : "bg-background border-border text-muted-foreground/80 hover:border-indigo-400 hover:text-indigo-600"
                                        )}
                                      >
                                        <div className={cn(
                                          "h-4.5 w-4.5 rounded-lg flex items-center justify-center transition-all border-2",
                                          isSelected 
                                            ? "bg-indigo-600 border-indigo-600" 
                                            : "bg-muted/50 border-border group-hover/btn:border-indigo-200"
                                        )}>
                                          {isSelected && <Check className="h-2.5 w-2.5 stroke-[4px] text-white" />}
                                        </div>
                                        <span>{action.name}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="p-4 bg-muted/20 rounded-2xl border border-dashed border-border flex items-center gap-3 text-muted-foreground/30 italic">
                                   <Activity className="h-4 w-4" />
                                   <span className="text-xs font-bold tracking-[0.2em]">Matrix protocols undefined for this vector point</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

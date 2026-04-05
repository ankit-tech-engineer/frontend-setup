'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Users, Search, Loader2, Mail, Phone, ShieldCheck, ShieldAlert, BadgeCheck } from 'lucide-react';
import { getVendors, deleteVendor, activateLogin, deactivateLogin, Vendor } from '@/core/api/vendors';
import { Button, Input, Pagination } from '@/components/ui';
import { Modal } from '@/components/ui/Modal';
import { Popconfirm } from '@/components/ui/Popconfirm';
import { VendorForm } from './components/VendorForm';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/core/hooks/useDebounce';

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [isTogglingLogin, setIsTogglingLogin] = useState<number | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchVendors = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getVendors({
        limit,
        skip: (currentPage - 1) * limit,
        filter: debouncedSearchTerm ? { 
          $or: [
            { name: { $regex: debouncedSearchTerm, $options: 'i' } },
            { email: { $regex: debouncedSearchTerm, $options: 'i' } },
            { phone: { $regex: debouncedSearchTerm, $options: 'i' } }
          ]
        } : undefined
      });
      
      if (response.success) {
        setVendors(response.data);
        setTotal(response.meta.total);
      }
    } catch (error) {
      console.error('Failed to fetch vendors:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, limit, debouncedSearchTerm]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  // Reset page to 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  const handleDelete = async (vendorId: number) => {
    setIsDeleting(vendorId);
    try {
      await deleteVendor(vendorId);
      await fetchVendors();
    } catch (error) {
      console.error('Failed to delete vendor:', error);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleToggleLogin = async (vendor: Vendor) => {
    setIsTogglingLogin(vendor.id);
    try {
      if (vendor.isLoginActivate) {
        await deactivateLogin(vendor.id);
      } else {
        await activateLogin(vendor.id);
      }
      await fetchVendors();
    } catch (error) {
      console.error('Failed to toggle login activation:', error);
    } finally {
      setIsTogglingLogin(null);
    }
  };

  const handleEdit = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedVendor(null);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Vendor Ecosystem</h1>
          <p className="text-[10px] font-bold text-muted-foreground tracking-widest mt-1 opacity-70">Oversee your business partners and access protocols</p>
        </div>
        <Button onClick={handleAdd} className="flex items-center gap-2 shadow-lg shadow-indigo-100 dark:shadow-none tracking-widest text-[10px] font-black h-11 px-6 rounded-xl">
          <Plus className="h-4 w-4" />
          Onboard Partner
        </Button>
      </div>

      {/* Toolbar */}
      <div className="mb-6 flex items-center justify-between gap-4 bg-muted/20 dark:bg-muted/10 p-4 rounded-2xl border border-border/50 backdrop-blur-sm">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name, email, or phone..." 
            className="pl-10 h-10 border-none bg-background shadow-sm rounded-xl focus-visible:ring-1 focus-visible:ring-indigo-200 transition-all font-medium text-[11px] tracking-tight"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[10px] font-black tracking-widest text-muted-foreground bg-background px-4 py-2 rounded-xl border border-border/50 shadow-sm">
             Network Size: <span className="text-indigo-600 dark:text-indigo-400">{total}</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 flex flex-col bg-card rounded-2xl border border-border shadow-sm overflow-hidden transition-all duration-300 min-h-[500px]">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-20 text-muted-foreground gap-4">
            <div className="relative">
              <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
              <div className="absolute inset-0 h-10 w-10 border-4 border-indigo-100 dark:border-indigo-900 rounded-full -z-10 opacity-50"></div>
            </div>
            <p className="text-[10px] font-black tracking-widest animate-pulse">Synchronizing ecosystem data...</p>
          </div>
        ) : vendors.length > 0 ? (
          <>
            <div className="flex-1 overflow-x-auto scrollbar-hide">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/40 border-b border-border">
                    <th className="px-6 py-5 text-[10px] font-black tracking-widest text-muted-foreground/80 dark:text-muted-foreground/60 transition-colors uppercase">Vendor Details</th>
                    <th className="px-6 py-5 text-[10px] font-black tracking-widest text-muted-foreground/80">Communication</th>
                    <th className="px-6 py-5 text-[10px] font-black tracking-widest text-muted-foreground/80">Partner Type</th>
                    <th className="px-6 py-5 text-[10px] font-black tracking-widest text-muted-foreground/80">Access State</th>
                    <th className="px-6 py-5 text-[10px] font-black tracking-widest text-muted-foreground/80 text-right">Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {vendors.map((vendor) => (
                    <tr key={vendor._id} className="hover:bg-muted/20 transition-all duration-200 group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform shadow-sm">
                            <Users className="h-5 w-5" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-[11px] tracking-tight">{vendor.name}</span>
                            <span className="text-[9px] text-muted-foreground font-bold tracking-widest opacity-60 flex items-center gap-1">
                              {vendor.onTrial && <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 px-1 rounded-sm text-[8px]">TRIAL</span>}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-[10px] text-foreground font-medium">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            {vendor.email}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {vendor.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 tracking-wider bg-slate-100 dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200/50 dark:border-slate-800">
                          {vendor.vendorType?.name || 'Unclassified'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                           <div className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black tracking-[0.15em] border transition-all duration-300 w-fit",
                            vendor.status === 'active' 
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                              : "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
                          )}>
                            <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse", vendor.status === 'active' ? "bg-emerald-500" : "bg-rose-500")}></div>
                            {vendor.status}
                          </div>
                          
                          <div className={cn(
                            "inline-flex items-center gap-1.5 text-[8px] font-black tracking-widest",
                            vendor.isLoginActivate ? "text-emerald-500" : "text-amber-500"
                          )}>
                            {vendor.isLoginActivate ? <ShieldCheck className="h-3 w-3" /> : <ShieldAlert className="h-3 w-3" />}
                            {vendor.isLoginActivate ? "LOGIN ACTIVE" : "LOGIN DISABLED"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Popconfirm
                            title={vendor.isLoginActivate ? "Revoke Access" : "Grant Access"}
                            description={vendor.isLoginActivate ? "Are you sure you want to disable login for this vendor?" : "Authorize login credentials for this partner?"}
                            onConfirm={() => handleToggleLogin(vendor)}
                          >
                            <button 
                              disabled={isTogglingLogin === vendor.id}
                              className={cn(
                                "p-2 rounded-xl transition-all disabled:opacity-50",
                                vendor.isLoginActivate 
                                  ? "text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30" 
                                  : "text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                              )}
                              title={vendor.isLoginActivate ? "Disable Login" : "Enable Login"}
                            >
                              {isTogglingLogin === vendor.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                vendor.isLoginActivate ? <ShieldAlert className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />
                              )}
                            </button>
                          </Popconfirm>

                          <button 
                            onClick={() => handleEdit(vendor)}
                            className="p-2 text-muted-foreground hover:bg-white dark:hover:bg-indigo-950/30 hover:text-indigo-600 hover:shadow-sm rounded-xl transition-all"
                            title="Edit Profile"
                          >
                            <Edit className="h-4 w-4" />
                          </button>

                          <Popconfirm
                            title="Decommission Vendor"
                            description="Confirm removal of this partner from the ecosystem? This action may have downstream effects."
                            onConfirm={() => handleDelete(vendor.id)}
                          >
                            <button 
                              disabled={isDeleting === vendor.id}
                              className="p-2 text-muted-foreground hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 rounded-xl transition-all disabled:opacity-50"
                              title="Delete Record"
                            >
                              {isDeleting === vendor.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          </Popconfirm>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Component */}
            <Pagination
              currentPage={currentPage}
              total={total}
              limit={limit}
              onPageChange={setCurrentPage}
              onLimitChange={(newLimit) => {
                setLimit(newLimit);
                setCurrentPage(1);
              }}
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-20 gap-6">
             <div className="h-24 w-24 bg-muted/20 flex items-center justify-center rounded-[2.5rem] border border-border/50 shadow-inner">
               <Users className="h-10 w-10 text-muted-foreground/30" />
             </div>
             <div className="space-y-2">
               <p className="text-xl font-bold text-foreground tracking-tight">Ecosystem Clear</p>
               <p className="text-[10px] font-bold text-muted-foreground tracking-[0.2em] max-w-[320px] leading-relaxed mx-auto opacity-70">No vendors associated with this territory. Onboard your first partner to initiate collaboration.</p>
             </div>
             <Button onClick={handleAdd} variant="outline" className="mt-4 tracking-widest text-[9px] font-black h-11 px-8 rounded-xl border-dashed hover:border-solid transition-all transform hover:-translate-y-1">Establish Primary Partnership</Button>
          </div>
        )}
      </div>

      {/* CRUD Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedVendor ? "Refine Profile" : "Onboard New Partner"}
      >
        <VendorForm 
          vendor={selectedVendor}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchVendors();
          }}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, CreditCard, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { getPlans, Plan } from '@/core/api/subscriptions/plans';
import { manualAssignSubscription } from '@/core/api/subscriptions/subscriptions';
import { cn } from '@/lib/utils';

interface ManualSubscriptionFormProps {
  vendorId: number;
  vendorName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ManualSubscriptionForm: React.FC<ManualSubscriptionFormProps> = ({ vendorId, vendorName, onSuccess, onCancel }) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await getPlans({ filter: { status: 'active' } });
        if (response.success) {
          setPlans(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch plans:', err);
        setError('Failed to load subscription protocols.');
      } finally {
        setIsLoadingPlans(false);
      }
    };
    fetchPlans();
  }, []);

  const handleSubmit = async () => {
    if (!selectedPlanId) return;
    setIsSubmitting(true);
    setError(null);

    try {
      await manualAssignSubscription({ vendorId, planId: selectedPlanId });
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Assignment failed. Check ecosystem state.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pt-2">
      <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-500/20">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-black tracking-widest text-indigo-600 dark:text-indigo-400 uppercase">Target Entity</p>
            <p className="text-[11px] font-bold text-foreground tracking-tight">{vendorName}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-[10px] font-black tracking-widest text-muted-foreground uppercase ml-1">Select Provisioning Protocol</p>
        
        <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-hide">
          {isLoadingPlans ? (
            <div className="py-10 flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
              <p className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">Fetching Plans...</p>
            </div>
          ) : plans.length > 0 ? (
            plans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setSelectedPlanId(plan.id)}
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl border transition-all duration-300 group text-left",
                  selectedPlanId === plan.id 
                    ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-100 dark:shadow-none" 
                    : "bg-muted/10 border-border/50 hover:border-indigo-300 dark:hover:border-indigo-800"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "h-8 w-8 rounded-lg flex items-center justify-center transition-colors",
                    selectedPlanId === plan.id ? "bg-white/20" : "bg-white dark:bg-card border border-border group-hover:border-indigo-200"
                  )}>
                    {selectedPlanId === plan.id ? <CheckCircle2 className="h-4 w-4" /> : <ChevronRight className="h-4 w-4 text-indigo-600" />}
                  </div>
                  <div>
                    <p className="text-[11px] font-black tracking-tight">{plan.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={cn(
                        "text-[9px] font-bold",
                        selectedPlanId === plan.id ? "text-indigo-100" : "text-muted-foreground"
                      )}>${plan.price}</span>
                      <span className={cn(
                        "h-1 w-1 rounded-full",
                        selectedPlanId === plan.id ? "bg-indigo-200" : "bg-muted-foreground/30"
                      )} />
                      <span className={cn(
                        "text-[9px] font-bold",
                        selectedPlanId === plan.id ? "text-indigo-100" : "text-muted-foreground"
                      )}>{plan.validityDays} Days</span>
                    </div>
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="py-10 text-center border-2 border-dashed border-border/20 rounded-2xl">
              <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-50">No Active Plans Found</p>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-[10px] font-bold tracking-wider rounded-xl border border-rose-100 dark:border-rose-500/20 animate-in fade-in slide-in-from-top-1">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4">
        <Button 
          variant="outline" 
          onClick={onCancel}
          className="h-10 px-6 rounded-xl tracking-widest text-[10px] font-black uppercase text-muted-foreground hover:text-foreground"
        >
          Cancel
        </Button>
        <Button 
          disabled={!selectedPlanId || isSubmitting}
          onClick={handleSubmit}
          className="h-10 px-8 rounded-xl tracking-widest text-[10px] font-black uppercase shadow-lg shadow-indigo-100 dark:shadow-none bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 transition-all text-white"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              Provisioning
            </div>
          ) : 'Authorize Access'}
        </Button>
      </div>
    </div>
  );
};

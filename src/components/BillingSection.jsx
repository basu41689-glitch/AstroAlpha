import React from 'react';
import Button from './ui/button';
import { useSubscription } from '../hooks/useSubscription';
import { AlertCircle } from 'lucide-react';

export default function BillingSection() {
  const plan = useSubscription();

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-lg flex items-center justify-between">
      <div className="flex items-center gap-3">
        <AlertCircle className="w-6 h-6 text-yellow-400" />
        <div>
          <p className="text-sm text-slate-300">
            Current plan: <span className="font-semibold text-white capitalize">{plan || 'free'}</span>
          </p>
          {plan === 'free' && (
            <p className="text-xs text-slate-500">Upgrade to unlock premium features</p>
          )}
        </div>
      </div>
      <Button
        size="sm"
        className="bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500"
        onClick={() => {
          // placeholder handler
          alert('Billing / upgrade flow coming soon');
        }}
      >
        {plan === 'free' ? 'Upgrade to Pro' : 'Manage Subscription'}
      </Button>
    </div>
  );
}

import React from 'react';
import { ShieldCheck, Lock } from 'lucide-react';

export default function SecurityBadge() {
  return (
    <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mt-6 pt-4 border-t border-slate-100">
      <ShieldCheck className="w-4 h-4 text-emerald-600" />
      <span>256-Bit SSL Encrypted & Secure Authentication</span>
    </div>
  );
}

import React from 'react';
import { motion } from 'framer-motion';
import { BellRing } from 'lucide-react';
import SmartAlertSystem from '../components/alerts/SmartAlertSystem';

export default function Alerts() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-6 lg:p-8">
      <div className="relative z-10 max-w-4xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20">
            <BellRing className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Smart Alerts</h1>
        </motion.div>
        <SmartAlertSystem />
      </div>
    </div>
  );
}
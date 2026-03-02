import React from 'react';
import { motion } from 'framer-motion';
import { Scale } from 'lucide-react';
import PortfolioRebalancer from '../components/portfolio/PortfolioRebalancer';

export default function RebalancingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-6 lg:p-8">
      <div className="relative z-10 max-w-5xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
          <Scale className="w-8 h-8 text-violet-400" />
          <h1 className="text-2xl md:text-3xl font-bold text-white">AI Portfolio Rebalancing</h1>
        </motion.div>
        <PortfolioRebalancer />
      </div>
    </div>
  );
}
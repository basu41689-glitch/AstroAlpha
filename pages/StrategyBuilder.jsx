import React from 'react';
import { motion } from 'framer-motion';
import { Wand2 } from 'lucide-react';
import StrategyBuilder from '../components/strategy/StrategyBuilder';

export default function StrategyBuilderPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-6 lg:p-8">
      <div className="relative z-10 max-w-5xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20">
            <Wand2 className="w-8 h-8 text-violet-400" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">AI Strategy Builder</h1>
        </motion.div>
        <StrategyBuilder />
      </div>
    </div>
  );
}
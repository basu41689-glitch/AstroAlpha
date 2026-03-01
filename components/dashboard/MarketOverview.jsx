import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Activity, BarChart3, RefreshCw } from 'lucide-react';
import { cn } from "@/lib/utils";
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";

const MARKET_INDICES = [
  { name: 'NIFTY 50', value: 22856.75, change: 0.85, volume: '125.4Cr' },
  { name: 'SENSEX', value: 75234.90, change: 0.78, volume: '98.2Cr' },
  { name: 'BANK NIFTY', value: 48125.30, change: 1.23, volume: '45.8Cr' },
  { name: 'NIFTY IT', value: 35678.45, change: -0.56, volume: '32.1Cr' },
  { name: 'NIFTY MIDCAP', value: 52345.60, change: 1.45, volume: '28.5Cr' },
  { name: 'NIFTY SMALLCAP', value: 17892.30, change: 2.12, volume: '18.9Cr' },
];

export default function MarketOverview() {
  const [indices, setIndices] = useState(MARKET_INDICES);
  const [marketStatus, setMarketStatus] = useState('open');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setIndices(prev => prev.map(idx => ({
        ...idx,
        value: idx.value * (1 + (Math.random() - 0.5) * 0.001),
        change: idx.change + (Math.random() - 0.5) * 0.05
      })));
      setLastUpdated(new Date());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Market Overview</CardTitle>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs bg-emerald-500/20 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {marketStatus === 'open' ? 'Market Open' : 'Market Closed'}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {indices.map((index, i) => (
            <div key={index.name} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <p className="text-sm text-slate-400 mb-2">{index.name}</p>
              <p className="text-xl font-bold text-white font-mono">{index.value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
              <span className={cn("text-sm font-medium", index.change >= 0 ? "text-emerald-400" : "text-red-400")}>
                {index.change >= 0 ? '+' : ''}{index.change.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
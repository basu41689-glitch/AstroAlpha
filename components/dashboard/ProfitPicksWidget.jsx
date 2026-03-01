import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, RefreshCw, ArrowRight, Zap, Target, Shield } from 'lucide-react';
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ProfitPicksWidget() {
  const [picks, setPicks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const generateAIPicks = async () => {
    setIsLoading(true);
    const mockPicks = [
      { id: 1, symbol: 'TATAMOTORS', name: 'Tata Motors', currentPrice: 945.80, predictedChange: 3.5, confidence: 87, targetPrice: 978.90, stopLoss: 925.50, reasoning: 'Strong bullish momentum with RSI breakout and volume surge' },
      { id: 2, symbol: 'BAJFINANCE', name: 'Bajaj Finance', currentPrice: 6780.25, predictedChange: 2.8, confidence: 82, targetPrice: 6970.50, stopLoss: 6650.00, reasoning: 'MACD crossover with institutional buying detected' },
      { id: 3, symbol: 'HCLTECH', name: 'HCL Technologies', currentPrice: 1285.40, predictedChange: 2.1, confidence: 79, targetPrice: 1312.50, stopLoss: 1260.00, reasoning: 'Sector rotation into IT with positive FII flow' },
    ];
    await new Promise(r => setTimeout(r, 1500));
    setPicks(mockPicks);
    setLastUpdated(new Date());
    setIsLoading(false);
  };

  useEffect(() => { generateAIPicks(); }, []);

  return (
    <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700/50 overflow-hidden">
      <CardHeader className="border-b border-slate-700/50 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />Today's Profit Picks
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={generateAIPicks} disabled={isLoading} className="text-slate-400">
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        {picks.map((pick) => (
          <div key={pick.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div>
              <p className="font-bold text-white">{pick.symbol}</p>
              <p className="text-xs text-slate-400">{pick.name}</p>
              <div className="flex gap-2 mt-1 text-xs">
                <span className="text-slate-300">T: ₹{pick.targetPrice.toLocaleString()}</span>
                <span className="text-slate-300">SL: ₹{pick.stopLoss.toLocaleString()}</span>
              </div>
            </div>
            <div className="text-right">
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">+{pick.predictedChange}%</Badge>
              <p className="text-xs text-amber-400 mt-1">{pick.confidence}% conf</p>
            </div>
          </div>
        ))}
        <Link to={createPageUrl('StockAnalysis')}>
          <Button className="w-full mt-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
            Analyze More Stocks <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
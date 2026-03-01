import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, TrendingDown, Activity, Zap, RefreshCw, Bell, Download, ChevronRight, Sparkles, BarChart3, PieChart, Clock, Target } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import MarketOverview from '../components/dashboard/MarketOverview';
import ProfitPicksWidget from '../components/dashboard/ProfitPicksWidget';
import AIInsightCard from '../components/dashboard/AIInsightCard';
import PreMarketAlerts from '../components/alerts/PreMarketAlerts';
import DownloadSourceCode from '../components/dashboard/DownloadSourceCode';
import { base44 } from '@/api/base44Client';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsRefreshing(false);
  };

  const quickActions = [
    { label: 'Analyze Stock', icon: Brain, href: 'StockAnalysis', color: 'from-violet-500 to-purple-500', description: 'AI-powered analysis' },
    { label: 'Portfolio', icon: PieChart, href: 'Portfolio', color: 'from-blue-500 to-cyan-500', description: 'Track your holdings' },
    { label: 'Backtest', icon: BarChart3, href: 'Backtest', color: 'from-emerald-500 to-green-500', description: 'Test strategies' },
    { label: 'Alerts', icon: Bell, href: 'Alerts', color: 'from-amber-500 to-orange-500', description: 'Smart notifications' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-6 lg:p-8">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}! 👋</h1>
            <p className="text-slate-400 mt-1">Your AI-powered stock market assistant is ready</p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handleRefresh} variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:bg-slate-800">
              <RefreshCw className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")} />Refresh Data
            </Button>
            <Link to={createPageUrl('InstallApp')}>
              <Button size="sm" className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700">
                <Download className="w-4 h-4 mr-2" />Install App
              </Button>
            </Link>
          </div>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link key={action.label} to={createPageUrl(action.href)}>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 + index * 0.05 }} whileHover={{ scale: 1.02 }} className="group">
                <Card className="bg-slate-800/50 border-slate-700/50 hover:border-slate-600/50 transition-all cursor-pointer overflow-hidden">
                  <CardContent className="p-4">
                    <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center mb-3", action.color)}>
                      <action.icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-white group-hover:text-violet-400 transition-colors">{action.label}</h3>
                    <p className="text-xs text-slate-400">{action.description}</p>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-violet-400 transition-colors mt-2" />
                  </CardContent>
                </Card>
              </motion.div>
            </Link>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <MarketOverview />
            <AIInsightCard />
            <PreMarketAlerts />
          </div>
          <div className="space-y-6">
            <ProfitPicksWidget />
            <DownloadSourceCode />
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Brain, LayoutDashboard, LineChart, PieChart, FlaskConical, Bell, Download, Code2, Menu, X, ChevronRight, LogOut, User, Sparkles } from 'lucide-react';
import { cn } from "@/lib/utils";
import { base44 } from '@/api/base44Client';

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: 'Dashboard' },
  { name: 'Stock Analysis', icon: LineChart, href: 'StockAnalysis' },
  { name: 'Strategy Builder', icon: Brain, href: 'StrategyBuilder' },
  { name: 'News Sentiment', icon: Brain, href: 'NewsSentiment' },
  { name: 'Portfolio', icon: PieChart, href: 'Portfolio' },
  { name: 'Rebalancing', icon: PieChart, href: 'Rebalancing' },
  { name: 'Backtest', icon: FlaskConical, href: 'Backtest' },
  { name: 'Alerts', icon: Bell, href: 'Alerts' },
  { name: 'NSE+BSE Live', icon: LineChart, href: 'NSEBSEDashboard' },
  { name: 'API Docs', icon: Code2, href: 'APIDocumentation' },
  { name: 'Install App', icon: Download, href: 'InstallApp' },
];

export default function Layout({ children, currentPageName }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-40 w-72 bg-slate-900/95 border-r border-slate-800 transform transition-transform duration-300",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-800">
            <Link to={createPageUrl('Dashboard')} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div><h1 className="font-bold text-white text-lg">AI Stock</h1><p className="text-xs text-slate-400">Market Analyzer</p></div>
            </Link>
          </div>
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = currentPageName === item.href;
              return (
                <Link key={item.name} to={createPageUrl(item.href)} onClick={() => setIsSidebarOpen(false)}
                  className={cn("flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                    isActive ? "bg-gradient-to-r from-violet-500/20 to-purple-500/20 text-white border border-violet-500/30" : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                  )}>
                  <item.icon className={cn("w-5 h-5", isActive && "text-violet-400")} />
                  <span className="font-medium">{item.name}</span>
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto text-violet-400" />}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-slate-800">
            {user ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center"><User className="w-5 h-5 text-slate-400" /></div>
                  <div>
                    <p className="text-sm font-medium text-white truncate max-w-[120px]">{user.full_name || 'User'}</p>
                    <p className="text-xs text-slate-500 truncate max-w-[120px]">{user.email}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => base44.auth.logout()} className="text-slate-400 hover:text-white">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button onClick={() => base44.auth.redirectToLogin()} className="w-full bg-violet-600 hover:bg-violet-700">Sign In</Button>
            )}
          </div>
        </div>
      </aside>
      <main className="flex-1 min-h-screen overflow-x-hidden">{children}</main>
    </div>
  );
}
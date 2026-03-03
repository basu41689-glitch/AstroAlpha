import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Button from "@/components/ui/button";
import { RefreshCw } from 'lucide-react';

export default function PortfolioRebalancer() {
  const [rebalancing, setRebalancing] = useState(false);

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Portfolio Rebalancer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-400 text-sm">
            Rebalance your portfolio to match your target allocations
          </p>
          <Button 
            onClick={() => setRebalancing(!rebalancing)}
            className="bg-violet-600 hover:bg-violet-700"
          >
            {rebalancing ? 'Rebalancing...' : 'Rebalance Portfolio'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download } from 'lucide-react';

export default function DownloadSourceCode() {
  return (
    <Card className="bg-slate-800/50 border-slate-700/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Download className="w-4 h-4" />
          Source Code
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-slate-400 text-sm">Download options coming soon</p>
      </CardContent>
    </Card>
  );
}

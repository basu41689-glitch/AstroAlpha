// Future Chart Component - Heatmap Chart
// Sector/stock performance heatmap

import React from 'react';

/**
 * Heatmap Chart Component
 * Displays sector performance, stock correlation, or market heatmap
 * 
 * @param {Array} data - Matrix of values
 * @param {String} type - 'sector' or 'correlation'
 */
export default function HeatmapChart({ data, type = 'sector' }) {
  // TODO: Implement:
  // 1. Render color-coded grid
  // 2. Add labels for sectors/stocks
  // 3. Set color scale based on value range
  // 4. Add hover tooltips
  // 5. Support interactive hiding of items

  return (
    <div className="w-full h-96 bg-slate-800 rounded-lg p-4">
      <div className="text-slate-400 text-center py-20">
        [Heatmap Chart - Coming Soon]
      </div>
    </div>
  );
}

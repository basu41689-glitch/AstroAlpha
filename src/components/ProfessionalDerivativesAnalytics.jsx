/**
 * PROFESSIONAL DERIVATIVES ANALYTICS DASHBOARD
 * 
 * Clean, minimal React component for professional derivatives analysis
 * Features:
 * - Market snapshot with key metrics
 * - Interactive toggles for advanced analysis
 * - Real-time data refresh
 * - Tabbed interface (Summary / Heatmap / Greeks / Bias)
 * - Professional styling with TailwindCSS
 * 
 * This dashboard serves as the main UI for institutional traders
 */

import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import './ProfessionalDerivativesAnalytics.css';

const ProfessionalDerivativesAnalytics = () => {
    // State Management
    const [underlying, setUnderlying] = useState('NIFTY');
    const [expiry, setExpiry] = useState(null);
    const [activeTab, setActiveTab] = useState('summary');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // Data State
    const [summaryData, setSummaryData] = useState(null);
    const [heatmapData, setHeatmapData] = useState(null);
    const [greeksData, setGreeksData] = useState(null);
    const [biasData, setBiasData] = useState(null);
    const [refreshTime, setRefreshTime] = useState(null);

    // API Base URL
    const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3000/api/options';

    // ========================================================================
    // DATA FETCHING
    // ========================================================================

    /**
     * Fetch summary data from API
     */
    const fetchSummary = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            const url = new URL(`${API_BASE}/summary`);
            url.searchParams.append('underlying', underlying);
            if (expiry) url.searchParams.append('expiry', expiry);

            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) throw new Error(`API Error: ${response.statusCode}`);
            
            const data = await response.json();
            setSummaryData(data.summary || null);
            setRefreshTime(new Date().toLocaleTimeString());
            
        } catch (err) {
            setError(`Failed to fetch summary: ${err.message}`);
            if (process.env.NODE_ENV === 'development') console.error(err);
        } finally {
            setLoading(false);
        }
    }, [underlying, expiry, API_BASE]);

    /**
     * Fetch heatmap data
     */
    const fetchHeatmap = useCallback(async () => {
        try {
            const url = new URL(`${API_BASE}/heatmap`);
            url.searchParams.append('underlying', underlying);
            if (expiry) url.searchParams.append('expiry', expiry);

            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch heatmap');
            
            const data = await response.json();
            setHeatmapData(data.heatmap || null);
            
        } catch (err) {
            if (process.env.NODE_ENV === 'development') console.error('Heatmap fetch failed:', err);
        }
    }, [underlying, expiry, API_BASE]);

    /**
     * Fetch Greeks data
     */
    const fetchGreeks = useCallback(async () => {
        try {
            const url = new URL(`${API_BASE}/greeks`);
            url.searchParams.append('underlying', underlying);
            if (expiry) url.searchParams.append('expiry', expiry);

            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch Greeks');
            
            const data = await response.json();
            setGreeksData(data || null);
            
        } catch (err) {
            if (process.env.NODE_ENV === 'development') console.error('Greeks fetch failed:', err);
        }
    }, [underlying, expiry, API_BASE]);

    /**
     * Fetch Institutional Bias data
     */
    const fetchBias = useCallback(async () => {
        try {
            const url = new URL(`${API_BASE}/institutional-bias`);
            url.searchParams.append('underlying', underlying);
            if (expiry) url.searchParams.append('expiry', expiry);

            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch bias');
            
            const data = await response.json();
            setBiasData(data.bias || null);
            
        } catch (err) {
            if (process.env.NODE_ENV === 'development') console.error('Bias fetch failed:', err);
        }
    }, [underlying, expiry, API_BASE]);

    /**
     * Load all data
     */
    const loadAllData = useCallback(() => {
        fetchSummary();
        if (activeTab === 'heatmap') fetchHeatmap();
        if (activeTab === 'greeks') fetchGreeks();
        if (activeTab === 'bias') fetchBias();
    }, [activeTab, fetchSummary, fetchHeatmap, fetchGreeks, fetchBias]);

    // Initial load and auto-refresh
    useEffect(() => {
        loadAllData();
        const interval = setInterval(loadAllData, 30000); // 30s refresh
        return () => clearInterval(interval);
    }, [loadAllData]);

    // ========================================================================
    // RENDERING COMPONENTS
    // ========================================================================

    /**
     * Summary Card - Main dashboard
     */
    const renderSummaryCard = () => {
        if (!summaryData) return <div className="text-center py-8 text-gray-500">Loading...</div>;

        const { pcr, iv, maxPain, levels, bias } = summaryData;

        return (
            <div className="space-y-4">
                {/* Key Metrics Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* PCR */}
                    <MetricCard
                        label="PCR Ratio"
                        value={pcr.ratio.toFixed(4)}
                        subtext={pcr.interpretation}
                        trend={pcr.ratio > 1.2 ? 'up' : pcr.ratio < 0.8 ? 'down' : 'neutral'}
                    />
                    
                    {/* IV Rank */}
                    <MetricCard
                        label="IV Rank"
                        value={`${iv.rank.toFixed(1)}%`}
                        subtext={iv.condition}
                        trend={iv.rank > 70 ? 'up' : iv.rank < 30 ? 'down' : 'neutral'}
                    />
                    
                    {/* Max Pain */}
                    <MetricCard
                        label="Max Pain"
                        value={maxPain.level}
                        subtext="Expected level"
                        trend="neutral"
                    />
                    
                    {/* Institutional Bias */}
                    <MetricCard
                        label="Smart Money"
                        value={bias.institutional}
                        subtext={`${bias.probability}% confidence`}
                        trend={bias.institutional === 'BULLISH' ? 'up' : bias.institutional === 'BEARISH' ? 'down' : 'neutral'}
                    />
                </div>

                {/* Support / Resistance */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded border border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Support</h3>
                        <div className="space-y-1">
                            {levels.support.map((level, i) => (
                                <div key={i} className="text-sm text-gray-600">
                                    {level.level || 'N/A'} <span className="text-xs text-gray-400">OI: {level.oiConcentration}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded border border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Resistance</h3>
                        <div className="space-y-1">
                            {levels.resistance.map((level, i) => (
                                <div key={i} className="text-sm text-gray-600">
                                    {level.level || 'N/A'} <span className="text-xs text-gray-400">OI: {level.oiConcentration}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Advanced Toggle */}
                {showAdvanced && (
                    <div className="bg-blue-50 p-4 rounded border border-blue-200 space-y-2">
                        <h3 className="text-sm font-semibold text-blue-900">Key Insights</h3>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• PCR: {pcr.interpretation}</li>
                            <li>• IV Condition: {iv.condition} {iv.isSpike && '(SPIKE DETECTED)' || ''}</li>
                            <li>• Call OI: {pcr.totalCallOI.toLocaleString()}</li>
                            <li>• Put OI: {pcr.totalPutOI.toLocaleString()}</li>
                        </ul>
                    </div>
                )}
            </div>
        );
    };

    /**
     * Heatmap Tab
     */
    const renderHeatmapTab = () => {
        if (!heatmapData) return <div className="text-center py-8">Loading heatmap...</div>;

        const { summary, smartMoneyZones } = heatmapData;

        return (
            <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded border border-gray-200">
                    <h3 className="font-semibold mb-3">Heatmap Summary</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <span className="text-gray-600">Total Strikes</span>
                            <div className="font-semibold">{summary.totalStrikes}</div>
                        </div>
                        <div>
                            <span className="text-gray-600">ATM Strike</span>
                            <div className="font-semibold">{summary.atmStrike}</div>
                        </div>
                        <div>
                            <span className="text-gray-600">Max Pain</span>
                            <div className="font-semibold">{summary.maxPainLevel}</div>
                        </div>
                        <div>
                            <span className="text-gray-600">Smart Money Zones</span>
                            <div className="font-semibold">{summary.smartMoneyZonesCount}</div>
                        </div>
                    </div>
                </div>

                {smartMoneyZones && smartMoneyZones.length > 0 && (
                    <div className="bg-purple-50 p-4 rounded border border-purple-200">
                        <h3 className="font-semibold mb-3 text-purple-900">Smart Money Accumulation</h3>
                        <div className="space-y-2">
                            {smartMoneyZones.slice(0, 5).map((zone, i) => (
                                <div key={i} className="text-sm bg-white p-2 rounded border border-purple-100">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold">{zone.strike}</span>
                                        <span className={`text-xs px-2 py-1 rounded ${
                                            zone.type === 'BUYER' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {zone.type}
                                        </span>
                                        <span className="text-xs text-gray-600">{zone.reason}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    /**
     * Greeks Tab
     */
    const renderGreeksTab = () => {
        if (!greeksData) return <div className="text-center py-8">Loading Greeks...</div>;

        const { portfolio } = greeksData;

        return (
            <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded border border-gray-200">
                    <h3 className="font-semibold mb-3">Portfolio Greeks</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                        {portfolio.greeks && (
                            <>
                                <MetricCard label="Delta" value={portfolio.greeks.delta.toFixed(3)} />
                                <MetricCard label="Gamma" value={portfolio.greeks.gamma.toFixed(6)} />
                                <MetricCard label="Theta" value={portfolio.greeks.theta.toFixed(3)} />
                                <MetricCard label="Vega" value={portfolio.greeks.vega.toFixed(3)} />
                                <MetricCard label="Rho" value={portfolio.greeks.rho.toFixed(3)} />
                            </>
                        )}
                    </div>
                </div>
                <div className="bg-blue-50 p-4 rounded border border-blue-200 text-sm text-blue-800">
                    <p>{portfolio.interpretation}</p>
                </div>
            </div>
        );
    };

    /**
     * Institutional Bias Tab
     */
    const renderBiasTab = () => {
        if (!biasData) return <div className="text-center py-8">Loading bias data...</div>;

        return (
            <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded border border-gray-200">
                    <h3 className="font-semibold mb-3">Institutional Positioning</h3>
                    <div className="space-y-3">
                        <div>
                            <label className="text-sm text-gray-600">Direction</label>
                            <div className={`text-2xl font-bold ${
                                biasData.direction === 'BULLISH' ? 'text-green-600' :
                                biasData.direction === 'BEARISH' ? 'text-red-600' : 'text-gray-600'
                            }`}>
                                {biasData.direction}
                            </div>
                        </div>
                        <div>
                            <label className="text-sm text-gray-600">Probability</label>
                            <div className="text-xl font-semibold">{biasData.probability}%</div>
                        </div>
                        <div>
                            <label className="text-sm text-gray-600">Confidence</label>
                            <div className="text-sm">{biasData.confidence}</div>
                        </div>
                    </div>
                </div>

                <div className="bg-blue-50 p-4 rounded border border-blue-200">
                    <h3 className="font-semibold text-blue-900 mb-2">Interpretation</h3>
                    <p className="text-sm text-blue-800">{biasData.interpretation}</p>
                </div>

                {biasData.signals && biasData.signals.length > 0 && (
                    <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
                        <h3 className="font-semibold text-yellow-900 mb-2">Key Signals</h3>
                        <ul className="text-sm text-yellow-800 space-y-1">
                            {biasData.signals.map((signal, i) => (
                                <li key={i}>• {signal}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        );
    };

    // ========================================================================
    // MAIN RENDER
    // ========================================================================

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
            {/* Header */}
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Professional Derivatives Analytics</h1>
                        <p className="text-sm text-gray-600 mt-1">Indian Options Market Analysis • Smart Money Detection</p>
                    </div>
                    <div className="text-right">
                        {refreshTime && <p className="text-xs text-gray-500">Last refresh: {refreshTime}</p>}
                        <button
                            onClick={loadAllData}
                            disabled={loading}
                            className="mt-1 p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                        >
                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex gap-4 mb-6 flex-wrap">
                    <select
                        value={underlying}
                        onChange={(e) => setUnderlying(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded bg-white text-sm font-medium"
                    >
                        <option value="NIFTY">NIFTY</option>
                        <option value="BANKNIFTY">BANKNIFTY</option>
                        <option value="FINNIFTY">FINNIFTY</option>
                        <option value="MIDCPNIFTY">MIDCPNIFTY</option>
                    </select>

                    <input
                        type="date"
                        value={expiry || ''}
                        onChange={(e) => setExpiry(e.target.value || null)}
                        className="px-4 py-2 border border-gray-300 rounded text-sm"
                    />

                    <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                            showAdvanced
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        }`}
                    >
                        {showAdvanced ? 'Hide' : 'Show'} Advanced
                    </button>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded flex items-start gap-3">
                        <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-red-900">Error</h3>
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="mb-6 border-b border-gray-300 flex gap-1">
                    {['summary', 'heatmap', 'greeks', 'bias'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 ${
                                activeTab === tab
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    {activeTab === 'summary' && renderSummaryCard()}
                    {activeTab === 'heatmap' && renderHeatmapTab()}
                    {activeTab === 'greeks' && renderGreeksTab()}
                    {activeTab === 'bias' && renderBiasTab()}
                </div>

                {/* Footer */}
                <div className="mt-8 text-center text-xs text-gray-500">
                    <p>Professional Options Analytics Engine • Production Grade • Indian NSE Markets</p>
                </div>
            </div>
        </div>
    );
};

/**
 * Reusable Metric Card Component
 */
const MetricCard = ({ label, value, subtext, trend }) => (
    <div className="bg-gray-50 p-3 rounded border border-gray-200">
        <div className="text-xs text-gray-600 font-medium mb-1">{label}</div>
        <div className="flex items-center justify-between gap-2">
            <div className="text-lg font-bold text-gray-900">{value}</div>
            {trend === 'up' && <TrendingUp size={16} className="text-green-500" />}
            {trend === 'down' && <TrendingDown size={16} className="text-red-500" />}
        </div>
        {subtext && <div className="text-xs text-gray-500 mt-1">{subtext}</div>}
    </div>
);

export default ProfessionalDerivativesAnalytics;

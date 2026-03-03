import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Layout';
import { AuthProvider } from './hooks/useAuth';
import PrivateRoute from './components/PrivateRoute';

// lazy imports for code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Portfolio = lazy(() => import('./pages/Portfolio'));
const StockAnalysis = lazy(() => import('./pages/StockAnalysis'));
const RiskCalculator = lazy(() => import('./pages/RiskCalculator'));
const OptionsAnalyzer = lazy(() => import('./pages/OptionsAnalyzer'));
const Backtest = lazy(() => import('./pages/Backtest'));
const NewsSentiment = lazy(() => import('./pages/NewsSentiment'));
const StrategyBuilder = lazy(() => import('./pages/StrategyBuilder'));
const Alerts = lazy(() => import('./pages/Alerts'));
const Rebalancing = lazy(() => import('./pages/Rebalancing'));
const NSEBSEDashboard = lazy(() => import('./pages/NSEBSEDashboard'));
const ProfessionalDerivativesAnalytics = lazy(() => import('./components/ProfessionalDerivativesAnalytics'));
const APIDocumentation = lazy(() => import('./pages/APIDocumentation'));
const InstallApp = lazy(() => import('./pages/InstallApp'));
const Billing = lazy(() => import('./pages/Billing'));


function App() {
  const routes = [
    { path: '/dashboard', component: Dashboard, name: 'Dashboard' },
    { path: '/portfolio', component: Portfolio, name: 'Portfolio' },
    { path: '/stockanalysis', component: StockAnalysis, name: 'StockAnalysis' },
    { path: '/riskcalculator', component: RiskCalculator, name: 'RiskCalculator' },
    { path: '/optionsanalyzer', component: OptionsAnalyzer, name: 'OptionsAnalyzer' },
    { path: '/backtest', component: Backtest, name: 'Backtest' },
    { path: '/newsentiment', component: NewsSentiment, name: 'NewsSentiment' },
    { path: '/strategybuilder', component: StrategyBuilder, name: 'StrategyBuilder' },
    { path: '/alerts', component: Alerts, name: 'Alerts' },
    { path: '/rebalancing', component: Rebalancing, name: 'Rebalancing' },
    { path: '/nsebsedashboard', component: NSEBSEDashboard, name: 'NSEBSEDashboard' },
    { path: '/professional', component: ProfessionalDerivativesAnalytics, name: 'ProfessionalAnalytics' },
    { path: '/apidocumentation', component: APIDocumentation, name: 'APIDocumentation' },
    { path: '/installapp', component: InstallApp, name: 'InstallApp' },
    { path: '/billing', component: Billing, name: 'Billing' },
  ];

  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<div className="p-4">Loading...</div>}>
          <Routes>
            {routes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={
                  <PrivateRoute>
                    <Layout currentPageName={route.name}>
                      <route.component />
                    </Layout>
                  </PrivateRoute>
                }
              />
            ))}
            {/* Default route redirects to dashboard */}
            <Route
              path="/"
              element={<Navigate to="/dashboard" replace />}
            />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;
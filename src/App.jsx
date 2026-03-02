import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import Dashboard from './pages/Dashboard';
import Portfolio from './pages/Portfolio';
import StockAnalysis from './pages/StockAnalysis';
import RiskCalculator from './pages/RiskCalculator';
import OptionsAnalyzer from './pages/OptionsAnalyzer';
import Backtest from './pages/Backtest';
import NewsSentiment from './pages/NewsSentiment';
import StrategyBuilder from './pages/StrategyBuilder';
import Alerts from './pages/Alerts';
import Rebalancing from './pages/Rebalancing';
import NSEBSEDashboard from './pages/NSEBSEDashboard';

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
  ];

  return (
    <Router>
      <Routes>
        {routes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              <Layout currentPageName={route.name}>
                <route.component />
              </Layout>
            }
          />
        ))}
        {/* Default route */}
        <Route
          path="/"
          element={
            <Layout currentPageName="Dashboard">
              <Dashboard />
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
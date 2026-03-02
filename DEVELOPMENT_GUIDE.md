# AstroApla Development Guide

Complete guide for extending and developing the AstroApla platform.

---

## 📖 Quick Navigation

- **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** - Complete file organization
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System design & data flow
- **[ROADMAP.md](ROADMAP.md)** - Development phases & priorities
- **[README.md](README.md)** - Project overview
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Common commands

---

## 🚀 Getting Started

### 1. Setup Environment

```bash
# Clone repository
git clone <repo-url>
cd AstroApla

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your API keys

# Install backend dependencies  
cd server && npm install && cd ..
```

### 2. Start Development Servers

**Terminal 1 - Frontend:**
```bash
npm run dev
# Runs on http://localhost:5173
```

**Terminal 2 - Backend:**
```bash
npm run server
# Backend runs on port configured by $PORT or NODE_ENV

```

### 3. Verify Installation

- [ ] Frontend opens at `localhost:5173`
- [ ] Dashboard page loads
- [ ] Portfolio data displays
- [ ] Backend API responds to requests

---

## 🎯 Development Workflow

### Adding a New Feature

#### Step 1: Create Page Component
Location: `pages/NewFeature.jsx`

```jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Icon } from 'lucide-react';
import NewFeatureComponent from '../components/category/NewComponent';

export default function NewFeature() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-6 lg:p-8">
      <div className="relative z-10 max-w-7xl mx-auto space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="flex items-center gap-4"
        >
          <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20">
            <Icon className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Feature Title</h1>
            <p className="text-slate-400">Feature description</p>
          </div>
        </motion.div>
        <NewFeatureComponent />
      </div>
    </div>
  );
}
```

#### Step 2: Create Component
Location: `components/category/NewComponent.jsx`

```jsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function NewComponent() {
  const [state, setState] = useState(null);

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric items */}
      </div>

      {/* Feature Content */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">Feature Section</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Feature UI */}
        </CardContent>
      </Card>
    </div>
  );
}
```

#### Step 3: Add Route to Navigation
Location: `Layout.js`

```javascript
const navItems = [
  // ... existing items
  { name: 'New Feature', icon: IconName, href: 'NewFeature' },
];

// Import the icon at top
import { ..., NewIcon } from 'lucide-react';
```

#### Step 4: Create Backend Route (Optional)
Location: `server/routes/newfeature.js`

```javascript
import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  // Implement logic
  res.json({ message: 'Get data' });
});

router.post('/', (req, res) => {
  // Implement logic
  res.json({ message: 'Create data' });
});

export default router;
```

#### Step 5: Update Main Server
Location: `server/index.js`

```javascript
import newFeatureRoutes from './routes/newfeature.js';

app.use('/api/v1/newfeature', newFeatureRoutes);
```

---

## 📚 Using Utilities

### Frontend Utilities

#### Validators (`src/utils/validators.js`)
```javascript
import { validateEmail, validateStockSymbol } from '@/utils/validators';

if (!validateStockSymbol('RELIANCE')) {
  console.error('Invalid stock symbol');
}
```

#### Formatters (`src/utils/formatters.js`)
```javascript
import { formatPrice, formatPercent, formatDate } from '@/utils/formatters';

const priceStr = formatPrice(2500);        // ₹2,500.00
const pctStr = formatPercent(5.25);        // +5.25%
const dateStr = formatDate(new Date());    // 02/03/2026
```

#### Helpers (`src/utils/helpers.js`)
```javascript
import { 
  calculateReturns, 
  calculatePnL,
  getColorForValue 
} from '@/utils/helpers';

const ret = calculateReturns(11000, 10000);  // 10%
const pnl = calculatePnL(11000, 10000);      // 1000
const color = getColorForValue(250);         // #10b981
```

---

## 🎨 UI Components

### Using Built-in Components

#### Button
```jsx
import Button from '@/components/ui/Button';

<Button variant="default" size="md">Click Me</Button>
<Button variant="danger" size="lg">Delete</Button>
<Button variant="ghost" size="icon">×</Button>
```

#### Card
```jsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
</Card>
```

#### Input
```jsx
import Input from '@/components/ui/Input';

<Input 
  type="text" 
  placeholder="Enter text"
  onChange={(e) => setValue(e.target.value)}
/>

<Input 
  type="number" 
  placeholder="Enter price"
/>
```

---

## 🔄 Data Flow Pattern

All features should follow this pattern:

```
User Action → Component State → Backend API → Database → Response → UI Update
```

### Example: Portfolio Addition Flow

```javascript
// 1. User Action
const handleAddHolding = async () => {
  // 2. Validate Input
  if (!validatePortfolioHolding(newHolding)) {
    showError('Invalid holding data');
    return;
  }

  // 3. Call Backend API
  try {
    const response = await fetch('/api/v1/portfolio/holdings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newHolding)
    });

    if (!response.ok) {
      throw new Error('Failed to add holding');
    }

    const data = await response.json();

    // 4. Update State
    setHoldings([...holdings, data]);

    // 5. Show Success
    showSuccess('Holding added successfully');

    // 6. Reset Form
    setNewHolding({});
  } catch (error) {
    showError(error.message);
  }
};
```

---

## 🧪 Testing

### Running Tests
```bash
npm run test                    # Run all tests
npm run test:watch            # Watch mode
npm run test:coverage         # Coverage report
```

### Writing Tests
Location: `__tests__/`

```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import Component from '../components/Component';

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component />);
    expect(screen.getByText('Text')).toBeInTheDocument();
  });

  it('handles click event', () => {
    const handleClick = jest.fn();
    render(<Component onClick={handleClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

---

## 📊 Backend Implementation Pattern

### Portfolio API Example

```javascript
// server/routes/portfolio.js
import express from 'express';
import { 
  getPortfolios, 
  createPortfolio,
  updatePortfolio 
} from '../controllers/portfolioController.js';

const router = express.Router();

router.get('/', getPortfolios);
router.post('/', createPortfolio);
router.patch('/:id', updatePortfolio);

export default router;
```

```javascript
// server/controllers/portfolioController.js
export const getPortfolios = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Call service
    const portfolios = await portfolioService.getUserPortfolios(userId);
    
    res.json(portfolios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createPortfolio = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, description } = req.body;
    
    // Validate input
    if (!name) {
      return res.status(400).json({ error: 'Name required' });
    }
    
    // Call service
    const portfolio = await portfolioService.createPortfolio(userId, {
      name,
      description,
      created_at: new Date()
    });
    
    res.status(201).json(portfolio);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

```javascript
// server/services/portfolioService.js
export const portfolioService = {
  async getUserPortfolios(userId) {
    // Query database
    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data;
  },
  
  async createPortfolio(userId, portfolioData) {
    // Insert into database
    const { data, error } = await supabase
      .from('portfolios')
      .insert([{ user_id: userId, ...portfolioData }])
      .select();
    
    if (error) throw error;
    return data[0];
  }
};
```

---

## 🔐 Environment Variables

### Frontend (.env must start with VITE_)
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_KEY=your-supabase-anon-key
VITE_OPENAI_API_KEY=sk-your-openai-key
```

### Backend (.env)
```
NODE_ENV=development
PORT=3001
OPENAI_API_KEY=sk-your-openai-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-service-role-key
CORS_ORIGIN=http://localhost:5173
```

---

## 🐛 Debugging

### Browser DevTools
- Open DevTools: `F12` or `Cmd+J`
- Check Console for errors
- Use React DevTools extension
- Network tab to inspect API calls

### Backend Logging
```javascript
// Add logging to backend
console.log(`📥 Request: ${req.method} ${req.path}`);
console.log(`📤 Response: ${res.statusCode}`);
console.error(`❌ Error: ${error.message}`);
```

### Common Issues

| Issue | Solution |
|-------|----------|
| API not responding | Check backend running on port 3001 |
| CORS errors | Verify CORS_ORIGIN in .env |
| API key errors | Check .env variables are prefixed correctly |
| Database errors | Verify Supabase connection & tables exist |
| Chart not rendering | Check data format matches component requirements |

---

## 📦 Deployment Checklist

### Pre-deployment
- [ ] All tests pass: `npm run test`
- [ ] No console errors
- [ ] Environment variables set
- [ ] Database migrations run
- [ ] API endpoints tested

### Frontend Deployment (Vercel)
```bash
npm run build
# Vercel auto-deploys from main branch
```

### Backend Deployment
```bash
# Push to hosting platform
# Set environment variables
# Start server: npm start
```

### Post-deployment
- [ ] Verify all pages load
- [ ] Test API endpoints
- [ ] Monitor error logs
- [ ] Check performance metrics

---

## 📈 Performance Tips

### Frontend
- Use React.memo for expensive components
- Lazy load routes with React.lazy()
- Use debounce/throttle for search inputs
- Optimize images and assets
- Monitor bundle size with `npm run analyze`

### Backend
- Add database indexes for frequently queried columns
- Cache API responses with Redis
- Use connection pooling
- Implement rate limiting
- Monitor API performance

### Database
- Index foreign keys
- Archive old data
- Regular backups
- Query optimization
- Monitor slow queries

---

## 🔗 API Documentation

### Portfolio Endpoints
```
GET    /api/v1/portfolio              - List all portfolios
GET    /api/v1/portfolio/:id          - Get portfolio details
POST   /api/v1/portfolio              - Create new portfolio
PATCH  /api/v1/portfolio/:id          - Update portfolio
DELETE /api/v1/portfolio/:id          - Delete portfolio
POST   /api/v1/portfolio/:id/holdings - Add holding
DELETE /api/v1/portfolio/:id/holdings/:hid - Remove holding
```

### Analysis Endpoints
```
POST   /api/v1/analysis/portfolio     - AI portfolio analysis
POST   /api/v1/analysis/risk          - Risk analysis
POST   /api/v1/analysis/options       - Options analysis
POST   /api/v1/analysis/stock         - Stock analysis
```

---

## 📚 Additional Resources

- **Tailwind CSS**: https://tailwindcss.com/
- **React Docs**: https://react.dev/
- **Recharts**: https://recharts.org/
- **Framer Motion**: https://www.framer.com/motion/
- **Supabase**: https://supabase.com/docs
- **OpenAI API**: https://platform.openai.com/docs

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes following patterns in PROJECT_STRUCTURE.md
3. Write tests for new features
4. Update documentation
5. Submit pull request to `develop` branch

### Commit Message Format
```
feat: Add new feature
fix: Fix bug
refactor: Improve code
docs: Update documentation
test: Add tests
```

---

## 💡 Best Practices

1. **Components** - Keep small, reusable, and focused
2. **State** - Lift state only when necessary
3. **Props** - Prefer simple prop drilling over context for small apps
4. **Classes** - Use `cn()` utility for Tailwind classes
5. **Async** - Always handle errors with try/catch
6. **APIs** - Validate input on both frontend and backend
7. **Naming** - Use descriptive names for variables and functions
8. **Comments** - Document complex logic and edge cases
9. **Testing** - Test critical business logic
10. **Performance** - Profile before optimizing

---

## 🆘 Getting Help

- Check [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for file organization
- Review existing components for patterns
- Check [ROADMAP.md](ROADMAP.md) for planned features
- Review error messages in browser console
- Check backend logs for API errors

---

**Last Updated**: March 2, 2026
**Version**: 1.0.0


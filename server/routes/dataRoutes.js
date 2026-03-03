// Supabase data routes - uses service role key (backend only)
import express from 'express';
import { supabase } from '../supabaseClient.js';

const router = express.Router();

// ============================================================================
// ALERTS ENDPOINTS
// ============================================================================

// Get all alerts
router.get('/alerts', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('StockAlert')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('Error fetching alerts:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create alert
router.post('/alerts', async (req, res) => {
  try {
    const { stock_symbol, alert_type, target_value, is_active } = req.body;

    if (!stock_symbol || !alert_type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('StockAlert')
      .insert([
        {
          stock_symbol,
          alert_type,
          target_value,
          is_active: is_active !== false,
          is_triggered: false,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) throw error;
    res.status(201).json(data?.[0] || {});
  } catch (err) {
    console.error('Error creating alert:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update alert
router.put('/alerts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('StockAlert')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;
    res.json(data?.[0] || {});
  } catch (err) {
    console.error('Error updating alert:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete alert
router.delete('/alerts/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('StockAlert')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting alert:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// PORTFOLIO ENDPOINTS
// ============================================================================

// Get all portfolios
router.get('/portfolios', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('Portfolio')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('Error fetching portfolios:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create portfolio
router.post('/portfolios', async (req, res) => {
  try {
    const { name, description, initial_capital } = req.body;

    if (!name || !initial_capital) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('Portfolio')
      .insert([
        {
          name,
          description,
          initial_capital,
          current_capital: initial_capital,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) throw error;
    res.status(201).json(data?.[0] || {});
  } catch (err) {
    console.error('Error creating portfolio:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// STOCK DATA ENDPOINTS
// ============================================================================

// Get stock data
router.get('/stocks/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;

    const { data, error } = await supabase
      .from('Stock')
      .select('*')
      .eq('symbol', symbol)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    res.json(data || { symbol, data: null });
  } catch (err) {
    console.error('Error fetching stock:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;

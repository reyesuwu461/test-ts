import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

// Load environment variables from .env when present
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5173;

const distPath = path.join(__dirname, '..', 'dist');

// JSON body parsing
app.use(bodyParser.json());

// Connect to MongoDB if MONGO_URI is provided
const mongoUri = process.env.MONGO_URI || process.env.MONGO_URL;
if (mongoUri) {
  mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));
} else {
  console.warn('MONGO_URI not provided. Server will still serve static assets but API will use in-memory store.');
}

// Define a simple Product schema (compatible with frontend Product type)
const productSchema = new mongoose.Schema({
  vrm: String,
  manufacturer: String,
  model: String,
  type: String,
  fuel: String,
  color: String,
  vin: String,
  mileage: Number,
  registrationDate: String,
  price: String,
  ownerId: String,
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

// In-memory fallback store when Mongo isn't configured
const inMemoryProducts = [];

// Helper to choose store
const useDb = () => !!mongoose.connection.readyState;

// CRUD endpoints for products
app.get('/api/products', async (req, res) => {
  const page = Number(req.query.page || 1);
  const q = String(req.query.q || '');
  const pageSize = 10;
  if (useDb()) {
    const filter = q ? { $or: [ { vrm: { $regex: q, $options: 'i' } }, { model: { $regex: q, $options: 'i' } }, { manufacturer: { $regex: q, $options: 'i' } } ] } : {};
    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter).skip((page - 1) * pageSize).limit(pageSize).lean();
    return res.json({ summary: { total, totalPages: Math.ceil(total / pageSize), page, pageSize }, products });
  }
  // fallback
  const filtered = inMemoryProducts.filter(p => !q || p.model.toLowerCase().includes(q.toLowerCase()) || p.vrm.toLowerCase().includes(q.toLowerCase()));
  const total = filtered.length;
  const products = filtered.slice((page - 1) * pageSize, page * pageSize);
  res.json({ summary: { total, totalPages: Math.ceil(total / pageSize), page, pageSize }, products });
});

app.get('/api/products/:id', async (req, res) => {
  const id = req.params.id;
  if (useDb()) {
    const product = await Product.findById(id).lean();
    if (!product) return res.status(404).json({ error: 'Not found' });
    return res.json(product);
  }
  const p = inMemoryProducts.find(i => i.id === id || String(i._id) === id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  res.json(p);
});

app.post('/api/products', async (req, res) => {
  const body = req.body;
  if (useDb()) {
    const created = await Product.create(body);
    return res.status(201).json(created);
  }
  const id = String(Date.now());
  const item = { ...body, id };
  inMemoryProducts.push(item);
  res.status(201).json(item);
});

app.patch('/api/products/:id', async (req, res) => {
  const id = req.params.id;
  if (useDb()) {
    const updated = await Product.findByIdAndUpdate(id, req.body, { new: true }).lean();
    if (!updated) return res.status(404).json({ error: 'Not found' });
    return res.json(updated);
  }
  const idx = inMemoryProducts.findIndex(i => i.id === id || String(i._id) === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  inMemoryProducts[idx] = { ...inMemoryProducts[idx], ...req.body };
  res.json(inMemoryProducts[idx]);
});

app.delete('/api/products/:id', async (req, res) => {
  const id = req.params.id;
  if (useDb()) {
    await Product.findByIdAndDelete(id);
    return res.json({ ok: true });
  }
  const idx = inMemoryProducts.findIndex(i => i.id === id || String(i._id) === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  inMemoryProducts.splice(idx, 1);
  res.json({ ok: true });
});

// Auxiliary endpoints (simplified)
app.get('/api/manufacturers', async (req, res) => {
  if (useDb()) {
    const items = await Product.distinct('manufacturer');
    return res.json(items);
  }
  res.json([]);
});

app.get('/api/models', async (req, res) => {
  if (useDb()) {
    const items = await Product.distinct('model');
    return res.json(items);
  }
  res.json([]);
});

app.get('/api/types', async (req, res) => {
  if (useDb()) {
    const items = await Product.distinct('type');
    return res.json(items);
  }
  res.json([]);
});

app.get('/api/colors', async (req, res) => {
  if (useDb()) {
    const items = await Product.distinct('color');
    return res.json(items);
  }
  res.json([]);
});

// Simple login/register placeholders for demo/testing
app.post('/api/login', (req, res) => {
  const { email, password } = req.body || {};
  if (email === 'admin@example.com' && password === 'password') {
    return res.json({ token: 'dev-token', user: { id: '1', name: 'Admin', email, role: 'rolos admir' } });
  }
  if (email && password) {
    return res.json({ token: 'dev-token', user: { id: '2', name: 'User', email, role: 'user' } });
  }
  res.status(401).json({ error: 'Invalid credentials' });
});

app.post('/api/register', (req, res) => {
  const { username, email } = req.body || {};
  if (!email || !username) return res.status(400).json({ error: 'Missing' });
  // naive duplicate check in-memory
  if (inMemoryProducts.find(p => p.ownerId === email)) {
    return res.status(409).json({ error: 'exists' });
  }
  return res.status(201).json({ token: 'dev-token', user: { id: String(Date.now()), name: username, email, role: 'user' } });
});

// Serve static assets from dist
app.use(express.static(distPath));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Express server listening on http://localhost:${port}`);
});

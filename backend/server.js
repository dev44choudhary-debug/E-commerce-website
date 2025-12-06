const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Low, JSONFile } = require('lowdb');
const { nanoid } = require('nanoid');
const _ = require('lodash');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = process.env.JWT_SECRET || 'dev_secret_key';
const dbFile = path.join(__dirname, 'db.json');
const adapter = new JSONFile(dbFile);
const db = new Low(adapter);

// Initialize DB if empty
async function initDB() {
  await db.read();
  db.data = db.data || { users: [], products: [], orders: [] };

  // create a default admin and some products if not present
  if (!db.data.users.find(u => u.email === 'admin@example.com')) {
    const hash = await bcrypt.hash('admin123', 10);
    db.data.users.push({
      id: nanoid(),
      name: 'Admin',
      email: 'admin@example.com',
      password: hash,
      isAdmin: true
    });
  }
  if (db.data.products.length === 0) {
    db.data.products.push(
      { id: nanoid(), title: 'Wireless Headphones', description: 'Nice sound', price: 1999, image: '', stock: 10 },
      { id: nanoid(), title: 'Bluetooth Speaker', description: 'Party speaker', price: 2499, image: '', stock: 5 },
      { id: nanoid(), title: 'Smart Watch', description: 'Health tracking', price: 3499, image: '', stock: 8 }
    );
  }
  await db.write();
}
initDB();

// Middleware: authenticate JWT
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: 'Authorization required' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, SECRET);
    req.user = payload;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
}

// Middleware: admin only
function adminOnly(req, res, next) {
  if (!req.user || !req.user.isAdmin) return res.status(403).json({ message: 'Admin only' });
  next();
}

// Auth routes
app.post('/api/register', async (req, res) => {
  await db.read();
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });

  if (db.data.users.find(u => u.email === email)) {
    return res.status(400).json({ message: 'Email already exists' });
  }
  const hash = await bcrypt.hash(password, 10);
  const user = { id: nanoid(), name, email, password: hash, isAdmin: false };
  db.data.users.push(user);
  await db.write();
  const token = jwt.sign({ id: user.id, email: user.email, isAdmin: user.isAdmin, name: user.name }, SECRET);
  res.json({ token, user: _.omit(user, ['password']) });
});

app.post('/api/login', async (req, res) => {
  await db.read();
  const { email, password } = req.body;
  const user = db.data.users.find(u => u.email === email);
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(400).json({ message: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, email: user.email, isAdmin: user.isAdmin, name: user.name }, SECRET);
  res.json({ token, user: _.omit(user, ['password']) });
});

// Products
app.get('/api/products', async (req, res) => {
  await db.read();
  res.json(db.data.products);
});

app.get('/api/products/:id', async (req, res) => {
  await db.read();
  const p = db.data.products.find(x => x.id === req.params.id);
  if (!p) return res.status(404).json({ message: 'Product not found' });
  res.json(p);
});

// Admin add product
app.post('/api/admin/products', authMiddleware, adminOnly, async (req, res) => {
  await db.read();
  const { title, description, price, stock, image } = req.body;
  const product = { id: nanoid(), title, description, price: Number(price), stock: Number(stock||0), image: image || '' };
  db.data.products.push(product);
  await db.write();
  res.json(product);
});

// Orders
app.post('/api/orders', authMiddleware, async (req, res) => {
  await db.read();
  const { items, address, paymentMethod } = req.body;
  if (!items || !items.length) return res.status(400).json({ message: 'No items' });
  // create order
  const total = items.reduce((s, it) => s + (it.price * it.qty), 0);
  const order = {
    id: nanoid(),
    userId: req.user.id,
    items,
    address: address || '',
    paymentMethod: paymentMethod || 'COD',
    total,
    status: 'Placed',
    createdAt: new Date().toISOString()
  };
  db.data.orders.push(order);
  await db.write();
  // simple notification response
  res.json({ message: 'Order placed', order });
});

app.get('/api/myorders', authMiddleware, async (req, res) => {
  await db.read();
  const orders = db.data.orders.filter(o => o.userId === req.user.id);
  res.json(orders);
});

// Admin view orders & customers
app.get('/api/admin/orders', authMiddleware, adminOnly, async (req, res) => {
  await db.read();
  res.json(db.data.orders);
});
app.get('/api/admin/customers', authMiddleware, adminOnly, async (req, res) => {
  await db.read();
  const customers = db.data.users.map(u => _.omit(u, ['password']));
  res.json(customers);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log('Backend running on', PORT));

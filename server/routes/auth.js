import express from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import User from '../models/user.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

router.post('/register', authLimiter, async (req, res) => {
  const { username, password, fullName } = req.body;
  if (!username || !password || !fullName) return res.status(400).json({ error: 'Missing fields' });
  try {
    const user = await User.create(username, password, fullName);
    const token = jwt.sign({ id: user.id, username: user.username, fullName: user.fullName, isAdmin: user.isAdmin, isPremium: user.isPremium }, JWT_SECRET);
    res.json({ token, user: { id: user.id, username: user.username, fullName: user.fullName, isAdmin: user.isAdmin, isPremium: user.isPremium } });
  } catch (e) {
    res.status(400).json({ error: 'User exists' });
  }
});

router.post('/login', authLimiter, async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing fields' });
  const user = await User.validatePassword(username, password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, username: user.username, isAdmin: user.isAdmin, isPremium: user.isPremium ?? 0 }, JWT_SECRET);
  res.json({ token, user: { id: user.id, username: user.username, fullName: user.fullName, isAdmin: user.isAdmin, isPremium: user.isPremium ?? 0 } });
});

router.get('/subscription', authLimiter, auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ isPremium: user.isPremium === 1 });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch subscription status' });
  }
});

export default router;

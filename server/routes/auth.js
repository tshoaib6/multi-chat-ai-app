import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

router.post('/register', async (req, res) => {
  const { username, password, fullName } = req.body;
  if (!username || !password || !fullName) return res.status(400).json({ error: 'Missing fields' });
  try {
    const user = await User.create(username, password, fullName);
    const token = jwt.sign({ id: user.id, username: user.username, fullName: user.fullName, isAdmin: user.isAdmin }, JWT_SECRET);
    res.json({ token, user });
  } catch (e) {
    res.status(400).json({ error: 'User exists' });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing fields' });
  const user = await User.validatePassword(username, password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, username: user.username, isAdmin: user.isAdmin }, JWT_SECRET);
  res.json({ token, user });
});

export default router;

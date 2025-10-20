import express from 'express';
import jwt from 'jsonwebtoken';
import Chat from '../models/chat.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

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

router.post('/', auth, async (req, res) => {
  const { title, messages } = req.body;
  const chat = await Chat.create(req.user.id, title, messages);
  res.json(chat);
});

router.get('/', auth, async (req, res) => {
  const chats = await Chat.listByUser(req.user.id);
  res.json(chats);
});

router.get('/:id', auth, async (req, res) => {
  const chat = await Chat.get(req.params.id);
  if (!chat || chat.userId !== req.user.id) return res.status(404).json({ error: 'Not found' });
  res.json(chat);
});

export default router;

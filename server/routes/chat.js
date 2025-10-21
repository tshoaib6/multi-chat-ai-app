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
  const { title, topicId, messages, isPublic } = req.body;
  console.log('[POST /chat] Creating chat with:', { userId: req.user.id, title, topicId, messages, isPublic });
  const chat = await Chat.create(req.user.id, title, topicId, messages, isPublic ? 1 : 0);
  res.json(chat);
});
// List public chats
router.get('/public', auth, async (req, res) => {
  const chats = await Chat.listPublic();
  res.json(chats);
});

// Join a public chat as participant
router.post('/:id/join', auth, async (req, res) => {
  const chatId = req.params.id;
  const userId = req.user.id;
  const participants = await Chat.joinParticipant(chatId, userId);
  res.json({ participants });
});

// Toggle chat privacy
router.post('/:id/privacy', auth, async (req, res) => {
  const chatId = req.params.id;
  const { isPublic } = req.body;
  await Chat.togglePrivacy(chatId, isPublic);
  res.json({ success: true });
});

// Delete chat
router.delete('/:id', auth, async (req, res) => {
  const chatId = req.params.id;
  try {
    await Chat.delete(chatId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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

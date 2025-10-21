import getDb from '../db.js';

const Chat = {
  async create(userId, title, topicId, messages, isPublic = 0) {
    const db = await getDb();
    console.log('[Chat.create] Creating chat:', { userId, title, topicId, messages, isPublic });
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO chats (userId, title, topicId, messages, isPublic, participants) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, title, topicId, JSON.stringify(messages), isPublic, JSON.stringify([userId])],
        function (err) {
          if (err) {
            console.error('[Chat.create] DB error:', err);
            return reject(err);
          }
          console.log('[Chat.create] Chat created with id:', this.lastID);
          resolve({ id: this.lastID, userId, title, topicId, messages, isPublic, participants: [userId] });
        }
      );
    });
  },
  async listByUser(userId) {
    const db = await getDb();
    console.log('[Chat.listByUser] Listing chats for user:', userId);
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM chats WHERE userId = ? OR participants LIKE ? ORDER BY createdAt DESC', [userId, `%${userId}%`], (err, rows) => {
        if (err) {
          console.error('[Chat.listByUser] DB error:', err);
          return reject(err);
        }
        rows.forEach(r => {
          r.messages = JSON.parse(r.messages);
          r.participants = JSON.parse(r.participants || '[]');
        });
        console.log(`[Chat.listByUser] Found ${rows.length} chats for user ${userId}`);
        resolve(rows);
      });
    });
  },

  async delete(chatId) {
    const db = await getDb();
    console.log('[Chat.delete] Deleting chat:', chatId);
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM chats WHERE id = ?', [chatId], (err) => {
        if (err) {
          console.error('[Chat.delete] DB error:', err);
          return reject(err);
        }
        resolve();
      });
    });
  },

  async listPublic() {
    const db = await getDb();
    console.log('[Chat.listPublic] Listing all public chats');
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM chats WHERE isPublic = 1 ORDER BY createdAt DESC', [], (err, rows) => {
        if (err) {
          console.error('[Chat.listPublic] DB error:', err);
          return reject(err);
        }
        rows.forEach(r => {
          r.messages = JSON.parse(r.messages);
          r.participants = JSON.parse(r.participants || '[]');
        });
        console.log(`[Chat.listPublic] Found ${rows.length} public chats`);
        resolve(rows);
      });
    });
  },

  async joinParticipant(chatId, userId) {
    const db = await getDb();
    console.log(`[Chat.joinParticipant] User ${userId} joining chat ${chatId}`);
    return new Promise((resolve, reject) => {
      db.get('SELECT participants FROM chats WHERE id = ?', [chatId], (err, row) => {
        if (err) {
          console.error('[Chat.joinParticipant] DB error:', err);
          return reject(err);
        }
        let participants = row ? JSON.parse(row.participants || '[]') : [];
        if (!participants.includes(userId)) participants.push(userId);
        db.run('UPDATE chats SET participants = ? WHERE id = ?', [JSON.stringify(participants), chatId], function (err2) {
          if (err2) {
            console.error('[Chat.joinParticipant] DB error:', err2);
            return reject(err2);
          }
          console.log(`[Chat.joinParticipant] Chat ${chatId} participants updated:`, participants);
          resolve(participants);
        });
      });
    });
  },

  async togglePrivacy(chatId, isPublic) {
    const db = await getDb();
    console.log(`[Chat.togglePrivacy] Setting chat ${chatId} isPublic=${isPublic}`);
    return new Promise((resolve, reject) => {
      db.run('UPDATE chats SET isPublic = ? WHERE id = ?', [isPublic ? 1 : 0, chatId], function (err) {
        if (err) {
          console.error('[Chat.togglePrivacy] DB error:', err);
          return reject(err);
        }
        resolve(true);
      });
    });
  },
  async get(id) {
    const db = await getDb();
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM chats WHERE id = ?', [id], (err, row) => {
        if (err) return reject(err);
        if (row) row.messages = JSON.parse(row.messages);
        resolve(row);
      });
    });
  },
};

export default Chat;

import getDb from '../db.js';

const Chat = {
  async create(userId, title, messages) {
    const db = await getDb();
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO chats (userId, title, messages) VALUES (?, ?, ?)',
        [userId, title, JSON.stringify(messages)],
        function (err) {
          if (err) return reject(err);
          resolve({ id: this.lastID, userId, title, messages });
        }
      );
    });
  },
  async listByUser(userId) {
    const db = await getDb();
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM chats WHERE userId = ? ORDER BY createdAt DESC', [userId], (err, rows) => {
        if (err) return reject(err);
        rows.forEach(r => r.messages = JSON.parse(r.messages));
        resolve(rows);
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

import getDb from '../db.js';
import bcrypt from 'bcryptjs';

const User = {
  async create(username, password, isAdmin = 0) {
    const db = await getDb();
    // Check if user exists first
    const existing = await User.findByUsername(username);
    if (existing) {
      throw new Error('Username already exists');
    }
    const passwordHash = await bcrypt.hash(password, 10);
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO users (username, passwordHash, isAdmin) VALUES (?, ?, ?)',
        [username, passwordHash, isAdmin],
        function (err) {
          if (err) return reject(err);
          resolve({ id: this.lastID, username, isAdmin });
        }
      );
    });
  },
  async findByUsername(username) {
    const db = await getDb();
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  },
  async validatePassword(username, password) {
    const user = await User.findByUsername(username);
    if (!user) return false;
    const valid = await bcrypt.compare(password, user.passwordHash);
    return valid ? user : false;
  },
};

export default User;

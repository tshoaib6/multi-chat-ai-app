import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'db.sqlite');

let dbInstance = null;
export default async function getDb() {
  if (!dbInstance) {
    const sqlite3 = await import('sqlite3');
    dbInstance = new sqlite3.default.Database(dbPath);
    // Create tables if not exist
    dbInstance.serialize(() => {
      dbInstance.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        passwordHash TEXT,
        isAdmin INTEGER DEFAULT 0
      )`);
      dbInstance.run(`CREATE TABLE IF NOT EXISTS chats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        title TEXT,
        topicId TEXT,
        messages TEXT,
        isPublic INTEGER DEFAULT 0,
        participants TEXT DEFAULT '[]',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(userId) REFERENCES users(id)
      )`);
    });
  }
  return dbInstance;
}

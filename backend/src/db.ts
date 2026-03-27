import Database from 'better-sqlite3'
import { resolve } from 'path'
import { mkdirSync } from 'fs'

const DB_DIR = resolve(import.meta.dirname, '../../../data')
const DB_PATH = resolve(DB_DIR, 'conversations.db')

mkdirSync(DB_DIR, { recursive: true })

export const db = new Database(DB_PATH)

db.pragma('journal_mode = WAL')

db.exec(`
  CREATE TABLE IF NOT EXISTS conversations (
    id            TEXT PRIMARY KEY,
    status        TEXT NOT NULL,
    started_at    TEXT,
    ended_at      TEXT,
    agent_name    TEXT,
    customer_name TEXT,
    platform      TEXT,
    message_count INTEGER DEFAULT 0,
    synced_at     TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS messages (
    id              TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL,
    type            TEXT NOT NULL,
    content         TEXT,
    sender_role     TEXT NOT NULL,
    sent_at         TEXT NOT NULL,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id)
  );

  CREATE INDEX IF NOT EXISTS idx_conv_started  ON conversations(started_at);
  CREATE INDEX IF NOT EXISTS idx_msg_conv_id   ON messages(conversation_id);
`)

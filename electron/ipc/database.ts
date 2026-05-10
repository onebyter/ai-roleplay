import { ipcMain } from 'electron'
import Database from 'better-sqlite3'
import path from 'path'
import { app } from 'electron'
import fs from 'fs'

let db: Database.Database | null = null

function getDB(): Database.Database {
  if (db) return db

  const dbPath = path.join(app.getPath('userData'), 'ai-roleplay.db')
  db = new Database(dbPath)

  // Initialize schema
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      data TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS characters (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      data TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS api_configs (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      base_url TEXT NOT NULL,
      api_key TEXT NOT NULL,
      models TEXT NOT NULL DEFAULT '[]'
    );
  `)

  return db
}

export function setupDatabaseIPC() {
  ipcMain.handle('db:query', async (_event, sql: string, params?: any[]) => {
    const database = getDB()
    return database.prepare(sql).all(...(params || []))
  })

  ipcMain.handle('db:run', async (_event, sql: string, params?: any[]) => {
    const database = getDB()
    return database.prepare(sql).run(...(params || []))
  })

  ipcMain.handle('db:saveSession', async (_event, session: any) => {
    const database = getDB()
    const stmt = database.prepare(`
      INSERT OR REPLACE INTO sessions (id, name, data, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `)
    stmt.run(session.id, session.name, JSON.stringify(session), session.createdAt, Date.now())
    return { success: true }
  })

  ipcMain.handle('db:loadSession', async (_event, id: string) => {
    const database = getDB()
    const row = database.prepare('SELECT data FROM sessions WHERE id = ?').get(id) as any
    if (row) {
      return JSON.parse(row.data)
    }
    return null
  })

  ipcMain.handle('db:listSessions', async () => {
    const database = getDB()
    return database.prepare('SELECT id, name, created_at, updated_at FROM sessions ORDER BY updated_at DESC').all()
  })

  ipcMain.handle('db:deleteSession', async (_event, id: string) => {
    const database = getDB()
    database.prepare('DELETE FROM sessions WHERE id = ?').run(id)
    return { success: true }
  })
}

import { ipcMain } from 'electron'
import { app } from 'electron'
import path from 'path'
import fs from 'fs'

// sql.js - pure JS SQLite, no native compilation needed
let db: any = null
let SQL: any = null
let dbPath: string = ''

async function getDB() {
  if (db) return db

  const initSqlJs = require('sql.js')
  SQL = await initSqlJs()

  dbPath = path.join(app.getPath('userData'), 'ai-roleplay.db')

  // Load existing database or create new one
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath)
    db = new SQL.Database(buffer)
  } else {
    db = new SQL.Database()
  }

  // Initialize schema
  db.run(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      data TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `)
  db.run(`
    CREATE TABLE IF NOT EXISTS characters (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      data TEXT NOT NULL,
      created_at INTEGER NOT NULL
    )
  `)
  db.run(`
    CREATE TABLE IF NOT EXISTS api_configs (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      base_url TEXT NOT NULL,
      api_key TEXT NOT NULL,
      models TEXT NOT NULL DEFAULT '[]'
    )
  `)

  saveDB()
  return db
}

function saveDB() {
  if (db && dbPath) {
    const data = db.export()
    const buffer = Buffer.from(data)
    fs.writeFileSync(dbPath, buffer)
  }
}

export function setupDatabaseIPC() {
  ipcMain.handle('db:query', async (_event, sql: string, params?: any[]) => {
    const database = await getDB()
    const stmt = database.prepare(sql)
    if (params) stmt.bind(params)
    const results: any[] = []
    while (stmt.step()) {
      results.push(stmt.getAsObject())
    }
    stmt.free()
    return results
  })

  ipcMain.handle('db:run', async (_event, sql: string, params?: any[]) => {
    const database = await getDB()
    database.run(sql, params || [])
    saveDB()
    return { success: true }
  })

  ipcMain.handle('db:saveSession', async (_event, session: any) => {
    const database = await getDB()
    database.run(
      'INSERT OR REPLACE INTO sessions (id, name, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
      [session.id, session.name, JSON.stringify(session), session.createdAt, Date.now()]
    )
    saveDB()
    return { success: true }
  })

  ipcMain.handle('db:loadSession', async (_event, id: string) => {
    const database = await getDB()
    const stmt = database.prepare('SELECT data FROM sessions WHERE id = ?')
    stmt.bind([id])
    if (stmt.step()) {
      const row = stmt.getAsObject()
      stmt.free()
      return JSON.parse(row.data as string)
    }
    stmt.free()
    return null
  })

  ipcMain.handle('db:listSessions', async () => {
    const database = await getDB()
    const stmt = database.prepare('SELECT id, name, created_at, updated_at FROM sessions ORDER BY updated_at DESC')
    const results: any[] = []
    while (stmt.step()) {
      results.push(stmt.getAsObject())
    }
    stmt.free()
    return results
  })

  ipcMain.handle('db:deleteSession', async (_event, id: string) => {
    const database = await getDB()
    database.run('DELETE FROM sessions WHERE id = ?', [id])
    saveDB()
    return { success: true }
  })
}

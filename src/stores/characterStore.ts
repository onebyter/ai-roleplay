import { create } from 'zustand'
import { Character } from '@/types/character'
import { v4 as uuidv4 } from 'uuid'

interface CharacterState {
  characters: Character[]

  // Actions
  addCharacter: (character: Omit<Character, 'id' | 'createdAt'>) => Character
  updateCharacter: (id: string, updates: Partial<Character>) => void
  removeCharacter: (id: string) => void
  getCharacter: (id: string) => Character | undefined
  importCharacters: (characters: Character[]) => void
  loadCharacters: () => Promise<void>
}

export const useCharacterStore = create<CharacterState>((set, get) => ({
  characters: [],

  addCharacter: (character) => {
    const newChar: Character = {
      ...character,
      id: uuidv4(),
      createdAt: Date.now(),
    }
    set((state) => ({ characters: [...state.characters, newChar] }))
    // Persist
    window.electronAPI.db.run(
      'INSERT OR REPLACE INTO characters (id, name, data, created_at) VALUES (?, ?, ?, ?)',
      [newChar.id, newChar.name, JSON.stringify(newChar), newChar.createdAt]
    ).catch(console.error)
    return newChar
  },

  updateCharacter: (id, updates) =>
    set((state) => {
      const characters = state.characters.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      )
      const updated = characters.find((c) => c.id === id)
      if (updated) {
        window.electronAPI.db.run(
          'UPDATE characters SET name = ?, data = ? WHERE id = ?',
          [updated.name, JSON.stringify(updated), id]
        ).catch(console.error)
      }
      return { characters }
    }),

  removeCharacter: (id) =>
    set((state) => {
      window.electronAPI.db.run('DELETE FROM characters WHERE id = ?', [id]).catch(console.error)
      return { characters: state.characters.filter((c) => c.id !== id) }
    }),

  getCharacter: (id) => get().characters.find((c) => c.id === id),

  importCharacters: (characters) =>
    set((state) => {
      for (const char of characters) {
        window.electronAPI.db.run(
          'INSERT OR REPLACE INTO characters (id, name, data, created_at) VALUES (?, ?, ?, ?)',
          [char.id, char.name, JSON.stringify(char), char.createdAt]
        ).catch(console.error)
      }
      return { characters: [...state.characters, ...characters] }
    }),

  loadCharacters: async () => {
    try {
      const rows = await window.electronAPI.db.query('SELECT data FROM characters ORDER BY created_at DESC')
      const characters = (rows as any[]).map((row) => JSON.parse(row.data) as Character)
      set({ characters })
    } catch (error) {
      console.error('Failed to load characters:', error)
    }
  },
}))

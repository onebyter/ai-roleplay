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
    return newChar
  },

  updateCharacter: (id, updates) =>
    set((state) => ({
      characters: state.characters.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    })),

  removeCharacter: (id) =>
    set((state) => ({
      characters: state.characters.filter((c) => c.id !== id),
    })),

  getCharacter: (id) => get().characters.find((c) => c.id === id),

  importCharacters: (characters) =>
    set((state) => ({ characters: [...state.characters, ...characters] })),
}))

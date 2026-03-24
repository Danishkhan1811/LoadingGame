/**
 * Score persistence layer.
 * Stores personal bests per game in localStorage under the 'loading-games' namespace.
 */

import type { GameName } from './types.js'

const STORAGE_KEY = 'loading-games:scores'

interface ScoreEntry {
  personalBest: number
  lastPlayed: string // ISO date string
  totalGames: number
}

type ScoreStore = Record<string, ScoreEntry>

function readStore(): ScoreStore {
  if (typeof window === 'undefined' || !window.localStorage) return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as ScoreStore) : {}
  } catch {
    return {}
  }
}

function writeStore(store: ScoreStore): void {
  if (typeof window === 'undefined' || !window.localStorage) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch {
    // Quota exceeded or private browsing — fail silently
  }
}

/**
 * Build the storage key for a game, optionally scoped by namespace.
 */
function buildKey(game: Exclude<GameName, 'random'>, namespace?: string): string {
  return namespace ? `${namespace}:${game}` : game
}

/**
 * Get the personal best for a game.
 * Returns 0 if no score has been recorded.
 */
export function getPersonalBest(
  game: Exclude<GameName, 'random'>,
  namespace?: string
): number {
  const store = readStore()
  const key = buildKey(game, namespace)
  return store[key]?.personalBest ?? 0
}

/**
 * Save a new score. Returns true if this is a new personal best.
 */
export function saveScore(
  game: Exclude<GameName, 'random'>,
  score: number,
  namespace?: string
): boolean {
  const store = readStore()
  const key = buildKey(game, namespace)
  const existing = store[key]

  const isNewRecord = score > (existing?.personalBest ?? 0)

  store[key] = {
    personalBest: isNewRecord ? score : (existing?.personalBest ?? 0),
    lastPlayed: new Date().toISOString(),
    totalGames: (existing?.totalGames ?? 0) + 1,
  }

  writeStore(store)
  return isNewRecord
}

/**
 * Get all scores, optionally filtered by namespace.
 */
export function getAllScores(namespace?: string): Record<string, ScoreEntry> {
  const store = readStore()
  if (!namespace) return store

  return Object.fromEntries(
    Object.entries(store).filter(([key]) => key.startsWith(`${namespace}:`))
  )
}

/**
 * Clear all scores, optionally scoped to a namespace.
 */
export function clearScores(namespace?: string): void {
  if (!namespace) {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(STORAGE_KEY)
    }
    return
  }

  const store = readStore()
  const prefix = `${namespace}:`
  const filtered = Object.fromEntries(
    Object.entries(store).filter(([key]) => !key.startsWith(prefix))
  )
  writeStore(filtered)
}

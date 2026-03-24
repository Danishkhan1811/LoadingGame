/**
 * Theme resolution — 3-level priority:
 * 1. Explicit theme prop (highest)
 * 2. CSS variables on :root (--lg-primary, etc.)
 * 3. prefers-color-scheme detection (lowest)
 */

import type { ThemeObject, ResolvedTheme } from './types.js'

const DARK_DEFAULTS: ResolvedTheme = {
  primary: '#6366F1',
  background: '#0F0F0F',
  surface: '#1A1A2E',
  text: '#F8F8F8',
  accent: '#E94560',
}

const LIGHT_DEFAULTS: ResolvedTheme = {
  primary: '#4F46E5',
  background: '#FFFFFF',
  surface: '#F3F4F6',
  text: '#111827',
  accent: '#E94560',
}

const CSS_VAR_MAP: Record<keyof ResolvedTheme, string> = {
  primary: '--lg-primary',
  background: '--lg-background',
  surface: '--lg-surface',
  text: '--lg-text',
  accent: '--lg-accent',
}

/**
 * Read a CSS variable from :root, returns null if not set.
 */
function readCSSVar(varName: string): string | null {
  if (typeof window === 'undefined') return null
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim()
  return value || null
}

/**
 * Detect system color scheme preference.
 */
function getSystemDefaults(): ResolvedTheme {
  if (typeof window === 'undefined') return DARK_DEFAULTS
  try {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    return prefersDark ? DARK_DEFAULTS : LIGHT_DEFAULTS
  } catch {
    return DARK_DEFAULTS
  }
}

/**
 * Resolve the final theme from all sources.
 * Priority: explicit prop > CSS variables > system defaults.
 */
export function resolveTheme(theme?: ThemeObject): ResolvedTheme {
  const systemDefaults = getSystemDefaults()

  const resolved: ResolvedTheme = { ...systemDefaults }

  // Level 2: CSS variables
  for (const [key, cssVar] of Object.entries(CSS_VAR_MAP) as [keyof ResolvedTheme, string][]) {
    const cssValue = readCSSVar(cssVar)
    if (cssValue) {
      resolved[key] = cssValue
    }
  }

  // Level 1: Explicit theme prop
  if (theme) {
    for (const [key, value] of Object.entries(theme) as [keyof ThemeObject, string | undefined][]) {
      if (value) {
        resolved[key] = value
      }
    }
  }

  return resolved
}

/**
 * Apply resolved theme as CSS variables to a container element.
 * This allows games to reference CSS variables for dynamic theming.
 */
export function applyThemeToElement(element: HTMLElement, theme: ResolvedTheme): void {
  for (const [key, cssVar] of Object.entries(CSS_VAR_MAP) as [keyof ResolvedTheme, string][]) {
    element.style.setProperty(cssVar, theme[key])
  }
}

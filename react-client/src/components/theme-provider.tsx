import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  // The server and first browser render use the same value for hydration.
  const [theme, setTheme] = useState<Theme>(defaultTheme)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved === "light" || saved === "dark" || saved === "system") setTheme(saved)
    } catch { /* The theme still works when storage is unavailable. */ }
    setReady(true)
  }, [storageKey])

  useEffect(() => {
    if (!ready) return
    const root = window.document.documentElement
    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const apply = () => {
      root.classList.remove("light", "dark")
      root.classList.add(theme === "system" ? (media.matches ? "dark" : "light") : theme)
    }
    apply()
    media.addEventListener("change", apply)
    return () => media.removeEventListener("change", apply)
  }, [theme, ready])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      try { localStorage.setItem(storageKey, theme) } catch { /* Optional preference. */ }
      setTheme(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}

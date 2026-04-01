import { ref, watch } from 'vue'

const THEME_KEY = 'yota-theme'
const isDark = ref<boolean>(localStorage.getItem(THEME_KEY) === 'dark')

export function useTheme() {
  const initTheme = () => {
    // strictly default to light mode unless chosen otherwise
    if (localStorage.getItem(THEME_KEY) === null) {
      localStorage.setItem(THEME_KEY, 'light')
    }
    applyTheme()
  }

  const toggleTheme = () => {
    isDark.value = !isDark.value
  }

  const applyTheme = () => {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
      localStorage.setItem(THEME_KEY, 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem(THEME_KEY, 'light')
    }
  }

  watch(isDark, () => {
    applyTheme()
  })

  return {
    isDark,
    toggleTheme,
    initTheme,
  }
}

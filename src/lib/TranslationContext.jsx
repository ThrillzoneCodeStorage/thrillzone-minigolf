import { createContext, useContext } from 'react'
import { STRINGS } from './i18n'
import { useGame } from '../context/GameContext'

const TranslationContext = createContext(STRINGS.en)

export function TranslationProvider({ children }) {
  const { language } = useGame()
  const t = STRINGS[language] || STRINGS.en
  return (
    <TranslationContext.Provider value={t}>
      {children}
    </TranslationContext.Provider>
  )
}

export function useTranslation() {
  return useContext(TranslationContext)
}

/**
 * Contexto de Acessibilidade
 * 
 * Gerencia configurações de acessibilidade do usuário:
 * - Modo de linguagem simples
 * - Tamanho de fonte
 * - Alto contraste
 * - Preferência de redução de movimento
 * - Feedback sonoro
 * 
 * As preferências são persistidas no localStorage.
 */

/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AccessibilityContext = createContext(null)

// Configurações padrão
const DEFAULT_SETTINGS = {
  simpleLang: false,         // Modo de linguagem simples
  fontSize: 'normal',        // normal, large, larger
  highContrast: false,       // Alto contraste
  reducedMotion: false,      // Reduzir animações
  audioFeedback: false,      // Feedback em áudio
}

/**
 * Provider de acessibilidade
 * Envolve a aplicação e fornece configurações globais
 */
export function AccessibilityProvider({ children }) {
  // Inicializa com configurações salvas ou padrão
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('participa-df-accessibility')
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS
    } catch {
      return DEFAULT_SETTINGS
    }
  })

  // Persiste alterações no localStorage
  useEffect(() => {
    localStorage.setItem('participa-df-accessibility', JSON.stringify(settings))
  }, [settings])

  // Aplica classes no body baseado nas configurações
  useEffect(() => {
    const root = document.documentElement
    
    // Linguagem simples
    root.setAttribute('data-simple-language', settings.simpleLang)
    
    // Tamanho de fonte
    root.setAttribute('data-font-size', settings.fontSize)
    const fontSizes = {
      normal: '100%',
      large: '112.5%',
      larger: '125%'
    }
    root.style.fontSize = fontSizes[settings.fontSize] || '100%'
    
    // Alto contraste
    root.setAttribute('data-high-contrast', settings.highContrast)
    
    // Redução de movimento
    if (settings.reducedMotion) {
      root.style.setProperty('--transition-fast', '0ms')
      root.style.setProperty('--transition-normal', '0ms')
      root.style.setProperty('--transition-slow', '0ms')
    } else {
      root.style.removeProperty('--transition-fast')
      root.style.removeProperty('--transition-normal')
      root.style.removeProperty('--transition-slow')
    }
  }, [settings])

  /**
   * Atualiza uma configuração específica
   */
  const updateSetting = useCallback((key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }, [])

  // Detecta preferências do sistema
  useEffect(() => {
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)')
    
    const handleMotionChange = (e) => {
      if (e.matches) {
        updateSetting('reducedMotion', true)
      }
    }
    
    const handleContrastChange = (e) => {
      if (e.matches) {
        updateSetting('highContrast', true)
      }
    }
    
    // Aplica preferências iniciais do sistema
    if (reducedMotionQuery.matches) {
      updateSetting('reducedMotion', true)
    }
    if (highContrastQuery.matches) {
      updateSetting('highContrast', true)
    }
    
    reducedMotionQuery.addEventListener('change', handleMotionChange)
    highContrastQuery.addEventListener('change', handleContrastChange)
    
    return () => {
      reducedMotionQuery.removeEventListener('change', handleMotionChange)
      highContrastQuery.removeEventListener('change', handleContrastChange)
    }
  }, [updateSetting])

  /**
   * Alterna uma configuração booleana
   */
  const toggleSetting = useCallback((key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }))
  }, [])

  /**
   * Restaura configurações padrão
   */
  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS)
  }, [])

  /**
   * Reproduz feedback em áudio (se habilitado)
   */
  const speakFeedback = useCallback((text) => {
    if (settings.audioFeedback && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'pt-BR'
      utterance.rate = 0.9
      window.speechSynthesis.cancel() // Cancela falas anteriores
      window.speechSynthesis.speak(utterance)
    }
  }, [settings.audioFeedback])

  const value = {
    settings,
    updateSetting,
    toggleSetting,
    resetSettings,
    speakFeedback,
  }

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  )
}

/**
 * Hook para acessar o contexto de acessibilidade
 */
export function useAccessibility() {
  const context = useContext(AccessibilityContext)
  if (!context) {
    throw new Error('useAccessibility deve ser usado dentro de AccessibilityProvider')
  }
  return context
}

export default AccessibilityContext

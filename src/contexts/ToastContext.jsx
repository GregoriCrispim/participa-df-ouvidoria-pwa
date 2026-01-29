/**
 * Contexto de Toast/Notificações
 * 
 * Sistema de notificações acessível que:
 * - Usa aria-live para anúncios automáticos
 * - Permite navegação por teclado
 * - Suporta feedback visual e sonoro
 */

/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { useAccessibility } from './AccessibilityContext'

const ToastContext = createContext(null)

/**
 * Provider de notificações toast
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const toastIdRef = useRef(0)
  const { speakFeedback } = useAccessibility()

  /**
   * Remove uma notificação específica
   */
  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  /**
   * Adiciona uma nova notificação
   * @param {string} message - Mensagem a exibir
   * @param {string} type - Tipo: success, error, warning, info
   * @param {number} duration - Duração em ms (0 = persistente)
   */
  const addToast = useCallback((message, type = 'info', duration = 5000) => {
    const id = ++toastIdRef.current
    
    const toast = {
      id,
      message,
      type,
      timestamp: Date.now()
    }
    
    setToasts(prev => [...prev, toast])
    
    // Anuncia para leitores de tela via feedback sonoro
    speakFeedback(message)
    
    // Remove automaticamente após duração
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
    
    return id
  }, [removeToast, speakFeedback])

  /**
   * Remove todas as notificações
   */
  const clearToasts = useCallback(() => {
    setToasts([])
  }, [])

  // Atalhos para tipos específicos
  const success = useCallback((message, duration) => 
    addToast(message, 'success', duration), [addToast])
  
  const error = useCallback((message, duration) => 
    addToast(message, 'error', duration), [addToast])
  
  const warning = useCallback((message, duration) => 
    addToast(message, 'warning', duration), [addToast])
  
  const info = useCallback((message, duration) => 
    addToast(message, 'info', duration), [addToast])

  const value = {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    success,
    error,
    warning,
    info
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

/**
 * Container de toasts renderizados
 */
function ToastContainer({ toasts, onRemove }) {
  if (toasts.length === 0) return null
  
  return (
    <div
      className="toast-container"
      role="region"
      aria-label="Notificações"
      aria-live="polite"
    >
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
      
      <style>{`
        .toast-container {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-width: 90vw;
          width: 400px;
        }
        
        @media (max-width: 480px) {
          .toast-container {
            top: 10px;
            left: 10px;
            right: 10px;
            width: auto;
          }
        }
      `}</style>
    </div>
  )
}

/**
 * Componente individual de toast
 */
function Toast({ toast, onRemove }) {
  const toastRef = useRef(null)
  
  // Permite fechar com Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onRemove(toast.id)
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [toast.id, onRemove])

  const typeColors = {
    success: { bg: '#E8F5E9', border: '#2E7D32', icon: '✓' },
    error: { bg: '#FFEBEE', border: '#C62828', icon: '✕' },
    warning: { bg: '#FFF3E0', border: '#E65100', icon: '⚠' },
    info: { bg: '#E1F5FE', border: '#0277BD', icon: 'ℹ' }
  }
  
  const colors = typeColors[toast.type] || typeColors.info

  return (
    <div
      ref={toastRef}
      role="alert"
      aria-live="assertive"
      className={`toast toast--${toast.type}`}
      style={{
        backgroundColor: colors.bg,
        borderLeft: `4px solid ${colors.border}`,
        padding: '16px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        animation: 'slideIn 0.3s ease-out'
      }}
    >
      <span 
        className="toast-icon" 
        aria-hidden="true"
        style={{ 
          fontSize: '1.25rem',
          fontWeight: 'bold',
          color: colors.border
        }}
      >
        {colors.icon}
      </span>
      
      <span className="toast-message" style={{ flex: 1, color: '#1A1A1A' }}>
        {toast.message}
      </span>
      
      <button
        onClick={() => onRemove(toast.id)}
        className="toast-close"
        aria-label="Fechar notificação"
        style={{
          background: 'none',
          border: 'none',
          fontSize: '1.25rem',
          cursor: 'pointer',
          padding: '4px',
          color: '#616161',
          minWidth: '44px',
          minHeight: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        ×
      </button>
      
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

/**
 * Hook para usar o sistema de toast
 */
export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast deve ser usado dentro de ToastProvider')
  }
  return context
}

export default ToastContext

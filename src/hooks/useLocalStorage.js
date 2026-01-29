/**
 * Hook useLocalStorage
 * 
 * Persiste estado no localStorage com sincronização entre abas.
 */

import { useState, useEffect, useCallback } from 'react'

/**
 * @param {string} key - Chave no localStorage
 * @param {any} initialValue - Valor inicial se não existir
 * @returns {[any, function, function]} - [value, setValue, removeValue]
 */
function useLocalStorage(key, initialValue) {
  // Inicializa com valor do localStorage ou fallback
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Erro ao ler localStorage[${key}]:`, error)
      return initialValue
    }
  })

  // Função para atualizar valor
  const setValue = useCallback((value) => {
    try {
      // Permite value ser uma função (como setState)
      const valueToStore = value instanceof Function ? value(storedValue) : value
      
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
      
      // Dispara evento para sincronizar com outras abas
      window.dispatchEvent(new StorageEvent('storage', {
        key,
        newValue: JSON.stringify(valueToStore)
      }))
    } catch (error) {
      console.error(`Erro ao salvar localStorage[${key}]:`, error)
    }
  }, [key, storedValue])

  // Função para remover valor
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key)
      setStoredValue(initialValue)
    } catch (error) {
      console.error(`Erro ao remover localStorage[${key}]:`, error)
    }
  }, [key, initialValue])

  // Sincroniza com outras abas
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue))
        } catch {
          setStoredValue(e.newValue)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [key])

  return [storedValue, setValue, removeValue]
}

export default useLocalStorage

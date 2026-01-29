/**
 * Barra de Ferramentas de Acessibilidade
 * 
 * Oferece acesso rápido às principais configurações de acessibilidade:
 * - Tamanho de fonte
 * - Alto contraste
 * - Linguagem simples
 * - Feedback sonoro
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAccessibility } from '../../contexts/AccessibilityContext'
import './AccessibilityToolbar.css'

function AccessibilityToolbar() {
  const [isExpanded, setIsExpanded] = useState(false)
  const { settings, updateSetting, toggleSetting } = useAccessibility()

  const fontSizeOptions = [
    { value: 'normal', label: 'A', ariaLabel: 'Tamanho normal' },
    { value: 'large', label: 'A+', ariaLabel: 'Tamanho grande' },
    { value: 'larger', label: 'A++', ariaLabel: 'Tamanho maior' },
  ]

  return (
    <div className="accessibility-toolbar" role="region" aria-label="Ferramentas de acessibilidade">
      <div className="toolbar-container">
        <button
          className="toolbar-toggle"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          aria-controls="accessibility-options"
        >
          <i className="bi bi-universal-access toolbar-icon" aria-hidden="true"></i>
          <span className="toolbar-label">Acessibilidade</span>
          <span className="toolbar-chevron" aria-hidden="true">
            {isExpanded ? '▲' : '▼'}
          </span>
        </button>

        <div 
          id="accessibility-options"
          className={`toolbar-options ${isExpanded ? 'expanded' : ''}`}
          hidden={!isExpanded}
        >
          {/* Tamanho de Fonte */}
          <fieldset className="toolbar-group">
            <legend className="toolbar-group-label">Tamanho do texto</legend>
            <div className="font-size-buttons">
              {fontSizeOptions.map((option) => (
                <button
                  key={option.value}
                  className={`font-size-btn ${settings.fontSize === option.value ? 'active' : ''}`}
                  onClick={() => updateSetting('fontSize', option.value)}
                  aria-label={option.ariaLabel}
                  aria-pressed={settings.fontSize === option.value}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Contraste */}
          <div className="toolbar-group">
            <button
              className={`toolbar-btn ${settings.highContrast ? 'active' : ''}`}
              onClick={() => toggleSetting('highContrast')}
              aria-pressed={settings.highContrast}
            >
              <span className="btn-icon" aria-hidden="true">◐</span>
              <span className="btn-label">Alto Contraste</span>
            </button>
          </div>

          {/* Linguagem Simples */}
          <div className="toolbar-group">
            <button
              className={`toolbar-btn ${settings.simpleLang ? 'active' : ''}`}
              onClick={() => toggleSetting('simpleLang')}
              aria-pressed={settings.simpleLang}
            >
              <i className="bi bi-chat-dots btn-icon" aria-hidden="true"></i>
              <span className="btn-label">Linguagem Simples</span>
            </button>
          </div>

          {/* Feedback Sonoro */}
          <div className="toolbar-group">
            <button
              className={`toolbar-btn ${settings.audioFeedback ? 'active' : ''}`}
              onClick={() => toggleSetting('audioFeedback')}
              aria-pressed={settings.audioFeedback}
            >
              <i className="bi bi-volume-up btn-icon" aria-hidden="true"></i>
              <span className="btn-label">Feedback em Áudio</span>
            </button>
          </div>

          {/* Link para mais opções */}
          <Link to="/acessibilidade" className="toolbar-more-link">
            Mais opções de acessibilidade
          </Link>
        </div>
      </div>
    </div>
  )
}

export default AccessibilityToolbar

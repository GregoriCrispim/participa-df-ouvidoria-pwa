/**
 * Página de Configurações de Acessibilidade
 * 
 * Permite ao usuário personalizar as configurações de acessibilidade:
 * - Tamanho de fonte
 * - Alto contraste
 * - Linguagem simples
 * - Feedback em áudio
 * - Redução de movimento
 */

import { useAccessibility } from '../contexts/AccessibilityContext'
import { useToast } from '../contexts/ToastContext'
import Button from '../components/Button/Button'
import './AcessibilidadePage.css'

function AcessibilidadePage() {
  const { settings, updateSetting, toggleSetting, resetSettings, speakFeedback } = useAccessibility()
  const toast = useToast()

  const handleReset = () => {
    resetSettings()
    toast.info('Configurações restauradas para o padrão')
    speakFeedback('Configurações de acessibilidade restauradas')
  }

  return (
    <div className="acessibilidade-page">
      <h1 className="page-title">
        {settings.simpleLang ? 'Mudar como o site aparece' : 'Configurações de Acessibilidade'}
      </h1>
      
      <p className="page-description">
        {settings.simpleLang 
          ? 'Mude estas opções para deixar o site mais fácil de usar para você'
          : 'Personalize a experiência do site de acordo com suas necessidades'
        }
      </p>

      <div className="settings-grid">
        {/* Tamanho de Fonte */}
        <section className="setting-card" aria-labelledby="font-size-title">
          <h2 id="font-size-title" className="setting-title">
            <i className="bi bi-fonts icon-primary" aria-hidden="true"></i>
            {settings.simpleLang ? 'Tamanho da letra' : 'Tamanho do Texto'}
          </h2>
          <p className="setting-description">
            {settings.simpleLang 
              ? 'Deixe as letras maiores para ler melhor'
              : 'Ajuste o tamanho do texto para melhorar a leitura'
            }
          </p>
          
          <div className="font-size-options" role="radiogroup" aria-label="Tamanho do texto">
            {[
              { value: 'normal', label: 'Normal', sample: 'Aa' },
              { value: 'large', label: settings.simpleLang ? 'Grande' : 'Grande', sample: 'Aa' },
              { value: 'larger', label: settings.simpleLang ? 'Muito grande' : 'Maior', sample: 'Aa' }
            ].map(option => (
              <button
                key={option.value}
                className={`font-option ${settings.fontSize === option.value ? 'active' : ''}`}
                onClick={() => {
                  updateSetting('fontSize', option.value)
                  speakFeedback(`Tamanho de texto: ${option.label}`)
                }}
                role="radio"
                aria-checked={settings.fontSize === option.value}
              >
                <span 
                  className={`font-sample font-sample--${option.value}`} 
                  aria-hidden="true"
                >
                  {option.sample}
                </span>
                <span className="font-label">{option.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Alto Contraste */}
        <section className="setting-card" aria-labelledby="contrast-title">
          <h2 id="contrast-title" className="setting-title">
            <i className="bi bi-circle-half icon-primary" aria-hidden="true"></i>
            {settings.simpleLang ? 'Cores fortes' : 'Alto Contraste'}
          </h2>
          <p className="setting-description">
            {settings.simpleLang 
              ? 'Deixa as cores mais fortes para ver melhor'
              : 'Aumenta o contraste das cores para melhorar a visibilidade'
            }
          </p>
          
          <button
            className={`toggle-button ${settings.highContrast ? 'active' : ''}`}
            onClick={() => {
              toggleSetting('highContrast')
              speakFeedback(settings.highContrast ? 'Alto contraste desativado' : 'Alto contraste ativado')
            }}
            role="switch"
            aria-checked={settings.highContrast}
          >
            <span className="toggle-track">
              <span className="toggle-thumb" />
            </span>
            <span className="toggle-label">
              {settings.highContrast 
                ? (settings.simpleLang ? 'Ligado' : 'Ativado')
                : (settings.simpleLang ? 'Desligado' : 'Desativado')
              }
            </span>
          </button>
        </section>

        {/* Linguagem Simples */}
        <section className="setting-card" aria-labelledby="simple-lang-title">
          <h2 id="simple-lang-title" className="setting-title">
            <i className="bi bi-chat-dots icon-primary" aria-hidden="true"></i>
            Linguagem Simples
          </h2>
          <p className="setting-description">
            {settings.simpleLang 
              ? 'Mostra textos mais fáceis de entender'
              : 'Exibe textos em linguagem mais acessível e direta'
            }
          </p>
          
          <button
            className={`toggle-button ${settings.simpleLang ? 'active' : ''}`}
            onClick={() => {
              toggleSetting('simpleLang')
              speakFeedback(settings.simpleLang ? 'Linguagem simples desativada' : 'Linguagem simples ativada')
            }}
            role="switch"
            aria-checked={settings.simpleLang}
          >
            <span className="toggle-track">
              <span className="toggle-thumb" />
            </span>
            <span className="toggle-label">
              {settings.simpleLang 
                ? (settings.simpleLang ? 'Ligado' : 'Ativado')
                : (settings.simpleLang ? 'Desligado' : 'Desativado')
              }
            </span>
          </button>
        </section>

        {/* Feedback em Áudio */}
        <section className="setting-card" aria-labelledby="audio-title">
          <h2 id="audio-title" className="setting-title">
            <i className="bi bi-volume-up icon-primary" aria-hidden="true"></i>
            {settings.simpleLang ? 'Ouvir mensagens' : 'Feedback em Áudio'}
          </h2>
          <p className="setting-description">
            {settings.simpleLang 
              ? 'O site fala as mensagens importantes para você'
              : 'O sistema lê em voz alta mensagens e alertas importantes'
            }
          </p>
          
          <button
            className={`toggle-button ${settings.audioFeedback ? 'active' : ''}`}
            onClick={() => {
              toggleSetting('audioFeedback')
              // Só fala se estiver ativando
              if (!settings.audioFeedback) {
                setTimeout(() => speakFeedback('Feedback em áudio ativado'), 100)
              }
            }}
            role="switch"
            aria-checked={settings.audioFeedback}
          >
            <span className="toggle-track">
              <span className="toggle-thumb" />
            </span>
            <span className="toggle-label">
              {settings.audioFeedback 
                ? (settings.simpleLang ? 'Ligado' : 'Ativado')
                : (settings.simpleLang ? 'Desligado' : 'Desativado')
              }
            </span>
          </button>
        </section>

        {/* Redução de Movimento */}
        <section className="setting-card" aria-labelledby="motion-title">
          <h2 id="motion-title" className="setting-title">
            <i className="bi bi-pause-circle icon-primary" aria-hidden="true"></i>
            {settings.simpleLang ? 'Parar animações' : 'Reduzir Movimento'}
          </h2>
          <p className="setting-description">
            {settings.simpleLang 
              ? 'Para as animações e movimentos do site'
              : 'Desativa animações e transições do site'
            }
          </p>
          
          <button
            className={`toggle-button ${settings.reducedMotion ? 'active' : ''}`}
            onClick={() => {
              toggleSetting('reducedMotion')
              speakFeedback(settings.reducedMotion ? 'Animações ativadas' : 'Animações desativadas')
            }}
            role="switch"
            aria-checked={settings.reducedMotion}
          >
            <span className="toggle-track">
              <span className="toggle-thumb" />
            </span>
            <span className="toggle-label">
              {settings.reducedMotion 
                ? (settings.simpleLang ? 'Ligado' : 'Ativado')
                : (settings.simpleLang ? 'Desligado' : 'Desativado')
              }
            </span>
          </button>
        </section>
      </div>

      {/* Restaurar padrão */}
      <div className="reset-section">
        <Button variant="outline" onClick={handleReset}>
          {settings.simpleLang ? 'Voltar ao normal' : 'Restaurar Configurações Padrão'}
        </Button>
      </div>

      {/* Informações adicionais */}
      <aside className="accessibility-info">
        <h2 className="info-title">
          {settings.simpleLang ? 'Outras formas de usar' : 'Recursos de Acessibilidade'}
        </h2>
        
        <ul className="info-list">
          <li>
            <strong>
              {settings.simpleLang ? 'Use o teclado' : 'Navegação por Teclado'}
            </strong>
            <p>
              {settings.simpleLang 
                ? 'Aperte Tab para andar pelo site. Aperte Enter para clicar.'
                : 'Use Tab para navegar, Enter para ativar, e Escape para fechar.'
              }
            </p>
          </li>
          <li>
            <strong>
              {settings.simpleLang ? 'Leitor de tela' : 'Compatibilidade com Leitores de Tela'}
            </strong>
            <p>
              {settings.simpleLang 
                ? 'Este site funciona com NVDA, JAWS e VoiceOver.'
                : 'Site compatível com NVDA, JAWS, VoiceOver e outros.'
              }
            </p>
          </li>
          <li>
            <strong>
              {settings.simpleLang ? 'Zoom' : 'Ampliação'}
            </strong>
            <p>
              {settings.simpleLang 
                ? 'Use Ctrl + ou - para aumentar ou diminuir a tela.'
                : 'Use Ctrl+Plus/Minus ou gesto de pinça para ampliar.'
              }
            </p>
          </li>
        </ul>
      </aside>
    </div>
  )
}

export default AcessibilidadePage

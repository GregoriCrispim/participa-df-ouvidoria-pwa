/**
 * Página de Sucesso - Protocolo Gerado
 * 
 * Exibida após o envio bem-sucedido de uma manifestação.
 * Mostra o número do protocolo e orientações.
 */

import { useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAccessibility } from '../contexts/AccessibilityContext'
import Button from '../components/Button/Button'
import './ProtocoloPage.css'

function ProtocoloPage() {
  const { numero } = useParams()
  const { settings, speakFeedback } = useAccessibility()
  const protocoloRef = useRef(null)

  // Anuncia sucesso ao carregar a página
  useEffect(() => {
    speakFeedback(`Sua manifestação foi enviada com sucesso. Seu número de protocolo é ${numero}`)
    protocoloRef.current?.focus()
  }, [numero, speakFeedback])

  /**
   * Copia protocolo para área de transferência
   */
  const copyProtocolo = async () => {
    try {
      await navigator.clipboard.writeText(numero)
      speakFeedback('Protocolo copiado')
    } catch (err) {
      console.error('Erro ao copiar:', err)
    }
  }

  return (
    <div className="protocolo-page">
      {/* Ícone de Sucesso */}
      <div className="success-icon" aria-hidden="true">
        <svg viewBox="0 0 100 100" width="100" height="100">
          <circle cx="50" cy="50" r="45" fill="#E8F5E9" stroke="#2E7D32" strokeWidth="4"/>
          <path 
            d="M30 50 L45 65 L70 35" 
            fill="none" 
            stroke="#2E7D32" 
            strokeWidth="6" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <h1 className="success-title" ref={protocoloRef} tabIndex={-1}>
        {settings.simpleLang 
          ? 'Mensagem enviada!' 
          : 'Manifestação Enviada com Sucesso!'
        }
      </h1>

      <p className="success-message">
        {settings.simpleLang 
          ? 'Guarde o número abaixo. Use ele para ver como está sua mensagem.'
          : 'Anote o número do protocolo abaixo para acompanhar o andamento da sua manifestação.'
        }
      </p>

      {/* Número do Protocolo */}
      <div className="protocolo-card" role="region" aria-label="Número do protocolo">
        <span className="protocolo-label">
          {settings.simpleLang ? 'Seu número é' : 'Protocolo'}
        </span>
        <span className="protocolo-number">{numero}</span>
        <button 
          className="copy-button"
          onClick={copyProtocolo}
          aria-label="Copiar número do protocolo"
        >
          <i className="bi bi-clipboard icon-primary" aria-hidden="true"></i>
          {settings.simpleLang ? 'Copiar' : 'Copiar Protocolo'}
        </button>
      </div>

      {/* Próximos Passos */}
      <div className="next-steps" aria-labelledby="steps-title">
        <h2 id="steps-title" className="steps-title">
          {settings.simpleLang ? 'O que vai acontecer agora?' : 'Próximos Passos'}
        </h2>
        
        <ol className="steps-list">
          <li>
            <span className="step-number" aria-hidden="true">1</span>
            <div className="step-content">
              <strong>
                {settings.simpleLang ? 'Vamos ler sua mensagem' : 'Recebimento e Triagem'}
              </strong>
              <p>
                {settings.simpleLang 
                  ? 'Sua mensagem será enviada para o órgão certo'
                  : 'Sua manifestação será encaminhada ao órgão competente'
                }
              </p>
            </div>
          </li>
          
          <li>
            <span className="step-number" aria-hidden="true">2</span>
            <div className="step-content">
              <strong>
                {settings.simpleLang ? 'Vamos analisar' : 'Análise'}
              </strong>
              <p>
                {settings.simpleLang 
                  ? 'O órgão vai estudar o que você escreveu'
                  : 'O órgão responsável analisará sua demanda'
                }
              </p>
            </div>
          </li>
          
          <li>
            <span className="step-number" aria-hidden="true">3</span>
            <div className="step-content">
              <strong>
                {settings.simpleLang ? 'Você recebe resposta' : 'Resposta'}
              </strong>
              <p>
                {settings.simpleLang 
                  ? 'Prazo de até 30 dias para responder'
                  : 'Prazo de resposta: até 30 dias (prorrogável por mais 30)'
                }
              </p>
            </div>
          </li>
        </ol>
      </div>

      {/* Informação sobre e-mail */}
      <div className="email-info">
        <i className="bi bi-envelope-check icon-info" aria-hidden="true"></i>
        <p>
          {settings.simpleLang 
            ? 'Se você informou seu e-mail, você receberá atualizações por lá também.'
            : 'Se você informou seu e-mail, receberá notificações sobre o andamento.'
          }
        </p>
      </div>

      {/* Ações */}
      <div className="actions">
        <Link to="/consulta">
          <Button variant="primary" size="large" icon={<i className="bi bi-search"></i>}>
            {settings.simpleLang ? 'Ver minha mensagem' : 'Acompanhar Manifestação'}
          </Button>
        </Link>
        
        <Link to="/">
          <Button variant="outline" size="large">
            {settings.simpleLang ? 'Voltar ao início' : 'Página Inicial'}
          </Button>
        </Link>
      </div>

      {/* Contato */}
      <aside className="contact-info">
        <h2 className="contact-title">
          {settings.simpleLang ? 'Precisa de ajuda?' : 'Dúvidas?'}
        </h2>
        <p>
          {settings.simpleLang 
            ? 'Ligue grátis: '
            : 'Entre em contato pela Central de Atendimento: '
          }
          <a href="tel:162"><strong>162</strong></a>
          {settings.simpleLang ? ' (é de graça!)' : ' (ligação gratuita)'}
        </p>
      </aside>
    </div>
  )
}

export default ProtocoloPage

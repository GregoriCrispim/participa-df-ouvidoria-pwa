/**
 * Página Inicial
 * 
 * Landing page com:
 * - Apresentação do sistema
 * - Acesso rápido às funcionalidades
 * - Informações sobre a Ouvidoria
 */

import { Link } from 'react-router-dom'
import { useAccessibility } from '../contexts/AccessibilityContext'
import Button from '../components/Button/Button'
import './HomePage.css'

function HomePage() {
  const { settings } = useAccessibility()

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-content">
          <h1 id="hero-title" className="hero-title">
            {settings.simpleLang 
              ? 'Fale com o Governo do DF' 
              : 'Ouvidoria Participa DF'
            }
          </h1>
          <p className="hero-description">
            {settings.simpleLang 
              ? 'Aqui você pode enviar reclamações, sugestões, elogios ou denúncias para o Governo. Pode usar texto, áudio, foto ou vídeo. Você escolhe se quer se identificar ou não.'
              : 'Plataforma de participação social do Governo do Distrito Federal. Registre sua manifestação de forma simples, acessível e segura por texto, áudio, imagem ou vídeo.'
            }
          </p>
          
          <div className="hero-actions">
            <Link to="/manifestacao">
              <Button variant="primary" size="large" icon={<i className="bi bi-pencil-square"></i>}>
                {settings.simpleLang ? 'Enviar mensagem' : 'Nova Manifestação'}
              </Button>
            </Link>
            <Link to="/consulta">
              <Button variant="outline" size="large" icon={<i className="bi bi-search"></i>}>
                {settings.simpleLang ? 'Ver minha mensagem' : 'Consultar Protocolo'}
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="hero-image" aria-hidden="true">
          <div className="hero-illustration">
            <svg viewBox="0 0 300 200" aria-hidden="true">
              {/* Ilustração simplificada de comunicação */}
              <rect x="20" y="40" width="120" height="80" rx="10" fill="#E6F0F8" stroke="#005A9C" strokeWidth="2"/>
              <circle cx="80" cy="80" r="20" fill="#005A9C"/>
              <path d="M70 75 L75 85 L90 70" stroke="white" strokeWidth="3" fill="none"/>
              
              <rect x="160" y="80" width="120" height="80" rx="10" fill="#E8F5E9" stroke="#2E7D32" strokeWidth="2"/>
              <rect x="175" y="100" width="60" height="8" rx="2" fill="#2E7D32"/>
              <rect x="175" y="115" width="90" height="8" rx="2" fill="#2E7D32" opacity="0.5"/>
              <rect x="175" y="130" width="45" height="8" rx="2" fill="#2E7D32" opacity="0.3"/>
              
              <path d="M140 80 L160 100" stroke="#005A9C" strokeWidth="2" strokeDasharray="4"/>
            </svg>
          </div>
        </div>
      </section>

      {/* Tipos de Manifestação */}
      <section className="section" aria-labelledby="tipos-title">
        <h2 id="tipos-title" className="section-title">
          {settings.simpleLang ? 'O que você pode fazer' : 'Tipos de Manifestação'}
        </h2>
        
        <div className="cards-grid">
          <article className="card">
            <span className="card-icon icon-warning" aria-hidden="true">
              <i className="bi bi-chat-left-text"></i>
            </span>
            <h3 className="card-title">
              {settings.simpleLang ? 'Reclamação' : 'Reclamação'}
            </h3>
            <p className="card-description">
              {settings.simpleLang 
                ? 'Conte quando algo não funcionou bem nos serviços públicos'
                : 'Relate insatisfações ou problemas com serviços públicos'
              }
            </p>
          </article>
          
          <article className="card">
            <span className="card-icon icon-info" aria-hidden="true">
              <i className="bi bi-lightbulb"></i>
            </span>
            <h3 className="card-title">Sugestão</h3>
            <p className="card-description">
              {settings.simpleLang 
                ? 'Dê ideias para melhorar os serviços'
                : 'Proponha melhorias para serviços e processos'
              }
            </p>
          </article>
          
          <article className="card">
            <span className="card-icon icon-success" aria-hidden="true">
              <i className="bi bi-hand-thumbs-up"></i>
            </span>
            <h3 className="card-title">Elogio</h3>
            <p className="card-description">
              {settings.simpleLang 
                ? 'Agradeça quando algo funcionou bem'
                : 'Reconheça atendimentos e serviços de qualidade'
              }
            </p>
          </article>
          
          <article className="card">
            <span className="card-icon icon-error" aria-hidden="true">
              <i className="bi bi-exclamation-triangle"></i>
            </span>
            <h3 className="card-title">Denúncia</h3>
            <p className="card-description">
              {settings.simpleLang 
                ? 'Avise sobre algo errado ou ilegal'
                : 'Comunique irregularidades ou condutas inadequadas'
              }
            </p>
          </article>
          
          <article className="card">
            <span className="card-icon icon-primary" aria-hidden="true">
              <i className="bi bi-question-circle"></i>
            </span>
            <h3 className="card-title">
              {settings.simpleLang ? 'Pergunta' : 'Solicitação'}
            </h3>
            <p className="card-description">
              {settings.simpleLang 
                ? 'Faça perguntas sobre serviços públicos'
                : 'Peça informações ou providências aos órgãos'
              }
            </p>
          </article>
        </div>
      </section>

      {/* Como funciona */}
      <section className="section section--alt" aria-labelledby="como-funciona-title">
        <h2 id="como-funciona-title" className="section-title">
          {settings.simpleLang ? 'Como usar' : 'Como Funciona'}
        </h2>
        
        <div className="steps">
          <div className="step">
            <div className="step-number" aria-hidden="true">1</div>
            <h3 className="step-title">
              {settings.simpleLang ? 'Escreva ou grave' : 'Registre sua manifestação'}
            </h3>
            <p className="step-description">
              {settings.simpleLang 
                ? 'Use texto, áudio, foto ou vídeo para contar o que aconteceu'
                : 'Utilize texto, áudio, imagem ou vídeo para detalhar sua demanda'
              }
            </p>
          </div>
          
          <div className="step">
            <div className="step-number" aria-hidden="true">2</div>
            <h3 className="step-title">
              {settings.simpleLang ? 'Receba um número' : 'Receba o protocolo'}
            </h3>
            <p className="step-description">
              {settings.simpleLang 
                ? 'Você recebe um número para acompanhar sua mensagem'
                : 'Um número de protocolo é gerado automaticamente para acompanhamento'
              }
            </p>
          </div>
          
          <div className="step">
            <div className="step-number" aria-hidden="true">3</div>
            <h3 className="step-title">
              {settings.simpleLang ? 'Acompanhe' : 'Acompanhe a resposta'}
            </h3>
            <p className="step-description">
              {settings.simpleLang 
                ? 'Use o número para ver como está sua mensagem'
                : 'Consulte o andamento e a resposta usando seu protocolo'
              }
            </p>
          </div>
        </div>
        
        <div className="section-action">
          <Link to="/manifestacao">
            <Button variant="primary" size="large">
              {settings.simpleLang ? 'Começar agora' : 'Iniciar Manifestação'}
            </Button>
          </Link>
        </div>
      </section>

      {/* Acessibilidade */}
      <section className="section" aria-labelledby="acessibilidade-title">
        <h2 id="acessibilidade-title" className="section-title">
          {settings.simpleLang ? 'Fácil para todos' : 'Acessibilidade'}
        </h2>
        
        <div className="accessibility-features">
          <div className="feature">
            <span className="feature-icon icon-primary" aria-hidden="true">
              <i className="bi bi-keyboard"></i>
            </span>
            <span className="feature-text">
              {settings.simpleLang 
                ? 'Use só o teclado' 
                : 'Navegação por teclado'
              }
            </span>
          </div>
          
          <div className="feature">
            <span className="feature-icon icon-primary" aria-hidden="true">
              <i className="bi bi-volume-up"></i>
            </span>
            <span className="feature-text">
              {settings.simpleLang 
                ? 'Funciona com leitor de tela' 
                : 'Compatível com leitores de tela'
              }
            </span>
          </div>
          
          <div className="feature">
            <span className="feature-icon icon-primary" aria-hidden="true">
              <i className="bi bi-fonts"></i>
            </span>
            <span className="feature-text">
              {settings.simpleLang 
                ? 'Aumente a letra' 
                : 'Ajuste de tamanho de texto'
              }
            </span>
          </div>
          
          <div className="feature">
            <span className="feature-icon icon-primary" aria-hidden="true">
              <i className="bi bi-circle-half"></i>
            </span>
            <span className="feature-text">
              {settings.simpleLang 
                ? 'Alto contraste' 
                : 'Modo de alto contraste'
              }
            </span>
          </div>
          
          <div className="feature">
            <span className="feature-icon icon-primary" aria-hidden="true">
              <i className="bi bi-chat-dots"></i>
            </span>
            <span className="feature-text">
              {settings.simpleLang 
                ? 'Linguagem simples' 
                : 'Modo de linguagem simples'
              }
            </span>
          </div>
          
          <div className="feature">
            <span className="feature-icon icon-primary" aria-hidden="true">
              <i className="bi bi-mic"></i>
            </span>
            <span className="feature-text">
              {settings.simpleLang 
                ? 'Grave sua voz' 
                : 'Envio por áudio'
              }
            </span>
          </div>
        </div>
        
        <p className="accessibility-note">
          <Link to="/acessibilidade">
            {settings.simpleLang 
              ? 'Mudar configurações de acessibilidade'
              : 'Configurar preferências de acessibilidade'
            }
          </Link>
        </p>
      </section>

      {/* Contato */}
      <section className="section section--contact" aria-labelledby="contato-title">
        <h2 id="contato-title" className="section-title">
          {settings.simpleLang ? 'Precisa de ajuda?' : 'Canais de Atendimento'}
        </h2>
        
        <div className="contact-options">
          <a href="tel:162" className="contact-card">
            <span className="contact-icon icon-primary" aria-hidden="true">
              <i className="bi bi-telephone"></i>
            </span>
            <span className="contact-info">
              <strong>Central 162</strong>
              <span>Ligação gratuita</span>
            </span>
          </a>
          
          <a href="mailto:ouvidoria@cg.df.gov.br" className="contact-card">
            <span className="contact-icon icon-primary" aria-hidden="true">
              <i className="bi bi-envelope"></i>
            </span>
            <span className="contact-info">
              <strong>E-mail</strong>
              <span>ouvidoria@cg.df.gov.br</span>
            </span>
          </a>
        </div>
      </section>
    </div>
  )
}

export default HomePage

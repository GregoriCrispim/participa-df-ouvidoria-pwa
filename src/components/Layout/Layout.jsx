/**
 * Layout Principal
 * 
 * Estrutura base da aplicação com:
 * - Header institucional
 * - Navegação acessível
 * - Área de conteúdo principal
 * - Footer com informações de contato
 */

import { Link, useLocation } from 'react-router-dom'
import { useAccessibility } from '../../contexts/AccessibilityContext'
import AccessibilityToolbar from '../AccessibilityToolbar/AccessibilityToolbar'
import './Layout.css'

function Layout({ children }) {
  const location = useLocation()
  const { settings } = useAccessibility()

  return (
    <div className="layout" data-simple-language={settings.simpleLang}>
      {/* Barra de acessibilidade */}
      <AccessibilityToolbar />
      
      {/* Header */}
      <header className="header" role="banner">
        <div className="header-container">
          <Link to="/" className="header-logo" aria-label="Participa DF - Página inicial">
            <div className="logo-emblem" aria-hidden="true">
              <svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true">
                <circle cx="20" cy="20" r="18" fill="#005A9C" />
                <path d="M12 14h16v3H12zM12 20h16v3H12zM12 26h10v3H12z" fill="white" />
              </svg>
            </div>
            <div className="logo-text">
              <span className="logo-title">Participa DF</span>
              <span className="logo-subtitle">Ouvidoria</span>
            </div>
          </Link>
          
          <nav className="header-nav" role="navigation" aria-label="Menu principal">
            <ul className="nav-list">
              <li>
                <Link 
                  to="/" 
                  className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                  aria-current={location.pathname === '/' ? 'page' : undefined}
                >
                  Início
                </Link>
              </li>
              <li>
                <Link 
                  to="/manifestacao" 
                  className={`nav-link ${location.pathname === '/manifestacao' ? 'active' : ''}`}
                  aria-current={location.pathname === '/manifestacao' ? 'page' : undefined}
                >
                  Nova Manifestação
                </Link>
              </li>
              <li>
                <Link 
                  to="/consulta" 
                  className={`nav-link ${location.pathname === '/consulta' ? 'active' : ''}`}
                  aria-current={location.pathname === '/consulta' ? 'page' : undefined}
                >
                  Consultar
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main id="main-content" className="main-content" role="main" tabIndex={-1}>
        {children}
      </main>

      {/* Footer */}
      <footer className="footer" role="contentinfo">
        <div className="footer-container">
          <div className="footer-section">
            <h2 className="footer-title">Participa DF</h2>
            <p className="footer-text">
              Plataforma de participação social do Governo do Distrito Federal.
              {settings.simpleLang && (
                <> Este site é para você falar com o governo.</>
              )}
            </p>
          </div>
          
          <div className="footer-section">
            <h2 className="footer-title">Contato</h2>
            <ul className="footer-links">
              <li>
                <a href="tel:162" className="footer-link">
                  <i className="bi bi-telephone icon-inverse" aria-hidden="true"></i> 162 (Ligação gratuita)
                </a>
              </li>
              <li>
                <a href="mailto:ouvidoria@cg.df.gov.br" className="footer-link">
                  <i className="bi bi-envelope icon-inverse" aria-hidden="true"></i> ouvidoria@cg.df.gov.br
                </a>
              </li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h2 className="footer-title">Links Úteis</h2>
            <ul className="footer-links">
              <li>
                <a 
                  href="https://www.cg.df.gov.br" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="footer-link"
                >
                  Controladoria-Geral do DF
                  <span className="visually-hidden">(abre em nova aba)</span>
                </a>
              </li>
              <li>
                <Link to="/acessibilidade" className="footer-link">
                  Configurações de Acessibilidade
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>© 2026 Governo do Distrito Federal. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}

export default Layout

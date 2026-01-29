/**
 * Página 404 - Não Encontrada
 * 
 * Exibida quando o usuário acessa uma rota inexistente.
 */

import { Link } from 'react-router-dom'
import { useAccessibility } from '../contexts/AccessibilityContext'
import Button from '../components/Button/Button'
import './NotFoundPage.css'

function NotFoundPage() {
  const { settings } = useAccessibility()

  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <div className="error-code" aria-hidden="true">404</div>
        
        <h1 className="error-title">
          {settings.simpleLang ? 'Página não existe' : 'Página Não Encontrada'}
        </h1>
        
        <p className="error-message">
          {settings.simpleLang 
            ? 'A página que você procura não existe ou foi movida.'
            : 'O endereço que você tentou acessar não existe ou foi removido.'
          }
        </p>
        
        <div className="error-actions">
          <Link to="/">
            <Button variant="primary" size="large">
              {settings.simpleLang ? 'Voltar ao início' : 'Ir para Página Inicial'}
            </Button>
          </Link>
          
          <Link to="/manifestacao">
            <Button variant="outline">
              {settings.simpleLang ? 'Enviar mensagem' : 'Nova Manifestação'}
            </Button>
          </Link>
        </div>
        
        <p className="help-text">
          {settings.simpleLang ? 'Precisa de ajuda?' : 'Precisa de assistência?'}
          {' '}
          <a href="tel:162">
            {settings.simpleLang ? 'Ligue 162' : 'Entre em contato pelo 162'}
          </a>
        </p>
      </div>
    </div>
  )
}

export default NotFoundPage

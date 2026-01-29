/**
 * Participa DF - Componente Principal
 * 
 * Gerencia o roteamento e o layout principal da aplicação.
 * Inclui provedores de contexto para acessibilidade e estado global.
 */

import { Routes, Route } from 'react-router-dom'
import { AccessibilityProvider } from './contexts/AccessibilityContext'
import { ToastProvider } from './contexts/ToastContext'
import Layout from './components/Layout/Layout'
import HomePage from './pages/HomePage'
import ManifestacaoPage from './pages/ManifestacaoPage'
import ConsultaPage from './pages/ConsultaPage'
import ProtocoloPage from './pages/ProtocoloPage'
import AcessibilidadePage from './pages/AcessibilidadePage'
import NotFoundPage from './pages/NotFoundPage'

/**
 * Componente raiz da aplicação
 * Configura roteamento e provedores de contexto
 */
function App() {
  return (
    <AccessibilityProvider>
      <ToastProvider>
        <Layout>
          <Routes>
            {/* Página inicial */}
            <Route path="/" element={<HomePage />} />
            
            {/* Fluxo de manifestação */}
            <Route path="/manifestacao" element={<ManifestacaoPage />} />
            
            {/* Consulta de protocolo */}
            <Route path="/consulta" element={<ConsultaPage />} />
            
            {/* Página de sucesso com protocolo */}
            <Route path="/protocolo/:numero" element={<ProtocoloPage />} />
            
            {/* Configurações de acessibilidade */}
            <Route path="/acessibilidade" element={<AcessibilidadePage />} />
            
            {/* Página 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
      </ToastProvider>
    </AccessibilityProvider>
  )
}

export default App

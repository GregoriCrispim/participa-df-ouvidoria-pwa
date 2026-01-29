/**
 * Participa DF - Ouvidoria PWA
 * 
 * Ponto de entrada principal da aplicação.
 * Inicializa o React, registra o Service Worker para PWA
 * e configura o roteamento da aplicação.
 * 
 * @author Equipe Hackathon Participa DF
 * @version 1.0.0
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './styles/global.css'
import './styles/accessibility.css'

// Registra o Service Worker para funcionalidade PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registrado com sucesso:', registration.scope)
      })
      .catch((error) => {
        console.log('Falha ao registrar Service Worker:', error)
      })
  })
}

// Renderiza a aplicação
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)

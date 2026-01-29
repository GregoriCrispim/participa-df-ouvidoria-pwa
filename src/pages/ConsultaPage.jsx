/**
 * Página de Consulta de Protocolo
 * 
 * Permite ao cidadão consultar o status de sua manifestação
 * usando o número do protocolo.
 */

import { useState, useCallback } from 'react'
import { useAccessibility } from '../contexts/AccessibilityContext'
import { useToast } from '../contexts/ToastContext'
import Button from '../components/Button/Button'
import FormField from '../components/FormField/FormField'
import { consultarProtocolo } from '../services/api'
import './ConsultaPage.css'

function ConsultaPage() {
  const { settings, speakFeedback } = useAccessibility()
  const toast = useToast()
  
  const [protocolo, setProtocolo] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  /**
   * Realiza a consulta do protocolo
   */
  const handleSearch = useCallback(async (e) => {
    e.preventDefault()
    setError(null)
    setResult(null)
    
    if (!protocolo.trim()) {
      setError('Digite o número do protocolo')
      toast.error('Por favor, digite o número do protocolo')
      return
    }
    
    setIsSearching(true)
    
    try {
      const data = await consultarProtocolo(protocolo.trim())
      setResult(data)
      speakFeedback(`Protocolo encontrado. Status: ${data.status}`)
    } catch (err) {
      const errorMessage = 'Protocolo não encontrado. Verifique o número e tente novamente.'
      setError(errorMessage)
      toast.error(errorMessage)
      speakFeedback('Protocolo não encontrado')
    } finally {
      setIsSearching(false)
    }
  }, [protocolo, toast, speakFeedback])

  /**
   * Formata data para exibição
   */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatFileSize = (bytes = 0) => {
    if (!bytes) return '0 KB'
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    const value = bytes / Math.pow(1024, i)
    return `${value.toFixed(i === 0 ? 0 : 2)} ${sizes[i]}`
  }

  const renderAttachmentPreview = (anexo) => {
    const previewSource = anexo.previewUrl || anexo.url
    if (!previewSource) {
      return (
        <div className="attachment-preview attachment-preview--empty">
          Prévia indisponível
        </div>
      )
    }

    if (anexo.type === 'imagem') {
      return (
        <img
          src={previewSource}
          alt={anexo.description || 'Prévia da imagem enviada'}
          className="attachment-preview attachment-preview--image"
        />
      )
    }

    if (anexo.type === 'video') {
      return (
        <video
          src={previewSource}
          controls
          className="attachment-preview attachment-preview--video"
        >
          Seu navegador não suporta a reprodução de vídeo.
        </video>
      )
    }

    if (anexo.type === 'audio') {
      return (
        <audio
          src={previewSource}
          controls
          className="attachment-preview attachment-preview--audio"
        >
          Seu navegador não suporta a reprodução de áudio.
        </audio>
      )
    }

    return (
      <div className="attachment-preview attachment-preview--empty">
        Prévia indisponível
      </div>
    )
  }

  /**
   * Retorna cor do status
   */
  const getStatusColor = (status) => {
    const colors = {
      'recebida': 'var(--color-info)',
      'em_analise': 'var(--color-warning)',
      'respondida': 'var(--color-success)',
      'arquivada': 'var(--color-text-muted)',
    }
    return colors[status] || 'var(--color-text-secondary)'
  }

  /**
   * Retorna texto do status
   */
  const getStatusText = (status, simpleLang) => {
    const texts = {
      'recebida': simpleLang ? 'Recebida' : 'Manifestação Recebida',
      'em_analise': simpleLang ? 'Sendo analisada' : 'Em Análise',
      'respondida': simpleLang ? 'Respondida' : 'Respondida',
      'arquivada': simpleLang ? 'Arquivada' : 'Arquivada',
    }
    return texts[status] || status
  }

  return (
    <div className="consulta-page">
      <h1 className="page-title">
        {settings.simpleLang ? 'Ver minha mensagem' : 'Consultar Protocolo'}
      </h1>
      
      <p className="page-description">
        {settings.simpleLang 
          ? 'Digite o número que você recebeu quando enviou sua mensagem'
          : 'Informe o número do protocolo para consultar o andamento da sua manifestação'
        }
      </p>
      
      {/* Formulário de busca */}
      <form onSubmit={handleSearch} className="search-form">
        <FormField
          label={settings.simpleLang ? 'Número do protocolo' : 'Protocolo'}
          type="text"
          name="protocolo"
          value={protocolo}
          onChange={(e) => setProtocolo(e.target.value)}
          placeholder="Ex: 2026012700001"
          error={error}
          autoComplete="off"
        />
        
        <Button
          type="submit"
          variant="primary"
          loading={isSearching}
          icon={<i className="bi bi-search"></i>}
        >
          {settings.simpleLang ? 'Buscar' : 'Consultar'}
        </Button>
      </form>
      
      {/* Resultado da consulta */}
      {result && (
        <div className="result-card" role="region" aria-labelledby="result-title">
          <div className="result-header">
            <h2 id="result-title" className="result-title">
              <i className="bi bi-file-text icon-primary" aria-hidden="true"></i>
              {settings.simpleLang ? 'Resultado' : 'Dados da Manifestação'}
            </h2>
            {result.previsaoResposta && (
              <div className="result-deadline">
                <span className="deadline-label">
                  {settings.simpleLang ? 'Prazo de resposta' : 'Prazo para Resposta'}
                </span>
                <span className="deadline-value">{formatDate(result.previsaoResposta)}</span>
              </div>
            )}
          </div>
          
          {/* Status */}
          <div className="result-status" style={{ '--status-color': getStatusColor(result.status) }}>
            <span className="status-badge">
              {getStatusText(result.status, settings.simpleLang)}
            </span>
          </div>
          
          {/* Informações */}
          <dl className="result-details">
            <div className="detail-item">
              <dt>{settings.simpleLang ? 'Número' : 'Protocolo'}</dt>
              <dd><strong>{result.protocolo}</strong></dd>
            </div>
            
            <div className="detail-item">
              <dt>Tipo</dt>
              <dd>{result.tipo}</dd>
            </div>
            
            <div className="detail-item">
              <dt>{settings.simpleLang ? 'Enviada em' : 'Data de Registro'}</dt>
              <dd>{formatDate(result.dataRegistro)}</dd>
            </div>
            
            <div className="detail-item detail-item--full">
              <dt>{settings.simpleLang ? 'Para' : 'Órgão Destinatário'}</dt>
              <dd>{result.orgao}</dd>
            </div>
            
            {result.assunto && (
              <div className="detail-item detail-item--full">
                <dt>Assunto</dt>
                <dd>{result.assunto}</dd>
              </div>
            )}
            
            {result.previsaoResposta && null}
          </dl>

          {result.anexos && result.anexos.length > 0 && (
            <div className="result-attachments">
              <h3 className="attachments-title">
                {settings.simpleLang ? 'Anexos enviados' : 'Anexos Enviados'}
              </h3>
              <ul className="attachments-list">
                {result.anexos.map((anexo, index) => (
                  <li key={`${anexo.name || anexo.type}-${index}`} className="attachment-item">
                    <div className="attachment-preview-wrapper">
                      {renderAttachmentPreview(anexo)}
                    </div>
                    <div className="attachment-main">
                      <span className="attachment-type">{anexo.typeLabel || anexo.type}</span>
                      <span className="attachment-name">{anexo.name || 'Arquivo'}</span>
                    </div>
                    <span className="attachment-size">{formatFileSize(anexo.size)}</span>
                    <p className="attachment-description">
                      {anexo.description || 'Sem descrição'}
                    </p>
                    {(anexo.previewUrl || anexo.url) && (
                      <a
                        className="attachment-download"
                        href={anexo.previewUrl || anexo.url}
                        download={anexo.name || 'anexo'}
                      >
                        <i className="bi bi-download" aria-hidden="true"></i>
                        Download
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Histórico */}
          {result.historico && result.historico.length > 0 && (
            <div className="result-history">
              <h3 className="history-title">
                {settings.simpleLang ? 'O que aconteceu' : 'Histórico de Tramitação'}
              </h3>
              <ol className="history-timeline">
                {result.historico.map((item, index) => (
                  <li key={index} className="timeline-item">
                    <span className="timeline-date">{formatDate(item.data)}</span>
                    <span className="timeline-event">{item.descricao}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
          
          {/* Resposta (se houver) */}
          {result.resposta && (
            <div className="result-response">
              <h3 className="response-title">
                {settings.simpleLang ? 'Resposta' : 'Resposta do Órgão'}
              </h3>
              <div className="response-content">
                <p>{result.resposta.texto}</p>
                <p className="response-date">
                  {settings.simpleLang ? 'Respondido em' : 'Data da resposta'}: {formatDate(result.resposta.data)}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Dica */}
      <aside className="help-tip" aria-labelledby="help-title">
        <h2 id="help-title" className="tip-title">
          {settings.simpleLang ? 'Perdeu o número?' : 'Não encontrou seu protocolo?'}
        </h2>
        <p>
          {settings.simpleLang 
            ? 'Se você informou seu e-mail, procure na sua caixa de entrada. Se não encontrar, ligue para 162.'
            : 'Verifique seu e-mail ou entre em contato pelo telefone 162 (ligação gratuita).'
          }
        </p>
      </aside>
    </div>
  )
}

export default ConsultaPage

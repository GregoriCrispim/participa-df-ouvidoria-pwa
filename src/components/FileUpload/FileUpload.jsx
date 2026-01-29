/**
 * Componente FileUpload Acessível
 * 
 * Upload de arquivos (imagem/vídeo) com:
 * - Área de drag and drop
 * - Preview do arquivo
 * - Validação de tipo e tamanho
 * - Descrição/alt text para imagens
 * - Feedback acessível
 */

import { useState, useRef, useCallback } from 'react'
import { useAccessibility } from '../../contexts/AccessibilityContext'
import { useToast } from '../../contexts/ToastContext'
import Button from '../Button/Button'
import FormField from '../FormField/FormField'
import './FileUpload.css'

function FileUpload({
  type = 'image', // 'image', 'video' ou 'audio'
  onFileSelect,
  onDescriptionChange,
  maxSize = 10, // MB
  accept,
  multiple = false,
  maxFiles = 1,
  renderAction,
}) {
  const [files, setFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const [descriptions, setDescriptions] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState(null)
  
  const inputRef = useRef(null)
  const { speakFeedback } = useAccessibility()
  const toast = useToast()

  // Tipos de arquivo aceitos
  const acceptedTypes = accept || (type === 'image' 
    ? 'image/jpeg,image/png,image/gif,image/webp' 
    : type === 'video'
      ? 'video/mp4,video/webm,video/quicktime'
      : 'audio/mpeg,audio/mp3,audio/wav,audio/webm,audio/ogg,audio/mp4')

  const friendlyTypes = type === 'image' 
    ? 'JPG, PNG, GIF ou WebP' 
    : type === 'video'
      ? 'MP4, WebM ou MOV'
      : 'MP3, WAV, OGG ou WebM'

  const labelText = type === 'image' ? 'Imagem' : type === 'video' ? 'Vídeo' : 'Áudio'
  const labelTextLower = type === 'image' ? 'imagem' : type === 'video' ? 'vídeo' : 'áudio'
  const isMultiple = multiple && maxFiles > 1
  const hasFiles = files.length > 0
  const canAddMore = isMultiple && files.length < maxFiles
  const shouldShowCompactAdd = canAddMore && !renderAction

  /**
   * Valida e processa arquivo selecionado
   */
  const validateFile = useCallback((selectedFile) => {
    // Validação de tipo
    const fileType = selectedFile.type
    const validTypes = acceptedTypes.split(',')
    
    if (!validTypes.some(t => fileType.match(t.trim()))) {
      const errorMsg = `Tipo de arquivo inválido. Use ${friendlyTypes}.`
      setError(errorMsg)
      toast.error(errorMsg)
      speakFeedback(errorMsg)
      return false
    }
    
    // Validação de tamanho
    const fileSizeMB = selectedFile.size / (1024 * 1024)
    if (fileSizeMB > maxSize) {
      const errorMsg = `Arquivo muito grande. O limite é ${maxSize}MB.`
      setError(errorMsg)
      toast.error(errorMsg)
      speakFeedback(errorMsg)
      return false
    }
    
    return true
  }, [acceptedTypes, friendlyTypes, maxSize, speakFeedback, toast])

  const addFiles = useCallback((selectedFiles) => {
    if (!selectedFiles || selectedFiles.length === 0) return
    
    setError(null)
    
    const incoming = Array.from(selectedFiles)
    let nextFiles = isMultiple ? [...files] : []
    let nextPreviews = isMultiple ? [...previews] : []
    let nextDescriptions = isMultiple ? [...descriptions] : []
    
    if (!isMultiple && previews[0]) {
      URL.revokeObjectURL(previews[0])
    }
    
    const availableSlots = isMultiple ? maxFiles - nextFiles.length : 1
    if (isMultiple && availableSlots <= 0) {
      const errorMsg = `Você pode anexar até ${maxFiles} arquivos.`
      setError(errorMsg)
      toast.warning(errorMsg)
      speakFeedback(errorMsg)
      return
    }
    
    const filesToAdd = incoming.slice(0, availableSlots)
    filesToAdd.forEach((file) => {
      if (!validateFile(file)) return
      const url = URL.createObjectURL(file)
      nextFiles.push(file)
      nextPreviews.push(url)
      nextDescriptions.push('')
    })
    
    if (incoming.length > filesToAdd.length) {
      toast.info(`Apenas ${filesToAdd.length} arquivo(s) foram adicionados.`)
    }
    
    if (nextFiles.length === files.length) return
    
    setFiles(nextFiles)
    setPreviews(nextPreviews)
    setDescriptions(nextDescriptions)
    
    onFileSelect?.(isMultiple ? nextFiles : nextFiles[0] || null)
    onDescriptionChange?.(isMultiple ? nextDescriptions : nextDescriptions[0] || '')
    
    if (isMultiple && type === 'image') {
      toast.success(`${nextFiles.length} imagem(ns) adicionada(s) com sucesso!`)
    } else {
      toast.success(`${labelText} adicionado com sucesso!`)
    }
    speakFeedback(`${labelText} carregado com sucesso`)
  }, [descriptions, files, isMultiple, labelText, maxFiles, onDescriptionChange, onFileSelect, previews, speakFeedback, toast, type, validateFile])

  /**
   * Handler de seleção via input
   */
  const handleInputChange = useCallback((e) => {
    const selectedFiles = e.target.files
    if (selectedFiles?.length) {
      addFiles(selectedFiles)
    }
  }, [addFiles])

  /**
   * Handlers de drag and drop
   */
  const handleDragEnter = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    
    const droppedFiles = e.dataTransfer.files
    if (droppedFiles?.length) {
      addFiles(droppedFiles)
    }
  }, [addFiles])

  /**
   * Abre seletor de arquivo
   */
  const openFilePicker = useCallback(() => {
    inputRef.current?.click()
  }, [])

  /**
   * Remove arquivo selecionado
   */
  const removeFileAt = useCallback((index) => {
    const previewToRemove = previews[index]
    if (previewToRemove) URL.revokeObjectURL(previewToRemove)
    
    const nextFiles = files.filter((_, i) => i !== index)
    const nextPreviews = previews.filter((_, i) => i !== index)
    const nextDescriptions = descriptions.filter((_, i) => i !== index)
    
    setFiles(nextFiles)
    setPreviews(nextPreviews)
    setDescriptions(nextDescriptions)
    setError(null)
    
    onFileSelect?.(isMultiple ? nextFiles : nextFiles[0] || null)
    onDescriptionChange?.(isMultiple ? nextDescriptions : nextDescriptions[0] || '')
    
    if (inputRef.current) inputRef.current.value = ''
    
    speakFeedback(`${labelText} removido`)
    toast.info(`${labelText} removido`)
  }, [descriptions, files, isMultiple, labelText, onDescriptionChange, onFileSelect, previews, speakFeedback, toast])

  /**
   * Handler de descrição
   */
  const handleDescriptionChange = useCallback((e, index = 0) => {
    const value = e.target.value
    if (isMultiple) {
      const nextDescriptions = descriptions.map((desc, i) => i === index ? value : desc)
      setDescriptions(nextDescriptions)
      onDescriptionChange?.(nextDescriptions)
    } else {
      setDescriptions([value])
      onDescriptionChange?.(value)
    }
  }, [descriptions, isMultiple, onDescriptionChange])

  return (
    <div className="file-upload" role="region" aria-label={`Upload de ${labelTextLower}`}>
      {/* Input oculto */}
      <input
        ref={inputRef}
        type="file"
        accept={acceptedTypes}
        onChange={handleInputChange}
        multiple={isMultiple}
        className="visually-hidden"
        id={`file-upload-${type}`}
        aria-describedby={error ? `upload-error-${type}` : undefined}
      />
      
      {!hasFiles ? (
        <>
          {/* Área de drop */}
          <div
            className={`drop-zone ${isDragging ? 'drop-zone--active' : ''} ${error ? 'drop-zone--error' : ''}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            role="button"
            tabIndex={0}
            onClick={openFilePicker}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                openFilePicker()
              }
            }}
            aria-label={`Clique ou arraste para adicionar ${isMultiple ? 'arquivos' : type === 'image' ? 'uma imagem' : type === 'video' ? 'um vídeo' : 'um áudio'}`}
          >
            <div className="drop-zone-content">
              <span className="drop-zone-icon icon-primary" aria-hidden="true">
                {type === 'image' ? <i className="bi bi-image"></i> : type === 'video' ? <i className="bi bi-camera-video"></i> : <i className="bi bi-mic"></i>}
              </span>
              <p className="drop-zone-text">
                <strong>Clique aqui</strong> ou arraste {isMultiple ? 'arquivos' : 'um arquivo'}
              </p>
              <p className="drop-zone-hint">
                Formatos aceitos: {friendlyTypes}<br />
                Tamanho máximo: {maxSize}MB
                {isMultiple && (
                  <>
                    <br />Até {maxFiles} arquivos
                  </>
                )}
              </p>
            </div>
          </div>
          
          {/* Mensagem de erro */}
          {error && (
            <p id={`upload-error-${type}`} className="upload-error" role="alert">
              <i className="bi bi-exclamation-triangle icon-warning" aria-hidden="true"></i> {error}
            </p>
          )}
        </>
      ) : (
        <>
          {renderAction?.({
            openFilePicker,
            canAddMore,
            files,
            maxFiles,
            hasFiles,
            type
          })}

          {/* Preview do arquivo */}
          {isMultiple ? (
            <div className="file-preview file-preview--multiple">
              {files.map((file, index) => (
                <div className="file-preview-item" key={`${file.name}-${index}`}>
                  <div className="preview-media">
                    {type === 'image' ? (
                      <img 
                        src={previews[index]} 
                        alt={descriptions[index] || 'Prévia da imagem enviada'} 
                        className="preview-image"
                      />
                    ) : type === 'video' ? (
                      <video 
                        src={previews[index]} 
                        controls 
                        className="preview-video"
                        aria-label={descriptions[index] || 'Prévia do vídeo enviado'}
                      >
                        Seu navegador não suporta a reprodução de vídeo.
                      </video>
                    ) : (
                      <audio 
                        src={previews[index]}
                        controls
                        className="preview-audio"
                        aria-label={descriptions[index] || 'Prévia do áudio enviado'}
                      >
                        Seu navegador não suporta a reprodução de áudio.
                      </audio>
                    )}
                  </div>
                  
                  <div className="preview-info">
                    <p className="file-name">
                      <strong>Arquivo:</strong> {file.name}
                    </p>
                    <p className="file-size">
                      <strong>Tamanho:</strong> {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                    
                    <Button
                      variant="text"
                      onClick={() => removeFileAt(index)}
                      icon={<i className="bi bi-trash"></i>}
                      aria-label="Remover arquivo"
                    >
                      Remover
                    </Button>
                  </div>
                  
                  {/* Campo de descrição (importante para acessibilidade) */}
                  {type === 'image' && (
                    <FormField
                      label="Descrição da imagem"
                      type="textarea"
                      name={`imageDescription-${index}`}
                      value={descriptions[index] || ''}
                      onChange={(e) => handleDescriptionChange(e, index)}
                      placeholder="Descreva o que aparece na imagem para pessoas com deficiência visual"
                      helpText="Uma boa descrição ajuda pessoas que usam leitores de tela a entender o conteúdo da imagem."
                      rows={3}
                      maxLength={500}
                    />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="file-preview">
              <div className="preview-media">
                {type === 'image' ? (
                  <img 
                    src={previews[0]} 
                    alt={descriptions[0] || 'Prévia da imagem enviada'} 
                    className="preview-image"
                  />
                ) : type === 'video' ? (
                  <video 
                    src={previews[0]} 
                    controls 
                    className="preview-video"
                    aria-label={descriptions[0] || 'Prévia do vídeo enviado'}
                  >
                    Seu navegador não suporta a reprodução de vídeo.
                  </video>
                ) : (
                  <audio 
                    src={previews[0]}
                    controls
                    className="preview-audio"
                    aria-label={descriptions[0] || 'Prévia do áudio enviado'}
                  >
                    Seu navegador não suporta a reprodução de áudio.
                  </audio>
                )}
              </div>
              
              <div className="preview-info">
                <p className="file-name">
                  <strong>Arquivo:</strong> {files[0]?.name}
                </p>
                <p className="file-size">
                  <strong>Tamanho:</strong> {files[0] ? (files[0].size / (1024 * 1024)).toFixed(2) : '0.00'} MB
                </p>
                
                <Button
                  variant="text"
                  onClick={() => removeFileAt(0)}
                  icon={<i className="bi bi-trash"></i>}
                  aria-label="Remover arquivo"
                >
                  Remover
                </Button>
              </div>
              
              {/* Campo de descrição (importante para acessibilidade) */}
              {type === 'image' && (
                <FormField
                  label="Descrição da imagem"
                  type="textarea"
                  name="imageDescription"
                  value={descriptions[0] || ''}
                  onChange={(e) => handleDescriptionChange(e, 0)}
                  placeholder="Descreva o que aparece na imagem para pessoas com deficiência visual"
                  helpText="Uma boa descrição ajuda pessoas que usam leitores de tela a entender o conteúdo da imagem."
                  rows={3}
                  maxLength={500}
                />
              )}
              
              {type === 'video' && (
                <FormField
                  label="Descrição do vídeo"
                  type="textarea"
                  name="videoDescription"
                  value={descriptions[0] || ''}
                  onChange={(e) => handleDescriptionChange(e, 0)}
                  placeholder="Descreva brevemente o conteúdo do vídeo"
                  helpText="Descreva o que acontece no vídeo para auxiliar na análise."
                  rows={3}
                  maxLength={500}
                />
              )}

              {type === 'audio' && (
                <FormField
                  label="Descrição do áudio"
                  type="textarea"
                  name="audioDescription"
                  value={descriptions[0] || ''}
                  onChange={(e) => handleDescriptionChange(e, 0)}
                  placeholder="Descreva brevemente o conteúdo do áudio"
                  helpText="Descreva o que é ouvido para auxiliar na análise."
                  rows={3}
                  maxLength={500}
                />
              )}
            </div>
          )}

          {shouldShowCompactAdd && (
            <div
              className={`drop-zone drop-zone--compact ${isDragging ? 'drop-zone--active' : ''} ${error ? 'drop-zone--error' : ''}`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              role="button"
              tabIndex={0}
              onClick={openFilePicker}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  openFilePicker()
                }
              }}
              aria-label="Adicionar mais arquivos"
            >
              <div className="drop-zone-content">
                <span className="drop-zone-icon icon-primary" aria-hidden="true">
                  <i className="bi bi-plus-circle"></i>
                </span>
                <p className="drop-zone-text">
                  Adicionar mais arquivos
                </p>
                <p className="drop-zone-hint">
                  {files.length} de {maxFiles} usados
                </p>
              </div>
            </div>
          )}

          {/* Mensagem de erro */}
          {error && (
            <p id={`upload-error-${type}`} className="upload-error" role="alert">
              <i className="bi bi-exclamation-triangle icon-warning" aria-hidden="true"></i> {error}
            </p>
          )}
        </>
      )}
    </div>
  )
}

export default FileUpload

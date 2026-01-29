/**
 * Componente AudioRecorder
 * 
 * Gravação de áudio acessível via Web Audio API:
 * - Botões claros de gravar/parar/reproduzir
 * - Feedback visual e textual do estado
 * - Suporte a leitores de tela
 * - Visualização de tempo de gravação
 * - Download do áudio gravado
 */

import { useState, useRef, useCallback, useEffect } from 'react'
import { useAccessibility } from '../../contexts/AccessibilityContext'
import { useToast } from '../../contexts/ToastContext'
import Button from '../Button/Button'
import FormField from '../FormField/FormField'
import './AudioRecorder.css'

function AudioRecorder({ onRecordingComplete, onDescriptionChange, maxDuration = 300 }) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [audioUrl, setAudioUrl] = useState(null)
  const [duration, setDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [description, setDescription] = useState('')
  
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const timerRef = useRef(null)
  const audioRef = useRef(null)
  const streamRef = useRef(null)
  
  const { speakFeedback } = useAccessibility()
  const toast = useToast()

  // Limpa recursos ao desmontar
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (audioUrl) URL.revokeObjectURL(audioUrl)
    }
  }, [audioUrl])

  /**
   * Formata duração em mm:ss
   */
  const formatDuration = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }, [])

  /**
   * Para gravação
   */
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)
      
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      
      speakFeedback('Gravação finalizada')
      toast.success('Gravação finalizada com sucesso!')
    }
  }, [isRecording, speakFeedback, toast])

  /**
   * Inicia gravação
   */
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })
      
      streamRef.current = stream
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') 
          ? 'audio/webm' 
          : 'audio/mp4'
      })
      
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType })
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        
        // Notifica componente pai
        onRecordingComplete?.(blob)
        
        // Para o stream
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorder.start(1000) // Coleta dados a cada segundo
      setIsRecording(true)
      setIsPaused(false)
      setDuration(0)
      
      // Timer para mostrar duração
      timerRef.current = setInterval(() => {
        setDuration(prev => {
          const newDuration = prev + 1
          if (newDuration >= maxDuration) {
            stopRecording()
            toast.warning(`Gravação encerrada. Limite de ${maxDuration / 60} minutos atingido.`)
          }
          return newDuration
        })
      }, 1000)
      
      speakFeedback('Gravação iniciada')
      toast.info('Gravação iniciada. Fale agora.')
      
    } catch (error) {
      console.error('Erro ao acessar microfone:', error)
      setPermissionDenied(true)
      toast.error('Não foi possível acessar o microfone. Verifique as permissões.')
      speakFeedback('Erro: não foi possível acessar o microfone')
    }
  }, [maxDuration, onRecordingComplete, speakFeedback, stopRecording, toast])

  /**
   * Pausa/Retoma gravação
   */
  const togglePause = useCallback(() => {
    if (!mediaRecorderRef.current) return
    
    if (isPaused) {
      mediaRecorderRef.current.resume()
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1)
      }, 1000)
      speakFeedback('Gravação retomada')
    } else {
      mediaRecorderRef.current.pause()
      if (timerRef.current) clearInterval(timerRef.current)
      speakFeedback('Gravação pausada')
    }
    
    setIsPaused(!isPaused)
  }, [isPaused, speakFeedback])

  /**
   * Reproduz áudio gravado
   */
  const playAudio = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }, [isPlaying])

  /**
   * Remove gravação atual
   */
  const deleteRecording = useCallback(() => {
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioUrl(null)
    setDuration(0)
    setDescription('')
    onRecordingComplete?.(null)
    onDescriptionChange?.('')
    speakFeedback('Gravação removida')
    toast.info('Gravação removida')
  }, [audioUrl, onDescriptionChange, onRecordingComplete, speakFeedback, toast])

  // Handler quando áudio termina de tocar
  const handleAudioEnded = useCallback(() => {
    setIsPlaying(false)
  }, [])

  // Verifica suporte a gravação de áudio
  const isSupported = typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia

  if (!isSupported) {
    return (
      <div className="audio-recorder audio-recorder--unsupported" role="alert">
        <p className="unsupported-message">
          <i className="bi bi-exclamation-triangle icon-warning" aria-hidden="true"></i>
          Seu navegador não suporta gravação de áudio. 
          Por favor, utilize um navegador mais recente como Chrome, Firefox ou Edge.
        </p>
      </div>
    )
  }

  if (permissionDenied) {
    return (
      <div className="audio-recorder audio-recorder--denied" role="alert">
        <p className="denied-message">
          <i className="bi bi-mic icon-primary" aria-hidden="true"></i>
          Acesso ao microfone negado. Para gravar áudio:
        </p>
        <ol className="permission-steps">
          <li>Clique no ícone de cadeado/câmera na barra de endereço</li>
          <li>Permita acesso ao microfone</li>
          <li>Recarregue a página</li>
        </ol>
        <Button 
          variant="outline" 
          onClick={() => setPermissionDenied(false)}
        >
          Tentar novamente
        </Button>
      </div>
    )
  }

  return (
    <div 
      className={`audio-recorder${isRecording ? ' audio-recorder--recording' : ''}${isPaused ? ' audio-recorder--paused' : ''}`}
      role="region"
      aria-label="Gravador de áudio"
    >
      {/* Status da gravação */}
      <div className="recorder-status" aria-live="polite">
        {isRecording && (
          <div className={`recording-indicator ${isPaused ? 'paused' : ''}`}>
            <span className="recording-dot" aria-hidden="true"></span>
            <span className="recording-time">
              {formatDuration(duration)}
            </span>
            <span className="recording-label">
              {isPaused ? 'Pausado' : 'Gravando...'}
            </span>
          </div>
        )}
        
        {audioUrl && !isRecording && (
          <div className="recorded-info">
            <i className="bi bi-check-circle icon-success" aria-hidden="true"></i>
            Áudio gravado: {formatDuration(duration)}
          </div>
        )}
      </div>

      {/* Controles */}
      <div className="recorder-controls">
        {!isRecording && !audioUrl && (
          <Button
            variant="primary"
            size="large"
            onClick={startRecording}
            icon={<i className="bi bi-mic"></i>}
            aria-label="Iniciar gravação de áudio"
          >
            Gravar Áudio
          </Button>
        )}
        
        {isRecording && (
          <>
            <Button
              variant="secondary"
              onClick={togglePause}
              icon={isPaused ? <i className="bi bi-play-fill"></i> : <i className="bi bi-pause-fill"></i>}
              aria-label={isPaused ? 'Retomar gravação' : 'Pausar gravação'}
            >
              {isPaused ? 'Retomar' : 'Pausar'}
            </Button>
            
            <Button
              variant="primary"
              onClick={stopRecording}
              icon={<i className="bi bi-stop-fill"></i>}
              aria-label="Parar gravação"
            >
              Parar
            </Button>
          </>
        )}
        
        {audioUrl && !isRecording && (
          <>
            <audio 
              ref={audioRef} 
              src={audioUrl} 
              onEnded={handleAudioEnded}
              preload="metadata"
            />
            
            <Button
              variant="outline"
              onClick={playAudio}
              icon={isPlaying ? <i className="bi bi-stop-fill"></i> : <i className="bi bi-play-fill"></i>}
              aria-label={isPlaying ? 'Parar reprodução' : 'Reproduzir áudio'}
            >
              {isPlaying ? 'Parar' : 'Ouvir'}
            </Button>
            
            <Button
              variant="text"
              onClick={deleteRecording}
              icon={<i className="bi bi-trash"></i>}
              aria-label="Remover gravação"
            >
              Remover
            </Button>
          </>
        )}
      </div>

      {/* Instruções */}
      {!isRecording && !audioUrl && (
        <p className="recorder-help">
          Clique em &quot;Gravar Áudio&quot; e fale sua mensagem. 
          Você pode gravar até {maxDuration / 60} minutos.
        </p>
      )}

      {audioUrl && !isRecording && (
        <div className="recorder-description">
          <FormField
            label="Descrição do áudio"
            type="textarea"
            name="audioRecordedDescription"
            value={description}
            onChange={(e) => {
              const value = e.target.value
              setDescription(value)
              onDescriptionChange?.(value)
            }}
            placeholder="Descreva brevemente o conteúdo da gravação"
            helpText="Ajude a análise descrevendo o que foi dito."
            rows={3}
            maxLength={500}
          />
        </div>
      )}
    </div>
  )
}

export default AudioRecorder

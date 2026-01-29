/**
 * Página de Nova Manifestação
 * 
 * Formulário multicanal para registro de manifestações:
 * - Seleção de tipo e assunto
 * - Entrada por texto, áudio, imagem e vídeo
 * - Opção de anonimato
 * - Dados de contato (opcional)
 * - Integração simulada com IA IZA
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAccessibility } from '../contexts/AccessibilityContext'
import { useToast } from '../contexts/ToastContext'
import Button from '../components/Button/Button'
import FormField from '../components/FormField/FormField'
import AudioRecorder from '../components/AudioRecorder/AudioRecorder'
import FileUpload from '../components/FileUpload/FileUpload'
import { submitManifestacao, analyzeWithIZA } from '../services/api'
import './ManifestacaoPage.css'

// Tipos de manifestação
const TIPOS_MANIFESTACAO = [
  { value: 'reclamacao', label: 'Reclamação', labelSimple: 'Reclamação' },
  { value: 'sugestao', label: 'Sugestão', labelSimple: 'Sugestão' },
  { value: 'elogio', label: 'Elogio', labelSimple: 'Elogio' },
  { value: 'denuncia', label: 'Denúncia', labelSimple: 'Denúncia' },
  { value: 'solicitacao', label: 'Solicitação', labelSimple: 'Pergunta' },
]

// Órgãos do GDF (simplificado)
const ORGAOS = [
  { value: '', label: 'Selecione o órgão relacionado' },
  { value: 'saude', label: 'Secretaria de Saúde' },
  { value: 'educacao', label: 'Secretaria de Educação' },
  { value: 'transporte', label: 'Secretaria de Transporte' },
  { value: 'seguranca', label: 'Secretaria de Segurança Pública' },
  { value: 'obras', label: 'Secretaria de Obras' },
  { value: 'desenvolvimento', label: 'Secretaria de Desenvolvimento Social' },
  { value: 'outro', label: 'Outro / Não sei informar' },
]

// Etapas do formulário
const STEPS = [
  { id: 'tipo', title: 'Tipo', titleSimple: 'O que você quer fazer?' },
  { id: 'conteudo', title: 'Conteúdo', titleSimple: 'Conte o que aconteceu' },
  { id: 'identificacao', title: 'Identificação', titleSimple: 'Seus dados' },
  { id: 'revisao', title: 'Revisão', titleSimple: 'Confira tudo' },
]

function ManifestacaoPage() {
  const navigate = useNavigate()
  const { settings, speakFeedback } = useAccessibility()
  const toast = useToast()
  
  // Estado do formulário
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [izaAnalysis, setIzaAnalysis] = useState(null)
  const [errors, setErrors] = useState({})
  
  const [formData, setFormData] = useState({
    tipo: '',
    orgao: '',
    assunto: '',
    descricao: '',
    audioBlob: null,
    audioFile: null,
    audioDescricao: '',
    audioGravadoDescricao: '',
    imagens: [],
    imagensDescricao: [],
    video: null,
    videoDescricao: '',
    anonimo: false,
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    receberResposta: true,
    concordaTermos: false,
  })

  const formRef = useRef(null)
  const stepRefs = useRef([])

  // Foco na etapa atual quando muda
  useEffect(() => {
    if (stepRefs.current[currentStep]) {
      stepRefs.current[currentStep].focus()
    }
  }, [currentStep])

  // Ao abrir qualquer aba, volta o scroll ao topo
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentStep])

  /**
   * Atualiza campo do formulário
   */
  const formatTelefone = (rawValue) => {
    const digits = rawValue.replace(/\D/g, '').slice(0, 11)
    if (digits.length <= 2) return digits
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
    if (digits.length <= 10) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
    }
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }

  const formatCpf = (rawValue) => {
    const digits = rawValue.replace(/\D/g, '').slice(0, 11)
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
  }

  const handleFieldChange = useCallback((e) => {
    const { name, value, type, checked } = e.target
    let nextValue = value
    if (name === 'telefone') {
      nextValue = formatTelefone(value)
    }
    if (name === 'cpf') {
      nextValue = formatCpf(value)
    }
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : nextValue
    }))
    // Limpa erro do campo ao editar
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
  }, [errors])

  /**
   * Validação de etapa
   */
  const validateStep = useCallback((step) => {
    const newErrors = {}
    
    switch (step) {
      case 0: // Tipo
        if (!formData.tipo) {
          newErrors.tipo = 'Selecione o tipo de manifestação'
        }
        break
        
      case 1: // Conteúdo
        if (!formData.descricao && !formData.audioBlob && !formData.audioFile && formData.imagens.length === 0 && !formData.video) {
          newErrors.descricao = 'Informe o conteúdo da manifestação (texto, áudio, imagem ou vídeo)'
        }
        break
        
      case 2: // Identificação
        if (!formData.anonimo) {
          if (!formData.nome) {
            newErrors.nome = 'Informe seu nome'
          }
          if (formData.receberResposta && !formData.email && !formData.telefone) {
            newErrors.email = 'Informe um e-mail ou telefone para receber resposta'
          }
          if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'E-mail inválido'
          }
        }
        break
        
      case 3: // Revisão
        if (!formData.concordaTermos) {
          newErrors.concordaTermos = 'Você precisa concordar com os termos para enviar'
        }
        break
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  /**
   * Avança para próxima etapa
   */
  const nextStep = useCallback(async () => {
    if (!validateStep(currentStep)) {
      toast.error('Por favor, corrija os erros antes de continuar.')
      speakFeedback('Há erros no formulário. Por favor, corrija-os.')
      return
    }
    
    // Na etapa de conteúdo, faz análise com IZA
    if (currentStep === 1 && formData.descricao) {
      try {
        const analysis = await analyzeWithIZA(formData.descricao)
        setIzaAnalysis(analysis)
      } catch (error) {
        console.warn('Análise IZA não disponível:', error)
      }
    }
    
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1)
      speakFeedback(`Etapa ${currentStep + 2} de ${STEPS.length}: ${STEPS[currentStep + 1].titleSimple}`)
    }
  }, [currentStep, formData.descricao, validateStep, toast, speakFeedback])

  /**
   * Volta para etapa anterior
   */
  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
      speakFeedback(`Voltando para etapa ${currentStep}: ${STEPS[currentStep - 1].titleSimple}`)
    }
  }, [currentStep, speakFeedback])

  /**
   * Envia manifestação
   */
  const handleSubmit = useCallback(async () => {
    if (!validateStep(currentStep)) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const result = await submitManifestacao(formData)
      
      toast.success('Manifestação enviada com sucesso!')
      speakFeedback(`Manifestação enviada com sucesso. Seu protocolo é ${result.protocolo}`)
      
      // Navega para página de sucesso
      navigate(`/protocolo/${result.protocolo}`)
      
    } catch (error) {
      console.error('Erro ao enviar:', error)
      toast.error('Erro ao enviar manifestação. Tente novamente.')
      speakFeedback('Erro ao enviar. Por favor, tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }, [currentStep, formData, navigate, validateStep, toast, speakFeedback])

  /**
   * Renderiza indicador de progresso
   */
  const renderProgress = () => (
    <nav className="progress-nav" aria-label="Progresso do formulário">
      <ol className="progress-steps">
        {STEPS.map((step, index) => (
          <li 
            key={step.id}
            className={`progress-step ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
          >
            <button
              type="button"
              className="progress-button"
              onClick={() => index < currentStep && setCurrentStep(index)}
              disabled={index > currentStep}
              aria-current={index === currentStep ? 'step' : undefined}
              aria-label={`${settings.simpleLang ? step.titleSimple : step.title}${index < currentStep ? ' (concluída)' : index === currentStep ? ' (atual)' : ''}`}
            >
              <span className="step-indicator" aria-hidden="true">
                {index < currentStep ? '✓' : index + 1}
              </span>
              <span className="step-label">
                {settings.simpleLang ? step.titleSimple : step.title}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  )

  /**
   * Etapa 1: Tipo de Manifestação
   */
  const renderStepTipo = () => (
    <div 
      className="form-step" 
      ref={el => stepRefs.current[0] = el}
      tabIndex={-1}
      aria-labelledby="step-tipo-title"
    >
      <h2 id="step-tipo-title" className="step-title">
        {settings.simpleLang ? 'O que você quer fazer?' : 'Tipo de Manifestação'}
      </h2>
      <p className="step-description">
        {settings.simpleLang 
          ? 'Escolha o que melhor descreve sua mensagem'
          : 'Selecione o tipo que melhor representa sua demanda'
        }
      </p>
      
      <fieldset className="tipo-options">
        <legend className="visually-hidden">Tipo de manifestação</legend>
        {TIPOS_MANIFESTACAO.map((tipo) => (
          <label 
            key={tipo.value} 
            className={`tipo-option ${formData.tipo === tipo.value ? 'selected' : ''}`}
          >
            <input
              type="radio"
              name="tipo"
              value={tipo.value}
              checked={formData.tipo === tipo.value}
              onChange={handleFieldChange}
              className="visually-hidden"
            />
            <span className="tipo-icon" aria-hidden="true">
              {tipo.value === 'reclamacao' && <i className="bi bi-chat-left-text icon-warning"></i>}
              {tipo.value === 'sugestao' && <i className="bi bi-lightbulb icon-info"></i>}
              {tipo.value === 'elogio' && <i className="bi bi-hand-thumbs-up icon-success"></i>}
              {tipo.value === 'denuncia' && <i className="bi bi-exclamation-triangle icon-error"></i>}
              {tipo.value === 'solicitacao' && <i className="bi bi-question-circle icon-primary"></i>}
            </span>
            <span className="tipo-label">
              {settings.simpleLang ? tipo.labelSimple : tipo.label}
            </span>
          </label>
        ))}
      </fieldset>
      {errors.tipo && (
        <p className="field-error-message" role="alert">{errors.tipo}</p>
      )}
      
      <FormField
        label={settings.simpleLang ? 'Sobre qual órgão?' : 'Órgão relacionado'}
        type="select"
        name="orgao"
        value={formData.orgao}
        onChange={handleFieldChange}
        options={ORGAOS}
        helpText={settings.simpleLang 
          ? 'Se não souber, escolha "Outro / Não sei informar"'
          : 'Selecione o órgão público relacionado à sua manifestação'
        }
      />
    </div>
  )

  /**
   * Etapa 2: Conteúdo da Manifestação
   */
  const renderStepConteudo = () => (
    <div 
      className="form-step" 
      ref={el => stepRefs.current[1] = el}
      tabIndex={-1}
      aria-labelledby="step-conteudo-title"
    >
      <h2 id="step-conteudo-title" className="step-title">
        {settings.simpleLang ? 'Conte o que aconteceu' : 'Conteúdo da Manifestação'}
      </h2>
      <p className="step-description">
        {settings.simpleLang 
          ? 'Use texto, áudio, foto ou vídeo. Você pode usar mais de um.'
          : 'Descreva sua manifestação utilizando texto, áudio, imagem e/ou vídeo.'
        }
      </p>
      
      <FormField
        label={settings.simpleLang ? 'Título (resumo curto)' : 'Assunto'}
        type="text"
        name="assunto"
        value={formData.assunto}
        onChange={handleFieldChange}
        placeholder={settings.simpleLang ? 'Ex: Problema no atendimento' : 'Resuma sua manifestação em poucas palavras'}
        maxLength={100}
      />
      
      <FormField
        label={settings.simpleLang ? 'Escreva sua mensagem' : 'Descrição'}
        type="textarea"
        name="descricao"
        value={formData.descricao}
        onChange={handleFieldChange}
        placeholder={settings.simpleLang 
          ? 'Conte com detalhes o que aconteceu, quando, onde e quem estava envolvido'
          : 'Forneça detalhes sobre sua manifestação: o que aconteceu, quando, onde, quem estava envolvido, etc.'
        }
        rows={6}
        maxLength={5000}
        error={errors.descricao}
        helpText={settings.simpleLang 
          ? 'Quanto mais detalhes, melhor poderemos ajudar'
          : 'Seja o mais detalhado possível para facilitar a análise'
        }
      />
      
      <div className="media-grid">
        {/* Gravação de Áudio */}
        <div className="media-section">
          <h3 className="media-title">
            <i className="bi bi-mic icon-primary" aria-hidden="true"></i>
            {settings.simpleLang ? 'Ou grave sua voz' : 'Gravação de Áudio'}
          </h3>
          <AudioRecorder 
            onRecordingComplete={(blob) => setFormData(prev => ({ ...prev, audioBlob: blob }))}
          onDescriptionChange={(desc) => setFormData(prev => ({ ...prev, audioGravadoDescricao: desc }))}
            maxDuration={300}
          />
        </div>
        
        {/* Upload de Áudio */}
        <div className="media-section">
          <h3 className="media-title">
            <i className="bi bi-mic icon-primary" aria-hidden="true"></i>
            {settings.simpleLang ? 'Envie um áudio' : 'Anexar Áudio'}
          </h3>
          <FileUpload 
            type="audio"
            onFileSelect={(file) => setFormData(prev => ({ ...prev, audioFile: file }))}
            onDescriptionChange={(desc) => setFormData(prev => ({ ...prev, audioDescricao: desc }))}
            maxSize={20}
          />
        </div>
        
        {/* Upload de Imagem */}
        <div className="media-section">
          <div className="media-header">
            <h3 className="media-title">
              <i className="bi bi-image icon-primary" aria-hidden="true"></i>
              {settings.simpleLang ? 'Adicione uma foto' : 'Anexar Imagem'}
            </h3>
          </div>
          <FileUpload 
            type="image"
            multiple
            maxFiles={5}
            onFileSelect={(files) => setFormData(prev => ({ ...prev, imagens: files || [] }))}
            onDescriptionChange={(descs) => setFormData(prev => ({ ...prev, imagensDescricao: descs || [] }))}
            maxSize={10}
            renderAction={({ openFilePicker, canAddMore, files, maxFiles, hasFiles }) => (
              hasFiles && canAddMore ? (
                <div className="media-header-action">
                  <Button
                    variant="outline"
                    size="small"
                    onClick={openFilePicker}
                    icon={<i className="bi bi-plus-circle"></i>}
                    ariaLabel={`Adicionar arquivo ${files.length}/${maxFiles}`}
                  >
                    Adicionar arquivo {files.length}/{maxFiles}
                  </Button>
                </div>
              ) : null
            )}
          />
        </div>
        
        {/* Upload de Vídeo */}
        <div className="media-section">
          <h3 className="media-title">
            <i className="bi bi-camera-video icon-primary" aria-hidden="true"></i>
            {settings.simpleLang ? 'Adicione um vídeo' : 'Anexar Vídeo'}
          </h3>
          <FileUpload 
            type="video"
            onFileSelect={(file) => setFormData(prev => ({ ...prev, video: file }))}
            onDescriptionChange={(desc) => setFormData(prev => ({ ...prev, videoDescricao: desc }))}
            maxSize={100}
          />
        </div>
      </div>
    </div>
  )

  /**
   * Etapa 3: Identificação
   */
  const renderStepIdentificacao = () => (
    <div 
      className="form-step" 
      ref={el => stepRefs.current[2] = el}
      tabIndex={-1}
      aria-labelledby="step-id-title"
    >
      <h2 id="step-id-title" className="step-title">
        {settings.simpleLang ? 'Seus dados' : 'Identificação'}
      </h2>
      <p className="step-description">
        {settings.simpleLang 
          ? 'Você pode se identificar ou enviar de forma anônima'
          : 'Informe seus dados para contato ou opte pelo anonimato'
        }
      </p>
      
      {/* Opção de Anonimato */}
      <div className="anonimato-section">
        <label className={`anonimato-option ${formData.anonimo ? 'selected' : ''}`}>
          <input
            type="checkbox"
            name="anonimo"
            checked={formData.anonimo}
            onChange={handleFieldChange}
          />
          <i className="bi bi-shield-lock anonimato-icon icon-success" aria-hidden="true"></i>
          <span className="anonimato-content">
            <strong>
              {settings.simpleLang ? 'Enviar sem me identificar' : 'Manifestação Anônima'}
            </strong>
            <span className="anonimato-help">
              {settings.simpleLang 
                ? 'Seus dados não serão guardados'
                : 'Seus dados pessoais não serão armazenados'
              }
            </span>
          </span>
        </label>
        
        {formData.anonimo && (
          <div className="anonimato-warning" role="alert">
            <i className="bi bi-exclamation-triangle icon-warning" aria-hidden="true"></i>
            <p>
              {settings.simpleLang 
                ? 'Atenção: se você não se identificar, não poderemos enviar a resposta para você. Você poderá consultar usando o número do protocolo.'
                : 'Atenção: Ao optar pelo anonimato, não será possível receber notificações sobre o andamento. Acompanhe pelo número do protocolo.'
              }
            </p>
          </div>
        )}
      </div>
      
      {/* Campos de identificação (mostrados se não anônimo) */}
      {!formData.anonimo && (
        <div className="identification-fields">
          <FormField
            label={settings.simpleLang ? 'Seu nome completo' : 'Nome Completo'}
            type="text"
            name="nome"
            value={formData.nome}
            onChange={handleFieldChange}
            required
            error={errors.nome}
            autoComplete="name"
          />
          
          <div className="field-row">
            <FormField
              label="E-mail"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleFieldChange}
              error={errors.email}
              autoComplete="email"
              helpText={settings.simpleLang 
                ? 'Para receber a resposta'
                : 'Opcional, mas necessário para receber notificações'
              }
            />
            
            <FormField
              label={settings.simpleLang ? 'Telefone' : 'Telefone (com DDD)'}
              type="tel"
              name="telefone"
              value={formData.telefone}
              onChange={handleFieldChange}
              autoComplete="tel"
              placeholder="(61) 99999-9999"
            />
          </div>
          
          <FormField
            label="CPF"
            type="text"
            name="cpf"
            value={formData.cpf}
            onChange={handleFieldChange}
            autoComplete="off"
            placeholder="000.000.000-00"
            helpText={settings.simpleLang 
              ? 'Não é obrigatório'
              : 'Opcional - ajuda na identificação do cidadão'
            }
          />
          
          <div className="checkbox-wrapper">
            <input
              type="checkbox"
              id="receberResposta"
              name="receberResposta"
              checked={formData.receberResposta}
              onChange={handleFieldChange}
            />
            <label htmlFor="receberResposta">
              {settings.simpleLang 
                ? 'Quero receber a resposta por e-mail'
                : 'Desejo receber notificações sobre o andamento por e-mail'
              }
            </label>
          </div>
        </div>
      )}
    </div>
  )

  /**
   * Etapa 4: Revisão
   */
  const renderStepRevisao = () => (
    <div 
      className="form-step" 
      ref={el => stepRefs.current[3] = el}
      tabIndex={-1}
      aria-labelledby="step-revisao-title"
    >
      <h2 id="step-revisao-title" className="step-title">
        {settings.simpleLang ? 'Confira tudo' : 'Revisão da Manifestação'}
      </h2>
      <p className="step-description">
        {settings.simpleLang 
          ? 'Veja se está tudo certo antes de enviar'
          : 'Confira os dados antes de enviar sua manifestação'
        }
      </p>
      
      {/* Análise da IA IZA */}
      {izaAnalysis && (
        <div className="iza-analysis" role="region" aria-labelledby="iza-title">
          <h3 id="iza-title" className="iza-title">
            <i className="bi bi-robot icon-primary" aria-hidden="true"></i>
            {settings.simpleLang ? 'Análise automática' : 'Análise da IA IZA'}
          </h3>
          <div className="iza-content">
            <p className="iza-classification">
              <strong>Classificação sugerida:</strong> {izaAnalysis.classificacao}
            </p>
            <p className="iza-orgao">
              <strong>Órgão identificado:</strong> {izaAnalysis.orgaoSugerido}
            </p>
            {izaAnalysis.observacao && (
              <p className="iza-observacao">{izaAnalysis.observacao}</p>
            )}
          </div>
        </div>
      )}
      
      {/* Resumo */}
      <div className="review-summary">
        <div className="review-item">
          <strong>Tipo:</strong>
          <span>{TIPOS_MANIFESTACAO.find(t => t.value === formData.tipo)?.label || '-'}</span>
        </div>
        
        <div className="review-item">
          <strong>Órgão:</strong>
          <span>{ORGAOS.find(o => o.value === formData.orgao)?.label || 'Não informado'}</span>
        </div>
        
        {formData.assunto && (
          <div className="review-item">
            <strong>Assunto:</strong>
            <span>{formData.assunto}</span>
          </div>
        )}
        
        {formData.descricao && (
          <div className="review-item review-item--full">
            <strong>Descrição:</strong>
            <p className="review-description">{formData.descricao}</p>
          </div>
        )}
        
        <div className="review-item">
          <strong>Anexos:</strong>
          <span>
            {[
              (formData.audioBlob || formData.audioFile) && 'Áudio',
              formData.imagens.length > 0 && `Imagem (${formData.imagens.length})`,
              formData.video && 'Vídeo'
            ].filter(Boolean).join(', ') || 'Nenhum'}
          </span>
        </div>
        
        <div className="review-item">
          <strong>Identificação:</strong>
          <span>{formData.anonimo ? 'Anônima' : formData.nome}</span>
        </div>
        
        {!formData.anonimo && formData.email && (
          <div className="review-item">
            <strong>E-mail:</strong>
            <span>{formData.email}</span>
          </div>
        )}
      </div>
      
      {/* Termos */}
      <div className="terms-section">
        <div className={`checkbox-wrapper ${errors.concordaTermos ? 'error' : ''}`}>
          <input
            type="checkbox"
            id="concordaTermos"
            name="concordaTermos"
            checked={formData.concordaTermos}
            onChange={handleFieldChange}
            aria-describedby={errors.concordaTermos ? 'terms-error' : undefined}
          />
          <label htmlFor="concordaTermos">
            {settings.simpleLang 
              ? 'Li e concordo que as informações são verdadeiras'
              : 'Declaro que as informações prestadas são verdadeiras e concordo com os termos de uso'
            }
          </label>
        </div>
        {errors.concordaTermos && (
          <p id="terms-error" className="field-error-message" role="alert">
            {errors.concordaTermos}
          </p>
        )}
      </div>
    </div>
  )

  return (
    <div className="manifestacao-page">
      <h1 className="page-title">
        {settings.simpleLang ? 'Enviar mensagem' : 'Nova Manifestação'}
      </h1>
      
      {renderProgress()}
      
      <form 
        ref={formRef}
        className="manifestacao-form"
        onSubmit={(e) => e.preventDefault()}
        noValidate
      >
        {/* Renderiza etapa atual */}
        {currentStep === 0 && renderStepTipo()}
        {currentStep === 1 && renderStepConteudo()}
        {currentStep === 2 && renderStepIdentificacao()}
        {currentStep === 3 && renderStepRevisao()}
        
        {/* Navegação entre etapas */}
        <div className="form-navigation">
          {currentStep > 0 && (
            <Button
              variant="outline"
              onClick={prevStep}
              type="button"
            >
              {settings.simpleLang ? 'Voltar' : 'Anterior'}
            </Button>
          )}
          
          <div className="nav-spacer" />
          
          {currentStep < STEPS.length - 1 ? (
            <Button
              variant="primary"
              onClick={nextStep}
              type="button"
            >
              {settings.simpleLang ? 'Continuar' : 'Próximo'}
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={isSubmitting}
              type="submit"
            >
              {settings.simpleLang ? 'Enviar' : 'Enviar Manifestação'}
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}

export default ManifestacaoPage

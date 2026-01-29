/**
 * Serviço de API - Participa DF
 * 
 * Este módulo contém as funções para comunicação com o backend.
 * Atualmente implementado como mock para demonstração.
 * 
 * Em produção, as funções fariam chamadas HTTP reais para:
 * - API do Participa DF
 * - Sistema de IA IZA da Ouvidoria-Geral do DF
 */

// ============================================================
// CONFIGURAÇÃO
// ============================================================

export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'
export const IZA_API_URL = import.meta.env.VITE_IZA_URL || '/api/iza'

// Simula latência de rede (para testes realistas)
const SIMULATED_DELAY = 1000

/**
 * Aguarda um tempo específico (simula latência)
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Gera um número de protocolo único
 * Formato: YYYYMMDDNNNNN (ano + mês + dia + sequencial de 5 dígitos)
 */
const generateProtocolo = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const random = String(Math.floor(Math.random() * 99999)).padStart(5, '0')
  return `${year}${month}${day}${random}`
}

// ============================================================
// MOCK DATA
// ============================================================

const DB_NAME = 'participa_df_db'
const DB_VERSION = 1
const STORE_MANIFESTACOES = 'manifestacoes'

/**
 * Base de dados simulada de manifestações (cache em memória)
 */
const mockDatabase = {
  manifestacoes: new Map()
}

const openDatabase = () => new Promise((resolve, reject) => {
  if (typeof indexedDB === 'undefined') {
    reject(new Error('IndexedDB não suportado'))
    return
  }
  const request = indexedDB.open(DB_NAME, DB_VERSION)
  request.onupgradeneeded = () => {
    const db = request.result
    if (!db.objectStoreNames.contains(STORE_MANIFESTACOES)) {
      db.createObjectStore(STORE_MANIFESTACOES, { keyPath: 'protocolo' })
    }
  }
  request.onsuccess = () => resolve(request.result)
  request.onerror = () => reject(request.error)
})

const dbPutManifestacao = async (manifestacao) => {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_MANIFESTACOES, 'readwrite')
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
    tx.objectStore(STORE_MANIFESTACOES).put(manifestacao)
  })
}

const dbGetManifestacao = async (protocolo) => {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_MANIFESTACOES, 'readonly')
    const request = tx.objectStore(STORE_MANIFESTACOES).get(protocolo)
    request.onsuccess = () => resolve(request.result || null)
    request.onerror = () => reject(request.error)
  })
}


/**
 * Órgãos do GDF para classificação
 */
const ORGAOS_MAP = {
  'saude': 'Secretaria de Estado de Saúde do DF',
  'educacao': 'Secretaria de Estado de Educação do DF',
  'transporte': 'Secretaria de Estado de Transporte e Mobilidade',
  'seguranca': 'Secretaria de Estado de Segurança Pública',
  'obras': 'Secretaria de Estado de Obras e Infraestrutura',
  'desenvolvimento': 'Secretaria de Estado de Desenvolvimento Social',
  'outro': 'Ouvidoria-Geral do DF'
}

/**
 * Tipos de manifestação
 */
const TIPOS_MAP = {
  'reclamacao': 'Reclamação',
  'sugestao': 'Sugestão',
  'elogio': 'Elogio',
  'denuncia': 'Denúncia',
  'solicitacao': 'Solicitação'
}

// ============================================================
// INTEGRAÇÃO COM IA IZA (SIMULADA)
// ============================================================

/**
 * Analisa texto usando a IA IZA
 * 
 * A IZA é o sistema de Inteligência Artificial da Ouvidoria-Geral do DF
 * que auxilia na classificação e análise de manifestações.
 * 
 * Em produção, esta função faria uma chamada para a API real da IZA:
 * POST {IZA_API_URL}/analyze
 * Body: { text: string, type: string }
 * 
 * @param {string} text - Texto da manifestação
 * @param {string} tipo - Tipo de manifestação (opcional)
 * @returns {Promise<Object>} - Análise da IZA
 */
export async function analyzeWithIZA(text, tipo = null) {
  await delay(SIMULATED_DELAY)
  
  // Simulação de análise de texto com palavras-chave
  const textLower = text.toLowerCase()
  
  // Detecção de órgão baseada em palavras-chave
  let orgaoSugerido = 'Ouvidoria-Geral do DF'
  let confianca = 0.6
  
  if (textLower.includes('hospital') || textLower.includes('upa') || 
      textLower.includes('médico') || textLower.includes('saúde') ||
      textLower.includes('posto') || textLower.includes('vacina')) {
    orgaoSugerido = 'Secretaria de Estado de Saúde do DF'
    confianca = 0.85
  } else if (textLower.includes('escola') || textLower.includes('professor') ||
             textLower.includes('matrícula') || textLower.includes('educação') ||
             textLower.includes('creche')) {
    orgaoSugerido = 'Secretaria de Estado de Educação do DF'
    confianca = 0.82
  } else if (textLower.includes('ônibus') || textLower.includes('metrô') ||
             textLower.includes('brt') || textLower.includes('transporte') ||
             textLower.includes('trânsito')) {
    orgaoSugerido = 'Secretaria de Estado de Transporte e Mobilidade'
    confianca = 0.88
  } else if (textLower.includes('polícia') || textLower.includes('segurança') ||
             textLower.includes('delegacia') || textLower.includes('crime') ||
             textLower.includes('assalto')) {
    orgaoSugerido = 'Secretaria de Estado de Segurança Pública'
    confianca = 0.80
  } else if (textLower.includes('buraco') || textLower.includes('asfalto') ||
             textLower.includes('obra') || textLower.includes('rua') ||
             textLower.includes('calçada')) {
    orgaoSugerido = 'Secretaria de Estado de Obras e Infraestrutura'
    confianca = 0.78
  }
  
  // Detecção de classificação/tipo
  let classificacao = tipo || 'Reclamação'
  
  if (textLower.includes('agradeço') || textLower.includes('parabéns') ||
      textLower.includes('excelente') || textLower.includes('ótimo')) {
    classificacao = 'Elogio'
  } else if (textLower.includes('sugiro') || textLower.includes('poderia') ||
             textLower.includes('seria bom') || textLower.includes('melhoria')) {
    classificacao = 'Sugestão'
  } else if (textLower.includes('denuncio') || textLower.includes('irregularidade') ||
             textLower.includes('corrupção') || textLower.includes('fraude')) {
    classificacao = 'Denúncia'
  } else if (textLower.includes('gostaria de saber') || textLower.includes('informação') ||
             textLower.includes('como faço') || textLower.includes('onde posso')) {
    classificacao = 'Solicitação'
  }
  
  // Detecção de urgência
  let urgencia = 'normal'
  if (textLower.includes('urgente') || textLower.includes('emergência') ||
      textLower.includes('grave') || textLower.includes('imediato')) {
    urgencia = 'alta'
  }
  
  // Detecção de possíveis dados sensíveis
  const possuiDadosSensiveis = /\d{3}[.\s]?\d{3}[.\s]?\d{3}[-\s]?\d{2}/.test(text) || // CPF
                               /\d{2}[.\s]?\d{3}[.\s]?\d{3}[-/]?\d{1}/.test(text) || // RG
                               textLower.includes('cpf') ||
                               textLower.includes('rg ')
  
  return {
    classificacao,
    orgaoSugerido,
    confianca: Math.round(confianca * 100),
    urgencia,
    possuiDadosSensiveis,
    observacao: possuiDadosSensiveis 
      ? 'Detectamos possíveis dados pessoais no texto. Eles serão tratados com sigilo conforme LGPD.'
      : null,
    processadoPor: 'IZA v2.0 - Inteligência Artificial da Ouvidoria-Geral do DF',
    timestamp: new Date().toISOString()
  }
}

// ============================================================
// API DE MANIFESTAÇÕES
// ============================================================

const MAX_PREVIEW_BYTES = 300 * 1024

const readAsDataUrl = (file) => new Promise((resolve) => {
  if (!file) {
    resolve(null)
    return
  }
  if (file.size > MAX_PREVIEW_BYTES) {
    if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
      resolve(URL.createObjectURL(file))
      return
    }
    resolve(null)
    return
  }
  if (typeof FileReader === 'undefined') {
    resolve(null)
    return
  }
  const reader = new FileReader()
  reader.onload = () => resolve(reader.result)
  reader.onerror = () => resolve(null)
  reader.readAsDataURL(file)
})


/**
 * Envia uma nova manifestação
 * 
 * Em produção, esta função faria:
 * POST {API_BASE_URL}/manifestacoes
 * Content-Type: multipart/form-data
 * 
 * @param {Object} formData - Dados da manifestação
 * @returns {Promise<Object>} - Resultado com protocolo
 */
export async function submitManifestacao(formData) {
  await delay(SIMULATED_DELAY * 2)
  
  const protocolo = generateProtocolo()
  const now = new Date()

  const anexos = []
  const imageDescriptions = Array.isArray(formData.imagensDescricao) ? formData.imagensDescricao : []

  if (formData.audioBlob) {
    const previewUrl = await readAsDataUrl(formData.audioBlob)
    anexos.push({
      type: 'audio',
      typeLabel: 'Áudio',
      name: 'Audio gravado',
      size: formData.audioBlob.size || 0,
      description: formData.audioGravadoDescricao || '',
      previewUrl
    })
  }

  if (formData.audioFile) {
    const previewUrl = await readAsDataUrl(formData.audioFile)
    anexos.push({
      type: 'audio',
      typeLabel: 'Áudio',
      name: formData.audioFile.name,
      size: formData.audioFile.size || 0,
      description: formData.audioDescricao || '',
      previewUrl
    })
  }

  if (Array.isArray(formData.imagens)) {
    const imagePreviews = await Promise.all(formData.imagens.map((file) => readAsDataUrl(file)))
    formData.imagens.forEach((file, index) => {
      anexos.push({
        type: 'imagem',
        typeLabel: 'Imagem',
        name: file?.name || `Imagem ${index + 1}`,
        size: file?.size || 0,
        description: imageDescriptions[index] || '',
        previewUrl: imagePreviews[index] || null
      })
    })
  }

  if (formData.video) {
    const previewUrl = await readAsDataUrl(formData.video)
    anexos.push({
      type: 'video',
      typeLabel: 'Vídeo',
      name: formData.video.name,
      size: formData.video.size || 0,
      description: formData.videoDescricao || '',
      previewUrl
    })
  }
  
  // Cria registro da manifestação
  const manifestacao = {
    protocolo,
    tipo: TIPOS_MAP[formData.tipo] || formData.tipo,
    orgao: ORGAOS_MAP[formData.orgao] || 'Ouvidoria-Geral do DF',
    assunto: formData.assunto,
    descricao: formData.descricao,
    temAudio: !!formData.audioBlob || !!formData.audioFile,
    temImagem: Array.isArray(formData.imagens) ? formData.imagens.length > 0 : !!formData.imagem,
    temVideo: !!formData.video,
    anexos,
    anonimo: formData.anonimo,
    nome: formData.anonimo ? null : formData.nome,
    email: formData.anonimo ? null : formData.email,
    telefone: formData.anonimo ? null : formData.telefone,
    status: 'recebida',
    dataRegistro: now.toISOString(),
    previsaoResposta: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 dias
    historico: [
      {
        data: now.toISOString(),
        descricao: 'Manifestação recebida pelo sistema Participa DF'
      }
    ]
  }
  
  // Salva no "banco de dados"
  mockDatabase.manifestacoes.set(protocolo, manifestacao)
  try {
    await dbPutManifestacao(manifestacao)
  } catch (error) {
    console.warn('[API Mock] Erro ao salvar no IndexedDB:', error)
  }
  
  console.log('[API Mock] Manifestação salva:', manifestacao)
  
  return {
    success: true,
    protocolo,
    message: 'Manifestação registrada com sucesso',
    previsaoResposta: manifestacao.previsaoResposta
  }
}

/**
 * Consulta uma manifestação pelo protocolo
 * 
 * Em produção, esta função faria:
 * GET {API_BASE_URL}/manifestacoes/{protocolo}
 * 
 * @param {string} protocolo - Número do protocolo
 * @returns {Promise<Object>} - Dados da manifestação
 */
export async function consultarProtocolo(protocolo) {
  await delay(SIMULATED_DELAY)
  
  // Primeiro, tenta buscar no mock database
  let manifestacao = mockDatabase.manifestacoes.get(protocolo)
  if (!manifestacao) {
    try {
      manifestacao = await dbGetManifestacao(protocolo)
      if (manifestacao) {
        mockDatabase.manifestacoes.set(protocolo, manifestacao)
      }
    } catch (error) {
      console.warn('[API Mock] Erro ao buscar no IndexedDB:', error)
    }
  }
  
  if (!manifestacao) {
    throw new Error('Protocolo não encontrado')
  }
  
  return manifestacao
}

/**
 * Faz upload de arquivo (áudio, imagem ou vídeo)
 * 
 * Em produção, esta função faria:
 * POST {API_BASE_URL}/upload
 * Content-Type: multipart/form-data
 * 
 * @param {File|Blob} file - Arquivo para upload
 * @param {string} type - Tipo do arquivo (audio, image, video)
 * @returns {Promise<Object>} - URL e metadados do arquivo
 */
export async function uploadFile(file, type) {
  await delay(SIMULATED_DELAY / 2)
  
  // Em produção, retornaria URL real do arquivo no servidor
  const mockUrl = URL.createObjectURL(file)
  
  return {
    success: true,
    url: mockUrl,
    type,
    size: file.size,
    mimeType: file.type,
    uploadedAt: new Date().toISOString()
  }
}

// ============================================================
// DOCUMENTAÇÃO DE INTEGRAÇÃO REAL
// ============================================================

/**
 * DOCUMENTAÇÃO PARA INTEGRAÇÃO REAL
 * 
 * Este arquivo contém mocks que simulam a API real.
 * Para integração em produção, as seguintes modificações são necessárias:
 * 
 * 1. VARIÁVEIS DE AMBIENTE
 *    - VITE_API_URL: URL base da API do Participa DF
 *    - VITE_IZA_URL: URL da API da IA IZA
 * 
 * 2. ENDPOINTS ESPERADOS DA API DO PARTICIPA DF
 *    
 *    POST /api/manifestacoes
 *    - Registra nova manifestação
 *    - Body: FormData com campos do formulário e arquivos
 *    - Retorna: { protocolo: string, success: boolean }
 *    
 *    GET /api/manifestacoes/:protocolo
 *    - Consulta manifestação por protocolo
 *    - Retorna: objeto com dados da manifestação
 *    
 *    POST /api/upload
 *    - Faz upload de arquivos (áudio, imagem, vídeo)
 *    - Body: FormData com arquivo
 *    - Retorna: { url: string, id: string }
 * 
 * 3. ENDPOINTS ESPERADOS DA API IZA
 *    
 *    POST /api/iza/analyze
 *    - Analisa texto da manifestação
 *    - Body: { text: string, type: string }
 *    - Retorna: { classificacao, orgaoSugerido, confianca, etc }
 *    
 *    POST /api/iza/transcribe
 *    - Transcreve áudio para texto
 *    - Body: FormData com arquivo de áudio
 *    - Retorna: { text: string }
 * 
 * 4. AUTENTICAÇÃO
 *    - A API pode exigir token de autenticação
 *    - Usar header: Authorization: Bearer {token}
 * 
 * 5. TRATAMENTO DE ERROS
 *    - 400: Dados inválidos
 *    - 401: Não autorizado
 *    - 404: Recurso não encontrado
 *    - 500: Erro interno do servidor
 */

export default {
  analyzeWithIZA,
  submitManifestacao,
  consultarProtocolo,
  uploadFile
}

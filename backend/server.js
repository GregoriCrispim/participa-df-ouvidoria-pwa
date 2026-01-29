/**
 * Backend Mock Server - Participa DF
 * 
 * Servidor Express simples para simular a API do Participa DF
 * e a integração com o sistema de IA IZA.
 * 
 * Este servidor é apenas para desenvolvimento e demonstração.
 * Em produção, as requisições seriam direcionadas para os
 * sistemas reais do GDF.
 * 
 * @author Equipe Hackathon Participa DF
 */

import express from 'express'
import cors from 'cors'
import multer from 'multer'
import { v4 as uuidv4 } from 'uuid'

const app = express()
const PORT = process.env.PORT || 3001

// Configuração do multer para upload de arquivos
const storage = multer.memoryStorage()
const upload = multer({ 
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB máximo
  }
})

// Middlewares
app.use(cors())
app.use(express.json())

// "Banco de dados" em memória
const database = {
  manifestacoes: new Map(),
  arquivos: new Map()
}

// ============================================================
// HELPERS
// ============================================================

/**
 * Gera número de protocolo no formato do Participa DF
 */
function generateProtocolo() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const random = String(Math.floor(Math.random() * 99999)).padStart(5, '0')
  return `${year}${month}${day}${random}`
}

/**
 * Simula análise de texto com IA IZA
 */
function analyzeWithIZA(text) {
  const textLower = text.toLowerCase()
  
  let orgaoSugerido = 'Ouvidoria-Geral do DF'
  let confianca = 60
  let classificacao = 'Reclamação'
  
  // Detecção de órgão
  if (textLower.includes('hospital') || textLower.includes('saúde')) {
    orgaoSugerido = 'Secretaria de Estado de Saúde do DF'
    confianca = 85
  } else if (textLower.includes('escola') || textLower.includes('educação')) {
    orgaoSugerido = 'Secretaria de Estado de Educação do DF'
    confianca = 82
  } else if (textLower.includes('ônibus') || textLower.includes('transporte')) {
    orgaoSugerido = 'Secretaria de Estado de Transporte e Mobilidade'
    confianca = 88
  }
  
  // Detecção de tipo
  if (textLower.includes('agradeço') || textLower.includes('parabéns')) {
    classificacao = 'Elogio'
  } else if (textLower.includes('sugiro') || textLower.includes('poderia')) {
    classificacao = 'Sugestão'
  } else if (textLower.includes('denuncio') || textLower.includes('irregularidade')) {
    classificacao = 'Denúncia'
  }
  
  return {
    classificacao,
    orgaoSugerido,
    confianca,
    urgencia: textLower.includes('urgente') ? 'alta' : 'normal',
    processadoPor: 'IZA v2.0',
    timestamp: new Date().toISOString()
  }
}

// ============================================================
// ROTAS DA API
// ============================================================

/**
 * Health check
 */
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'Participa DF - API Mock',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  })
})

/**
 * POST /api/manifestacoes
 * Registra nova manifestação
 */
app.post('/api/manifestacoes', upload.fields([
  { name: 'audio', maxCount: 1 },
  { name: 'imagem', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]), (req, res) => {
  try {
    const protocolo = generateProtocolo()
    const now = new Date()
    
    const manifestacao = {
      protocolo,
      tipo: req.body.tipo,
      orgao: req.body.orgao,
      assunto: req.body.assunto,
      descricao: req.body.descricao,
      anonimo: req.body.anonimo === 'true',
      nome: req.body.anonimo === 'true' ? null : req.body.nome,
      email: req.body.anonimo === 'true' ? null : req.body.email,
      telefone: req.body.anonimo === 'true' ? null : req.body.telefone,
      temAudio: !!req.files?.audio,
      temImagem: !!req.files?.imagem,
      temVideo: !!req.files?.video,
      status: 'recebida',
      dataRegistro: now.toISOString(),
      previsaoResposta: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      historico: [{
        data: now.toISOString(),
        descricao: 'Manifestação recebida pelo sistema Participa DF'
      }]
    }
    
    database.manifestacoes.set(protocolo, manifestacao)
    
    console.log(`[API] Nova manifestação registrada: ${protocolo}`)
    
    res.status(201).json({
      success: true,
      protocolo,
      message: 'Manifestação registrada com sucesso',
      previsaoResposta: manifestacao.previsaoResposta
    })
  } catch (error) {
    console.error('[API] Erro ao registrar manifestação:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno ao processar manifestação' 
    })
  }
})

/**
 * GET /api/manifestacoes/:protocolo
 * Consulta manifestação pelo protocolo
 */
app.get('/api/manifestacoes/:protocolo', (req, res) => {
  const { protocolo } = req.params
  
  let manifestacao = database.manifestacoes.get(protocolo)
  
  // Se não encontrar, gera dados fictícios para demo
  if (!manifestacao && /^\d{13}$/.test(protocolo)) {
    const dataRegistro = new Date()
    dataRegistro.setDate(dataRegistro.getDate() - Math.floor(Math.random() * 30))
    
    manifestacao = {
      protocolo,
      tipo: 'Reclamação',
      orgao: 'Secretaria de Estado de Saúde do DF',
      assunto: 'Atendimento em UPA',
      status: 'em_analise',
      dataRegistro: dataRegistro.toISOString(),
      previsaoResposta: new Date(dataRegistro.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      historico: [
        {
          data: dataRegistro.toISOString(),
          descricao: 'Manifestação recebida pelo sistema Participa DF'
        },
        {
          data: new Date(dataRegistro.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          descricao: 'Manifestação encaminhada para análise do órgão competente'
        }
      ]
    }
  }
  
  if (!manifestacao) {
    return res.status(404).json({ 
      success: false, 
      error: 'Protocolo não encontrado' 
    })
  }
  
  res.json(manifestacao)
})

/**
 * POST /api/iza/analyze
 * Analisa texto com IA IZA
 */
app.post('/api/iza/analyze', (req, res) => {
  const { text, tipo } = req.body
  
  if (!text) {
    return res.status(400).json({ 
      success: false, 
      error: 'Texto é obrigatório' 
    })
  }
  
  const analysis = analyzeWithIZA(text)
  
  console.log(`[IZA] Análise realizada - Classificação: ${analysis.classificacao}`)
  
  res.json(analysis)
})

/**
 * POST /api/upload
 * Upload de arquivo
 */
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ 
      success: false, 
      error: 'Arquivo é obrigatório' 
    })
  }
  
  const id = uuidv4()
  
  // Em produção, salvaria o arquivo em storage (S3, etc)
  database.arquivos.set(id, {
    id,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    size: req.file.size,
    uploadedAt: new Date().toISOString()
  })
  
  res.json({
    success: true,
    id,
    url: `/api/files/${id}`,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    size: req.file.size
  })
})

// ============================================================
// INICIALIZAÇÃO
// ============================================================

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║                                                        ║
║     🏛️  Participa DF - API Mock Server                 ║
║                                                        ║
║     Servidor rodando em http://localhost:${PORT}         ║
║                                                        ║
║     Endpoints disponíveis:                             ║
║     - GET  /api/health                                 ║
║     - POST /api/manifestacoes                          ║
║     - GET  /api/manifestacoes/:protocolo               ║
║     - POST /api/iza/analyze                            ║
║     - POST /api/upload                                 ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
  `)
})

export default app

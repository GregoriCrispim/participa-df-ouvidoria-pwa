# 🏛️ Participa DF - Ouvidoria PWA

> **Solução desenvolvida para o 1º Hackathon em Controle Social: Desafio Participa DF - Categoria Ouvidoria**
> 
> Controladoria-Geral do Distrito Federal (CGDF)

[![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite)](https://vitejs.dev/)
[![PWA](https://img.shields.io/badge/PWA-Enabled-5A0FC8?logo=pwa)](https://web.dev/progressive-web-apps/)
[![WCAG](https://img.shields.io/badge/WCAG-2.1%20AA-005A9C)](https://www.w3.org/WAI/WCAG21/quickref/)
---

## 📋 Índice

1. [Visão Geral](#-visão-geral)
2. [Tecnologias Utilizadas](#-tecnologias-utilizadas)
3. [Requisitos do Sistema](#-requisitos-do-sistema)
4. [Instalação](#-instalação)
5. [Execução](#-execução)
6. [Estrutura do Projeto](#-estrutura-do-projeto)
7. [Funcionalidades](#-funcionalidades)
8. [Acessibilidade](#-acessibilidade)
9. [Integração com IA IZA](#-integração-com-ia-iza)
10. [Decisões Técnicas](#-decisões-técnicas)
11. [Diferenciais](#-diferenciais)
12. [Uso de IA no Desenvolvimento](#-uso-de-ia-no-desenvolvimento)
13. [Vídeo Demonstrativo](#-vídeo-demonstrativo)
14. [Equipe](#-equipe)

---

## 🎯 Visão Geral

O **Participa DF - Ouvidoria PWA** é uma Progressive Web App que permite ao cidadão do Distrito Federal registrar manifestações (reclamações, sugestões, elogios, denúncias e solicitações) de forma **simples**, **acessível** e **multicanal**.

### Problema Resolvido

A participação cidadã no controle social frequentemente esbarra em barreiras de acessibilidade, complexidade de interfaces e falta de canais multimodais. Cidadãos com baixo letramento digital, deficiências visuais, auditivas ou motoras enfrentam dificuldades para exercer seu direito de manifestação.

### Nossa Solução

Uma PWA 100% acessível que permite registrar manifestações por:
- ✍️ **Texto** - Formulário simples e intuitivo
- 🎤 **Áudio** - Gravação direta pelo navegador
- 🖼️ **Imagem** - Upload com descrição acessível
- 🎬 **Vídeo** - Upload para evidências visuais

**Destaques:**
- 🔒 Opção de **anonimato** completo
- 📱 **Funciona offline** como PWA
- 🤖 **Integração com IA IZA** para classificação automática
- ♿ **WCAG 2.1 AA** em conformidade total

---

## 🛠 Tecnologias Utilizadas

### Frontend
| Tecnologia | Versão | Finalidade |
|------------|--------|------------|
| React | 18.2 | Biblioteca UI |
| Vite | 5.0 | Build tool e dev server |
| React Router | 6.20 | Navegação SPA |
| vite-plugin-pwa | 0.17 | Service Worker e manifest |

### Backend (Mock)
| Tecnologia | Versão | Finalidade |
|------------|--------|------------|
| Express | 4.18 | Servidor HTTP |
| Multer | 1.4.5 | Upload de arquivos |
| UUID | 9.0 | Geração de IDs |

### APIs do Navegador
- **MediaRecorder API** - Gravação de áudio
- **Web Speech API** - Feedback sonoro
- **Service Worker API** - Funcionamento offline
- **Clipboard API** - Copiar protocolo

---

## 💻 Requisitos do Sistema

### Para Desenvolvimento
- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 ou **yarn** >= 1.22.0
- Navegador moderno (Chrome 90+, Firefox 88+, Edge 90+, Safari 14+)

### Para Uso da PWA
- Qualquer navegador moderno
- Conexão com internet (apenas para primeiro acesso)
- Permissão para microfone (para gravação de áudio)

---

## 📦 Instalação

### 1. Clone o Repositório

```bash
git clone https://github.com/seu-usuario/participa-df-ouvidoria-pwa.git
cd participa-df-ouvidoria-pwa
```

### 2. Instale as Dependências do Frontend

```bash
npm install
```

### 3. (Opcional) Instale as Dependências do Backend Mock

```bash
cd backend
npm install
cd ..
```

---

## ▶️ Execução

### Modo Desenvolvimento (Frontend)

```bash
npm run dev
```

Acesse: **http://localhost:3000**

### Modo Desenvolvimento (Frontend + Backend)

Terminal 1 - Backend:
```bash
cd backend
npm start
```

Terminal 2 - Frontend:
```bash
npm run dev
```

### Build de Produção

```bash
npm run build
npm run preview
```

Os arquivos otimizados estarão em `./dist/`

---

## 📁 Estrutura do Projeto

```
participa-df-ouvidoria-pwa/
├── public/                      # Arquivos públicos
│   ├── icons/                   # Ícones da PWA
│   ├── favicon.svg              # Favicon
│   ├── sw.js                    # Service Worker
│   └── manifest.webmanifest     # Manifest PWA (gerado)
│
├── src/
│   ├── components/              # Componentes React reutilizáveis
│   │   ├── AccessibilityToolbar/  # Barra de acessibilidade
│   │   ├── AudioRecorder/         # Gravador de áudio
│   │   ├── Button/                # Botão acessível
│   │   ├── FileUpload/            # Upload de arquivos
│   │   ├── FormField/             # Campo de formulário
│   │   └── Layout/                # Layout principal
│   │
│   ├── contexts/                # Contextos React
│   │   ├── AccessibilityContext.jsx  # Estado de acessibilidade
│   │   └── ToastContext.jsx          # Sistema de notificações
│   │
│   ├── pages/                   # Páginas da aplicação
│   │   ├── HomePage.jsx           # Página inicial
│   │   ├── ManifestacaoPage.jsx   # Formulário de manifestação
│   │   ├── ConsultaPage.jsx       # Consulta de protocolo
│   │   ├── ProtocoloPage.jsx      # Sucesso (protocolo gerado)
│   │   ├── AcessibilidadePage.jsx # Configurações
│   │   └── NotFoundPage.jsx       # Página 404
│   │
│   ├── services/                # Serviços e APIs
│   │   └── api.js               # Cliente API e mocks
│   │
│   ├── styles/                  # Estilos globais
│   │   ├── global.css           # Reset e variáveis
│   │   └── accessibility.css    # Estilos de acessibilidade
│   │
│   ├── App.jsx                  # Componente raiz
│   └── main.jsx                 # Entry point
│
├── backend/                     # Servidor mock
│   ├── server.js                # Express server
│   └── package.json
│
├── index.html                   # HTML template
├── vite.config.js               # Configuração Vite + PWA
├── package.json
└── README.md
```

---

## ✨ Funcionalidades

### 📝 Registro de Manifestações
- 5 tipos: Reclamação, Sugestão, Elogio, Denúncia, Solicitação
- Formulário em etapas (wizard) para facilitar preenchimento
- Validação em tempo real com mensagens claras

### 🎤 Gravação de Áudio
- Gravação direta pelo navegador (até 5 minutos)
- Controles de pausar/retomar/parar
- Reprodução antes de enviar
- Indicador visual de tempo

### 📷 Upload de Imagens
- Formatos: JPG, PNG, GIF, WebP
- Limite: 10MB
- Preview da imagem
- Campo de descrição (alt text) para acessibilidade

### 🎬 Upload de Vídeos
- Formatos: MP4, WebM, MOV
- Limite: 100MB
- Player de preview
- Campo de descrição do conteúdo

### 🔒 Anonimato
- Opção clara de manifestação anônima
- Alerta sobre limitações (sem notificações)
- Dados pessoais não são armazenados

### 📋 Protocolo Automático
- Geração instantânea no formato YYYYMMDDNNNNN
- Botão para copiar
- Instruções de acompanhamento

### 🔍 Consulta de Manifestações
- Busca por número de protocolo
- Exibição de status com cores
- Histórico de tramitação
- Resposta do órgão (quando disponível)

---

## ♿ Acessibilidade

A aplicação foi desenvolvida em **conformidade total com WCAG 2.1 nível AA**.

### Estratégias Implementadas

#### 1. Navegação por Teclado
- Todos os elementos interativos são focáveis
- Ordem de tabulação lógica
- Skip link para conteúdo principal
- Indicadores de foco visíveis (3px outline)

#### 2. Leitores de Tela
- HTML semântico (`main`, `nav`, `header`, `footer`, `article`)
- ARIA labels em todos componentes
- `aria-live` para anúncios dinâmicos
- Descrições em imagens obrigatórias

#### 3. Contraste de Cores
- Texto normal: mínimo 4.5:1
- Texto grande: mínimo 3:1
- Cores verificadas com ferramentas automatizadas
- Modo alto contraste disponível

#### 4. Tamanho de Texto
- Base de 16px (mínimo)
- 3 opções de tamanho: Normal, Grande, Maior
- Zoom até 200% sem perda de funcionalidade

#### 5. Feedback Multimodal
- Mensagens visuais (toasts)
- Feedback sonoro (Web Speech API)
- Indicadores de estado (cores + ícones + texto)

#### 6. Linguagem Simples
- Modo de linguagem cidadã
- Textos alternativos mais simples
- Instruções claras e diretas

### Área de Toque
- Mínimo de 44x44 pixels em todos os botões
- Espaçamento adequado entre elementos

---

## 🤖 Integração com IA IZA

A **IZA** é o sistema de Inteligência Artificial da Ouvidoria-Geral do Distrito Federal, que auxilia na triagem e classificação de manifestações.

### Funcionalidades da Integração (Simulada)

1. **Classificação Automática**
   - Analisa o texto da manifestação
   - Sugere tipo (reclamação, sugestão, etc.)
   - Indica nível de confiança

2. **Identificação de Órgão**
   - Detecta palavras-chave
   - Sugere órgão destinatário
   - Baseado em contexto semântico

3. **Detecção de Urgência**
   - Identifica termos de urgência
   - Prioriza manifestações críticas

4. **Proteção de Dados**
   - Detecta possíveis dados sensíveis (CPF, RG)
   - Alerta sobre tratamento LGPD

### Status de Integração (Mock)

No contexto do hackathon, a integração com a API do Participa DF e com a IZA
está simulada localmente no `src/services/api.js`. Em produção, as chamadas
seriam realizadas via HTTP, conforme as variáveis e endpoints descritos abaixo.

### Integração Real

Para integração com a API real da IZA, configure as variáveis de ambiente:

```env
VITE_IZA_URL=https://api.iza.ouvidoria.df.gov.br
VITE_IZA_API_KEY=sua-chave-api
```

Endpoints esperados:
- `POST /analyze` - Análise de texto
- `POST /transcribe` - Transcrição de áudio

---

## 🧠 Decisões Técnicas

### Por que React + Vite?
- **React**: Componentização, hooks e ecossistema maduro
- **Vite**: Build ultrarrápido, HMR eficiente, config simples para PWA

### Por que PWA?
- Funciona offline após primeiro acesso
- Instalável como app nativo
- Notificações push (futuro)
- Economia de dados do cidadão

### Por que não usar bibliotecas de UI?
- Controle total sobre acessibilidade
- Menor bundle size
- Sem dependências de terceiros para features críticas

### Por que Context API ao invés de Redux?
- Aplicação de escopo limitado
- Menos boilerplate
- Suficiente para estado global necessário

### Fonte Atkinson Hyperlegible
- Desenvolvida especificamente para baixa visão
- Caracteres distinguíveis (l, I, 1)
- Licença gratuita

---

## 🌟 Diferenciais

### 1. Modo de Linguagem Simples 💬
Textos alternativos em linguagem cidadã, acessível para pessoas com baixo letramento digital ou cognitivo. Ativável com um clique.

### 2. Feedback em Áudio 🔊
Sistema de Text-to-Speech nativo que lê mensagens importantes, alertas e confirmações. Ideal para pessoas com deficiência visual ou que preferem feedback auditivo.

### 3. Fluxo Simplificado para Baixo Letramento Digital 📱
- Formulário em etapas (wizard)
- Progresso visual claro
- Mínimo de campos obrigatórios
- Validações amigáveis

### 4. Alta Replicabilidade no Setor Público 🏛️
- Código organizado e documentado
- Sem dependências proprietárias
- Arquitetura desacoplada
- Fácil customização de tema/marca

---

## 🤖 Uso de IA no Desenvolvimento

Conforme exigido pelo edital (item 13.9), declaramos o uso de ferramentas de IA:

### Ferramentas Utilizadas
- **Claude (Anthropic)** - Assistência na arquitetura e geração de código
- **GitHub Copilot** - Autocompletar e sugestões de código

### Bibliotecas de IA na Aplicação
- **Web Speech API** (nativa do navegador) - Síntese de fala para feedback sonoro
- **Mock IZA API** - Simulação de análise de texto (em produção, usaria a API real da CGDF)

---

## 🎬 Vídeo Demonstrativo

**Link do Vídeo:** [Assistir no YouTube](https://www.youtube.com/watch?v=uaiCPJpkNzI)

### Roteiro do Vídeo (até 7 minutos)

#### 0:00 - Abertura (30s)
- Apresentação da equipe
- Contexto do hackathon
- Problema identificado

#### 0:30 - Visão Geral (1min)
- Objetivo da solução
- Público-alvo
- Diferenciais principais

#### 1:30 - Demonstração de Acessibilidade (2min)
- Navegação por teclado
- Leitor de tela (NVDA/VoiceOver)
- Modo linguagem simples
- Tamanho de fonte
- Feedback em áudio

#### 3:30 - Fluxo de Manifestação (2min)
- Envio por texto
- Gravação de áudio
- Upload de imagem com descrição
- Opção de anonimato
- Geração de protocolo

#### 5:30 - Integração IZA e Consulta (1min)
- Análise automática
- Consulta de protocolo
- Histórico de tramitação

#### 6:30 - Encerramento (30s)
- Impacto social esperado
- Replicabilidade
- Agradecimentos

---

## 👥 Equipe

Desenvolvido para o **1º Hackathon em Controle Social: Desafio Participa DF**

- Controladoria-Geral do Distrito Federal (CGDF)
- Período: 12/01/2026 a 30/01/2026

---

## 📞 Contato

- **Hackathon:** desafioparticipadf@cg.df.gov.br
- **Ouvidoria GDF:** 162 (ligação gratuita)
- **Site oficial:** https://www.cg.df.gov.br/

---

<div align="center">

**Participa DF - Conectando Governo e Cidadão** 🏛️

*"A voz do cidadão fortalece a democracia"*

</div>

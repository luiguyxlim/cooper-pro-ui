# Cooper Pro - Sistema de Gestão de Avaliandos

Sistema completo para gerenciamento de avaliandos e testes de performance física, focado no teste de Cooper e avaliações de condicionamento físico.

## 🚀 Funcionalidades

### Gestão de Avaliandos
- ✅ Cadastro completo de avaliandos
- ✅ Ativação/desativação de perfis
- ✅ Histórico de testes por avaliando
- ✅ Cálculo automático de idade

### Testes de Performance
- ✅ Teste de Cooper (12 minutos)
- ✅ Cálculo automático de VO2 Max
- ✅ Classificação por idade e gênero
- ✅ Histórico completo de resultados

### Avaliação de Performance
- ✅ Formulário de avaliação baseado em testes anteriores
- ✅ Cálculos de intensidade de treino
- ✅ Métricas de consumo de oxigênio
- ✅ Estimativa de gasto calórico

### Interface e Experiência
- ✅ Design responsivo e moderno
- ✅ PWA (Progressive Web App)
- ✅ Navegação intuitiva
- ✅ Feedback tátil em dispositivos móveis

## 🛠️ Tecnologias

- **Frontend:** Next.js 14, React, TypeScript
- **Styling:** Tailwind CSS, Radix UI
- **Backend:** Supabase (PostgreSQL)
- **Autenticação:** Supabase Auth
- **PWA:** Service Worker, Web App Manifest
- **Testes:** Jest, Playwright

## 📱 PWA Features

- Instalação nativa em dispositivos móveis
- Funcionamento offline
- Notificações push
- Atualizações automáticas

## 🏗️ Estrutura do Projeto

```
src/
├── app/                    # App Router (Next.js 14)
│   ├── dashboard/         # Dashboard principal
│   ├── evaluatees/        # Gestão de avaliandos
│   ├── tests/            # Gestão de testes
│   └── auth/             # Autenticação
├── components/           # Componentes React
│   ├── ui/              # Componentes de UI base
│   ├── StudentCard.tsx   # Card de avaliando
│   ├── TestCard.tsx      # Card de teste
│   └── forms/           # Formulários
├── lib/                 # Utilitários e configurações
│   ├── actions/         # Server Actions
│   ├── supabase.ts      # Cliente Supabase
│   └── utils.ts         # Funções utilitárias
└── types/              # Definições TypeScript
```

## 🚀 Como Executar

1. Clone o repositório
2. Instale as dependências: `npm install`
3. Configure as variáveis de ambiente
4. Execute: `npm run dev`
5. Acesse: `http://localhost:3000`

## 📊 Métricas de Performance

O sistema calcula automaticamente:
- VO2 Max baseado na distância percorrida
- Classificação por idade e gênero
- Intensidade de treino personalizada
- Consumo de oxigênio durante exercícios
- Estimativa de gasto calórico

## 🧪 Testes

- **Unitários:** Jest + Testing Library
- **E2E:** Playwright
- **Cobertura:** >80% do código

## 📄 Licença

MIT License - veja o arquivo LICENSE para detalhes.
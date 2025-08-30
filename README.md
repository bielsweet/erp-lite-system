# ERP Lite - Sistema de Gestão

Sistema de gestão completo para micro e pequenas empresas, com funcionalidades de PDV, estoque, vendas, financeiro e entregas.

## 🚀 Configuração Inicial

### 1. Configurar Autenticação (Clerk)

**Você já tem as chaves do Clerk! Agora configure:**

#### Backend (Secret Key):
1. Na interface do Leap, vá para a aba **"Infrastructure"**
2. Adicione um novo secret:
   - **Nome:** `ClerkSecretKey`
   - **Valor:** `sk_test_Sxb6RH8wQHrUOYQNygfgmBbYIAnTVWRFSrNZ08GRxi`

#### Frontend (Publishable Key):
1. No dashboard do Clerk, vá em **"API Keys"**
2. Copie a **"Publishable key"** (começa com `pk_test_`)
3. Abra `frontend/config.ts`
4. Substitua a linha:
   ```typescript
   export const clerkPublishableKey = "";
   ```
   Por:
   ```typescript
   export const clerkPublishableKey = "pk_test_SUA_CHAVE_AQUI";
   ```

### 2. Configurar Domínio Autorizado

No dashboard do Clerk:
1. Vá em **"Domains"**
2. Adicione seu domínio de desenvolvimento (ex: `https://your-app.lp.dev`)

## 📋 Funcionalidades

### ✅ Módulos Implementados

- **Dashboard** - Visão geral do negócio
- **Produtos** - Cadastro e gestão de produtos
- **PDV** - Ponto de venda com atalhos de teclado
- **Vendas** - Histórico e relatórios de vendas
- **Financeiro** - Controle de receitas e despesas
- **Entregas** - Gestão de entregas estilo Kanban
- **Relatórios** - Análises e insights do negócio

### 🎯 Características Principais

- **Interface moderna** - Design limpo e responsivo
- **PDV otimizado** - Operação apenas com teclado
- **Controle de estoque** - Movimentações automáticas
- **Gestão financeira** - Fluxo de caixa completo
- **Sistema de entregas** - Kanban board intuitivo
- **Relatórios detalhados** - Insights para tomada de decisão

## ⌨️ Atalhos do PDV

- **F2** - Buscar produto
- **F3** - Alterar quantidade
- **F4** - Finalizar venda
- **F5** - Limpar carrinho

## 🔧 Tecnologias

- **Backend:** Encore.ts, PostgreSQL
- **Frontend:** React, TypeScript, Tailwind CSS
- **Autenticação:** Clerk
- **UI Components:** shadcn/ui

## 📊 Próximas Funcionalidades

- Emissão de NF-e/NFC-e
- Integração com PIX automático
- Multiempresas
- Integração com e-commerce
- Relatórios avançados com gráficos

## 🔑 Status da Configuração

- ✅ **Secret Key configurada** - `sk_test_Sxb6RH8wQHrUOYQNygfgmBbYIAnTVWRFSrNZ08GRxi`
- ⏳ **Publishable Key** - Precisa ser configurada em `frontend/config.ts`
- ⏳ **Domínio autorizado** - Precisa ser adicionado no dashboard do Clerk

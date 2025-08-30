# ERP Lite - Sistema de Gestão

Sistema de gestão completo para micro e pequenas empresas, com funcionalidades de PDV, estoque, vendas, financeiro e entregas.

## 🚀 Configuração Inicial

### 1. Configurar Autenticação (Clerk)

1. **Criar conta no Clerk:**
   - Acesse [https://clerk.com](https://clerk.com)
   - Crie uma conta gratuita
   - Faça login no dashboard

2. **Criar aplicação:**
   - Clique em "Add application"
   - Escolha um nome (ex: "ERP Lite")
   - Selecione métodos de autenticação (email/senha)
   - Clique em "Create application"

3. **Obter chaves:**
   - No dashboard, vá em "API Keys"
   - Copie a **Publishable key** (começa com `pk_test_`)
   - Copie a **Secret key** (começa com `sk_test_`)

4. **Configurar no projeto:**
   - Abra `frontend/config.ts`
   - Substitua `pk_test_your_publishable_key_here` pela sua Publishable key
   - Na aba "Infrastructure" do Leap, adicione um secret chamado `ClerkSecretKey` com sua Secret key

### 2. Configurar Domínio Autorizado

No dashboard do Clerk:
1. Vá em "Domains"
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

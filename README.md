# 🥬 Fresh Fare POS - Sistema de PDV para Hortifruti

Sistema completo de Ponto de Venda (PDV) profissional para hortifruti, criado com React via CDN e Supabase.

## ✨ Características

- ✅ **100% via CDN** - Sem npm install, sem node_modules!
- ✅ **Leve e Rápido** - Funciona direto no navegador
- ✅ **Design Profissional** - Interface moderna e intuitiva
- ✅ **Supabase PostgreSQL** - Banco de dados robusto e gratuito
- ✅ **Responsivo** - Funciona em desktop, tablet e mobile

## 📋 Funcionalidades

### 🛒 PDV (Ponto de Venda)
- Leitura de código de barras
- Busca por nome do produto
- Carrinho de compras interativo
- Múltiplas formas de pagamento (Dinheiro, Crédito, Débito, PIX)
- Cálculo automático de troco
- Atalhos de teclado (F1-F11)

### 📊 Dashboard
- Faturamento do dia
- Total de vendas realizadas
- Ticket médio
- Itens vendidos
- Histórico de vendas

### 📦 Gestão de Estoque
- Cadastro de produtos
- Controle de estoque mínimo
- Busca e filtros avançados
- Categorização de produtos

### 💰 Precificação Profissional
- Cálculo automático de preços
- Consideração de quebra/perda
- Margem de lucro configurável
- Sugestão de preço de venda

## 🚀 Como Usar

### Passo 1: Configurar o Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta gratuita
2. Crie um novo projeto
3. Na aba SQL Editor, execute o script abaixo:

```sql
-- CRIAR TABELAS DO SISTEMA

-- Tabela: produtos
CREATE TABLE produtos (
  id BIGSERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  codigo_barras VARCHAR(100) UNIQUE,
  categoria VARCHAR(100) NOT NULL,
  tipo_venda VARCHAR(10) NOT NULL,
  preco_venda DECIMAL(10,2) NOT NULL,
  custo_nota DECIMAL(10,2),
  quebra_perda DECIMAL(5,2) DEFAULT 0,
  margem_lucro DECIMAL(5,2) DEFAULT 0,
  estoque_atual INTEGER DEFAULT 0,
  estoque_minimo INTEGER DEFAULT 0,
  compra_caixa_fechada BOOLEAN DEFAULT false,
  ativo BOOLEAN DEFAULT true,
  data_cadastro TIMESTAMP DEFAULT NOW(),
  data_atualizacao TIMESTAMP DEFAULT NOW()
);

-- Tabela: vendas
CREATE TABLE vendas (
  id BIGSERIAL PRIMARY KEY,
  caixa_id VARCHAR(50) NOT NULL,
  data_venda TIMESTAMP DEFAULT NOW(),
  subtotal DECIMAL(10,2) NOT NULL,
  descontos DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  forma_pagamento VARCHAR(50),
  status VARCHAR(20) DEFAULT 'FINALIZADA',
  observacoes TEXT
);

-- Tabela: itens_venda
CREATE TABLE itens_venda (
  id BIGSERIAL PRIMARY KEY,
  venda_id BIGINT REFERENCES vendas(id) ON DELETE CASCADE,
  produto_id BIGINT REFERENCES produtos(id),
  descricao_produto VARCHAR(255) NOT NULL,
  quantidade DECIMAL(10,3) NOT NULL,
  preco_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  tipo_venda VARCHAR(10) NOT NULL
);

-- Tabela: caixas
CREATE TABLE caixas (
  id VARCHAR(50) PRIMARY KEY,
  data_abertura TIMESTAMP NOT NULL,
  data_fechamento TIMESTAMP,
  valor_abertura DECIMAL(10,2) DEFAULT 0,
  valor_fechamento DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'ABERTO',
  responsavel VARCHAR(100)
);

-- Tabela: categorias
CREATE TABLE categorias (
  id BIGSERIAL PRIMARY KEY,
  nome VARCHAR(100) UNIQUE NOT NULL,
  descricao TEXT,
  ativo BOOLEAN DEFAULT true
);

-- Inserir dados de exemplo (OPCIONAL)
INSERT INTO produtos (nome, codigo_barras, categoria, tipo_venda, preco_venda, estoque_atual, estoque_minimo) VALUES
('Tomate Italiano', '7891234567890', 'Verduras', 'KG', 8.90, 50, 10),
('Alface Crespa', '7891234567891', 'Verduras', 'UN', 3.50, 30, 5),
('Banana Prata', '7891234567892', 'Frutas', 'KG', 5.90, 100, 20),
('Laranja Lima', '7891234567893', 'Frutas', 'KG', 4.50, 80, 15),
('Cenoura', '7891234567894', 'Legumes', 'KG', 3.90, 60, 10);
```

4. Vá em **Settings > API** e copie:
   - `Project URL` (URL do projeto)
   - `anon public` key (Chave pública)

### Passo 2: Configurar o Sistema

1. Abra o arquivo `js/app.js`
2. Localize as linhas 8 e 9:

```javascript
const SUPABASE_URL = 'SUA_URL_SUPABASE_AQUI';
const SUPABASE_ANON_KEY = 'SUA_CHAVE_PUBLICA_AQUI';
```

3. Substitua pelos seus dados do Supabase:

```javascript
const SUPABASE_URL = 'https://seuprojetoaqui.supabase.co';
const SUPABASE_ANON_KEY = 'sua-chave-publica-aqui';
```

### Passo 3: Executar o Sistema

**Opção 1: Servidor Local Simples**

Se você tem Python instalado:

```bash
# No terminal, na pasta do projeto:
python -m http.server 8000

# Ou com Python 2:
python -m SimpleHTTPServer 8000
```

Depois acesse: `http://localhost:8000`

**Opção 2: Extensão Live Server (VS Code)**

1. Instale a extensão "Live Server" no VS Code
2. Clique com botão direito no `index.html`
3. Selecione "Open with Live Server"

**Opção 3: Abrir Direto no Navegador**

Pode simplesmente abrir o arquivo `index.html` direto no navegador! Mas algumas funcionalidades podem não funcionar por restrições de CORS.

### Passo 4: Deploy no Vercel (GRATUITO)

1. Crie uma conta em [vercel.com](https://vercel.com)
2. Instale o Vercel CLI:

```bash
npm install -g vercel
```

3. Na pasta do projeto, execute:

```bash
vercel
```

4. Siga as instruções e seu site estará no ar em segundos!

**Alternativa sem CLI:**
- Acesse [vercel.com/new](https://vercel.com/new)
- Faça upload da pasta do projeto
- Pronto! Seu sistema está online

## 📁 Estrutura de Arquivos

```
fresh-fare-pos/
├── index.html          # Página principal
├── css/
│   └── style.css       # Estilos customizados
└── js/
    └── app.js          # Aplicação React completa
```

## 🎨 Paleta de Cores

- **Verde Principal**: #10B981
- **Verde Escuro**: #064E3B
- **Verde Claro**: #D1FAE5
- **Amarelo/Dourado**: #F59E0B
- **Vermelho**: #EF4444

## ⌨️ Atalhos de Teclado (PDV)

- **F1**: Buscar produto
- **F6**: Abrir modal de pagamento
- **F4 / ESC**: Cancelar venda
- **Enter**: Adicionar produto ao carrinho

## 🔧 Personalização

### Mudar Logo
Edite a linha no arquivo `js/app.js` onde está o emoji 🥬

### Adicionar Categorias
Execute no Supabase:

```sql
INSERT INTO categorias (nome, descricao) VALUES
('Frutas', 'Frutas em geral'),
('Verduras', 'Verduras e folhas'),
('Legumes', 'Legumes diversos');
```

### Mudar Cores
Edite o arquivo `css/style.css` ou altere no Tailwind config em `index.html`

## 🐛 Troubleshooting

### Erro: "Cannot read properties of undefined"
- Verifique se você configurou corretamente as credenciais do Supabase no `app.js`

### Tabelas não aparecem no Dashboard
- Certifique-se de que executou todos os scripts SQL no Supabase
- Verifique se as tabelas foram criadas corretamente

### Sistema não carrega
- Verifique se está servindo os arquivos via servidor HTTP (não abrindo direto do sistema de arquivos)
- Verifique o console do navegador (F12) para erros

### Produtos não aparecem no PDV
- Confirme que você tem produtos cadastrados no banco
- Use o SQL de exemplo fornecido acima

## 📝 Próximas Melhorias

- [ ] Impressão de comprovantes
- [ ] Integração com balança
- [ ] Relatórios avançados
- [ ] Sistema de usuários e permissões
- [ ] Multi-loja
- [ ] App mobile (PWA)
- [ ] Integração com nota fiscal eletrônica

## 💡 Suporte

Para dúvidas ou problemas:
1. Verifique o console do navegador (F12)
2. Confira se o Supabase está configurado corretamente
3. Revise os logs do Supabase em **Database > Logs**

## 📄 Licença

Este projeto é de código aberto e pode ser usado livremente para fins comerciais ou pessoais.

---

**Desenvolvido com ❤️ para facilitar a gestão de hortifrútis**

Versão: 1.0 | Fevereiro 2026

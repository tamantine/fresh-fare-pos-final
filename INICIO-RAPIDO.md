# 🚀 GUIA RÁPIDO - Fresh Fare POS

## ⚡ Começar em 5 Minutos

### Passo 1: Configurar Supabase (2 minutos)

1. **Criar conta**
   - Acesse: https://supabase.com
   - Clique em "Start your project"
   - Faça login com GitHub ou Email

2. **Criar projeto**
   - Clique em "New Project"
   - Nome: "fresh-fare-pos"
   - Database Password: crie uma senha forte
   - Region: escolha a mais próxima
   - Clique em "Create new project"

3. **Executar SQL**
   - Menu lateral: SQL Editor
   - Clique em "+ New query"
   - Copie TODO o conteúdo do arquivo `database.sql`
   - Cole no editor
   - Clique em "RUN" (canto inferior direito)
   - Aguarde mensagem "Success"

4. **Pegar credenciais**
   - Menu lateral: Settings > API
   - Copie a "Project URL" (algo como: https://xxxxx.supabase.co)
   - Copie a "anon public" key (texto longo começando com "eyJ...")

### Passo 2: Configurar o Sistema (1 minuto)

1. **Abrir arquivo de configuração**
   - Abra o arquivo: `js/app.js`
   - Procure pelas linhas 8 e 9

2. **Colar suas credenciais**
   
   **ANTES:**
   ```javascript
   const SUPABASE_URL = 'SUA_URL_SUPABASE_AQUI';
   const SUPABASE_ANON_KEY = 'SUA_CHAVE_PUBLICA_AQUI';
   ```

   **DEPOIS:**
   ```javascript
   const SUPABASE_URL = 'https://xxxxx.supabase.co';
   const SUPABASE_ANON_KEY = 'eyJ...sua-chave-aqui...';
   ```

3. **Salvar o arquivo** (Ctrl+S)

### Passo 3: Rodar o Sistema (2 minutos)

**OPÇÃO A: Python (Mais Fácil)**

1. Abra o terminal na pasta do projeto
2. Digite e pressione Enter:
   ```bash
   python -m http.server 8000
   ```
3. Abra o navegador em: `http://localhost:8000`

**OPÇÃO B: VS Code com Live Server**

1. Instale extensão "Live Server" no VS Code
2. Clique direito em `index.html`
3. "Open with Live Server"

**OPÇÃO C: Abrir direto (pode ter limitações)**

1. Dê dois cliques em `index.html`
2. Abre automaticamente no navegador

---

## 🎯 Testando o Sistema

### 1. Acessar o Dashboard
- Logo ao abrir, você verá o painel
- Métricas ainda em zero (normal!)

### 2. Cadastrar um Produto
- Menu lateral: clique em "Estoque"
- Botão verde: "➕ Novo Produto"
- Preencha:
  - Nome: Tomate
  - Categoria: Legumes
  - Tipo: KG
  - Preço: 8.90
- Clique em "Salvar"

### 3. Fazer uma Venda
- Menu lateral: clique em "PDV (Caixa)"
- No campo "CÓDIGO / NOME": digite "tomate"
- Pressione Enter
- Altere quantidade se desejar
- Clique "Adicionar Item"
- Clique "PAGAMENTO (F6)"
- Escolha forma de pagamento (ex: DINHEIRO)
- Clique "Finalizar Venda"
- ✅ Primeira venda concluída!

### 4. Ver Resultados
- Menu lateral: clique em "Painel"
- Veja suas métricas atualizadas!

---

## 📱 Atalhos Úteis

### No PDV:
- **F6**: Abrir pagamento
- **F4**: Cancelar venda
- **Enter**: Adicionar ao carrinho
- **ESC**: Limpar campos

---

## ❓ Problemas Comuns

### "Produto não encontrado"
✅ **Solução**: Certifique-se de cadastrar produtos primeiro no menu "Estoque"

### "Erro ao carregar dados"
✅ **Solução**: 
1. Verifique se as credenciais do Supabase estão corretas
2. Verifique se executou o arquivo `database.sql` completo
3. Abra F12 no navegador e veja erros no Console

### Tela em branco
✅ **Solução**:
1. Verifique se está rodando via servidor (Python ou Live Server)
2. Não abra direto do explorador de arquivos
3. Pressione F12 e veja erros no Console

### Dashboard vazio
✅ **Normal!** Faça algumas vendas primeiro

---

## 🎨 Personalizações Rápidas

### Mudar nome da loja
📝 Arquivo: `js/app.js`
📍 Linha: ~270
```javascript
<h1 className="text-2xl font-bold">SEU NOME AQUI</h1>
```

### Mudar cor principal
📝 Arquivo: `index.html`
📍 Linha: ~34
```javascript
'verde-principal': '#10B981', // mude para sua cor
```

### Adicionar mais produtos
📝 Menu: Estoque > ➕ Novo Produto

---

## 🌐 Colocar Online (GRÁTIS)

### Via Vercel (Recomendado)

1. Acesse: https://vercel.com
2. Faça login com GitHub
3. Clique em "Add New" > "Project"
4. Faça upload da pasta `fresh-fare-pos`
5. Clique em "Deploy"
6. Pronto! Seu site está no ar em: `seu-projeto.vercel.app`

### Via Netlify

1. Acesse: https://netlify.com
2. Arraste a pasta `fresh-fare-pos` para o site
3. Pronto!

---

## 📞 Suporte

### Erros no Console (F12)
- Copie a mensagem de erro
- Verifique se:
  - Supabase está configurado
  - Arquivo database.sql foi executado
  - Servidor está rodando

### Banco de Dados
- Acesse: Supabase > Table Editor
- Veja se as tabelas foram criadas:
  - produtos
  - vendas
  - itens_venda
  - caixas
  - categorias

---

## ✅ Checklist Final

- [ ] Supabase criado e configurado
- [ ] Arquivo `database.sql` executado com sucesso
- [ ] Credenciais copiadas para `js/app.js`
- [ ] Servidor rodando (Python ou Live Server)
- [ ] Sistema abre no navegador
- [ ] Produtos aparecem na página Estoque
- [ ] Consegue fazer uma venda no PDV
- [ ] Dashboard mostra métricas

---

**🎉 Parabéns! Seu sistema está funcionando!**

Agora você pode:
- Cadastrar seus produtos reais
- Configurar preços
- Começar a usar no dia-a-dia
- Colocar online no Vercel

**Versão:** 1.0 - Fevereiro 2026

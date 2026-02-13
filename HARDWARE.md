# 🔧 GUIA DE CONFIGURAÇÃO DE HARDWARE

## Fresh Fare POS - Balanças e Impressoras

---

## ⚠️ IMPORTANTE: Requisitos

### Navegador Obrigatório
✅ **Google Chrome 89+** ou **Microsoft Edge 89+**

❌ Firefox, Safari e outros navegadores **NÃO suportam** WebSerial API

### Sistema Operacional
✅ Windows 10/11
✅ macOS 10.13+
✅ Linux (Ubuntu, Debian, etc)

---

## ⚖️ CONFIGURAÇÃO DE BALANÇAS

### Balanças Homologadas INMETRO Suportadas

#### 1. **Toledo**
- Prix 3
- Prix 4
- Prix 5
- 8217
- Outras com protocolo serial padrão Toledo

**Configuração:**
- Baudrate: 9600
- Data bits: 8
- Stop bits: 1
- Parity: None

#### 2. **Filizola**
- BP-15
- BP-30
- Platina
- Fit
- IDL Plus

**Configuração:**
- Baudrate: 9600
- Data bits: 8
- Stop bits: 1
- Parity: None

#### 3. **Urano**
- Pop-Z
- Topmax
- Integra
- UDC

**Configuração:**
- Baudrate: 9600
- Data bits: 7
- Stop bits: 1
- Parity: Even

#### 4. **Ramuza**
- DP-15
- DP-30
- Outras da linha DP

**Configuração:**
- Baudrate: 9600
- Data bits: 8
- Stop bits: 1
- Parity: None

#### 5. **Líder**
- LD
- LDB
- Série L

**Configuração:**
- Baudrate: 9600
- Data bits: 8
- Stop bits: 1
- Parity: None

---

### Como Conectar a Balança

#### Passo 1: Conexão Física
1. Conecte a balança na porta USB do computador
2. Se usar adaptador USB-Serial, instale os drivers (geralmente automático)
3. Ligue a balança
4. Aguarde Windows reconhecer (ícone USB na bandeja)

#### Passo 2: Verificar Porta COM (Windows)
1. Abra **Gerenciador de Dispositivos** (Win + X)
2. Expanda **Portas (COM e LPT)**
3. Anote o número da porta (ex: COM3, COM4)

#### Passo 3: No Sistema
1. No PDV, clique no botão **"⚖️ Balança"** no header
2. Selecione a marca da sua balança
3. Clique em **"Conectar Balança"**
4. Na janela que abrir, selecione a porta USB/Serial
5. Clique em **"Conectar"**

#### Passo 4: Testar
1. Clique em **"Ler Peso"**
2. Coloque um produto na balança
3. O peso deve aparecer no display

#### Passo 5: Ativar Leitura Automática (Opcional)
1. Clique em **"Leitura Contínua"**
2. O sistema irá atualizar o peso automaticamente
3. Quando adicionar produto ao carrinho, o peso será preenchido automaticamente

---

### Solução de Problemas - Balança

#### ❌ Erro: "Balança não conectada"
**Solução:**
- Verifique se a balança está ligada
- Verifique o cabo USB
- Reinstale drivers USB-Serial (se aplicável)
- Tente outra porta USB

#### ❌ Peso não aparece / sempre zero
**Solução:**
- Verifique se a balança está no modo "Serial" (veja manual)
- Confirme se selecionou a marca correta
- Verifique configurações de baudrate na balança
- Alguns modelos precisam pressionar tecla específica

#### ❌ Navegador não mostra opção de porta
**Solução:**
- Use Chrome ou Edge (obrigatório)
- Dê permissão quando o navegador solicitar
- Em Linux, adicione usuário ao grupo `dialout`:
  ```bash
  sudo usermod -a -G dialout $USER
  ```

---

## 🖨️ CONFIGURAÇÃO DE IMPRESSORAS TÉRMICAS

### Impressoras Homologadas Suportadas

#### 1. **Bematech**
- MP-4200 TH
- MP-100S TH
- MP-2800 TH
- LR2000

**Configuração:**
- Baudrate: 9600
- Data bits: 8
- Stop bits: 1
- Parity: None
- Protocolo: ESC/POS

#### 2. **Elgin**
- i9
- i7
- L42 PRO
- L42
- Vox+

**Configuração:**
- Baudrate: 115200
- Data bits: 8
- Stop bits: 1
- Parity: None
- Protocolo: ESC/POS

#### 3. **Daruma**
- DR-800
- DR-700
- DR-8000
- FS700

**Configuração:**
- Baudrate: 9600
- Data bits: 8
- Stop bits: 1
- Parity: None
- Protocolo: ESC/POS

#### 4. **Epson**
- TM-T20
- TM-T88V
- TM-T20X
- TM-M30

**Configuração:**
- Baudrate: 9600
- Data bits: 8
- Stop bits: 1
- Parity: None
- Protocolo: ESC/POS

#### 5. **Sweda**
- SI-300S
- SI-250
- IT-400

**Configuração:**
- Baudrate: 9600
- Data bits: 8
- Stop bits: 1
- Parity: None

#### 6. **Diebold**
- TSP100
- IM113
- IM453

**Configuração:**
- Baudrate: 9600
- Data bits: 8
- Stop bits: 1
- Parity: None

---

### Como Conectar a Impressora

#### Passo 1: Conexão Física
1. Conecte a impressora na porta USB
2. Ligue a impressora
3. Coloque papel térmico
4. Aguarde Windows instalar drivers (automático na maioria)

#### Passo 2: No Sistema
1. No PDV, clique no botão **"🖨️ Conecte Imp."** no header
2. Selecione a marca da impressora
3. Clique em **"Conectar Impressora"**
4. Selecione a porta USB
5. Clique em **"Conectar"**

#### Passo 3: Fazer Teste
1. Clique em **"Teste de Impressão"**
2. A impressora deve imprimir:
   ```
   TESTE DE IMPRESSÃO
   
   Fresh Fare POS
   12/02/2026 14:30:00
   ```
3. Se imprimiu: ✅ Configuração OK!

---

### Uso Automático de Impressora

#### Impressão Automática de Cupom
Quando a impressora está conectada, o sistema **automaticamente imprime** cupom não fiscal ao finalizar cada venda!

**Cupom inclui:**
- Nome do estabelecimento
- CNPJ, endereço, telefone
- Data e hora da venda
- Lista de produtos
- Totais e formas de pagamento
- Troco (se aplicável)

#### Abrir Gaveta de Dinheiro
1. Conecte a gaveta na impressora (cabo RJ11/RJ12)
2. No PDV, após conectar impressora
3. Clique em **"💰 Abrir Gaveta"**

---

### Solução de Problemas - Impressora

#### ❌ Impressora não conecta
**Solução:**
- Verifique se está ligada
- Teste em outro programa (Bloco de Notas)
- Reinstale drivers
- Verifique cabo USB

#### ❌ Imprime caracteres estranhos
**Solução:**
- Baudrate incorreto - mude para 9600 ou 115200
- Marca selecionada errada - corrija
- Reset de fábrica na impressora

#### ❌ Não corta o papel
**Solução:**
- Modelo sem guilhotina automática
- Corte manual após impressão
- Alguns modelos precisam configurar modo de corte

#### ❌ Gaveta não abre
**Solução:**
- Verifique se gaveta está conectada na impressora
- Cabo correto (RJ11/RJ12)
- Teste a gaveta diretamente na impressora
- Alguns modelos precisam ativar porta gaveta

---

## 📋 CONFIGURAÇÕES AVANÇADAS

### Dados do Estabelecimento (Para Cupom)

Edite no arquivo `js/app.js` (procure por "dadosEstabelecimento"):

```javascript
const dadosEstabelecimento = {
    nomeEstabelecimento: 'HORTIFRUTI BOM PREÇO',
    cnpj: '12.345.678/0001-90',
    endereco: 'Rua das Flores, 123 - Centro - São Paulo/SP',
    telefone: '(11) 1234-5678',
    site: 'www.hortifrutibp.com.br'
};
```

---

## 🔐 Segurança e Permissões

### Chrome/Edge - Permissões Necessárias

Ao conectar hardware pela primeira vez:
1. Navegador pedirá permissão
2. Clique em **"Permitir"**
3. Selecione a porta correta
4. Permissão é salva para próximas vezes

### Revogar Permissões

Se precisar reconfigurar:
1. Chrome: `chrome://settings/content/serialPorts`
2. Edge: `edge://settings/content/serialPorts`
3. Remova permissões do site
4. Conecte novamente

---

## 🎯 Workflow Recomendado

### Abertura do Caixa (Manhã)
1. Ligar balança
2. Ligar impressora
3. Abrir sistema no Chrome/Edge
4. Conectar balança (botão no PDV)
5. Conectar impressora (botão no PDV)
6. Fazer testes
7. ✅ Pronto para vender!

### Durante o Dia
- Balança em leitura automática
- Sistema imprime cupom automaticamente
- Abrir gaveta quando necessário

### Fechamento do Caixa (Noite)
1. Desconectar impressora
2. Desconectar balança
3. Desligar equipamentos
4. Fechar sistema

---

## 📞 Suporte Técnico - Hardware

### Drivers USB-Serial
Se usar adaptador USB-Serial (CH340, FTDI, etc):
- **Windows**: Baixe do site do fabricante
- **Linux**: Geralmente já incluso
- **macOS**: Pode precisar instalar manualmente

### Cabos Recomendados
- **USB 2.0** (funciona melhor que USB 3.0 para serial)
- Máximo 5 metros de distância
- Evite extensões e hubs USB

### Fabricantes - Contato
- **Toledo**: www.toledo.com.br
- **Filizola**: www.filizola.com.br
- **Bematech**: www.bematech.com.br
- **Elgin**: www.elgin.com.br
- **Daruma**: www.daruma.com.br
- **Epson**: www.epson.com.br

---

## ✅ Checklist de Configuração

### Balança
- [ ] Balança conectada na USB
- [ ] Balança ligada e funcionando
- [ ] Marca selecionada corretamente
- [ ] Conexão estabelecida no sistema
- [ ] Teste de leitura OK
- [ ] Leitura automática ativada

### Impressora
- [ ] Impressora conectada na USB
- [ ] Impressora ligada
- [ ] Papel térmico instalado
- [ ] Marca selecionada corretamente
- [ ] Conexão estabelecida
- [ ] Teste de impressão OK
- [ ] Gaveta conectada (se tiver)
- [ ] Dados do estabelecimento configurados

---

**Versão:** 1.0 - Fevereiro 2026
**Sistema:** Fresh Fare POS - Professional Edition

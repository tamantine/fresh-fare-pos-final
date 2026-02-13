# 🔧 INTEGRAÇÃO DE HARDWARE NO PDV

## Instruções para adicionar funcionalidades de balança e impressora

---

## 📝 ALTERAÇÕES NECESSÁRIAS NO app.js

### 1. Adicionar Estado para Modal de Hardware

No componente **PDV**, adicione após a linha do `mostrarModalPagamento`:

```javascript
const [mostrarModalHardware, setMostrarModalHardware] = useState(false);
```

---

### 2. Modificar o Header do PDV

**SUBSTITUA** o header atual (onde tem os botões 🏠, 📅, etc) por este código:

```javascript
{/* Header Verde */}
<div className="bg-verde-escuro text-white p-4">
    <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
            <span className="text-4xl">🥬</span>
            <div>
                <h1 className="text-2xl font-bold">Hortifruti Bom Preço</h1>
                <p className="text-green-300 text-sm">SISTEMA PDV PROFISSIONAL</p>
            </div>
        </div>
        <div className="flex gap-4 text-sm items-center">
            <span>📅 {new Date().toLocaleString('pt-BR')}</span>
            
            {/* BOTÃO BALANÇA - NOVO */}
            <button
                onClick={() => setMostrarModalHardware(true)}
                className="px-3 py-2 bg-verde-principal hover:bg-verde-escuro rounded transition-all"
                title="Configurar Balança"
            >
                ⚖️ Balança
            </button>
            
            {/* BOTÃO IMPRESSORA - NOVO */}
            <button
                onClick={() => setMostrarModalHardware(true)}
                className="px-3 py-2 bg-verde-principal hover:bg-verde-escuro rounded transition-all"
                title="Configurar Impressora"
            >
                🖨️ Conecte Imp.
            </button>
            
            <span className="badge badge-green">🟢 ONLINE</span>
        </div>
    </div>
</div>
```

---

### 3. Adicionar Modal de Hardware

**ADICIONE** antes do fechamento do componente PDV (antes do último `</div>`):

```javascript
{/* Modal de Configuração de Hardware */}
{mostrarModalHardware && typeof ModalConfigHardware !== 'undefined' && (
    <ModalConfigHardware onClose={() => setMostrarModalHardware(false)} />
)}
```

---

### 4. Integrar Balança no Carrinho

**MODIFIQUE** a função `buscarProduto` para usar peso da balança se estiver conectada:

```javascript
const buscarProduto = async () => {
    if (!codigoBusca.trim()) return;

    try {
        const { data, error } = await supabase
            .from('produtos')
            .select('*')
            .or(`codigo_barras.eq.${codigoBusca},nome.ilike.%${codigoBusca}%`)
            .eq('ativo', true)
            .limit(1)
            .single();

        if (error || !data) {
            showToast('Produto não encontrado!', 'error');
            return;
        }

        setProdutoSelecionado(data);
        
        // NOVO: Se balança conectada e produto é KG, pegar peso automaticamente
        if (window.balancaGlobal?.estaConectado() && data.tipo_venda === 'KG') {
            try {
                const peso = await window.balancaGlobal.lerPeso();
                setQuantidade(peso);
                showToast(`Peso capturado: ${peso.toFixed(3)} kg`, 'success');
            } catch (err) {
                setQuantidade(1);
            }
        } else {
            setQuantidade(1);
        }
        
    } catch (error) {
        showToast('Erro ao buscar produto', 'error');
    }
};
```

---

### 5. Integrar Impressão Automática de Cupom

**MODIFIQUE** a função `finalizarVenda` no componente **ModalPagamento**:

**ADICIONE** após o sucesso da venda (depois de inserir itens):

```javascript
// Impressão automática de cupom (se impressora conectada)
if (window.impressoraGlobal?.estaConectado()) {
    try {
        const dadosCupom = {
            nomeEstabelecimento: 'HORTIFRUTI BOM PREÇO',
            cnpj: '12.345.678/0001-90',
            endereco: 'Rua das Flores, 123 - Centro - São Paulo/SP',
            telefone: '(11) 1234-5678',
            caixaId: 'CAIXA-001',
            operador: 'Sistema',
            itens: carrinho.map(item => ({
                descricao: item.descricao,
                quantidade: item.quantidade,
                tipo: item.tipo_venda.toLowerCase(),
                precoUnitario: item.preco_unitario,
                subtotal: item.subtotal
            })),
            desconto: desconto,
            formaPagamento: formaPagamento,
            valorRecebido: formaPagamento === 'DINHEIRO' ? valorRecebido : totalComDesconto
        };
        
        await window.impressoraGlobal.imprimirCupomNaoFiscal(dadosCupom);
        
        // Abrir gaveta se for dinheiro
        if (formaPagamento === 'DINHEIRO') {
            await window.impressoraGlobal.abrirGaveta();
        }
        
    } catch (errImp) {
        console.error('Erro ao imprimir cupom:', errImp);
        // Não bloqueia a venda se impressora falhar
    }
}

showToast(`Venda finalizada! ${formaPagamento === 'DINHEIRO' ? `Troco: ${formatCurrency(troco)}` : ''}`, 'success');
onSuccess();
```

---

### 6. Adicionar Botão "Ler Peso" no Formulário do PDV

**ADICIONE** após o botão "Adicionar Item":

```javascript
{/* Botão Ler Peso da Balança */}
{window.balancaGlobal?.estaConectado() && (
    <button
        onClick={async () => {
            try {
                const peso = await window.balancaGlobal.lerPeso();
                setQuantidade(peso);
                showToast(`Peso: ${peso.toFixed(3)} kg`, 'success');
            } catch (error) {
                showToast('Erro ao ler peso', 'error');
            }
        }}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
    >
        ⚖️ Ler Peso da Balança
    </button>
)}
```

---

## 🎯 RESULTADO FINAL

Após aplicar todas as modificações, você terá:

### ✅ No Header do PDV
- Botão "⚖️ Balança" → Abre modal de configuração
- Botão "🖨️ Conecte Imp." → Abre modal de configuração

### ✅ Modal de Hardware com 2 Abas
1. **Aba Balança:**
   - Selecionar marca (Toledo, Filizola, etc)
   - Conectar/Desconectar
   - Ler peso único
   - Leitura automática contínua
   - Display de peso em tempo real

2. **Aba Impressora:**
   - Selecionar marca (Bematech, Elgin, etc)
   - Conectar/Desconectar
   - Teste de impressão
   - Abrir gaveta

### ✅ Funcionalidades Automáticas
- Balança captura peso ao buscar produto tipo KG
- Impressora imprime cupom ao finalizar venda
- Gaveta abre automaticamente em vendas com dinheiro
- Botão "Ler Peso" aparece quando balança conectada

---

## 📱 Como Usar Após Configurado

### Workflow Completo:

1. **Conectar Equipamentos:**
   - Clicar em "⚖️ Balança" → Conectar
   - Clicar em "🖨️ Conecte Imp." → Conectar

2. **Realizar Venda com Balança:**
   - Digite código ou nome do produto (ex: tomate)
   - Se produto é KG: peso é capturado automaticamente
   - Ou clique "Ler Peso da Balança"
   - Adicionar ao carrinho

3. **Finalizar Venda:**
   - Clicar "PAGAMENTO (F6)"
   - Escolher forma de pagamento
   - Finalizar
   - ✅ Cupom impresso automaticamente!
   - ✅ Gaveta aberta (se dinheiro)

---

## 🔧 Personalizar Dados do Cupom

No código onde tem `dadosCupom`, edite:

```javascript
nomeEstabelecimento: 'SEU NOME AQUI',
cnpj: 'XX.XXX.XXX/XXXX-XX',
endereco: 'Seu endereço completo',
telefone: '(XX) XXXX-XXXX',
```

---

## 📝 Notas Importantes

1. **Navegador:** Use Chrome ou Edge (obrigatório)
2. **Permissões:** Navegador pedirá permissão na primeira vez
3. **USB:** Conecte equipamentos antes de abrir o sistema
4. **Drivers:** Instale drivers se usar adaptadores USB-Serial

---

## ✅ Checklist de Integração

- [ ] Adicionado estado `mostrarModalHardware`
- [ ] Header modificado com botões de hardware
- [ ] Modal de hardware adicionado
- [ ] Balança integrada na busca de produtos
- [ ] Impressão automática na finalização
- [ ] Botão "Ler Peso" adicionado
- [ ] Dados do estabelecimento personalizados
- [ ] Testado em Chrome/Edge

---

**Pronto! Sistema agora tem integração completa com hardware profissional!** 🚀

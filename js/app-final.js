// ========================================
// FRESH FARE POS - VERSÃO FINAL MELHORADA
// Sistema Completo com Todas as Correções
// ========================================

const { useState, useEffect, useRef } = React;

// ========================================
// CONFIGURAÇÃO SUPABASE
// ========================================
const SUPABASE_URL = 'https://jsyzvcijwtpmtgziwecm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzeXp2Y2lqd3RwbXRneml3ZWNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2NjYwNDYsImV4cCI6MjA4NjI0MjA0Nn0.pFrdmUwP2kU55Bo1oqYG20wKFbnA3DKHU80BShFV3nE';

let supabase;
if (typeof supabase === 'undefined' && window.supabase) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// ========================================
// ESTADO GLOBAL DO CAIXA
// ========================================
let caixaAtualGlobal = null;

// ========================================
// UTILIDADES
// ========================================
const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value || 0);
};

const formatDate = (date) => {
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(date));
};

const showToast = (message, type = 'success') => {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="flex items-center gap-3">
            <span class="text-2xl">
                ${type === 'success' ? '✅' : type === 'error' ? '❌' : '⚠️'}
            </span>
            <span>${message}</span>
        </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
};

// ========================================
// INICIALIZAR HARDWARE
// ========================================
let balancaGlobal = null;
let impressoraGlobal = null;

if (typeof BalancaSerial !== 'undefined') {
    balancaGlobal = new BalancaSerial();
}

if (typeof ImpressoraTermica !== 'undefined') {
    impressoraGlobal = new ImpressoraTermica();
}

// ========================================
// COMPONENTE: MODAL ABRIR CAIXA
// ========================================
const ModalAbrirCaixa = ({ onSuccess, onCancel }) => {
    const [valorInicial, setValorInicial] = useState(0);
    const [responsavel, setResponsavel] = useState('');
    const [carregando, setCarregando] = useState(false);

    const abrirCaixa = async () => {
        if (!responsavel.trim()) {
            showToast('Informe o responsável pelo caixa', 'error');
            return;
        }

        setCarregando(true);
        try {
            const caixaId = `CAIXA-${Date.now()}`;
            
            const { data, error } = await supabase
                .from('caixas')
                .insert([{
                    id: caixaId,
                    data_abertura: new Date().toISOString(),
                    valor_abertura: valorInicial,
                    status: 'ABERTO',
                    responsavel: responsavel
                }])
                .select()
                .single();

            if (error) throw error;

            localStorage.setItem('caixa_atual', JSON.stringify(data));
            caixaAtualGlobal = data;
            
            showToast('Caixa aberto com sucesso!', 'success');
            onSuccess(data);
        } catch (error) {
            console.error('Erro ao abrir caixa:', error);
            showToast('Erro ao abrir caixa', 'error');
        } finally {
            setCarregando(false);
        }
    };

    return (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">🔓 Abrir Caixa</h2>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Responsável *
                        </label>
                        <input
                            type="text"
                            value={responsavel}
                            onChange={(e) => setResponsavel(e.target.value)}
                            placeholder="Nome do operador"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Valor Inicial (R$)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={valorInicial}
                            onChange={(e) => setValorInicial(parseFloat(e.target.value) || 0)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-700">
                            <strong>Data/Hora:</strong> {new Date().toLocaleString('pt-BR')}
                        </p>
                    </div>
                </div>

                <div className="flex gap-4 mt-6">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-6 py-3 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300"
                        disabled={carregando}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={abrirCaixa}
                        disabled={carregando}
                        className="flex-1 btn-primary disabled:opacity-50"
                    >
                        {carregando ? 'Abrindo...' : '✅ Abrir Caixa'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ========================================
// COMPONENTE: MODAL FECHAR CAIXA
// ========================================
const ModalFecharCaixa = ({ caixa, onSuccess, onCancel }) => {
    const [valorFinal, setValorFinal] = useState(0);
    const [vendas, setVendas] = useState([]);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        carregarResumo();
    }, []);

    const carregarResumo = async () => {
        try {
            const { data, error } = await supabase
                .from('vendas')
                .select('*')
                .eq('caixa_id', caixa.id)
                .eq('status', 'FINALIZADA');

            if (error) throw error;

            setVendas(data || []);
            const total = data?.reduce((sum, v) => sum + parseFloat(v.total), 0) || 0;
            setValorFinal(parseFloat(caixa.valor_abertura) + total);
        } catch (error) {
            console.error('Erro ao carregar resumo:', error);
        } finally {
            setCarregando(false);
        }
    };

    const fecharCaixa = async () => {
        try {
            const { error } = await supabase
                .from('caixas')
                .update({
                    data_fechamento: new Date().toISOString(),
                    valor_fechamento: valorFinal,
                    status: 'FECHADO'
                })
                .eq('id', caixa.id);

            if (error) throw error;

            localStorage.removeItem('caixa_atual');
            caixaAtualGlobal = null;
            
            showToast('Caixa fechado com sucesso!', 'success');
            onSuccess();
        } catch (error) {
            console.error('Erro ao fechar caixa:', error);
            showToast('Erro ao fechar caixa', 'error');
        }
    };

    const totalVendas = vendas.reduce((sum, v) => sum + parseFloat(v.total), 0);

    return (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">🔒 Fechar Caixa</h2>
                
                {carregando ? (
                    <div className="text-center py-12">
                        <p>Carregando resumo...</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Informações do Caixa */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">ID do Caixa</p>
                                    <p className="font-bold">{caixa.id}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Responsável</p>
                                    <p className="font-bold">{caixa.responsavel}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Abertura</p>
                                    <p className="font-bold">{formatDate(caixa.data_abertura)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Fechamento</p>
                                    <p className="font-bold">{formatDate(new Date())}</p>
                                </div>
                            </div>
                        </div>

                        {/* Resumo Financeiro */}
                        <div className="bg-verde-claro p-6 rounded-lg">
                            <h3 className="font-bold text-verde-escuro mb-4">Resumo Financeiro</h3>
                            
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-verde-escuro">Valor Inicial:</span>
                                    <span className="font-bold">{formatCurrency(caixa.valor_abertura)}</span>
                                </div>
                                
                                <div className="flex justify-between">
                                    <span className="text-verde-escuro">Total de Vendas ({vendas.length}):</span>
                                    <span className="font-bold">{formatCurrency(totalVendas)}</span>
                                </div>
                                
                                <div className="border-t-2 border-verde-escuro pt-3 flex justify-between">
                                    <span className="text-lg font-bold text-verde-escuro">Valor Final Esperado:</span>
                                    <span className="text-2xl font-bold text-verde-principal">
                                        {formatCurrency(valorFinal)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Valor Contado */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Valor Contado no Caixa (R$)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={valorFinal}
                                onChange={(e) => setValorFinal(parseFloat(e.target.value) || 0)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-xl font-bold"
                            />
                            
                            {Math.abs(valorFinal - (parseFloat(caixa.valor_abertura) + totalVendas)) > 0.01 && (
                                <p className="mt-2 text-sm text-red-600">
                                    ⚠️ Diferença: {formatCurrency(valorFinal - (parseFloat(caixa.valor_abertura) + totalVendas))}
                                </p>
                            )}
                        </div>

                        {/* Vendas por Forma de Pagamento */}
                        <div>
                            <h4 className="font-bold text-gray-800 mb-3">Vendas por Forma de Pagamento</h4>
                            <div className="space-y-2">
                                {['DINHEIRO', 'CREDITO', 'DEBITO', 'PIX'].map(forma => {
                                    const vendasForma = vendas.filter(v => v.forma_pagamento === forma);
                                    const totalForma = vendasForma.reduce((sum, v) => sum + parseFloat(v.total), 0);
                                    
                                    if (vendasForma.length === 0) return null;
                                    
                                    return (
                                        <div key={forma} className="flex justify-between p-2 bg-gray-50 rounded">
                                            <span>{forma} ({vendasForma.length} vendas)</span>
                                            <span className="font-bold">{formatCurrency(totalForma)}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex gap-4 mt-6">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-6 py-3 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={fecharCaixa}
                        disabled={carregando}
                        className="flex-1 btn-danger disabled:opacity-50"
                    >
                        🔒 Fechar Caixa
                    </button>
                </div>
            </div>
        </div>
    );
};

// ========================================
// COMPONENTE: MODAL PAGAMENTO COM MÚLTIPLAS FORMAS
// ========================================
const ModalPagamentoMultiplo = ({ total, carrinho, onClose, onSuccess }) => {
    const [pagamentos, setPagamentos] = useState([]);
    const [formaSelecionada, setFormaSelecionada] = useState('');
    const [valorPagamento, setValorPagamento] = useState(0);
    const [desconto, setDesconto] = useState(0);
    const [valorRecebido, setValorRecebido] = useState(0);

    const totalComDesconto = total - desconto;
    const totalPago = pagamentos.reduce((sum, p) => sum + p.valor, 0);
    const restante = totalComDesconto - totalPago;
    const troco = pagamentos.some(p => p.forma === 'DINHEIRO') ? valorRecebido - totalComDesconto : 0;

    const adicionarPagamento = () => {
        if (!formaSelecionada) {
            showToast('Selecione uma forma de pagamento', 'error');
            return;
        }

        const valor = valorPagamento > 0 ? valorPagamento : restante;
        
        if (valor <= 0) {
            showToast('Valor deve ser maior que zero', 'error');
            return;
        }

        if (totalPago + valor > totalComDesconto) {
            showToast('Valor ultrapassa o total a pagar', 'error');
            return;
        }

        setPagamentos([...pagamentos, {
            forma: formaSelecionada,
            valor: valor
        }]);

        setFormaSelecionada('');
        setValorPagamento(0);
        showToast('Pagamento adicionado', 'success');
    };

    const removerPagamento = (index) => {
        setPagamentos(pagamentos.filter((_, i) => i !== index));
    };

    const finalizarVenda = async () => {
        if (restante > 0.01) {
            showToast('Ainda faltam ' + formatCurrency(restante) + ' para completar o pagamento', 'error');
            return;
        }

        if (!caixaAtualGlobal) {
            showToast('Nenhum caixa aberto!', 'error');
            return;
        }

        try {
            // Inserir venda
            const { data: venda, error: erroVenda } = await supabase
                .from('vendas')
                .insert([{
                    caixa_id: caixaAtualGlobal.id,
                    subtotal: total,
                    descontos: desconto,
                    total: totalComDesconto,
                    forma_pagamento: pagamentos.map(p => `${p.forma}:${p.valor.toFixed(2)}`).join(';'),
                    status: 'FINALIZADA',
                    observacoes: pagamentos.length > 1 ? 'Pagamento múltiplo' : null
                }])
                .select()
                .single();

            if (erroVenda) throw erroVenda;

            // Inserir itens
            const itensVenda = carrinho.map(item => ({
                venda_id: venda.id,
                produto_id: item.produto_id,
                descricao_produto: item.descricao,
                quantidade: item.quantidade,
                preco_unitario: item.preco_unitario,
                subtotal: item.subtotal,
                tipo_venda: item.tipo_venda
            }));

            const { error: erroItens } = await supabase
                .from('itens_venda')
                .insert(itensVenda);

            if (erroItens) throw erroItens;

            // Imprimir cupom se impressora conectada
            if (impressoraGlobal?.estaConectado()) {
                try {
                    await impressoraGlobal.imprimirCupomNaoFiscal({
                        nomeEstabelecimento: 'HORTIFRUTI BOM PREÇO',
                        cnpj: '12.345.678/0001-90',
                        endereco: 'Rua das Flores, 123 - Centro',
                        telefone: '(11) 1234-5678',
                        caixaId: caixaAtualGlobal.id,
                        operador: caixaAtualGlobal.responsavel,
                        itens: carrinho.map(item => ({
                            descricao: item.descricao,
                            quantidade: item.quantidade,
                            tipo: item.tipo_venda.toLowerCase(),
                            precoUnitario: item.preco_unitario,
                            subtotal: item.subtotal
                        })),
                        desconto: desconto,
                        formaPagamento: pagamentos.length === 1 ? pagamentos[0].forma : 'MÚLTIPLO',
                        valorRecebido: pagamentos.some(p => p.forma === 'DINHEIRO') ? valorRecebido : totalComDesconto
                    });

                    if (pagamentos.some(p => p.forma === 'DINHEIRO')) {
                        await impressoraGlobal.abrirGaveta();
                    }
                } catch (errImp) {
                    console.error('Erro ao imprimir:', errImp);
                }
            }

            showToast(`Venda finalizada! ${troco > 0 ? 'Troco: ' + formatCurrency(troco) : ''}`, 'success');
            onSuccess();
        } catch (error) {
            console.error('Erro ao finalizar venda:', error);
            showToast('Erro ao finalizar venda', 'error');
        }
    };

    return (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">💳 Finalizar Pagamento</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Coluna Esquerda - Resumo */}
                    <div className="space-y-6">
                        {/* Resumo da Venda */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex justify-between mb-2">
                                <span>Subtotal:</span>
                                <span className="font-semibold">{formatCurrency(total)}</span>
                            </div>
                            <div className="flex justify-between mb-2 items-center">
                                <span>Desconto:</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={desconto}
                                    onChange={(e) => setDesconto(parseFloat(e.target.value) || 0)}
                                    className="w-32 px-2 py-1 border rounded text-right"
                                />
                            </div>
                            <div className="border-t pt-2 flex justify-between">
                                <span className="text-lg font-bold">Total a Pagar:</span>
                                <span className="text-2xl font-bold text-verde-principal">
                                    {formatCurrency(totalComDesconto)}
                                </span>
                            </div>
                        </div>

                        {/* Pagamentos Adicionados */}
                        <div>
                            <h3 className="font-bold mb-3">Pagamentos Adicionados</h3>
                            {pagamentos.length === 0 ? (
                                <p className="text-gray-500 text-sm text-center py-4">
                                    Nenhum pagamento adicionado
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {pagamentos.map((pag, index) => (
                                        <div key={index} className="flex items-center justify-between bg-verde-claro p-3 rounded">
                                            <div>
                                                <span className="font-bold text-verde-escuro">{pag.forma}</span>
                                                <span className="text-sm text-verde-escuro ml-2">
                                                    {formatCurrency(pag.valor)}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => removerPagamento(index)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Total Pago e Restante */}
                            <div className="mt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Total Pago:</span>
                                    <span className="font-bold">{formatCurrency(totalPago)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-bold">Restante:</span>
                                    <span className={`text-xl font-bold ${restante > 0 ? 'text-red-600' : 'text-verde-principal'}`}>
                                        {formatCurrency(Math.max(0, restante))}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Coluna Direita - Adicionar Pagamento */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                Adicionar Forma de Pagamento
                            </label>
                            
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                {['DINHEIRO', 'CREDITO', 'DEBITO', 'PIX'].map(forma => (
                                    <button
                                        key={forma}
                                        onClick={() => setFormaSelecionada(forma)}
                                        className={`p-4 rounded-lg border-2 transition-all ${
                                            formaSelecionada === forma
                                                ? 'border-verde-principal bg-verde-claro'
                                                : 'border-gray-200 hover:border-verde-principal'
                                        }`}
                                    >
                                        <div className="text-2xl mb-2">
                                            {forma === 'DINHEIRO' ? '💵' : forma === 'PIX' ? '📱' : '💳'}
                                        </div>
                                        <div className="text-sm font-semibold">{forma}</div>
                                    </button>
                                ))}
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Valor (deixe vazio para usar o restante)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={valorPagamento}
                                    onChange={(e) => setValorPagamento(parseFloat(e.target.value) || 0)}
                                    placeholder={formatCurrency(restante)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-xl font-bold"
                                />
                            </div>

                            <button
                                onClick={adicionarPagamento}
                                disabled={!formaSelecionada || restante <= 0}
                                className="w-full btn-primary disabled:opacity-50"
                            >
                                ➕ Adicionar Pagamento
                            </button>
                        </div>

                        {/* Valor Recebido (Dinheiro) */}
                        {pagamentos.some(p => p.forma === 'DINHEIRO') && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Valor Recebido (Dinheiro)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={valorRecebido}
                                    onChange={(e) => setValorRecebido(parseFloat(e.target.value) || 0)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-xl font-bold"
                                />
                                {troco > 0 && (
                                    <div className="mt-2 text-lg">
                                        <span className="text-gray-600">Troco: </span>
                                        <span className="font-bold text-verde-principal">{formatCurrency(troco)}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Botões Finais */}
                <div className="flex gap-4 mt-6">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-3 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={finalizarVenda}
                        disabled={restante > 0.01}
                        className="flex-1 btn-primary disabled:opacity-50"
                    >
                        ✅ Finalizar Venda
                    </button>
                </div>
            </div>
        </div>
    );
};

// CONTINUA...

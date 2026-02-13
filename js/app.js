// Fresh Fare POS - Aplicação Principal
// React via CDN - Sem build necessário

const { useState, useEffect, useRef } = React;

// ========================================
// CONFIGURAÇÃO SUPABASE
// ========================================
// IMPORTANTE: Substitua com suas credenciais do Supabase
const SUPABASE_URL = 'https://jsyzvcijwtpmtgziwecm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzeXp2Y2lqd3RwbXRneml3ZWNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2NjYwNDYsImV4cCI6MjA4NjI0MjA0Nn0.pFrdmUwP2kU55Bo1oqYG20wKFbnA3DKHU80BShFV3nE';

let supabase;
if (typeof supabase === 'undefined' && window.supabase) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

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
// COMPONENTE: SIDEBAR
// ========================================
const Sidebar = ({ currentPage, setCurrentPage }) => {
    const menuItems = [
        { id: 'dashboard', icon: '📊', label: 'Painel' },
        { id: 'pdv', icon: '🛒', label: 'PDV (Caixa)' },
        { id: 'estoque', icon: '📦', label: 'Estoque' },
        { id: 'precificacao', icon: '💰', label: 'Precificação' },
    ];

    return (
        <div className="w-64 bg-verde-escuro h-screen fixed left-0 top-0 text-white flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-green-700">
                <div className="flex items-center gap-3">
                    <span className="text-4xl">🥬</span>
                    <div>
                        <h1 className="text-xl font-bold">Hortifruti BP</h1>
                        <p className="text-sm text-green-300">Diretor do Cardápio</p>
                    </div>
                </div>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 py-6">
                {menuItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setCurrentPage(item.id)}
                        className={`w-full px-6 py-4 flex items-center gap-4 transition-all ${
                            currentPage === item.id 
                                ? 'bg-verde-principal text-white' 
                                : 'text-green-100 hover:bg-green-800'
                        }`}
                    >
                        <span className="text-2xl">{item.icon}</span>
                        <span className="font-medium">{item.label}</span>
                    </button>
                ))}
            </nav>

            {/* Botão Sair */}
            <div className="p-6 border-t border-green-700">
                <button className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all">
                    <span>🚪</span>
                    <span>Sair</span>
                </button>
            </div>
        </div>
    );
};

// ========================================
// COMPONENTE: DASHBOARD
// ========================================
const Dashboard = () => {
    const [metrics, setMetrics] = useState({
        faturamentoDia: 0,
        vendasRealizadas: 0,
        ticketMedio: 0,
        itensVendidos: 0
    });
    const [ultimasVendas, setUltimasVendas] = useState([]);

    useEffect(() => {
        carregarDados();
    }, []);

    const carregarDados = async () => {
        try {
            // Buscar vendas do dia
            const hoje = new Date().toISOString().split('T')[0];
            const { data: vendas, error } = await supabase
                .from('vendas')
                .select('*, itens_venda(*)')
                .gte('data_venda', hoje)
                .eq('status', 'FINALIZADA')
                .order('data_venda', { ascending: false });

            if (error) throw error;

            // Calcular métricas
            const faturamento = vendas?.reduce((sum, v) => sum + parseFloat(v.total || 0), 0) || 0;
            const quantidade = vendas?.length || 0;
            const ticket = quantidade > 0 ? faturamento / quantidade : 0;
            
            let totalItens = 0;
            vendas?.forEach(venda => {
                totalItens += venda.itens_venda?.length || 0;
            });

            setMetrics({
                faturamentoDia: faturamento,
                vendasRealizadas: quantidade,
                ticketMedio: ticket,
                itensVendidos: totalItens
            });

            setUltimasVendas(vendas?.slice(0, 10) || []);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            showToast('Erro ao carregar dados do dashboard', 'error');
        }
    };

    return (
        <div className="p-8 animate-fade-in">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Dashboard de Gestão</h1>
                <p className="text-gray-600 mt-2">Visão geral do dia {new Date().toLocaleDateString('pt-BR')}</p>
            </div>

            {/* Cards de Métricas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="card bg-verde-escuro text-white hover-lift">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-green-200 text-sm mb-2">Faturamento Hoje</p>
                            <h3 className="text-3xl font-bold">{formatCurrency(metrics.faturamentoDia)}</h3>
                            <p className="text-green-300 text-sm mt-2">+0% em relação a ontem</p>
                        </div>
                        <span className="text-4xl">💵</span>
                    </div>
                </div>

                <div className="card bg-verde-escuro text-white hover-lift">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-green-200 text-sm mb-2">Vendas Realizadas</p>
                            <h3 className="text-3xl font-bold">{metrics.vendasRealizadas}</h3>
                        </div>
                        <span className="text-4xl">📈</span>
                    </div>
                </div>

                <div className="card bg-verde-escuro text-white hover-lift">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-green-200 text-sm mb-2">Ticket Médio</p>
                            <h3 className="text-3xl font-bold">{formatCurrency(metrics.ticketMedio)}</h3>
                        </div>
                        <span className="text-4xl">🧾</span>
                    </div>
                </div>

                <div className="card bg-verde-escuro text-white hover-lift">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-green-200 text-sm mb-2">Itens Vendidos</p>
                            <h3 className="text-3xl font-bold">{metrics.itensVendidos}</h3>
                        </div>
                        <span className="text-4xl">🛍️</span>
                    </div>
                </div>
            </div>

            {/* Últimas Vendas */}
            <div className="card">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Últimas Vendas</h2>
                <div className="overflow-x-auto">
                    <table className="w-full table-zebra">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4 text-gray-600 font-semibold">ID</th>
                                <th className="text-left py-3 px-4 text-gray-600 font-semibold">HORA</th>
                                <th className="text-left py-3 px-4 text-gray-600 font-semibold">PAGAMENTO</th>
                                <th className="text-right py-3 px-4 text-gray-600 font-semibold">VALOR</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ultimasVendas.length > 0 ? (
                                ultimasVendas.map(venda => (
                                    <tr key={venda.id}>
                                        <td className="py-3 px-4">#{venda.id}</td>
                                        <td className="py-3 px-4">{new Date(venda.data_venda).toLocaleTimeString('pt-BR')}</td>
                                        <td className="py-3 px-4">
                                            <span className="badge badge-green">{venda.forma_pagamento}</span>
                                        </td>
                                        <td className="py-3 px-4 text-right font-semibold text-verde-principal">
                                            {formatCurrency(venda.total)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="py-8 text-center text-gray-500">
                                        Nenhuma venda realizada hoje
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// ========================================
// COMPONENTE: PDV (Ponto de Venda)
// ========================================
const PDV = () => {
    const [carrinho, setCarrinho] = useState([]);
    const [codigoBusca, setCodigoBusca] = useState('');
    const [quantidade, setQuantidade] = useState(1);
    const [produtoSelecionado, setProdutoSelecionado] = useState(null);
    const [mostrarModalPagamento, setMostrarModalPagamento] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        // Foco automático no input
        if (inputRef.current) {
            inputRef.current.focus();
        }

        // Atalhos de teclado
        const handleKeyPress = (e) => {
            if (e.key === 'F6') {
                e.preventDefault();
                if (carrinho.length > 0) setMostrarModalPagamento(true);
            }
            if (e.key === 'F4' || e.key === 'Escape') {
                e.preventDefault();
                limparCarrinho();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [carrinho]);

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
            setQuantidade(1);
        } catch (error) {
            showToast('Erro ao buscar produto', 'error');
        }
    };

    const adicionarAoCarrinho = () => {
        if (!produtoSelecionado || quantidade <= 0) return;

        const novoItem = {
            id: Date.now(),
            produto_id: produtoSelecionado.id,
            descricao: produtoSelecionado.nome,
            quantidade: parseFloat(quantidade),
            tipo_venda: produtoSelecionado.tipo_venda,
            preco_unitario: parseFloat(produtoSelecionado.preco_venda),
            subtotal: parseFloat(quantidade) * parseFloat(produtoSelecionado.preco_venda)
        };

        setCarrinho([...carrinho, novoItem]);
        setCodigoBusca('');
        setQuantidade(1);
        setProdutoSelecionado(null);
        inputRef.current?.focus();
        showToast('Produto adicionado!', 'success');
    };

    const removerDoCarrinho = (id) => {
        setCarrinho(carrinho.filter(item => item.id !== id));
        showToast('Item removido', 'warning');
    };

    const limparCarrinho = () => {
        if (carrinho.length === 0) return;
        if (confirm('Deseja cancelar a venda e limpar o carrinho?')) {
            setCarrinho([]);
            setCodigoBusca('');
            setQuantidade(1);
            setProdutoSelecionado(null);
            showToast('Carrinho limpo', 'warning');
        }
    };

    const calcularTotal = () => {
        return carrinho.reduce((sum, item) => sum + item.subtotal, 0);
    };

    return (
        <div className="min-h-screen bg-gray-50">
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
                    <div className="flex gap-4 text-sm">
                        <span>📅 {new Date().toLocaleString('pt-BR')}</span>
                        <span className="badge badge-green">🟢 ONLINE</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 p-6">
                {/* Coluna Esquerda - Entrada */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Caixa Status */}
                    <div className="card bg-verde-escuro text-white">
                        <h3 className="text-lg font-bold">🔓 CAIXA ABERTO</h3>
                        <p className="text-green-300 text-sm">ID: CAIXA-001</p>
                    </div>

                    {/* Formulário */}
                    <div className="card">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    CÓDIGO DE BARRAS / NOME (F1)
                                </label>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={codigoBusca}
                                    onChange={(e) => setCodigoBusca(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && buscarProduto()}
                                    placeholder="Digite ou escaneie o código"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-verde-principal"
                                />
                            </div>

                            {produtoSelecionado && (
                                <>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            VALOR UNITÁRIO
                                        </label>
                                        <div className="px-4 py-3 bg-gray-100 rounded-lg text-2xl font-bold text-verde-principal">
                                            {formatCurrency(produtoSelecionado.preco_venda)}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            QTD / PESO
                                        </label>
                                        <input
                                            type="number"
                                            step="0.001"
                                            value={quantidade}
                                            onChange={(e) => setQuantidade(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-verde-principal"
                                        />
                                    </div>
                                </>
                            )}

                            <div className="bg-verde-claro p-4 rounded-lg">
                                <p className="text-sm text-verde-escuro font-semibold mb-1">TOTAL DE ITENS A FAZER</p>
                                <p className="text-3xl font-bold text-verde-escuro">
                                    {formatCurrency(calcularTotal())}
                                </p>
                            </div>

                            <button
                                onClick={adicionarAoCarrinho}
                                disabled={!produtoSelecionado}
                                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                ➕ Adicionar Item
                            </button>
                        </div>
                    </div>
                </div>

                {/* Coluna Direita - Carrinho */}
                <div className="lg:col-span-3">
                    <div className="card h-full">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Produtos no Carrinho</h2>
                        
                        {carrinho.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                <span className="text-6xl mb-4">🛒</span>
                                <p className="text-lg">Carrinho Vazio</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="text-left py-2 px-2 text-sm">#</th>
                                            <th className="text-left py-2 px-2 text-sm">DESCRIÇÃO</th>
                                            <th className="text-center py-2 px-2 text-sm">QTD/PESO</th>
                                            <th className="text-center py-2 px-2 text-sm">UNIDADE</th>
                                            <th className="text-right py-2 px-2 text-sm">VL. TOTAL</th>
                                            <th className="text-center py-2 px-2 text-sm">AÇÃO</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {carrinho.map((item, index) => (
                                            <tr key={item.id} className="border-b border-gray-100 hover:bg-verde-claro">
                                                <td className="py-3 px-2">{index + 1}</td>
                                                <td className="py-3 px-2 font-medium">{item.descricao}</td>
                                                <td className="py-3 px-2 text-center">{item.quantidade}</td>
                                                <td className="py-3 px-2 text-center">
                                                    <span className="badge badge-green">{item.tipo_venda}</span>
                                                </td>
                                                <td className="py-3 px-2 text-right font-bold text-verde-principal">
                                                    {formatCurrency(item.subtotal)}
                                                </td>
                                                <td className="py-3 px-2 text-center">
                                                    <button
                                                        onClick={() => removerDoCarrinho(item.id)}
                                                        className="text-red-600 hover:text-red-800 text-xl"
                                                    >
                                                        🗑️
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Rodapé - Totais e Ações */}
            <div className="fixed bottom-0 left-64 right-0 bg-white border-t border-gray-200 p-4">
                <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-gray-800">
                        TOTAL A PAGAR: <span className="text-verde-principal">{formatCurrency(calcularTotal())}</span>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={limparCarrinho}
                            className="btn-danger"
                        >
                            🗑️ Cancelar Venda
                        </button>
                        <button
                            onClick={() => carrinho.length > 0 && setMostrarModalPagamento(true)}
                            disabled={carrinho.length === 0}
                            className="btn-warning disabled:opacity-50"
                        >
                            💳 PAGAMENTO (F6)
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal Pagamento */}
            {mostrarModalPagamento && (
                <ModalPagamento
                    total={calcularTotal()}
                    carrinho={carrinho}
                    onClose={() => setMostrarModalPagamento(false)}
                    onSuccess={() => {
                        setCarrinho([]);
                        setMostrarModalPagamento(false);
                    }}
                />
            )}
        </div>
    );
};

// ========================================
// COMPONENTE: MODAL PAGAMENTO
// ========================================
const ModalPagamento = ({ total, carrinho, onClose, onSuccess }) => {
    const [formaPagamento, setFormaPagamento] = useState('');
    const [valorRecebido, setValorRecebido] = useState(total);
    const [desconto, setDesconto] = useState(0);
    
    const totalComDesconto = total - desconto;
    const troco = formaPagamento === 'DINHEIRO' ? valorRecebido - totalComDesconto : 0;

    const finalizarVenda = async () => {
        if (!formaPagamento) {
            showToast('Selecione uma forma de pagamento!', 'error');
            return;
        }

        try {
            // Inserir venda
            const { data: venda, error: erroVenda } = await supabase
                .from('vendas')
                .insert([{
                    caixa_id: 'CAIXA-001',
                    subtotal: total,
                    descontos: desconto,
                    total: totalComDesconto,
                    forma_pagamento: formaPagamento,
                    status: 'FINALIZADA'
                }])
                .select()
                .single();

            if (erroVenda) throw erroVenda;

            // Inserir itens da venda
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

            showToast(`Venda finalizada! ${formaPagamento === 'DINHEIRO' ? `Troco: ${formatCurrency(troco)}` : ''}`, 'success');
            onSuccess();
        } catch (error) {
            console.error('Erro ao finalizar venda:', error);
            showToast('Erro ao finalizar venda. Verifique sua conexão.', 'error');
        }
    };

    return (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Finalizar Pagamento</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
                </div>

                {/* Resumo */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <div className="flex justify-between mb-2">
                        <span>Subtotal:</span>
                        <span className="font-semibold">{formatCurrency(total)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                        <span>Desconto:</span>
                        <input
                            type="number"
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

                {/* Formas de Pagamento */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Forma de Pagamento</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {['DINHEIRO', 'CREDITO', 'DEBITO', 'PIX'].map(forma => (
                            <button
                                key={forma}
                                onClick={() => setFormaPagamento(forma)}
                                className={`p-4 rounded-lg border-2 transition-all ${
                                    formaPagamento === forma
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
                </div>

                {/* Valor Recebido (só para dinheiro) */}
                {formaPagamento === 'DINHEIRO' && (
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Valor Recebido</label>
                        <input
                            type="number"
                            step="0.01"
                            value={valorRecebido}
                            onChange={(e) => setValorRecebido(parseFloat(e.target.value) || 0)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-xl font-bold"
                        />
                        {troco >= 0 && (
                            <div className="mt-2 text-lg">
                                <span className="text-gray-600">Troco: </span>
                                <span className="font-bold text-verde-principal">{formatCurrency(troco)}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Botões */}
                <div className="flex gap-4">
                    <button onClick={onClose} className="flex-1 px-6 py-3 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300">
                        Cancelar
                    </button>
                    <button onClick={finalizarVenda} className="flex-1 btn-primary">
                        ✅ Finalizar Venda
                    </button>
                </div>
            </div>
        </div>
    );
};

// ========================================
// COMPONENTE: ESTOQUE
// ========================================
const Estoque = () => {
    const [produtos, setProdutos] = useState([]);
    const [busca, setBusca] = useState('');
    const [mostrarModal, setMostrarModal] = useState(false);

    useEffect(() => {
        carregarProdutos();
    }, []);

    const carregarProdutos = async () => {
        try {
            const { data, error } = await supabase
                .from('produtos')
                .select('*')
                .order('nome');

            if (error) throw error;
            setProdutos(data || []);
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
            showToast('Erro ao carregar produtos', 'error');
        }
    };

    const produtosFiltrados = produtos.filter(p =>
        p.nome.toLowerCase().includes(busca.toLowerCase()) ||
        (p.codigo_barras && p.codigo_barras.includes(busca))
    );

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Gestão de Estoque</h1>
                <p className="text-gray-600 mt-2">Controle seus produtos e preços</p>
            </div>

            {/* Barra de Ações */}
            <div className="flex items-center gap-4 mb-6">
                <div className="flex-1">
                    <input
                        type="text"
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        placeholder="🔍 Buscar por nome ou código de barras..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    />
                </div>
                <button onClick={() => setMostrarModal(true)} className="btn-primary">
                    ➕ Novo Produto
                </button>
            </div>

            {/* Tabela de Produtos */}
            <div className="card">
                <div className="overflow-x-auto">
                    <table className="w-full table-zebra">
                        <thead>
                            <tr className="border-b-2 border-gray-200">
                                <th className="text-left py-3 px-4 text-gray-700 font-semibold">PRODUTO</th>
                                <th className="text-left py-3 px-4 text-gray-700 font-semibold">CATEGORIA</th>
                                <th className="text-center py-3 px-4 text-gray-700 font-semibold">TIPO</th>
                                <th className="text-right py-3 px-4 text-gray-700 font-semibold">PREÇO</th>
                                <th className="text-center py-3 px-4 text-gray-700 font-semibold">ESTOQUE</th>
                            </tr>
                        </thead>
                        <tbody>
                            {produtosFiltrados.length > 0 ? (
                                produtosFiltrados.map(produto => (
                                    <tr key={produto.id}>
                                        <td className="py-3 px-4">
                                            <div>
                                                <div className="font-semibold text-gray-800">{produto.nome}</div>
                                                <div className="text-sm text-gray-500">ID: {produto.id}</div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="badge badge-green">{produto.categoria}</span>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <span className="badge badge-yellow">{produto.tipo_venda}</span>
                                        </td>
                                        <td className="py-3 px-4 text-right font-bold text-verde-principal">
                                            {formatCurrency(produto.preco_venda)}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <span className={`font-semibold ${
                                                produto.estoque_atual <= produto.estoque_minimo
                                                    ? 'text-red-600'
                                                    : 'text-verde-principal'
                                            }`}>
                                                {produto.estoque_atual}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="py-8 text-center text-gray-500">
                                        Nenhum produto encontrado
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {mostrarModal && (
                <ModalProduto
                    onClose={() => setMostrarModal(false)}
                    onSuccess={() => {
                        setMostrarModal(false);
                        carregarProdutos();
                    }}
                />
            )}
        </div>
    );
};

// ========================================
// COMPONENTE: MODAL PRODUTO
// ========================================
const ModalProduto = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        nome: '',
        codigo_barras: '',
        categoria: '',
        tipo_venda: 'UN',
        preco_venda: 0,
        custo_nota: 0,
        quebra_perda: 0,
        margem_lucro: 0,
        estoque_atual: 0,
        estoque_minimo: 5
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.nome || !formData.categoria || formData.preco_venda <= 0) {
            showToast('Preencha todos os campos obrigatórios!', 'error');
            return;
        }

        try {
            const { error } = await supabase
                .from('produtos')
                .insert([formData]);

            if (error) throw error;

            showToast('Produto cadastrado com sucesso!', 'success');
            onSuccess();
        } catch (error) {
            console.error('Erro ao cadastrar produto:', error);
            showToast('Erro ao cadastrar produto', 'error');
        }
    };

    return (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Novo Produto</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Coluna 1 */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Nome do Produto *</label>
                                <input
                                    type="text"
                                    value={formData.nome}
                                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Código de Barras</label>
                                <input
                                    type="text"
                                    value={formData.codigo_barras}
                                    onChange={(e) => setFormData({...formData, codigo_barras: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Categoria *</label>
                                <input
                                    type="text"
                                    value={formData.categoria}
                                    onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                                    placeholder="Ex: Frutas, Verduras, Legumes"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Venda *</label>
                                <select
                                    value={formData.tipo_venda}
                                    onChange={(e) => setFormData({...formData, tipo_venda: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                >
                                    <option value="KG">Quilograma (KG)</option>
                                    <option value="UN">Unidade (UN)</option>
                                    <option value="CX">Caixa (CX)</option>
                                    <option value="LT">Litro (LT)</option>
                                </select>
                            </div>
                        </div>

                        {/* Coluna 2 */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Custo na Nota (R$)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.custo_nota}
                                    onChange={(e) => setFormData({...formData, custo_nota: parseFloat(e.target.value) || 0})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Quebra/Perda (%)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.quebra_perda}
                                    onChange={(e) => setFormData({...formData, quebra_perda: parseFloat(e.target.value) || 0})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Margem de Lucro (%)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.margem_lucro}
                                    onChange={(e) => setFormData({...formData, margem_lucro: parseFloat(e.target.value) || 0})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Preço de Venda (R$) *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.preco_venda}
                                    onChange={(e) => setFormData({...formData, preco_venda: parseFloat(e.target.value) || 0})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Estoque Atual</label>
                                    <input
                                        type="number"
                                        value={formData.estoque_atual}
                                        onChange={(e) => setFormData({...formData, estoque_atual: parseInt(e.target.value) || 0})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Estoque Mínimo</label>
                                    <input
                                        type="number"
                                        value={formData.estoque_minimo}
                                        onChange={(e) => setFormData({...formData, estoque_minimo: parseInt(e.target.value) || 0})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 mt-6">
                        <button type="button" onClick={onClose} className="flex-1 px-6 py-3 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300">
                            Cancelar
                        </button>
                        <button type="submit" className="flex-1 btn-primary">
                            💾 Salvar Produto
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ========================================
// COMPONENTE: PRECIFICAÇÃO
// ========================================
const Precificacao = () => {
    const [dados, setDados] = useState({
        nome: '',
        custoNota: 0,
        quebra: 15,
        margem: 50,
        tipoVenda: 'UN',
        compraCaixaFechada: false,
        qtdPorCaixa: 1
    });

    const calcularPreco = () => {
        const custoReal = dados.custoNota + (dados.custoNota * dados.quebra / 100);
        const lucro = custoReal * (dados.margem / 100);
        const precoFinal = custoReal + lucro;
        
        return {
            custoNota: dados.custoNota,
            custoReal,
            lucro,
            precoFinal
        };
    };

    const resultado = calcularPreco();

    return (
        <div className="p-8">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <span className="text-4xl">🧮</span>
                    <h1 className="text-3xl font-bold text-gray-800">Precificação Profissional</h1>
                </div>
                <p className="text-gray-600">Calcule o preço ideal considerando custos, perdas e lucro.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Coluna Esquerda - Entrada */}
                <div className="card bg-verde-escuro text-white">
                    <h2 className="text-xl font-bold mb-6">📦 Dados de Entrada</h2>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-green-200 mb-2">Nome do Produto</label>
                            <input
                                type="text"
                                value={dados.nome}
                                onChange={(e) => setDados({...dados, nome: e.target.value})}
                                placeholder="Ex: Tomate Italiano..."
                                className="w-full px-4 py-2 bg-white text-gray-800 rounded-lg border-0"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-green-200 mb-2">Custo na Nota (R$)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={dados.custoNota}
                                onChange={(e) => setDados({...dados, custoNota: parseFloat(e.target.value) || 0})}
                                className="w-full px-4 py-2 bg-white text-gray-800 rounded-lg border-0"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-green-200 mb-2">⚠️ Quebra/Perda (%)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={dados.quebra}
                                onChange={(e) => setDados({...dados, quebra: parseFloat(e.target.value) || 0})}
                                className="w-full px-4 py-2 bg-white text-gray-800 rounded-lg border-0"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-green-200 mb-2">Margem de Lucro Desejada (%)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={dados.margem}
                                onChange={(e) => setDados({...dados, margem: parseFloat(e.target.value) || 0})}
                                className="w-full px-4 py-2 bg-white text-gray-800 rounded-lg border-0"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-green-200 mb-2">Tipo de Venda</label>
                            <select
                                value={dados.tipoVenda}
                                onChange={(e) => setDados({...dados, tipoVenda: e.target.value})}
                                className="w-full px-4 py-2 bg-white text-gray-800 rounded-lg border-0"
                            >
                                <option value="UN">Unidade (un)</option>
                                <option value="KG">Quilograma (kg)</option>
                                <option value="CX">Caixa (cx)</option>
                                <option value="LT">Litro (lt)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Coluna Direita - Resultado */}
                <div className="card bg-verde-claro">
                    <h2 className="text-xl font-bold text-verde-escuro mb-6">📊 Composição do Preço</h2>
                    
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-700">Custo Unitário (Nota):</span>
                            <span className="text-2xl font-bold text-gray-600">
                                {formatCurrency(resultado.custoNota)}
                            </span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-gray-700">⚠️ Custo Real (+{dados.quebra}% Quebra):</span>
                            <span className="text-2xl font-bold text-orange-600">
                                {formatCurrency(resultado.custoReal)}
                            </span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-gray-700">Lucro Aplicado (+{dados.margem}%):</span>
                            <span className="text-2xl font-bold text-verde-principal">
                                + {formatCurrency(resultado.lucro)}
                            </span>
                        </div>

                        <div className="border-t-2 border-dashed border-verde-escuro pt-6">
                            <div className="text-center">
                                <p className="text-sm text-verde-escuro font-semibold mb-2">PREÇO DE VENDA SUGERIDO</p>
                                <p className="text-5xl font-bold text-verde-escuro">
                                    {formatCurrency(resultado.precoFinal)}
                                </p>
                                <p className="text-gray-600 mt-2">/{dados.tipoVenda.toLowerCase()}</p>
                            </div>
                        </div>

                        <button className="w-full btn-primary mt-6">
                            💾 Salvar Produto
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ========================================
// COMPONENTE PRINCIPAL (APP)
// ========================================
const App = () => {
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [mostrarChat, setMostrarChat] = useState(false);

    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard':
                return <Dashboard />;
            case 'pdv':
                return <PDV />;
            case 'estoque':
                return <Estoque />;
            case 'precificacao':
                return <Precificacao />;
            default:
                return <Dashboard />;
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
            
            <div className="flex-1 ml-64">
                {renderPage()}
            </div>

            {/* Botão Chat Flutuante */}
            <button
                onClick={() => setMostrarChat(!mostrarChat)}
                className="fixed bottom-6 right-6 w-16 h-16 bg-verde-principal text-white rounded-full shadow-lg hover:bg-verde-escuro transition-all flex items-center justify-center text-3xl z-50"
            >
                💬
            </button>

            {/* Chat Agente (simplificado) */}
            {mostrarChat && (
                <div className="fixed bottom-24 right-6 w-96 bg-white rounded-xl shadow-2xl z-50 animate-slide-in">
                    <div className="bg-verde-principal text-white p-4 rounded-t-xl flex items-center justify-between">
                        <div>
                            <h3 className="font-bold">Agente Inteligente</h3>
                            <p className="text-sm text-green-100">Gerente Virtual</p>
                        </div>
                        <button onClick={() => setMostrarChat(false)} className="text-2xl">×</button>
                    </div>
                    <div className="p-4 h-96 overflow-y-auto">
                        <div className="bg-verde-claro p-4 rounded-lg mb-4">
                            <p className="text-verde-escuro">
                                🤖 Olá! Sou seu gerente virtual.<br/>
                                Pergunte sobre vendas, estoque ou preços.
                            </p>
                        </div>
                        <p className="text-center text-gray-500 text-sm">
                            Funcionalidade em desenvolvimento...
                        </p>
                    </div>
                    <div className="p-4 border-t">
                        <input
                            type="text"
                            placeholder="Digite sua pergunta..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

// ========================================
// RENDERIZAR APLICAÇÃO
// ========================================
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

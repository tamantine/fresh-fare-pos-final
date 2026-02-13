// Fresh Fare POS - Aplicação Principal Completa com PDV Fullscreen
// React via CDN - Sem build necessário

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
        { id: 'pdv', icon: '🛒', label: 'PDV (Caixa)', isNewTab: true },
        { id: 'estoque', icon: '📦', label: 'Estoque' },
        { id: 'precificacao', icon: '💰', label: 'Precificação' },
    ];

    const handleNavigation = (item) => {
        if (item.isNewTab) {
            window.open(window.location.origin + window.location.pathname + '?page=pdv', '_blank');
        } else {
            setCurrentPage(item.id);
        }
    };

    return (
        <div className="w-64 bg-verde-escuro h-screen fixed left-0 top-0 text-white flex flex-col">
            <div className="p-6 border-b border-green-700">
                <div className="flex items-center gap-3">
                    <span className="text-4xl">🥬</span>
                    <div>
                        <h1 className="text-xl font-bold">Hortifruti BP</h1>
                        <p className="text-sm text-green-300">Diretor do Cardápio</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 py-6">
                {menuItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => handleNavigation(item)}
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
            const hoje = new Date().toISOString().split('T')[0];
            const { data: vendas, error } = await supabase
                .from('vendas')
                .select('*, itens_venda(*)')
                .gte('data_venda', hoje)
                .eq('status', 'FINALIZADA')
                .order('data_venda', { ascending: false });

            if (error) throw error;

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
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Dashboard de Gestão</h1>
                <p className="text-gray-600 mt-2">Visão geral do dia {new Date().toLocaleDateString('pt-BR')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="card bg-verde-escuro text-white hover-lift">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-green-200 text-sm mb-2">Faturamento Hoje</p>
                            <h3 className="text-3xl font-bold">{formatCurrency(metrics.faturamentoDia)}</h3>
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
// COMPONENTE: PDV (Ponto de Venda) - FULLSCREEN SEM ROLAGEM
// ========================================
const PDV = () => {
    const [carrinho, setCarrinho] = useState([]);
    const [codigoBusca, setCodigoBusca] = useState('');
    const [quantidade, setQuantidade] = useState(1);
    const [produtoSelecionado, setProdutoSelecionado] = useState(null);
    const [mostrarModalPagamento, setMostrarModalPagamento] = useState(false);
    const [sugestoesProducts, setSugestoesProducts] = useState([]);
    const [carregandoSugestoes, setCarregandoSugestoes] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        if (inputRef.current) inputRef.current.focus();

        const handleKeyPress = (e) => {
            if (e.key === 'F1') {
                e.preventDefault();
                inputRef.current?.focus();
            }
            if (e.key === 'F6') {
                e.preventDefault();
                if (carrinho.length > 0) setMostrarModalPagamento(true);
            }
            if (e.key === 'F4' || e.key === 'Escape') {
                e.preventDefault();
                limparCarrinho();
            }
            if (e.key === 'F12' && carrinho.length > 0) {
                e.preventDefault();
                const novaQuantidade = prompt('Nova quantidade:', carrinho[carrinho.length - 1].quantidade);
                if (novaQuantidade) {
                    const novoCarrinho = [...carrinho];
                    novoCarrinho[novoCarrinho.length - 1].quantidade = parseFloat(novaQuantidade);
                    novoCarrinho[novoCarrinho.length - 1].subtotal = parseFloat(novaQuantidade) * novoCarrinho[novoCarrinho.length - 1].preco_unitario;
                    setCarrinho(novoCarrinho);
                }
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [carrinho]);

    const buscarProduto = async (termo) => {
        if (!termo.trim()) {
            setSugestoesProducts([]);
            return;
        }

        setCarregandoSugestoes(true);
        try {
            const { data, error } = await supabase
                .from('produtos')
                .select('*')
                .or(`codigo_barras.eq.${termo},nome.ilike.%${termo}%`)
                .eq('ativo', true)
                .limit(5);

            if (error) throw error;
            setSugestoesProducts(data || []);
        } catch (error) {
            showToast('Erro ao buscar produtos', 'error');
        } finally {
            setCarregandoSugestoes(false);
        }
    };

    const selecionarProduto = (produto) => {
        setProdutoSelecionado(produto);
        setCodigoBusca('');
        setSugestoesProducts([]);
        setQuantidade(1);
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
        showToast('✅ Produto adicionado!', 'success');
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
        <div className="pdv-fullscreen">
            {/* Header PDV */}
            <div className="pdv-header">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-3xl">🥬</span>
                        <div>
                            <h1>Hortifruti Bom Preço</h1>
                            <p>SISTEMA PDV PROFISSIONAL</p>
                        </div>
                    </div>
                    <div className="flex gap-3 text-xs items-center">
                        <span>📅 {new Date().toLocaleString('pt-BR')}</span>
                        <span className="badge-compact">🟢 ONLINE</span>
                    </div>
                </div>
            </div>

            {/* Conteúdo Principal */}
            <div className="pdv-content">
                {/* Painel Esquerdo: Operação */}
                <div className="pdv-left-panel">
                    <div className="card-pdv bg-verde-escuro text-white flex-shrink-0">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xs font-bold">🔓 CAIXA ABERTO</h3>
                                <p className="text-green-300 text-[10px]">ID: CAIXA-001</p>
                            </div>
                            <span className="text-xl">💳</span>
                        </div>
                    </div>

                    <div className="card-pdv relative flex-shrink-0">
                        <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase">🔍 Buscar Produto (F1)</label>
                        <div className="relative">
                            <input
                                ref={inputRef}
                                type="text"
                                value={codigoBusca}
                                onChange={(e) => {
                                    setCodigoBusca(e.target.value);
                                    buscarProduto(e.target.value);
                                }}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && sugestoesProducts.length > 0) {
                                        selecionarProduto(sugestoesProducts[0]);
                                    }
                                }}
                                placeholder="Código ou nome..."
                                className="search-input-pdv"
                            />
                            {carregandoSugestoes && <span className="absolute right-2 top-2 text-gray-400 text-xs">⏳</span>}
                        </div>
                        
                        {sugestoesProducts.length > 0 && (
                            <div className="absolute top-14 left-0 right-0 bg-white border-2 border-verde-principal rounded-lg shadow-lg z-10 max-h-32 overflow-y-auto pdv-scrollbar">
                                {sugestoesProducts.map(produto => (
                                    <button
                                        key={produto.id}
                                        onClick={() => selecionarProduto(produto)}
                                        className="w-full text-left px-3 py-1.5 hover:bg-verde-claro border-b border-gray-100 transition-colors"
                                    >
                                        <div className="font-bold text-gray-800 text-[11px] truncate">{produto.nome}</div>
                                        <div className="text-[10px] text-gray-600">{formatCurrency(produto.preco_venda)} • Est: {produto.estoque_atual}</div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {produtoSelecionado ? (
                        <div className="card-pdv bg-verde-claro border-2 border-verde-principal flex-shrink-0 animate-fade-in">
                            <div className="mb-2">
                                <h4 className="text-xs font-bold text-gray-800 truncate">{produtoSelecionado.nome}</h4>
                                <p className="text-[10px] text-gray-600">Código: {produtoSelecionado.codigo_barras || 'N/A'}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mb-2">
                                <div>
                                    <label className="block text-[10px] font-semibold text-gray-700 mb-1">Preço Unit.</label>
                                    <div className="px-2 py-1.5 bg-white rounded border border-verde-principal text-lg font-bold text-verde-principal text-center">
                                        {formatCurrency(produtoSelecionado.preco_venda)}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-semibold text-gray-700 mb-1">QTD</label>
                                    <input
                                        type="number"
                                        step="0.001"
                                        value={quantidade}
                                        onChange={(e) => setQuantidade(e.target.value)}
                                        className="w-full px-2 py-1.5 border-2 border-verde-principal rounded font-bold text-lg text-center"
                                    />
                                </div>
                            </div>
                            <button onClick={adicionarAoCarrinho} className="w-full btn-primary py-1.5 text-xs">➕ Adicionar Item</button>
                        </div>
                    ) : (
                        <div className="card-pdv border-2 border-dashed border-gray-300 flex-1 flex items-center justify-center text-gray-400">
                            <div className="text-center">
                                <span className="text-3xl block mb-1">🍎</span>
                                <p className="text-[10px]">Aguardando seleção...</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Painel Direito: Carrinho e Totais */}
                <div className="pdv-right-panel">
                    <div className="card-pdv flex-1 flex flex-col min-h-0">
                        <h2 className="text-xs font-bold text-gray-800 mb-2 flex-shrink-0 flex items-center gap-1">
                            <span>🛒 Carrinho</span>
                            <span className="badge-compact">{carrinho.length}</span>
                        </h2>
                        
                        <div className="cart-scroll pdv-scrollbar">
                            {carrinho.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-300 opacity-50">
                                    <span className="text-4xl mb-1">🛒</span>
                                    <p className="text-[10px]">Vazio</p>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {carrinho.map((item) => (
                                        <div key={item.id} className="cart-item-compact">
                                            <div className="flex-1 min-w-0 pr-2">
                                                <div className="cart-item-name">{item.descricao}</div>
                                                <div className="cart-item-qty">{item.quantidade} {item.tipo_venda} × {formatCurrency(item.preco_unitario)}</div>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <div className="cart-item-price">{formatCurrency(item.subtotal)}</div>
                                                <button onClick={() => removerDoCarrinho(item.id)} className="text-red-500 hover:text-red-700 text-[10px] font-bold">REMOVER</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="cart-summary flex-shrink-0">
                        <div className="space-y-1">
                            <div className="flex justify-between items-center text-xs font-semibold text-gray-600">
                                <span>Subtotal:</span>
                                <span>{formatCurrency(calcularTotal())}</span>
                            </div>
                            <div className="total-display mt-1">
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Total a Pagar</p>
                                {formatCurrency(calcularTotal())}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 flex-shrink-0">
                        <button onClick={limparCarrinho} className="btn-danger py-2 text-xs font-bold uppercase tracking-tight">🗑️ Cancelar</button>
                        <button 
                            onClick={() => carrinho.length > 0 && setMostrarModalPagamento(true)} 
                            disabled={carrinho.length === 0} 
                            className="btn-warning py-2 text-xs font-bold uppercase tracking-tight disabled:opacity-50"
                        >
                            💳 Pagar (F6)
                        </button>
                    </div>
                </div>
            </div>

            {/* Rodapé PDV: Atalhos */}
            <div className="pdv-footer">
                <div className="flex gap-3">
                    <span><kbd>F1</kbd> Buscar</span>
                    <span><kbd>F6</kbd> Pagamento</span>
                    <span><kbd>F12</kbd> Quantidade</span>
                    <span><kbd>F4</kbd> Cancelar Venda</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="opacity-75">v2.1.0</span>
                    <span className="text-green-400">● ONLINE</span>
                </div>
            </div>

            {mostrarModalPagamento && (
                <ModalPagamento
                    total={calcularTotal()}
                    carrinho={carrinho}
                    onClose={() => setMostrarModalPagamento(false)}
                    onSuccess={() => { setCarrinho([]); setMostrarModalPagamento(false); }}
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
        if (!formaPagamento) { showToast('Selecione uma forma de pagamento!', 'error'); return; }

        try {
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
                .select().single();

            if (erroVenda) throw erroVenda;

            const itensVenda = carrinho.map(item => ({
                venda_id: venda.id,
                produto_id: item.produto_id,
                descricao_produto: item.descricao,
                quantidade: item.quantidade,
                preco_unitario: item.preco_unitario,
                subtotal: item.subtotal,
                tipo_venda: item.tipo_venda
            }));

            const { error: erroItens } = await supabase.from('itens_venda').insert(itensVenda);
            if (erroItens) throw erroItens;

            showToast(`✅ Venda finalizada! ${formaPagamento === 'DINHEIRO' ? `Troco: ${formatCurrency(troco)}` : ''}`, 'success');
            onSuccess();
        } catch (error) {
            console.error('Erro ao finalizar venda:', error);
            showToast('Erro ao finalizar venda. Verifique sua conexão.', 'error');
        }
    };

    return (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-2xl animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Finalizar Pagamento</h2>
                    <button onClick={onClose} className="text-gray-400 text-2xl">×</button>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg mb-4 border border-gray-200">
                    <div className="flex justify-between mb-1 text-sm"><span>Subtotal:</span><span className="font-semibold">{formatCurrency(total)}</span></div>
                    <div className="flex justify-between mb-1 text-sm">
                        <span>Desconto:</span>
                        <input type="number" value={desconto} onChange={(e) => setDesconto(parseFloat(e.target.value) || 0)} className="w-24 px-1 py-0.5 border rounded text-right font-bold" />
                    </div>
                    <div className="border-t pt-1 flex justify-between items-center"><span className="font-bold">Total Final:</span><span className="text-xl font-black text-verde-principal">{formatCurrency(totalComDesconto)}</span></div>
                </div>
                <div className="mb-4">
                    <label className="block text-xs font-bold text-gray-700 mb-2 uppercase">Forma de Pagamento</label>
                    <div className="grid grid-cols-2 gap-2">
                        {['DINHEIRO', 'CREDITO', 'DEBITO', 'PIX'].map(forma => (
                            <button key={forma} onClick={() => setFormaPagamento(forma)} className={`p-2 rounded border-2 transition-all flex items-center gap-2 ${formaPagamento === forma ? 'border-verde-principal bg-verde-claro' : 'border-gray-100 hover:border-verde-principal'}`}>
                                <span className="text-xl">{forma === 'DINHEIRO' ? '💵' : forma === 'PIX' ? '📱' : '💳'}</span>
                                <span className="text-[10px] font-bold">{forma}</span>
                            </button>
                        ))}
                    </div>
                </div>
                {formaPagamento === 'DINHEIRO' && (
                    <div className="mb-4">
                        <label className="block text-xs font-bold text-gray-700 mb-1">Valor Recebido</label>
                        <input type="number" step="0.01" value={valorRecebido} onChange={(e) => setValorRecebido(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 border-2 border-gray-300 rounded font-bold text-lg" />
                        {troco >= 0 && <div className="mt-1 text-sm font-bold text-gray-600 text-right">Troco: <span className="text-verde-principal">{formatCurrency(troco)}</span></div>}
                    </div>
                )}
                <div className="flex gap-2">
                    <button onClick={onClose} className="flex-1 py-2 bg-gray-100 rounded font-bold text-xs">VOLTAR</button>
                    <button onClick={finalizarVenda} className="flex-1 btn-primary py-2 text-xs font-bold">CONFIRMAR VENDA</button>
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

    useEffect(() => { carregarProdutos(); }, []);

    const carregarProdutos = async () => {
        try {
            const { data, error } = await supabase.from('produtos').select('*').order('nome');
            if (error) throw error;
            setProdutos(data || []);
        } catch (error) { showToast('Erro ao carregar produtos', 'error'); }
    };

    const produtosFiltrados = produtos.filter(p => p.nome.toLowerCase().includes(busca.toLowerCase()) || (p.codigo_barras && p.codigo_barras.includes(busca)));

    return (
        <div className="p-8 animate-fade-in">
            <div className="mb-8"><h1 className="text-3xl font-bold text-gray-800">Gestão de Estoque</h1><p className="text-gray-600 mt-2">Controle seus produtos e preços</p></div>
            <div className="flex items-center gap-4 mb-6">
                <input type="text" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="🔍 Buscar por nome ou código..." className="flex-1 px-4 py-3 border border-gray-300 rounded-lg" />
                <button onClick={() => setMostrarModal(true)} className="btn-primary">➕ Novo Produto</button>
            </div>
            <div className="card">
                <div className="overflow-x-auto">
                    <table className="w-full table-zebra">
                        <thead><tr className="border-b-2 border-gray-200"><th className="text-left py-3 px-4">PRODUTO</th><th className="text-left py-3 px-4">CATEGORIA</th><th className="text-center py-3 px-4">TIPO</th><th className="text-right py-3 px-4">PREÇO</th><th className="text-center py-3 px-4">ESTOQUE</th></tr></thead>
                        <tbody>
                            {produtosFiltrados.map(produto => (
                                <tr key={produto.id}>
                                    <td className="py-3 px-4"><div className="font-semibold">{produto.nome}</div><div className="text-sm text-gray-500">ID: {produto.id}</div></td>
                                    <td className="py-3 px-4"><span className="badge badge-green">{produto.categoria}</span></td>
                                    <td className="py-3 px-4 text-center"><span className="badge badge-yellow">{produto.tipo_venda}</span></td>
                                    <td className="py-3 px-4 text-right font-bold text-verde-principal">{formatCurrency(produto.preco_venda)}</td>
                                    <td className="py-3 px-4 text-center"><span className={`font-semibold ${produto.estoque_atual <= produto.estoque_minimo ? 'text-red-600' : 'text-verde-principal'}`}>{produto.estoque_atual}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {mostrarModal && <ModalProduto onClose={() => setMostrarModal(false)} onSuccess={() => { setMostrarModal(false); carregarProdutos(); }} />}
        </div>
    );
};

// ========================================
// COMPONENTE: MODAL PRODUTO
// ========================================
const ModalProduto = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({ nome: '', codigo_barras: '', categoria: '', tipo_venda: 'UN', preco_venda: 0, custo_nota: 0, quebra_perda: 0, margem_lucro: 0, estoque_atual: 0, estoque_minimo: 5 });
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { error } = await supabase.from('produtos').insert([formData]);
            if (error) throw error;
            showToast('Produto cadastrado com sucesso!', 'success');
            onSuccess();
        } catch (error) { showToast('Erro ao cadastrar produto', 'error'); }
    };
    return (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6"><h2 className="text-2xl font-bold text-gray-800">Novo Produto</h2><button onClick={onClose} className="text-gray-400 text-2xl">×</button></div>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <input type="text" placeholder="Nome *" value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} className="w-full px-4 py-2 border rounded-lg" required />
                        <input type="text" placeholder="Código de Barras" value={formData.codigo_barras} onChange={(e) => setFormData({...formData, codigo_barras: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                        <input type="text" placeholder="Categoria *" value={formData.categoria} onChange={(e) => setFormData({...formData, categoria: e.target.value})} className="w-full px-4 py-2 border rounded-lg" required />
                        <select value={formData.tipo_venda} onChange={(e) => setFormData({...formData, tipo_venda: e.target.value})} className="w-full px-4 py-2 border rounded-lg"><option value="KG">KG</option><option value="UN">UN</option></select>
                    </div>
                    <div className="space-y-4">
                        <input type="number" placeholder="Preço de Venda *" value={formData.preco_venda} onChange={(e) => setFormData({...formData, preco_venda: parseFloat(e.target.value)})} className="w-full px-4 py-2 border rounded-lg" required />
                        <input type="number" placeholder="Estoque Atual" value={formData.estoque_atual} onChange={(e) => setFormData({...formData, estoque_atual: parseInt(e.target.value)})} className="w-full px-4 py-2 border rounded-lg" />
                        <button type="submit" className="w-full btn-primary py-3">💾 Salvar Produto</button>
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
    const [dados, setDados] = useState({ nome: '', custoNota: 0, quebra: 15, margem: 50, tipoVenda: 'UN' });
    const resultado = {
        custoReal: dados.custoNota + (dados.custoNota * dados.quebra / 100),
        lucro: (dados.custoNota + (dados.custoNota * dados.quebra / 100)) * (dados.margem / 100),
        precoFinal: (dados.custoNota + (dados.custoNota * dados.quebra / 100)) * (1 + dados.margem / 100)
    };
    return (
        <div className="p-8 animate-fade-in">
            <div className="mb-8"><h1 className="text-3xl font-bold text-gray-800">Precificação Profissional</h1></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="card bg-verde-escuro text-white p-6">
                    <h2 className="text-xl font-bold mb-6">📦 Dados de Entrada</h2>
                    <div className="space-y-4">
                        <input type="number" value={dados.custoNota} onChange={(e) => setDados({...dados, custoNota: parseFloat(e.target.value)})} className="w-full px-4 py-2 text-gray-800 rounded-lg" placeholder="Custo na Nota" />
                        <input type="number" value={dados.quebra} onChange={(e) => setDados({...dados, quebra: parseFloat(e.target.value)})} className="w-full px-4 py-2 text-gray-800 rounded-lg" placeholder="Quebra %" />
                        <input type="number" value={dados.margem} onChange={(e) => setDados({...dados, margem: parseFloat(e.target.value)})} className="w-full px-4 py-2 text-gray-800 rounded-lg" placeholder="Margem %" />
                    </div>
                </div>
                <div className="card bg-verde-claro p-6 text-center">
                    <h2 className="text-xl font-bold text-verde-escuro mb-6">📊 Preço Sugerido</h2>
                    <p className="text-5xl font-bold text-verde-escuro">{formatCurrency(resultado.precoFinal)}</p>
                    <p className="text-gray-600 mt-2">/{dados.tipoVenda.toLowerCase()}</p>
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
    const urlParams = new URLSearchParams(window.location.search);
    const pageParam = urlParams.get('page');

    useEffect(() => {
        if (pageParam === 'pdv') {
            setCurrentPage('pdv');
        }
    }, [pageParam]);

    const renderPage = () => {
        if (currentPage === 'pdv') return <PDV />;
        return (
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
                <div className="flex-1 ml-64">{currentPage === 'dashboard' ? <Dashboard /> : currentPage === 'estoque' ? <Estoque /> : <Precificacao />}</div>
            </div>
        );
    };

    return renderPage();
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

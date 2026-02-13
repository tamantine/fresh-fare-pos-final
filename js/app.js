// Fresh Fare POS - Aplicação Principal
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
        { id: 'pdv', icon: '🛒', label: 'PDV (Caixa)' },
        { id: 'estoque', icon: '📦', label: 'Estoque' },
        { id: 'precificacao', icon: '💰', label: 'Precificação' },
    ];

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
// COMPONENTE: PDV (Ponto de Venda) - NOVO
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
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-verde-escuro text-white p-4 shadow-lg">
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
                        <span className="badge badge-green">🟢 ONLINE</span>
                    </div>
                </div>
            </div>

            {/* Área Principal */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-4 p-6 overflow-hidden">
                {/* Coluna Esquerda - Busca */}
                <div className="lg:col-span-3 space-y-4 flex flex-col overflow-auto">
                    {/* Status do Caixa */}
                    <div className="card bg-verde-escuro text-white shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold">🔓 CAIXA ABERTO</h3>
                                <p className="text-green-300 text-sm">ID: CAIXA-001</p>
                            </div>
                            <span className="text-4xl">💳</span>
                        </div>
                    </div>

                    {/* Busca de Produtos */}
                    <div className="card relative">
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            🔍 BUSCAR PRODUTO (F1)
                        </label>
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
                                placeholder="Código, nome ou ID..."
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-verde-principal focus:ring-2 focus:ring-verde-claro text-lg font-semibold"
                            />
                            {carregandoSugestoes && <span className="absolute right-3 top-3 text-gray-400">⏳</span>}
                        </div>
                        
                        {/* Sugestões */}
                        {sugestoesProducts.length > 0 && (
                            <div className="absolute top-20 left-0 right-0 bg-white border-2 border-verde-principal rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                                {sugestoesProducts.map(produto => (
                                    <button
                                        key={produto.id}
                                        onClick={() => selecionarProduto(produto)}
                                        className="w-full text-left px-4 py-3 hover:bg-verde-claro border-b border-gray-200 last:border-b-0 transition-colors"
                                    >
                                        <div className="font-semibold text-gray-800">{produto.nome}</div>
                                        <div className="text-sm text-gray-600">{formatCurrency(produto.preco_venda)} • Estoque: {produto.estoque_atual}</div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Produto Selecionado */}
                    {produtoSelecionado && (
                        <div className="card bg-verde-claro border-2 border-verde-principal">
                            <div className="mb-4">
                                <h4 className="text-lg font-bold text-gray-800">{produtoSelecionado.nome}</h4>
                                <p className="text-sm text-gray-600">Código: {produtoSelecionado.codigo_barras}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Preço Unitário</label>
                                    <div className="px-4 py-3 bg-white rounded-lg text-2xl font-bold text-verde-principal">
                                        {formatCurrency(produtoSelecionado.preco_venda)}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">QTD / PESO</label>
                                    <input
                                        type="number"
                                        step="0.001"
                                        value={quantidade}
                                        onChange={(e) => setQuantidade(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-verde-principal rounded-lg font-semibold text-lg"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={adicionarAoCarrinho}
                                className="w-full btn-primary"
                            >
                                ➕ Adicionar ao Carrinho
                            </button>
                        </div>
                    )}
                </div>

                {/* Coluna Direita - Carrinho e Resumo */}
                <div className="lg:col-span-2 flex flex-col space-y-4 overflow-auto">
                    {/* Carrinho */}
                    <div className="card flex-1 overflow-auto">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">🛒 Carrinho</h2>
                        
                        {carrinho.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                                <span className="text-5xl mb-2">🛒</span>
                                <p>Carrinho Vazio</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {carrinho.map((item, index) => (
                                    <div key={item.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg hover:bg-verde-claro transition-colors">
                                        <div className="flex-1">
                                            <div className="font-semibold text-gray-800">{item.descricao}</div>
                                            <div className="text-sm text-gray-600">{item.quantidade} {item.tipo_venda} × {formatCurrency(item.preco_unitario)}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-verde-principal">{formatCurrency(item.subtotal)}</div>
                                            <button
                                                onClick={() => removerDoCarrinho(item.id)}
                                                className="text-red-600 hover:text-red-800 text-sm mt-1"
                                            >
                                                Remover
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Resumo */}
                    <div className="card bg-gradient-to-br from-verde-claro to-white border-2 border-verde-principal shadow-lg">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center pb-2 border-b border-gray-300">
                                <span className="text-gray-700 font-semibold">Itens:</span>
                                <span className="text-lg font-bold">{carrinho.length}</span>
                            </div>
                            <div className="bg-white p-4 rounded-lg border-2 border-verde-principal">
                                <p className="text-sm text-gray-600 mb-1">TOTAL A PAGAR</p>
                                <p className="text-4xl font-black text-verde-escuro">
                                    {formatCurrency(calcularTotal())}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Ações */}
                    <div className="space-y-2">
                        <button
                            onClick={limparCarrinho}
                            className="w-full btn-danger"
                        >
                            🗑️ Cancelar Venda
                        </button>
                        <button
                            onClick={() => carrinho.length > 0 && setMostrarModalPagamento(true)}
                            disabled={carrinho.length === 0}
                            className="w-full btn-warning disabled:opacity-50"
                        >
                            💳 PAGAMENTO (F6)
                        </button>
                    </div>
                </div>
            </div>

            {/* Barra de Atalhos */}
            <div className="bg-verde-escuro text-white px-6 py-2 text-xs font-semibold flex items-center justify-between shadow-lg">
                <div className="flex gap-4">
                    <span><kbd className="bg-verde-principal px-2 py-1 rounded">F1</kbd> Buscar</span>
                    <span><kbd className="bg-verde-principal px-2 py-1 rounded">F6</kbd> Pagamento</span>
                    <span><kbd className="bg-verde-principal px-2 py-1 rounded">F12</kbd> Editar Qtd</span>
                    <span><kbd className="bg-red-600 px-2 py-1 rounded">F4/ESC</kbd> Cancelar</span>
                </div>
                <span>🟢 Online</span>
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

            showToast(`✅ Venda finalizada! ${formaPagamento === 'DINHEIRO' ? `Troco: ${formatCurrency(troco)}` : ''}`, 'success');
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
// COMPONENTE: APP PRINCIPAL
// ========================================
const App = () => {
    const [currentPage, setCurrentPage] = useState('pdv');

    return (
        <div className="flex">
            <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
            <div className="ml-64 flex-1">
                {currentPage === 'pdv' && <PDV />}
            </div>
        </div>
    );
};

// Renderizar App
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

// ========================================
// COMPONENTE: PDV CORRIGIDO - IGUAL À IMAGEM
// ========================================

const PDV_Corrigido = () => {
    const [carrinho, setCarrinho] = useState([]);
    const [codigoBusca, setCodigoBusca] = useState('');
    const [quantidade, setQuantidade] = useState(1);
    const [produtoSelecionado, setProdutoSelecionado] = useState(null);
    const [mostrarModalPagamento, setMostrarModalPagamento] = useState(false);
    const [mostrarModalHardware, setMostrarModalHardware] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }

        const handleKeyPress = (e) => {
            // F6 ou F8 - Pagamento
            if (e.key === 'F6' || e.key === 'F8') {
                e.preventDefault();
                if (carrinho.length > 0) setMostrarModalPagamento(true);
            }
            // F4 ou ESC - Cancelar/Limpar
            if (e.key === 'F4' || e.key === 'Escape') {
                e.preventDefault();
                limparCarrinho();
            }
            // F1 - Buscar (foco no input)
            if (e.key === 'F1') {
                e.preventDefault();
                inputRef.current?.focus();
            }
            // F2 - Balança
            if (e.key === 'F2') {
                e.preventDefault();
                setMostrarModalHardware(true);
            }
            // F11 - Tela cheia
            if (e.key === 'F11') {
                e.preventDefault();
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen();
                } else {
                    document.exitFullscreen();
                }
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
            
            // Se balança conectada e produto KG, pegar peso
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

    const toggleTelaCheia = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* ========================================
                HEADER VERDE - IGUAL À IMAGEM
            ======================================== */}
            <div className="bg-verde-escuro text-white p-3 shadow-lg">
                <div className="flex items-center justify-between">
                    {/* Logo e Título */}
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-2xl">
                            🍎
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">Hortifruti Bom Preço</h1>
                            <p className="text-green-200 text-xs">SISTEMA PDV PROFISSIONAL</p>
                        </div>
                    </div>

                    {/* Botões do Header */}
                    <div className="flex items-center gap-3 text-sm">
                        <button className="flex items-center gap-1 px-3 py-1.5 hover:bg-verde-principal rounded transition">
                            <span>🏠</span>
                            <span>Início</span>
                        </button>

                        <div className="px-3 py-1.5 bg-verde-principal bg-opacity-30 rounded">
                            <span className="font-mono">DATA/HORA</span>
                            <br />
                            <span className="text-xs">{new Date().toLocaleString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}</span>
                        </div>

                        <button className="flex items-center gap-1 px-3 py-1.5 hover:bg-verde-principal rounded transition">
                            <span>🔒</span>
                            <span>Fechar</span>
                        </button>

                        <button 
                            onClick={() => setMostrarModalHardware(true)}
                            className="flex items-center gap-1 px-3 py-1.5 hover:bg-verde-principal rounded transition"
                        >
                            <span>⚖️</span>
                            <span>Balança</span>
                        </button>

                        <button 
                            onClick={() => setMostrarModalHardware(true)}
                            className="flex items-center gap-1 px-3 py-1.5 hover:bg-verde-principal rounded transition"
                        >
                            <span>🖨️</span>
                            <span>Conecte Imp.</span>
                        </button>

                        <button 
                            onClick={toggleTelaCheia}
                            className="flex items-center gap-1 px-3 py-1.5 hover:bg-verde-principal rounded transition"
                        >
                            <span>🖥️</span>
                            <span>Tela Cheia</span>
                        </button>

                        <button className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded transition">
                            <span>🚪</span>
                            <span>Sair</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* ========================================
                CONTEÚDO PRINCIPAL
            ======================================== */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-6 p-6">
                {/* ========================================
                    COLUNA ESQUERDA - ENTRADA DE DADOS
                ======================================== */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Caixa Status */}
                    <div className="bg-verde-escuro text-white p-6 rounded-xl text-center">
                        <h3 className="text-2xl font-bold mb-2">CAIXA ABERTO</h3>
                        <p className="text-green-300 text-sm font-mono">ID: a0039a31</p>
                    </div>

                    {/* Formulário de Entrada */}
                    <div className="bg-white rounded-xl p-6 shadow-lg">
                        <div className="space-y-4">
                            {/* Código de Barras */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase">
                                    Código de Barras / Nome (F1)
                                </label>
                                <div className="relative">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={codigoBusca}
                                        onChange={(e) => setCodigoBusca(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && buscarProduto()}
                                        placeholder="000000000000"
                                        className="w-full px-4 py-3 bg-verde-escuro text-white rounded-lg font-mono text-lg focus:outline-none focus:ring-2 focus:ring-verde-principal"
                                    />
                                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-400 text-xl">
                                        |||||
                                    </span>
                                </div>
                            </div>

                            {/* Valor Unitário */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase">
                                    Valor Unitário
                                </label>
                                <div className="px-4 py-3 bg-gray-100 rounded-lg">
                                    <span className="text-gray-500 text-sm">R$</span>
                                    <span className="text-2xl font-bold text-gray-800 ml-2">
                                        {produtoSelecionado ? formatCurrency(produtoSelecionado.preco_venda).replace('R$', '').trim() : '0,00'}
                                    </span>
                                </div>
                            </div>

                            {/* Quantidade / Peso */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase">
                                    Qtd / Peso
                                </label>
                                <input
                                    type="number"
                                    step="0.001"
                                    value={quantidade}
                                    onChange={(e) => setQuantidade(e.target.value)}
                                    className="w-full px-4 py-3 bg-verde-escuro text-white text-center text-2xl font-bold rounded-lg focus:outline-none focus:ring-2 focus:ring-verde-principal"
                                />
                            </div>

                            {/* Total de Itens a Fazer */}
                            <div className="bg-verde-claro p-6 rounded-lg">
                                <p className="text-xs font-bold text-verde-escuro mb-2 uppercase">
                                    Total de Itens a Fazer
                                </p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-verde-escuro text-lg">R$</span>
                                    <span className="text-4xl font-bold text-verde-escuro">
                                        {formatCurrency(calcularTotal()).replace('R$', '').trim()}
                                    </span>
                                </div>
                            </div>

                            {/* Botão Adicionar */}
                            <button
                                onClick={adicionarAoCarrinho}
                                disabled={!produtoSelecionado}
                                className="w-full bg-verde-claro hover:bg-verde-principal text-verde-escuro hover:text-white font-bold py-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <span className="text-xl">+</span>
                                <span>Adicionar Item</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* ========================================
                    COLUNA DIREITA - CARRINHO
                ======================================== */}
                <div className="lg:col-span-3 flex flex-col">
                    <div className="bg-white rounded-xl shadow-lg flex-1 flex flex-col">
                        {/* Tabela de Produtos */}
                        <div className="flex-1 overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b-2 border-gray-200">
                                    <tr>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-600 uppercase">#</th>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-600 uppercase">Descrição do Produto</th>
                                        <th className="text-center py-3 px-4 text-xs font-bold text-gray-600 uppercase">Qtd/Peso</th>
                                        <th className="text-center py-3 px-4 text-xs font-bold text-gray-600 uppercase">Unida de VL.</th>
                                        <th className="text-right py-3 px-4 text-xs font-bold text-gray-600 uppercase">VL. Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {carrinho.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="py-20 text-center">
                                                <div className="flex flex-col items-center justify-center text-gray-300">
                                                    <span className="text-6xl mb-4">🛒</span>
                                                    <p className="text-xl font-semibold">Carrinho Vazio</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        carrinho.map((item, index) => (
                                            <tr key={item.id} className="border-b border-gray-100 hover:bg-verde-claro hover:bg-opacity-30 transition">
                                                <td className="py-4 px-4 font-semibold text-gray-700">{index + 1}</td>
                                                <td className="py-4 px-4 font-medium text-gray-800">{item.descricao}</td>
                                                <td className="py-4 px-4 text-center font-semibold">{item.quantidade.toFixed(3)}</td>
                                                <td className="py-4 px-4 text-center">
                                                    <span className="px-2 py-1 bg-verde-claro text-verde-escuro rounded font-semibold text-sm">
                                                        {item.tipo_venda}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 text-right font-bold text-verde-principal">
                                                    {formatCurrency(item.subtotal)}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer com Totais e Botões */}
                        <div className="border-t-2 border-gray-200 p-6 space-y-4">
                            {/* Subtotal e Total */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-semibold text-gray-600 uppercase">Subtotal</span>
                                    <span className="text-lg font-bold text-gray-700">
                                        {formatCurrency(calcularTotal())}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xl font-bold text-gray-800 uppercase">Total a Pagar</span>
                                    <span className="text-4xl font-bold text-verde-principal">
                                        {formatCurrency(calcularTotal())}
                                    </span>
                                </div>
                            </div>

                            {/* Botões de Ação */}
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => carrinho.length > 0 && setMostrarModalPagamento(true)}
                                    disabled={carrinho.length === 0}
                                    className="bg-amarelo-dourado hover:bg-yellow-600 text-white font-bold py-4 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <span className="text-2xl">💳</span>
                                    <span>PAGAMENTO (F6)</span>
                                </button>

                                <button
                                    onClick={limparCarrinho}
                                    className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-4 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
                                >
                                    <span className="text-2xl">🗑️</span>
                                    <span>Cancelar Venda</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ========================================
                RODAPÉ - BARRA DE ATALHOS
            ======================================== */}
            <div className="bg-verde-escuro text-white py-3 px-6 shadow-lg">
                <div className="flex items-center justify-between">
                    {/* Atalhos */}
                    <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                            <span className="bg-verde-principal px-2 py-1 rounded font-bold text-xs">F1</span>
                            <span className="text-green-200">BUSCAR</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="bg-verde-principal px-2 py-1 rounded font-bold text-xs">F2</span>
                            <span className="text-green-200">BALANÇA</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="bg-verde-principal px-2 py-1 rounded font-bold text-xs">F3</span>
                            <span className="text-green-200">DESCONTO</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="bg-verde-principal px-2 py-1 rounded font-bold text-xs">F4</span>
                            <span className="text-green-200">CANCELAR</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="bg-amarelo-dourado px-2 py-1 rounded font-bold text-xs">F8</span>
                            <span className="text-green-200">PAGAMENTO</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="bg-verde-principal px-2 py-1 rounded font-bold text-xs">F11</span>
                            <span className="text-green-200">TELA CHEIA</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="bg-verde-principal px-2 py-1 rounded font-bold text-xs">F8</span>
                            <span className="text-green-200">FINALIZAR</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="bg-verde-principal px-2 py-1 rounded font-bold text-xs">F9</span>
                            <span className="text-green-200">RESUMO CAIXA</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="bg-verde-principal px-2 py-1 rounded font-bold text-xs">ESC</span>
                            <span className="text-green-200">LIMPAR</span>
                        </div>
                    </div>

                    {/* Status Online */}
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
                        <span className="font-bold text-green-300">ONLINE</span>
                    </div>
                </div>
            </div>

            {/* Modais */}
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

            {mostrarModalHardware && typeof ModalConfigHardware !== 'undefined' && (
                <ModalConfigHardware onClose={() => setMostrarModalHardware(false)} />
            )}
        </div>
    );
};

// Substituir o PDV antigo pelo novo
window.PDV_Corrigido = PDV_Corrigido;

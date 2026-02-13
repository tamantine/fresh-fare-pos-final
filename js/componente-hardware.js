// ========================================
// COMPONENTE: GERENCIAMENTO DE HARDWARE
// Para ser integrado no PDV principal
// ========================================

// ADICIONAR AO APP.JS após a linha 10 (depois da configuração do Supabase)

// ========================================
// INSTÂNCIAS GLOBAIS DE HARDWARE
// ========================================
let balancaGlobal = null;
let impressoraGlobal = null;

// Inicializar ao carregar a aplicação
if (typeof BalancaSerial !== 'undefined') {
    balancaGlobal = new BalancaSerial();
}

if (typeof ImpressoraTermica !== 'undefined') {
    impressoraGlobal = new ImpressoraTermica();
}

// ========================================
// COMPONENTE: MODAL CONFIGURAÇÃO DE HARDWARE
// ========================================
const ModalConfigHardware = ({ onClose }) => {
    const [abaAtiva, setAbaAtiva] = useState('balanca');
    const [balancaConectada, setBalancaConectada] = useState(balancaGlobal?.estaConectado() || false);
    const [impressoraConectada, setImpressoraConectada] = useState(impressoraGlobal?.estaConectado() || false);
    const [marcaBalanca, setMarcaBalanca] = useState('toledo');
    const [marcaImpressora, setMarcaImpressora] = useState('bematech');
    const [pesoAtual, setPesoAtual] = useState(0);
    const [leituraAtiva, setLeituraAtiva] = useState(false);

    // Conectar balança
    const conectarBalanca = async () => {
        if (!balancaGlobal) {
            showToast('Balança não disponível. Use Chrome ou Edge.', 'error');
            return;
        }

        try {
            await balancaGlobal.conectar(marcaBalanca);
            setBalancaConectada(true);
            showToast(`Balança ${marcaBalanca.toUpperCase()} conectada!`, 'success');
        } catch (error) {
            showToast('Erro ao conectar balança. ' + error.message, 'error');
        }
    };

    // Desconectar balança
    const desconectarBalanca = async () => {
        try {
            if (leituraAtiva) {
                balancaGlobal.pararLeituraAutomatica();
                setLeituraAtiva(false);
            }
            await balancaGlobal.desconectar();
            setBalancaConectada(false);
            setPesoAtual(0);
            showToast('Balança desconectada', 'warning');
        } catch (error) {
            showToast('Erro ao desconectar', 'error');
        }
    };

    // Ler peso único
    const lerPeso = async () => {
        try {
            const peso = await balancaGlobal.lerPeso();
            setPesoAtual(peso);
            showToast(`Peso: ${peso.toFixed(3)} kg`, 'success');
        } catch (error) {
            showToast('Erro ao ler peso', 'error');
        }
    };

    // Iniciar leitura contínua
    const toggleLeituraAutomatica = () => {
        if (leituraAtiva) {
            balancaGlobal.pararLeituraAutomatica();
            setLeituraAtiva(false);
            showToast('Leitura automática parada', 'warning');
        } else {
            balancaGlobal.iniciarLeituraAutomatica((peso) => {
                setPesoAtual(peso);
            }, 500);
            setLeituraAtiva(true);
            showToast('Leitura automática iniciada', 'success');
        }
    };

    // Conectar impressora
    const conectarImpressora = async () => {
        if (!impressoraGlobal) {
            showToast('Impressora não disponível. Use Chrome ou Edge.', 'error');
            return;
        }

        try {
            await impressoraGlobal.conectar(marcaImpressora);
            setImpressoraConectada(true);
            showToast(`Impressora ${marcaImpressora.toUpperCase()} conectada!`, 'success');
        } catch (error) {
            showToast('Erro ao conectar impressora. ' + error.message, 'error');
        }
    };

    // Desconectar impressora
    const desconectarImpressora = async () => {
        try {
            await impressoraGlobal.desconectar();
            setImpressoraConectada(false);
            showToast('Impressora desconectada', 'warning');
        } catch (error) {
            showToast('Erro ao desconectar', 'error');
        }
    };

    // Teste de impressão
    const testarImpressora = async () => {
        try {
            await impressoraGlobal.alinharCentro();
            await impressoraGlobal.fonteDupla();
            await impressoraGlobal.imprimirTexto('TESTE DE IMPRESSÃO');
            await impressoraGlobal.pularLinha(2);
            await impressoraGlobal.fonteNormal();
            await impressoraGlobal.alinharEsquerda();
            await impressoraGlobal.imprimirTexto('Fresh Fare POS');
            await impressoraGlobal.pularLinha();
            await impressoraGlobal.imprimirTexto(new Date().toLocaleString('pt-BR'));
            await impressoraGlobal.pularLinha(3);
            await impressoraGlobal.cortarPapel();
            await impressoraGlobal.bip();
            
            showToast('Teste de impressão enviado!', 'success');
        } catch (error) {
            showToast('Erro no teste de impressão', 'error');
        }
    };

    // Abrir gaveta
    const abrirGaveta = async () => {
        try {
            await impressoraGlobal.abrirGaveta();
            showToast('Gaveta aberta!', 'success');
        } catch (error) {
            showToast('Erro ao abrir gaveta', 'error');
        }
    };

    return (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">⚙️ Configuração de Hardware</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
                </div>

                {/* Abas */}
                <div className="flex gap-2 mb-6 border-b">
                    <button
                        onClick={() => setAbaAtiva('balanca')}
                        className={`px-6 py-3 font-semibold ${abaAtiva === 'balanca' ? 'border-b-2 border-verde-principal text-verde-principal' : 'text-gray-600'}`}
                    >
                        ⚖️ Balança
                    </button>
                    <button
                        onClick={() => setAbaAtiva('impressora')}
                        className={`px-6 py-3 font-semibold ${abaAtiva === 'impressora' ? 'border-b-2 border-verde-principal text-verde-principal' : 'text-gray-600'}`}
                    >
                        🖨️ Impressora
                    </button>
                </div>

                {/* Conteúdo - Balança */}
                {abaAtiva === 'balanca' && (
                    <div className="space-y-6">
                        {/* Status */}
                        <div className={`p-4 rounded-lg ${balancaConectada ? 'bg-verde-claro' : 'bg-gray-100'}`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-lg">
                                        {balancaConectada ? '✅ Balança Conectada' : '⚪ Balança Desconectada'}
                                    </h3>
                                    {balancaConectada && (
                                        <p className="text-sm text-gray-600">Marca: {marcaBalanca.toUpperCase()}</p>
                                    )}
                                </div>
                                {balancaConectada && (
                                    <div className="text-right">
                                        <p className="text-sm text-gray-600">Peso Atual</p>
                                        <p className="text-3xl font-bold text-verde-principal">
                                            {pesoAtual.toFixed(3)} kg
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Configuração */}
                        {!balancaConectada && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Marca da Balança
                                </label>
                                <select
                                    value={marcaBalanca}
                                    onChange={(e) => setMarcaBalanca(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                >
                                    <option value="toledo">Toledo (Prix 3, Prix 4, Prix 5, 8217)</option>
                                    <option value="filizola">Filizola (BP-15, BP-30, Platina)</option>
                                    <option value="urano">Urano (Pop-Z, Topmax, Integra)</option>
                                    <option value="ramuza">Ramuza (DP-15, DP-30)</option>
                                    <option value="lider">Líder (LD, LDB)</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-2">
                                    ℹ️ Todas homologadas pelo INMETRO
                                </p>
                            </div>
                        )}

                        {/* Botões de Ação */}
                        <div className="flex gap-3">
                            {!balancaConectada ? (
                                <button onClick={conectarBalanca} className="flex-1 btn-primary">
                                    🔌 Conectar Balança
                                </button>
                            ) : (
                                <>
                                    <button onClick={lerPeso} className="flex-1 btn-primary">
                                        ⚖️ Ler Peso
                                    </button>
                                    <button
                                        onClick={toggleLeituraAutomatica}
                                        className={`flex-1 ${leituraAtiva ? 'bg-orange-500 hover:bg-orange-600' : 'bg-verde-principal hover:bg-verde-escuro'} text-white px-4 py-2 rounded-lg font-semibold`}
                                    >
                                        {leituraAtiva ? '⏸️ Parar Leitura' : '▶️ Leitura Contínua'}
                                    </button>
                                    <button onClick={desconectarBalanca} className="flex-1 btn-danger">
                                        🔌 Desconectar
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Instruções */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-bold text-blue-800 mb-2">📘 Como usar:</h4>
                            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                                <li>Conecte a balança na porta USB do computador</li>
                                <li>Selecione a marca correta acima</li>
                                <li>Clique em "Conectar Balança"</li>
                                <li>Selecione a porta USB na janela que aparecer</li>
                                <li>Use "Leitura Contínua" para atualizar peso automaticamente</li>
                            </ol>
                        </div>
                    </div>
                )}

                {/* Conteúdo - Impressora */}
                {abaAtiva === 'impressora' && (
                    <div className="space-y-6">
                        {/* Status */}
                        <div className={`p-4 rounded-lg ${impressoraConectada ? 'bg-verde-claro' : 'bg-gray-100'}`}>
                            <h3 className="font-bold text-lg">
                                {impressoraConectada ? '✅ Impressora Conectada' : '⚪ Impressora Desconectada'}
                            </h3>
                            {impressoraConectada && (
                                <p className="text-sm text-gray-600">Marca: {marcaImpressora.toUpperCase()}</p>
                            )}
                        </div>

                        {/* Configuração */}
                        {!impressoraConectada && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Marca da Impressora
                                </label>
                                <select
                                    value={marcaImpressora}
                                    onChange={(e) => setMarcaImpressora(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                >
                                    <option value="bematech">Bematech (MP-4200, MP-100, MP-2800)</option>
                                    <option value="elgin">Elgin (i9, i7, L42 PRO)</option>
                                    <option value="daruma">Daruma (DR-800, DR-700)</option>
                                    <option value="epson">Epson (TM-T20, TM-T88)</option>
                                    <option value="sweda">Sweda (SI-300, SI-250)</option>
                                    <option value="diebold">Diebold (TSP100, IM113)</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-2">
                                    ℹ️ Impressoras térmicas homologadas
                                </p>
                            </div>
                        )}

                        {/* Botões de Ação */}
                        <div className="flex gap-3">
                            {!impressoraConectada ? (
                                <button onClick={conectarImpressora} className="flex-1 btn-primary">
                                    🔌 Conectar Impressora
                                </button>
                            ) : (
                                <>
                                    <button onClick={testarImpressora} className="flex-1 btn-primary">
                                        🖨️ Teste de Impressão
                                    </button>
                                    <button onClick={abrirGaveta} className="flex-1 btn-warning">
                                        💰 Abrir Gaveta
                                    </button>
                                    <button onClick={desconectarImpressora} className="flex-1 btn-danger">
                                        🔌 Desconectar
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Instruções */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-bold text-blue-800 mb-2">📘 Como usar:</h4>
                            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                                <li>Conecte a impressora na porta USB do computador</li>
                                <li>Ligue a impressora</li>
                                <li>Selecione a marca correta acima</li>
                                <li>Clique em "Conectar Impressora"</li>
                                <li>Selecione a porta USB na janela que aparecer</li>
                                <li>Faça um teste de impressão</li>
                            </ol>
                            
                            <div className="mt-4 pt-4 border-t border-blue-200">
                                <p className="text-sm text-blue-700 font-semibold mb-2">
                                    ✅ Cupom não fiscal será impresso automaticamente após finalizar cada venda!
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// ========================================
// EXPORTAR PARA USO GLOBAL
// ========================================
window.ModalConfigHardware = ModalConfigHardware;
window.balancaGlobal = balancaGlobal;
window.impressoraGlobal = impressoraGlobal;

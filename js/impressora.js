// ========================================
// FRESH FARE POS - MÓDULO DE IMPRESSORAS TÉRMICAS
// WebSerial API + ESC/POS - Chrome/Edge
// ========================================

class ImpressoraTermica {
    constructor() {
        this.porta = null;
        this.escritor = null;
        this.conectado = false;
        this.marca = null;
        this.modelo = null;
        this.larguraPapel = 48; // caracteres (papel 80mm)
        
        // Verifica se navegador suporta WebSerial
        this.suportado = 'serial' in navigator;
    }

    // ========================================
    // COMANDOS ESC/POS (Padrão de mercado)
    // ========================================
    
    ESC = 0x1B;
    GS = 0x1D;
    LF = 0x0A;
    CR = 0x0D;
    
    comandos = {
        // Inicialização
        INICIALIZAR: [this.ESC, 0x40],
        
        // Alinhamento
        ALINHAR_ESQUERDA: [this.ESC, 0x61, 0x00],
        ALINHAR_CENTRO: [this.ESC, 0x61, 0x01],
        ALINHAR_DIREITA: [this.ESC, 0x61, 0x02],
        
        // Enfatizar/Negrito
        ENFASE_ON: [this.ESC, 0x45, 0x01],
        ENFASE_OFF: [this.ESC, 0x45, 0x00],
        
        // Tamanho da fonte
        FONTE_NORMAL: [this.ESC, 0x21, 0x00],
        FONTE_DUPLA_ALTURA: [this.ESC, 0x21, 0x10],
        FONTE_DUPLA_LARGURA: [this.ESC, 0x21, 0x20],
        FONTE_DUPLA: [this.ESC, 0x21, 0x30],
        
        // Cortar papel
        CORTAR_TOTAL: [this.GS, 0x56, 0x00],
        CORTAR_PARCIAL: [this.GS, 0x56, 0x01],
        
        // Gaveta de dinheiro
        ABRIR_GAVETA: [this.ESC, 0x70, 0x00, 0x19, 0xFA],
        
        // Pular linhas
        PULAR_LINHA: [this.LF],
        PULAR_2_LINHAS: [this.LF, this.LF],
        PULAR_3_LINHAS: [this.LF, this.LF, this.LF],
        
        // Código de barras
        CODIGO_BARRAS_EAN13: [this.GS, 0x6B, 0x02],
        
        // QR Code
        QRCODE_TAMANHO: [this.GS, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x43],
        QRCODE_NIVEL: [this.GS, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x45, 0x31],
        
        // Buzzer (bip)
        BUZZER: [this.ESC, 0x42, 0x05, 0x09]
    };

    // ========================================
    // CONFIGURAÇÕES POR MARCA
    // ========================================
    
    configuracoes = {
        // BEMATECH - MP-4200, MP-100, MP-2800
        bematech: {
            baudRate: 9600,
            dataBits: 8,
            stopBits: 1,
            parity: 'none',
            larguraPapel: 48, // 80mm
            suportaGaveta: true,
            comandoEspecifico: null
        },
        
        // ELGIN - i9, i7, L42 PRO
        elgin: {
            baudRate: 115200,
            dataBits: 8,
            stopBits: 1,
            parity: 'none',
            larguraPapel: 48,
            suportaGaveta: true,
            comandoEspecifico: null
        },
        
        // DARUMA - DR-800, DR-700
        daruma: {
            baudRate: 9600,
            dataBits: 8,
            stopBits: 1,
            parity: 'none',
            larguraPapel: 48,
            suportaGaveta: true,
            comandoEspecifico: null
        },
        
        // EPSON - TM-T20, TM-T88
        epson: {
            baudRate: 9600,
            dataBits: 8,
            stopBits: 1,
            parity: 'none',
            larguraPapel: 48,
            suportaGaveta: true,
            comandoEspecifico: null
        },
        
        // SWEDA - SI-300, SI-250
        sweda: {
            baudRate: 9600,
            dataBits: 8,
            stopBits: 1,
            parity: 'none',
            larguraPapel: 48,
            suportaGaveta: true,
            comandoEspecifico: null
        },
        
        // DIEBOLD - TSP100, IM113
        diebold: {
            baudRate: 9600,
            dataBits: 8,
            stopBits: 1,
            parity: 'none',
            larguraPapel: 48,
            suportaGaveta: true,
            comandoEspecifico: null
        }
    };

    // ========================================
    // CONECTAR COM A IMPRESSORA
    // ========================================
    async conectar(marca = 'bematech') {
        if (!this.suportado) {
            throw new Error('Navegador não suporta WebSerial API. Use Chrome ou Edge.');
        }

        try {
            // Solicitar permissão para acessar porta serial
            this.porta = await navigator.serial.requestPort();
            
            this.marca = marca.toLowerCase();
            const config = this.configuracoes[this.marca];
            
            if (!config) {
                throw new Error(`Marca ${marca} não suportada. Use: bematech, elgin, daruma, epson, sweda, diebold`);
            }

            // Abrir porta com configurações da impressora
            await this.porta.open({
                baudRate: config.baudRate,
                dataBits: config.dataBits,
                stopBits: config.stopBits,
                parity: config.parity
            });

            // Configurar escritor
            this.escritor = this.porta.writable.getWriter();
            
            this.larguraPapel = config.larguraPapel;
            this.conectado = true;
            
            // Inicializar impressora
            await this.inicializar();
            
            console.log(`✅ Impressora ${marca} conectada com sucesso!`);
            
            return true;
        } catch (error) {
            console.error('Erro ao conectar impressora:', error);
            throw error;
        }
    }

    // ========================================
    // DESCONECTAR IMPRESSORA
    // ========================================
    async desconectar() {
        try {
            if (this.escritor) {
                await this.escritor.close();
                this.escritor.releaseLock();
            }
            
            if (this.porta) {
                await this.porta.close();
            }
            
            this.conectado = false;
            console.log('✅ Impressora desconectada');
        } catch (error) {
            console.error('Erro ao desconectar:', error);
        }
    }

    // ========================================
    // COMANDOS BÁSICOS
    // ========================================
    
    async enviarComando(comando) {
        if (!this.conectado) {
            throw new Error('Impressora não conectada');
        }
        
        const buffer = new Uint8Array(comando);
        await this.escritor.write(buffer);
    }
    
    async inicializar() {
        await this.enviarComando(this.comandos.INICIALIZAR);
    }
    
    async imprimirTexto(texto) {
        const encoder = new TextEncoder();
        const dados = encoder.encode(texto);
        await this.escritor.write(dados);
    }
    
    async pularLinha(quantidade = 1) {
        for (let i = 0; i < quantidade; i++) {
            await this.enviarComando(this.comandos.PULAR_LINHA);
        }
    }
    
    async alinharEsquerda() {
        await this.enviarComando(this.comandos.ALINHAR_ESQUERDA);
    }
    
    async alinharCentro() {
        await this.enviarComando(this.comandos.ALINHAR_CENTRO);
    }
    
    async alinharDireita() {
        await this.enviarComando(this.comandos.ALINHAR_DIREITA);
    }
    
    async enfatizar(ativo = true) {
        await this.enviarComando(ativo ? this.comandos.ENFASE_ON : this.comandos.ENFASE_OFF);
    }
    
    async fonteNormal() {
        await this.enviarComando(this.comandos.FONTE_NORMAL);
    }
    
    async fonteDupla() {
        await this.enviarComando(this.comandos.FONTE_DUPLA);
    }
    
    async cortarPapel(parcial = false) {
        await this.enviarComando(parcial ? this.comandos.CORTAR_PARCIAL : this.comandos.CORTAR_TOTAL);
    }
    
    async abrirGaveta() {
        const config = this.configuracoes[this.marca];
        if (config && config.suportaGaveta) {
            await this.enviarComando(this.comandos.ABRIR_GAVETA);
        }
    }
    
    async bip() {
        await this.enviarComando(this.comandos.BUZZER);
    }

    // ========================================
    // IMPRESSÃO DE LINHA COM FORMATAÇÃO
    // ========================================
    
    async imprimirLinha(texto, alinhamento = 'esquerda') {
        if (alinhamento === 'centro') {
            await this.alinharCentro();
        } else if (alinhamento === 'direita') {
            await this.alinharDireita();
        } else {
            await this.alinharEsquerda();
        }
        
        await this.imprimirTexto(texto);
        await this.pularLinha();
    }
    
    // Imprimir linha com texto à esquerda e valor à direita
    async imprimirLinhaDupla(textoEsq, textoDir) {
        await this.alinharEsquerda();
        
        const espacos = this.larguraPapel - textoEsq.length - textoDir.length;
        const linha = textoEsq + ' '.repeat(Math.max(0, espacos)) + textoDir;
        
        await this.imprimirTexto(linha);
        await this.pularLinha();
    }
    
    // Imprimir linha de separação
    async imprimirSeparador(caractere = '=') {
        await this.alinharEsquerda();
        await this.imprimirTexto(caractere.repeat(this.larguraPapel));
        await this.pularLinha();
    }

    // ========================================
    // IMPRESSÃO DE CUPOM NÃO FISCAL
    // ========================================
    
    async imprimirCupomNaoFiscal(dados) {
        try {
            // Cabeçalho
            await this.alinharCentro();
            await this.fonteDupla();
            await this.enfatizar(true);
            await this.imprimirTexto(dados.nomeEstabelecimento || 'HORTIFRUTI BOM PREÇO');
            await this.pularLinha();
            await this.enfatizar(false);
            await this.fonteNormal();
            
            await this.imprimirSeparador();
            
            // Dados do estabelecimento
            if (dados.cnpj) {
                await this.imprimirLinha(`CNPJ: ${dados.cnpj}`, 'centro');
            }
            if (dados.endereco) {
                await this.imprimirLinha(dados.endereco, 'centro');
            }
            if (dados.telefone) {
                await this.imprimirLinha(`Tel: ${dados.telefone}`, 'centro');
            }
            
            await this.imprimirSeparador();
            await this.imprimirLinha('CUPOM NÃO FISCAL', 'centro');
            await this.pularLinha();
            
            // Data, hora, caixa
            const agora = new Date();
            const data = agora.toLocaleDateString('pt-BR');
            const hora = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            
            await this.imprimirLinha(`Data: ${data}  Hora: ${hora}`, 'esquerda');
            await this.imprimirLinha(`Caixa: ${dados.caixaId || '001'}  Operador: ${dados.operador || 'Sistema'}`, 'esquerda');
            await this.pularLinha();
            
            // Cabeçalho dos itens
            await this.imprimirLinha('ITEM  DESCRIÇÃO      QTD  VL.UN  TOTAL', 'esquerda');
            await this.imprimirSeparador('-');
            
            // Itens da venda
            let subtotal = 0;
            dados.itens.forEach((item, index) => {
                const num = String(index + 1).padStart(3, '0');
                const desc = item.descricao.substring(0, 15).padEnd(15);
                const qtd = `${item.quantidade.toFixed(3)}${item.tipo}`.padStart(7);
                const vlUn = item.precoUnitario.toFixed(2).padStart(5);
                const total = item.subtotal.toFixed(2).padStart(6);
                
                const linha = `${num}   ${desc} ${qtd} ${vlUn} ${total}`;
                this.imprimirTexto(linha);
                this.pularLinha();
                
                subtotal += item.subtotal;
            });
            
            await this.imprimirSeparador('-');
            
            // Totais
            await this.imprimirLinhaDupla('SUBTOTAL:', `R$ ${subtotal.toFixed(2)}`);
            
            if (dados.desconto && dados.desconto > 0) {
                await this.imprimirLinhaDupla('DESCONTO:', `R$ ${dados.desconto.toFixed(2)}`);
            }
            
            await this.imprimirSeparador('-');
            
            const total = subtotal - (dados.desconto || 0);
            await this.enfatizar(true);
            await this.imprimirLinhaDupla('TOTAL:', `R$ ${total.toFixed(2)}`);
            await this.enfatizar(false);
            
            await this.pularLinha();
            
            // Forma de pagamento
            await this.imprimirLinha(`FORMA PAGAMENTO: ${dados.formaPagamento}`, 'esquerda');
            
            if (dados.formaPagamento === 'DINHEIRO' && dados.valorRecebido) {
                await this.imprimirLinhaDupla('VALOR RECEBIDO:', `R$ ${dados.valorRecebido.toFixed(2)}`);
                const troco = dados.valorRecebido - total;
                if (troco > 0) {
                    await this.imprimirLinhaDupla('TROCO:', `R$ ${troco.toFixed(2)}`);
                }
            }
            
            await this.pularLinha();
            await this.imprimirSeparador();
            
            // Rodapé
            await this.alinharCentro();
            await this.imprimirLinha('Obrigado pela preferência!', 'centro');
            await this.imprimirLinha('Volte sempre!', 'centro');
            await this.imprimirSeparador();
            
            // QR Code (se tiver PIX)
            if (dados.pixQRCode) {
                await this.imprimirLinha('PIX:', 'centro');
                // Comandos para QR Code aqui (implementação avançada)
                await this.pularLinha(2);
            }
            
            // Pular linhas antes de cortar
            await this.pularLinha(3);
            
            // Cortar papel
            await this.cortarPapel(false);
            
            // Bip de confirmação
            await this.bip();
            
            console.log('✅ Cupom impresso com sucesso!');
            
        } catch (error) {
            console.error('Erro ao imprimir cupom:', error);
            throw error;
        }
    }

    // ========================================
    // UTILITÁRIOS
    // ========================================
    
    estaConectado() {
        return this.conectado;
    }
    
    getMarca() {
        return this.marca;
    }
    
    getLarguraPapel() {
        return this.larguraPapel;
    }
}

// ========================================
// EXPORTAR PARA USO GLOBAL
// ========================================
window.ImpressoraTermica = ImpressoraTermica;

// ========================================
// EXEMPLO DE USO
// ========================================
/*
// 1. Criar instância
const impressora = new ImpressoraTermica();

// 2. Conectar
await impressora.conectar('bematech'); // ou 'elgin', 'daruma', etc

// 3. Imprimir cupom
await impressora.imprimirCupomNaoFiscal({
    nomeEstabelecimento: 'HORTIFRUTI BOM PREÇO',
    cnpj: '12.345.678/0001-90',
    endereco: 'Rua das Flores, 123 - Centro',
    telefone: '(11) 1234-5678',
    caixaId: '001',
    operador: 'João Silva',
    itens: [
        {
            descricao: 'Tomate',
            quantidade: 1.5,
            tipo: 'kg',
            precoUnitario: 8.90,
            subtotal: 13.35
        },
        {
            descricao: 'Banana',
            quantidade: 2.0,
            tipo: 'kg',
            precoUnitario: 5.90,
            subtotal: 11.80
        }
    ],
    desconto: 0,
    formaPagamento: 'DINHEIRO',
    valorRecebido: 30.00
});

// 4. Abrir gaveta
await impressora.abrirGaveta();

// 5. Desconectar
await impressora.desconectar();
*/

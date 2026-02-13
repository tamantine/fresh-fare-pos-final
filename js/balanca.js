// ========================================
// FRESH FARE POS - MÓDULO DE BALANÇAS
// WebSerial API - Chrome/Edge
// ========================================

class BalancaSerial {
    constructor() {
        this.porta = null;
        this.leitor = null;
        this.escritor = null;
        this.conectado = false;
        this.marca = null;
        this.modelo = null;
        this.ultimoPeso = 0;
        this.leituraAutomatica = false;
        
        // Verifica se navegador suporta WebSerial
        this.suportado = 'serial' in navigator;
    }

    // ========================================
    // PROTOCOLOS DAS BALANÇAS HOMOLOGADAS INMETRO
    // ========================================
    
    protocolos = {
        // TOLEDO - Prix 3, Prix 4, Prix 5, 8217
        toledo: {
            baudRate: 9600,
            dataBits: 8,
            stopBits: 1,
            parity: 'none',
            comando: new Uint8Array([0x05]), // ENQ - Solicitar peso
            parseResposta: (dados) => {
                // Protocolo Toledo: STX(02) + 6 dígitos peso + ETX(03)
                // Ex: 02 001234 03 = 1.234 kg
                const texto = new TextDecoder().decode(dados);
                const match = texto.match(/\x02(\d{6})\x03/);
                if (match) {
                    const peso = parseInt(match[1]) / 1000; // Converte para kg
                    return peso;
                }
                return null;
            }
        },

        // FILIZOLA - BP-15, BP-30, Platina
        filizola: {
            baudRate: 9600,
            dataBits: 8,
            stopBits: 1,
            parity: 'none',
            comando: new Uint8Array([0x05]), // ENQ
            parseResposta: (dados) => {
                // Protocolo Filizola: similar ao Toledo
                const texto = new TextDecoder().decode(dados);
                const match = texto.match(/(\d{6})/);
                if (match) {
                    const peso = parseInt(match[1]) / 1000;
                    return peso;
                }
                return null;
            }
        },

        // URANO - Pop-Z, Topmax, Integra
        urano: {
            baudRate: 9600,
            dataBits: 7,
            stopBits: 1,
            parity: 'even',
            comando: new Uint8Array([0x05]),
            parseResposta: (dados) => {
                const texto = new TextDecoder().decode(dados);
                const match = texto.match(/\x02(\d{6})\x03/);
                if (match) {
                    return parseInt(match[1]) / 1000;
                }
                return null;
            }
        },

        // RAMUZA - DP-15, DP-30
        ramuza: {
            baudRate: 9600,
            dataBits: 8,
            stopBits: 1,
            parity: 'none',
            comando: new Uint8Array([0x05]),
            parseResposta: (dados) => {
                const texto = new TextDecoder().decode(dados);
                const match = texto.match(/(\d{6})/);
                if (match) {
                    return parseInt(match[1]) / 1000;
                }
                return null;
            }
        },

        // LÍDER - Balança LD, LDB
        lider: {
            baudRate: 9600,
            dataBits: 8,
            stopBits: 1,
            parity: 'none',
            comando: new Uint8Array([0x05]),
            parseResposta: (dados) => {
                const texto = new TextDecoder().decode(dados);
                const match = texto.match(/\x02(\d{6})\x03/);
                if (match) {
                    return parseInt(match[1]) / 1000;
                }
                return null;
            }
        }
    };

    // ========================================
    // CONECTAR COM A BALANÇA
    // ========================================
    async conectar(marca = 'toledo') {
        if (!this.suportado) {
            throw new Error('Navegador não suporta WebSerial API. Use Chrome ou Edge.');
        }

        try {
            // Solicitar permissão para acessar porta serial
            this.porta = await navigator.serial.requestPort();
            
            this.marca = marca.toLowerCase();
            const config = this.protocolos[this.marca];
            
            if (!config) {
                throw new Error(`Marca ${marca} não suportada. Use: toledo, filizola, urano, ramuza ou lider`);
            }

            // Abrir porta com configurações da balança
            await this.porta.open({
                baudRate: config.baudRate,
                dataBits: config.dataBits,
                stopBits: config.stopBits,
                parity: config.parity
            });

            // Configurar leitor e escritor
            this.leitor = this.porta.readable.getReader();
            this.escritor = this.porta.writable.getWriter();
            
            this.conectado = true;
            console.log(`✅ Balança ${marca} conectada com sucesso!`);
            
            return true;
        } catch (error) {
            console.error('Erro ao conectar balança:', error);
            throw error;
        }
    }

    // ========================================
    // DESCONECTAR BALANÇA
    // ========================================
    async desconectar() {
        try {
            if (this.leitor) {
                await this.leitor.cancel();
                this.leitor.releaseLock();
            }
            
            if (this.escritor) {
                await this.escritor.close();
                this.escritor.releaseLock();
            }
            
            if (this.porta) {
                await this.porta.close();
            }
            
            this.conectado = false;
            this.leituraAutomatica = false;
            console.log('✅ Balança desconectada');
        } catch (error) {
            console.error('Erro ao desconectar:', error);
        }
    }

    // ========================================
    // LER PESO DA BALANÇA
    // ========================================
    async lerPeso() {
        if (!this.conectado) {
            throw new Error('Balança não conectada');
        }

        try {
            const config = this.protocolos[this.marca];
            
            // Enviar comando para solicitar peso
            await this.escritor.write(config.comando);
            
            // Aguardar resposta
            const { value, done } = await this.leitor.read();
            
            if (done) {
                throw new Error('Conexão perdida');
            }
            
            // Parse da resposta baseado no protocolo da marca
            const peso = config.parseResposta(value);
            
            if (peso !== null) {
                this.ultimoPeso = peso;
                return peso;
            }
            
            throw new Error('Erro ao ler peso da balança');
            
        } catch (error) {
            console.error('Erro ao ler peso:', error);
            throw error;
        }
    }

    // ========================================
    // LEITURA AUTOMÁTICA CONTÍNUA
    // ========================================
    async iniciarLeituraAutomatica(callback, intervalo = 500) {
        this.leituraAutomatica = true;
        
        while (this.leituraAutomatica && this.conectado) {
            try {
                const peso = await this.lerPeso();
                if (callback) {
                    callback(peso);
                }
            } catch (error) {
                console.error('Erro na leitura automática:', error);
            }
            
            // Aguardar intervalo antes da próxima leitura
            await new Promise(resolve => setTimeout(resolve, intervalo));
        }
    }

    pararLeituraAutomatica() {
        this.leituraAutomatica = false;
    }

    // ========================================
    // UTILITÁRIOS
    // ========================================
    
    estaConectado() {
        return this.conectado;
    }
    
    getUltimoPeso() {
        return this.ultimoPeso;
    }
    
    getMarca() {
        return this.marca;
    }
    
    // Formatar peso para exibição
    formatarPeso(peso) {
        return `${peso.toFixed(3)} kg`;
    }
    
    // Verificar se peso está estável (tolerância de 5g)
    pesoEstavel(pesoNovo, pesoAntigo, tolerancia = 0.005) {
        return Math.abs(pesoNovo - pesoAntigo) <= tolerancia;
    }
}

// ========================================
// EXPORTAR PARA USO GLOBAL
// ========================================
window.BalancaSerial = BalancaSerial;

// ========================================
// EXEMPLO DE USO
// ========================================
/*
// 1. Criar instância
const balanca = new BalancaSerial();

// 2. Verificar suporte
if (balanca.suportado) {
    console.log('✅ Navegador suporta balanças');
} else {
    console.log('❌ Use Chrome ou Edge');
}

// 3. Conectar (usuário escolhe porta USB)
await balanca.conectar('toledo'); // ou 'filizola', 'urano', etc

// 4. Ler peso único
const peso = await balanca.lerPeso();
console.log(`Peso: ${peso} kg`);

// 5. OU leitura automática contínua
balanca.iniciarLeituraAutomatica((peso) => {
    console.log(`Peso atual: ${peso} kg`);
    document.getElementById('peso-display').textContent = peso.toFixed(3);
});

// 6. Parar leitura automática
balanca.pararLeituraAutomatica();

// 7. Desconectar
await balanca.desconectar();
*/

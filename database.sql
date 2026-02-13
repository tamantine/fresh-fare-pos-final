-- =============================================
-- FRESH FARE POS - SCRIPTS SUPABASE
-- Sistema de PDV para Hortifruti
-- =============================================

-- =============================================
-- 1. CRIAR TABELAS
-- =============================================

-- Tabela: produtos
CREATE TABLE IF NOT EXISTS produtos (
  id BIGSERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  codigo_barras VARCHAR(100) UNIQUE,
  categoria VARCHAR(100) NOT NULL,
  tipo_venda VARCHAR(10) NOT NULL CHECK (tipo_venda IN ('KG', 'UN', 'CX', 'LT')),
  preco_venda DECIMAL(10,2) NOT NULL CHECK (preco_venda >= 0),
  custo_nota DECIMAL(10,2) DEFAULT 0 CHECK (custo_nota >= 0),
  quebra_perda DECIMAL(5,2) DEFAULT 0 CHECK (quebra_perda >= 0 AND quebra_perda <= 100),
  margem_lucro DECIMAL(5,2) DEFAULT 0 CHECK (margem_lucro >= 0),
  estoque_atual INTEGER DEFAULT 0 CHECK (estoque_atual >= 0),
  estoque_minimo INTEGER DEFAULT 0 CHECK (estoque_minimo >= 0),
  compra_caixa_fechada BOOLEAN DEFAULT false,
  ativo BOOLEAN DEFAULT true,
  data_cadastro TIMESTAMP DEFAULT NOW(),
  data_atualizacao TIMESTAMP DEFAULT NOW()
);

-- Tabela: vendas
CREATE TABLE IF NOT EXISTS vendas (
  id BIGSERIAL PRIMARY KEY,
  caixa_id VARCHAR(50) NOT NULL,
  data_venda TIMESTAMP DEFAULT NOW(),
  subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
  descontos DECIMAL(10,2) DEFAULT 0 CHECK (descontos >= 0),
  total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
  forma_pagamento VARCHAR(50) CHECK (forma_pagamento IN ('DINHEIRO', 'CREDITO', 'DEBITO', 'PIX', 'OUTRO')),
  status VARCHAR(20) DEFAULT 'FINALIZADA' CHECK (status IN ('FINALIZADA', 'CANCELADA')),
  observacoes TEXT
);

-- Tabela: itens_venda
CREATE TABLE IF NOT EXISTS itens_venda (
  id BIGSERIAL PRIMARY KEY,
  venda_id BIGINT NOT NULL REFERENCES vendas(id) ON DELETE CASCADE,
  produto_id BIGINT REFERENCES produtos(id),
  descricao_produto VARCHAR(255) NOT NULL,
  quantidade DECIMAL(10,3) NOT NULL CHECK (quantidade > 0),
  preco_unitario DECIMAL(10,2) NOT NULL CHECK (preco_unitario >= 0),
  subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
  tipo_venda VARCHAR(10) NOT NULL
);

-- Tabela: caixas
CREATE TABLE IF NOT EXISTS caixas (
  id VARCHAR(50) PRIMARY KEY,
  data_abertura TIMESTAMP NOT NULL,
  data_fechamento TIMESTAMP,
  valor_abertura DECIMAL(10,2) DEFAULT 0 CHECK (valor_abertura >= 0),
  valor_fechamento DECIMAL(10,2) CHECK (valor_fechamento >= 0),
  status VARCHAR(20) DEFAULT 'ABERTO' CHECK (status IN ('ABERTO', 'FECHADO')),
  responsavel VARCHAR(100)
);

-- Tabela: categorias
CREATE TABLE IF NOT EXISTS categorias (
  id BIGSERIAL PRIMARY KEY,
  nome VARCHAR(100) UNIQUE NOT NULL,
  descricao TEXT,
  ativo BOOLEAN DEFAULT true
);

-- =============================================
-- 2. CRIAR ÍNDICES PARA MELHOR PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_produtos_codigo_barras ON produtos(codigo_barras);
CREATE INDEX IF NOT EXISTS idx_produtos_nome ON produtos(nome);
CREATE INDEX IF NOT EXISTS idx_produtos_categoria ON produtos(categoria);
CREATE INDEX IF NOT EXISTS idx_produtos_ativo ON produtos(ativo);

CREATE INDEX IF NOT EXISTS idx_vendas_data ON vendas(data_venda);
CREATE INDEX IF NOT EXISTS idx_vendas_caixa ON vendas(caixa_id);
CREATE INDEX IF NOT EXISTS idx_vendas_status ON vendas(status);

CREATE INDEX IF NOT EXISTS idx_itens_venda_venda_id ON itens_venda(venda_id);
CREATE INDEX IF NOT EXISTS idx_itens_venda_produto_id ON itens_venda(produto_id);

-- =============================================
-- 3. INSERIR CATEGORIAS PADRÃO
-- =============================================

INSERT INTO categorias (nome, descricao) VALUES
('Frutas', 'Frutas frescas e sazonais'),
('Verduras', 'Verduras e folhas'),
('Legumes', 'Legumes diversos'),
('Temperos', 'Temperos e ervas'),
('Outros', 'Outros produtos')
ON CONFLICT (nome) DO NOTHING;

-- =============================================
-- 4. INSERIR PRODUTOS DE EXEMPLO
-- =============================================

INSERT INTO produtos (nome, codigo_barras, categoria, tipo_venda, preco_venda, custo_nota, quebra_perda, margem_lucro, estoque_atual, estoque_minimo) VALUES
-- Frutas
('Banana Prata', '7891000001000', 'Frutas', 'KG', 5.90, 3.50, 15.00, 50.00, 100, 20),
('Maçã Gala', '7891000001001', 'Frutas', 'KG', 7.90, 4.80, 10.00, 45.00, 80, 15),
('Laranja Lima', '7891000001002', 'Frutas', 'KG', 4.50, 2.60, 12.00, 50.00, 120, 25),
('Melancia', '7891000001003', 'Frutas', 'KG', 3.90, 2.20, 8.00, 55.00, 50, 10),
('Manga Tommy', '7891000001004', 'Frutas', 'KG', 6.90, 4.00, 18.00, 48.00, 60, 12),
('Uva Itália', '7891000001005', 'Frutas', 'KG', 12.90, 7.50, 15.00, 50.00, 40, 8),
('Abacaxi Pérola', '7891000001006', 'Frutas', 'UN', 6.90, 4.20, 12.00, 45.00, 35, 8),
('Mamão Papaia', '7891000001007', 'Frutas', 'KG', 5.50, 3.30, 14.00, 48.00, 45, 10),

-- Verduras
('Alface Crespa', '7891000002000', 'Verduras', 'UN', 3.50, 2.00, 20.00, 55.00, 40, 8),
('Alface Americana', '7891000002001', 'Verduras', 'UN', 4.50, 2.80, 18.00, 50.00, 35, 7),
('Rúcula', '7891000002002', 'Verduras', 'UN', 3.90, 2.30, 22.00, 52.00, 30, 6),
('Agrião', '7891000002003', 'Verduras', 'UN', 3.50, 2.00, 25.00, 55.00, 25, 5),
('Couve Manteiga', '7891000002004', 'Verduras', 'UN', 2.90, 1.60, 20.00, 60.00, 50, 10),
('Espinafre', '7891000002005', 'Verduras', 'UN', 3.90, 2.30, 23.00, 52.00, 28, 6),

-- Legumes
('Tomate Italiano', '7891000003000', 'Legumes', 'KG', 8.90, 5.20, 18.00, 50.00, 80, 15),
('Tomate Cereja', '7891000003001', 'Legumes', 'KG', 12.90, 7.80, 15.00, 48.00, 40, 8),
('Cenoura', '7891000003002', 'Legumes', 'KG', 3.90, 2.20, 12.00, 55.00, 90, 18),
('Batata Inglesa', '7891000003003', 'Legumes', 'KG', 4.50, 2.80, 10.00, 50.00, 100, 20),
('Cebola', '7891000003004', 'Legumes', 'KG', 5.90, 3.50, 15.00, 52.00, 85, 17),
('Pimentão Verde', '7891000003005', 'Legumes', 'KG', 9.90, 5.80, 16.00, 50.00, 45, 9),
('Abobrinha', '7891000003006', 'Legumes', 'KG', 6.90, 4.00, 14.00, 50.00, 55, 11),
('Berinjela', '7891000003007', 'Legumes', 'KG', 7.90, 4.60, 15.00, 50.00, 40, 8),

-- Temperos
('Salsinha Maço', '7891000004000', 'Temperos', 'UN', 2.50, 1.30, 25.00, 65.00, 30, 6),
('Cebolinha Maço', '7891000004001', 'Temperos', 'UN', 2.50, 1.30, 25.00, 65.00, 30, 6),
('Coentro Maço', '7891000004002', 'Temperos', 'UN', 2.90, 1.60, 25.00, 60.00, 25, 5),
('Alho', '7891000004003', 'Temperos', 'KG', 28.90, 18.00, 12.00, 48.00, 20, 5),
('Gengibre', '7891000004004', 'Temperos', 'KG', 15.90, 9.50, 14.00, 50.00, 15, 3)

ON CONFLICT (codigo_barras) DO NOTHING;

-- =============================================
-- 5. CRIAR TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA
-- =============================================

-- Trigger para atualizar data_atualizacao em produtos
CREATE OR REPLACE FUNCTION atualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.data_atualizacao = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_atualizar_produto
    BEFORE UPDATE ON produtos
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_timestamp();

-- =============================================
-- 6. VIEWS ÚTEIS
-- =============================================

-- View: Produtos com estoque baixo
CREATE OR REPLACE VIEW produtos_estoque_baixo AS
SELECT 
    id,
    nome,
    categoria,
    estoque_atual,
    estoque_minimo,
    tipo_venda,
    preco_venda
FROM produtos
WHERE estoque_atual <= estoque_minimo
  AND ativo = true
ORDER BY estoque_atual ASC;

-- View: Vendas do dia
CREATE OR REPLACE VIEW vendas_hoje AS
SELECT 
    v.*,
    COUNT(iv.id) as total_itens
FROM vendas v
LEFT JOIN itens_venda iv ON v.id = iv.venda_id
WHERE DATE(v.data_venda) = CURRENT_DATE
  AND v.status = 'FINALIZADA'
GROUP BY v.id
ORDER BY v.data_venda DESC;

-- View: Top produtos mais vendidos
CREATE OR REPLACE VIEW top_produtos_vendidos AS
SELECT 
    p.id,
    p.nome,
    p.categoria,
    SUM(iv.quantidade) as quantidade_total_vendida,
    SUM(iv.subtotal) as valor_total_vendido
FROM produtos p
JOIN itens_venda iv ON p.id = iv.produto_id
JOIN vendas v ON iv.venda_id = v.id
WHERE v.status = 'FINALIZADA'
  AND DATE(v.data_venda) >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY p.id, p.nome, p.categoria
ORDER BY quantidade_total_vendida DESC
LIMIT 20;

-- =============================================
-- 7. POLÍTICAS RLS (Row Level Security) - OPCIONAL
-- =============================================
-- Descomente se quiser ativar segurança em nível de linha

-- ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE vendas ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE itens_venda ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE caixas ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;

-- Política para leitura pública (permitir todos)
-- CREATE POLICY "Permitir leitura pública" ON produtos FOR SELECT USING (true);
-- CREATE POLICY "Permitir leitura pública" ON vendas FOR SELECT USING (true);
-- CREATE POLICY "Permitir leitura pública" ON itens_venda FOR SELECT USING (true);
-- CREATE POLICY "Permitir leitura pública" ON caixas FOR SELECT USING (true);
-- CREATE POLICY "Permitir leitura pública" ON categorias FOR SELECT USING (true);

-- =============================================
-- 8. FUNÇÕES AUXILIARES
-- =============================================

-- Função: Calcular total de vendas do dia
CREATE OR REPLACE FUNCTION total_vendas_dia(data_busca DATE DEFAULT CURRENT_DATE)
RETURNS DECIMAL(10,2) AS $$
BEGIN
    RETURN COALESCE(
        (SELECT SUM(total) FROM vendas 
         WHERE DATE(data_venda) = data_busca 
         AND status = 'FINALIZADA'),
        0
    );
END;
$$ LANGUAGE plpgsql;

-- Função: Contar vendas do dia
CREATE OR REPLACE FUNCTION contar_vendas_dia(data_busca DATE DEFAULT CURRENT_DATE)
RETURNS INTEGER AS $$
BEGIN
    RETURN COALESCE(
        (SELECT COUNT(*) FROM vendas 
         WHERE DATE(data_venda) = data_busca 
         AND status = 'FINALIZADA'),
        0
    );
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 9. CONSULTAS ÚTEIS PARA TESTES
-- =============================================

-- Ver todos os produtos
-- SELECT * FROM produtos ORDER BY nome;

-- Ver vendas de hoje
-- SELECT * FROM vendas_hoje;

-- Ver produtos com estoque baixo
-- SELECT * FROM produtos_estoque_baixo;

-- Ver total de vendas do dia
-- SELECT total_vendas_dia();

-- Ver quantidade de vendas do dia
-- SELECT contar_vendas_dia();

-- Ver top 10 produtos mais vendidos
-- SELECT * FROM top_produtos_vendidos LIMIT 10;

-- =============================================
-- SCRIPT FINALIZADO
-- Execute todo este arquivo no SQL Editor do Supabase
-- =============================================

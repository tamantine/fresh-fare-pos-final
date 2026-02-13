-- ========================================================
-- SCRIPT DE CORREÇÃO DE PERMISSÕES (RLS) - FRESH FARE POS
-- Execute este script no SQL Editor do Supabase
-- ========================================================

-- 1. GARANTIR QUE O RLS ESTÁ ATIVADO NAS TABELAS
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE itens_venda ENABLE ROW LEVEL SECURITY;
ALTER TABLE caixas ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;

-- 2. CRIAR POLÍTICAS DE ACESSO PARA A CHAVE ANÔNIMA (ANON)
-- Isso permite que o frontend (via CDN) opere sem autenticação JWT complexa

-- Tabela: produtos
DROP POLICY IF EXISTS "Acesso Total Anon" ON produtos;
CREATE POLICY "Acesso Total Anon" ON produtos FOR ALL TO anon USING (true) WITH CHECK (true);

-- Tabela: vendas
DROP POLICY IF EXISTS "Acesso Total Anon" ON vendas;
CREATE POLICY "Acesso Total Anon" ON vendas FOR ALL TO anon USING (true) WITH CHECK (true);

-- Tabela: itens_venda
DROP POLICY IF EXISTS "Acesso Total Anon" ON itens_venda;
CREATE POLICY "Acesso Total Anon" ON itens_venda FOR ALL TO anon USING (true) WITH CHECK (true);

-- Tabela: caixas
DROP POLICY IF EXISTS "Acesso Total Anon" ON caixas;
CREATE POLICY "Acesso Total Anon" ON caixas FOR ALL TO anon USING (true) WITH CHECK (true);

-- Tabela: categorias
DROP POLICY IF EXISTS "Acesso Total Anon" ON categorias;
CREATE POLICY "Acesso Total Anon" ON categorias FOR ALL TO anon USING (true) WITH CHECK (true);

-- 3. CONCEDER PERMISSÕES DE USO DO ESQUEMA PUBLIC
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- ========================================================
-- FIM DO SCRIPT - O PDV AGORA DEVE FUNCIONAR CORRETAMENTE
-- ========================================================

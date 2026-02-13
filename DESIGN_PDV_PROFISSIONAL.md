# Design do PDV Profissional - Fresh Fare POS

Com base na pesquisa de melhores práticas de PDV para grandes mercados e na identidade visual do Hortifruti Bom Preço, o novo design do PDV será focado em **agilidade, clareza e eficiência operacional**.

## 1. Layout Geral da Tela (PDV)

O layout será dividido em duas colunas principais, otimizando o espaço para as operações de venda e a visualização do carrinho:

| Área da Tela | Conteúdo Principal | Detalhes e Funcionalidades |
| :------------ | :----------------- | :------------------------- |
| **Coluna Esquerda (Operação)** | **Busca de Produtos** | Campo de busca unificado (código de barras, nome, ID) com foco automático. Sugestões de produtos em tempo real. |
|               | **Informações do Produto** | Exibição clara do produto selecionado (nome, preço, estoque). Campo para ajuste de quantidade. |
|               | **Ações Rápidas** | Botões para adicionar ao carrinho, aplicar desconto no item, remover item selecionado. |
| **Coluna Direita (Carrinho/Resumo)** | **Itens do Carrinho** | Lista clara e concisa dos produtos adicionados, com quantidade, preço unitário e subtotal. |
|               | **Resumo da Venda** | Total de itens, subtotal, desconto total, **TOTAL A PAGAR (destacado)**. |
|               | **Controles de Venda** | Botões para Cancelar Venda, Finalizar Pagamento (com atalho F6), e um painel de atalhos visível. |

## 2. Melhorias de Funcionalidade e UX

*   **Foco Automático na Busca**: O campo de busca de produtos terá foco automático ao carregar a tela do PDV, permitindo que o operador comece a digitar ou escanear imediatamente.
*   **Atalhos de Teclado Aprimorados**: Além dos atalhos existentes, serão implementados:
    *   `F1`: Foco no campo de busca.
    *   `Enter`: Adicionar produto ao carrinho (se um produto estiver selecionado) ou confirmar ação.
    *   `F6`: Abrir modal de pagamento.
    *   `F4` ou `Esc`: Limpar carrinho/Cancelar venda.
    *   `F12`: Editar quantidade do último item adicionado ou item selecionado no carrinho.
*   **Feedback Visual e Sonoro**: Confirmações visuais (toasts) e, se possível, feedback sonoro para ações críticas (item adicionado, venda finalizada, erro).
*   **Edição Rápida no Carrinho**: Ao clicar em um item no carrinho, ele poderá ser editado (quantidade) ou removido diretamente.
*   **Visualização de Estoque Mínimo**: Alerta visual para produtos com estoque abaixo do mínimo ao adicionar ao carrinho.

## 3. Identidade Visual e Estilo

*   **Paleta de Cores**: Manter o esquema de cores verde do Hortifruti Bom Preço (Verde Escuro, Verde Principal, Verde Claro) para botões de ação primária, destaques e fundo do sidebar. Usar vermelho para ações de cancelamento/perigo e amarelo/laranja para avisos ou pagamentos.
*   **Tipografia**: `Inter` ou `Roboto` (Sans-serif) para clareza e legibilidade em telas de PDV.
*   **Ícones**: Uso consistente de emojis ou ícones SVG simples para representar ações e categorias, mantendo a leveza e a familiaridade.
*   **Elementos de Destaque**: O **TOTAL A PAGAR** será o elemento mais proeminente na tela, com fonte maior e cor de destaque.

## 4. Estrutura do Código (app.js e style.css)

As alterações serão concentradas nos componentes `PDV` e `ModalPagamento` no `app.js`, e no `style.css` para o novo layout e estilos visuais. Serão criadas funções auxiliares para gerenciar os atalhos de teclado e a lógica de busca de produtos de forma mais robusta.

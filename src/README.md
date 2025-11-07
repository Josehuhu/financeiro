# Sistema de Gestão Financeira

Sistema completo de gestão de receitas e despesas com suporte a parcelamento, gráficos e integração com Supabase.

## ✨ Funcionalidades

### Gestão de Transações
- ✅ Criar receitas e despesas
- ✅ Parcelamento automático com divisão igual
- ✅ Ajuste individual de parcelas
- ✅ Edição e exclusão de transações
- ✅ Validação de pagamentos

### Visualizações
- 📊 **Gráficos de Pizza**: Visualize receitas e despesas pendentes vs pagas
- 📋 **Tabela Interativa**: Filtros por tipo, busca e ordenação
- 💰 **Cards de Resumo**: Visão geral do saldo e totais
- 📜 **Histórico de Pagamentos**: Veja todas as transações já pagas

### Recursos Avançados
- 🔄 Próxima parcela aparece automaticamente ao validar pagamento
- 🎯 Sistema de parcelas inteligente (resto vai para última parcela)
- 🔍 Filtros e busca em tempo real
- 📱 Design responsivo
- 💾 Persistência de dados com Supabase

## 🚀 Como Usar

### Criar Nova Transação
1. Clique no botão "Nova Transação"
2. Preencha as informações básicas (Nome, Tipo, Descrição)
3. Configure os detalhes financeiros (Valor, Parcelas, Data)
4. Opcionalmente, ajuste parcelas individualmente
5. Revise e confirme

### Validar Pagamento
1. Na aba "Transações Pendentes", encontre a parcela
2. Clique no ícone de validação (✓)
3. A parcela será marcada como paga
4. A próxima parcela aparecerá automaticamente (se houver)

### Visualizar Histórico
1. Clique na aba "Histórico de Pagamentos"
2. Veja todas as transações já pagas com datas e valores

### Entender os Gráficos
- **Gráfico Esquerdo**: Mostra receitas e despesas ainda pendentes
- **Gráfico Direito**: Mostra receitas e despesas já pagas
- Cada gráfico inclui o cálculo do saldo/resultado

## 💡 Dicas

- **Entrada (Down Payment)**: Use o ajuste individual de parcelas para definir uma entrada maior na primeira parcela
- **Monitoramento**: Os cards de resumo mostram o saldo pendente e o resultado das transações pagas
- **Filtros**: Use a busca para encontrar transações específicas rapidamente
- **Ordenação**: Clique nos cabeçalhos da tabela para ordenar

## 🔧 Detalhes Técnicos

- **Frontend**: React + TypeScript + Tailwind CSS
- **Componentes**: Shadcn/UI
- **Gráficos**: Recharts
- **Backend**: Supabase (Edge Functions + KV Store)
- **Notificações**: Sonner

---

**Desenvolvido com ❤️ para facilitar sua gestão financeira!**

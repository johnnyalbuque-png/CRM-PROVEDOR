# CRM Provedor — Notas do Projeto

## Integração WhatsApp (pendente de implementação)

Plano completo salvo em: `/root/.claude/plans/fizzy-coalescing-crab.md`

### Resumo do que será implementado:
- **Supabase Edge Function** (`supabase/functions/whatsapp-webhook/index.ts`) como receptor de webhook da Z-API
- **Campo `whatsapp`** na tabela `usuarios` + campo no formulário de usuários (index.html)
- **Comandos por mensagem:**
  - `gastei/paguei/gasto [valor] [descrição]` → cria Conta a Pagar
  - `lembrar/tarefa [título] dia DD/MM` → cria Tarefa
  - `saldo` → resumo financeiro do mês
  - `contas` → próximas contas a vencer (7 dias)
  - `tarefas` → tarefas pendentes de hoje/amanhã
  - `ajuda` → lista de comandos
  - Categoria não reconhecida → bot pergunta qual categoria usar
- **Bot proativo via pg_cron:**
  - 07h30 — resumo diário para cada usuário
  - 08h00 — alerta de contas a vencer no dia seguinte
  - 08h00 — lembrete de follow-ups agendados para hoje

### Pré-requisitos antes de implementar:
1. Conta Z-API com instância conectada (anotar Instance ID, Token, Client-Token)
2. Supabase CLI instalado (`npm install -g supabase`)
3. Deno instalado
4. Extensões pg_cron e pg_net habilitadas no Supabase

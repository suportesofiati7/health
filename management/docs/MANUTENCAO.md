# Manutenção para quem desenvolve

O sistema é uma aplicação React/Vite em `management/`. O site público continua
na raiz do repositório. A branch de trabalho é `Management`; não faça merge em
`main` sem aprovação explícita.

## Desenvolvimento local

```bash
cd management
npm install
npm run dev
```

Abra o endereço mostrado pelo Vite. Variáveis públicas ficam em
`management/.env` (crie a partir de `.env.example`); nunca coloque service role,
token de deploy ou segredo Turnstile no frontend.

## Verificação antes de qualquer deploy

```bash
npm test
npm run test:db
npm run build
npm run dev
MANAGEMENT_TEST_URL=http://127.0.0.1:5173 npm run test:browser
```

Os testes de browser usam fixtures fictícias. O teste SQL sobe um PostgreSQL
temporário e verifica RLS; ele não substitui uma validação no projeto remoto.

## Alterações de banco e funções

1. Adicione uma migration numerada em `supabase/migrations/`; nunca edite uma
   migration já aplicada em produção.
2. Atualize as Edge Functions em `supabase/functions/` quando uma operação
   precisar de service role, validação de arquivo, email ou escrita pública.
3. Atualize os testes SQL e browser para o contrato alterado.
4. Rode todas as verificações e revise `git diff` antes de commitar.

Estados persistidos, papéis e tipos de OTP são contratos: os valores de dados
estão em português (`proprietario`, `finalizado`, `pronto`), enquanto o Auth do
Supabase continua usando `invite` e `recovery` no protocolo de links.

## Configuração remota

Use apenas o projeto Supabase existente e o Pages project separado da clínica.
O roteiro completo está em `OPERATIONS.md`. Em resumo: aplicar migrations,
desativar signup público, configurar URLs/Auth, definir segredos das funções,
publicar funções, configurar Turnstile e fazer um smoke test com dados
fictícios. O domínio privado deve apontar para `management/dist`, nunca para a
raiz do site público.

## Diagnóstico e recuperação

- `docs/SECURITY.md`: papéis, RLS, arquivos e controles LGPD.
- `docs/RECOVERY.md`: exportação criptografada e ensaio de restauração.
- `docs/OPERATIONS.md`: configuração, publicação e gates de produção.
- `docs/AUDIT.md`: decisões de arquitetura e limites conhecidos.

Não use dados reais em fixtures, screenshots, testes ou logs. Não imprima
segredos. Backups e dumps devem ficar fora do Git, criptografados e com acesso
restrito. Em caso de incidente, preserve os logs de auditoria, suspenda a
conta afetada e siga o procedimento aprovado pela clínica.

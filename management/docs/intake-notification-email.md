# Notificação HTML de cadastro clínico — Franciele Sofiati

## Alterações incluídas
- Email HTML responsivo em português, com o **logotipo dourado FS oficial** do próprio repositório.
- Verde principal **`#526548`** (mesmo `--menu-green` do desktop, definido em `css/src/foundations/tokens.css`).
- Resumo do agendamento e **todas as respostas persistidas em `public_intakes.payload`**, agrupadas por finalidade e consentimento.
- **Arquivos enviados**: consulta à tabela `public_intake_files`, com nomes e tipos, sem divulgar links privados. O envio dos próprios arquivos pode ser habilitado explicitamente pela configuração `EMAIL_ATTACH_CLINICAL_FILES=true`.
- Alternativa `text` para clientes de email sem HTML; escape de HTML fornecido pelo paciente.
- Sem modificação na fila `claim_intake_notifications`, na chave de idempotência `intake-<id>`, nos destinatários ou nas regras de retentativa.

## Fontes dos dados
- `formulario.html` → `js/public-intake.js` → função `formulario` do Supabase → `public_intakes.payload`.
- Uploads ficam separados em `public_intake_files` e no bucket privado `intake-private`.

Quando `EMAIL_ATTACH_CLINICAL_FILES=true`, a Edge Function busca os arquivos no bucket privado `intake-private`, faz a codificação Base64 e envia os arquivos como anexos do mesmo email pelo Resend. Por segurança, mantém o envio desabilitado por padrão. Se o total de arquivos ultrapassar 20 MiB, algum arquivo não estiver disponível ou tiver metadados incorretos, o email é enviado **sem arquivos físicos**, mas com os nomes para consulta na área profissional. O teto operacional de 20 MiB dá margem ao limite de 40 MB dos anexos informado pelo Resend, depois de codificação. Essa configuração deve ser avaliada considerando a LGPD: cópias de documentos de identidade e registros de saúde passarão a existir também nas duas caixas de email.

Os textos integrais dos termos de procedimentos que ficam em `consent_texts` são textos estáticos, não respostas do paciente. O email apresenta os procedimentos selecionados e seus aceites, e encaminha à área profissional para consulta da versão integral. Campos técnicos como tokens e URLs privadas ficam excluídos.

## Logo
O endereço padrão usado é:
`https://francielesofiati.com/assets/brand/logotipo-franciele-sofiati-saude-da-pele-estetica-avancada-gleba-palhano.webp`

O arquivo correspondente já existe no repositório: `assets/brand/logotipo-franciele-sofiati-saude-da-pele-estetica-avancada-gleba-palhano.webp`.
Se a URL pública do ambiente implantado for diferente, defina o secret opcional `BRAND_GOLD_LOGO_URL` com o link HTTPS correto. Não é preciso incorporar imagens em base64 no e-mail.

## Implantação
1. Revisar e mesclar o pull request.
2. Executar os testes em `management`: `npm test`.
3. **Implantar a função Supabase** `intake-notifications` após a mesclagem; o commit GitHub isoladamente não garante o deploy da Edge Function.
4. Conferir secrets `RESEND_API_KEY`, `EMAIL_FROM` e `NOTIFICATION_WORKER_SECRET`; `BRAND_GOLD_LOGO_URL` é opcional. Para anexar os documentos reais ao email (e não apenas listar seus nomes), habilitar conscientemente `EMAIL_ATTACH_CLINICAL_FILES=true` no projeto Supabase.
5. Fazer um cadastro de teste com um PDF ou imagem pequena, conferir chegada do e-mail às duas caixas, conferir o arquivo físico se a opção estiver habilitada e verificar que a fila marca `sent`. Comprovar que o link exige autenticação. Testar o comportamento com arquivos maiores que o limite: o sistema deve enviar somente os nomes.

## Privacidade
Os destinatários receberão CPF e informações de saúde porque o relatório deve refletir todas as respostas salvas. Isso envolve dados sensíveis sob a LGPD: revisar necessidade e base legal, restringir acesso às caixas, aplicar 2FA e políticas de retenção, e evitar encaminhamentos automáticos.

# Comunicação externa — auditoria e plano

## Auditoria executiva

- A comunicação interna já tem a melhor base de interação: contexto, respostas, edição, reações, anexos, tarefas, arquivar, fixar, silenciar, notificações e ações por clique direito/long-press.
- A comunicação externa tinha apenas um fluxo de preparação e histórico. O compositor já permitia WhatsApp, email, telefone, modelos, renomear e salvar como novo, mas não oferecia a mesma camada de ações sobre os registros.
- O defeito dos `\\n` vinha dos seeds SQL: os modelos guardavam uma barra invertida e a letra `n`, e o valor era enviado ao WhatsApp depois de `encodeURIComponent`.
- O salvamento de modelos podia persistir a mensagem já renderizada para uma paciente, removendo os placeholders reutilizáveis.
- A biblioteca inicial era essencialmente WhatsApp; emails não tinham cobertura equivalente por categoria.

## Entregue nesta correção

1. Normalização compartilhada de `\\n`, `\\r` e `\\t` antes de renderizar, copiar, abrir WhatsApp ou enviar email.
2. Migração idempotente que corrige modelos já existentes e cria uma versão de email para cada modelo externo WhatsApp ativo.
3. O compositor externo passa a impedir abertura com campos de modelo vazios e o salvamento do modelo base tenta preservar os placeholders quando a mensagem não foi alterada.
4. O compositor de WhatsApp usa a mesma validação de campos e normalização.

## Próximas fases recomendadas

### Fase 1 — biblioteca de modelos

- Criar uma tela própria de “Modelos” com busca, categorias, favoritos, canal, variante curta/padrão/acolhedora/formal e status ativo.
- Separar claramente “Editar modelo” de “Personalizar esta mensagem”; editar o modelo deve abrir o texto-fonte com placeholders e uma prévia renderizada ao lado.
- Mostrar histórico de versões e permitir restaurar uma versão anterior.
- Permitir campos personalizados por organização, com validação de chave e rótulo.

### Fase 2 — espaço externo

- Transformar o histórico em uma caixa de saída com filtros por paciente, canal, status, categoria e período.
- Adicionar ações por clique direito, menu `⋯` e long-press: copiar, abrir novamente, editar rascunho, duplicar modelo, abrir paciente e criar tarefa de retorno.
- Adicionar favoritos e “usar novamente” sem sair do histórico.
- Exibir claramente preparado, aberto, enviado, não confirmado e falhou; WhatsApp Web nunca deve ser marcado como entregue automaticamente.

### Fase 3 — email seguro e produtivo

- Manter assuntos específicos por categoria, saudação, assinatura e prévia responsiva.
- Migrar envio de FormSubmit para uma função autenticada de email quando houver provedor definido; registrar provider message id e falha de entrega.
- Adicionar anexos controlados, confirmação de endereço, prevenção de envio duplicado e fila de reenvio.
- Preservar consentimento e preferência de não contato em todos os canais, inclusive modelos promocionais.

### Fase 4 — desempenho e qualidade

- Paginar histórico e carregar modelos uma vez por sessão, invalidando apenas após mutações.
- Debounce na busca e cache por organização/canal.
- Testes de contrato para placeholders, quebras de linha, permissões/RLS, duplicação e status de envio.
- Teste browser dos fluxos: modelo → personalização → WhatsApp, modelo → email, salvar novo, editar, renomear, restaurar e ações contextuais.

## Critério de pronto

Franciele deve conseguir encontrar um modelo em poucos segundos, editar apenas esta mensagem ou o modelo-base sem confundir os dois, salvar uma nova variante, abrir o canal correto, ver o histórico com status honesto e executar ações no registro por clique direito, `⋯` ou celular.

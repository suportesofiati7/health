# Auditoria de heróis públicos — 2026-11

## Escopo e decisões

Foram auditadas todas as 14 rotas que usam o componente de herói compartilhado: início, tratamentos, consulta, sobre, resultados, cuidados, laser, pele, missão, valores, depoimentos, perguntas, formulário e cookies. Journal e contato usam aberturas editoriais/formulário próprias e também foram revisados. Não foram criadas alegações de resultados, segurança, títulos ou experiência não confirmados.

| Página | Copy anterior | Copy revisada / mudança |
| --- | --- | --- |
| Início | Nome próprio e uma frase genérica | H1 passa a explicitar estética, escuta e Londrina; lede apresenta Franciele Sofiati, avaliação, pele, rosto e corpo. |
| Tratamentos | “Opções de tratamento” | H1 orientado à intenção de busca; lede explica indicação antes de procedimento e liga estética facial/corporal à avaliação. |
| Consulta | “Consulta estética” | H1 de avaliação estética em Londrina; lede explica prioridades, histórico, expectativas e indicação. |
| Sobre | “Sobre Franciele” | H1 nomeia a profissional; lede usa os papéis já declarados no site e o método de escuta e avaliação. |
| Resultados | “Resultados em contexto” | H1 e lede reforçam que imagens não são promessa e dependem de indicação e cuidados. |
| Cuidados | Texto curto | Explica preparação e pós-cuidado como específicos da indicação e convida a perguntas úteis. |
| Laser | Texto curto | Esclarece que tecnologias têm limites e preparo próprios, sem prometer eficácia. |
| Pele | Texto curto | Acrescenta contexto para manchas, textura, acne e sensibilidade, sem diagnóstico. |
| Missão / valores | Frases institucionais breves | Tornam os princípios observáveis: escuta, informação, decisão sem pressão e respeito à individualidade. |
| Depoimentos | Convite genérico | Inclui a ressalva de que relatos são experiências individuais, sem promessa de resultado. |
| Perguntas | Lista genérica de temas | Posiciona a página como orientação inicial e a consulta como espaço para o caso individual. |
| Formulário / cookies | Já funcionais | Mantidos por serem operacionais e jurídicos; não foi adicionada copy promocional. |
| Journal | Introdução editorial | Acrescenta autoria, temas e benefício de leitura sem apresentar conteúdo como aconselhamento individual. |
| Contato | “Envie sua mensagem” | H1 passa a orientar a intenção: falar sobre avaliação estética. |

## Layout, SEO e acessibilidade

- O sistema móvel deixa de limitar todo o texto a 60% da tela: agora usa uma medida fluida de 15rem a 68vw. Isso evita colunas estreitas e mantém o retrato visível.
- Tipografia móvel e entrelinha foram ajustadas para as descrições maiores; desktop preserva composição, paleta e fotografia existentes.
- Cada página mantém um único H1 e CTAs existentes; os textos acrescentam termos locais apenas quando relevantes.
- Fotos continuam como fundo, com gradiente claro já existente para contraste. Não houve mudança em `alt`, fontes, carregamento `eager` do LCP ou dimensões intrínsecas das imagens.

## Testes executados

- Build de produção e verificações de SEO/Português.
- Auditoria automatizada de heróis nas larguras 320, 390, 768, 1024, 1440 e 1920px.
- Layout mobile e CLS da página de tratamentos.

## Pendências conhecidas

- As páginas individuais de artigos não usam o componente de herói do site; seus títulos editoriais e metadados devem ser tratados em uma auditoria de conteúdo de Journal separada, não recebendo a mesma copy promocional.

<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9">
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>

  <xsl:template match="/">
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title>Mapa do site | Franciele Sofiati</title>
        <style>
          :root {
            color-scheme: light;
            --ivory-50: #fffdf7;
            --cream: #fffaf1;
            --cream-deep: #f7efe2;
            --sage-50: #f2f6ed;
            --sage-100: #e7efdf;
            --sage-200: #d3dfc7;
            --olive: #52634b;
            --olive-dark: #2f4334;
            --forest: #1d3026;
            --ink: #46554c;
            --line: rgb(82 99 75 / .18);
            --font-heading: "Iowan Old Style", Baskerville, "Palatino Linotype", "Book Antiqua", Georgia, serif;
            --font-body: Inter, "Avenir Next", "Segoe UI", ui-sans-serif, system-ui, -apple-system, sans-serif;
          }

          * { box-sizing: border-box; }

          body {
            margin: 0;
            background:
              radial-gradient(circle at 7% 18%, rgb(245 221 213 / .38) 0 7rem, transparent 18rem),
              radial-gradient(circle at 92% 44%, rgb(231 239 223 / .7) 0 10rem, transparent 23rem),
              linear-gradient(180deg, var(--cream), var(--ivory-50) 54%, var(--cream-deep));
            color: var(--forest);
            font-family: var(--font-body);
            line-height: 1.65;
          }

          a { color: inherit; text-decoration: none; }
          button, input { font: inherit; }

          .wrap {
            width: min(1180px, calc(100% - 32px));
            margin: 0 auto;
          }

          .eyebrow {
            margin: 0;
            color: var(--olive);
            font-size: .78rem;
            font-weight: 800;
            letter-spacing: .17em;
            text-transform: uppercase;
          }

          .hero {
            position: relative;
            overflow: clip;
            padding: clamp(4.5rem, 10vw, 8rem) 0 clamp(2.5rem, 6vw, 4rem);
          }

          .hero::before,
          .hero::after {
            content: "";
            position: absolute;
            border: 1px solid rgb(82 99 75 / .13);
            border-radius: 50%;
            pointer-events: none;
          }

          .hero::before {
            width: min(32vw, 22rem);
            height: min(42vw, 30rem);
            top: 11%;
            right: -4rem;
            opacity: .55;
          }

          .hero::after {
            width: 18rem;
            height: 18rem;
            left: -7rem;
            bottom: 1rem;
            opacity: .28;
          }

          .hero__inner {
            position: relative;
            display: grid;
            grid-template-columns: minmax(0, 1fr) minmax(8rem, 15rem);
            gap: clamp(1.5rem, 7vw, 6rem);
            align-items: center;
          }

          .brand-mark {
            width: 4.5rem;
            height: auto;
            margin-bottom: 1.4rem;
            opacity: .9;
          }

          h1, h2, h3 {
            margin: 0;
            color: var(--forest);
            font-family: var(--font-heading);
            font-weight: 400;
            letter-spacing: 0;
          }

          h1 {
            max-width: 15ch;
            margin-top: .8rem;
            font-size: clamp(2.8rem, 8vw, 6.7rem);
            line-height: .98;
          }

          .hero p:not(.eyebrow) {
            max-width: 51rem;
            margin: clamp(1.2rem, 3vw, 1.8rem) 0 0;
            color: var(--ink);
            font-size: clamp(1.02rem, 2vw, 1.22rem);
            line-height: 1.75;
          }

          .botanical {
            color: var(--olive);
            opacity: .74;
          }

          .botanical svg,
          .icon svg {
            display: block;
            width: 100%;
            height: auto;
            fill: none;
            stroke: currentColor;
            stroke-linecap: round;
            stroke-linejoin: round;
          }

          .hero__art {
            justify-self: center;
            width: min(13rem, 25vw);
          }

          .curve {
            width: min(840px, calc(100% - 32px));
            margin: 0 auto;
            color: var(--olive);
            opacity: .48;
          }

          .content {
            padding: clamp(2.5rem, 6vw, 5rem) 0 clamp(4rem, 8vw, 7rem);
          }

          .quick {
            display: grid;
            grid-template-columns: repeat(5, minmax(0, 1fr));
            gap: .8rem;
            margin-bottom: clamp(2rem, 5vw, 4rem);
          }

          .quick a,
          .search,
          .category,
          .assist,
          .contact {
            border: 1px solid var(--line);
            border-radius: .55rem;
            background: rgb(255 253 247 / .72);
          }

          .quick a {
            min-height: 7rem;
            display: grid;
            gap: .85rem;
            align-content: center;
            padding: 1rem;
            color: var(--olive-dark);
            transition: background .18s ease, border-color .18s ease, transform .18s ease;
          }

          .quick a:hover {
            border-color: rgb(82 99 75 / .44);
            background: var(--sage-100);
            transform: translateY(-2px);
          }

          .icon {
            width: 1.35rem;
            color: var(--olive);
          }

          .quick span {
            font-size: .83rem;
            font-weight: 800;
            letter-spacing: .03em;
            line-height: 1.25;
            text-transform: uppercase;
          }

          .search {
            position: relative;
            display: flex;
            align-items: center;
            gap: .75rem;
            max-width: 46rem;
            margin: 0 auto clamp(2.5rem, 5vw, 4.25rem);
            padding: .95rem 1.1rem;
            background: rgb(255 253 247 / .82);
          }

          .search .icon { flex: 0 0 1.15rem; }

          .search input {
            width: 100%;
            border: 0;
            outline: 0;
            background: transparent;
            color: var(--forest);
            font-size: 1rem;
          }

          .search input::placeholder { color: rgb(70 85 76 / .72); }

          .grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: clamp(1rem, 2vw, 1.35rem);
          }

          .category {
            position: relative;
            padding: clamp(1.25rem, 2.4vw, 1.75rem);
            background: color-mix(in srgb, var(--ivory-50) 88%, var(--sage-50));
            overflow: clip;
          }

          .category::after {
            content: "";
            position: absolute;
            right: -2rem;
            top: -2rem;
            width: 7rem;
            height: 7rem;
            border: 1px solid rgb(82 99 75 / .1);
            border-radius: 50%;
          }

          .category__icon {
            width: 2.35rem;
            height: 2.35rem;
            display: grid;
            place-items: center;
            margin-bottom: 1rem;
            border: 1px solid rgb(82 99 75 / .22);
            border-radius: .55rem;
            background: rgb(255 255 255 / .54);
            color: var(--olive);
          }

          .category__icon svg {
            width: 1.12rem;
            stroke-width: 1.7;
          }

          .category h2 {
            font-size: clamp(1.8rem, 3vw, 2.65rem);
            line-height: 1.05;
          }

          .category ul {
            display: grid;
            gap: .55rem;
            margin: 1.2rem 0 0;
            padding: 0;
            list-style: none;
          }

          .category li { min-width: 0; }

          .category a {
            position: relative;
            display: grid;
            gap: .16rem;
            padding: .35rem 0 .35rem 1.1rem;
            color: var(--olive-dark);
            font-size: 1rem;
            font-weight: 720;
            line-height: 1.35;
          }

          .category a::before {
            content: "";
            position: absolute;
            left: 0;
            top: .82rem;
            width: .38rem;
            height: .38rem;
            border: 1px solid var(--olive);
            border-radius: 50% 50% 50% 16%;
            rotate: -28deg;
            opacity: .55;
          }

          .category a::after {
            content: "";
            width: 0;
            height: 1px;
            background: var(--olive);
            transition: width .18s ease;
          }

          .category a:hover::after { width: min(11rem, 100%); }
          .category a:hover { color: var(--forest); }

          .desc {
            color: var(--ink);
            font-size: .86rem;
            font-weight: 400;
            line-height: 1.45;
          }

          .latest {
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid var(--line);
          }

          .assist,
          .contact {
            position: relative;
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto;
            gap: 2rem;
            align-items: center;
            margin-top: clamp(2rem, 5vw, 4rem);
            padding: clamp(1.5rem, 4vw, 2.6rem);
            background: var(--sage-100);
            overflow: hidden;
          }

          .contact {
            background: transparent;
          }

          .assist h2,
          .contact h2 {
            font-size: clamp(2rem, 5vw, 3.5rem);
            line-height: 1.05;
          }

          .assist p,
          .contact p {
            max-width: 47rem;
            margin: .8rem 0 0;
            color: var(--ink);
          }

          .assist .botanical {
            width: 7rem;
            opacity: .36;
          }

          .actions {
            display: flex;
            flex-wrap: wrap;
            gap: .8rem;
            margin-top: 1.35rem;
          }

          .btn {
            min-height: 3.15rem;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border: 1px solid var(--olive);
            border-radius: .45rem;
            padding: .8rem 1rem;
            color: var(--olive-dark);
            font-size: .86rem;
            font-weight: 800;
            letter-spacing: .04em;
            text-transform: uppercase;
          }

          .btn--primary {
            background: var(--olive);
            color: var(--ivory-50);
          }

          .divider {
            width: min(520px, 80%);
            margin: clamp(2.5rem, 6vw, 4.5rem) auto 0;
            color: var(--olive);
            opacity: .5;
          }

          .is-hidden { display: none !important; }

          .empty {
            display: none;
            max-width: 40rem;
            margin: 0 auto;
            color: var(--ink);
            text-align: center;
          }

          .empty.is-visible { display: block; }

          footer {
            padding: 2.8rem 0;
            background: var(--olive-dark);
            color: var(--ivory-50);
            text-align: center;
          }

          footer img {
            width: 4rem;
            height: auto;
            margin-bottom: .8rem;
            opacity: .9;
          }

          @media (max-width: 980px) {
            .quick,
            .grid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }
          }

          @media (max-width: 720px) {
            body {
              background: linear-gradient(180deg, var(--cream), var(--ivory-50) 58%, var(--cream-deep));
            }

            .hero__inner,
            .grid,
            .quick,
            .assist,
            .contact {
              grid-template-columns: 1fr;
            }

            .hero {
              padding-top: 3.4rem;
            }

            .hero__art {
              width: 5.8rem;
              justify-self: start;
              opacity: .55;
            }

            .hero::before,
            .hero::after,
            .category::after {
              display: none;
            }

            .quick a {
              min-height: 4.8rem;
              grid-template-columns: 1.35rem minmax(0, 1fr);
              align-items: center;
            }

            .category {
              padding: 1.15rem;
            }

            .category ul {
              gap: .7rem;
            }

            .category a {
              min-height: 2.75rem;
              align-content: center;
              font-size: 1rem;
            }

            .assist .botanical {
              width: 4.5rem;
            }
          }
        </style>
      </head>
      <body>
        <div class="page">
          <header class="hero">
            <div class="wrap hero__inner">
              <div>
                <img class="brand-mark" src="/assets/shared/brand/logotipo-franciele-sofiati-planejamento-individual-estetica-avancada-londrina-centro-02.webp" alt="Franciele Sofiati" width="192" height="192"/>
                <p class="eyebrow">Mapa do site</p>
                <h1>Encontre facilmente o cuidado e a informação que procura.</h1>
                <p>Explore todas as áreas do site e encontre informações sobre Franciele, tratamentos, cuidados, agendamentos e conteúdos desenvolvidos para orientar você em cada etapa.</p>
              </div>
              <div class="botanical hero__art" aria-hidden="true">
                <svg viewBox="0 0 160 360">
                  <path d="M82 342C70 286 71 231 88 176c12-39 16-77 4-118" stroke-width="2"/>
                  <path d="M88 202c-22-20-42-21-60-4 27 9 47 10 60 4ZM90 164c25-20 47-21 66-2-30 9-52 10-66 2ZM86 126c-20-22-39-25-57-10 25 12 44 15 57 10ZM92 88c20-18 38-19 54-2-23 8-42 9-54 2ZM81 252c22-18 43-18 61 0-26 8-47 8-61 0ZM78 286c-20-16-38-15-54 1 23 8 41 8 54-1Z" stroke-width="1.5"/>
                  <path d="M78 56c-12-16-12-31 0-46 12 15 12 30 0 46Z" stroke-width="1.5"/>
                </svg>
              </div>
            </div>
            <div class="curve" aria-hidden="true">
              <svg viewBox="0 0 840 44"><path d="M4 30c148-31 292-31 432-4 139 26 270 16 400-20" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>
            </div>
          </header>

          <main class="content">
            <div class="wrap">
              <nav class="quick" aria-label="Acessos principais">
                <a href="/sobre.html" data-search-item=""><span class="icon"><svg viewBox="0 0 24 24"><path d="M12 21s7-4 7-11V5l-7-3-7 3v5c0 7 7 11 7 11Z"/></svg></span><span>Conheça Franciele</span></a>
                <a href="/tratamentos.html" data-search-item=""><span class="icon"><svg viewBox="0 0 24 24"><path d="M12 3 10.3 9.3 4 11l6.3 1.7L12 19l1.7-6.3L20 11l-6.3-1.7Z"/></svg></span><span>Explorar tratamentos</span></a>
                <a href="/consulta.html" data-search-item=""><span class="icon"><svg viewBox="0 0 24 24"><path d="M8 2v4M16 2v4M3 10h18"/><rect x="3" y="5" width="18" height="16" rx="2"/></svg></span><span>Agendar uma consulta</span></a>
                <a href="/perguntas.html" data-search-item=""><span class="icon"><svg viewBox="0 0 24 24"><path d="M9 9a3 3 0 1 1 4 2.8c-.8.4-1 1-1 2.2"/><path d="M12 18h.01"/><circle cx="12" cy="12" r="10"/></svg></span><span>Perguntas frequentes</span></a>
                <a href="/contato.html" data-search-item=""><span class="icon"><svg viewBox="0 0 24 24"><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"/></svg></span><span>Entrar em contato</span></a>
              </nav>

              <div class="search">
                <span class="icon" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4 4"/></svg></span>
                <input id="sitemap-search" type="search" placeholder="Pesquisar uma página ou tratamento" aria-label="Pesquisar uma página ou tratamento"/>
              </div>
              <p class="empty" id="sitemap-empty">Nenhuma página encontrada para esta pesquisa.</p>

              <div class="grid" id="sitemap-grid">
                <section class="category" data-search-section="">
                  <div class="category__icon"><svg viewBox="0 0 24 24"><path d="M4 20V8l8-5 8 5v12"/><path d="M9 20v-7h6v7"/></svg></div>
                  <h2>Principal</h2>
                  <ul>
                    <li><a href="/" data-search-item="">Início</a></li>
                    <li><a href="/sobre.html" data-search-item="">Sobre Franciele</a></li>
                    <li><a href="/valores.html" data-search-item="">Valores e filosofia de atendimento</a></li>
                    <li><a href="/missao.html" data-search-item="">Missão</a></li>
                    <li><a href="/resultados.html" data-search-item="">Resultados</a></li>
                    <li><a href="/depoimentos.html" data-search-item="">Depoimentos</a></li>
                  </ul>
                </section>

                <section class="category" data-search-section="">
                  <div class="category__icon"><svg viewBox="0 0 24 24"><path d="M5 21c8-1 14-7 14-18C10 3 4 9 5 21Z"/><path d="M5 21c0-6 4-10 10-12"/></svg></div>
                  <h2>Tratamentos</h2>
                  <ul>
                    <li><a href="/tratamentos.html" data-search-item="">Todos os tratamentos</a></li>
                    <li><a href="/pele.html" data-search-item="">Cuidados com a pele</a></li>
                    <li><a href="/laser.html" data-search-item="">Tratamentos a laser</a></li>
                    <li><a href="/tratamentos.html#rejuvenescimento" data-search-item="">Rejuvenescimento</a></li>
                    <li><a href="/tratamentos.html#textura" data-search-item="">Textura, tom e firmeza</a></li>
                    <li><a href="/tratamentos.html#manchas" data-search-item="">Manchas e pigmentação</a></li>
                    <li><a href="/tratamentos.html#acne" data-search-item="">Cicatrizes e marcas de acne</a></li>
                    <li><a href="/laser.html#tatuagem" data-search-item="">Remoção de tatuagem e micropigmentação</a></li>
                    <li><a href="/laser.html#depilacao" data-search-item="">Depilação a laser</a></li>
                    <li><a href="/tratamentos.html#capilar" data-search-item="">Tratamentos capilares</a></li>
                    <li><a href="/tratamentos.html#corpo" data-search-item="">Tratamentos corporais</a></li>
                  </ul>
                </section>

                <section class="category" data-search-section="">
                  <div class="category__icon"><svg viewBox="0 0 24 24"><path d="M12 2v20M5 7h14M7 17h10"/><path d="M5 7c2 4 12 4 14 0M7 17c2-4 8-4 10 0"/></svg></div>
                  <h2>Tecnologias</h2>
                  <ul>
                    <li><a href="/laser.html#harmony" data-search-item="">Harmony<span class="desc">Pigmentação, vermelhidão e textura da pele.</span></a></li>
                    <li><a href="/laser.html#lightsheer" data-search-item="">LightSheer Duet<span class="desc">Tecnologia para depilação a laser.</span></a></li>
                    <li><a href="/laser.html#acupulse" data-search-item="">AcuPulse CO₂<span class="desc">Renovação de textura, marcas e cicatrizes selecionadas.</span></a></li>
                    <li><a href="/tratamentos.html#ultraformer" data-search-item="">Ultraformer MPT<span class="desc">Firmeza e contorno conforme avaliação.</span></a></li>
                    <li><a href="/tratamentos.html#radiofrequencia" data-search-item="">Radiofrequência<span class="desc">Qualidade da pele e suporte de firmeza.</span></a></li>
                    <li><a href="/tratamentos.html#jato-de-plasma" data-search-item="">Jato de plasma<span class="desc">Tratamentos pontuais com indicação cuidadosa.</span></a></li>
                    <li><a href="/tratamentos.html#mmp" data-search-item="">MMP<span class="desc">Estratégia para couro cabeludo e pele selecionada.</span></a></li>
                  </ul>
                </section>

                <section class="category" data-search-section="">
                  <div class="category__icon"><svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h5"/></svg></div>
                  <h2>Sua experiência</h2>
                  <ul>
                    <li><a href="/consulta.html" data-search-item="">Consulta inicial</a></li>
                    <li><a href="/cuidados.html#antes" data-search-item="">Antes do tratamento</a></li>
                    <li><a href="/cuidados.html#apos" data-search-item="">Cuidados após o procedimento</a></li>
                    <li><a href="/formulario.html" data-search-item="">Agendamento</a></li>
                    <li><a href="/consulta.html#politica" data-search-item="">Política de reserva e reagendamento</a></li>
                    <li><a href="/perguntas.html" data-search-item="">Perguntas frequentes</a></li>
                    <li><a href="/contato.html" data-search-item="">Fale com a clínica</a></li>
                  </ul>
                </section>

                <section class="category" data-search-section="">
                  <div class="category__icon"><svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z"/></svg></div>
                  <h2>Conteúdo e orientação</h2>
                  <ul>
                    <li><a href="/blog.html" data-search-item="">Journal</a></li>
                    <li><a href="/blog.html#artigos" data-search-item="">Todos os artigos</a></li>
                    <li><a href="/blog.html#pele" data-search-item="">Cuidados com a pele</a></li>
                    <li><a href="/blog.html#tecnologias" data-search-item="">Tecnologias e tratamentos</a></li>
                    <li><a href="/blog.html#recuperacao" data-search-item="">Preparação e recuperação</a></li>
                    <li><a href="/blog.html#seguranca" data-search-item="">Segurança e resultados</a></li>
                    <li class="latest"><a href="/blog.html" data-search-item="">Ver os artigos mais recentes →</a></li>
                  </ul>
                </section>

                <section class="category" data-search-section="">
                  <div class="category__icon"><svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-5"/></svg></div>
                  <h2>Informações importantes</h2>
                  <ul>
                    <li><a href="/acessibilidade.html" data-search-item="">Acessibilidade</a></li>
                    <li><a href="/cookies.html#privacidade" data-search-item="">Política de privacidade</a></li>
                    <li><a href="/cookies.html" data-search-item="">Política de cookies</a></li>
                    <li><a href="/cookies.html#termos" data-search-item="">Termos de uso</a></li>
                    <li><a href="/cookies.html#legal" data-search-item="">Informações legais</a></li>
                    <li><a href="/cookies.html#conteudo" data-search-item="">Aviso de conteúdo</a></li>
                    <li><a href="/sitemap.xml" data-search-item="">Mapa do site</a></li>
                  </ul>
                </section>
              </div>

              <section class="assist" aria-labelledby="assist-title">
                <div>
                  <h2 id="assist-title">Não sabe por onde começar?</h2>
                  <p>Você não precisa escolher um tratamento antes de conversar com Franciele. Durante a consulta, suas necessidades, objetivos e características individuais serão avaliados com atenção.</p>
                  <div class="actions">
                    <a class="btn btn--primary" href="/consulta.html">Agendar uma consulta</a>
                    <a class="btn" href="/perguntas.html">Ver perguntas frequentes</a>
                  </div>
                </div>
                <div class="botanical" aria-hidden="true">
                  <svg viewBox="0 0 120 180"><path d="M60 170C50 126 52 86 67 40" stroke-width="1.7"/><path d="M64 82c-20-14-37-13-50 2 21 6 38 5 50-2ZM66 112c18-15 36-15 52 0-21 7-39 7-52 0ZM62 52c14-12 29-12 42 0-17 6-31 6-42 0Z" stroke-width="1.35"/></svg>
                </div>
              </section>

              <section class="contact" aria-labelledby="contact-title">
                <div>
                  <h2 id="contact-title">Ainda não encontrou o que procurava?</h2>
                  <p>Entre em contato com a clínica para receber orientação sobre consultas, tratamentos ou informações disponíveis no site.</p>
                  <div class="actions">
                    <a class="btn btn--primary" href="https://wa.me/5543991043536" rel="noopener noreferrer">Falar pelo WhatsApp</a>
                    <a class="btn" href="/contato.html">Entrar em contato</a>
                  </div>
                </div>
              </section>

              <div class="divider" aria-hidden="true">
                <svg viewBox="0 0 520 54"><path d="M4 34c86-26 176-26 270-6 88 18 166 14 242-18" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M151 25c-18-14-35-14-50 0 20 7 37 7 50 0ZM282 30c22-16 42-16 61 1-25 8-46 8-61-1ZM403 17c-16-12-31-12-44 0 18 6 33 6 44 0Z" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>
              </div>
            </div>
          </main>

          <footer>
            <img src="/assets/shared/brand/logotipo-franciele-sofiati-planejamento-individual-estetica-avancada-londrina-centro-02.webp" alt="" width="192" height="192"/>
            <div>Franciele Sofiati</div>
          </footer>
        </div>

        <script>
          (function () {
            var input = document.getElementById('sitemap-search');
            var sections = Array.prototype.slice.call(document.querySelectorAll('[data-search-section]'));
            var empty = document.getElementById('sitemap-empty');
            if (!input) return;

            function normalize(value) {
              return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            }

            input.addEventListener('input', function () {
              var query = normalize(input.value.trim());
              var any = false;

              sections.forEach(function (section) {
                var items = Array.prototype.slice.call(section.querySelectorAll('[data-search-item]'));
                var sectionHasMatch = false;

                items.forEach(function (item) {
                  var matches = !query || normalize(item.textContent).indexOf(query) !== -1;
                  item.closest('li').classList.toggle('is-hidden', !matches);
                  sectionHasMatch = sectionHasMatch || matches;
                });

                section.classList.toggle('is-hidden', !sectionHasMatch);
                any = any || sectionHasMatch;
              });

              empty.classList.toggle('is-visible', !any);
            });
          })();
        </script>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>

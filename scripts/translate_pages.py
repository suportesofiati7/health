#!/usr/bin/env python3
"""Translate static Sofiati HTML pages to Portuguese by default.

The script keeps the site bilingual by generating js/translations.js. Static
HTML is written in Portuguese, while the browser language switcher can restore
the original English strings from the generated map.
"""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any

from bs4 import BeautifulSoup, NavigableString


ROOT = Path(__file__).resolve().parents[1]
TRANSLATIONS_JS = ROOT / "js" / "translations.js"
SKIP_TEXT_PARENTS = {"script", "style", "noscript", "template"}
TRANSLATABLE_ATTRS = {"alt", "aria-label", "content", "placeholder", "title", "value"}
CONTACT_RE = re.compile(r"(@|https?://|mailto:|\bwa\.me\b|\w+@\w+)", re.I)
ALPHA_RE = re.compile(r"[A-Za-zÀ-ÿ]")


PAGE_LABELS = {
    "Home": "Início",
    "About": "Sobre",
    "Mission": "Missão",
    "Values": "Valores",
    "Care": "Cuidados",
    "Laser": "Laser",
    "Skin": "Pele",
    "Results": "Resultados",
    "Testimonials": "Depoimentos",
    "Journal": "Conteúdo",
    "Blog": "Blog",
    "FAQ": "Perguntas frequentes",
    "Contact": "Contato",
    "Consultation": "Consulta",
    "Legal": "Legal",
    "Privacy": "Privacidade",
    "Cookies": "Cookies",
    "Accessibility": "Acessibilidade",
    "404": "404",
}

EXACT = {
    "Sofiati Premium Website Concepts": "Conceitos Premium de Site Sofiati",
    "Premium bilingual concept selector for 50 Franciele Sofiati website directions.": "Seletor bilíngue premium para 50 direções de site da Franciele Sofiati.",
    "50 bilingual website concepts for Franciele Sofiati Advanced Aesthetic Biomedicine.": "50 conceitos bilíngues de site para Franciele Sofiati Biomedicina Estética Avançada.",
    "Choose a Sofiati website concept without fighting the page.": "Escolha um conceito de site Sofiati sem brigar com a página.",
    "A compact bilingual dashboard for reviewing every homepage direction, comparing the mood quickly and opening any concept in one click.": "Um painel bilíngue compacto para revisar cada direção de homepage, comparar o clima rapidamente e abrir qualquer conceito em um clique.",
    "50 concepts": "50 conceitos",
    "50 homepage concepts": "50 conceitos de homepage",
    "19 pages per concept": "19 páginas por conceito",
    "PT default language": "PT como idioma padrão",
    "View all concepts": "Ver todos os conceitos",
    "All website options": "Todas as opções de site",
    "Every concept, arranged for fast scanning": "Todos os conceitos, organizados para leitura rápida",
    "Each tile opens the live homepage for that numbered direction. The compact layout keeps the full set visible without card overflow or leaking text.": "Cada bloco abre a homepage ativa daquela direção numerada. O layout compacto mantém o conjunto completo visível, sem cartões estourados ou textos vazando.",
    "All 50 concepts": "Todos os 50 conceitos",
    "Selector summary": "Resumo do seletor",
    "Quick concept links": "Links rápidos de conceitos",
    "homepage concepts": "conceitos de homepage",
    "pages per concept": "páginas por conceito",
    "default language": "idioma padrão",
    "Open concept": "Abrir conceito",
    "Open concept 01": "Abrir conceito 01",
    "View selector": "Ver seletor",
    "Skip to main content": "Pular para o conteúdo principal",
    "Portuguese default": "Português padrão",
    "Language switcher": "Seletor de idioma",
    "Concept switcher": "Seletor de conceitos",
    "Primary navigation": "Navegação principal",
    "Mobile navigation": "Navegação mobile",
    "Footer navigation": "Navegação do rodapé",
    "Open menu": "Abrir menu",
    "Menu": "Menu",
    "Close": "Fechar",
    "Home": "Início",
    "About": "Sobre",
    "Mission": "Missão",
    "Values": "Valores",
    "Care": "Cuidados",
    "Skin": "Pele",
    "Results": "Resultados",
    "Testimonials": "Depoimentos",
    "Journal": "Conteúdo",
    "FAQ": "Perguntas frequentes",
    "Contact": "Contato",
    "Consultation": "Consulta",
    "Privacy": "Privacidade",
    "Legal": "Legal",
    "Accessibility": "Acessibilidade",
    "Sitemap": "Mapa do site",
    "Request consultation": "Solicitar consulta",
    "Read FAQ": "Ler perguntas frequentes",
    "Send request": "Enviar solicitação",
    "Trust details": "Detalhes de confiança",
    "Trust line": "Linha de confiança",
    "English-first concept": "Conceito com português como padrão",
    "Advanced Aesthetic Biomedicine": "Biomedicina Estética Avançada",
    "Advanced Aesthetic Biomedicine Professional": "Profissional de Biomedicina Estética Avançada",
    "Advanced Aesthetic Biomedicine - CRBM 6277 - Londrina, PR": "Biomedicina Estética Avançada - CRBM 6277 - Londrina, PR",
    "Franciele Sofiati Advanced Aesthetic Biomedicine": "Franciele Sofiati Biomedicina Estética Avançada",
    "Advanced Aesthetic Biomedicine in Londrina, PR, guided by professional evaluation, precision, warmth and natural-looking care.": "Biomedicina Estética Avançada em Londrina, PR, guiada por avaliação profissional, precisão, acolhimento e cuidado com aparência natural.",
    "Biomedical professional, clinical pathology background, aesthetician and cosmetologist, laser specialist, CRBM 6277.": "Profissional biomédica com base em patologia clínica, estética e cosmetologia, especialista em laser, CRBM 6277.",
    "Advanced laser and skin care in Londrina, guided by safety, precision and natural-looking results.": "Laser avançado e cuidado da pele em Londrina, guiados por segurança, precisão e resultados de aparência natural.",
    "Franciele Sofiati answers this through professional evaluation and responsible education. Results and suitability vary by individual context.": "Franciele Sofiati responde a isso com avaliação profissional e educação responsável. Resultados e indicação variam conforme o contexto individual.",
    "Page not found": "Página não encontrada",
    "Page Not Found": "Página não encontrada",
    "Open Inspire home page": "Abrir página inicial Inspire",
    "Name": "Nome",
    "Email": "E-mail",
    "Message": "Mensagem",
    "Treatment interest": "Interesse de tratamento",
    "WhatsApp Alternative": "Alternativa por WhatsApp",
    "WhatsApp CTA": "Chamada para WhatsApp",
    "Instagram Link": "Link do Instagram",
    "Email Link": "Link de e-mail",
    "Contact Details": "Dados de contato",
    "This concept stores only your cookie choice. Analytics and marketing placeholders stay inactive until consent and real IDs are added.": "Este conceito armazena apenas sua escolha de cookies. Placeholders de analytics e marketing permanecem inativos até que o consentimento e IDs reais sejam adicionados.",
    "Reject optional": "Recusar opcionais",
    "Accept optional": "Aceitar opcionais",
    "Please complete the required fields and privacy confirmation.": "Preencha os campos obrigatórios e confirme a privacidade.",
    "Thank you. This static concept uses a placeholder endpoint; WhatsApp is available for a direct request.": "Obrigada. Este conceito estático usa um endpoint placeholder; o WhatsApp está disponível para uma solicitação direta.",
    "Professional evaluation first": "Avaliação profissional em primeiro lugar",
    "Reference architecture": "Arquitetura de referência",
    "Premium introduction": "Introdução premium",
    "Professional story": "História profissional",
    "Purpose and responsibility": "Propósito e responsabilidade",
    "Care values": "Valores de cuidado",
    "Evaluation-led care": "Cuidado orientado por avaliação",
    "Laser education": "Educação sobre laser",
    "Skin quality education": "Educação sobre qualidade da pele",
    "Ethical results": "Resultados éticos",
    "Approval-first social proof": "Prova social com aprovação em primeiro lugar",
    "Educational journal": "Journal educativo",
    "Educational blog": "Blog educativo",
    "Patient questions": "Perguntas da paciente",
    "Business-card contact": "Contato em formato de cartão de visita",
    "Consultation pathway": "Caminho de consulta",
    "Professional boundaries": "Limites profissionais",
    "Privacy notice": "Aviso de privacidade",
    "Cookie preferences": "Preferências de cookies",
    "Accessibility promise": "Promessa de acessibilidade",
    "Recovery page": "Página de recuperação",
    "Laser, skin and advanced aesthetic care in Londrina, PR.": "Laser, pele e cuidados estéticos avançados em Londrina, PR.",
    "A biomedical foundation for precise, human aesthetic care.": "Uma base biomédica para cuidado estético preciso e humano.",
    "Care that protects natural expression while respecting safety.": "Cuidado que protege a expressão natural com segurança.",
    "Precision, warmth and responsibility as visible values.": "Precisão, acolhimento e responsabilidade como valores visíveis.",
    "A structured care pathway before any aesthetic protocol.": "Um caminho de cuidado estruturado antes de qualquer protocolo estético.",
    "Laser care explained with precision, safety and restraint.": "Cuidados com laser explicados com precisão, segurança e contenção.",
    "Skin care for texture, clarity and calm confidence.": "Cuidado da pele para textura, clareza e confiança tranquila.",
    "Results with responsibility, privacy and realistic expectations.": "Resultados com responsabilidade, privacidade e expectativas realistas.",
    "A testimonial system that waits for approval before speaking.": "Um sistema de depoimentos que espera aprovação antes de falar.",
    "A calm journal for laser, skin and aftercare education.": "Um journal sereno para educação sobre laser, pele e acompanhamento.",
    "Short-form education with professional boundaries.": "Educação breve com limites profissionais.",
    "Questions answered with clarity, restraint and next steps.": "Perguntas respondidas com clareza, contenção e próximos passos.",
    "Contact Franciele Sofiati in Londrina, PR.": "Contato com Franciele Sofiati em Londrina, PR.",
    "Request a professional evaluation before choosing a protocol.": "Solicite uma avaliação profissional antes de escolher um protocolo.",
    "Legal and professional boundaries for the Sofiati presentation.": "Limites legais e profissionais para a apresentação Sofiati.",
    "Privacy-first content for consultation and education.": "Conteúdo com privacidade em primeiro lugar para consulta e educação.",
    "Cookie preferences kept simple and visible.": "Preferências de cookies simples e visíveis.",
    "Accessible structure for a calm, premium review experience.": "Estrutura acessível para uma experiência de revisão premium e tranquila.",
    "Page not found.": "Página não encontrada.",
    "Results may vary according to individual characteristics, professional evaluation, treatment indication, protocol, number of sessions and aftercare.": "Os resultados podem variar de acordo com características individuais, avaliação profissional, indicação do tratamento, protocolo, número de sessões e cuidados de acompanhamento.",
    "Information on this website is educational and does not replace an individual professional evaluation.": "As informações deste site são educativas e não substituem uma avaliação profissional individual.",
    "I understand this form is part of a static presentation and does not replace a professional evaluation.": "Entendo que este formulário faz parte de uma apresentação estática e não substitui uma avaliação profissional.",
}

PHRASES = {
    "editorial split care journey": "jornada editorial dividida de cuidado",
    "business-card contact architecture": "arquitetura de contato inspirada em cartão de visita",
    "business card contact architecture": "arquitetura de contato inspirada em cartão de visita",
    "botanical clinic magazine": "revista clínica botânica",
    "laser technology dossier": "dossiê de tecnologia laser",
    "quiet luxury skincare journal": "journal de skincare de luxo discreto",
    "mobile story-led pathway": "percurso mobile guiado por narrativa",
    "mobile story led pathway": "percurso mobile guiado por narrativa",
    "clinical proof and education grid": "grade de prova clínica e educação",
    "monogram-centered sanctuary": "santuário centrado no monograma",
    "monogram centered sanctuary": "santuário centrado no monograma",
    "consultation-first conversion studio": "estúdio de conversão com consulta em primeiro lugar",
    "consultation first conversion studio": "estúdio de conversão com consulta em primeiro lugar",
    "minimal ivory appointment suite": "suite minimalista de agendamento em marfim",
    "transparent hero header": "cabeçalho transparente no hero",
    "ivory sticky header": "cabeçalho fixo em marfim",
    "sage top bar": "barra superior em sálvia",
    "monogram-centred header": "cabeçalho centrado no monograma",
    "split navigation": "navegação dividida",
    "side navigation": "navegação lateral",
    "sage full-screen menu": "menu sálvia em tela cheia",
    "ivory editorial menu": "menu editorial em marfim",
    "business-card-inspired menu": "menu inspirado em cartão de visita",
    "botanical watermark menu": "menu com marca d'água botânica",
    "split image/text menu": "menu dividido entre imagem e texto",
    "treatment category menu": "menu por categoria de tratamento",
    "bottom-sheet menu": "menu em painel inferior",
    "minimal white menu": "menu branco minimalista",
    "bronze-accent menu": "menu com acento bronze",
    "story-background mobile menu": "menu mobile com fundo narrativo",
    "business-card footer": "rodapé de cartão de visita",
    "large monogram footer": "rodapé com monograma grande",
    "sage block footer": "rodapé em bloco sálvia",
    "ivory editorial footer": "rodapé editorial em marfim",
    "luxury skincare footer": "rodapé de skincare de luxo",
    "botanical footer": "rodapé botânico",
    "soft reveal": "revelação suave",
    "botanical line reveal": "revelação com linha botânica",
    "quiet mask fade": "fade discreto com máscara",
    "accordion glide": "deslize em acordeão",
    "monogram watermark fade": "fade com marca d'água do monograma",
    "staggered card entrance": "entrada escalonada dos cartões",
    "calm clinical luxury": "luxo clínico sereno",
    "botanical precision": "precisão botânica",
    "warm ivory editorial": "editorial marfim acolhedor",
    "sage technology care": "cuidado tecnológico em sálvia",
    "gold-accented restraint": "contenção com acento dourado",
    "advanced aesthetic biomedicine": "biomedicina estética avançada",
    "professional evaluation": "avaliação profissional",
    "personalised protocols": "protocolos personalizados",
    "personalised protocol": "protocolo personalizado",
    "natural-looking care": "cuidado com aparência natural",
    "natural-looking results statement": "declaração sobre resultados de aparência natural",
    "safety and aftercare": "segurança e acompanhamento",
    "skin quality": "qualidade da pele",
    "skin cleansing": "limpeza de pele",
    "cleansing": "limpeza",
    "rosacea": "rosácea",
    "rosacea awareness": "conscientização sobre rosácea",
    "flaccidity": "flacidez",
    "wrinkles": "rugas",
    "judgement": "critério",
    "visibility": "visibilidade",
    "barrier respect": "respeito à barreira da pele",
    "texture": "textura",
    "maintenance": "manutenção",
    "laser care": "cuidados com laser",
    "privacy-first content": "conteúdo com privacidade em primeiro lugar",
    "ethical conversion": "conversão ética",
    "advanced aesthetic care": "cuidado estético avançado",
    "trust line with crbm": "linha de confiança com CRBM",
    "professional positioning": "posicionamento profissional",
    "signature brand statement": "declaração de marca autoral",
    "laser technology feature": "destaque de tecnologia laser",
    "skin care philosophy": "filosofia de cuidado da pele",
    "patient journey": "jornada da paciente",
    "premium introduction": "introdução premium",
    "editorial biography": "biografia editorial",
    "mission and values": "missão e valores",
    "visual manifesto": "manifesto visual",
    "treatment overview": "visão geral de tratamentos",
    "laser expertise": "especialidade em laser",
    "skin quality care": "cuidado da qualidade da pele",
    "ethical results": "resultados éticos",
    "approval-first social proof": "prova social com aprovação em primeiro lugar",
    "educational journal": "journal educativo",
    "educational blog": "blog educativo",
    "patient questions": "perguntas da paciente",
    "business-card contact": "contato em formato de cartão de visita",
    "consultation pathway": "caminho de consulta",
    "professional boundaries": "limites profissionais",
    "privacy notice": "aviso de privacidade",
    "cookie preferences": "preferências de cookies",
    "accessibility promise": "promessa de acessibilidade",
    "recovery page": "página de recuperação",
    "professional portrait": "retrato profissional",
    "crbm credential panel": "painel de credencial CRBM",
    "clinical pathology background": "base em patologia clínica",
    "aesthetician and cosmetologist background": "formação em estética e cosmetologia",
    "laser specialist section": "seção de especialista em laser",
    "philosophy of care": "filosofia de cuidado",
    "personal method": "método pessoal",
    "brand identity story": "história da identidade de marca",
    "core purpose statement": "declaração de propósito central",
    "human warmth": "acolhimento humano",
    "safety commitment": "compromisso com segurança",
    "technology commitment": "compromisso com tecnologia",
    "mission cta": "chamada para missão",
    "precision value": "valor de precisão",
    "safety value": "valor de segurança",
    "naturalness value": "valor de naturalidade",
    "warmth value": "valor de acolhimento",
    "technology value": "valor de tecnologia",
    "individuality value": "valor de individualidade",
    "ethics value": "valor de ética",
    "excellence value": "valor de excelência",
    "care confidence safety naturalness": "cuidado confiança segurança naturalidade",
    "treatment category architecture": "arquitetura de categorias de tratamento",
    "category navigation": "navegação por categoria",
    "treatment filter": "filtro de tratamento",
    "skin concerns navigator": "navegador de questões da pele",
    "laser hair removal": "depilação a laser",
    "laser rejuvenation": "rejuvenescimento a laser",
    "laser harmony reference": "referência ao Laser Harmony",
    "laser light sheer duet reference": "referência ao Light Sheer Duet",
    "nd:yag education": "educação sobre ND:YAG",
    "fototipo considerations": "considerações de fototipo",
    "treatment suitability": "adequação do tratamento",
    "preparation guidance": "orientação de preparo",
    "aftercare guidance": "orientação de acompanhamento",
    "aftercare and risk disclaimer": "aviso sobre acompanhamento e riscos",
    "ethical results statement": "declaração de resultados éticos",
    "results-vary disclaimer": "aviso de variação de resultados",
    "expectation management": "gestão de expectativas",
    "case-card placeholders without fake claims": "cartões de caso sem promessas falsas",
    "consultation-before-results": "consulta antes dos resultados",
    "photo and testimonial policy": "política de fotos e depoimentos",
    "expectation-setting disclaimer": "aviso de alinhamento de expectativas",
    "what affects results": "o que afeta os resultados",
    "ethical testimonial policy": "política ética de depoimentos",
    "review card layout": "layout de cartão de avaliação",
    "anonymous testimonial style": "estilo de depoimento anônimo",
    "source verification note": "nota de verificação de fonte",
    "client experience themes": "temas da experiência da cliente",
    "no-guarantee disclaimer": "aviso sem garantia",
    "consultation journey quote slot": "espaço de citação da jornada de consulta",
    "trust section": "seção de confiança",
    "placeholder register": "registro de placeholders",
    "latest posts grid": "grade de posts recentes",
    "featured article": "artigo em destaque",
    "professional evaluation articles": "artigos sobre avaliação profissional",
    "laser articles": "artigos sobre laser",
    "skin care articles": "artigos sobre cuidados da pele",
    "aftercare articles": "artigos de acompanhamento",
    "technology articles": "artigos sobre tecnologia",
    "seasonal skin care": "cuidados sazonais da pele",
    "blog cta": "chamada para blog",
    "article section": "seção de artigo",
    "faq accordions": "acordeões de perguntas frequentes",
    "laser faq group": "grupo de perguntas sobre laser",
    "skin faq group": "grupo de perguntas sobre pele",
    "results faq group": "grupo de perguntas sobre resultados",
    "aftercare faq group": "grupo de perguntas sobre acompanhamento",
    "booking faq group": "grupo de perguntas sobre agendamento",
    "evaluation faq group": "grupo de perguntas sobre avaliação",
    "safety faq group": "grupo de perguntas sobre segurança",
    "privacy faq group": "grupo de perguntas sobre privacidade",
    "faq schema note": "nota de schema para perguntas frequentes",
    "micro faq": "micro perguntas frequentes",
    "privacy summary": "resumo de privacidade",
    "data use": "uso de dados",
    "sensitive information note": "nota sobre informações sensíveis",
    "analytics privacy": "privacidade em analytics",
    "instagram content policy": "política de conteúdo do Instagram",
    "image privacy": "privacidade de imagem",
    "address privacy": "privacidade de endereço",
    "data requests": "solicitações de dados",
    "retention note": "nota de retenção",
    "privacy cta": "chamada de privacidade",
    "cookie policy summary": "resumo da política de cookies",
    "necessary cookies": "cookies necessários",
    "analytics cookies": "cookies de analytics",
    "marketing cookies": "cookies de marketing",
    "managing preferences": "gestão de preferências",
    "consent banner": "banner de consentimento",
    "no hidden tracking": "sem rastreamento oculto",
    "form and hosting logs": "logs de formulário e hospedagem",
    "feedback contact": "contato para feedback",
    "accessibility statement link": "link da declaração de acessibilidade",
    "keyboard navigation": "navegação por teclado",
    "visible focus states": "estados de foco visíveis",
    "reduced motion": "movimento reduzido",
    "labelled forms": "formulários rotulados",
    "skip link": "link de pular",
    "semantic html": "HTML semântico",
    "contrast approach": "abordagem de contraste",
    "accessible mobile menu": "menu mobile acessível",
    "popular paths": "caminhos populares",
    "consultation route": "rota de consulta",
    "journal route": "rota do journal",
    "legal route": "rota legal",
    "contact route": "rota de contato",
    "concept selector": "seletor de conceitos",
    "safe copy reminder": "lembrete de texto seguro",
    "back to concept": "voltar ao conceito",
    "production note": "nota de produção",
    "consultation hero": "hero de consulta",
    "who the evaluation is for": "para quem é a avaliação",
    "what happens before booking": "o que acontece antes do agendamento",
    "what happens during evaluation": "o que acontece durante a avaliação",
    "what happens after evaluation": "o que acontece depois da avaliação",
    "what not to expect": "o que não esperar",
    "what to expect": "o que esperar",
    "what happens next": "o que acontece depois",
    "appointment expectations": "expectativas da consulta",
    "contact form": "formulário de contato",
    "consultation form": "formulário de consulta",
    "final cta": "chamada final",
    "journal preview": "prévia do journal",
    "blog preview": "prévia do blog",
    "mission preview": "prévia da missão",
    "values preview": "prévia dos valores",
    "faq preview": "prévia de perguntas frequentes",
    "consultation cta": "chamada para consulta",
    "contact cta": "chamada para contato",
    "journal cta": "chamada para conteúdo",
    "cookie cta": "chamada de cookies",
    "privacy notice": "aviso de privacidade",
    "professional disclaimer": "aviso profissional",
    "terms legal notice": "aviso legal de termos",
    "legal hub": "central legal",
    "launch checklist": "checklist de lançamento",
    "no full address rule": "regra de não exibir endereço completo",
    "professional responsibility": "responsabilidade profissional",
}

WORD_REPLACEMENTS = [
    ("English-first", "com português como padrão"),
    ("business-card-inspired", "inspirado em cartão de visita"),
    ("Business-Card-Inspired", "Inspirado em cartão de visita"),
    ("No-Guarantee", "Sem garantia"),
    ("FAQ-To-Article", "Perguntas para artigo"),
    ("CTA", "chamada"),
    ("FAQ", "perguntas frequentes"),
    ("Page", "Página"),
    ("page", "página"),
    ("Professional", "Profissional"),
    ("professional", "profissional"),
    ("Evaluation", "Avaliação"),
    ("evaluation", "avaliação"),
    ("Advanced", "Avançada"),
    ("advanced", "avançada"),
    ("Aesthetic", "Estética"),
    ("aesthetic", "estética"),
    ("Biomedicine", "Biomedicina"),
    ("biomedicine", "biomedicina"),
    ("Laser", "Laser"),
    ("laser", "laser"),
    ("Skin", "Pele"),
    ("skin", "pele"),
    ("Care", "Cuidado"),
    ("care", "cuidado"),
    ("Results", "Resultados"),
    ("results", "resultados"),
    ("Safety", "Segurança"),
    ("safety", "segurança"),
    ("Aftercare", "Acompanhamento"),
    ("aftercare", "acompanhamento"),
    ("Privacy", "Privacidade"),
    ("privacy", "privacidade"),
    ("Ethical", "Ética"),
    ("ethical", "ética"),
    ("Conversion", "Conversão"),
    ("conversion", "conversão"),
    ("Natural-Looking", "Aparência natural"),
    ("natural-looking", "aparência natural"),
    ("Personalised", "Personalizados"),
    ("personalised", "personalizados"),
    ("Protocols", "Protocolos"),
    ("protocols", "protocolos"),
    ("Protocol", "Protocolo"),
    ("protocol", "protocolo"),
    ("Technology", "Tecnologia"),
    ("technology", "tecnologia"),
    ("Mission", "Missão"),
    ("mission", "missão"),
    ("Values", "Valores"),
    ("values", "valores"),
    ("Preview", "Prévia"),
    ("preview", "prévia"),
    ("Consultation", "Consulta"),
    ("consultation", "consulta"),
    ("Contact", "Contato"),
    ("contact", "contato"),
    ("Journal", "Journal"),
    ("journal", "journal"),
    ("Blog", "Blog"),
    ("blog", "blog"),
    ("Testimonial", "Depoimento"),
    ("testimonial", "depoimento"),
    ("Testimonials", "Depoimentos"),
    ("testimonials", "depoimentos"),
    ("Policy", "Política"),
    ("policy", "política"),
    ("Statement", "Declaração"),
    ("statement", "declaração"),
    ("Section", "Seção"),
    ("section", "seção"),
    ("Articles", "Artigos"),
    ("articles", "artigos"),
    ("Article", "Artigo"),
    ("article", "artigo"),
    ("Route", "Rota"),
    ("route", "rota"),
    ("Link", "Link"),
    ("link", "link"),
    ("Form", "Formulário"),
    ("form", "formulário"),
    ("Menu", "Menu"),
    ("menu", "menu"),
    ("Mobile", "Mobile"),
    ("mobile", "mobile"),
    ("Selector", "Seletor"),
    ("selector", "seletor"),
    ("Concept", "Conceito"),
    ("concept", "conceito"),
    ("Trust", "Confiança"),
    ("trust", "confiança"),
    ("Line", "Linha"),
    ("line", "linha"),
    ("Copy", "Texto"),
    ("copy", "texto"),
    ("Reminder", "Lembrete"),
    ("reminder", "lembrete"),
    ("Note", "Nota"),
    ("note", "nota"),
    ("Summary", "Resumo"),
    ("summary", "resumo"),
    ("Notice", "Aviso"),
    ("notice", "aviso"),
    ("Data", "Dados"),
    ("data", "dados"),
    ("Cookies", "Cookies"),
    ("cookies", "cookies"),
    ("Cookie", "Cookie"),
    ("cookie", "cookie"),
    ("Preferences", "Preferências"),
    ("preferences", "preferências"),
    ("Accessibility", "Acessibilidade"),
    ("accessibility", "acessibilidade"),
    ("Accessible", "Acessível"),
    ("accessible", "acessível"),
    ("Navigation", "Navegação"),
    ("navigation", "navegação"),
    ("Keyboard", "Teclado"),
    ("keyboard", "teclado"),
    ("Focus", "Foco"),
    ("focus", "foco"),
    ("Visible", "Visíveis"),
    ("visible", "visíveis"),
    ("Motion", "Movimento"),
    ("motion", "movimento"),
    ("Reduced", "Reduzido"),
    ("reduced", "reduzido"),
    ("Search", "Busca"),
    ("search", "busca"),
    ("Filter", "Filtro"),
    ("filter", "filtro"),
    ("Category", "Categoria"),
    ("category", "categoria"),
    ("Quality", "Qualidade"),
    ("quality", "qualidade"),
    ("Philosophy", "Filosofia"),
    ("philosophy", "filosofia"),
    ("Journey", "Jornada"),
    ("journey", "jornada"),
    ("Purpose", "Propósito"),
    ("purpose", "propósito"),
    ("Warmth", "Acolhimento"),
    ("warmth", "acolhimento"),
    ("Commitment", "Compromisso"),
    ("commitment", "compromisso"),
    ("Value", "Valor"),
    ("value", "valor"),
    ("Value", "Valor"),
    ("value", "valor"),
    ("Education", "Educação"),
    ("education", "educação"),
    ("Guidance", "Orientação"),
    ("guidance", "orientação"),
    ("Expectation", "Expectativa"),
    ("expectation", "expectativa"),
    ("Management", "Gestão"),
    ("management", "gestão"),
    ("Disclaimer", "Aviso"),
    ("disclaimer", "aviso"),
    ("Source", "Fonte"),
    ("source", "fonte"),
    ("Verification", "Verificação"),
    ("verification", "verificação"),
    ("Client", "Cliente"),
    ("client", "cliente"),
    ("Experience", "Experiência"),
    ("experience", "experiência"),
    ("Themes", "Temas"),
    ("themes", "temas"),
    ("Placeholder", "Placeholder"),
    ("placeholder", "placeholder"),
    ("Register", "Registro"),
    ("register", "registro"),
    ("Popular", "Populares"),
    ("popular", "populares"),
    ("Paths", "Caminhos"),
    ("paths", "caminhos"),
    ("Back", "Voltar"),
    ("back", "voltar"),
    ("Found", "Encontrada"),
    ("found", "encontrada"),
    ("Not", "Não"),
    ("not", "não"),
    ("And", "e"),
    ("and", "e"),
    ("With", "com"),
    ("with", "com"),
    ("For", "para"),
    ("for", "para"),
    ("Of", "de"),
    ("of", "de"),
    ("To", "para"),
    ("to", "para"),
]


def load_existing_reverse_map() -> dict[str, str]:
    if not TRANSLATIONS_JS.exists():
        return {}
    text = TRANSLATIONS_JS.read_text(encoding="utf-8")
    match = re.search(r"window\.SofiatiTranslations\s*=\s*(\{.*\});?\s*$", text, re.S)
    if not match:
        return {}
    try:
        data = json.loads(match.group(1))
    except json.JSONDecodeError:
        return {}
    return data.get("ptToEn", {})


EXISTING_PT_TO_EN = load_existing_reverse_map()


def is_contact_or_code(value: str) -> bool:
    stripped = value.strip()
    if not stripped or not ALPHA_RE.search(stripped):
        return True
    if CONTACT_RE.search(stripped):
        return True
    if stripped in {"PT", "EN", "CRBM 6277", "Londrina, PR", "WhatsApp", "Instagram"}:
        return True
    return False


def translate_phrase(value: str) -> str:
    if value in EXACT:
        return EXACT[value]

    lookup = value.replace("-", " ").strip().lower()
    if lookup in PHRASES:
        return PHRASES[lookup]

    translated = value
    for source, target in sorted(PHRASES.items(), key=lambda item: len(item[0]), reverse=True):
        translated = re.sub(re.escape(source), target, translated, flags=re.I)

    for source, target in WORD_REPLACEMENTS:
        translated = re.sub(rf"\b{re.escape(source)}\b", target, translated)

    translated = translated.replace(" - ", " - ")
    translated = re.sub(r"\s+", " ", translated).strip()
    return translated


def translate_page_title(value: str) -> str | None:
    match = re.match(r"^(.+?) \| (\d{2}) (.+?) \| Franciele Sofiati$", value)
    if not match:
        return None
    page, number, name = match.groups()
    return f"{PAGE_LABELS.get(page, translate_phrase(page))} | {number} {name} | Franciele Sofiati"


def translate_text(value: str) -> str:
    original = value.strip()
    if not original:
        return value
    if original in EXISTING_PT_TO_EN:
        original = EXISTING_PT_TO_EN[original]
    if is_contact_or_code(original):
        return original
    if original in EXACT:
        return EXACT[original]
    page_title = translate_page_title(original)
    if page_title:
        return page_title

    match = re.match(
        r"^(.+?) page for the (.+?) Sofiati concept: English-first advanced aesthetic biomedicine, laser and skin care in Londrina, PR\.$",
        original,
    )
    if match:
        page, concept = match.groups()
        label = PAGE_LABELS.get(page, translate_phrase(page))
        return (
            f"Página {label.lower()} para o conceito Sofiati {concept}: "
            "biomedicina estética avançada com português como padrão, laser e cuidados da pele em Londrina, PR."
        )

    match = re.match(r"^(.+?) for advanced aesthetic care$", original)
    if match:
        label = PAGE_LABELS.get(match.group(1), translate_phrase(match.group(1)))
        return f"{label} para cuidado estético avançado"

    match = re.match(r"^Concept (\d{2}) - (.+)$", original)
    if match:
        return f"Conceito {match.group(1)} - {match.group(2)}"

    match = re.match(r"^Open concept (\d{2}) (.+)$", original)
    if match:
        return f"Abrir conceito {match.group(1)} {match.group(2)}"

    match = re.match(r"^Mobile: (.+?)\. Status: presentation-ready, approval required\.$", original)
    if match:
        return f"Mobile: {translate_phrase(match.group(1))}. Status: pronto para apresentação, aprovação necessária."

    match = re.match(r"^(An?|A) (.+?) concept for Franciele Sofiati with evaluation-first laser and skin care content\.$", original)
    if match:
        return f"Conceito de {translate_phrase(match.group(2))} para Franciele Sofiati, com laser e cuidados da pele orientados por avaliação."

    match = re.match(r"^(.+?) explores (.+?) for Sofiati\.$", original)
    if match:
        return f"{match.group(1)} explora {translate_phrase(match.group(2))} para Sofiati."

    match = re.match(r"^Part of the (.+?) concept with Sofiati botanical clinical luxury, professional evaluation and ethical copy\.$", original)
    if match:
        return f"Parte do conceito {match.group(1)} com luxo clínico botânico da Sofiati, avaliação profissional e texto ético."

    match = re.match(
        r"^Built for (.+?) with Sofiati's evaluation-first tone, botanical clinical calm and responsible boundaries\.$",
        original,
    )
    if match:
        return f"Criado para {match.group(1)} com o tom Sofiati orientado por avaliação, calma clínica botânica e limites responsáveis."

    match = re.match(
        r"^(.+?) keeps this page distinct while staying inside the Sofiati identity\.$",
        original,
    )
    if match:
        return f"{translate_phrase(match.group(1))} mantém esta página distinta enquanto permanece dentro da identidade Sofiati."

    match = re.match(
        r"^(.+?) uses (.+?), (.+?), (.+?) and (.+?) while preserving the Sofiati brand system\.$",
        original,
    )
    if match:
        page, layout, header, menu, footer = match.groups()
        return (
            f"{translate_phrase(page)} usa {translate_phrase(layout)}, {translate_phrase(header)}, "
            f"{translate_phrase(menu)} e {translate_phrase(footer)} enquanto preserva o sistema de marca Sofiati."
        )

    match = re.match(
        r"^This (.+?) component supports (.+?) with responsible English-first content for Franciele Sofiati, CRBM 6277, in Londrina, PR\.$",
        original,
    )
    if match:
        component, support = match.groups()
        return (
            f"Este componente de {translate_phrase(component)} apoia {translate_phrase(support)} "
            "com conteúdo responsável em português para Franciele Sofiati, CRBM 6277, em Londrina, PR."
        )

    match = re.match(
        r"^Franciele Sofiati - CRBM 6277 - Advanced Aesthetic Biomedicine - Londrina, PR\. "
        r"(.+?) uses (.+?), a (.+?), (.+?) and (.+?)\. "
        r"The content remains Sofiati-specific, ethical and evaluation-first\.$",
        original,
    )
    if match:
        name, layout, header, menu, footer = match.groups()
        return (
            "Franciele Sofiati - CRBM 6277 - Biomedicina Estética Avançada - Londrina, PR. "
            f"{name} usa {translate_phrase(layout)}, {translate_phrase(header)}, "
            f"{translate_phrase(menu)} e {translate_phrase(footer)}. "
            "O conteúdo permanece específico da Sofiati, ético e orientado por avaliação."
        )

    match = re.match(r"^Sofiati (.+?) concept visual in sage, ivory and botanical clinical luxury$", original)
    if match:
        return f"Visual do conceito Sofiati {PAGE_LABELS.get(match.group(1), translate_phrase(match.group(1)))} em sálvia, marfim e luxo clínico botânico"

    match = re.match(r"^Sofiati (.+?) visual for (.+)$", original)
    if match:
        page, detail = match.groups()
        return f"Visual Sofiati {PAGE_LABELS.get(page, translate_phrase(page))} para {translate_phrase(detail)}"

    if " - " in original:
        parts = [translate_phrase(part) for part in original.split(" - ")]
        return " - ".join(parts)

    translated = translate_phrase(original)
    return translated


def translate_preserving_space(value: str, maps: dict[str, str]) -> str:
    leading = re.match(r"^\s*", value).group(0)
    trailing = re.search(r"\s*$", value).group(0)
    core = value.strip()
    if not core:
        return value
    source = EXISTING_PT_TO_EN.get(core, core)
    translated = translate_text(source)
    if translated != source:
        maps[source] = translated
    return f"{leading}{translated}{trailing}"


def should_translate_meta(tag: Any) -> bool:
    if tag.name != "meta":
        return True
    key = tag.get("name") or tag.get("property") or ""
    return bool(re.search(r"description|title|image:alt|twitter", key))


def update_json_ld(script: Any, maps: dict[str, str]) -> None:
    raw = script.string
    if not raw:
        return
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        return

    def walk(value: Any) -> Any:
        if isinstance(value, dict):
            return {key: walk("pt-BR" if key == "inLanguage" and val == "en" else val) for key, val in value.items()}
        if isinstance(value, list):
            return [walk(item) for item in value]
        if isinstance(value, str):
            if value == "en":
                return "pt-BR"
            translated = translate_text(value)
            if translated != value:
                maps[value] = translated
            return translated
        return value

    script.string = json.dumps(walk(data), ensure_ascii=False, separators=(",", ":"))


def add_language_scripts(soup: BeautifulSoup) -> None:
    if soup.find("script", src=re.compile(r"js/translations\.js$")):
        return
    partials = soup.find("script", src=re.compile(r"js/partials\.js$"))
    if not partials:
        return
    src = partials.get("src", "")
    prefix = src[: -len("js/partials.js")] if src.endswith("js/partials.js") else ""
    translations = soup.new_tag("script", src=f"{prefix}js/translations.js")
    translations["defer"] = ""
    language = soup.new_tag("script", src=f"{prefix}js/language-switcher.js")
    language["defer"] = ""
    partials.insert_after(language)
    partials.insert_after(translations)


def translate_html(path: Path, maps: dict[str, str]) -> None:
    original_html = path.read_text(encoding="utf-8")
    relative_parts = path.relative_to(ROOT).parts
    is_fragment = relative_parts and relative_parts[0] == "partials"
    had_doctype = original_html.lstrip().lower().startswith("<!doctype") and not is_fragment
    soup = BeautifulSoup(original_html, "html.parser")

    if soup.html:
        soup.html["lang"] = "pt-BR"

    for node in soup.find_all(string=True):
        parent = node.parent
        if not parent or parent.name in SKIP_TEXT_PARENTS:
            continue
        if parent.has_attr("data-no-translate") or parent.find_parent(attrs={"data-no-translate": True}):
            continue
        new_value = translate_preserving_space(str(node), maps)
        if new_value != str(node):
            node.replace_with(NavigableString(new_value))

    for tag in soup.find_all(True):
        if tag.has_attr("data-no-translate") or tag.find_parent(attrs={"data-no-translate": True}):
            continue
        for attr in TRANSLATABLE_ATTRS:
            if not tag.has_attr(attr):
                continue
            if attr == "content" and not should_translate_meta(tag):
                continue
            current = tag.get(attr)
            if not isinstance(current, str):
                continue
            updated = translate_preserving_space(current, maps)
            if updated != current:
                tag[attr] = updated

    for script in soup.find_all("script", type="application/ld+json"):
        update_json_ld(script, maps)

    add_language_scripts(soup)

    rendered = str(soup)
    rendered = re.sub(r"^<!DOCTYPE html>\s*", "", rendered)
    if had_doctype:
        rendered = "<!doctype html>\n" + rendered
    path.write_text(rendered.rstrip() + "\n", encoding="utf-8")


def write_translation_js(maps: dict[str, str]) -> None:
    merged = {**EXACT, **maps}
    clean = {key: value for key, value in sorted(merged.items()) if key != value}
    reverse = {value: key for key, value in clean.items()}
    payload = {"enToPt": clean, "ptToEn": reverse}
    TRANSLATIONS_JS.write_text(
        "window.SofiatiTranslations = "
        + json.dumps(payload, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
        + ";\n",
        encoding="utf-8",
    )


def html_paths() -> list[Path]:
    blocked = {".git", "node_modules", "final", "final-screenshots"}
    paths = []
    for path in ROOT.rglob("*.html"):
        if any(part in blocked for part in path.relative_to(ROOT).parts):
            continue
        paths.append(path)
    return sorted(paths)


def main() -> None:
    maps: dict[str, str] = {}
    paths = html_paths()
    for path in paths:
        translate_html(path, maps)
    write_translation_js(maps)
    print(f"Translated {len(paths)} HTML files")
    print(f"Generated {TRANSLATIONS_JS.relative_to(ROOT)} with {len(maps)} strings")


if __name__ == "__main__":
    main()

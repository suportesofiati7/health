const visuals = [
  ['journal/articles/frugal-chic-window-ritual.webp', 'fa-leaf', 'O cuidado começa quando a vida desacelera.', 'Care begins when life slows down.', 'landscape'],
  ['journal/articles/frugal-chic-peony-amber.webp', 'fa-sparkles', 'Clareza antes de qualquer escolha.', 'Clarity before every choice.', 'landscape'],
  ['journal/articles/frugal-chic-morning-pause.webp', 'fa-heart', 'Uma conversa que respeita o seu tempo.', 'A conversation that respects your time.', 'landscape'],
  ['journal/articles/frugal-chic-conscious-ritual.webp', 'fa-sun', 'Menos excessos. Mais intenção.', 'Less excess. More intention.', 'portrait'],
  ['journal/articles/frugal-chic-evening-vanity.webp', 'fa-wand-magic-sparkles', 'Tecnologia precisa continuar humana.', 'Technology should remain human.', 'portrait'],
  ['portraits/Franciele-Sofiati.jpeg', 'fa-clock', 'Pausa também é parte do plano.', 'A pause belongs in the plan, too.', 'portrait'],
  ['journal/articles/frugal-chic-peony-amber.webp', 'fa-shield-heart', 'Segurança é uma escolha bonita.', 'Safety is a beautiful choice.', 'landscape'],
  ['journal/articles/frugal-chic-morning-pause.webp', 'fa-gem', 'A beleza continua tendo a sua voz.', 'Beauty keeps your voice.', 'landscape'],
  ['journal/articles/frugal-chic-evening-vanity.webp', 'fa-seedling', 'Uma escolha que continua com você.', 'A choice that stays with you.', 'portrait'],
];

export function initFrugalChic() {
  const article = document.querySelector('.sja-article--frugal-chic');
  if (!article || article.dataset.frugalChicReady === 'true') return;
  article.dataset.frugalChicReady = 'true';
  const english = document.documentElement.lang.startsWith('en');
  const base = english ? '../../assets/' : '../assets/';
  const sections = [...article.querySelectorAll('.sja-reading-section')];
  sections.forEach((section, index) => {
    const item = visuals[index % visuals.length];
    const title = section.querySelector('h2')?.textContent?.trim();
    const marker = document.createElement('p');
    marker.className = 'sja-chapter-mark';
    marker.innerHTML = `<i class="fa-solid ${item[1]}" aria-hidden="true"></i><span>${String(index + 1).padStart(2, '0')} · ${title || (english ? 'A considered pause' : 'Uma pausa consciente')}</span>`;
    section.prepend(marker);
    const figure = document.createElement('figure');
    figure.className = `sja-editorial-image sja-editorial-image--${item[4]} sja-editorial-image--chapter`;
    figure.innerHTML = `<img src="${base}${item[0]}" alt="${item[2]}" loading="lazy"><figcaption>${english ? item[3] : item[2]}</figcaption>`;
    section.after(figure);
    const chapter = document.createElement('div');
    chapter.className = `sja-editorial-chapter sja-editorial-chapter--${index % 2 ? 'reverse' : 'standard'}`;
    section.before(chapter);
    chapter.append(section, figure);
  });
}

const visuals = [
  ['journal/articles/frugal-chic-window-ritual.webp', 'fa-leaf', 'O cuidado começa quando a vida desacelera.', 'Care begins when life slows down.', 'landscape'],
  ['journal/articles/frugal-chic-peony-amber.webp', 'fa-star', 'Clareza antes de qualquer escolha.', 'Clarity before every choice.', 'landscape'],
  ['journal/articles/frugal-chic-morning-pause.webp', 'fa-heart', 'Uma conversa que respeita o seu tempo.', 'A conversation that respects your time.', 'landscape'],
  ['journal/articles/frugal-chic-conscious-ritual.webp', 'fa-sun', 'Menos excessos. Mais intenção.', 'Less excess. More intention.', 'portrait'],
  ['journal/articles/frugal-chic-evening-vanity.webp', 'fa-wand-magic-sparkles', 'Tecnologia precisa continuar humana.', 'Technology should remain human.', 'portrait'],
  ['portraits/Franciele-Sofiati.jpeg', 'fa-clock', 'Pausa também é parte do plano.', 'A pause belongs in the plan, too.', 'portrait'],
  ['journal/articles/frugal-chic-peony-amber.webp', 'fa-shield-heart', 'Segurança é uma escolha bonita.', 'Safety is a beautiful choice.', 'landscape'],
  ['journal/articles/frugal-chic-morning-pause.webp', 'fa-gem', 'A beleza continua tendo a sua voz.', 'Beauty keeps your voice.', 'landscape'],
  ['journal/articles/frugal-chic-sage-safety-ritual.webp', 'fa-seedling', 'Segurança também pode ser serena.', 'Safety can be serene, too.', 'portrait'],
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

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) return;

  article.classList.add('fc-motion-enabled');
  const chapters = [...article.querySelectorAll('.sja-editorial-chapter')];
  const progress = document.createElement('div');
  progress.className = 'fc-reading-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.append(progress);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      entry.target.querySelector('.sja-chapter-mark')?.classList.add('is-active');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
  chapters.forEach((chapter) => observer.observe(chapter));

  const hero = article.querySelector('.sja-hero--frugal-chic');
  const heroImage = hero?.querySelector('img');
  const chapterOffsets = new Map(chapters.map((chapter) => [chapter, 0]));
  const chapterTargets = new Map(chapters.map((chapter) => [chapter, 0]));
  let ticking = false;
  let easing = false;
  const easeChapters = () => {
    let keepAnimating = false;
    chapters.forEach((chapter) => {
      const current = chapterOffsets.get(chapter) || 0;
      const target = chapterTargets.get(chapter) || 0;
      const next = current + (target - current) * 0.13;
      chapterOffsets.set(chapter, next);
      chapter.style.setProperty('--fc-float', `${next.toFixed(2)}px`);
      if (Math.abs(target - next) > 0.04) keepAnimating = true;
    });
    if (keepAnimating) window.requestAnimationFrame(easeChapters);
    else easing = false;
  };
  const updateMotion = () => {
    const start = article.getBoundingClientRect().top + window.scrollY;
    const end = article.getBoundingClientRect().bottom + window.scrollY - window.innerHeight;
    const value = Math.min(1, Math.max(0, (window.scrollY - start) / Math.max(1, end - start)));
    progress.style.setProperty('--fc-progress', `${value * 100}%`);
    if (hero && heroImage && window.matchMedia('(pointer: fine)').matches) {
      const distance = Math.max(-180, Math.min(180, window.scrollY - (hero.getBoundingClientRect().top + window.scrollY)));
      heroImage.style.transform = `scale(1.18) translateY(${distance * .035}px)`;
    }
    chapters.forEach((chapter, index) => {
      const rect = chapter.getBoundingClientRect();
      const centerOffset = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
      const direction = index % 2 ? -1 : 1;
      const shift = Math.max(-12, Math.min(12, centerOffset * 14 * direction));
      chapterTargets.set(chapter, shift);
    });
    if (!easing) { easing = true; window.requestAnimationFrame(easeChapters); }
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { window.requestAnimationFrame(updateMotion); ticking = true; }
  }, { passive: true });
  updateMotion();
}

import { qs, qsa } from '../core/dom.js';

export function initBlogSearch() {
  const form = qs('[data-blog-search]');
  if (!form || form.dataset.sfBlogSearchReady === 'true') return;
  form.dataset.sfBlogSearchReady = 'true';
  const queryInput = qs('input[type="search"]', form);
  const topicSelect = qs('select[name="topic"]', form);
  const emptyState = qs('[data-search-empty]');
  const cards = qsa('.c01-page-blog .sf-content-card').filter((card) => !card.closest('[data-section="9"], [data-section="10"]'));

  const apply = () => {
    const query = (queryInput?.value || '').trim().toLocaleLowerCase();
    const topic = (topicSelect?.value || '').replace(/-/g, ' ').toLocaleLowerCase();
    const allTopics = !topic || topic.startsWith('all ');
    let visible = 0;
    cards.forEach((card) => {
      const text = `${card.closest('section')?.querySelector('.sf-eyebrow')?.textContent || ''} ${card.textContent}`.toLocaleLowerCase();
      const matchesQuery = !query || text.includes(query);
      const matchesTopic = allTopics || text.includes(topic);
      card.hidden = !(matchesQuery && matchesTopic);
      if (!card.hidden) visible += 1;
    });
    if (emptyState) emptyState.hidden = visible > 0;
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    apply();
    (emptyState && !emptyState.hidden ? emptyState : queryInput)?.focus?.({ preventScroll: true });
  });
  queryInput?.addEventListener('input', apply);
  topicSelect?.addEventListener('change', apply);
}

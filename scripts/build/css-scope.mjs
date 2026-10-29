import postcss from 'postcss';

// Keep shared and dynamic components. Prune only rules explicitly scoped to
// another page and standalone journal components on non-journal pages.
export function cssForPage(source, page) {
  const root = postcss.parse(source);
  const journal = ['journal', 'blog'].includes(page);
  root.walkRules(rule => {
    if (rule.parent?.type === 'atrule' && /keyframes$/.test(rule.parent.name)) return;
    const selectors = rule.selectors.filter(selector => {
      if (selector.includes(':not(')) return true;
      const pageScopes = [...selector.matchAll(/\.sf-page\[data-page=["']([^"']+)["']\]/g)].map(match => match[1]);
      if (pageScopes.length && !pageScopes.includes(page)) return false;
      if (!journal && /^(?:\.(?:sja-|sj-|sf-journal-)|body\.sf-journal)/.test(selector)) return false;
      return true;
    });
    if (!selectors.length) rule.remove();
    else rule.selectors = selectors;
  });
  return root.toString();
}

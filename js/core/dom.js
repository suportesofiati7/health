export const qs = (selector, root = document) => root.querySelector(selector);

export const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));

export function setTextContent(selector, text, root = document) {
  qsa(selector, root).forEach((node) => {
    if (node.textContent !== text) node.textContent = text;
  });
}

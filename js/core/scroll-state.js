const subscribers = new Set();

let frame = 0;
let started = false;
let previousY = window.scrollY || document.documentElement.scrollTop || 0;

const current = {
  y: previousY,
  progress: 0,
  direction: 'up',
  documentHeight: document.documentElement.scrollHeight,
  viewportHeight: window.innerHeight
};

function readScrollState() {
  frame = 0;
  const y = window.scrollY || document.documentElement.scrollTop || 0;
  const viewportHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;
  const available = Math.max(1, documentHeight - viewportHeight);

  if (Math.abs(y - previousY) > 3) {
    current.direction = y > previousY ? 'down' : 'up';
    previousY = y;
  }

  current.y = y;
  current.progress = Math.min(1, Math.max(0, y / available));
  current.documentHeight = documentHeight;
  current.viewportHeight = viewportHeight;

  document.documentElement.style.setProperty('--sf-scroll-progress', current.progress.toFixed(4));
  document.documentElement.dataset.sfScrolled = y > 18 ? 'true' : 'false';
  document.documentElement.dataset.sfScrollDirection = current.direction;
  subscribers.forEach((subscriber) => subscriber(current));
}

function queueRead() {
  if (frame) return;
  frame = window.requestAnimationFrame(readScrollState);
}

export function subscribeToScroll(subscriber) {
  if (typeof subscriber !== 'function') return () => {};
  subscribers.add(subscriber);
  subscriber(current);
  return () => subscribers.delete(subscriber);
}

export function initScrollState() {
  if (started) return;
  started = true;
  readScrollState();
  window.addEventListener('scroll', queueRead, { passive: true });
  window.addEventListener('resize', queueRead, { passive: true });
}

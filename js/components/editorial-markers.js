function markerTone(section) {
  const scene = section.dataset.scene || '';
  const tone = section.dataset.tone || '';
  return tone === 'forest' || /olive|forest/i.test(scene)
    ? 'section-marker--green'
    : 'section-marker--light';
}

function makeMarker(sectionHead) {
  const number = sectionHead.querySelector(':scope > .sf-chapter-number, :scope > .sf-values-number');
  const eyebrow = sectionHead.querySelector(':scope > .sf-eyebrow');

  if (!number || !eyebrow || sectionHead.querySelector(':scope > .section-marker')) return;

  const section = sectionHead.closest('.sf-section');
  if (!section) return;

  const value = Number.parseInt(number.textContent, 10);
  if (Number.isFinite(value)) number.textContent = String(value).padStart(2, '0');

  const marker = document.createElement('div');
  marker.className = `section-marker ${markerTone(section)}`;
  number.className = 'section-marker__number';
  eyebrow.className = 'section-marker__eyebrow';
  marker.append(number, eyebrow);
  const anchoredHomepageSections = new Set(['care-standard', 'meet-franciele']);
  if (anchoredHomepageSections.has(section.id)) {
    const canvas = section.querySelector('.sf-canvas');
    if (canvas) {
      marker.classList.add('section-marker--anchored');
      canvas.prepend(marker);
      return;
    }
  }

  sectionHead.prepend(marker);
}

function markMediaSide(layout) {
  const media = layout.querySelector(':scope > .sf-editorial-media');
  const copy = layout.querySelector(':scope > .sf-section-inner');
  if (!media || !copy) return;

  const mediaColumn = Number.parseInt(getComputedStyle(media).gridColumnStart, 10);
  const copyColumn = Number.parseInt(getComputedStyle(copy).gridColumnStart, 10);
  layout.classList.toggle('sf-editorial-media-layout--media-left', Number.isFinite(mediaColumn) && Number.isFinite(copyColumn) && mediaColumn < copyColumn);
}

export function initEditorialMarkers() {
  document.querySelectorAll('.sf-section-head, .sf-editorial-kicker, .sf-form-section-intro, .sf-values-heading').forEach(makeMarker);

  const updateMediaSides = () => document.querySelectorAll('.sf-editorial-media-layout').forEach(markMediaSide);
  updateMediaSides();
  window.addEventListener('resize', updateMediaSides, { passive: true });
}

// Copy-to-clipboard handler (supports raw text or absolute URL resolution)
document.addEventListener('click', async (e) => {
  const el = e.target.closest('[data-copy]');
  if (!el) return;

  e.preventDefault();
  const raw = el.getAttribute('data-copy') ?? '';

  // Explicit modes (override heuristics)
  const forceRaw = el.hasAttribute('data-copy-raw');
  const forceUrl = el.hasAttribute('data-copy-url');

  // Heuristics only if no explicit mode is set
  const looksAbsoluteUrl = /^https?:\/\/\S+/i.test(raw);
  const looksFilePath =
    /^(\/|\.{1,2}\/|assets\/)/i.test(raw) &&
    /\.(pdf|png|jpe?g|webp|gif|svg|docx?|xlsx?|pptx?|zip)$/i.test(raw);

  const toCopy =
    !forceRaw && (forceUrl || looksAbsoluteUrl || looksFilePath)
      ? new URL(raw, location.href).href
      : raw;

  if (!navigator.clipboard || !navigator.clipboard.writeText) {
    alert('Copiado no soportado en este navegador');
    return;
  }

  try {
    await navigator.clipboard.writeText(toCopy);

    // Non-destructive feedback for inline icon triggers
    if (el.classList.contains('copy-inline')) {
      const prevTitle = el.getAttribute('title') || '';
      el.dataset.prevTitle = prevTitle;
      el.setAttribute('title', 'Copiado ✓');
      el.classList.add('is-copied');
      setTimeout(() => {
        el.classList.remove('is-copied');
        el.setAttribute('title', el.dataset.prevTitle || '');
        delete el.dataset.prevTitle;
      }, 1400);
    } else {
      // Button-like triggers: temporary label swap
      const prevHTML = el.innerHTML;
      el.dataset.prevHtml = prevHTML;
      el.innerHTML = 'Copiado ✓';
      setTimeout(() => {
        el.innerHTML = el.dataset.prevHtml || prevHTML;
        delete el.dataset.prevHtml;
      }, 1400);
    }
  } catch {
    alert('No se pudo copiar el contenido');
  }
});

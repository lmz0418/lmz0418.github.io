// The cursor's tip stays on the actual pointer coordinate, including top-layer dialogs.
(() => {
  const fine = matchMedia('(any-pointer: fine)');
  const cursor = document.createElement('div');
  cursor.className = 'mingze-cursor';
  cursor.dataset.version = 'illustrator-arrow-1';
  cursor.setAttribute('aria-hidden', 'true');
  cursor.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44"><path d="M4 2 L32 29.5 L18.25 29.5 L4 42 Z" fill="#d2d2d2" stroke="#555555" stroke-width=".8" stroke-linejoin="round"/></svg>';
  const popover = typeof cursor.showPopover === 'function';
  if (popover) cursor.setAttribute('popover', 'manual');
  else cursor.style.display = 'none';
  document.body.append(cursor);
  let visible = false;
  let lastSurface = null;

  function hide() {
    visible = false;
    lastSurface = null;
    cursor.classList.remove('is-pressed', 'is-interactive');
    document.body.classList.remove('mingze-pointer');
    if (popover) {
      if (cursor.matches(':popover-open')) cursor.hidePopover();
    } else cursor.style.display = 'none';
  }

  if (popover) cursor.addEventListener('toggle', () => {
    if (!cursor.matches(':popover-open')) hide();
  });

  document.addEventListener('pointermove', event => {
    if (!fine.matches || event.pointerType === 'touch') { hide(); return; }
    const surface = document.fullscreenElement || document.querySelector('dialog[open]');
    if (!visible || surface !== lastSurface || (popover && !cursor.matches(':popover-open'))) {
      try {
        if (popover) {
          cursor.style.removeProperty('display');
          if (cursor.matches(':popover-open')) cursor.hidePopover();
          cursor.showPopover();
        } else {
          (surface || document.body).append(cursor);
          cursor.style.display = 'block';
        }
        if (!cursor.isConnected || !cursor.getBoundingClientRect().width) { hide(); return; }
      } catch { hide(); return; }
      visible = true;
      lastSurface = surface;
      document.body.classList.add('mingze-pointer');
    }
    cursor.style.transform = `translate3d(${event.clientX - 4}px,${event.clientY - 2}px,0)`;
    const target = event.target instanceof Element ? event.target : null;
    const interactive = target?.closest('a, button, [role="button"], summary, input, select, textarea, .work-image, [data-lightbox]') || document.body.classList.contains('film-pointer');
    cursor.classList.toggle('is-interactive', Boolean(interactive));
  }, { passive: true });
  document.addEventListener('pointerdown', event => {
    if (visible && event.pointerType !== 'touch') cursor.classList.add('is-pressed');
  }, { passive: true });
  document.addEventListener('pointerup', () => cursor.classList.remove('is-pressed'), { passive: true });
  document.addEventListener('pointercancel', hide, { passive: true });
  document.documentElement.addEventListener('pointerleave', hide);
  addEventListener('blur', hide);
  document.addEventListener('visibilitychange', () => { if (document.hidden) hide(); });
  fine.addEventListener('change', hide);
})();

// Interacciones del sitio (sin dependencias).

const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => [...root.querySelectorAll<T>(sel)];
const ANCHOR_OFFSET = 165; // mismo desfase que tenía el sitio original al saltar a una sección

/* ---------- Menú móvil ---------- */
const mToggle = $<HTMLButtonElement>('[data-mnav-toggle]');
const mNav = $('[data-mnav]');
mToggle?.addEventListener('click', () => {
  const open = mToggle.getAttribute('aria-expanded') === 'true';
  mToggle.setAttribute('aria-expanded', String(!open));
  if (mNav) mNav.hidden = open;
});
for (const btn of $$<HTMLButtonElement>('.mnav__sub-toggle')) {
  btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!open));
    const sub = document.getElementById(btn.getAttribute('aria-controls') ?? '');
    if (sub) sub.hidden = open;
  });
}
$$('.mnav a').forEach((a) => a.addEventListener('click', () => {
  if (a.getAttribute('href')?.includes('#') && mNav && mToggle) { mNav.hidden = true; mToggle.setAttribute('aria-expanded', 'false'); }
}));

/* ---------- Mega menú en pantallas táctiles: primer toque abre ---------- */
for (const li of $$('.nav__item--mega')) {
  const link = $(':scope > .nav__link', li);
  link?.addEventListener('click', (e) => {
    const mega = $('.mega', li);
    const megaShown = !!mega && getComputedStyle(mega).display !== 'none';
    if (megaShown && window.matchMedia('(hover: none)').matches && !li.classList.contains('is-open')) {
      e.preventDefault();
      $$('.nav__item--mega.is-open').forEach((o) => o.classList.remove('is-open'));
      li.classList.add('is-open');
    }
  });
}
document.addEventListener('click', (e) => {
  if (!(e.target as Element).closest('.nav__item--mega')) $$('.nav__item--mega.is-open').forEach((o) => o.classList.remove('is-open'));
});

/* ---------- Búsqueda ---------- */
type Doc = { t: string; u: string; x: string };
const search = $('[data-search]');
const sOpen = $<HTMLButtonElement>('[data-search-open]');
const sInput = $<HTMLInputElement>('[data-search-input]');
const sResults = $<HTMLUListElement>('[data-search-results]');
let index: Doc[] | null = null;
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

async function loadIndex(): Promise<Doc[]> {
  if (index) return index;
  const lang = sResults?.dataset.lang === 'en' ? 'en' : 'es';
  try { index = await (await fetch(`/search-${lang}.json`)).json(); } catch { index = []; }
  return index!;
}
function closeSearch() {
  if (!search || !sOpen) return;
  search.hidden = true; sOpen.setAttribute('aria-expanded', 'false');
  if (sResults) { sResults.hidden = true; sResults.innerHTML = ''; }
  sOpen.focus();
}
sOpen?.addEventListener('click', () => {
  if (!search) return;
  search.hidden = false; sOpen.setAttribute('aria-expanded', 'true');
  sInput?.focus(); loadIndex();
});
$('[data-search-close]')?.addEventListener('click', closeSearch);
async function runSearch(q: string) {
  if (!sResults) return;
  const n = norm(q.trim());
  if (n.length < 3) { sResults.hidden = true; sResults.innerHTML = ''; return; }
  const docs = await loadIndex();
  const terms = n.split(/\s+/);
  const hits = docs
    .map((d) => ({ d, s: terms.reduce((acc, t) => acc + (norm(d.t).includes(t) ? 5 : 0) + (norm(d.x).includes(t) ? 1 : 0), 0) }))
    .filter((h) => terms.every((t) => norm(d2s(h.d)).includes(t)))
    .sort((a, b) => b.s - a.s)
    .slice(0, 8);
  sResults.innerHTML = '';
  if (!hits.length) {
    const li = document.createElement('li'); li.className = 'search__empty';
    li.textContent = sResults.dataset.lang === 'en' ? 'No results found.' : 'No se encontraron resultados.';
    sResults.append(li);
  }
  for (const { d } of hits) {
    const li = document.createElement('li'); const a = document.createElement('a');
    a.href = d.u; a.textContent = d.t; li.append(a); sResults.append(li);
  }
  sResults.hidden = false;
}
const d2s = (d: Doc) => `${d.t} ${d.x}`;
let sTimer: number | undefined;
sInput?.addEventListener('input', () => { clearTimeout(sTimer); sTimer = window.setTimeout(() => runSearch(sInput.value), 150); });
$('[data-search-form]')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const first = sResults?.querySelector<HTMLAnchorElement>('a');
  if (first) window.location.href = first.href; else if (sInput) runSearch(sInput.value);
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && search && !search.hidden) closeSearch(); });

/* ---------- Modales ---------- */
function openModal(name: string) {
  const dlg = document.getElementById(`modal-${name}`) as HTMLDialogElement | null;
  if (!dlg) return;
  dlg.showModal();
  document.documentElement.classList.add('has-modal');
}
document.addEventListener('click', (e) => {
  const trigger = (e.target as Element).closest<HTMLElement>('[data-modal]');
  if (trigger) { e.preventDefault(); openModal(trigger.dataset.modal!); return; }
  const close = (e.target as Element).closest('[data-close]');
  if (close) close.closest('dialog')?.close();
});
for (const dlg of $$<HTMLDialogElement>('dialog.modal')) {
  dlg.addEventListener('close', () => document.documentElement.classList.remove('has-modal'));
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); }); // clic en el fondo cierra
}

/* ---------- Pestañas ---------- */
for (const tabs of $$('.tabs')) {
  const btns = $$<HTMLButtonElement>(':scope > .tabs__nav > .tabs__tab', tabs);
  const accs = $$<HTMLButtonElement>(':scope > .tabs__panels > .tabs__acc', tabs);
  const panels = $$(':scope > .tabs__panels > .tabs__panel', tabs);
  const select = (i: number, focus = false) => {
    btns.forEach((b, j) => { b.setAttribute('aria-selected', String(i === j)); b.tabIndex = i === j ? 0 : -1; });
    accs.forEach((b, j) => b.setAttribute('aria-expanded', String(i === j)));
    panels.forEach((p, j) => { p.hidden = i !== j; });
    if (focus) btns[i]?.focus();
  };
  btns.forEach((b, i) => {
    b.addEventListener('click', () => select(i));
    b.addEventListener('keydown', (e) => {
      const next = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
      if (next) { e.preventDefault(); select((i + next + btns.length) % btns.length, true); }
    });
  });
  accs.forEach((b, i) => b.addEventListener('click', () => select(i)));
}

/* ---------- Acordeón ---------- */
for (const acc of $$('.acc')) {
  const single = acc.dataset.single === 'true';
  const btns = $$<HTMLButtonElement>('.acc__btn', acc);
  for (const b of btns) {
    b.addEventListener('click', () => {
      const open = b.getAttribute('aria-expanded') === 'true';
      if (single) btns.forEach((o) => { if (o !== b) { o.setAttribute('aria-expanded', 'false'); const p = document.getElementById(o.getAttribute('aria-controls')!); if (p) p.hidden = true; } });
      b.setAttribute('aria-expanded', String(!open));
      const panel = document.getElementById(b.getAttribute('aria-controls')!);
      if (panel) panel.hidden = open;
    });
  }
}

/* ---------- Animaciones de entrada ---------- */
const animated = $$('[data-anim]');
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const io = new IntersectionObserver((entries) => {
    for (const en of entries) {
      if (!en.isIntersecting) continue;
      const el = en.target as HTMLElement;
      el.style.setProperty('--anim-dur', el.dataset.animDur ?? '1');
      el.classList.add('is-in');
      io.unobserve(el);
    }
  }, { rootMargin: '0px 0px -10% 0px' });
  animated.forEach((el) => io.observe(el));
} else {
  animated.forEach((el) => el.classList.add('is-in'));
}

/* ---------- Scroll a anclas con desfase (cabecera fija) ---------- */
function scrollToId(id: string, smooth = true) {
  const target = document.getElementById(decodeURIComponent(id));
  if (!target) return false;
  const y = target.getBoundingClientRect().top + window.scrollY - ANCHOR_OFFSET;
  window.scrollTo({ top: Math.max(0, y), behavior: smooth ? 'smooth' : 'auto' });
  return true;
}
document.addEventListener('click', (e) => {
  const a = (e.target as Element).closest<HTMLAnchorElement>('a[href]');
  if (!a || a.dataset.modal !== undefined) return;
  const href = a.getAttribute('href')!;
  if (href === '#') {
    if (a.closest('.ftr, .btn-wrap, .sec')) { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); } // "Back to top"
    return;
  }
  const url = new URL(a.href, location.href);
  if (url.origin === location.origin && url.pathname === location.pathname && url.hash) {
    if (scrollToId(url.hash.slice(1))) { e.preventDefault(); history.replaceState(null, '', url.hash); }
  }
});
if (location.hash) window.addEventListener('load', () => scrollToId(location.hash.slice(1), false));

/* ---------- Aviso al salir a sitios externos ---------- */
const leave = $<HTMLDialogElement>('[data-leave]');
const leaveLink = $<HTMLAnchorElement>('[data-leave-link]');
const LEAVE_EXCLUDE = ['facebank.pr', 'secureib.facebank.pr'];
document.addEventListener('click', (e) => {
  const a = (e.target as Element).closest<HTMLAnchorElement>('a[href]');
  if (!a || !leave || !leaveLink || e.defaultPrevented) return;
  let url: URL;
  try { url = new URL(a.href); } catch { return; }
  if (!/^https?:$/.test(url.protocol) || LEAVE_EXCLUDE.includes(url.hostname) || url.origin === location.origin) return;
  e.preventDefault();
  leaveLink.href = url.href;
  leaveLink.textContent = url.href;
  leaveLink.target = a.target || '_self';
  leave.showModal();
});
leaveLink?.addEventListener('click', () => leave?.close());
$('[data-leave-cancel]')?.addEventListener('click', (e) => { e.preventDefault(); leave?.close(); });
leave?.addEventListener('click', (e) => { if (e.target === leave) leave.close(); });

/* ---------- Flip boxes: misma altura para todas las de la página (como el original) ---------- */
const flips = $$('.flip__inner');
function equalizeFlips() {
  if (!flips.length) return;
  document.documentElement.style.removeProperty('--flip-h');
  let max = 0;
  for (const f of flips) {
    for (const face of $$(':scope > .flip__front, :scope > .flip__back', f)) {
      // Réplica intencionada del sitio original: allí la altura se calcula cuando las imágenes aún
      // son el marcador cuadrado del lazy-load, así que cada imagen cuenta como cuadrada.
      // Para cajas ajustadas a la foto, usar simplemente face.offsetHeight.
      const img = face.querySelector('img');
      const extra = img ? Math.max(0, img.offsetWidth - img.offsetHeight) : 0;
      max = Math.max(max, face.offsetHeight + extra);
    }
  }
  document.documentElement.style.setProperty('--flip-h', `${Math.ceil(max)}px`);
}
if (flips.length) {
  window.addEventListener('load', equalizeFlips);
  let rt: number | undefined;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = window.setTimeout(equalizeFlips, 150); });
  equalizeFlips();
}

/* ---------- Botones "Copiar" (Ayuda para Venezuela) ----------
   En el sitio original eran HTML sin funcionalidad; aquí copian el dato que tienen al lado. */
for (const btn of $$<HTMLButtonElement>('.main button[type="button"]')) {
  const label = btn.textContent?.trim();
  if (label !== 'Copiar' && label !== 'Copy') continue;
  btn.addEventListener('click', async () => {
    const holder = btn.parentElement;
    if (!holder) return;
    const value = [...holder.childNodes].filter((n) => n !== btn).map((n) => n.textContent ?? '').join(' ').replace(/\s+/g, ' ').trim();
    try {
      await navigator.clipboard.writeText(value);
      btn.textContent = label === 'Copy' ? 'Copied' : 'Copiado';
      setTimeout(() => { btn.textContent = label; }, 1500);
    } catch { /* sin permiso de portapapeles: no hace nada, como el original */ }
  });
}

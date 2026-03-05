/* ═══════════════════════════════════════
   UCDP — Shared JS
   • Hero Carousel
   • Photo Gallery Lightbox
   • Scroll Reveal
═══════════════════════════════════════ */

/* ── SCROLL REVEAL ── */
document.addEventListener('DOMContentLoaded', () => {
  const reveals = document.querySelectorAll('.reveal');
  const ro = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); ro.unobserve(e.target); } });
  }, { threshold: 0.1 });
  reveals.forEach(el => ro.observe(el));

  initCarousel();
  initGallery();
});

/* ══════════════════════════════════════
   HERO CAROUSEL
══════════════════════════════════════ */
function initCarousel() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots   = document.querySelectorAll('.carousel-dot');
  if (!slides.length) return;

  let current = 0;
  let timer;

  // Captions for each slide (edit these to match your photos)
  const captions = [
    'Community outreach in Kisumu County',
    'Children supported by the UCDP Kindergarten Programme',
    'Mobile Youth Work & Child Advocacy — field team in action',
    'UCDP Community Clinic serving children under 18',
    'Tailoring & Dressmaking Programme graduates'
  ];

  function goTo(n) {
    slides[current].classList.remove('active');
    dots[current]?.classList.remove('active');
    current = (n + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current]?.classList.add('active');
    const cap = document.querySelector('.hero-caption');
    if (cap && captions[current]) cap.textContent = captions[current];
  }

  function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => goTo(current + 1), 5000);
  }

  // Init
  slides[0].classList.add('active');
  dots[0]?.classList.add('active');
  startTimer();

  // Arrows
  document.querySelector('.carousel-arrow.next')?.addEventListener('click', () => { goTo(current + 1); startTimer(); });
  document.querySelector('.carousel-arrow.prev')?.addEventListener('click', () => { goTo(current - 1); startTimer(); });

  // Dots
  dots.forEach((d, i) => d.addEventListener('click', () => { goTo(i); startTimer(); }));

  // Pause on hover
  const hero = document.querySelector('.hero-carousel');
  hero?.addEventListener('mouseenter', () => clearInterval(timer));
  hero?.addEventListener('mouseleave', startTimer);
}

/* ══════════════════════════════════════
   GALLERY LIGHTBOX
══════════════════════════════════════ */
function initGallery() {
  const thumbs = Array.from(document.querySelectorAll('.gallery-thumb:not(.empty)'));
  if (!thumbs.length) return;

  // Build lightbox DOM if not present
  if (!document.getElementById('ucdp-lightbox')) {
    document.body.insertAdjacentHTML('beforeend', `
      <div class="lightbox" id="ucdp-lightbox" role="dialog" aria-modal="true">
        <div class="lightbox-inner">
          <button class="lightbox-close" id="lb-close" aria-label="Close">✕</button>
          <img id="lb-img" src="" alt=""/>
          <div class="lightbox-caption" id="lb-caption"></div>
        </div>
        <button class="lightbox-arrow lb-prev" id="lb-prev" aria-label="Previous">&#8592;</button>
        <button class="lightbox-arrow lb-next" id="lb-next" aria-label="Next">&#8594;</button>
        <div class="lightbox-counter" id="lb-counter"></div>
      </div>
    `);
  }

  const lb       = document.getElementById('ucdp-lightbox');
  const lbImg    = document.getElementById('lb-img');
  const lbCap    = document.getElementById('lb-caption');
  const lbCnt    = document.getElementById('lb-counter');
  const lbClose  = document.getElementById('lb-close');
  const lbPrev   = document.getElementById('lb-prev');
  const lbNext   = document.getElementById('lb-next');
  let current    = 0;

  function open(i) {
    current = i;
    const img = thumbs[i].querySelector('img');
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lbCap.textContent = img.alt || '';
    lbCnt.textContent = `${i + 1} / ${thumbs.length}`;
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
    lbImg.src = '';
  }

  function prev() { open((current - 1 + thumbs.length) % thumbs.length); }
  function next() { open((current + 1) % thumbs.length); }

  thumbs.forEach((t, i) => t.addEventListener('click', () => open(i)));
  lbClose.addEventListener('click', close);
  lbPrev.addEventListener('click', prev);
  lbNext.addEventListener('click', next);
  lb.addEventListener('click', e => { if (e.target === lb) close(); });

  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape')      close();
    if (e.key === 'ArrowLeft')   prev();
    if (e.key === 'ArrowRight')  next();
  });
}

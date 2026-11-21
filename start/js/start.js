{
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  const show = () => document.querySelectorAll('.hero h1,[data-fade],.panel').forEach((el) => (el.style.visibility = 'visible'));

  // accordion (works with or without GSAP)
  document.querySelectorAll('.svc').forEach((svc) => {
    const btn = svc.querySelector('button');
    const body = svc.querySelector('.body');
    btn.addEventListener('click', () => {
      const open = !svc.classList.contains('open');
      svc.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', open);
      if (!hasGsap || reduce) { body.style.height = open ? 'auto' : '0'; return; }
      gsap.to(body, { height: open ? 'auto' : 0, duration: 0.7, ease: 'expo.out', onComplete: () => ScrollTrigger.refresh() });
      if (open) gsap.from(body.querySelectorAll('li'), { y: 14, opacity: 0, duration: 0.5, stagger: 0.025, ease: 'power2.out', delay: 0.08 });
    });
  });

  // BEFORE/AFTER CAROUSEL (works with or without GSAP)
  const car = document.querySelector('.car');
  if (car) {
    const cards = [...car.querySelectorAll('.bac')];
    const prev = document.querySelector('.ctrl .prev'), next = document.querySelector('.ctrl .next');
    const cnt = document.querySelector('.ctrl .cnt'), bar = document.querySelector('.works .bar');
    const step = () => cards[0].getBoundingClientRect().width + 20;
    const update = () => {
      const max = car.scrollWidth - car.clientWidth;
      const i = Math.round(car.scrollLeft / step());
      cnt.textContent = Math.min(i + 1, cards.length) + ' / ' + cards.length;
      prev.disabled = car.scrollLeft < 4; next.disabled = car.scrollLeft > max - 4;
      bar.style.setProperty('--prog', max > 0 ? Math.max(0.06, car.scrollLeft / max) : 1);
    };
    car.addEventListener('scroll', update, { passive: true }); update();
    prev.addEventListener('click', () => car.scrollBy({ left: -step(), behavior: reduce ? 'auto' : 'smooth' }));
    next.addEventListener('click', () => car.scrollBy({ left: step(), behavior: reduce ? 'auto' : 'smooth' }));
    car.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') next.click(); if (e.key === 'ArrowLeft') prev.click(); });
    // mouse drag
    let down = false, sx = 0, sl = 0, moved = 0;
    car.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') return; down = true; moved = 0; sx = e.clientX; sl = car.scrollLeft; });
    window.addEventListener('pointermove', (e) => { if (!down) return; const dx = e.clientX - sx; moved = Math.abs(dx); if (moved > 4) car.classList.add('drag'); car.scrollLeft = sl - dx; });
    window.addEventListener('pointerup', () => { if (!down) return; down = false; car.classList.remove('drag'); if (moved > 4) { const i = Math.round(car.scrollLeft / step()); car.scrollTo({ left: i * step(), behavior: 'smooth' }); } });
    // compare
    const fine = matchMedia('(pointer: fine)').matches;
    cards.forEach((card) => {
      const el = card.querySelector('.bimg'); const st = { p: 100 };
      const set = (v) => { st.p = v; el.style.setProperty('--p', v + '%'); };
      const tween = (to, d) => (window.gsap && !reduce) ? gsap.to(st, { p: to, duration: d, ease: 'expo.out', overwrite: true, onUpdate: () => el.style.setProperty('--p', st.p + '%') }) : set(to);
      if (window.ScrollTrigger && !reduce) {
        gsap.registerPlugin(ScrollTrigger);
        const idx = cards.indexOf(card);
        ScrollTrigger.create({ trigger: car, start: 'top 70%', once: true,
          onEnter: () => gsap.delayedCall(0.35 + idx * 0.12, () => tween(50, 1.8)) });
      } else set(50);
      if (fine) {
        el.addEventListener('pointermove', (e) => { if (down) return; const r = el.getBoundingClientRect(); tween(Math.min(96, Math.max(4, (e.clientX - r.left) / r.width * 100)), 0.5); });
        el.addEventListener('pointerleave', () => tween(50, 0.9));
      } else {
        const seq = [12, 88, 50]; let k = 0;
        el.addEventListener('click', () => { tween(seq[k % 3], 0.9); k++; });
      }
    });
  }

  if (!hasGsap || reduce) {
    show();
  } else {
    gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);
    const fine = matchMedia('(pointer: fine)').matches;
    if (/Chrome\//.test(navigator.userAgent) && !/Edg\/|OPR\//.test(navigator.userAgent) && fine) document.documentElement.classList.add('lg');
    if (fine) document.querySelectorAll('.glass,#panel').forEach((g) => {
      g.style.setProperty('--mx', '30%');
      g.addEventListener('pointermove', (e) => { const r = g.getBoundingClientRect(); g.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%'); g.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%'); });
    });

    // smooth scroll on desktop only
    const smoother = fine && window.ScrollSmoother
      ? ScrollSmoother.create({ wrapper: '#smooth-wrapper', content: '#smooth-content', smooth: 1.1, effects: true })
      : null;
    document.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      const t = id.length > 1 && document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      smoother ? smoother.scrollTo(t, true, 'top 80px') : t.scrollIntoView({ behavior: 'smooth' });
    }));

    // header: progress line + hide on scroll down
    const top = document.getElementById('top');
    gsap.to('.top .prog', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });
    ScrollTrigger.create({ start: 120, end: 'max', onUpdate: (s) => top.classList.toggle('hide', s.direction === 1 && s.scroll() > 400) });

    const go = () => {
      show();
      // HERO INTRO
      const h1 = SplitText.create('.hero h1', { type: 'lines', mask: 'lines', linesClass: 'ln' });
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
      tl.from('.hero .bg', { scale: 1.18, opacity: 0, duration: 2.4, ease: 'power3.out' }, 0)
        .from('.hero .glow', { opacity: 0, duration: 2 }, 0.2)
        .fromTo('.top', { opacity: 0 }, { opacity: 1, duration: 1.2, clearProps: 'opacity' }, 0.3)
        .fromTo('.panel', { opacity: 0 }, { opacity: 1, duration: 0.6, clearProps: 'opacity' }, 0.45)
        .from('.panel .accent', { scaleX: 0, duration: 1.4, ease: 'power3.inOut' }, 0.55)
        .from(h1.lines, { yPercent: 110, duration: 1.3, stagger: 0.1 }, 0.75)
        .fromTo('.hero [data-fade]', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.1, clearProps: 'transform,opacity' }, 1.05)
        .fromTo('.rating', { '--s': 0 }, { '--s': 1, duration: 1.2, ease: 'power3.inOut' }, 1.2)
        .from('.hero .cue', { opacity: 0, duration: 1 }, 1.6);

      // ambient liquid light under the glass
      gsap.to('.hero .g1', { x: '12vw', y: '-6vh', duration: 9, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      gsap.to('.hero .g2', { x: '-8vw', y: '-10vh', duration: 11, ease: 'sine.inOut', yoyo: true, repeat: -1 });

      // hero scroll: photo drifts, panel lifts and softens
      gsap.fromTo('.hero .bg img', { yPercent: 0 }, { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

      // MANIFESTO: words light up with scroll
      const mani = SplitText.create('.mani .big', { type: 'words', wordsClass: 'w' });
      gsap.to(mani.words, { opacity: 1, stagger: 0.1, ease: 'none',
        scrollTrigger: { trigger: '.mani .big', start: 'top 80%', end: 'bottom 45%', scrub: 0.6 } });

      // counters
      document.querySelectorAll('[data-count]').forEach((el) => {
        const target = parseFloat(el.dataset.count);
        const dec = el.dataset.count.includes('.') ? 1 : 0;
        const o = { v: 0 };
        gsap.to(o, { v: target, duration: 1.8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          onUpdate: () => (el.textContent = o.v.toFixed(dec)) });
      });
      gsap.from('.mani .fact', { y: 40, opacity: 0, duration: 1, stagger: 0.12, ease: 'expo.out', scrollTrigger: { trigger: '.mani .facts', start: 'top 85%' } });

      // section titles: line mask reveal
      document.querySelectorAll('[data-split]').forEach((el) => {
        SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'ln', autoSplit: true,
          onSplit: (self) => gsap.from(self.lines, { yPercent: 110, duration: 1.2, stagger: 0.08, ease: 'expo.out',
            scrollTrigger: { trigger: el, start: 'top 85%' } }) });
      });
      // generic fades (outside hero)
      ScrollTrigger.batch('section:not(.hero) [data-fade]', { start: 'top 90%', once: true,
        onEnter: (els) => gsap.from(els, { y: 28, opacity: 0, duration: 1, stagger: 0.08, ease: 'expo.out' }) });

      // price rows draw in
      gsap.from('.price-list .rule', { scaleX: 0, duration: 1.4, ease: 'power3.inOut', scrollTrigger: { trigger: '.price-list', start: 'top 85%' } });
      ScrollTrigger.batch('.svc', { start: 'top 92%', once: true,
        onEnter: (els) => gsap.from(els, { y: 30, opacity: 0, duration: 0.9, stagger: 0.06, ease: 'expo.out' }) });

      // team: arches rise, photos parallax inside
      gsap.from('.doc .ph', { clipPath: 'inset(100% 0% 0% 0% round 999px 999px 0 0)', duration: 1.5, stagger: 0.12, ease: 'expo.inOut',
        scrollTrigger: { trigger: '.team-grid', start: 'top 80%' } });
      gsap.from('.doc .ph img', { scale: 1.3, duration: 2, stagger: 0.12, ease: 'expo.out', scrollTrigger: { trigger: '.team-grid', start: 'top 80%' } });
      gsap.from('.doc > :not(.ph)', { y: 20, opacity: 0, duration: 0.9, stagger: 0.04, ease: 'expo.out', scrollTrigger: { trigger: '.team-grid', start: 'top 60%' } });
      document.querySelectorAll('.doc .ph img').forEach((img) => gsap.to(img, { yPercent: 6, ease: 'none',
        scrollTrigger: { trigger: img.parentNode, start: 'top bottom', end: 'bottom top', scrub: true } }));

      // works carousel entrance
      gsap.from('.bac', { x: 90, opacity: 0, duration: 1.4, stagger: 0.08, ease: 'expo.out', scrollTrigger: { trigger: '.car', start: 'top 85%' } });

      // final CTA: slow drift of the big line
      gsap.fromTo('.final .big', { x: 40 }, { x: -20, ease: 'none', scrollTrigger: { trigger: '.final', start: 'top bottom', end: 'bottom top', scrub: true } });
    };
    Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise((r) => setTimeout(r, 1500))]).then(go);
  }
}

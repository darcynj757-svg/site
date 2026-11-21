/* Beauty Bluess — «Перламутр» */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer:fine)').matches;
  const mob = () => matchMedia('(max-width: 900px)').matches;
  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  const P = window.PEARL || { drop: { x: 0, y: 0, r: 0, v: 0 }, darkT: 0, scroll: 0 };
  const showAll = () => { root.classList.add('intro-done'); $$('.q-h1,[data-fade]').forEach((e) => (e.style.visibility = 'visible')); };
  const st = (el) => (el.dataset[mob() ? 'dropm' : 'drop'] || '0,0,0,0').split(',').map(Number);
  const asObj = (a) => ({ x: a[0], y: a[1], r: a[2], v: a[3] });

  /* меню */
  const burger = $('.q-burger');
  if (burger) {
    burger.addEventListener('click', () => { const o = document.body.classList.toggle('menu-open'); burger.setAttribute('aria-expanded', o); });
    $$('.q-menu a').forEach((a) => a.addEventListener('click', () => { document.body.classList.remove('menu-open'); burger.setAttribute('aria-expanded', 'false'); }));
  }

  /* подбор */
  const qd = $('#qdata');
  if (qd) {
    const D = JSON.parse(qd.textContent); const s0 = { goal: null };
    const steps = $$('.qstep'); const qn = $('.qn'), bar = $('.qbar i');
    const go2 = (n) => {
      const cur = steps.find((x) => !x.hidden), nx = steps[n - 1];
      const swap = () => { steps.forEach((x) => { x.hidden = x !== nx; }); qn.textContent = n < 3 ? `Шаг ${n} из 2` : 'Готово'; bar.style.transform = `scaleX(${Math.min(1, n / 3)})`;
        if (cur !== nx) { nx.setAttribute('tabindex', '-1'); nx.focus({ preventScroll: true }); }
        if (hasGsap && !reduce) gsap.fromTo(nx.children, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.06, ease: 'expo.out' }); };
      if (hasGsap && !reduce && cur) gsap.to(cur.children, { y: -12, opacity: 0, duration: 0.25, stagger: 0.03, ease: 'power2.in', onComplete: () => { gsap.set(cur.children, { clearProps: 'all' }); swap(); } }); else swap();
    };
    const result = (exp) => {
      const o = D.opts[s0.goal]; let ids = exp === 'soft' ? o.soft : o.inj; let note = '';
      if (exp === 'soft' && !ids.length) { ids = o.inj.slice(0, 1); note = 'Для этой задачи основные методы инъекционные. На консультации врач расскажет, как сделать процедуру комфортной.'; }
      else if (exp === 'soft') note = 'Эти процедуры проходят без инъекций.';
      else if (exp === 'first') note = 'Если это первый опыт, начните с консультации: врач спокойно всё объяснит и ответит на вопросы.';
      else note = 'Расскажите врачу, какие процедуры и препараты вы делали раньше, — это поможет составить план.';
      $('.qnote').textContent = note;
      $('.qres').innerHTML = ids.map((id) => { const s = D.svc[id]; return `<a href="${s.u}" target="_blank" rel="noopener"><b>${s.t}</b><small>${s.l}</small><em>${s.p}</em></a>`; }).join('');
      go2(3);
    };
    $$('.qstep[data-step="1"] .qopt').forEach((b) => b.addEventListener('click', () => { $$('.qstep[data-step="1"] .qopt').forEach((x) => x.classList.toggle('sel', x === b)); s0.goal = b.dataset.v; setTimeout(() => go2(2), 220); }));
    $$('.qstep[data-step="2"] .qopt').forEach((b) => b.addEventListener('click', () => { $$('.qstep[data-step="2"] .qopt').forEach((x) => x.classList.toggle('sel', x === b)); setTimeout(() => result(b.dataset.v), 220); }));
    $('.qback').addEventListener('click', () => go2(1));
    $('.qreset').addEventListener('click', () => { $$('.qopt').forEach((x) => x.classList.remove('sel')); go2(1); });
  }

  /* окна врачей */
  let smoother = null;
  $$('.q-dbtn, .q-hp').forEach((btn) => {
    const dlg = document.getElementById(btn.getAttribute('aria-controls')); if (!dlg) return;
    btn.addEventListener('click', () => { dlg.showModal(); if (smoother) smoother.paused(true);
      if (hasGsap && !reduce) gsap.fromTo(dlg, { opacity: 0, y: 30, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'expo.out' }); });
    const close = () => { const done = () => { dlg.close(); if (smoother) smoother.paused(false); btn.focus({ preventScroll: true }); };
      if (hasGsap && !reduce) gsap.to(dlg, { opacity: 0, y: 16, duration: 0.3, ease: 'power2.in', onComplete: done }); else done(); };
    dlg.querySelector('.q-x').addEventListener('click', close);
    dlg.addEventListener('click', (e) => { if (e.target === dlg) close(); });
    dlg.addEventListener('cancel', (e) => { e.preventDefault(); close(); });
  });

  /* до/после: шторка */
  const stage = $('.q-stage');
  if (stage) {
    const BA = JSON.parse(stage.dataset.ba); let idx = 0, drag = false, cur = 50, want = 50;
    const rng = $('.q-range', stage);
    const setX = (e) => { const r = stage.getBoundingClientRect(); want = Math.min(100, Math.max(0, (e.clientX - r.left) / r.width * 100)); };
    stage.addEventListener('pointerdown', (e) => { drag = true; setX(e); stage.setPointerCapture(e.pointerId); stage.classList.add('drag'); });
    stage.addEventListener('pointermove', (e) => { if (drag) setX(e); });
    const up = () => { drag = false; stage.classList.remove('drag'); };
    stage.addEventListener('pointerup', up); stage.addEventListener('pointercancel', up);
    rng.addEventListener('input', () => { want = +rng.value; });
    const tick = () => { cur += (want - cur) * (reduce ? 1 : 0.22); stage.style.setProperty('--p', cur.toFixed(2) + '%'); rng.value = Math.round(cur); requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
    /* подсказка: шторка сама качнётся один раз */
    if (!reduce && 'IntersectionObserver' in window) { const io = new IntersectionObserver((en) => { if (!en[0].isIntersecting) return; io.disconnect();
      [[700, 28], [1500, 72], [2300, 50]].forEach(([d, v]) => setTimeout(() => { if (!drag) want = v; }, d)); }, { threshold: 0.6 }); io.observe(stage); }
    const b4 = $('.q-b4', stage), af = $('.q-af', stage);
    const show = (i) => { if (i === idx) return; idx = i; const [k, t1, t2, ar] = BA[i];
      $$('.q-th').forEach((x) => x.classList.toggle('on', +x.dataset.i === i));
      const swap = () => { b4.src = `assets/ba/${k}-after.webp`; af.src = `assets/ba/${k}-before.webp`; $('.q-rc').textContent = String(i + 1).padStart(2, '0') + ' / ' + String(BA.length).padStart(2, '0'); $('.q-rt').textContent = t1; $('.q-rs').textContent = t2; if (ar) { if (hasGsap && !reduce) gsap.to(stage, { '--arn': ar, duration: 0.7, ease: 'power3.inOut' }); else stage.style.setProperty('--arn', ar); } };
      if (hasGsap && !reduce) gsap.timeline().to([b4, af, '.q-rt', '.q-rs'], { opacity: 0, duration: 0.25 }).add(swap).to([b4, af, '.q-rt', '.q-rs'], { opacity: 1, duration: 0.6 }); else swap(); };
    $$('.q-th').forEach((x) => x.addEventListener('click', () => show(+x.dataset.i)));
  }

  if (!hasGsap) { showAll(); Object.assign(P.drop, asObj(st($('.q-hero')))); return; }
  gsap.registerPlugin(ScrollTrigger, ...(window.ScrollSmoother ? [ScrollSmoother] : []), ...(window.SplitText ? [SplitText] : []));
  gsap.defaults({ ease: 'expo.out' });
  if (window.ScrollSmoother && fine && !reduce) smoother = ScrollSmoother.create({ wrapper: '#smooth-wrapper', content: '#smooth-content', smooth: 1.15, effects: false });
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => { const id = a.getAttribute('href'); const t = id.length > 1 && $(id); if (!t) return; e.preventDefault(); if (smoother) smoother.scrollTo(t, true, 'top 90px'); else t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); }));

  /* ---------- 3D-кольцо направлений (pin создаём первым) ---------- */
  const slabs = $$('.q-slab'), ringin = $('.q-ringin'), N = slabs.length;
  const paintRing = (deg) => {
    ringin.style.setProperty('--ry', deg + 'deg');
    slabs.forEach((s, i) => { const a = ((i * 36 + deg) % 360 + 360) % 360; const c = Math.cos(a * Math.PI / 180);
      s.style.opacity = (c < 0.05 ? 0 : 0.12 + 0.88 * c ** 2.2).toFixed(3); s.style.visibility = c < 0.05 ? 'hidden' : 'visible'; s.style.setProperty('--front', c > 0.95 ? 1 : 0); s.style.pointerEvents = c > 0.55 ? 'auto' : 'none'; });
    const f = ((Math.round(-deg / 36) % N) + N) % N; const cnt = $('.q-dcount b'); if (cnt) cnt.textContent = String(f + 1).padStart(2, '0');
  };
  if (ringin) {
    paintRing(0);
    ScrollTrigger.create({ trigger: '.q-dirs', start: 'top top', end: () => '+=' + innerHeight * (reduce ? 1 : 3.6), pin: true, refreshPriority: 10, scrub: reduce ? false : 1, invalidateOnRefresh: true,
      onUpdate: (s) => paintRing(-s.progress * (N - 1) * 36) });
  }


  /* ---------- направления: 3D-кольцо арок + текст по одному ---------- */
  { const sec = $('.q-scsec');
    if (sec) { const tx = $$('.q-sct', sec), vs = $$('.q-scv', sec), dots = $$('.q-scdot', sec), N = tx.length, cnt = $('.q-sccount b', sec), ring = $('.q-scring', sec);
      const STEP = 360 / N; let cur = -1, st = null; const rot = { d: 0 };
      const paint = () => { ring.style.setProperty('--ry', rot.d + 'deg');
        vs.forEach((v, i) => { const a = ((i * STEP + rot.d) % 360 + 360) % 360; const c = Math.cos(a * Math.PI / 180);
          v.style.opacity = (c < 0.55 ? 0 : Math.min(1, (c - 0.55) / 0.45 * 1.15)).toFixed(3); v.style.visibility = c < 0.55 ? 'hidden' : 'visible'; }); };
      const set = (i) => { i = Math.max(0, Math.min(N - 1, i)); if (i === cur) return; cur = i;
        [tx, vs, dots].forEach((l) => l.forEach((el, k) => el.classList.toggle('on', k === i)));
        if (cnt) cnt.textContent = String(i + 1).padStart(2, '0'); };
      set(0); paint();
      if (!reduce) {
        st = ScrollTrigger.create({ trigger: sec, start: 'top top', end: () => '+=' + innerHeight * (mob() ? 0.6 : 0.75) * N, pin: true, anticipatePin: 1, refreshPriority: 10, invalidateOnRefresh: true, scrub: 0.8,
          onUpdate: (s) => { const f = s.progress * (N - 1); rot.d = -f * STEP; paint(); set(Math.round(f)); } });
        const toStep = (i) => { i = Math.max(0, Math.min(N - 1, i)); const y = st.start + (st.end - st.start) * i / (N - 1); smoother ? smoother.scrollTo(y, true) : scrollTo({ top: y, behavior: 'smooth' }); };
        dots.forEach((d, i) => d.addEventListener('click', () => toStep(i)));
        if (mob()) { let sx = null; const v = $('.q-scvis', sec);
          v.addEventListener('pointerdown', (e) => { sx = e.clientX; });
          v.addEventListener('pointerup', (e) => { if (sx == null) return; const dx = e.clientX - sx; sx = null; if (Math.abs(dx) > 40) toStep(cur + (dx < 0 ? 1 : -1)); }); }
      } else {
        const go = (i) => { i = Math.max(0, Math.min(N - 1, i)); set(i); gsap.to(rot, { d: -i * STEP, duration: reduce ? 0 : 1, ease: 'power3.inOut', onUpdate: paint }); };
        dots.forEach((d, i) => d.addEventListener('click', () => go(i)));
        if (!reduce) ScrollTrigger.create({ trigger: $('.q-scvis', sec), start: 'top 70%', once: true, onEnter: () => { if (cur !== 0) return;
          gsap.timeline().to(rot, { d: -12, duration: 0.7, ease: 'power2.out', onUpdate: paint }).to(rot, { d: 0, duration: 1.1, ease: 'elastic.out(1,0.5)', onUpdate: paint }); } });
        let x0 = null; const vis = $('.q-scvis', sec);
        vis.addEventListener('pointerdown', (e) => { x0 = e.clientX; });
        vis.addEventListener('pointerup', (e) => { if (x0 == null) return; const dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 40) go(cur + (dx < 0 ? 1 : -1)); });
      }
    } }

  /* ---------- тёмный/светлый перламутр ---------- */
  { const secs = $$('main section[data-dark]'); let lastD = null;
    const chk = () => { const mid = innerHeight * 0.55; let d = null;
      for (const s of secs) { const r = s.getBoundingClientRect(); if (r.top <= mid && r.bottom >= mid) { d = '1'; break; } }
      if (d !== null && d !== lastD) { lastD = d; P.darkT = +d; root.classList.toggle('on-dark', d === '1'); } };
    gsap.ticker.add(chk); chk(); }
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (s) => { P.scroll = s.progress * 3; gsap.set('.q-prog', { scaleX: s.progress }); const top = $('.q-top'); if (top && !document.body.classList.contains('menu-open')) top.classList.toggle('hid', s.direction === 1 && s.scroll() > 600); } });

  /* ---------- хореография капли по секциям ---------- */
  const secs = $$('main section[data-drop]');
  const buildDrop = () => {
    secs.forEach((s, i) => { if (!i) return; const a = asObj(st(secs[i - 1])), b2 = asObj(st(s));
      gsap.fromTo(P.drop, a, { ...b2, ease: 'power1.inOut', immediateRender: false, scrollTrigger: { trigger: s, start: 'top bottom', end: 'top 25%', scrub: 1.2 } }); });
  };
  buildDrop();

  /* ---------- первый экран ---------- */
  const heroIn = () => {
    if (!$('.q-hero')) {
      const f = $('main section[data-drop]'); if (f) { const t0 = asObj(st(f)); if (reduce) Object.assign(P.drop, t0); else gsap.fromTo(P.drop, { x: t0.x, y: t0.y, r: 0, v: 1 }, { r: t0.r, duration: 2, ease: 'elastic.out(1,0.6)' }); }
      const h = $('.x-h1'); if (h && !reduce) { const sp = SplitText.create(h, { type: 'lines', mask: 'lines' }); gsap.from(sp.lines, { yPercent: 110, duration: 1.3, stagger: 0.1, delay: 0.15 }); }
      return;
    }
    $('.q-h1').style.visibility = 'visible';
    const target = asObj(st($('.q-hero')));
    if (reduce) { showAll(); Object.assign(P.drop, target); return; }
    const sp = SplitText.create('.q-h1 .w1, .q-h1 .w2', { type: 'chars', mask: 'chars' });
    gsap.timeline()
      .fromTo(P.drop, { x: target.x, y: target.y, r: 0, v: 1 }, { r: target.r, duration: 2.2, ease: 'elastic.out(1,0.55)' }, 0)
      .from(sp.chars, { yPercent: 115, duration: 1.4, stagger: 0.03, ease: 'expo.out' }, 0.25)
      .from('.q-h1 .w3', { y: 20, opacity: 0, duration: 1.2 }, 0.8)
      .fromTo('.q-hero [data-fade]', { y: 24, opacity: 0, visibility: 'visible' }, { y: 0, opacity: 1, duration: 1.1, stagger: 0.1, clearProps: 'transform,opacity' }, 0.9)
      .from('.q-scroll, .q-top', { opacity: 0, duration: 1 }, 1.2);
    if (window.PEARL) gsap.fromTo(window.PEARL, { imgFade: 0 }, { imgFade: 1, duration: 2.4, ease: 'power2.out' });
  };

  /* ---------- интро: линия рисует логотип → точка → капля ---------- */
  const intro = $('.q-intro');
  let seen = false; try { seen = sessionStorage.getItem('q-intro') === '1'; sessionStorage.setItem('q-intro', '1'); } catch (e) {}
  if (!intro || reduce) { showAll(); heroIn(); }
  else {
    if (smoother) smoother.paused(true); else document.body.style.overflow = 'hidden';
    const paths = $$('.q-ilogo .lm path'); const D = seen ? 0.9 : (mob() ? 1.4 : 2.4);
    const crit = $$('.q-cimg img, .q-b4').slice(0, 6); let done = 0; const need = crit.length + 1; const cnt = { v: 0 };
    const paint = () => { $('.q-icount b').textContent = Math.round(cnt.v); gsap.set('.q-iline i', { scaleX: cnt.v / 100 }); };
    const one = () => { done++; gsap.to(cnt, { v: Math.round(done / need * 100), duration: 0.6, ease: 'power2.out', overwrite: true, onUpdate: paint }); };
    crit.forEach((im) => { im.loading = 'eager'; });
    const loadP = Promise.race([Promise.all([...crit.map((im) => (im.complete ? (one(), Promise.resolve()) : new Promise((r) => { const f = () => { one(); r(); }; im.addEventListener('load', f, { once: true }); im.addEventListener('error', f, { once: true }); }))),
      (document.fonts ? document.fonts.ready : Promise.resolve()).then(one)]), new Promise((r) => setTimeout(r, mob() ? 1500 : 5000))])
      .then(() => new Promise((r) => gsap.to(cnt, { v: 100, duration: 0.5, onUpdate: paint, onComplete: r })));
    const tl = gsap.timeline({ onComplete: () => { root.classList.add('intro-done'); intro.remove(); if (smoother) smoother.paused(false); else document.body.style.overflow = ''; } });
    paths.forEach((p, k) => tl.to(p, { strokeDashoffset: 0, duration: D * 0.45, ease: 'power1.inOut' }, (k / paths.length) * D * 0.7));
    tl.addPause(D + 0.05, () => loadP.then(() => tl.resume()));
    tl.to('.q-icount, .q-iline', { opacity: 0, duration: 0.4 }, D + 0.1);
    tl.add(() => {
      const t = asObj(st($('.q-hero'))); const cx = innerWidth / 2 + t.x * innerHeight, cy = innerHeight / 2 - t.y * innerHeight;
      const r = $('.q-ilogo').getBoundingClientRect();
      gsap.timeline()
        .to('.q-ilogo', { x: cx - (r.left + r.width / 2), y: cy - (r.top + r.height / 2), scale: 0.02, duration: 0.9, ease: 'expo.in' }, 0)
        .to(intro, { backgroundColor: 'rgba(43,35,31,0)', duration: 0.6 }, 0.6)
        .add(heroIn, 0.8);
    }, D + 0.2);
    tl.to({}, { duration: 1.4 });
  }

  /* ---------- манифест, счётчики, заголовки ---------- */
  $$('[data-words]').forEach((el) => { const sp = SplitText.create(el, { type: 'words', wordsClass: 'w' }); if (reduce) return;
    gsap.to(sp.words, { opacity: 1, stagger: 0.08, ease: 'none', scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: 0.6 } }); });
  $$('[data-count]').forEach((el) => { const n = +el.dataset.count; if (reduce) { el.textContent = n; return; } ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true, onEnter: () => gsap.to({ v: 0 }, { v: n, duration: 1.6, ease: 'power2.out', onUpdate() { el.textContent = Math.round(this.targets()[0].v); } }) }); });
  if (!reduce) {
    $$('[data-split]').forEach((el) => { const sp = SplitText.create(el, { type: 'lines', mask: 'lines' }); gsap.from(sp.lines, { yPercent: 110, duration: 1.4, stagger: 0.1, scrollTrigger: { trigger: el, start: 'top 85%' } }); });
    $$('main [data-fade]').forEach((e) => { if (!e.closest('.q-hero')) e.style.visibility = 'visible'; });
    ScrollTrigger.batch('.q-doc, .q-ph, .q-stage, .quiz, .q-map, .q-facts > div', { start: 'top 88%', once: true, onEnter: (els) => gsap.fromTo(els, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1.4, stagger: 0.12, clearProps: 'transform,opacity' }) });
    $$('.q-phin').forEach((p) => gsap.fromTo(p, { clipPath: 'inset(100% 0% 0% 0% round 999px)' }, { clipPath: 'inset(0% 0% 0% 0% round 999px)', duration: 1.6, ease: 'expo.inOut', scrollTrigger: { trigger: p, start: 'top 85%' } }));
    $$('.q-cimg img').forEach((im) => gsap.fromTo(im, { yPercent: -5 }, { yPercent: 5, ease: 'none', scrollTrigger: { trigger: im.closest('.q-doc'), start: 'top bottom', end: 'bottom top', scrub: true } }));
  } else $$('[data-fade]').forEach((e) => (e.style.visibility = 'visible'));


  /* ---------- фоновый логотип рисуется по мере прокрутки страницы (плавно) ---------- */
  const bp = $$('.q-bglogo .lm path'), bgl = $('.q-bgl');
  if (bp.length) { if (reduce) gsap.set(bp, { strokeDashoffset: 0 }); else {
    /* общая длина — чтобы каждый штрих рисовался пропорционально своей длине, с перехлёстом: линия течёт без рывков */
    const lens = bp.map((p) => { try { return p.getTotalLength(); } catch (e) { return 1; } }); const total = lens.reduce((a, b) => a + b, 0) || 1;
    const bt = gsap.timeline({ paused: true }); let t = 0;
    bp.forEach((p, k) => { const d = Math.max(0.04, lens[k] / total); bt.to(p, { strokeDashoffset: 0, duration: d * 1.6, ease: 'sine.inOut' }, t); t += d * 0.85; });
    bt.fromTo(bgl, { opacity: 0 }, { opacity: 1, duration: Math.max(0.15, t * 0.12), ease: 'sine.out' }, 0);
    const prog = { v: 0 }; const tw = gsap.quickTo(prog, 'v', { duration: 1.6, ease: 'power3.out', onUpdate: () => bt.progress(prog.v) });
    ScrollTrigger.create({ trigger: document.documentElement, start: 'top top', end: 'bottom bottom', onUpdate: (s) => tw(s.progress) });
  } }

  /* ---------- финал: логотип рисуется линией ---------- */
  const fp = $$('.q-flogo .lm path');
  if (fp.length && !reduce) { const ft = gsap.timeline({ scrollTrigger: { trigger: '.q-final', start: 'top 80%', end: 'top 10%', scrub: 1 } }); fp.forEach((p, k) => ft.to(p, { strokeDashoffset: 0, duration: 0.45, ease: 'none' }, (k / fp.length) * 0.7)); }
  else gsap.set(fp, { strokeDashoffset: 0 });

  /* ---------- курсор, магнит, наклон портретов ---------- */
  if (fine && !reduce) {
    root.classList.add('cur-on');
    const cur = $('.q-cur'), dot = $('.q-dot'), ring = $('.q-cring'), lab = $('.q-cring span');
    const dx = gsap.quickTo(dot, 'x', { duration: 0.08 }), dy = gsap.quickTo(dot, 'y', { duration: 0.08 });
    const rx = gsap.quickTo(ring, 'x', { duration: 0.5, ease: 'power3' }), ry = gsap.quickTo(ring, 'y', { duration: 0.5, ease: 'power3' });
    addEventListener('pointermove', (e) => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); }, { passive: true });
    document.addEventListener('pointerover', (e) => { const t = e.target.closest('[data-cursor], a, button'); cur.classList.remove('link', 'label', 'hide'); if (!t) return;
      const d = t.dataset.cursor; if (d === 'hide') cur.classList.add('hide'); else if (d) { lab.textContent = d; cur.classList.add('label'); }
      else if (t.matches('a[href*="dikidi"]')) { lab.textContent = 'Записаться'; cur.classList.add('label'); } else cur.classList.add('link'); });
    $$('.q-btn, .q-ghost, .q-snd, .q-th').forEach((b) => { const mx = gsap.quickTo(b, 'x', { duration: 0.7, ease: 'elastic.out(1,0.4)' }), my = gsap.quickTo(b, 'y', { duration: 0.7, ease: 'elastic.out(1,0.4)' });
      b.addEventListener('pointermove', (e) => { const r = b.getBoundingClientRect(); mx((e.clientX - r.left - r.width / 2) * 0.25); my((e.clientY - r.top - r.height / 2) * 0.35); });
      b.addEventListener('pointerleave', () => { mx(0); my(0); }); });
    $$('.q-dbtn').forEach((d) => { const c = d.querySelector('.q-card'), ir = d.querySelector('.q-iri');
      d.addEventListener('pointermove', (e) => { const r = c.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = `perspective(900px) rotateY(${x * 14}deg) rotateX(${-y * 10}deg)`; ir.style.setProperty('--sx', (60 - x * 120) + '%'); });
      d.addEventListener('pointerleave', () => { c.style.transform = ''; }); });
  }

  /* ---------- эмбиент (по умолчанию выключен) ---------- */
  const snd = $('.q-snd'); let AC = null, master = null;
  const startAmb = () => {
    AC = new (window.AudioContext || window.webkitAudioContext)(); master = AC.createGain(); master.gain.value = 0;
    const len = AC.sampleRate * 3, ir = AC.createBuffer(2, len, AC.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
    const rev = AC.createConvolver(); rev.buffer = ir;
    const lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1100; lp.Q.value = 0.4;
    const lfo = AC.createOscillator(), lfoG = AC.createGain(); lfo.frequency.value = 0.05; lfoG.gain.value = 500; lfo.connect(lfoG); lfoG.connect(lp.frequency); lfo.start();
    [164.81, 246.94, 311.13, 369.99, 493.88].forEach((f, i) => { /* E, B, D#, F#, B — мягкий Emaj9, светлее */
      const o = AC.createOscillator(), g = AC.createGain(); o.type = i % 2 ? 'sine' : 'triangle'; o.frequency.value = f; o.detune.value = (i - 2) * 4;
      g.gain.value = 0.11 / (i + 1); const tr = AC.createOscillator(), tg = AC.createGain(); tr.frequency.value = 0.07 + i * 0.03; tg.gain.value = g.gain.value * 0.6; tr.connect(tg); tg.connect(g.gain); tr.start();
      o.connect(g); g.connect(lp); o.start(); });
    const dry = AC.createGain(); dry.gain.value = 0.35; lp.connect(dry); dry.connect(master); lp.connect(rev); rev.connect(master); master.connect(AC.destination);
  };
  if (snd) snd.addEventListener('click', () => { const on = snd.getAttribute('aria-pressed') !== 'true'; snd.setAttribute('aria-pressed', on);
    if (on) { if (!AC) startAmb(); AC.resume(); master.gain.cancelScheduledValues(AC.currentTime); master.gain.linearRampToValueAtTime(0.09, AC.currentTime + 2.5); }
    else if (AC) { master.gain.cancelScheduledValues(AC.currentTime); master.gain.linearRampToValueAtTime(0, AC.currentTime + 1.2); } });



  /* ---------- врачи: горизонтальная прокрутка ---------- */
  const hs = $('.q-hscroll');
  if (hs) {
    const prog = $('.q-dprog');
    if (!reduce) {
      const M = mob(); const tgt = M ? $('.q-dtrack') : hs; if (M) root.classList.add('m-pin');
      const dist = () => Math.max(0, tgt.scrollWidth - innerWidth);
      const tw = gsap.to(tgt, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: M ? tgt : '.q-docs', start: M ? 'top 64px' : 'top top', end: () => '+=' + dist(), pin: true, scrub: 0.8, refreshPriority: 5, invalidateOnRefresh: true, anticipatePin: 1,
        onUpdate: (s) => prog && prog.style.setProperty('--pr', s.progress.toFixed(3)) } });
      $$('.q-pan').forEach((p) => {
        gsap.from(p.querySelector('.q-pimg img'), { scale: 1.25, ease: 'none', scrollTrigger: { trigger: p, containerAnimation: tw, start: 'left right', end: 'center center', scrub: true } });
        gsap.from(p.querySelectorAll('.q-ptx > *'), { x: 80, opacity: 0, stagger: 0.06, ease: 'none', scrollTrigger: { trigger: p, containerAnimation: tw, start: 'left 85%', end: 'left 35%', scrub: true } });
      });
    } else { const tr = $('.q-dtrack'); tr.addEventListener('scroll', () => prog && prog.style.setProperty('--pr', (tr.scrollLeft / Math.max(1, tr.scrollWidth - tr.clientWidth)).toFixed(3)), { passive: true }); }
  }

  /* ---------- переходы между страницами ---------- */
  const tr = $('.q-tr');
  if (tr) {
    if (root.classList.contains('tr-in')) { try { sessionStorage.removeItem('q-tr'); } catch (e) {}
      gsap.to(tr, { opacity: 0, duration: reduce ? 0 : 0.8, delay: 0.1, ease: 'power2.out', onComplete: () => { root.classList.remove('tr-in'); gsap.set(tr, { clearProps: 'all' }); } }); }
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href]'); if (!a || a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const href = a.getAttribute('href'); if (!/\.html(#.*)?$/.test(href) || href.startsWith('http')) return;
      e.preventDefault(); try { sessionStorage.setItem('q-tr', '1'); } catch (er) {}
      if (reduce) { location.href = href; return; }
      gsap.set(tr, { visibility: 'visible' });
      gsap.timeline({ onComplete: () => { location.href = href; } }).fromTo(tr, { opacity: 0 }, { opacity: 1, duration: 0.45, ease: 'power2.inOut' }).from('.q-tr img, .q-tr span', { y: 14, opacity: 0, duration: 0.4, stagger: 0.06 }, 0.15);
    });
    addEventListener('pageshow', (e) => { if (e.persisted) { root.classList.remove('tr-in'); gsap.set(tr, { clearProps: 'all' }); } });
  }

  /* ---------- закреплённые оглавления и подсветка разделов ---------- */
  if (smoother && matchMedia('(min-width:1001px)').matches) $$('[data-pin]').forEach((el) => {
    const box = el.closest(el.dataset.pin); if (!box) return;
    ScrollTrigger.create({ trigger: el, start: 'top 110px', end: () => '+=' + Math.max(0, box.getBoundingClientRect().bottom - el.getBoundingClientRect().bottom), pin: true, pinSpacing: false, invalidateOnRefresh: true });
  });
  const spy = (links, targets) => { if (!links.length) return;
    targets.forEach((g, i) => ScrollTrigger.create({ trigger: g, start: 'top 45%', end: () => { const n = targets[i + 1]; return n ? '+=' + Math.max(1, n.getBoundingClientRect().top - g.getBoundingClientRect().top) : 'bottom 45%'; },
      onToggle: (s) => { if (!s.isActive) return; links.forEach((a) => a.classList.toggle('on', a.getAttribute('href') === '#' + g.id)); } })); };
  spy($$('.x-toc a'), $$('.x-grp')); spy($$('.x-atoc a'), $$('.x-prose h2[id]'));
  $$('.x-card, .x-art, .x-doc, .x-grp, .x-pr, .x-drow').forEach((el) => { if (!reduce) gsap.from(el, { y: 50, opacity: 0, duration: 1.2, scrollTrigger: { trigger: el, start: 'top 90%' } }); });
  /* ---------- телефон: появление блоков и оживление карточек врачей ---------- */
  if (mob() && !reduce) {
    ScrollTrigger.batch('.q-sub, .x-headrow .q-ghost, .q-scvis, .q-sctx, .q-scnav', { start: 'top 90%', once: true,
      onEnter: (els) => gsap.fromTo(els, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, stagger: 0.1, ease: 'expo.out', clearProps: 'transform,opacity' }) });
  }
  ScrollTrigger.sort();
  addEventListener('load', () => ScrollTrigger.refresh());
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
})();

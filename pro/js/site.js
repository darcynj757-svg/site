{
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const show = () => { document.documentElement.classList.add('ready'); $$('.hero h1,.ahero h1,.dhero h1,.phead h1,[data-fade],.panel').forEach((el) => (el.style.visibility = 'visible')); };
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  /* ---------- page curtain transition ---------- */
  const curtain = $('.curtain');
  const leave = (href) => {
    if (!curtain || reduce || !hasGsap) { location.href = href; return; }
    try { sessionStorage.setItem('bb-cur', '1'); } catch (e) {}
    gsap.timeline({ onComplete: () => (location.href = href) })
      .set(curtain, { visibility: 'visible' }).fromTo('.curtain .ca', { yPercent: 100 }, { yPercent: 0, duration: 0.85, ease: 'expo.inOut' })
      .to('.curtain .cm', { opacity: 1, duration: 0.3 }, 0.55).fromTo('.curtain .clogo', { opacity: 0, clipPath: 'inset(0% 0% 100% 0%)' }, { opacity: 1, clipPath: 'inset(0% 0% 0% 0%)', duration: 0.6, ease: 'power2.out' }, 0.5)
      .to('.curtain .cl', { scaleX: 1, duration: 0.5, ease: 'power3.inOut' }, 0.55);
  };
  $$('a[href$=".html"],a[href$=".html#"],a[href*=".html#"]').forEach((a) => {
    if (a.target === '_blank') return;
    a.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;
      const url = new URL(a.href, location.href);
      if (url.pathname === location.pathname && url.hash) return;
      e.preventDefault(); leave(a.href);
    });
  });
  let entered = false;
  try { entered = sessionStorage.getItem('bb-cur') === '1'; sessionStorage.removeItem('bb-cur'); } catch (e) {}
  if (curtain && entered && hasGsap && !reduce) {
    gsap.set(curtain, { visibility: 'visible' }); gsap.set('.curtain .ca', { yPercent: 0 }); gsap.set('.curtain .cm, .curtain .clogo', { opacity: 1 }); gsap.set('.curtain .cl', { scaleX: 1 });
    gsap.timeline({ delay: 0.15, onComplete: () => { gsap.set(curtain, { visibility: 'hidden' }); document.documentElement.classList.remove('cur-in'); } })
      .to('.curtain .cm, .curtain .cl, .curtain .clogo', { opacity: 0, duration: 0.3 }, 0)
      .to('.curtain .ca', { yPercent: 100, duration: 1.05, ease: 'expo.inOut' }, 0.1);
  }
  window.addEventListener('pageshow', (e) => { if (e.persisted && curtain && hasGsap) { gsap.set('.curtain .ca', { yPercent: 100 }); gsap.set(curtain, { visibility: 'hidden' }); gsap.set('.curtain .cm', { opacity: 0 }); gsap.set('.curtain .cl', { scaleX: 0, opacity: 1 }); } });

  /* ---------- mobile menu ---------- */
  const burger = $('.burger');
  if (burger) burger.addEventListener('click', () => {
    const open = document.body.classList.toggle('menu-open');
    burger.setAttribute('aria-expanded', open);
    if (open && hasGsap && !reduce) gsap.from('.mmenu a', { y: 16, opacity: 0, duration: 0.6, stagger: 0.05, ease: 'expo.out' });
  });

  /* ---------- before/after compare (carousel + grid) ---------- */
  let dragging = false;
  const setupCompare = (el, container, idx) => {
    const st = { p: 100 };
    const set = (v) => { st.p = v; el.style.setProperty('--p', v + '%'); };
    const tween = (to, d) => (hasGsap && !reduce) ? gsap.to(st, { p: to, duration: d, ease: 'expo.out', overwrite: true, onUpdate: () => el.style.setProperty('--p', st.p + '%') }) : set(to);
    if (hasGsap && !reduce) {
      ScrollTrigger.create({ trigger: container === 'self' ? el : container, start: 'top 75%', once: true,
        onEnter: () => gsap.delayedCall(0.3 + idx * 0.12, () => tween(50, 1.8)) });
    } else set(50);
    if (fine) {
      el.addEventListener('pointermove', (e) => { if (dragging) return; const r = el.getBoundingClientRect(); tween(Math.min(96, Math.max(4, (e.clientX - r.left) / r.width * 100)), 0.5); });
      el.addEventListener('pointerleave', () => tween(50, 0.9));
    } else {
      const seq = [12, 88, 50]; let k = 0;
      el.addEventListener('click', () => { tween(seq[k % 3], 0.9); k++; });
    }
  };
  const car = $('.car');
  if (car) {
    const cards = [...car.querySelectorAll('.bac')];
    const prev = $('.ctrl .prev'), next = $('.ctrl .next'), cnt = $('.ctrl .cnt'), bar = $('.works .bar');
    const step = () => cards[0].getBoundingClientRect().width + 20;
    const update = () => {
      const max = car.scrollWidth - car.clientWidth;
      cnt.textContent = Math.min(Math.round(car.scrollLeft / step()) + 1, cards.length) + ' / ' + cards.length;
      prev.disabled = car.scrollLeft < 4; next.disabled = car.scrollLeft > max - 4;
      bar.style.setProperty('--prog', max > 0 ? Math.max(0.06, car.scrollLeft / max) : 1);
    };
    car.addEventListener('scroll', update, { passive: true }); update();
    prev.addEventListener('click', () => car.scrollBy({ left: -step(), behavior: reduce ? 'auto' : 'smooth' }));
    next.addEventListener('click', () => car.scrollBy({ left: step(), behavior: reduce ? 'auto' : 'smooth' }));
    car.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') next.click(); if (e.key === 'ArrowLeft') prev.click(); });
    let down = false, sx = 0, sl = 0, moved = 0;
    car.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') return; down = true; moved = 0; sx = e.clientX; sl = car.scrollLeft; });
    window.addEventListener('pointermove', (e) => { if (!down) return; const dx = e.clientX - sx; moved = Math.abs(dx); if (moved > 4) { car.classList.add('drag'); dragging = true; } car.scrollLeft = sl - dx; });
    window.addEventListener('pointerup', () => { if (!down) return; down = false; dragging = false; car.classList.remove('drag'); if (moved > 4) car.scrollTo({ left: Math.round(car.scrollLeft / step()) * step(), behavior: 'smooth' }); });
    cards.forEach((c, i) => setupCompare(c.querySelector('.bimg'), car, i));
  }
  $$('.rgrid .bimg').forEach((el, i) => setupCompare(el, 'self', i % 3));

  /* ---------- results filter (Flip) ---------- */
  const chips = $$('[data-filter]');
  chips.forEach((c) => c.addEventListener('click', () => {
    const f = c.dataset.filter, items = $$('.rgrid .bac');
    const flip = hasGsap && window.Flip && !reduce;
    const state = flip ? Flip.getState(items) : null;
    items.forEach((w) => { w.hidden = !(f === 'all' || w.dataset.cat === f); });
    chips.forEach((x) => x.setAttribute('aria-pressed', x === c));
    if (flip) Flip.from(state, { duration: 0.7, ease: 'expo.inOut', absolute: true, scale: true,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.6 }),
      onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.92, duration: 0.35 }),
      onComplete: () => ScrollTrigger.refresh() });
  }));
  if (hasGsap && window.Flip) gsap.registerPlugin(Flip);


  /* ---------- quiz ---------- */
  const qd = $('#qdata');
  if (qd) {
    const D = JSON.parse(qd.textContent); const st = { goal: null };
    const steps = $$('.qstep'); const qn = $('.qn'), bar = $('.qbar i');
    const go2 = (n) => {
      const cur = steps.find((x) => !x.hidden), nx = steps[n - 1];
      const swap = () => { steps.forEach((x) => { x.hidden = x !== nx; }); qn.textContent = n < 3 ? `Шаг ${n} из 2` : 'Готово'; bar.style.transform = `scaleX(${Math.min(1, n / 3)})`;
        if (cur !== nx) { nx.setAttribute('tabindex', '-1'); nx.focus({ preventScroll: true }); }
        if (hasGsap && !reduce) gsap.fromTo(nx.children, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.06, ease: 'expo.out' }); };
      if (hasGsap && !reduce && cur) gsap.to(cur.children, { y: -12, opacity: 0, duration: 0.25, stagger: 0.03, ease: 'power2.in', onComplete: () => { gsap.set(cur.children, { clearProps: 'all' }); swap(); } }); else swap();
    };
    const result = (exp) => {
      const o = D.opts[st.goal]; let ids = exp === 'soft' ? o.soft : o.inj; let note = '';
      if (exp === 'soft' && !ids.length) { ids = o.inj.slice(0, 1); note = 'Для этой задачи основные методы инъекционные. На консультации врач расскажет, как проходит процедура и как сделать её комфортной.'; }
      else if (exp === 'soft') note = 'Эти процедуры проходят без инъекций.';
      else if (exp === 'first') note = 'Если это первый опыт, начните с консультации: врач спокойно всё объяснит и ответит на вопросы. Никаких решений «на месте».';
      else note = 'Расскажите врачу, какие процедуры и препараты вы делали раньше, — это поможет составить план.';
      $('.qnote').textContent = note;
      $('.qres').innerHTML = ids.map((id) => { const s = D.svc[id]; return `<a href="${s.u}"><b>${s.t}</b><small>${s.l}</small><em>${s.p}</em></a>`; }).join('');
      go2(3);
    };
    $$('.qstep[data-step="1"] .qopt').forEach((b) => b.addEventListener('click', () => { $$('.qstep[data-step="1"] .qopt').forEach((x) => x.classList.toggle('sel', x === b)); st.goal = b.dataset.v; setTimeout(() => go2(2), 220); }));
    $$('.qstep[data-step="2"] .qopt').forEach((b) => b.addEventListener('click', () => { $$('.qstep[data-step="2"] .qopt').forEach((x) => x.classList.toggle('sel', x === b)); setTimeout(() => result(b.dataset.v), 220); }));
    $('.qback').addEventListener('click', () => go2(1));
    $('.qreset').addEventListener('click', () => { $$('.qopt').forEach((x) => x.classList.remove('sel')); go2(1); });
  }

  /* ---------- scrollspy: price TOC (.grp) + article TOC (h2[id]) ---------- */
  const spy = (links, targets) => {
    if (!links.length || !hasGsap) return;
    targets.forEach((g) => ScrollTrigger.create({ trigger: g, start: 'top 45%', end: () => { const n = targets[targets.indexOf(g) + 1]; return n ? '+=' + Math.max(1, n.getBoundingClientRect().top - g.getBoundingClientRect().top) : 'bottom 45%'; },
      onToggle: (st) => { if (!st.isActive) return; links.forEach((a) => a.classList.toggle('on', a.getAttribute('href') === '#' + g.id));
        const a = links.find((x) => x.classList.contains('on')); const box = a && a.closest('ul,ol');
        if (a && box && box.scrollWidth > box.clientWidth) a.scrollIntoView({ block: 'nearest', inline: 'center' }); } }));
  };
  spy($$('.toc a'), $$('.grp'));
  spy($$('.atoc a'), $$('.prose h2[id]'));

  if (!hasGsap || reduce) { show(); }
  else {
    gsap.registerPlugin(ScrollSmoother, SplitText);
    if (/Chrome\//.test(navigator.userAgent) && !/Edg\/|OPR\//.test(navigator.userAgent) && fine) document.documentElement.classList.add('lg');
    if (fine) $$('.glass').forEach((g) => g.addEventListener('pointermove', (e) => { const r = g.getBoundingClientRect(); g.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%'); g.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%'); }));

    const smoother = fine && $('#smooth-wrapper') ? ScrollSmoother.create({ wrapper: '#smooth-wrapper', content: '#smooth-content', smooth: 1.1, effects: true }) : null;
    $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
      const id = a.getAttribute('href'); const t = id.length > 1 && $(id); if (!t) return;
      e.preventDefault(); smoother ? smoother.scrollTo(t, true, 'top 100px') : t.scrollIntoView({ behavior: 'smooth' });
    }));
    if (smoother && matchMedia('(min-width:1101px)').matches) $$('[data-pin]').forEach((el) => {
      const box = el.closest(el.dataset.pin); if (!box) return;
      el.style.position = 'relative'; el.style.top = '0';
      ScrollTrigger.create({ trigger: el, start: 'top 110px', end: () => '+=' + Math.max(0, box.getBoundingClientRect().bottom - parseFloat(getComputedStyle(box).paddingBottom) - el.getBoundingClientRect().bottom), pin: true, pinSpacing: false, invalidateOnRefresh: true });
    });
    if (location.hash && smoother) { const t = $(location.hash); if (t) setTimeout(() => smoother.scrollTo(t, false, 'top 100px'), 200); }

    const top = $('#top');
    gsap.to('.top .prog', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });
    ScrollTrigger.create({ start: 120, end: 'max', onUpdate: (s) => top.classList.toggle('hide', s.direction === 1 && s.scroll() > 400 && !document.body.classList.contains('menu-open')) });

    /* ---------- arch doctor rotator ---------- */
    const rot = (() => {
      const imgs = $$('.arch img'), dots = $$('.adots button'), who = $('.arch .who'); if (imgs.length < 2 || !who) return null;
      let i = 0, timer = null, bar = null; const D = 5.5;
      const fill = () => { if (bar) bar.kill(); dots.forEach((d) => gsap.set(d.querySelector('i'), { scaleX: 0 })); bar = gsap.to(dots[i].querySelector('i'), { scaleX: 1, duration: D, ease: 'none', onComplete: () => show2((i + 1) % imgs.length) }); };
      const show2 = (n) => {
        if (n === i) return; const a = imgs[i], b = imgs[n]; i = n;
        dots.forEach((d, k) => d.classList.toggle('on', k === n));
        gsap.set(b, { zIndex: 1 }); gsap.set(a, { zIndex: 0 });
        gsap.fromTo(b, { opacity: 0, scale: 1.08 }, { opacity: 1, scale: 1, duration: 1.6, ease: 'power2.inOut', onComplete: () => { a.classList.remove('on'); gsap.set(a, { opacity: 0, scale: 1 }); b.classList.add('on'); } });
        gsap.to(a, { scale: 1.03, duration: 1.6, ease: 'power2.inOut' });
        const t = who.querySelector('.t');
        gsap.timeline().to(t, { y: -8, opacity: 0, duration: 0.35, ease: 'power2.in' })
          .add(() => { who.querySelector('.nm').textContent = b.dataset.nm; who.querySelector('.rl').textContent = b.dataset.rl; who.href = b.dataset.bk; who.setAttribute('aria-label', 'Записаться: ' + b.dataset.nm); })
          .fromTo(t, { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'expo.out' });
        fill();
      };
      dots.forEach((d, k) => d.addEventListener('click', () => show2(k)));
      const st = $('.astage');
      st.addEventListener('pointerenter', () => bar && bar.pause()); st.addEventListener('pointerleave', () => bar && bar.resume());
      return { start: () => { dots[0].classList.add('on'); fill(); } };
    })();

    const go = () => {
      show();
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' }, delay: entered ? 0.55 : 0 });
      tl.fromTo('.top', { opacity: 0 }, { opacity: 1, duration: 1.2, clearProps: 'opacity' }, 0.2);
      if ($('.hero')) {
        const h1 = SplitText.create('.hero h1', { type: 'lines', mask: 'lines', linesClass: 'ln' });
        tl.from('.hero .bg', { scale: 1.18, opacity: 0, duration: 2.4, ease: 'power3.out' }, 0)
          .fromTo('.panel', { opacity: 0 }, { opacity: 1, duration: 0.6, clearProps: 'opacity' }, 0.45)
          .from('.panel .accent', { scaleX: 0, duration: 1.4, ease: 'power3.inOut' }, 0.55)
          .from(h1.lines, { yPercent: 110, duration: 1.3, stagger: 0.1 }, 0.75)
          .fromTo('.hero [data-fade]', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.1, clearProps: 'transform,opacity' }, 1.05)
          .fromTo('.rating', { '--s': 0 }, { '--s': 1, duration: 1.2, ease: 'power3.inOut' }, 1.2)
          .from('.hero .cue', { opacity: 0, duration: 1 }, 1.6);
        gsap.fromTo('.hero .bg img', { yPercent: 0 }, { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
      }
      if ($('.ahero')) {
        const h1 = SplitText.create('.ahero h1', { type: 'lines', mask: 'lines', linesClass: 'ln' });
        tl.fromTo('.arch', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.8, ease: 'expo.inOut', clearProps: 'clipPath' }, 0)
          .from('.arch img.on', { scale: 1.25, duration: 2.6, ease: 'power3.out' }, 0.1)
          .from('.astage .halo', { scaleY: 0, opacity: 0, duration: 1.6, stagger: 0.15, ease: 'expo.inOut' }, 0.5)
          .from('.ahero .rings i', { scale: 0.8, opacity: 0, duration: 2.2, stagger: 0.12, transformOrigin: '50% 100%' }, 0.3)
          .fromTo('.ahero .hlogo', { clipPath: 'inset(0% 0% 100% 0%)', opacity: 0 }, { clipPath: 'inset(0% 0% 0% 0%)', opacity: 1, duration: 1.6, ease: 'power2.inOut', clearProps: 'clipPath' }, 0.3)
          .from('.ahero .accent', { scaleX: 0, duration: 1.4, ease: 'power3.inOut' }, 0.5)
          .from(h1.lines, { yPercent: 110, duration: 1.3, stagger: 0.1 }, 0.7)
          .fromTo('.ahero [data-fade]', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.1, clearProps: 'transform,opacity' }, 1.0)
          .fromTo('.ahero .rating', { '--s': 0 }, { '--s': 1, duration: 1.2, ease: 'power3.inOut' }, 1.2)
          .from('.arch .who, .adots', { y: 16, opacity: 0, duration: 1, stagger: 0.1 }, 1.4)
          .add(() => rot && rot.start(), 1.6);
        gsap.to('.astage', { yPercent: -8, ease: 'none', scrollTrigger: { trigger: '.ahero', start: 'top top', end: 'bottom top', scrub: true } });
        gsap.to('.ahero .rings', { yPercent: 10, ease: 'none', scrollTrigger: { trigger: '.ahero', start: 'top top', end: 'bottom top', scrub: true } });
      }
      $$('.fdeco').forEach((l) => gsap.fromTo(l, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: l.parentElement, start: 'top 85%', end: 'center 50%', scrub: 1 } }));
      $$('.cover .cic svg').forEach((sv) => gsap.fromTo(sv.children, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.6, stagger: { amount: 0.9 }, ease: 'power2.inOut', clearProps: 'strokeDashoffset', scrollTrigger: { trigger: sv.closest('.cover'), start: 'top 85%' } }));
      if ($('.gfig')) {
        $$('.gfig').forEach((f, k) => {
          gsap.fromTo(f.querySelector('.garch'), { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'expo.inOut', delay: k * 0.15, clearProps: 'clipPath', scrollTrigger: { trigger: '.gfigs', start: 'top 80%' } });
          gsap.fromTo(f.querySelector('img'), { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: f, start: 'top bottom', end: 'bottom top', scrub: true } });
        });
      }
      if ($('.dhero')) {
        const h1 = SplitText.create('.dhero h1', { type: 'lines', mask: 'lines', linesClass: 'ln' });
        tl.fromTo('.darch', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'expo.inOut', clearProps: 'clipPath' }, 0)
          .from('.darch img', { scale: 1.2, duration: 2.4, ease: 'power3.out' }, 0.1)
          .from('.dstage .halo', { scaleY: 0, opacity: 0, duration: 1.5, stagger: 0.15, ease: 'expo.inOut' }, 0.4)
          .from('.dtext .accent', { scaleX: 0, duration: 1.2, ease: 'power3.inOut' }, 0.5)
          .from(h1.lines, { yPercent: 110, duration: 1.2, stagger: 0.1 }, 0.6)
          .fromTo('.dhero [data-fade]', { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.08, clearProps: 'transform,opacity' }, 0.85);
      }
      if ($('.phead')) {
        const h = SplitText.create('.phead h1', { type: 'lines', mask: 'lines', linesClass: 'ln' });
        tl.from('.phead .accent', { scaleX: 0, duration: 1.2, ease: 'power3.inOut' }, 0.2)
          .from(h.lines, { yPercent: 110, duration: 1.3, stagger: 0.1 }, 0.35)
          .fromTo('.phead [data-fade]', { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.08, clearProps: 'transform,opacity' }, 0.65)
          .from('.phead .glowp', { opacity: 0, scale: 0.8, duration: 2 }, 0);
        gsap.to('.phead .glowp', { x: '-10vw', y: '6vh', duration: 10, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      }
      if ($('.mani .big')) {
        const mani = SplitText.create('.mani .big', { type: 'words', wordsClass: 'w' });
        gsap.to(mani.words, { opacity: 1, stagger: 0.1, ease: 'none', scrollTrigger: { trigger: '.mani .big', start: 'top 80%', end: 'bottom 45%', scrub: 0.6 } });
        gsap.from('.mani .fact', { y: 40, opacity: 0, duration: 1, stagger: 0.12, ease: 'expo.out', scrollTrigger: { trigger: '.mani .facts', start: 'top 85%' } });
      }
      $$('[data-count]').forEach((el) => {
        const target = parseFloat(el.dataset.count), dec = el.dataset.count.includes('.') ? 1 : 0, o = { v: 0 };
        gsap.to(o, { v: target, duration: 1.8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true }, onUpdate: () => (el.textContent = o.v.toFixed(dec)) });
      });
      $$('[data-split]').forEach((el) => SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'ln', autoSplit: true,
        onSplit: (self) => gsap.from(self.lines, { yPercent: 110, duration: 1.2, stagger: 0.08, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } }) }));
      ScrollTrigger.batch('section:not(.hero):not(.phead) [data-fade], main > .wrap [data-fade]', { start: 'top 92%', once: true,
        onEnter: (els) => gsap.from(els, { y: 28, opacity: 0, duration: 1, stagger: 0.08, ease: 'expo.out' }) });
      ScrollTrigger.batch('.dir, .step, .grp, .rgrid .bac, .acard', { start: 'top 92%', once: true,
        onEnter: (els) => gsap.from(els, { y: 40, opacity: 0, duration: 1, stagger: 0.07, ease: 'expo.out' }) });
      if ($('.team-grid')) {
        gsap.from('.doc .ph', { clipPath: 'inset(100% 0% 0% 0% round 999px 999px 0 0)', duration: 1.5, stagger: 0.12, ease: 'expo.inOut', scrollTrigger: { trigger: '.team-grid', start: 'top 80%' } });
        gsap.from('.doc .ph img', { scale: 1.3, duration: 2, stagger: 0.12, ease: 'expo.out', scrollTrigger: { trigger: '.team-grid', start: 'top 80%' } });
      }
      $$('.docrow').forEach((r) => {
        gsap.from(r.querySelector('.dph'), { clipPath: 'inset(100% 0% 0% 0% round 999px 999px 22px 22px)', duration: 1.6, ease: 'expo.inOut', scrollTrigger: { trigger: r, start: 'top 75%' } });
        gsap.from(r.querySelector('.dph img'), { scale: 1.25, duration: 2.2, ease: 'expo.out', scrollTrigger: { trigger: r, start: 'top 75%' } });
        gsap.from(r.querySelectorAll('.dtx > *'), { y: 30, opacity: 0, duration: 1, stagger: 0.07, ease: 'expo.out', scrollTrigger: { trigger: r, start: 'top 70%' } });
      });
      if ($('.car')) gsap.from('.car .bac', { x: 90, opacity: 0, duration: 1.4, stagger: 0.08, ease: 'expo.out', scrollTrigger: { trigger: '.car', start: 'top 85%' } });
      if ($('.final .big')) gsap.fromTo('.final .big', { x: 40 }, { x: -20, ease: 'none', scrollTrigger: { trigger: '.final', start: 'top bottom', end: 'bottom top', scrub: true } });
    };
    Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise((r) => setTimeout(r, 1500))]).then(go);
  }
}

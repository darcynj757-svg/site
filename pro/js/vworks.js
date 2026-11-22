/* Видео с работами врачей: карусель, автоплей без звука только в зоне видимости, звук по нажатию */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('[data-vworks]').forEach((sec) => {
    const car = sec.querySelector('.vw-car'); if (!car) return;
    const items = [...car.querySelectorAll('.vw-item')]; const vids = items.map((it) => it.querySelector('video'));
    const prev = sec.querySelector('.vw-prev'), next = sec.querySelector('.vw-next'), cnt = sec.querySelector('.vw-cnt'), bar = sec.querySelector('.vw-bar');

    /* листание */
    const step = () => items[0].getBoundingClientRect().width + (parseFloat(getComputedStyle(car).columnGap) || 0);
    const update = () => {
      const max = car.scrollWidth - car.clientWidth; const i = Math.round(car.scrollLeft / step());
      if (cnt) cnt.textContent = Math.min(i + 1, items.length) + ' / ' + items.length;
      if (prev) prev.disabled = car.scrollLeft < 4;
      if (next) next.disabled = car.scrollLeft > max - 4;
      if (bar) bar.style.setProperty('--prog', max > 0 ? Math.max(0.06, car.scrollLeft / max) : 1);
    };
    car.addEventListener('scroll', update, { passive: true }); addEventListener('resize', update); update();
    if (prev) prev.addEventListener('click', () => car.scrollBy({ left: -step(), behavior: reduce ? 'auto' : 'smooth' }));
    if (next) next.addEventListener('click', () => car.scrollBy({ left: step(), behavior: reduce ? 'auto' : 'smooth' }));
    car.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight' && next) next.click(); if (e.key === 'ArrowLeft' && prev) prev.click(); });

    /* воспроизведение: только видимые видео и только пока блок на экране */
    let secOn = false; const seen = new Map();
    const sync = () => vids.forEach((v) => {
      const want = secOn && seen.get(v) && (!reduce || !v.muted);
      if (want) { if (v.paused) { v.preload = 'auto'; const p = v.play(); if (p) p.catch(() => {}); } }
      else if (!v.paused) v.pause();
    });
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((en) => { en.forEach((e) => seen.set(e.target, e.intersectionRatio >= 0.5)); sync(); }, { root: car, threshold: [0, 0.5, 1] });
      vids.forEach((v) => io.observe(v));
      new IntersectionObserver((en) => { secOn = en[0].isIntersecting; sync(); }, { threshold: 0.12 }).observe(car);
    }

    /* звук: нажатие включает звук этого видео и выключает у остальных */
    const setSnd = (k, on) => {
      const it = items[k], b = it.querySelector('.vw-snd'); vids[k].muted = !on; it.classList.toggle('snd', on);
      if (b) { b.setAttribute('aria-pressed', on ? 'true' : 'false'); b.setAttribute('aria-label', on ? 'Выключить звук' : 'Включить звук'); }
    };
    items.forEach((it, k) => it.addEventListener('click', () => {
      const v = vids[k]; const on = v.muted || v.paused;
      vids.forEach((o, j) => { if (j !== k) setSnd(j, false); });
      setSnd(k, on);
      if (on) { seen.set(v, true); v.preload = 'auto'; const p = v.play(); if (p) p.catch(() => {}); }
    }));
  });
})();

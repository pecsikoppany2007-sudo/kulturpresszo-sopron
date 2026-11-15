/* Kultúrpresszó: fényirda 1860. Írógépes nyitás forgó pecséttel és villanóporral, előhívódó fotók,
   gépelt címek, vágójel-kurzor, vaku a teraszon. Csak transform, opacity (és a fotók egyszeri átmenete). */
(function () {
  'use strict';
  var K = window.KIT, H = K.html, RM = K.reduced;
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    K.onResize(function () { ScrollTrigger.refresh(); });
  }
  K.setLang(K.lang, false);
  if (K.renderHours) K.renderHours();
  /* puha görgetés csak egérrel: a Lenis csak ott töltődik le (telefonon gyorsabb az első megjelenés) */
  if (K.canHover && !RM) {
    var ls = document.createElement('script'); ls.src = 'js/vendor/lenis.min.js'; ls.async = true;
    ls.onload = function () { K.startSmooth(); if (K.lenis && H.classList.contains('intro-on')) K.lenis.stop(); };
    document.head.appendChild(ls);
  }

  /* belső linknél minden szakasz kirajzolódik, hogy a görgetés pontosan a címre érkezzen (.lusta = content-visibility) */
  function mindKirajzol() { K.$$('.lusta').forEach(function (x) { x.classList.remove('lusta'); }); }
  document.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('a[href^="#"]')) mindKirajzol(); }, true);
  if (location.hash) mindKirajzol();

  /* ---------- fejléc: a nyitókép fölött átlátszó, lejjebb papír ---------- */
  var fej = K.$('.fejlec'), hero = K.$('.hero');
  if (fej && hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (e) { fej.classList.toggle('is-lent', !e[0].isIntersecting); }, { rootMargin: '-80px 0px 0px 0px' }).observe(hero);
  } else if (fej) fej.classList.add('is-lent');

  /* ---------- gépelt címek (C3) ---------- */
  var gepelt = K.$$('.gepelt');
  function bontas(el) {
    var t = el.textContent, i = 0;
    el.setAttribute('aria-label', t);
    el.innerHTML = t.split('').map(function (c) { return '<span class="bt" aria-hidden="true" style="--i:' + (i++) + '">' + (c === ' ' ? ' ' : K.esc(c)) + '</span>'; }).join('');
    el._n = i;
  }
  function gepel(el) {
    if (el.classList.contains('is-gep') || el.classList.contains('is-kesz')) return;
    el.classList.add('is-gep');
    setTimeout(function () { el.classList.remove('is-gep'); el.classList.add('is-kesz'); }, (el._n || 10) * 42 + 900);
  }
  /* ---------- előhívódó fotók (P5 + M8) ---------- */
  var fotok = K.$$('.foto:not(.foto--elso)');
  var mozog = !RM && 'IntersectionObserver' in window;
  if (mozog) {
    H.classList.add('gepeles', 'elohivas');
    gepelt.forEach(bontas);
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var t = e.target; io.unobserve(t);
        if (t.classList.contains('gepelt')) gepel(t);
        else if (t.classList.contains('etlap')) t.classList.add('is-gep');
        else t.classList.add('is-elohivva');
      });
    }, { rootMargin: '0px 0px -18% 0px' });
    gepelt.forEach(function (g) { io.observe(g); });
    fotok.forEach(function (f) { io.observe(f); });
    var et = K.$('.etlap'); if (et) io.observe(et);
    /* nyelvváltáskor a kit új szöveget ír a címbe: azonnal kész állapot */
    K.onLang(function () { gepelt.forEach(function (g) { if (!g.querySelector('.bt')) { g.classList.remove('is-gep'); g.classList.add('is-kesz'); g.removeAttribute('aria-label'); } }); });
  }
  /* étlap sorai egymás után, mint a gépelés (a kit később rajzolja ki őket) */
  var lista = K.$('[data-etlap]');
  if (lista && 'MutationObserver' in window) new MutationObserver(function () {
    K.$$('li', lista).forEach(function (li, i) { li.style.setProperty('--i', i); });
  }).observe(lista, { childList: true });

  /* ---------- programok: data/esemenyek.json, a lejártak nem látszanak ---------- */
  var pl = K.$('[data-programok]'), pu = K.$('[data-programok-ures]'), prog = null;
  function rajzolProg() {
    if (!pl || !prog) return;
    var ma = new Date(K.bud().t).toISOString().slice(0, 10);
    var jo = (prog.esemenyek || []).filter(function (e) { return e.datum >= ma; }).sort(function (a, b) { return (a.datum + (a.ido || '')) < (b.datum + (b.ido || '')) ? -1 : 1; });
    pl.innerHTML = jo.slice(0, 8).map(function (e) {
      var p = e.datum.split('-'), d = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2]));
      var nap = K.DAYS ? K.L(K.DAYS[d.getUTCDay()]) : '';
      var dt = K.L([+p[1] + '. ' + +p[2] + '.', +p[2] + '. ' + +p[1] + '.', +p[2] + '/' + +p[1]]);
      return '<li><time datetime="' + K.esc(e.datum) + '">' + K.esc(dt) + '</time><div><strong>' + K.esc(K.L(e.cim)) + '</strong>' +
        '<span class="megjegyzes">' + K.esc(nap + (e.ido ? ', ' + e.ido : '')) + '</span>' + (e.leiras && K.L(e.leiras) ? '<p>' + K.esc(K.L(e.leiras)) + '</p>' : '') + '</div></li>';
    }).join('');
    if (pu) pu.hidden = jo.length > 0;
  }
  if (pl) {
    fetch(pl.getAttribute('data-programok')).then(function (r) { return r.json(); }).then(function (j) { prog = j; rajzolProg(); }).catch(function () { if (pu) pu.hidden = false; });
    K.onLang(rajzolProg);
  }

  /* ---------- Botanik: élő állapot (hétköznap 8:30–16:00) ---------- */
  var bm = K.$('[data-botanik-most]');
  function botMost() {
    if (!bm) return;
    var b = K.bud(), hk = b.d >= 1 && b.d <= 5, k = 'bMost3';
    if (hk && b.m >= 510 && b.m < 960) k = 'bMost1'; else if (hk && b.m < 510) k = 'bMost2';
    bm.textContent = K.L([(window.SZOVEG.hu || {})[k], window.SZOVEG.de[k], window.SZOVEG.en[k]]);
    bm.classList.toggle('is-open', k === 'bMost1');
  }
  botMost(); K.onLang(botMost); setInterval(botMost, 60000);

  /* ---------- vágójel-kurzor (K2): négy sarok, linken körbefogja a linket ---------- */
  function kurzor() {
    if (!K.canHover || K.cursor) return;
    var c = document.createElement('div'); c.className = 'kurzor'; c.setAttribute('aria-hidden', 'true');
    c.innerHTML = '<i></i><i></i><i></i><i></i><b></b>'; document.body.appendChild(c); K.cursor = c;
    var sar = K.$$('i', c), pont = K.$('b', c);
    var mx = -200, my = -200, cx = -200, cy = -200, w = 30, h = 22, tw = 30, th = 22, fx = 0, fy = 0, cel = null, raf = 0, last = 0, seen = false;
    function fr(k, dt) { return 1 - Math.pow(1 - k, dt / 16.667); }
    function loop(now) {
      var dt = last ? Math.min(64, now - last) : 16.667; last = now;
      var tx = mx, ty = my;
      if (cel) { var r = cel.getBoundingClientRect(); tx = r.left + r.width / 2; ty = r.top + r.height / 2; tw = r.width + 14; th = r.height + 10; }
      var k = fr(RM ? 1 : .24, dt), kw = fr(RM ? 1 : .2, dt);
      cx += (tx - cx) * k; cy += (ty - cy) * k; w += (tw - w) * kw; h += (th - h) * kw;
      var x0 = cx - w / 2, y0 = cy - h / 2, x1 = cx + w / 2 - 9, y1 = cy + h / 2 - 9;
      sar[0].style.transform = 'translate3d(' + x0.toFixed(1) + 'px,' + y0.toFixed(1) + 'px,0)';
      sar[1].style.transform = 'translate3d(' + x1.toFixed(1) + 'px,' + y0.toFixed(1) + 'px,0)';
      sar[2].style.transform = 'translate3d(' + x0.toFixed(1) + 'px,' + y1.toFixed(1) + 'px,0)';
      sar[3].style.transform = 'translate3d(' + x1.toFixed(1) + 'px,' + y1.toFixed(1) + 'px,0)';
      pont.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)';
      var d = Math.abs(tx - cx) + Math.abs(ty - cy) + Math.abs(tw - w) + Math.abs(th - h);
      raf = d > .2 || cel ? requestAnimationFrame(loop) : (last = 0);
    }
    function go() { if (!raf) raf = requestAnimationFrame(loop); }
    document.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      if (!seen) { seen = true; cx = mx; cy = my; H.classList.add('van-kurzor'); c.classList.add('is-on'); }
      go();
    }, { passive: true });
    document.addEventListener('mouseover', function (e) {
      var t = e.target.closest ? e.target : null; if (!t) return;
      var l = t.closest('a, button, label');
      if (l && l.classList.contains('gep__kereso')) l = null;
      cel = l; c.classList.toggle('is-link', !!l);
      if (!l) { var f = t.closest('[data-cur="photo"], .gep__kereso'); tw = f ? 58 : 30; th = f ? 42 : 22; }
      go();
    });
    H.addEventListener('mouseleave', function () { c.classList.remove('is-on'); });
    H.addEventListener('mouseenter', function () { if (seen) c.classList.add('is-on'); });
    addEventListener('scroll', function () { if (cel) go(); }, { passive: true });
  }
  kurzor();

  /* ---------- vaku a teraszon (J1): a kép a tálban előhívódik, letölthető ---------- */
  var gep = K.$('[data-gep]');
  if (gep) {
    var kereso = K.$('[data-gep-kereso]', gep), nyomat = K.$('.gep__nyomat', gep), datum = K.$('[data-gep-datum]', gep), mentes = K.$('[data-gep-mentes]', gep);
    var kepUrl = 'img/terasz-kereso-1280.jpg', felirat = '';
    function datumSzoveg() {
      var p = new Intl.DateTimeFormat('hu-HU', { timeZone: 'Europe/Budapest', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date()), o = {};
      p.forEach(function (x) { o[x.type] = x.value; });
      var ho = { hu: o.month, de: null, en: null };
      var d = new Date(), hon = function (loc) { return new Intl.DateTimeFormat(loc, { timeZone: 'Europe/Budapest', month: 'long' }).format(d); };
      var dt = K.L([o.year + '. ' + ho.hu + ' ' + +o.day + '. ' + o.hour + ':' + o.minute, +o.day + '. ' + hon('de-DE') + ' ' + o.year + ', ' + o.hour + ':' + o.minute, +o.day + ' ' + hon('en-GB') + ' ' + o.year + ', ' + o.hour + ':' + o.minute]);
      return 'Sopron, Várkerület 96. · ' + dt;
    }
    kereso.addEventListener('click', function () {
      if (gep.classList.contains('is-dolgozik')) return;
      gep.classList.add('is-dolgozik');
      gep.classList.remove('is-hiv', 'is-kesz', 'is-vaku'); void gep.offsetWidth;
      felirat = datumSzoveg(); datum.textContent = felirat;
      nyomat.style.backgroundImage = 'url(' + kepUrl + ')';
      if (mentes) mentes.hidden = true;
      if (!RM) gep.classList.add('is-vaku');
      gep.classList.add(RM ? 'is-kesz' : 'is-hiv');
      setTimeout(function () { gep.classList.remove('is-dolgozik'); if (mentes) mentes.hidden = false; }, RM ? 50 : 5600);
    });
    if (mentes) mentes.addEventListener('click', function () {
      var img = new Image(); img.onload = function () {
        var W = 1200, Hh = 1500, cv = document.createElement('canvas'); cv.width = W; cv.height = Hh;
        var x = cv.getContext('2d'); x.fillStyle = '#f4f0e7'; x.fillRect(0, 0, W, Hh);
        var bw = W - 144, bh = Hh - 360, s = Math.max(bw / img.width, bh / img.height), iw = img.width * s, ih = img.height * s;
        x.save(); x.beginPath(); x.rect(72, 72, bw, bh); x.clip(); x.drawImage(img, 72 + (bw - iw) / 2, 72 + (bh - ih) / 2, iw, ih); x.restore();
        x.fillStyle = '#3b2a1e'; x.font = '34px "Courier Prime", monospace'; x.fillText('Kultúrpresszó', 72, Hh - 200); x.font = '26px "Courier Prime", monospace';
        x.fillText(felirat, 72, Hh - 150);
        cv.toBlob(function (b) { var a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'kulturpresszo-terasz.jpg'; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000); }, 'image/jpeg', .9);
      }; img.src = kepUrl;
    });
    K.onLang(function () { if (felirat) { felirat = datumSzoveg(); datum.textContent = felirat; } });
  }

  /* ---------- intro: írógép, forgó pecsét, villanópor; munkamenetenként egyszer ---------- */
  function intro(done) {
    var el = K.$('#intro');
    if (!el || !H.classList.contains('intro-on') || !el.animate) { if (el) el.remove(); H.classList.remove('intro-on'); done(); return; }
    try { sessionStorage.setItem(K.introKey || 'kulturpresszo-intro', '1'); } catch (e) {}
    if (K.lenis) K.lenis.stop();
    var sorok = K.$$('.intro__sor', el), timers = [], vege = false;
    var s3 = K.$('[data-i18n-sor]', el); if (s3) s3.setAttribute('data-sor', K.t(s3.getAttribute('data-i18n-sor')) || s3.getAttribute('data-sor'));
    var skipT = K.$('.intro__skip', el); if (skipT) skipT.textContent = K.L(K.canHover ? ['Kattintson a kihagyáshoz', 'Klicken zum Überspringen', 'Click to skip'] : ['Koppintson a kihagyáshoz', 'Tippen zum Überspringen', 'Tap to skip']);
    function T(f, ms) { timers.push(setTimeout(f, ms)); }
    var t = 650;
    sorok.forEach(function (s, si) {
      var txt = s.getAttribute('data-sor'), sp = si === 0 ? 85 : 48;
      T(function () { sorok.forEach(function (o) { o.classList.remove('is-gep'); }); s.classList.add('is-gep'); }, t);
      for (var i = 1; i <= txt.length; i++) (function (n) { T(function () { s.textContent = txt.slice(0, n); }, t + n * sp); })(i);
      t += txt.length * sp + (si === 0 ? 380 : 260);
    });
    T(function () { el.classList.add('is-skip'); }, 1400);
    T(vaku, t + 450);
    function vaku() {
      var v = K.$('.intro__vaku', el);
      v.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 90, easing: 'ease-out', fill: 'forwards' }).onfinish = function () {
        K.$('.intro__papir', el).style.visibility = 'hidden'; el.style.background = 'transparent';
        elohivHero();
        v.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 1100, easing: 'cubic-bezier(.2,0,.2,1)', fill: 'forwards' }).onfinish = cleanup;
        finish();
      };
    }
    function finish() { if (vege) return; vege = true; done(); }
    function cleanup() { H.classList.remove('intro-on'); el.remove(); removeEventListener('keydown', skip); }
    function skip() {
      if (el.__sk) return; el.__sk = true; timers.forEach(clearTimeout);
      elohivHero();
      el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 500, easing: 'ease-out', fill: 'forwards' }).onfinish = cleanup;
      finish();
    }
    el.addEventListener('click', skip); el.addEventListener('wheel', skip, { passive: true }); el.addEventListener('touchstart', skip, { passive: true });
    addEventListener('keydown', skip);
  }
  function elohivHero() {
    var f = K.$('.foto--elso'); if (!f || RM) return;
    f.classList.remove('is-elohivva'); void f.offsetWidth; f.classList.add('is-elohivva');
  }
  var elso = K.$('.foto--elso');
  if (elso && H.classList.contains('intro-on') && !RM) elso.classList.add('foto');
  if (elso && !H.classList.contains('intro-on')) elso.classList.add('is-elohivva');

  intro(function () {
    if (K.lenis) K.lenis.start();
    if (window.ScrollTrigger) ScrollTrigger.refresh();
    window.__kitReady = true;
  });
})();

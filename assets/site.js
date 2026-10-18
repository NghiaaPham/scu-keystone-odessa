/* SCU demo — shared behaviour: compact mobile menu and the labelled demo preview dialog.
   Any element with data-demo="text" (or data-demo-ref="#template-id") opens the dialog.
   FUTURE: real form submission, share integrations and map viewers hook in here (see SCU.hooks). */
(function(){
  var SCU = window.SCU = window.SCU || {hooks:{}};

  var root = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.classList.add('js');

  // Mobile menu: animated panel, focus moves into it, Tab is kept inside (button + links), Esc / outside click close
  var btn = document.querySelector('.menu-btn'), nav = document.getElementById('main-nav');
  if (btn && nav){
    var isMobile = function(){ return getComputedStyle(btn).display !== 'none'; };
    var links = function(){ return [].slice.call(nav.querySelectorAll('a[href],button:not([disabled])')); };
    var setOpen = function(open, focusBtn){
      nav.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open){ var f = links()[0]; if (f) setTimeout(function(){ f.focus({preventScroll:true}); }, 30); }
      else if (focusBtn) btn.focus();
    };
    btn.addEventListener('click', function(){ setOpen(!nav.classList.contains('open')); });
    document.addEventListener('keydown', function(e){
      if (!nav.classList.contains('open')) return;
      if (e.key === 'Escape'){ setOpen(false, true); return; }
      if (e.key === 'Tab' && isMobile()){
        var ring = [btn].concat(links()), i = ring.indexOf(document.activeElement);
        if (i === -1) return;
        e.preventDefault();
        ring[(i + (e.shiftKey ? -1 : 1) + ring.length) % ring.length].focus();
      }
    });
    nav.addEventListener('click', function(e){ if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('click', function(e){
      if (nav.classList.contains('open') && !nav.contains(e.target) && !btn.contains(e.target)) setOpen(false);
    });
    window.addEventListener('resize', function(){ if (nav.classList.contains('open') && !isMobile()) setOpen(false); }, {passive:true});
  }

  // Demo preview dialog
  var dlg = document.getElementById('demo-dialog'), body = document.getElementById('demo-dialog-body'), last = null;
  function openDemo(content, title){
    if (!dlg) return;
    body.innerHTML = '';
    if (typeof content === 'string'){ var p = document.createElement('p'); p.textContent = content; body.appendChild(p); }
    else if (content) body.appendChild(content);
    var h = document.getElementById('demo-dialog-title');
    h.textContent = title || 'Demo only. Nothing is submitted or saved.';
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open','');
    dlg.querySelector('.dd-close').focus();
  }
  SCU.openDemo = openDemo;
  document.addEventListener('click', function(e){
    var t = e.target.closest('[data-demo],[data-demo-ref]');
    if (!t) return;
    e.preventDefault(); last = t;
    if (t.hasAttribute('data-demo-ref')){
      var tpl = document.querySelector(t.getAttribute('data-demo-ref'));
      openDemo(tpl ? tpl.content.cloneNode(true) : '', t.getAttribute('data-demo-title'));
    } else openDemo(t.getAttribute('data-demo'), t.getAttribute('data-demo-title'));
  });
  if (dlg){
    var closing = false;
    var closeDemo = function(){
      if (!dlg.open || closing) return;
      if (reduce || typeof dlg.close !== 'function'){ dlg.close ? dlg.close() : dlg.removeAttribute('open'); return; }
      closing = true; dlg.classList.add('closing');
      var done = function(){ if (!closing) return; closing = false; dlg.classList.remove('closing'); dlg.close(); };
      dlg.addEventListener('animationend', done, {once:true}); setTimeout(done, 260);
    };
    dlg.querySelector('.dd-close').addEventListener('click', closeDemo);
    dlg.addEventListener('cancel', function(e){ if (!reduce){ e.preventDefault(); closeDemo(); } });  // Esc
    dlg.addEventListener('close', function(){ if (last) last.focus(); });
    dlg.addEventListener('click', function(e){ if (e.target === dlg) closeDemo(); });
  }

  // Disclosure toggles (e.g. "Become a supporter and stay updated →" offering two separate routes)
  document.querySelectorAll('[data-toggle]').forEach(function(b){
    var panel = document.getElementById(b.getAttribute('data-toggle'));
    if (!panel) return;
    b.setAttribute('aria-expanded','false'); b.setAttribute('aria-controls', panel.id); panel.hidden = true;
    b.addEventListener('click', function(){ var o = panel.hidden; panel.hidden = !o; b.setAttribute('aria-expanded', o ? 'true':'false'); });
  });

  // ---------------------------------------------------------------------------
  // Motion layer — restrained and progressive: nothing is hidden unless JS runs,
  // only below-the-fold elements are prepared for reveal, and reduced-motion
  // users get none of it. Only opacity / translate are animated.
  var header = document.querySelector('.site-header');

  // Header elevation + reading progress (one rAF-throttled passive scroll handler)
  var bar = null;
  if (header && document.querySelector('main')){
    bar = document.createElement('div'); bar.className = 'read-progress'; bar.setAttribute('aria-hidden','true');
    header.appendChild(bar);
  }
  var ticking = false, scrolled = null;
  function onScroll(){
    ticking = false;
    var y = window.pageYOffset || root.scrollTop, max = root.scrollHeight - window.innerHeight;
    var s2 = y > 4;
    if (s2 !== scrolled){ scrolled = s2; header && header.classList.toggle('is-scrolled', s2); }
    if (bar){
      var long = max > window.innerHeight * 2;           // only meaningful on long pages
      bar.style.display = long ? '' : 'none';
      if (long) bar.style.transform = 'scaleX(' + Math.min(1, Math.max(0, y / max)).toFixed(4) + ')';
    }
  }
  window.addEventListener('scroll', function(){ if (!ticking){ ticking = true; requestAnimationFrame(onScroll); } }, {passive:true});
  window.addEventListener('resize', function(){ if (!ticking){ ticking = true; requestAnimationFrame(onScroll); } }, {passive:true});
  onScroll();

  // Active-section highlighting in in-page section menus (the "On this page" indexes)
  var spyLinks = [].slice.call(document.querySelectorAll('.doc-index a[href^="#"]'));
  if (spyLinks.length && 'IntersectionObserver' in window){
    var map = spyLinks.map(function(a){ return [a, document.getElementById(a.getAttribute('href').slice(1))]; }).filter(function(p){ return p[1]; });
    var setCurrent = function(a){ map.forEach(function(p){ if (p[0] === a) p[0].setAttribute('aria-current','location'); else p[0].removeAttribute('aria-current'); }); };
    var visible = new Set();
    var spy = new IntersectionObserver(function(entries){
      entries.forEach(function(en){ if (en.isIntersecting) visible.add(en.target); else visible.delete(en.target); });
      var first = null;
      map.forEach(function(p){ if (!first && visible.has(p[1])) first = p[0]; });
      if (first) setCurrent(first);
    }, {rootMargin:'-' + ((header ? header.offsetHeight : 0) + 20) + 'px 0px -55% 0px'});
    map.forEach(function(p){ spy.observe(p[1]); });
    spyLinks.forEach(function(a){ a.addEventListener('click', function(){ setCurrent(a); }); });
  }

  // Images: fade in when decoded (boxes are reserved by width/height or aspect-ratio, so no layout shift)
  if (!reduce){
    [].forEach.call(document.querySelectorAll('main img'), function(img){
      if (img.complete && img.naturalWidth) return;
      img.classList.add('ld');
      var ok = function(){ img.classList.add('ok'); };
      img.addEventListener('load', ok, {once:true}); img.addEventListener('error', ok, {once:true});
    });
  }

  // Reveal on scroll: short fade + 12px rise, once, light stagger inside grids
  if (!reduce && 'IntersectionObserver' in window){
    var SEL = ['main .card','main article','main figure','main .callout','main .icard','main .g2 > *','main .g3 > *','main .g4 > *',
      'main .tabs','main .itabs > li','main .route','main .band','main .lib-row','main .story-card','main table',
      'main .pcol','main .pbanner','main .plimit','main .split > *','main .principles > *'].join(',');
    var picked = [].slice.call(document.querySelectorAll(SEL)), set = new Set(picked);
    var outermost = picked.filter(function(el){ for (var p = el.parentElement; p; p = p.parentElement) if (set.has(p)) return false; return true; });
    // generic editorial blocks (headings, ledes, intros) that are not, and do not contain, a component above
    var generic = [].slice.call(document.querySelectorAll('main section > .wrap > *, main section > .wrap > header > *')).filter(function(el){
      if (set.has(el) || el.matches('header')) return false;
      for (var p = el.parentElement; p; p = p.parentElement) if (set.has(p)) return false;
      return !picked.some(function(c){ return el.contains(c); });
    });
    var vh = window.innerHeight;
    var targets = outermost.concat(generic).filter(function(el){
      if (el.closest('dialog,template,[hidden],.doc-index,.about-aside') || el.matches('script,style,nav,.tabs-wrap')) return false;
      var r = el.getBoundingClientRect();
      if (r.top < vh * 0.92 || r.height === 0) return false;                              // already on screen: leave alone
      var cs = getComputedStyle(el);
      return cs.position !== 'sticky' && cs.position !== 'fixed' && cs.position !== 'absolute' && parseFloat(cs.opacity) === 1;
    });
    targets.forEach(function(el){ el.classList.add('rv'); });
    var io = new IntersectionObserver(function(entries){
      var batch = entries.filter(function(en){ return en.isIntersecting; }).map(function(en){ return en.target; });
      batch.forEach(function(el){
        var sibs = batch.filter(function(b){ return b.parentElement === el.parentElement; });
        var i = sibs.indexOf(el);
        el.style.setProperty('--rv-d', Math.min(i, 4) * 70 + 'ms');
        el.classList.add('in'); io.unobserve(el);
        var clean = function(){ el.classList.remove('rv','in'); el.style.removeProperty('--rv-d'); };
        el.addEventListener('transitionend', function te(e){ if (e.target === el && e.propertyName === 'opacity'){ el.removeEventListener('transitionend', te); clean(); } });
        setTimeout(clean, 1200);
      });
    }, {rootMargin:'0px 0px -8% 0px', threshold:0.01});
    targets.forEach(function(el){ io.observe(el); });
    // safety net: anything a hash jump or print skips is shown immediately
    var showAll = function(){ targets.forEach(function(el){ el.classList.remove('rv','in'); }); io.disconnect(); };
    window.addEventListener('beforeprint', showAll);
    SCU.revealAll = showAll;
  }
})();

/* SCU demo — shared behaviour: compact mobile menu and the labelled demo preview dialog.
   Any element with data-demo="text" (or data-demo-ref="#template-id") opens the dialog.
   FUTURE: real form submission, share integrations and map viewers hook in here (see SCU.hooks). */
(function(){
  var SCU = window.SCU = window.SCU || {hooks:{}};

  // Mobile menu
  var btn = document.querySelector('.menu-btn'), nav = document.getElementById('main-nav');
  if (btn && nav){
    btn.addEventListener('click', function(){
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape' && nav.classList.contains('open')){ nav.classList.remove('open'); btn.setAttribute('aria-expanded','false'); btn.focus(); }
    });
    nav.addEventListener('click', function(e){ if (e.target.closest('a')){ nav.classList.remove('open'); btn.setAttribute('aria-expanded','false'); }});
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
    dlg.querySelector('.dd-close').addEventListener('click', function(){ dlg.close ? dlg.close() : dlg.removeAttribute('open'); });
    dlg.addEventListener('close', function(){ if (last) last.focus(); });
    dlg.addEventListener('click', function(e){ if (e.target === dlg) dlg.close(); });
  }

  // Disclosure toggles (e.g. "Become a supporter and stay updated →" offering two separate routes)
  document.querySelectorAll('[data-toggle]').forEach(function(b){
    var panel = document.getElementById(b.getAttribute('data-toggle'));
    if (!panel) return;
    b.setAttribute('aria-expanded','false'); b.setAttribute('aria-controls', panel.id); panel.hidden = true;
    b.addEventListener('click', function(){ var o = panel.hidden; panel.hidden = !o; b.setAttribute('aria-expanded', o ? 'true':'false'); });
  });
})();

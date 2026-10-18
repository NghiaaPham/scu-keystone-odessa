/* Shared header, footer, map viewer, mobile nav, "On this page", back-to-top, form validation.
   Each page: <body data-page="home|issues|facts|proposal|action|about|other">
   with <div id="site-header"></div> ... <div id="site-footer"></div>
   Public API: window.SCU = { validateForm(form) -> boolean, clearErrors(form), openMap(src,title,download,opener) } */
(function(){
  const SCU = window.SCU = window.SCU || {};
  const page = document.body.dataset.page || '';
  const here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const file = h => h.split('#')[0].toLowerCase();
  const NAV = [
    ['home','index.html','Our Community'],
    ['issues','issues.html','Issues',[['issues.html','Issues overview'],['roads-safety.html','Roads & Safety'],['water-septic.html','Water & Septic'],['growth.html','Growth & Daily Life']]],
    ['facts','evidence.html','The Facts'],
    ['proposal','proposal.html','The Proposal',[['proposal.html','Proposal overview'],['proposal.html#compare','Compare the Two Plans']]],
    ['action','action.html','Take Action'],
    ['about','about.html','About']
  ];
  const GET_INVOLVED = 'action.html#actions';
  /* aria-current="page" only on an exact page match (hash links never); section parent gets a visual class only */
  const cur = h => (!h.includes('#') && file(h)===here) ? ' aria-current="page"' : '';
  const inSection = (k,h,kids) => k===page || file(h)===here || (kids||[]).some(([c])=>file(c)===here);
  const chev = '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M1 3l4 4 4-4" stroke="currentColor" stroke-width="1.6" fill="none"/></svg>';

  const desk = NAV.map(([k,h,l,kids],i)=>{
    const sec = inSection(k,h,kids) && !cur(h) ? ' class="is-section"' : '';
    if(!kids) return `<div class="ni"><a href="${h}"${cur(h)}${sec}>${l}</a></div>`;
    return `<div class="ni"><a href="${h}"${cur(h)}${sec}>${l}</a><button class="sub-toggle" type="button" aria-expanded="false" aria-controls="sub-${k}" aria-label="${l}: more pages">${chev}</button>`+
      `<ul class="sub" id="sub-${k}">${kids.map(([ch,cl])=>`<li><a href="${ch}"${cur(ch)}>${cl}</a></li>`).join('')}</ul></div>`;
  }).join('');
  const mob = NAV.map(([k,h,l,kids])=>{
    const sec = inSection(k,h,kids) && !cur(h) ? ' class="is-section"' : '';
    const sub = kids ? `<ul>${kids.slice(1).map(([ch,cl])=>`<li><a href="${ch}"${cur(ch)}>${cl}</a></li>`).join('')}</ul>` : '';
    return `<a href="${h}"${cur(h)}${sec}>${l}</a>${sub}`;
  }).join('');

  const mark = '<svg class="brand-mark" viewBox="0 0 32 32" aria-hidden="true"><rect x="1" y="1" width="30" height="30" rx="3" fill="#17324D"/><path d="M6 21c4-5 8-5 10-2s6 3 10-2" stroke="#7fc1b9" stroke-width="2" fill="none"/><path d="M6 25c4-5 8-5 10-2s6 3 10-2" stroke="#28736D" stroke-width="2" fill="none"/><path d="M16 6l7 6H9z" fill="#C55245"/></svg>';
  const burger = '<svg viewBox="0 0 18 18" aria-hidden="true"><path d="M2 4h14M2 9h14M2 14h14" stroke="currentColor" stroke-width="1.8"/></svg>';
  const xIcon = '<svg viewBox="0 0 18 18" aria-hidden="true"><path d="M3 3l12 12M15 3L3 15" stroke="currentColor" stroke-width="1.8"/></svg>';

  const h = document.getElementById('site-header');
  if(h){
    h.outerHTML = `<a class="skip" href="#main">Skip to content</a>
    <div class="proto-banner"><b>Review prototype</b> · Private preview for Safer Communities United. Sample figures and records are illustrative until verified.</div>
    <header class="site-header"><div class="wrap bar">
      <a class="brand" href="index.html"${here==='index.html'?' aria-current="page"':''}>${mark}<span>Safer<br>Communities United</span></a>
      <nav class="nav" aria-label="Main">${desk}</nav>
      <a class="btn btn-primary header-cta" href="${GET_INVOLVED}">Get Involved</a>
      <button class="menu-btn" type="button" aria-expanded="false" aria-controls="mnav">${burger}<span class="mb-l">Menu</span><span class="sr-only mb-sr">Open menu</span></button>
    </div>
    <nav id="mnav" class="mobile-nav" aria-label="Main (mobile)">${mob}<a class="btn btn-primary" href="${GET_INVOLVED}">Get Involved</a></nav>
    </header>`;
    const b=document.querySelector('.menu-btn'),m=document.getElementById('mnav');
    const setMenu=o=>{m.classList.toggle('open',o);b.setAttribute('aria-expanded',o);b.querySelector('svg').outerHTML=o?xIcon:burger;b.querySelector('.mb-l').textContent=o?'Close':'Menu';b.querySelector('.mb-sr').textContent=o?'Close menu':'Open menu';};
    b.addEventListener('click',()=>setMenu(!m.classList.contains('open')));
    m.addEventListener('click',e=>{if(e.target.closest('a'))setMenu(false);});
    document.addEventListener('keydown',e=>{
      if(e.key!=='Escape')return;
      if(m.classList.contains('open')){setMenu(false);b.focus();}
      const op=document.querySelector('.nav .ni.open');if(op){op.classList.remove('open');const t=op.querySelector('.sub-toggle');t.setAttribute('aria-expanded','false');t.focus();}
    });
    /* desktop sub-menus: hover (CSS) or toggle button */
    document.querySelectorAll('.nav .sub-toggle').forEach(t=>t.addEventListener('click',()=>{
      const ni=t.parentElement,o=!ni.classList.contains('open');
      document.querySelectorAll('.nav .ni.open').forEach(n=>{n.classList.remove('open');n.querySelector('.sub-toggle').setAttribute('aria-expanded','false');});
      ni.classList.toggle('open',o);t.setAttribute('aria-expanded',o);
    }));
    document.addEventListener('click',e=>{if(!e.target.closest('.nav .ni'))document.querySelectorAll('.nav .ni.open').forEach(n=>{n.classList.remove('open');n.querySelector('.sub-toggle').setAttribute('aria-expanded','false');});});
    document.querySelectorAll('.nav .ni').forEach(ni=>ni.addEventListener('focusout',e=>{if(!ni.contains(e.relatedTarget)&&ni.classList.contains('open')){ni.classList.remove('open');ni.querySelector('.sub-toggle').setAttribute('aria-expanded','false');}}));
  }
  const f = document.getElementById('site-footer');
  if(f){
    const fl=(href,l)=>`<li><a href="${href}"${cur(href)}>${l}</a></li>`;
    f.outerHTML = `<footer class="site-footer"><div class="wrap">
      <div class="top">
        <div><h2>Safer Communities United</h2><p style="color:#c9d4de">Putting the health, safety, and welfare of people first.</p></div>
        <div><h3>Explore</h3><ul>${fl('index.html','Our Community')}${fl('issues.html','Issues')}${fl('evidence.html','The Facts')}${fl('proposal.html','The Proposal')}</ul></div>
        <div><h3>Get Involved</h3><ul>${fl('action.html','Take Action')}${fl('updates.html','Updates')}${fl('contact.html','Contact')}</ul></div>
        <div><h3>Information</h3><ul>${fl('about.html','About')}${fl('sources-methods.html','Sources &amp; Methods')}${fl('accessibility.html','Accessibility')}${fl('edits.html','Edits')}${fl('privacy.html','Privacy')}</ul></div>
      </div>
      <div class="bottom"><span>© 2026 Safer Communities United · Keystone–Odessa, Hillsborough County, Florida</span><span>Review build — not for public distribution</span></div>
    </div></footer>`;
  }

  /* ---- "On this page": built from main [data-toc] sections (skipped if the page has its own .doc-index / .iss-index / [data-own-toc]) ---- */
  const main=document.getElementById('main')||document.querySelector('main');
  if(main && !main.hasAttribute('tabindex')) main.setAttribute('tabindex','-1');
  const tocEls=main?[...main.querySelectorAll('[data-toc]')]:[];
  const ownToc=document.querySelector('.doc-index,.iss-index,[data-own-toc]')||document.body.hasAttribute('data-toc-off');
  if(tocEls.length>=2 && !ownToc){
    tocEls.forEach((el,i)=>{if(!el.id)el.id='sec-'+(i+1);});
    const nav=document.createElement('nav');nav.className='onpage';nav.setAttribute('aria-label','On this page');
    nav.innerHTML=`<div class="op-in"><p class="op-h" aria-hidden="true">On this page</p>`+
      `<button class="op-toggle" type="button" aria-expanded="false" aria-controls="op-list"><span class="op-k">On this page</span><span class="op-cur">${tocEls[0].dataset.toc}</span>${chev}</button>`+
      `<ol id="op-list">${tocEls.map(el=>`<li><a href="#${el.id}">${el.dataset.toc}</a></li>`).join('')}</ol></div>`;
    let anchor=tocEls[0];while(anchor.parentElement && anchor.parentElement!==main)anchor=anchor.parentElement;
    if(anchor.parentElement===main) main.insertBefore(nav,anchor); else main.prepend(nav);
    document.body.classList.add('has-onpage');
    const setH=()=>document.documentElement.style.setProperty('--onpage-h',nav.querySelector(window.matchMedia('(max-width:860px)').matches?'.op-toggle':'.op-in').offsetHeight+'px');
    setH();addEventListener('resize',setH);
    const tg=nav.querySelector('.op-toggle'),links=[...nav.querySelectorAll('ol a')],curEl=nav.querySelector('.op-cur');
    const setOpen=o=>{nav.classList.toggle('open',o);tg.setAttribute('aria-expanded',o);};
    tg.addEventListener('click',()=>setOpen(!nav.classList.contains('open')));
    nav.addEventListener('click',e=>{if(e.target.closest('ol a'))setOpen(false);});
    nav.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){setOpen(false);tg.focus();}});
    const mark=id=>{links.forEach(a=>{const on=a.getAttribute('href')==='#'+id;if(on){a.setAttribute('aria-current','true');curEl.textContent=a.textContent;if(!window.matchMedia('(max-width:860px)').matches){const ol=a.closest('ol');const l=a.parentElement.offsetLeft;if(l<ol.scrollLeft||l+a.offsetWidth>ol.scrollLeft+ol.clientWidth)ol.scrollTo({left:l-24,behavior:'smooth'});}}else a.removeAttribute('aria-current');});};
    if('IntersectionObserver' in window){
      const vis=new Map();
      const io=new IntersectionObserver(es=>{es.forEach(e=>vis.set(e.target.id,e.isIntersecting));const first=tocEls.find(el=>vis.get(el.id));if(first)mark(first.id);},{rootMargin:'-30% 0px -60% 0px'});
      tocEls.forEach(el=>io.observe(el));
    }
    mark(tocEls[0].id);
  }

  /* ---- Back to top: appears after two screen heights; returns focus to main ---- */
  const tt=document.createElement('button');tt.type='button';tt.className='to-top';tt.innerHTML='<span aria-hidden="true">↑</span><span class="tt-l">Back to top</span>';tt.setAttribute('aria-label','Back to top');
  document.body.appendChild(tt);
  const ttCheck=()=>{const on=scrollY>innerHeight*2;tt.classList.toggle('show',on);tt.tabIndex=on?0:-1;};
  addEventListener('scroll',ttCheck,{passive:true});ttCheck();
  tt.addEventListener('click',()=>{window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});if(main)main.focus({preventScroll:true});});

  /* ---- Full-screen map viewer: any element with data-map-src (data-map-title, data-map-download) ---- */
  let v;
  const FOCUSABLE='button:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])';
  function viewer(){
    if(v) return v;
    v=document.createElement('div');v.className='viewer';v.setAttribute('role','dialog');v.setAttribute('aria-modal','true');
    v.setAttribute('aria-labelledby','viewer-title');v.setAttribute('aria-describedby','viewer-hint');
    v.innerHTML=`<div class="vbar"><h2 class="t" id="viewer-title"></h2><span class="vhint" id="viewer-hint">Drag to move · pinch, scroll or +/− to zoom · Esc to close</span><button class="vclose" type="button" data-z="close" aria-label="Close map">${xIcon.replace('<svg','<svg width="16" height="16"')}<span aria-hidden="true">Close</span></button></div>`+
      `<div class="stage"><img alt=""></div>`+
      `<div class="vtools"><button type="button" data-z="out" aria-label="Zoom out">−</button><span class="vzoom" aria-live="polite" aria-atomic="true">100%</span><button type="button" data-z="in" aria-label="Zoom in">+</button><button type="button" data-z="fit">Fit</button><a class="dl" href="#" download><span aria-hidden="true">↓</span><span class="dl-l">Download original</span><span class="sr-only">Download original map</span></a></div>`;
    document.body.appendChild(v);
    const st=v.querySelector('.stage'),img=v.querySelector('img'),zr=v.querySelector('.vzoom');let s=1,fs=1,x=0,y=0,drag=null;
    const ptrs=new Map();let pinch=null,lastTap=0,ztimer;
    const apply=()=>{img.style.transform=`translate(${x}px,${y}px) scale(${s})`;clearTimeout(ztimer);ztimer=setTimeout(()=>zr.textContent=Math.round(s/fs*100)+'%',120);};
    const fit=()=>{const r=st.getBoundingClientRect();if(!img.naturalWidth)return;s=fs=Math.min(r.width/img.naturalWidth,r.height/img.naturalHeight)*.96;x=(r.width-img.naturalWidth*s)/2;y=(r.height-img.naturalHeight*s)/2;apply();};
    const zoom=(k,cx,cy)=>{const r=st.getBoundingClientRect();cx=cx??r.width/2;cy=cy??r.height/2;const ns=Math.max(fs*.5,Math.min(fs*12,s*k));x=cx-(cx-x)*ns/s;y=cy-(cy-y)*ns/s;s=ns;apply();};
    let opener=null,bg=[];
    v._open=(src,title,dl,from)=>{
      opener=from||document.activeElement;
      img.onload=fit;img.src=src;img.alt=title;v.querySelector('.t').textContent=title;v.querySelector('.dl').href=dl||src;
      v.classList.add('open');document.body.style.overflow='hidden';
      bg=[...document.body.children].filter(el=>el!==v&&!el.inert&&el.tagName!=='SCRIPT');bg.forEach(el=>{el.inert=true;el.setAttribute('aria-hidden','true');});
      if(img.complete&&img.naturalWidth)fit();
      v.querySelector('.vclose').focus();
    };
    const close=()=>{if(!v.classList.contains('open'))return;v.classList.remove('open');document.body.style.overflow='';bg.forEach(el=>{el.inert=false;el.removeAttribute('aria-hidden');});bg=[];if(opener&&opener.focus)opener.focus();};
    v._close=close;
    v.addEventListener('click',e=>{const b=e.target.closest('[data-z]');if(!b)return;const z=b.dataset.z;if(z==='in')zoom(1.4);if(z==='out')zoom(1/1.4);if(z==='fit')fit();if(z==='close')close();});
    st.addEventListener('wheel',e=>{e.preventDefault();const r=st.getBoundingClientRect();zoom(e.deltaY<0?1.15:1/1.15,e.clientX-r.left,e.clientY-r.top);},{passive:false});
    st.addEventListener('pointerdown',e=>{
      st.setPointerCapture(e.pointerId);ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
      if(ptrs.size===2){const [a,b]=[...ptrs.values()];pinch={d:Math.hypot(a.x-b.x,a.y-b.y)};drag=null;}
      else if(ptrs.size===1){drag={px:e.clientX,py:e.clientY,x,y};
        const now=Date.now();if(e.pointerType!=='mouse'&&now-lastTap<300){const r=st.getBoundingClientRect();if(s>fs*1.5)fit();else zoom(2,e.clientX-r.left,e.clientY-r.top);lastTap=0;}else lastTap=now;}
    });
    st.addEventListener('pointermove',e=>{
      if(!ptrs.has(e.pointerId))return;ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
      if(pinch&&ptrs.size>=2){const [a,b]=[...ptrs.values()];const d=Math.hypot(a.x-b.x,a.y-b.y);const r=st.getBoundingClientRect();if(pinch.d>0)zoom(d/pinch.d,(a.x+b.x)/2-r.left,(a.y+b.y)/2-r.top);pinch.d=d;return;}
      if(!drag)return;x=drag.x+e.clientX-drag.px;y=drag.y+e.clientY-drag.py;apply();
    });
    const up=e=>{ptrs.delete(e.pointerId);if(ptrs.size<2)pinch=null;if(ptrs.size===1){const p=[...ptrs.values()][0];drag={px:p.x,py:p.y,x,y};}else if(!ptrs.size)drag=null;};
    st.addEventListener('pointerup',up);st.addEventListener('pointercancel',up);
    st.addEventListener('dblclick',e=>{const r=st.getBoundingClientRect();if(s>fs*1.5)fit();else zoom(2,e.clientX-r.left,e.clientY-r.top);});
    addEventListener('resize',()=>{if(v.classList.contains('open'))fit();});
    document.addEventListener('keydown',e=>{
      if(!v.classList.contains('open'))return;
      if(e.key==='Escape'){e.preventDefault();close();return;}
      if(e.key==='Tab'){const f=[...v.querySelectorAll(FOCUSABLE)].filter(el=>el.offsetParent!==null);if(!f.length)return;const i=f.indexOf(document.activeElement);
        if(e.shiftKey&&(i<=0)){e.preventDefault();f[f.length-1].focus();}else if(!e.shiftKey&&(i===f.length-1||i<0)){e.preventDefault();f[0].focus();}return;}
      if(e.key==='+'||e.key==='=')zoom(1.25);else if(e.key==='-'||e.key==='_')zoom(.8);else if(e.key==='0')fit();
      else if(e.key.startsWith('Arrow')){e.preventDefault();const d=60;if(e.key==='ArrowLeft')x+=d;if(e.key==='ArrowRight')x-=d;if(e.key==='ArrowUp')y+=d;if(e.key==='ArrowDown')y-=d;apply();}
    });
    return v;
  }
  SCU.openMap=(src,title,dl,from)=>viewer()._open(src,title||'Map',dl,from);
  document.addEventListener('click',e=>{
    const t=e.target.closest('[data-map-src]');if(!t)return;e.preventDefault();
    SCU.openMap(t.dataset.mapSrc,t.dataset.mapTitle,t.dataset.mapDownload,t);
  });
  document.querySelectorAll('[data-map-src]').forEach(el=>{
    el.setAttribute('aria-haspopup','dialog');
    if(!el.matches('button,a')){el.tabIndex=0;el.setAttribute('role','button');
      if(!el.getAttribute('aria-label')&&!el.textContent.trim())el.setAttribute('aria-label','Open full screen: '+(el.dataset.mapTitle||'map'));
      el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();el.click();}});}
  });

  /* ---- Forms: SCU.validateForm(form) — inline errors + error summary ----
     Per control, optional: data-err="message for any problem", data-err-missing, data-err-format.
     Group rule: <fieldset data-required-group data-err="Choose at least one option"> = at least one box/radio checked.
     Date inputs with data-today are prefilled with today's date. */
  const today=(()=>{const t=new Date();return new Date(t-t.getTimezoneOffset()*6e4).toISOString().slice(0,10);})();
  document.querySelectorAll('input[type=date][data-today]').forEach(d=>{if(!d.value)d.value=today;});
  let uid=0;
  const idOf=el=>el.id||(el.id='scu-f'+(++uid));
  const clean=t=>(t||'').replace(/\s+/g,' ').replace(/\*|\(optional\)|optional|required/gi,'').trim().replace(/[:.]$/,'');
  function labelOf(el){
    if(el.matches('fieldset')){const lg=el.querySelector('legend');return clean(lg&&lg.textContent)||'This group';}
    if(el.type==='checkbox'||el.type==='radio'){
      if(el.type==='radio'){const fs=el.closest('fieldset');const lg=fs&&fs.querySelector('legend');if(lg)return clean(lg.textContent);}
      const l=el.closest('label')||(el.id&&document.querySelector(`label[for="${el.id}"]`));return clean(l?l.textContent:el.name);
    }
    const l=(el.id&&document.querySelector(`label[for="${el.id}"]`))||el.closest('label');
    return clean((l&&l.cloneNode(true).textContent)||el.getAttribute('aria-label')||el.name||'This field');
  }
  function msgOf(el){
    const d=el.dataset,vs=el.validity;
    if(vs.customError)return el.validationMessage;
    if(d.err)return d.err;
    if(vs.valueMissing){if(d.errMissing)return d.errMissing;
      if(el.type==='checkbox')return 'Tick this box to continue.';
      if(el.type==='radio')return 'Choose one option.';
      if(el.tagName==='SELECT')return 'Choose an option.';
      if(el.type==='email')return 'Enter your email address.';
      if(el.type==='date')return 'Enter a date.';
      {const l=labelOf(el);return 'Enter your '+(/^[A-Z]{2}/.test(l)?l:l.charAt(0).toLowerCase()+l.slice(1))+'.';}}
    if(d.errFormat&&(vs.typeMismatch||vs.patternMismatch))return d.errFormat;
    if(vs.typeMismatch&&el.type==='email')return 'Enter an email address like name@example.com.';
    if(vs.typeMismatch&&el.type==='url')return 'Enter a web address starting with https://.';
    if(vs.patternMismatch){if(/zip|postal/i.test(el.name+el.id+el.autocomplete))return 'Enter a 5-digit ZIP code, for example 33556.';return 'Check the format of this answer.';}
    if(vs.tooShort)return `Use at least ${el.minLength} characters (you have ${el.value.length}).`;
    if(vs.tooLong)return `Use no more than ${el.maxLength} characters.`;
    if(vs.rangeOverflow)return el.type==='date'?'Enter a date that is not in the future.':`Enter a value no higher than ${el.max}.`;
    if(vs.rangeUnderflow)return `Enter a value no lower than ${el.min}.`;
    return el.validationMessage||'Check this answer.';
  }
  /* Where the error message goes, and which element is "the item" (field wrapper / check / fieldset) */
  function slotOf(el){
    if(el.matches('fieldset'))return {box:el,after:el.querySelector('legend'),targets:[...el.querySelectorAll('input,select,textarea')]};
    if(el.type==='radio'){const fs=el.closest('fieldset');if(fs)return {box:fs,after:fs.querySelector('legend'),targets:[...fs.querySelectorAll(`input[name="${el.name}"]`)]};}
    if(el.type==='checkbox'){const c=el.closest('.check')||el.closest('label')||el;return {box:c,afterEl:c,targets:[el]};}
    const fld=el.closest('.field');if(fld){const hint=[...fld.children].filter(c=>c.matches('.hint'));return {box:fld,afterEl:hint.length?hint[hint.length-1]:el,targets:[el]};}
    return {box:el,afterEl:el,targets:[el]};
  }
  function setError(el,msg,form){
    const sl=slotOf(el),key=idOf(sl.box.matches('fieldset')?sl.box:el),eid=key+'-err';
    let p=document.getElementById(eid);
    if(!p){p=document.createElement('p');p.className='err';p.id=eid;
      if(sl.after)sl.after.insertAdjacentElement('afterend',p);else sl.afterEl.insertAdjacentElement('afterend',p);}
    p.textContent=msg;
    sl.box.classList.add('invalid');
    sl.targets.forEach(t=>{t.setAttribute('aria-invalid','true');const db=(t.getAttribute('aria-describedby')||'').split(/\s+/).filter(Boolean);if(!db.includes(eid)){db.push(eid);t.setAttribute('aria-describedby',db.join(' '));}});
    return {id:idOf(sl.targets[0]||el),label:labelOf(sl.box.matches('fieldset')?sl.box:el),msg};
  }
  function clearError(el){
    const sl=slotOf(el),key=(sl.box.matches('fieldset')?sl.box:el).id,eid=key&&key+'-err';
    sl.box.classList.remove('invalid');
    sl.targets.forEach(t=>{t.removeAttribute('aria-invalid');if(eid){const db=(t.getAttribute('aria-describedby')||'').split(/\s+/).filter(x=>x&&x!==eid);db.length?t.setAttribute('aria-describedby',db.join(' ')):t.removeAttribute('aria-describedby');}});
    const p=eid&&document.getElementById(eid);if(p)p.remove();
  }
  function problems(form){
    const out=[],seen=new Set();
    form.querySelectorAll('fieldset[data-required-group]').forEach(fs=>{
      if(fs.disabled||fs.closest('[hidden]'))return;
      const ok=[...fs.querySelectorAll('input[type=checkbox],input[type=radio]')].some(i=>i.checked);
      fs.querySelectorAll('input').forEach(i=>seen.add(i));
      out.push({el:fs,ok,msg:fs.dataset.err||'Choose at least one option.'});
    });
    [...form.elements].forEach(el=>{
      if(seen.has(el)||!el.willValidate||el.matches('button,fieldset,[type=submit],[type=hidden]'))return;
      if(el.type==='radio'){if([...seen].some(s=>s.name===el.name&&s.type==='radio'))return;form.querySelectorAll(`input[type=radio][name="${el.name}"]`).forEach(r=>seen.add(r));
        const grp=[...form.querySelectorAll(`input[type=radio][name="${el.name}"]`)];const bad=grp.find(r=>!r.validity.valid);out.push({el:bad||el,ok:!bad,msg:bad?msgOf(bad):''});return;}
      seen.add(el);out.push({el,ok:el.validity.valid,msg:el.validity.valid?'':msgOf(el)});
    });
    return out;
  }
  function summary(form,errs,focus){
    let box=form.querySelector(':scope > .error-summary');
    if(!errs.length){if(box)box.remove();return;}
    if(!box){box=document.createElement('div');box.className='error-summary';box.setAttribute('role','alert');box.tabIndex=-1;form.prepend(box);}
    const n=errs.length;
    box.innerHTML=`<h2 class="es-title">Please fix ${n===1?'1 thing':n+' things'} before submitting</h2><ul>${errs.map(e=>`<li><a href="#${e.id}">${e.label}: ${e.msg.replace(/[<>&]/g,'')}</a></li>`).join('')}</ul>`;
    box.querySelectorAll('a').forEach(a=>a.addEventListener('click',ev=>{ev.preventDefault();const t=document.getElementById(a.getAttribute('href').slice(1));if(t){t.scrollIntoView({block:'center'});t.focus({preventScroll:true});}}));
    if(focus){box.scrollIntoView({block:'start'});box.focus({preventScroll:true});}
  }
  function run(form,focus){
    const errs=[];
    problems(form).forEach(p=>{if(p.ok)clearError(p.el);else errs.push(setError(p.el,p.msg,form));});
    summary(form,errs,focus);
    return errs.length===0;
  }
  SCU.validateForm=function(form){
    if(!form._scuLive){
      form._scuLive=true;
      const re=e=>{const el=e.target;if(!el.matches||!el.matches('input,select,textarea'))return;
        /* re-check this item only, then refresh the summary without moving focus */
        const errs=[];problems(form).forEach(p=>{const mine=p.el===el||(p.el.matches('fieldset')&&p.el.contains(el))||(el.type==='radio'&&p.el.name===el.name);
          const has=document.getElementById(((p.el.matches('fieldset')?p.el:(slotOf(p.el).box.matches('fieldset')?slotOf(p.el).box:p.el)).id||'')+'-err');
          if(p.ok){if(mine||has)clearError(p.el);}else if(mine||has)errs.push(setError(p.el,p.msg,form));});
        if(form.querySelector(':scope > .error-summary'))summary(form,errs,false);};
      form.addEventListener('focusout',re);form.addEventListener('change',re);
      form.addEventListener('input',e=>{const el=e.target;if(el.getAttribute&&el.getAttribute('aria-invalid')==='true'&&el.validity&&el.validity.valid)re(e);});
    }
    return run(form,true);
  };
  SCU.clearErrors=function(form){form.querySelectorAll('.invalid').forEach(b=>b.classList.remove('invalid'));form.querySelectorAll('[aria-invalid]').forEach(t=>clearError(t));form.querySelectorAll('.err[id$="-err"]').forEach(p=>p.remove());const s=form.querySelector(':scope > .error-summary');if(s)s.remove();};

  /* ---- Prototype forms: validate, then show a truthful preview confirmation ---- */
  document.querySelectorAll('form[data-proto]').forEach(form=>{
    form.setAttribute('novalidate','');
    form.addEventListener('submit',e=>{
      e.preventDefault();
      if(!SCU.validateForm(form)){e.stopImmediatePropagation();return;}
      const box=form.querySelector('.form-status')||form.appendChild(Object.assign(document.createElement('div'),{className:'form-status'}));
      box.className='form-status ok';box.setAttribute('role','status');
      box.textContent=form.dataset.proto||'Preview only: nothing was saved. In the live site this confirmation appears only after the record is stored securely.';
    });
  });
})();

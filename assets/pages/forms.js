/* FALLBACK inline validation for lane C forms — only active when site.js has no SCU.validateForm.
   Uses SCU.validateForm(form) from site.js when the shared version exists; otherwise
   falls back to this implementation: aria-invalid + aria-describedby message under
   each field, and an error summary at the top of the form with links to the fields.
   Runs in the capture phase so an invalid form never reaches the prototype handler. */
(function(){
  const DEFAULTS={
    valueMissing:'This field is required.',
    typeMismatch:'Check the format of this entry.',
    patternMismatch:'Check the format of this entry.',
    rangeOverflow:'Choose a date that is not in the future.',
    tooShort:'Please write a little more.'
  };
  function msgFor(el){
    const v=el.validity;
    if(v.customError) return el.validationMessage;
    if(el.dataset.err) return el.dataset.error;
    if(v.typeMismatch&&el.type==='email') return 'Enter an email address, like name@example.com.';
    for(const k in DEFAULTS) if(v[k]) return DEFAULTS[k];
    return 'Check this entry.';
  }
  function label(el){
    if(el.dataset.label) return el.dataset.label;
    if(el.type==='radio'){const fs=el.closest('fieldset');const lg=fs&&fs.querySelector('legend');return lg?lg.textContent.replace(/optional/i,'').trim():el.name;}
    const l=el.id&&el.form.querySelector('label[for="'+el.id+'"]')||el.closest('label');
    return l?l.textContent.replace(/\s*\*\s*/g,' ').replace(/\(?optional\)?/i,'').replace(/required/i,'').trim():el.name;
  }
  function anchorOf(el){ /* element after which the message goes */
    if(el.type==='radio') return el.closest('fieldset').lastElementChild;
    if(el.type==='checkbox') return el.closest('label')||el;
    const f=el.closest('.field'); return f?f.lastElementChild:el;
  }
  function clearField(el,form){
    const group=el.type==='radio'?[...form.querySelectorAll('input[name="'+el.name+'"]')]:[el];
    group.forEach(g=>{
      g.removeAttribute('aria-invalid');
      const ids=(g.getAttribute('aria-describedby')||'').split(/\s+/).filter(i=>i&&!i.startsWith('err-'));
      ids.length?g.setAttribute('aria-describedby',ids.join(' ')):g.removeAttribute('aria-describedby');
    });
    const host=el.type==='radio'?el.closest('fieldset'):(el.closest('.field')||el.closest('label'));
    host&&host.classList.remove('has-error');
    const e=form.querySelector('#err-'+(el.id||el.name));e&&e.remove();
  }
  function markField(el,form){
    const key=el.id||el.name, msg=msgFor(el);
    const group=el.type==='radio'?[...form.querySelectorAll('input[name="'+el.name+'"]')]:[el];
    let p=form.querySelector('#err-'+key);
    if(!p){p=document.createElement('p');p.className='field-error';p.id='err-'+key;anchorOf(el).insertAdjacentElement('afterend',p);}
    p.textContent=msg;
    group.forEach(g=>{
      g.setAttribute('aria-invalid','true');
      const ids=(g.getAttribute('aria-describedby')||'').split(/\s+/).filter(i=>i&&i!==p.id);
      g.setAttribute('aria-describedby',[p.id,...ids].join(' '));
    });
    const host=el.type==='radio'?el.closest('fieldset'):(el.closest('.field')||el.closest('label'));
    host&&host.classList.add('has-error');
    return {el:group[0],msg,label:label(el)};
  }
  function fields(form){
    const seen=new Set();
    return [...form.elements].filter(el=>{
      if(!el.willValidate||el.type==='submit'||el.type==='button'||el.type==='file') return false;
      if(el.closest('[hidden]')) return false;
      if(el.type==='radio'){if(seen.has(el.name))return false;seen.add(el.name);}
      return true;
    });
  }
  function groupValid(el,form){
    if(el.type!=='radio') return el.checkValidity();
    return [...form.querySelectorAll('input[name="'+el.name+'"]')].every(r=>r.checkValidity());
  }
  function localValidate(form){
    form.dispatchEvent(new Event('scu:prevalidate'));
    const errs=[];
    fields(form).forEach(el=>{clearField(el,form);if(!groupValid(el,form))errs.push(markField(el,form));});
    let sum=form.querySelector('.error-summary');
    if(!errs.length){sum&&sum.remove();return true;}
    if(!sum){sum=document.createElement('div');sum.className='error-summary';sum.tabIndex=-1;sum.setAttribute('role','alert');
      const anchor=form.querySelector('[data-summary-anchor]');
      anchor?anchor.insertAdjacentElement('afterend',sum):form.prepend(sum);}
    sum.innerHTML='';
    const h=document.createElement('h3');h.className='es-h';
    h.textContent=errs.length===1?'Please fix 1 item before you submit':'Please fix '+errs.length+' items before you submit';
    const ul=document.createElement('ul');
    errs.forEach(e=>{const li=document.createElement('li'),a=document.createElement('a');
      a.href='#'+e.el.id;a.textContent=e.label+': '+e.msg;
      a.addEventListener('click',ev=>{ev.preventDefault();e.el.focus();e.el.scrollIntoView({block:'center'});});
      li.appendChild(a);ul.appendChild(li);});
    sum.append(h,ul);
    sum.focus({preventScroll:true});sum.scrollIntoView({block:'start',behavior:'smooth'});
    return false;
  }
  function validate(form){
    if(window.SCU&&typeof SCU.validateForm==='function'){const r=SCU.validateForm(form);return !(r===false||(r&&r.valid===false));}
    return localValidate(form);
  }
  window.SCUPageForms={validate};

  document.addEventListener('submit',e=>{
    const form=e.target;if(!form.matches('form[data-proto]'))return;
    form.dispatchEvent(new Event('scu:prevalidate'));
    if(window.SCU&&typeof SCU.validateForm==='function')return; /* shared site.js handler validates */
    if(!validate(form)){e.preventDefault();e.stopImmediatePropagation();
      const st=form.querySelector('.form-status');st&&st.remove();}
  },true);
  /* After a failed attempt, re-check a field as soon as it is corrected */
  ['input','change'].forEach(t=>document.addEventListener(t,e=>{
    const el=e.target,form=el.form;if(!form||!form.matches('form[data-proto]')||!form.querySelector('.error-summary'))return;
    if(window.SCU&&typeof SCU.validateForm==='function')return;
    form.dispatchEvent(new Event('scu:prevalidate'));
    fields(form).forEach(f=>{if(f.getAttribute('aria-invalid')==='true'&&groupValid(f,form))clearField(f,form);});
  }));
})();

/* action.html — page behaviours (prototype, no backend) */
(function(){
  const $=id=>document.getElementById(id);
  const today=new Date(); const iso=new Date(today.getTime()-today.getTimezoneOffset()*60000).toISOString().slice(0,10);
  const d=$('s-date'); if(d){ d.max=iso; if(!d.value) d.value=iso; }

  /* Supporter form: phone needed only if Text or Call is chosen as preferred contact */
  const sup=$('supForm');
  if(sup){
    const phone=$('s-phone'), tag=$('s-phone-tag'), hint=$('s-phone-h');
    const check=()=>{
      const need=[...sup.querySelectorAll('input[name=contact]')].some(c=>c.checked&&c.value!=='email');
      phone.required=need;
      tag.textContent=need?'required for Text or Call':'optional';
      hint.textContent=need?'Add a phone number so we can text or call you.':'Needed only if you choose Text or Call below.';
      phone.setCustomValidity(need&&!phone.value.trim()?'Add a phone number, or untick Text and Call.':'');
    };
    sup.addEventListener('change',check); phone.addEventListener('input',check);
    sup.addEventListener('scu:prevalidate',check);
    check();
    /* After a (preview) submission, point people to the separate petition */
    sup.addEventListener('submit',()=>{
      setTimeout(()=>{
        const box=sup.querySelector('.form-status.ok'); if(!box||box.querySelector('.next')) return;
        const p=document.createElement('p');p.className='sup-next';
        p.innerHTML='You have <b>not</b> signed the petition. That is a separate step. ';
        const a=document.createElement('a');a.className='link-arrow next';a.href='petition.html';a.textContent='Read and sign the petition';
        p.appendChild(a);box.appendChild(p);
        box.scrollIntoView({block:'center',behavior:'smooth'});
      },0);
    });
  }

  /* Story upload: list chosen files */
  const f=$('st-file'), list=$('fileList');
  if(f){
    const drop=f.closest('.drop');
    const show=()=>{list.innerHTML=[...f.files].map(x=>`<li>${x.name.replace(/[<>&]/g,'')} <span>${Math.max(1,Math.round(x.size/1024))} KB</span></li>`).join('');};
    f.addEventListener('change',show);
    ['dragenter','dragover'].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.add('over');}));
    ['dragleave','drop'].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.remove('over');}));
    drop.addEventListener('drop',e=>{if(e.dataTransfer.files.length){f.files=e.dataTransfer.files;show();}});
  }

  /* Share information */
  const sel=$('sh-page'); if(!sel) return;
  const base=location.href.replace(/[#?].*$/,'').replace(/[^/]*$/,'');
  const status=$('shStatus');
  let url,title;
  function update(){
    const o=sel.selectedOptions[0];
    url=base+sel.value; title=o.dataset.t;
    $('spTitle').textContent=title; $('spUrl').textContent=url.replace(/^https?:\/\//,'');
    $('shFb').href='https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(url);
    $('shMail').href='mailto:?subject='+encodeURIComponent(title)+'&body='+encodeURIComponent('I thought you would want to see this information about Keystone–Odessa:\n\n'+title+'\n'+url);
    status.textContent='';
  }
  async function copy(){
    try{ await navigator.clipboard.writeText(url); }
    catch(e){ const t=document.createElement('textarea');t.value=url;t.setAttribute('readonly','');t.style.position='fixed';t.style.opacity='0';document.body.appendChild(t);t.select();document.execCommand('copy');t.remove(); }
    status.textContent='Link copied: '+url;
    const b=$('shCopy').querySelector('span'); b.textContent='Copied'; setTimeout(()=>b.textContent='Copy link',2200);
  }
  sel.addEventListener('change',update);
  $('shCopy').addEventListener('click',copy);
  $('shMain').addEventListener('click',async()=>{
    if(navigator.share){ try{ await navigator.share({title,url}); status.textContent='Shared.'; return; }catch(e){ if(e.name==='AbortError') return; } }
    copy();
  });
  update();
})();

/* Roads & Safety — interactive safety-data view.
   Figures: County 2024 level-of-service traffic layer (OBJECTID 582, 136) as quoted in the blueprint.
   Crash figures are intentionally NOT shown: they await verified local data. */
(function(){
  const body=document.getElementById('dp-body'); if(!body) return;
  const DATA=[
    {id:'gunn',name:'Gunn Highway',seg:'Pasco County line → Van Dyke Road',aadt:19912,lanes:2,losDaily:'E',losPeak:'E',std:'D',ref:'OBJECTID 582'},
    {id:'vandyke',name:'Van Dyke Road',seg:'Gunn Highway → Suncoast north ramp',aadt:17500,lanes:2,losDaily:'E',losPeak:'E',std:'D',ref:'OBJECTID 136'}
  ];
  const state={corridor:'all',measure:'volume',view:'chart'};
  const fmt=n=>n.toLocaleString('en-US');
  const max=20000;
  const losScale=(act,std)=>'<div class="los" role="img" aria-label="Level of service '+act+' against an adopted standard of '+std+'">'+['A','B','C','D','E','F'].map(l=>`<span class="${l===act?'act':''}${l===std?' std':''}">${l}</span>`).join('')+'</div>';
  const status=document.getElementById('dp-status');
  const mGroup=document.querySelector('.dp .measure');
  const mNote=document.getElementById('measure-note');
  const LBL={volume:'traffic volume',los:'level of service',crash:'crashes (data pending)'};
  function syncMeasure(){
    if(!mGroup) return;
    const tbl=state.view==='table';
    mGroup.classList.toggle('is-off',tbl);
    mGroup.querySelectorAll('button').forEach(b=>{b.disabled=tbl;b.setAttribute('aria-disabled',String(tbl));});
    if(mNote) mNote.hidden=!tbl;
  }
  function render(){
    const rows=DATA.filter(d=>state.corridor==='all'||d.id===state.corridor);
    syncMeasure();
    if(status){const c=state.corridor==='all'?'All corridors':rows[0].name;status.textContent='Showing: '+c+' · '+(state.view==='table'?'all measures':LBL[state.measure])+' · '+state.view;}
    let html='';
    if(state.view==='table'){
      html='<div class="dp-wrap"><table class="dtable"><caption class="sr-only">County 2024 traffic sections</caption><thead><tr><th>Corridor</th><th>Section</th><th class="n">Lanes</th><th class="n">AADT</th><th class="n">LOS daily</th><th class="n">LOS peak</th><th class="n">Standard</th><th class="n">Crashes</th><th>Ref.</th></tr></thead><tbody>'+
        rows.map(d=>`<tr><td><b>${d.name}</b></td><td>${d.seg}</td><td class="n">${d.lanes}</td><td class="n">${fmt(d.aadt)}</td><td class="n">${d.losDaily}</td><td class="n">${d.losPeak}</td><td class="n">${d.std}</td><td class="n" style="color:var(--muted);font-weight:400">not yet verified</td><td>${d.ref}</td></tr>`).join('')+'</tbody></table></div><p class="dp-note">AADT: annual-average daily traffic. LOS: level of service, A (free flow) to F (breakdown). Crash data isn’t shown yet; it will be added once verified.</p>';
      body.innerHTML=html; return;
    }
    rows.forEach(d=>{
      const nm=`<div class="nm">${d.name}<small>${d.seg} · ${d.lanes} lanes</small></div>`;
      if(state.measure==='volume'){
        html+=`<div class="drow">${nm}<div class="viz"><div class="dbar"><i style="width:${(d.aadt/max*100).toFixed(1)}%"></i></div><div class="axis" aria-hidden="true"><span>0</span><span>5k</span><span>10k</span><span>15k</span><span>20k</span></div></div><div class="val">${fmt(d.aadt)}<small>daily vehicles (AADT)</small></div></div>`;
      }else if(state.measure==='los'){
        html+=`<div class="drow">${nm}<div class="viz">${losScale(d.losDaily,d.std)}</div><div class="val">${d.losDaily}<small>daily &amp; peak · std ${d.std}</small></div></div>`;
      }else{
        html+=`<div class="drow">${nm}<div class="viz"><div class="pending"><i aria-hidden="true"></i></div></div><div class="val" style="font-size:1rem;color:var(--muted)">Not yet shown<small>awaiting verified counts</small></div></div>`;
      }
    });
    if(state.measure==='crash'){
      html+='<p class="dp-note">Crash data isn’t shown yet. Counts, severity, location and time will appear here once they are verified against County or state records.</p>';
    }else if(state.measure==='los'){
      html+='<p class="dp-note">Level of service grades traffic flow from A (free flow) to F (breakdown). Both corridors are rated E for daily and peak-direction service against an adopted standard of D.</p>';
    }else{
      html+='<p class="dp-note">Annual-average daily traffic (AADT) on two-lane sections. Both sections carry this volume on one lane in each direction.</p>';
    }
    body.innerHTML=html;
  }
  document.querySelectorAll('.dp .seg').forEach(seg=>{
    seg.addEventListener('click',e=>{
      const b=e.target.closest('button'); if(!b) return;
      seg.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
      state[seg.dataset.filter]=b.dataset.v; render();
    });
  });
  render();
})();
/* Details that are open on wide screens and collapsed on phones (shorter mobile page) */
(function(){const ds=document.querySelectorAll('details[data-open-wide]');if(!ds.length)return;
  const mq=window.matchMedia('(min-width:861px)');const set=()=>ds.forEach(d=>{d.open=mq.matches;});set();
  if(mq.addEventListener)mq.addEventListener('change',set);else mq.addListener(set);
  const openTarget=()=>{const t=location.hash&&document.getElementById(location.hash.slice(1));if(t&&t.tagName==='DETAILS')t.open=true;};
  window.addEventListener('hashchange',openTarget);openTarget();
  document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',()=>{const t=document.getElementById(a.getAttribute('href').slice(1));if(t&&t.tagName==='DETAILS')t.open=true;}));
})();

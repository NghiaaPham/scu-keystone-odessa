/* Evidence Library — client-side filter (prototype). Records are illustrative, pending verification. */
(function(){
  const R = [
    {t:'Livable Communities Element (includes the Keystone–Odessa Community Plan)', type:'Planning Document', agency:'Hillsborough County', date:'2026-06-26', shown:'June 26, 2026 compilation', topics:['Community Plan','Growth','Housing','Services','Roads'],
     use:'Show the adopted Keystone–Odessa Community Plan and how it relates to the countywide Comprehensive Plan.', ref:'Effective dates p. 3 · County framework pp. 4–5 · Keystone–Odessa pp. 17–27 · Transportation and lighting p. 24',
     url:'https://planhillsborough.org/wp-content/uploads/2025/12/LIVABLE-COMMUNITIES.pdf', fmt:'PDF', host:'Plan Hillsborough'},
    {t:'Figure 3 — Keystone-Odessa Community Plan Boundary Map', type:'Map', agency:'Hillsborough County', date:'2026-06-26', shown:'In the June 26, 2026 compilation', topics:['Community Plan','Growth'],
     use:'Show the official Community Plan boundary (“the NIMBY map”) with its original figure caption.', ref:'Community Plan, Figure 3, p. 17',
     url:'https://planhillsborough.org/wp-content/uploads/2025/12/LIVABLE-COMMUNITIES.pdf', fmt:'PDF', host:'Plan Hillsborough', map:'assets/img/map-image34.jpg'},
    {t:'Comprehensive Plan — One Water and Mobility policies', type:'Policy', agency:'Hillsborough County', date:'2026-06-26', shown:'June 26, 2026 compilation', topics:['Water','Septic','Roads','Infrastructure','Community Plan'],
     use:'Compare countywide water, wastewater and road policies with the exclusions that apply inside the Community Plan boundary.', ref:'One Water 4.3.2–4.3.7 pp. 229–234 · Mobility 5.1.2–5.1.4 p. 135 · Constrained roads pp. 250–251',
     url:'https://planhillsborough.org/wp-content/uploads/2025/04/HC-Comp-Plan-1.pdf', fmt:'PDF', host:'Plan Hillsborough'},
    {t:'Land Development Code Part 3.08.00 — Keystone-Odessa Rural Development Standards', type:'Policy', agency:'Hillsborough County', date:'', shown:'Current code (date to verify)', topics:['Community Plan','Growth','Housing'],
     use:'Identify the implementing code provisions the approved petition asks the County to repeal through the required public amendment processes.', ref:'LDC Part 3.08.00',
     url:'https://library.municode.com/fl/hillsborough_county/codes/land_development_code', label:'Open the Land Development Code', host:'Municode'},
    {t:'Response to public records request', type:'Public Record', agency:'Planning Commission', date:'2026-09-23', shown:'September 23, 2026', topics:['Community Plan'],
     use:'Record the dated staff response that the Board had not requested work on a Keystone–Odessa update.', ref:'Agency response letter'},
    {t:'Board of County Commissioners minutes — May 9, 2024', type:'Public Record', agency:'Board of County Commissioners', date:'2024-05-09', shown:'May 9, 2024', topics:['Community Plan','Water','Septic'],
     use:'Show the Board’s recorded ability to include Keystone–Odessa in the future.', ref:'Book 576, pp. 39–40',
     rel:{url:'https://www.hillsclerk.com/documents/d/guest/bocc-vote-comparison-2024?download=true', label:'Clerk’s 2024 vote record (PDF; see May 9, 2024)'}},
    
    {t:'HC/CPA 23-18 adoption packet', type:'Planning Document', agency:'Hillsborough County', date:'2024-05-09', shown:'2024 adoption (date to verify)', topics:['Water','Septic','Environment','Infrastructure'],
     use:'Cite agency comments supporting the rural utility reforms. These comments do not address retiring the Community Plan.', ref:'Staff rationale pp. 5–7 · EPC pp. 21–23 · Water Resources and Emergency Management pp. 28–29 · CAC p. 53',
     url:'https://planhillsborough.org/rural-area-water-and-wastewater-policies-text-amendment', label:'View the amendment page', host:'Plan Hillsborough'},
    {t:'2024 level-of-service traffic sections', type:'Data', agency:'Hillsborough County', date:'2024-12-31', shown:'2024 data', topics:['Roads'],
     use:'Report 19,912 annual-average daily vehicle movements on Gunn Highway (Pasco County line to Van Dyke Road), rated LOS E against a D standard.', ref:'OBJECTID 582 (Gunn Hwy) · OBJECTID 136 (Van Dyke Rd, AADT 17,500)',
     url:'https://planhillsborough.org/traffic-counts', label:'View the County traffic data', host:'Plan Hillsborough'},
    {t:'Keystone–Odessa roads and 2024 traffic by section', type:'Map', agency:'Safer Communities United', date:'2026-09-01', shown:'2026, compiled from County data', topics:['Roads','Community Plan'],
     use:'Show the road network residents, commuters, school traffic and emergency services actually use, beyond the plan boundary.', ref:'SCU map compiled from County road and traffic data', map:'assets/img/map-image25.jpg'},
    {t:'Van Dyke Road study newsletter (June 2025 LRC agenda packet)', type:'Study', agency:'Hillsborough County', date:'2025-06-01', shown:'June 2025', topics:['Roads'],
     use:'Show that the study excluded Gunn Highway west of Suncoast Parkway from capacity-improvement analysis because of Comprehensive Plan constraints.', ref:'LRC packet, PDF p. 13',
     url:'https://planhillsborough.org/wp-content/uploads/2025/06/LRC-June-Draft-Agenda-Packet.pdf#page=13', fmt:'PDF, p. 13', host:'Plan Hillsborough'},
    {t:'Septic classification data (ZIP 33556)', type:'Data', agency:'Hillsborough County', date:'', shown:'Date to verify', topics:['Septic','Water','Environment'],
     use:'Show 7,191 administrative records for ZIP 33556. This is not a count of systems inside the Community Plan boundary.', ref:'Classification groups: method behind the 3,087 figure unverified'},
    {t:'Septic construction and repair records, 1998–2023', type:'Data', agency:'Hillsborough County Environmental Health', date:'2023-12-31', shown:'1998 – 2023', topics:['Septic','Water','Infrastructure'],
     use:'Show 806 construction and repair records with application dates. These are not failure counts.', ref:'Permit records, ZIP 33556'}
  ];
  const TOPICS=['Roads','Water','Septic','Growth','Housing','Infrastructure','Services','Environment','Community Plan'];
  const TYPES=['Data','Map','Public Record','Planning Document','Policy','Study'];
  const yr=r=>r.date?r.date.slice(0,4):'Undated';
  const AGENCIES=[...new Set(R.map(r=>r.agency))].sort();
  const YEARS=[...new Set(R.map(yr))].sort((a,b)=>a==='Undated'?1:b==='Undated'?-1:b-a);
  const $=id=>document.getElementById(id);
  const fill=(sel,arr)=>arr.forEach(v=>sel.insertAdjacentHTML('beforeend',`<option>${v}</option>`));
  fill($('f-topic'),TOPICS);fill($('f-type'),TYPES);fill($('f-agency'),AGENCIES);fill($('f-year'),YEARS);
  const esc=s=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const abbr={'Data':'DATA','Map':'MAP','Public Record':'RECORD','Planning Document':'PLAN','Policy':'POLICY','Study':'STUDY'};

  function card(r){
    const thumb = r.map
      ? `<button type="button" class="lib-thumb map" data-map-src="${r.map}" data-map-title="${esc(r.t)}" aria-label="Open map full screen: ${esc(r.t)}"><img src="${r.map}" alt="" loading="lazy"></button>`
      : `<div class="lib-thumb doc" aria-hidden="true"><span>${abbr[r.type]}</span><i></i><i></i><i></i><i class="s"></i></div>`;
    const ext=(u,label,note)=>`<a class="link-arrow lib-open" href="${u}" target="_blank" rel="noopener">${label}<span class="sr-only"> (opens in a new tab)</span></a>${note?`<span class="lib-fmt">${note}</span>`:''}`;
    let action='';
    if(r.url) action+=ext(r.url, r.label||'View the original document', [r.fmt,r.host].filter(Boolean).join(' · '));
    if(r.map) action+=`<button type="button" class="link-arrow lib-open" data-map-src="${r.map}" data-map-title="${esc(r.t)}">${r.url?'Open the map image':'View the map'}</button>`;
    if(!r.url&&!r.map) action+=`<span class="lib-pending">Original document — link to be added</span>`;
    if(r.rel) action+=`<a class="lib-rel-link" href="${r.rel.url}" target="_blank" rel="noopener">${esc(r.rel.label)}</a>`;
    return `<li class="lib-item">
      ${thumb}
      <div class="lib-main">
        <h3 class="lib-title">${esc(r.t)}</h3>
        <dl class="lib-meta">
          <div><dt>Type</dt><dd>${r.type}</dd></div>
          <div><dt>Date</dt><dd>${esc(r.shown)}</dd></div>
          <div><dt>Agency</dt><dd>${esc(r.agency)}</dd></div>
        </dl>
        <p class="lib-use"><b>The website uses this document to:</b> ${esc(r.use)}</p>
        <p class="source">${esc(r.ref)}</p>
      </div>
      <div class="lib-side">
        <p class="lib-rel">Related to</p>
        <ul class="lib-tags">${r.topics.map(t=>`<li>${t}</li>`).join('')}</ul>
        ${action}
      </div>
    </li>`;
  }
  const F=[['q','f-q','Search'],['topic','f-topic','Topic'],['type','f-type','Type'],['agency','f-agency','Agency'],['year','f-year','Year']];
  let liveT;
  function syncURL(){
    const p=new URLSearchParams();
    F.forEach(([k,id])=>{const v=$(id).value.trim();if(v)p.set(k,v);});
    if($('f-sort').value!=='new')p.set('sort',$('f-sort').value);
    const qs=p.toString();
    history.replaceState(null,'',(qs?'?'+qs:location.pathname)+(location.hash||''));
  }
  function render(opts){
    const q=$('f-q').value.trim().toLowerCase(), tp=$('f-topic').value, ty=$('f-type').value, ag=$('f-agency').value, y=$('f-year').value, s=$('f-sort').value;
    let out=R.filter(r=>(!tp||r.topics.includes(tp))&&(!ty||r.type===ty)&&(!ag||r.agency===ag)&&(!y||yr(r)===y)&&(!q||(r.t+' '+r.use+' '+r.ref+' '+r.agency).toLowerCase().includes(q)));
    out.sort((a,b)=>s==='az'?a.t.localeCompare(b.t):s==='old'?(a.date||'9999').localeCompare(b.date||'9999'):(b.date||'0000').localeCompare(a.date||'0000'));
    $('libList').innerHTML=out.map(card).join('');
    $('libEmpty').hidden=out.length>0;
    const active=q||tp||ty||ag||y;
    $('libReset').hidden=!active;
    const txt=`${out.length} ${out.length===1?'record':'records'}${active?` of ${R.length}`:''}`;
    $('libCount').innerHTML=`<b>${out.length}</b> ${out.length===1?'record':'records'}${active?` of ${R.length}`:''}<span class="small"> · sample set</span>`;
    clearTimeout(liveT); liveT=setTimeout(()=>{$('libLive').textContent=txt+' shown';},400);
    // filter count (selects only) + chips
    const n=[tp,ty,ag,y].filter(Boolean).length;
    $('libFn').textContent=n?` (${n})`:'';
    const chips=F.filter(([k,id])=>$(id).value.trim()).map(([k,id,lab])=>`<li><button type="button" data-clear="${id}" aria-label="Remove filter ${lab}: ${esc($(id).value.trim())}">${lab}: ${esc($(id).value.trim())} <span aria-hidden="true">×</span></button></li>`);
    $('libChips').innerHTML=chips.join('');
    $('libChips').hidden=!chips.length;
    if(!(opts&&opts.noURL)) syncURL();
  }
  function reset(){F.forEach(([k,id])=>$(id).value='');render();}
  ['f-topic','f-type','f-agency','f-year','f-sort'].forEach(id=>$(id).addEventListener('change',()=>render()));
  let qT; $('f-q').addEventListener('input',()=>{clearTimeout(qT);qT=setTimeout(render,200);});
  $('libReset').addEventListener('click',reset);$('libReset2').addEventListener('click',reset);
  $('libChips').addEventListener('click',e=>{const b=e.target.closest('[data-clear]');if(!b)return;$(b.dataset.clear).value='';render();$('f-q').focus();});
  // mobile filter toggle
  const tg=$('libToggle'), more=$('libMore');
  tg.addEventListener('click',()=>{const o=tg.getAttribute('aria-expanded')!=='true';tg.setAttribute('aria-expanded',o);more.classList.toggle('open',o);if(o)$('f-topic').focus();});

  // URL params: ?q=&topic=&type=&agency=&year=&sort=
  const p=new URLSearchParams(location.search);
  const setIf=(id,v,list)=>{if(v&&(!list||list.includes(v)))$(id).value=v;};
  setIf('f-topic',p.get('topic'),TOPICS);setIf('f-type',p.get('type'),TYPES);setIf('f-agency',p.get('agency'),AGENCIES);setIf('f-year',p.get('year'),YEARS);
  setIf('f-sort',p.get('sort'),['new','old','az']);
  if(p.get('q'))$('f-q').value=p.get('q');
  render({noURL:true});

  // Issue cards filter in place without reload
  document.querySelectorAll('[data-filter-topic]').forEach(a=>a.addEventListener('click',e=>{
    e.preventDefault();F.forEach(([k,id])=>$(id).value='');$('f-topic').value=a.dataset.filterTopic;
    history.replaceState(null,'','#library');render();
    $('library').scrollIntoView({behavior:'smooth'});
    setTimeout(()=>$('libCount').focus&&$('f-q').focus({preventScroll:true}),500);
  }));
})();

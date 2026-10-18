/* Growth page: interactive drive-time schematic.
   Every value here is illustrative. Plan-area ranges are the approved illustrative image labels;
   the four areas and their per-area times are samples for layout review only. */
(function(){
  var root=document.getElementById('drive-time'); if(!root) return;
  var NS='http://www.w3.org/2000/svg', MAX=40;
  var SERVICES=[
    {k:'grocery', n:'Grocery stores',     l:'G', range:[10,25]},
    {k:'health',  n:'Healthcare',         l:'H', range:[10,30]},
    {k:'child',   n:'Childcare',          l:'C', range:[10,25]},
    {k:'food',    n:'Restaurants',        l:'R', range:[10,25]},
    {k:'jobs',    n:'Employment / Jobs',  l:'E', range:[15,30], emp:true}
  ];
  var PINS=[
    {s:'grocery',x:334,y:40},{s:'grocery',x:470,y:476},
    {s:'health',x:604,y:300},{s:'health',x:548,y:492},
    {s:'child',x:252,y:60},{s:'child',x:430,y:470},
    {s:'food',x:378,y:52},{s:'food',x:520,y:452},
    {s:'jobs',x:420,y:30},{s:'jobs',x:606,y:452}
  ];
  var AREAS=[
    {id:'A',name:'North Keystone',x:300,y:160,t:{grocery:[10,15],health:[15,25],child:[10,20],food:[10,15],jobs:[20,30]}},
    {id:'B',name:'West Keystone',x:176,y:268,t:{grocery:[15,25],health:[20,30],child:[15,25],food:[15,25],jobs:[20,30]}},
    {id:'C',name:'Central Odessa',x:352,y:288,t:{grocery:[10,20],health:[15,25],child:[10,20],food:[10,20],jobs:[15,25]}},
    {id:'D',name:'South, near Van Dyke Rd',x:420,y:370,t:{grocery:[10,15],health:[10,20],child:[10,15],food:[10,15],jobs:[15,20]}}
  ];
  var svg=root.querySelector('svg'), gA=svg.querySelector('.areas'), gP=svg.querySelector('.pins'), gL=svg.querySelector('.lines');
  var btnWrap=root.querySelector('.dtm-areas'), list=root.querySelector('.dtm-list'), title=root.querySelector('#dtm-title');
  function el(tag,attrs){var e=document.createElementNS(NS,tag);for(var a in attrs)e.setAttribute(a,attrs[a]);return e;}
  function svcOf(k){for(var i=0;i<SERVICES.length;i++)if(SERVICES[i].k===k)return SERVICES[i];}

  PINS.forEach(function(p){
    var s=svcOf(p.s), g=el('g',{'class':'pin'+(s.emp?' emp':''),transform:'translate('+p.x+','+p.y+')'});
    g.appendChild(el('rect',{x:-8,y:-8,width:16,height:16}));
    var t=el('text',{'text-anchor':'middle',y:3.5});t.textContent=s.l;g.appendChild(t);
    p.node=g; gP.appendChild(g);
  });
  AREAS.forEach(function(a){
    var g=el('g',{'class':'area','aria-hidden':'true',transform:'translate('+a.x+','+a.y+')'});
    g.appendChild(el('circle',{r:17}));
    var tag=el('text',{'class':'tag','text-anchor':'middle',y:4});tag.textContent=a.id;g.appendChild(tag);
    var lab=el('text',{'class':'alab','text-anchor':'middle',y:34});lab.textContent=a.name.replace(', near Van Dyke Rd','');g.appendChild(lab);
    g.addEventListener('click',function(){select(a.id);});
    a.node=g; gA.appendChild(g);
    var b=document.createElement('button');b.type='button';b.setAttribute('aria-pressed','false');
    b.innerHTML='<b>'+a.id+'</b><span>'+a.name+'</span>';
    b.addEventListener('click',function(){select(a.id);});
    a.btn=b; btnWrap.appendChild(b);
  });

  // Text alternative: every area and service as a table
  var tw=root.querySelector('.dtm-table-wrap');
  if(tw){
    tw.innerHTML='<div class="table-scroll"><table class="table"><caption class="source">Illustrative — sample areas and times, in minutes. Last row: illustrative range across the Plan area.</caption><thead><tr><th scope="col">Area</th>'+
      SERVICES.map(function(s){return '<th scope="col">'+s.n+'</th>';}).join('')+'</tr></thead><tbody>'+
      AREAS.map(function(a){return '<tr><th scope="row">'+a.id+' · '+a.name+'</th>'+SERVICES.map(function(s){var t=a.t[s.k];return '<td>'+t[0]+'–'+t[1]+'</td>';}).join('')+'</tr>';}).join('')+
      '<tr class="rng-row"><th scope="row">Plan-area range</th>'+SERVICES.map(function(s){return '<td>'+s.range[0]+'–'+s.range[1]+'</td>';}).join('')+'</tr></tbody></table></div>';
  }

  function pct(v){return (v/MAX*100).toFixed(2)+'%';}
  function select(id){
    var a=AREAS.filter(function(x){return x.id===id;})[0]; if(!a) return;
    AREAS.forEach(function(x){var on=x===a;x.node.classList.toggle('on',on);x.btn.setAttribute('aria-pressed',on);});
    while(gL.firstChild) gL.removeChild(gL.firstChild);
    PINS.forEach(function(p){p.node.classList.remove('hit');});
    SERVICES.forEach(function(s){
      var best=null,bd=1e9;
      PINS.forEach(function(p){if(p.s!==s.k)return;var d=Math.hypot(p.x-a.x,p.y-a.y);if(d<bd){bd=d;best=p;}});
      if(best){best.node.classList.add('hit');gL.appendChild(el('line',{x1:a.x,y1:a.y,x2:best.x,y2:best.y}));}
    });
    title.textContent='Area '+a.id+' · '+a.name;
    list.innerHTML=SERVICES.map(function(s){
      var t=a.t[s.k], r=s.range;
      return '<li><span class="n">'+s.n+'</span><span class="m">'+t[0]+'–'+t[1]+' min</span>'+
        '<span class="bar" aria-hidden="true"><span class="rng" style="left:'+pct(r[0])+';width:'+pct(r[1]-r[0])+'"></span><span class="est" style="left:'+pct(t[0])+';width:'+pct(t[1]-t[0])+'"></span></span>'+
        '<span class="sub">Plan-area range '+r[0]+'–'+r[1]+' min (illustrative)</span></li>';
    }).join('');
  }
  select('A');
})();

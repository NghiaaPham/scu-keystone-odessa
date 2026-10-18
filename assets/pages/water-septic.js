/* Water & Septic — sample Leaflet maps.
   IMPORTANT: every layer here is a deterministic PLACEHOLDER for layout review.
   Replace with the client's GIS files (GeoJSON) before publication. */
(function(){
  if(typeof L==='undefined'){
    document.querySelectorAll('.lmap').forEach(el=>{el.innerHTML='<p style="padding:24px;color:#56656f;font-size:.9rem">This map couldn’t load. Try refreshing the page; the written summary above covers the same information.</p>';});
    return;
  }
  const C={navy:'#17324D',teal:'#28736D',coral:'#C55245'};
  const CENTER=[28.13,-82.62];
  // Approximate Plan outline for layout only (not the adopted boundary).
  const BOUNDARY=[[28.172,-82.705],[28.172,-82.556],[28.150,-82.553],[28.128,-82.560],[28.112,-82.574],[28.097,-82.585],[28.088,-82.612],[28.086,-82.648],[28.096,-82.676],[28.113,-82.695],[28.135,-82.706]];
  // seeded RNG so sample points stay put between loads
  function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
  function inside(p,poly){let x=p[1],y=p[0],ins=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const xi=poly[i][1],yi=poly[i][0],xj=poly[j][1],yj=poly[j][0];if(((yi>y)!=(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))ins=!ins;}return ins;}
  function points(n,seed,clusters){const r=rng(seed),out=[];let guard=0;
    while(out.length<n&&guard++<n*50){let p;
      if(clusters&&r()<.6){const c=clusters[Math.floor(r()*clusters.length)];p=[c[0]+(r()-.5)*.03,c[1]+(r()-.5)*.035];}
      else p=[28.085+r()*.09,-82.71+r()*.16];
      if(inside(p,BOUNDARY))out.push(p);}
    return out;}
  const hubs=[[28.155,-82.64],[28.12,-82.66],[28.11,-82.6],[28.145,-82.585],[28.13,-82.625]];
  function base(el,opts){
    const m=L.map(el,Object.assign({center:CENTER,zoom:12,zoomSnap:.25,scrollWheelZoom:false,zoomControl:false,attributionControl:true},opts||{}));
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',{maxZoom:17,subdomains:'abcd',attribution:'© OpenStreetMap contributors © CARTO'}).addTo(m);
    L.control.zoom({position:'bottomright'}).addTo(m);
    L.control.scale({imperial:true,metric:false,position:'bottomleft'}).addTo(m);
    return m;}
  const boundary=()=>L.polygon(BOUNDARY,{color:C.navy,weight:2,dashArray:'6 6',fill:false,interactive:false});
  function septicLayer(){
    const g=L.layerGroup(),pts=points(420,7,hubs);
    pts.forEach((p,i)=>{const k=i%12; // ≈ 1626 : 1210 : 251
      const col=k<6?C.coral:(k<11?C.navy:C.teal);
      L.circleMarker(p,{radius:3,stroke:false,fillColor:col,fillOpacity:.75}).addTo(g);});
    return g;}
  function repairLayer(){
    const g=L.layerGroup();
    points(150,21,hubs).forEach(p=>L.circleMarker(p,{radius:4,color:C.coral,weight:1.5,fillColor:'#fff',fillOpacity:1}).bindTooltip('Repair record (sample)').addTo(g));
    return g;}
  function wellsLayer(){
    const g=L.layerGroup();
    points(170,33,hubs).forEach(p=>L.circleMarker(p,{radius:2.5,stroke:false,fillColor:C.navy,fillOpacity:.9}).addTo(g));
    return g;}
  function gwLayer(){
    return L.polygon([[28.165,-82.69],[28.165,-82.62],[28.14,-82.6],[28.115,-82.615],[28.105,-82.66],[28.125,-82.69]],{color:C.teal,weight:1,fillColor:C.teal,fillOpacity:.12,dashArray:'2 4'}).bindTooltip('Groundwater protection area (sample)',{sticky:true});}
  function wellheadLayer(){
    const g=L.layerGroup();
    [[28.105,-82.598,'Wellfield (sample)'],[28.158,-82.662,'Wellhead zone (sample)']].forEach(([a,b,t])=>{
      L.circle([a,b],{radius:1500,color:C.teal,weight:2,dashArray:'6 5',fillColor:C.teal,fillOpacity:.06}).bindTooltip(t,{sticky:true}).addTo(g);
      L.circle([a,b],{radius:600,color:C.teal,weight:1,fillColor:C.teal,fillOpacity:.12,interactive:false}).addTo(g);});
    return g;}
  function lakesLayer(){
    const g=L.layerGroup();
    [[28.132,-82.623,700],[28.146,-82.648,450],[28.118,-82.642,380],[28.155,-82.6,420],[28.1,-82.63,350],[28.138,-82.585,300]].forEach(([a,b,r])=>
      L.circle([a,b],{radius:r,color:C.teal,weight:1,fillColor:C.teal,fillOpacity:.28}).bindTooltip('Lake / wetland (sample)',{sticky:true}).addTo(g));
    return g;}

  // Section 3 map: septic by class
  const ms=document.getElementById('map-scale');
  if(ms){const m=base(ms);septicLayer().addTo(m);boundary().addTo(m);m.fitBounds(L.polygon(BOUNDARY).getBounds(),{padding:[16,16]});}
  // Section 4 map: repairs
  const mr=document.getElementById('map-repairs');
  if(mr){const m=base(mr);repairLayer().addTo(m);boundary().addTo(m);m.fitBounds(L.polygon(BOUNDARY).getBounds(),{padding:[16,16]});}

  // Section 5: layered tool
  const ml=document.getElementById('map-layers');
  if(ml){
    const m=base(ml);
    const layers={septic:septicLayer(),repairs:repairLayer(),wells:wellsLayer(),gw:gwLayer(),wellhead:wellheadLayer(),lakes:lakesLayer(),boundary:boundary()};
    const order=['gw','lakes','wellhead','boundary','wells','septic','repairs'];
    const bounds=L.polygon(BOUNDARY).getBounds();
    const fit=()=>m.fitBounds(bounds,{padding:[24,24]});
    function sync(){
      order.forEach(k=>{const cb=document.querySelector('[data-layer="'+k+'"]');if(!cb)return;
        if(cb.checked){if(!m.hasLayer(layers[k]))layers[k].addTo(m);}else if(m.hasLayer(layers[k]))m.removeLayer(layers[k]);});
      // keep z-order stable
      order.forEach(k=>{if(m.hasLayer(layers[k])&&layers[k].bringToFront)layers[k].bringToFront();});
    }
    document.querySelectorAll('[data-layer]').forEach(cb=>cb.addEventListener('change',sync));
    document.querySelectorAll('[data-all]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-layer]').forEach(cb=>cb.checked=b.dataset.all==='1');sync();}));
    const rs=document.querySelector('[data-reset]');rs&&rs.addEventListener('click',fit);
    sync();fit();
    // enable scroll zoom only after the user interacts with the map
    ml.addEventListener('click',()=>m.scrollWheelZoom.enable());
    ml.addEventListener('mouseleave',()=>m.scrollWheelZoom.disable());
  }
})();

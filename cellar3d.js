/* Woodhouse: the cellar, mirrored from the brewing app. Read only.
   Data: the brewing app's public_cellar view (data.js CELLAR_SOURCE); preview rows otherwise. */
(function(){
const stage=document.getElementById('c3stage');if(!stage)return;
const D=window.WH_DATA,{reduce,MON,esc}=window.WH;

/* ---------- statuses (same set as the brewing app) ---------- */
const STATUS={
  brewing:{label:'Brewing',color:'#e2674c'},fermenting:{label:'Fermenting',color:'#e0a546'},
  conditioning:{label:'Conditioning',color:'#85d0cb'},cold_crash:{label:'Cold crash',color:'#9fc3ff'},
  carbonating:{label:'Carbonating',color:'#c9b8ff'},ready:{label:'Ready to package',color:'#7fd88a'},
  serving:{label:'Serving',color:'#89d8d0'},aging:{label:'Aging',color:'#b07a45'},empty:{label:'Empty · clean',color:'#8c9d99'}
};
const KIND={hlt:'Hot liquor tank',mlt:'Mash / lauter tun',bk:'Kettle / whirlpool',fv:'Fermenter',bt:'Brite tank',barrel:'Barrel'};
const isFull=r=>!!(r&&r.status&&r.status!=='empty'&&(r.beer_name||r.status==='brewing'));
function beerColor(style=''){const s=style.toLowerCase();
  if(/stout|porter|dark|schwarz/.test(s))return 0x3a1b0b;
  if(/kombucha|kir|cherry|framboise|raspberry|fruit|sour|mixed/.test(s))return 0xd2643a;
  if(/hazy|neipa/.test(s))return 0xf2b53a;
  if(/pils|lager|light|kolsch|blonde|golden|wit|radler/.test(s))return 0xedc94e;
  if(/ipa|pale/.test(s))return 0xe9bf45;
  if(/amber|red/.test(s))return 0xb3561f;
  return 0xeccb64;}
const fmtDay=d=>{if(!d)return '';const x=new Date(String(d).slice(0,10)+'T12:00:00');return isNaN(x)?'':MON[x.getMonth()]+' '+x.getDate();};
const fx=(v,n=3)=>v==null||v===''?'':Number(v).toFixed(n);

/* ---------- data ---------- */
/* the brewing app's tanks ({id,status:'Cold crash',vol,...}) become the site's rows */
const WK={'brewing':'brewing','fermenting':'fermenting','conditioning':'conditioning','cold crash':'cold_crash','cold_crash':'cold_crash','carbonating':'carbonating','ready to package':'ready','ready':'ready','serving':'serving','aging':'aging','empty':'empty','empty · clean':'empty','cip':'empty'};
function fromApp(t){
  if(t.tank_code)return t;
  const st=WK[String(t.status||'').toLowerCase().trim()]||'empty',has=+t.vol>0&&st!=='empty';
  return {tank_code:t.id,status:has||st==='brewing'?st:'empty',beer_name:has?(t.beer||null):null,style:t.style||null,volume_bbl:t.vol!=null?+t.vol:null,srm:t.srm||null,
    batch:t.batch||null,brewed_on:t.brewed||t.brew_date||null,ready_on:t.eta||t.ready||null,og:t.og,sg:t.sg,fg_target:t.fg,abv_target:t.abv,ibu:t.ibu,temp_f:t.temp,yeast:t.yeast,readings:t.readings||null,next_beer:t.next||null};
}
async function loadCellar(){
  const c=D.CELLAR_SOURCE;
  if(c.endpoint){
    try{const ac=new AbortController(),to=setTimeout(()=>ac.abort(),8000);
      const r=await fetch(c.endpoint,{signal:ac.signal,cache:'no-store'});clearTimeout(to);if(!r.ok)throw 0;
      const j=await r.json(),list=Array.isArray(j)?j:(j.tanks||j.rows||[]);if(!list.length)throw 0;
      return {rows:list.map(fromApp),live:true,at:j.updated?new Date(j.updated):new Date()};
    }catch(e){if(!c.url||!c.anonKey)return {rows:D.CELLAR_PREVIEW,live:false};}
  }
  if(!c.url||!c.anonKey)return {rows:D.CELLAR_PREVIEW,live:false};
  try{
    const r=await fetch(`${c.url.replace(/\/$/,'')}/rest/v1/${c.view}?select=*`,{headers:{apikey:c.anonKey,Authorization:'Bearer '+c.anonKey}});
    if(!r.ok)throw 0;return {rows:await r.json(),live:true,at:new Date()};
  }catch(e){return {rows:D.CELLAR_PREVIEW,live:false};}
}
let rowsBy={},selected='FV4';
const L=D.CELLAR_LAYOUT,byCode={};L.forEach(t=>byCode[t.code]=t);
const row=code=>rowsBy[code]||{tank_code:code,status:'empty'};
const vol=(t,r)=>isFull(r)?(r.volume_bbl!=null?+r.volume_bbl:(r.fill_pct!=null?t.bbl*r.fill_pct/100:0)):0;

/* ---------- header stats, legend, list ---------- */
function renderStats(){
  const tanks=L.filter(t=>t.kind==='fv'||t.kind==='bt');
  const inTank=tanks.reduce((a,t)=>a+vol(t,row(t.code)),0),cap=tanks.reduce((a,t)=>a+t.bbl,0);
  const count=st=>tanks.filter(t=>row(t.code).status===st).length;
  const ready=tanks.filter(t=>['ready','serving'].includes(row(t.code).status)).length;
  const open=tanks.filter(t=>!isFull(row(t.code))).length;
  document.getElementById('cxStats').innerHTML=[[inTank.toFixed(1),'bbl in tank'],[Math.round(inTank/cap*100)+'%','cellar full'],[count('fermenting'),'fermenting'],[ready,'ready'],[open,'open tanks']]
    .map(s=>`<div><b>${s[0]}</b><span>${s[1]}</span></div>`).join('');
  const tb=document.getElementById('cxTable');
  tb.innerHTML='<thead><tr><th>Vessel</th><th>Size</th><th>Status</th><th>Beer</th><th>Style</th><th>Volume</th><th>Gravity</th></tr></thead><tbody>'+
    L.map(t=>{const r=row(t.code),st=STATUS[r.status]||STATUS.empty;return `<tr data-code="${t.code}" tabindex="0"><td><b>${t.code}</b></td><td>${t.bbl} bbl</td><td><i style="background:${st.color}"></i>${st.label}</td><td>${esc(r.beer_name||(r.next_beer?'Up next: '+r.next_beer:''))}</td><td>${esc(r.style||'')}</td><td>${isFull(r)?vol(t,r).toFixed(1)+' bbl':''}</td><td>${fx(r.sg)}</td></tr>`;}).join('')+'</tbody>';
  tb.querySelectorAll('tr[data-code]').forEach(tr=>{const go=()=>{select(tr.dataset.code);stage.scrollIntoView({behavior:reduce?'auto':'smooth',block:'center'});};tr.addEventListener('click',go);tr.addEventListener('keydown',e=>{if(e.key==='Enter')go();});});
}
document.getElementById('cxLegend').innerHTML=Object.values(STATUS).map(s=>`<li><i style="background:${s.color}"></i>${s.label}</li>`).join('');

/* ---------- side panel ---------- */
function chart(r){
  const pts=(r.readings||[]).map(p=>Array.isArray(p)?{t:p[0],sg:+p[1]}:{t:p.t||p.date,sg:+(p.sg||p.gravity)}).filter(p=>p.t&&p.sg);
  if(!pts.length&&r.sg)pts.push({t:new Date().toISOString().slice(0,10),sg:+r.sg});
  if(!pts.length)return '';
  const W=300,H=96,tg=r.fg_target?+r.fg_target:null;
  const ys=pts.map(p=>p.sg).concat(tg?[tg]:[]),y0=Math.min(...ys)-.003,y1=Math.max(...ys)+.003;
  const t0=Date.parse(pts[0].t),t1=Math.max(Date.parse(pts[pts.length-1].t),t0+1);
  const X=t=>pts.length===1?14:14+(Date.parse(t)-t0)/(t1-t0)*(W-28),Y=v=>10+(1-(v-y0)/(y1-y0))*(H-30);
  const line=pts.map((p,i)=>(i?'L':'M')+X(p.t).toFixed(1)+' '+Y(p.sg).toFixed(1)).join(' ');
  return `<figure class="cx-chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Gravity readings over time">
    ${tg?`<line x1="0" x2="${W}" y1="${Y(tg)}" y2="${Y(tg)}" class="tg"/><text x="${W-4}" y="${Y(tg)-6}" text-anchor="end">target ${fx(tg)}</text>`:''}
    <path d="${line}" class="ln"/>${pts.map(p=>`<circle cx="${X(p.t)}" cy="${Y(p.sg)}" r="3.4"/>`).join('')}
    <text x="2" y="${H-3}">${fmtDay(pts[0].t)}</text><text x="${W-2}" y="${H-3}" text-anchor="end">${fmtDay(pts[pts.length-1].t)}</text></svg></figure>`;
}
function panel(code){
  const t=byCode[code],r=row(code),st=STATUS[r.status]||STATUS.empty,full=isFull(r),v=vol(t,r),pct=Math.round(v/t.bbl*100);
  const rows=full?[['Beer',esc(r.beer_name)],['Style',esc(r.style)],['Batch',esc(r.batch)],['Day',esc(r.day)],
      ['Gravity',r.sg?`${fx(r.sg)}${r.og?` <span class="muted">from ${fx(r.og)}</span>`:''}`:''],['Yeast',esc(r.yeast)],['Ready',t.kind==='barrel'?'':(r.ready_on?fmtDay(r.ready_on):'TBD')]]
    :[['Status',r.next_beer?'Up next: '+esc(r.next_beer):(['hlt','mlt','bk'].includes(t.kind)?'Waiting for brew day':'Clean and waiting for the next batch')]];
  const tankish=['fv','bt','barrel'].includes(t.kind);
  return `<p class="cx-kind">${KIND[t.kind]} · ${t.bbl} bbl</p><h3 class="cx-code">${t.code}</h3>
    <span class="cx-pill"><i style="background:${st.color}"></i>${st.label}</span>
    ${tankish?`<div class="cx-vol"><div class="lab"><span>${v.toFixed(1)} of ${t.bbl} bbl</span><span>${full?pct:0}%</span></div><div class="track"><i style="width:${full?pct:0}%;background:${st.color}"></i></div></div>`:''}
    <dl class="cx-dl">${rows.filter(x=>x[1]!=null&&x[1]!=='').map(x=>`<div><dt>${x[0]}</dt><dd>${x[1]}</dd></div>`).join('')}</dl>
    ${full?chart(r):''}
    ${full&&t.kind!=='barrel'?'<button type="button" class="btn cx-sheet" id="cxSheet">Open brew sheet</button>':''}
    <p class="sheet-note">Read only · from our brewing log</p>`;
}
function brewSheet(code){
  const t=byCode[code],r=row(code),st=STATUS[r.status]||STATUS.empty;
  const abv=r.og&&r.sg?((r.og-r.sg)*131.25).toFixed(1)+'%':'';
  const f=[['Vessel',`${t.code} · ${KIND[t.kind]} · ${t.bbl} bbl`],['Status',st.label],['Beer',r.beer_name],['Style',r.style],['Batch',r.batch],['Brewed',fmtDay(r.brewed_on)],['Day',r.day],
    ['Original gravity',fx(r.og)],['Current gravity',fx(r.sg)],['Target final',fx(r.fg_target)],['ABV so far',abv],['Target ABV',r.abv_target?r.abv_target+'%':''],
    ['IBU',r.ibu],['Tank temp',r.temp_f?r.temp_f+'°F':''],['Yeast',r.yeast],['Hops',r.hops],['Malt',r.malt],['Ready',r.ready_on?fmtDay(r.ready_on):'TBD']].filter(x=>x[1]!=null&&x[1]!=='');
  window.WH.openModal(`<div class="ev-pad"><p class="eyebrow">Brew sheet · read only</p><h2 id="modalTitle">${esc(r.beer_name||t.code)}</h2>
    <dl class="sheet" style="margin-top:20px">${f.map(x=>`<div class="${/Hops|Malt|Vessel/.test(x[0])?'wide':''}"><dt>${x[0]}</dt><dd>${esc(x[1])}</dd></div>`).join('')}</dl>
    ${chart(r)}<p class="sheet-note" style="margin-top:16px">Straight from our brewing log</p></div>`);
}
const card=document.getElementById('c3card');
let api=null;
function select(code){
  if(!byCode[code])return;selected=code;card.innerHTML=panel(code);
  const b=document.getElementById('cxSheet');if(b)b.addEventListener('click',()=>brewSheet(code));
  document.querySelectorAll('#c3labels .cx-lbl').forEach(l=>l.classList.toggle('sel',l.dataset.code===code));
  if(api)api.highlight();
}

/* ---------- 3D: the Woodhouse Weekly cellar scene ----------
   Same model as the Weekly app (brewhouse on its deck, FV1 to FV6, BT1 to BT4, 12 oak barrels),
   fed from the site's cellar rows. */
const labelsEl=document.getElementById('c3labels');
function srmColor(srm){
  srm=+srm;if(!srm)return null;
  const stops=[[2,[248,214,104]],[4,[240,190,70]],[6,[226,160,50]],[10,[200,120,35]],[17,[150,70,20]],[25,[90,35,12]],[40,[30,12,6]]];
  srm=Math.max(2,Math.min(40,srm));
  for(let i=0;i<stops.length-1;i++){const a=stops[i],b=stops[i+1];if(srm>=a[0]&&srm<=b[0]){const t=(srm-a[0])/(b[0]-a[0]);const c=a[1].map((v,j)=>Math.round(v+(b[1][j]-v)*t));return `rgb(${c[0]},${c[1]},${c[2]})`}}
  return null;
}
/* beer color: the row's SRM when the brewing app sends one, otherwise a typical SRM for the style */
function styleSrm(style=''){const s=style.toLowerCase();
  if(/imperial stout|russian/.test(s))return 40;if(/stout|porter|schwarz|dark/.test(s))return 36;if(/brown|dunkel/.test(s))return 20;
  if(/amber|red|marzen|vienna/.test(s))return 14;if(/hazy|neipa/.test(s))return 5;if(/pils|lager|helles|kolsch|blonde|light|golden/.test(s))return 3.5;
  if(/wit|wheat|hefe/.test(s))return 4;if(/ipa|pale/.test(s))return 6;if(/saison|farmhouse/.test(s))return 5;if(/sour|mixed|wild|gose/.test(s))return 6;return 0;}
const FRUIT=/kombucha|kir|cherry|framboise|raspberry|fruit|berry|hibiscus/i;
function toTank(t){const r=row(t.code),full=isFull(r);
  return {id:t.code,kind:['hlt','mlt','bk'].includes(t.kind)?'bh':t.kind,cap:t.bbl,beer:full?(r.beer_name||''):'',style:r.style||'',
    status:STATUS[r.status]?r.status:'empty',vol:full?vol(t,r):0,srm:r.srm||styleSrm(r.style||''),fruit:FRUIT.test((r.style||'')+' '+(r.beer_name||''))};}
const statusColor=k=>(STATUS[k]||STATUS.empty).color;
const liquidColor=t=>t.fruit?'#c4553a':(srmColor(t.srm)||statusColor(t.status));

api=(function(){
  if(!window.THREE||!THREE.OrbitControls)return null;
  let renderer;try{renderer=new THREE.WebGLRenderer({antialias:true});}catch(e){return null;}
  if(!renderer.getContext())return null;
  const stage=document.getElementById('c3stage'),labels=labelsEl;
  renderer.setPixelRatio(Math.min(2,window.devicePixelRatio||1));renderer.setClearColor(0x0a0a0b);
  renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.72;
  stage.insertBefore(renderer.domElement,labels);
  const scene=new THREE.Scene();scene.fog=new THREE.Fog(0x0a0a0b,26,54);
  if(THREE.RoomEnvironment){try{const pm=new THREE.PMREMGenerator(renderer);scene.environment=pm.fromScene(new THREE.RoomEnvironment(),.06).texture}catch(e){}}
  const camera=new THREE.PerspectiveCamera(36,1,.1,200);camera.position.set(-3.2,21,25);
  const controls=new THREE.OrbitControls(camera,renderer.domElement);
  controls.target.set(-3.2,1.2,-1.2);controls.enableDamping=true;controls.dampingFactor=.08;controls.minDistance=6;controls.maxDistance=46;controls.maxPolarAngle=Math.PI*.49;controls.enablePan=false;
  controls.autoRotate=!reduce;controls.autoRotateSpeed=.3;
  /* on the website: zoom only once the visitor has clicked into the scene, and let phones scroll the page past it */
  controls.enableZoom=false;renderer.domElement.style.touchAction='pan-y';
  renderer.domElement.addEventListener('pointerdown',()=>{controls.enableZoom=true;stage.classList.add('engaged');stage.setAttribute('data-lenis-prevent','');});
  stage.addEventListener('pointerleave',()=>{controls.enableZoom=false;stage.classList.remove('engaged');stage.removeAttribute('data-lenis-prevent');});
  scene.add(new THREE.HemisphereLight(0xdff3f0,0x0b0f0f,scene.environment?.12:.6));
  const key=new THREE.DirectionalLight(0xfff0d8,.85);key.position.set(7,14,9);scene.add(key);
  const rim=new THREE.PointLight(0x89d8d0,1.0,36);rim.position.set(-9,6,-9);scene.add(rim);
  const warm=new THREE.PointLight(0xe0a546,.5,22);warm.position.set(6,3,6);scene.add(warm);

  // floor: sealed concrete, trench drain, grid
  const floor=new THREE.Mesh(new THREE.CircleGeometry(28,72),new THREE.MeshStandardMaterial({color:0x0e0e10,roughness:.82,metalness:.05,envMapIntensity:.25}));floor.rotation.x=-Math.PI/2;floor.position.x=-3.2;scene.add(floor);
  const grid=new THREE.GridHelper(40,40,0x232326,0x161618);grid.position.y=.002;scene.add(grid);
  const trench=new THREE.Mesh(new THREE.PlaneGeometry(30,.22),new THREE.MeshStandardMaterial({color:0x5d6868,metalness:.8,roughness:.4}));trench.rotation.x=-Math.PI/2;trench.position.set(-3.2,.004,.9);scene.add(trench);

  // materials
  const M={
    steel:new THREE.MeshStandardMaterial({color:0xa7b1b3,metalness:.95,roughness:.3,envMapIntensity:.8,side:THREE.DoubleSide}),
    jacket:new THREE.MeshStandardMaterial({color:0x7f898b,metalness:.9,roughness:.5,envMapIntensity:.7,side:THREE.DoubleSide}),
    fit:new THREE.MeshStandardMaterial({color:0xc4cbcc,metalness:1,roughness:.2,envMapIntensity:.9}),
    dark:new THREE.MeshStandardMaterial({color:0x3b4445,metalness:.6,roughness:.5}),
    grate:new THREE.MeshStandardMaterial({color:0x56605f,metalness:.8,roughness:.6,envMapIntensity:.6}),
    handle:new THREE.MeshStandardMaterial({color:0xd8473a,metalness:.2,roughness:.5}),
    screen:new THREE.MeshBasicMaterial({color:0x89d8d0})
  };
  const shellMats=[M.steel,M.jacket];let xray=false;
  const xb=document.getElementById('xrayBtn');
  function setXray(on){xray=on;shellMats.forEach(m=>{m.transparent=on;m.opacity=on?.16:1;m.depthWrite=!on;m.needsUpdate=true});xb.setAttribute('aria-pressed',String(on));xb.textContent=on?'Steel view':'X-ray view';bubbles.forEach(b=>b.pts.visible=xray);}
  xb.addEventListener('click',()=>setXray(!xray));

  const V2=(x,y)=>new THREE.Vector2(Math.max(.001,x),y);
  const mesh=(g,m,x=0,y=0,z=0)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);return o};
  const pipe=(len,r,m=M.fit)=>new THREE.CylinderGeometry(r,r,len,14);

  // unitank profile: outlet, 60 degree cone, straight wall, dished head
  function fvProfile(r,h,coneH,dish){
    const p=[V2(.07,0),V2(r,coneH),V2(r,coneH+h)];
    for(let i=1;i<=10;i++){const a=i/10*Math.PI/2;p.push(V2(r*Math.cos(a),coneH+h+dish*Math.sin(a)))}
    return p;
  }
  function radiusAt(prof,y){for(let i=0;i<prof.length-1;i++){const a=prof[i],b=prof[i+1];if(y>=a.y&&y<=b.y){const t=(y-a.y)/((b.y-a.y)||1);return a.x+(b.x-a.x)*t}}return prof[prof.length-1].x}
  function clipProfile(prof,L){const out=[V2(0,0)];for(let i=0;i<prof.length;i++){const p=prof[i];if(p.y<L)out.push(V2(p.x*.965,p.y));else{out.push(V2(radiusAt(prof,L)*.965,L));break}}out.push(V2(0,L));return out}

  const DIM={2:{r:.5,h:1.15},7:{r:.76,h:1.85},10:{r:.86,h:2.2},20:{r:1.08,h:3.05}};
  const LAYOUT={FV1:[1.5,3.6],FV2:[-1.1,3.6],FV3:[-3.7,3.6],FV4:[-6.6,3.6],BT1:[-6.6,-2.3],BT2:[-2.6,-6.2],BT3:[-4.5,-6.2],BT4:[-6.4,-6.2],FV5:[-8.4,-6.6],FV6:[-8.4,-4.9]};
  const root=new THREE.Group();scene.add(root);
  let meshes=[],objs={},bubbles=[],steam=[];

  function addLevel(g,prof,L,col,y0){
    const r=radiusAt(prof,L);
    const ring=new THREE.Mesh(new THREE.TorusGeometry(r*1.012,.022,8,64),new THREE.MeshBasicMaterial({color:col}));
    ring.rotation.x=Math.PI/2;ring.position.y=y0+L;g.add(ring);
  }
  function addBubbles(g,r,y0,lh){
    const n=Math.round(34*r),pos=new Float32Array(n*3),seeds=[];
    for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,rr=Math.sqrt(Math.random())*r*.8;seeds.push({x:Math.cos(a)*rr,z:Math.sin(a)*rr,y:Math.random()*lh,s:.25+Math.random()*.6})}
    const geo=new THREE.BufferGeometry();geo.setAttribute("position",new THREE.BufferAttribute(pos,3));
    const pts=new THREE.Points(geo,new THREE.PointsMaterial({color:0xfff6e0,size:.045,transparent:true,opacity:.8,depthWrite:false}));pts.position.y=y0;g.add(pts);
    bubbles.push({geo,seeds,lh,pts});
  }

  function makeFV(t,g){
    const bt=t.kind==="bt",d=DIM[t.cap]||DIM[10],r=d.r,h=bt?d.h+r*.9:d.h,coneH=bt?r*.32:r*1.55,dish=r*.28,legH=bt?.62:.42;
    const prof=fvProfile(r,h,coneH,dish),y0=legH;
    g.add(mesh(new THREE.LatheGeometry(prof,56),M.steel,0,y0,0));
    [[.18,.24],[.58,.26]].forEach(([at,hh])=>{const j=mesh(new THREE.CylinderGeometry(r*1.012,r*1.012,h*hh,56,1,true),M.jacket,0,y0+coneH+h*at+h*hh/2,0);g.add(j)});
    const cj=new THREE.Mesh(new THREE.CylinderGeometry(r*1.012,r*.62,coneH*.35,56,1,true),M.jacket);cj.position.y=y0+coneH*.62+coneH*.175;g.add(cj);
    [coneH,coneH+h].forEach(yy=>{const s=new THREE.Mesh(new THREE.TorusGeometry(r*1.003,.008,6,64),M.fit);s.rotation.x=Math.PI/2;s.position.y=y0+yy;g.add(s)});
    for(let i=0;i<4;i++){const a=Math.PI/4+i*Math.PI/2,lr=r*.93,top=y0+coneH+.05;
      const leg=mesh(new THREE.BoxGeometry(.07,top,.07),M.steel,Math.cos(a)*lr,top/2,Math.sin(a)*lr);g.add(leg);
      g.add(mesh(new THREE.BoxGeometry(.12,.22,.12),M.steel,Math.cos(a)*lr,top-.11,Math.sin(a)*lr));
      g.add(mesh(new THREE.CylinderGeometry(.09,.1,.04,16),M.dark,Math.cos(a)*lr,.02,Math.sin(a)*lr));}
    g.add(mesh(pipe(.18,.05),M.fit,0,y0-.09,0));
    g.add(mesh(new THREE.CylinderGeometry(.075,.075,.05,16),M.fit,0,y0-.2,0));
    g.add(mesh(new THREE.BoxGeometry(.22,.025,.04),M.handle,.11,y0-.2,0));
    const ra=y0+coneH*.55,rr=radiusAt(prof,coneH*.55);
    const rk=mesh(pipe(.22,.035),M.fit,0,ra,rr+.08);rk.rotation.x=Math.PI/2;g.add(rk);
    g.add(mesh(new THREE.BoxGeometry(.16,.02,.035),M.handle,.08,ra,rr+.18));
    const mw=new THREE.Mesh(new THREE.TorusGeometry(.2,.035,10,32),M.fit);mw.scale.set(.8,1.15,1);mw.position.set(0,y0+coneH+.32,r+.02);g.add(mw);
    const door=new THREE.Mesh(new THREE.CircleGeometry(.19,32),M.steel);door.scale.set(.8,1.15,1);door.position.set(0,y0+coneH+.32,r+.025);g.add(door);
    const sv=mesh(pipe(.12,.02),M.fit,-.25,y0+coneH+.55,r+.05);sv.rotation.x=Math.PI/2;g.add(sv);
    const tw=mesh(pipe(.1,.03),M.fit,.28,y0+coneH+h*.5,r+.04);tw.rotation.x=Math.PI/2;g.add(tw);
    const topY=y0+coneH+h+dish;
    g.add(mesh(new THREE.CylinderGeometry(r*.26,r*.26,.12,32),M.fit,0,topY-.02,0));
    g.add(mesh(new THREE.CylinderGeometry(r*.29,r*.29,.03,32),M.steel,0,topY+.05,0));
    g.add(mesh(pipe(.36,.025),M.fit,r*.5,topY+.05,0));
    const elb=mesh(pipe(.25,.025),M.fit,r*.5+.12,topY+.22,0);elb.rotation.z=Math.PI/2;g.add(elb);
    g.add(mesh(pipe(.2,.03),M.fit,-r*.5,topY+.0,r*.15));
    g.add(mesh(new THREE.CylinderGeometry(.05,.05,.08,12),M.dark,-r*.5,topY+.13,r*.15));
    const frac=Math.min(1,(+t.vol||0)/t.cap);
    if(frac>0){
      const vc=coneH/3,vt=vc+h,tv=frac*vt*.97;const L=Math.max(.04,tv<=vc?coneH*Math.cbrt(tv/vc):coneH+(tv-vc));
      const col=new THREE.Color(liquidColor(t)).convertSRGBToLinear();
      const lm=new THREE.MeshStandardMaterial({color:col,emissive:col,emissiveIntensity:.18,roughness:.35,metalness:0,transparent:true,opacity:.95});
      const lp=clipProfile(prof,Math.min(L,coneH+h));
      g.add(mesh(new THREE.LatheGeometry(lp,48),lm,0,y0,0));
      addLevel(g,prof,Math.min(L,coneH+h),col,y0);
      if(t.status==="fermenting"){
        const k=mesh(new THREE.CylinderGeometry(radiusAt(prof,L)*.96,radiusAt(prof,L)*.96,.07,40),new THREE.MeshStandardMaterial({color:0xf3ead5,roughness:.9}),0,y0+L+.035,0);g.add(k);
        addBubbles(g,r,y0+coneH*.4,Math.max(.1,L-coneH*.4));
      }
    }
    return {top:topY+.35,r};
  }

  // Brewhouse skid: HLT and MLT across the back with gearmotors, kettle front right, work deck with rails and stairs,
  // control cabinet, plate heat exchanger, cartridge filter, pumps and overhead piping on one base frame.
  const BH_ORIGIN=[2.6,-5.6],BH_R=1.2,BH_H=1.55,BH_LEG=.5,BH_SKID=.12,DECK_Y=1.7;
  const BH_POS={HLT:[-1.55,-1.55],MLT:[1.55,-1.55],BK:[1.55,1.55]};
  const MOTOR=new THREE.MeshStandardMaterial({color:0x2f5f9e,metalness:.35,roughness:.45});
  function makeBH(t,g){
    const r=BH_R,h=BH_H,legH=BH_LEG+BH_SKID,bot=.16,top=.34;
    const prof=[V2(.08,0),V2(r*.72,bot*.6),V2(r,bot),V2(r,bot+h)];
    for(let i=1;i<=12;i++){const a=i/12*Math.PI/2;prof.push(V2(r*Math.cos(a),bot+h+top*Math.sin(a)))}
    g.add(mesh(new THREE.LatheGeometry(prof,64),M.steel,0,legH,0));
    g.add(mesh(new THREE.CylinderGeometry(r*1.01,r*1.01,h*.62,64,1,true),M.jacket,0,legH+bot+h*.4,0));
    const seam=new THREE.Mesh(new THREE.TorusGeometry(r*1.003,.009,6,72),M.fit);seam.rotation.x=Math.PI/2;seam.position.y=legH+bot+h;g.add(seam);
    for(let i=0;i<4;i++){const a=Math.PI/4+i*Math.PI/2;
      g.add(mesh(new THREE.CylinderGeometry(.06,.06,BH_LEG+bot,12),M.steel,Math.cos(a)*r*.8,BH_SKID+(BH_LEG+bot)/2,Math.sin(a)*r*.8));
      g.add(mesh(new THREE.BoxGeometry(.14,.18,.14),M.steel,Math.cos(a)*r*.8,legH+bot-.05,Math.sin(a)*r*.8));}
    const topY=legH+bot+h+top;
    const mwx=t.id==="BK"?-.45:(t.id==="HLT"?.45:-.45),mwz=t.id==="BK"?-.35:.45;
    g.add(mesh(new THREE.CylinderGeometry(.34,.34,.1,36),M.fit,mwx,topY-.1,mwz));
    {const o=mesh(new THREE.TorusGeometry(.3,.035,10,36),M.fit,mwx,topY-.04,mwz);o.rotation.x=Math.PI/2;g.add(o)}
    g.add(mesh(new THREE.CylinderGeometry(.24,.24,.03,32),new THREE.MeshStandardMaterial({color:0x89d8d0,metalness:.1,roughness:.05,transparent:true,opacity:.55}),mwx,topY-.02,mwz));
    if(t.id==="MLT"){ /* rake gearmotor: mash / lauter tun only */
      g.add(mesh(new THREE.CylinderGeometry(.2,.24,.22,20),M.steel,.1,topY+.06,-.1));
      g.add(mesh(new THREE.BoxGeometry(.42,.34,.36),MOTOR,.1,topY+.32,-.1));
      const mot=mesh(new THREE.CylinderGeometry(.16,.16,.5,24),MOTOR,.48,topY+.36,-.1);mot.rotation.z=Math.PI/2;g.add(mot);
      {const o=mesh(new THREE.CylinderGeometry(.17,.17,.06,24),MOTOR,.74,topY+.36,-.1);o.rotation.z=Math.PI/2;g.add(o)}
    }
    if(t.id==="MLT"){
      g.add(mesh(new THREE.CylinderGeometry(.28,.1,.36,24,1,true),M.steel,-.55,topY+.32,-.55));
      g.add(mesh(new THREE.CylinderGeometry(.1,.1,.22,16),M.fit,-.55,topY+.04,-.55));
      {const o=mesh(new THREE.TorusGeometry(.28,.02,8,28),M.fit,-.55,topY+.5,-.55);o.rotation.x=Math.PI/2;g.add(o)}
      g.add(mesh(new THREE.BoxGeometry(.55,.4,.06),M.fit,0,legH+bot+.32,r+.02));
    }
    if(t.id==="BK"){
      g.add(mesh(new THREE.CylinderGeometry(.2,.2,.14,24),M.fit,.2,topY-.02,.15));
      g.add(mesh(new THREE.CylinderGeometry(.13,.13,1.3,20),M.steel,.2,topY+.6,.15));
      const wi=mesh(pipe(.5,.05),M.fit,r*.78,legH+bot+.35,r*.5);wi.rotation.z=Math.PI/2;g.add(wi);
      if(t.status==="brewing"){
        const n=40,pos=new Float32Array(n*3),seeds=[];for(let i=0;i<n;i++)seeds.push({x:(Math.random()-.5)*.22,z:(Math.random()-.5)*.22,y:Math.random()*2,s:.5+Math.random()*.6});
        const geo=new THREE.BufferGeometry();geo.setAttribute("position",new THREE.BufferAttribute(pos,3));
        const pts=new THREE.Points(geo,new THREE.PointsMaterial({color:0xe9eeee,size:.16,transparent:true,opacity:.35,depthWrite:false}));pts.position.set(.2,topY+1.25,.15);g.add(pts);steam.push({geo,seeds});
      }
    }
    g.add(mesh(pipe(.4,.05),M.fit,0,legH-.18,0));
    g.add(mesh(new THREE.CylinderGeometry(.08,.08,.05,16),M.fit,0,legH-.3,0));
    g.add(mesh(new THREE.BoxGeometry(.24,.025,.04),M.handle,.12,legH-.3,0));
    if(t.status==="brewing"||(+t.vol>0)){
      const frac=Math.min(1,(+t.vol||t.cap*.8)/t.cap),L=bot+h*frac*.9;
      const col=new THREE.Color(t.id==="HLT"?"#9fd4e8":(srmColor(t.srm)||"#c98a2e")).convertSRGBToLinear();
      const lm=new THREE.MeshStandardMaterial({color:col,emissive:col,emissiveIntensity:.18,roughness:.35,transparent:true,opacity:.92});
      g.add(mesh(new THREE.LatheGeometry(clipProfile(prof,L),48),lm,0,legH,0));
      addLevel(g,prof,L,col,legH);
    }
    return {top:topY+(t.id==="BK"?.2:.75),r};
  }

  function buildBrewhouseFrame(){
    const fr=new THREE.Group();fr.position.set(BH_ORIGIN[0],0,BH_ORIGIN[1]);
    const tube=(x0,z0,x1,z1,y,w=.1)=>{const dx=x1-x0,dz=z1-z0,len=Math.hypot(dx,dz);const b=mesh(new THREE.BoxGeometry(len,w,w),M.steel,(x0+x1)/2,y,(z0+z1)/2);b.rotation.y=-Math.atan2(dz,dx);fr.add(b)};
    const S=2.95;
    [[-S,-S,S,-S],[S,-S,S,S],[S,S,-S,S],[-S,S,-S,-S],[-S,0,S,0],[0,-S,0,S]].forEach(([a,b,c,d])=>tube(a,b,c,d,BH_SKID/2,BH_SKID));
    [[-S,-S],[S,-S],[S,S],[-S,S]].forEach(([x,z])=>fr.add(mesh(new THREE.CylinderGeometry(.11,.12,.04,16),M.dark,x,.02,z)));
    const dx0=-2.75,dx1=.3,dz0=-.3,dz1=2.75,dcx=(dx0+dx1)/2,dcz=(dz0+dz1)/2;
    fr.add(mesh(new THREE.BoxGeometry(dx1-dx0,.06,dz1-dz0),M.grate,dcx,DECK_Y,dcz));
    for(let i=0;i<=10;i++){const z=dz0+(dz1-dz0)*i/10;tube(dx0,z,dx1,z,DECK_Y+.035,.012)}
    [[dx0,dz0],[dx1,dz0],[dx0,dz1],[dx1,dz1]].forEach(([x,z])=>fr.add(mesh(new THREE.BoxGeometry(.08,DECK_Y,.08),M.steel,x,DECK_Y/2,z)));
    tube(dx0,dz0,dx1,dz0,DECK_Y-.06,.1);tube(dx0,dz1,dx1,dz1,DECK_Y-.06,.1);tube(dx0,dz0,dx0,dz1,DECK_Y-.06,.1);tube(dx1,dz0,dx1,dz1,DECK_Y-.06,.1);
    const stx0=-1.55,stx1=-.65;
    const rail=(x0,z0,x1,z1)=>{[DECK_Y+1.05,DECK_Y+.55].forEach(y=>{const len=Math.hypot(x1-x0,z1-z0);const p=mesh(pipe(len,.022),M.fit,(x0+x1)/2,y,(z0+z1)/2);p.rotation.z=Math.PI/2;p.rotation.y=-Math.atan2(z1-z0,x1-x0);fr.add(p)});
      const n=Math.max(1,Math.round(Math.hypot(x1-x0,z1-z0)/.9));for(let i=0;i<=n;i++){const x=x0+(x1-x0)*i/n,z=z0+(z1-z0)*i/n;fr.add(mesh(new THREE.BoxGeometry(.04,1.05,.04),M.fit,x,DECK_Y+.52,z))}};
    rail(dx0,dz0,dx0,dz1);rail(dx0,dz1,stx0,dz1);rail(stx1,dz1,dx1,dz1);rail(dx1,dz1,dx1,1.0);
    const steps=7,run=.3;
    for(let i=0;i<steps;i++){const y=DECK_Y-(i+1)*DECK_Y/(steps+.6);fr.add(mesh(new THREE.BoxGeometry(stx1-stx0,.04,.28),M.grate,(stx0+stx1)/2,y,dz1+.16+i*run))}
    const sl=Math.hypot(steps*run,DECK_Y),ang=Math.atan2(DECK_Y,steps*run);
    [stx0,stx1].forEach(x=>{const st=mesh(new THREE.BoxGeometry(.04,.12,sl),M.steel,x,DECK_Y/2,dz1+steps*run/2);st.rotation.x=ang;fr.add(st);
      const hr=mesh(pipe(sl,.02),M.fit,x,DECK_Y/2+1.0,dz1+steps*run/2);hr.rotation.x=ang-Math.PI/2;fr.add(hr);
      fr.add(mesh(new THREE.BoxGeometry(.04,1.0,.04),M.fit,x,.5,dz1+steps*run))});
    fr.add(mesh(new THREE.BoxGeometry(.7,1.55,.32),M.steel,-2.25,DECK_Y+.8,2.2));
    fr.add(mesh(new THREE.PlaneGeometry(.42,.28),M.screen,-2.25,DECK_Y+1.15,2.365));
    const es=mesh(new THREE.CylinderGeometry(.045,.045,.03,16),M.handle,-2.4,DECK_Y+.72,2.37);es.rotation.x=Math.PI/2;fr.add(es);
    const hx=new THREE.Group();hx.position.set(.35,0,dz1+1.15);
    hx.add(mesh(new THREE.BoxGeometry(.1,1.35,.55),M.steel,-.34,.78,0));hx.add(mesh(new THREE.BoxGeometry(.1,1.35,.55),M.steel,.34,.78,0));
    for(let i=0;i<16;i++)hx.add(mesh(new THREE.BoxGeometry(.025,1.15,.5),i%2?M.fit:M.jacket,-.28+i*.037,.78,0));
    hx.add(mesh(new THREE.BoxGeometry(.8,.06,.06),M.steel,0,1.48,0));hx.add(mesh(new THREE.BoxGeometry(.8,.06,.06),M.steel,0,.12,0));
    [[-.2,1.25],[.2,1.25],[-.2,.35],[.2,.35]].forEach(([x,y])=>{const n=mesh(pipe(.2,.04),M.fit,x,y,.32);n.rotation.x=Math.PI/2;hx.add(n)});
    fr.add(hx);
    fr.add(mesh(new THREE.CylinderGeometry(.2,.2,1.25,24),M.steel,-3.35,.82,2.2));
    fr.add(mesh(new THREE.SphereGeometry(.2,20,10,0,Math.PI*2,0,Math.PI/2),M.steel,-3.35,1.44,2.2));
    for(let i=0;i<3;i++)fr.add(mesh(new THREE.CylinderGeometry(.025,.025,.2,8),M.steel,-3.35+Math.cos(i*2.1)*.15,.1,2.2+Math.sin(i*2.1)*.15));
    [[-.4,1.6],[2.6,.2]].forEach(([x,z])=>{fr.add(mesh(new THREE.BoxGeometry(.38,.2,.28),M.dark,x,BH_SKID+.1,z));const p=mesh(new THREE.CylinderGeometry(.13,.13,.34,20),MOTOR,x+.32,BH_SKID+.24,z);p.rotation.z=Math.PI/2;fr.add(p)});
    const ph=BH_SKID+BH_LEG+.16+BH_H+.62;
    const run2=(x0,z0,x1,z1,y)=>{const len=Math.hypot(x1-x0,z1-z0);const p=mesh(pipe(len,.04),M.fit,(x0+x1)/2,y,(z0+z1)/2);p.rotation.z=Math.PI/2;p.rotation.y=-Math.atan2(z1-z0,x1-x0);fr.add(p)};
    run2(-1.55,-.1,1.55,-.1,ph+.25);run2(.1,-.1,.1,1.55,ph+.25);
    fr.add(mesh(pipe(.6,.04),M.fit,-1.55,ph-.05,-.1));fr.add(mesh(pipe(.6,.04),M.fit,1.55,ph-.05,-.1));
    run2(-1.55,-.2,1.55,-.2,.42);run2(1.55,-.2,1.55,1.0,.42);
    return fr;
  }
  Object.keys(BH_POS).forEach(k=>{LAYOUT[k]=[BH_ORIGIN[0]+BH_POS[k][0],BH_ORIGIN[1]+BH_POS[k][1]]});

  const OAK=new THREE.MeshStandardMaterial({color:0x7a4e2a,roughness:.72,metalness:.02,envMapIntensity:.35});
  const OAK_HEAD=new THREE.MeshStandardMaterial({color:0x5e3a1d,roughness:.8,metalness:0,envMapIntensity:.3});
  const IRON=new THREE.MeshStandardMaterial({color:0x2b2b2d,roughness:.45,metalness:.85});
  const BR=.31,BL=.86,BULGE=.05,RACK_Y=.16;
  const STACKS=[[-12.2,3.6],[-9.7,3.6]];
  function barrelPos(t){const n=+t.id.slice(1)-1,s=Math.floor(n/6),k=n%6,col=k%3,row=Math.floor(k/3);const [sx,sz]=STACKS[s];return [sx+(col-1)*(BR*2+.06),RACK_Y+BR+row*(BR*2+.1),sz]}
  function buildBarrelRacks(){
    const fr=new THREE.Group();
    STACKS.forEach(([sx,sz])=>{
      [0,1].forEach(row=>{const y=RACK_Y+row*(BR*2+.1);[-BL*.32,BL*.32].forEach(dz=>{fr.add(mesh(new THREE.BoxGeometry(3*(BR*2+.06)+.16,.07,.07),M.dark,sx,y-.02,sz+dz))})});
      [-1,1].forEach(side=>[-BL*.32,BL*.32].forEach(dz=>fr.add(mesh(new THREE.BoxGeometry(.07,RACK_Y+BR*2+.2,.07),M.dark,sx+side*(1.5*(BR*2+.06)+.05),(RACK_Y+BR*2+.2)/2,sz+dz))));
    });
    return fr;
  }
  function makeBarrel(t,g){
    const prof=[];for(let i=0;i<=16;i++){const y=i/16*BL,u=2*y/BL-1;prof.push(V2(BR*(1-BULGE)+BR*BULGE*(1-u*u)*2,y-BL/2))}
    const body=new THREE.Mesh(new THREE.LatheGeometry(prof,40),OAK);body.rotation.x=Math.PI/2;g.add(body);
    for(let i=0;i<14;i++){const a=i/14*Math.PI*2;const st=mesh(new THREE.BoxGeometry(.006,.006,BL*.98),OAK_HEAD,Math.cos(a)*BR*1.035,Math.sin(a)*BR*1.035,0);g.add(st)}
    [-1,1].forEach(e=>{const hd=mesh(new THREE.CircleGeometry(BR*.96,36),OAK_HEAD,0,0,e*BL/2);if(e<0)hd.rotation.y=Math.PI;g.add(hd)});
    const col=new THREE.Color(statusColor(t.status)).convertSRGBToLinear();
    [-.44,-.3,.3,.44].forEach((f,i)=>{const z=f*BL,u=2*(z+BL/2)/BL-1,rr=BR*(1-BULGE)+BR*BULGE*(1-u*u)*2;
      const inner=i===1||i===2,lit=inner&&t.beer;
      const hoop=new THREE.Mesh(new THREE.TorusGeometry(rr*1.01,.018,8,40),lit?new THREE.MeshBasicMaterial({color:col}):IRON);hoop.position.z=z;g.add(hoop)});
    g.add(mesh(new THREE.CylinderGeometry(.03,.03,.03,12),OAK_HEAD,0,BR*1.04,0));
    return {top:BR+.18,r:BR};
  }

  /* labels are buttons, so a tank can be picked from its name too */
  function makeLabel(id,sub,extra){const el=document.createElement('button');el.type='button';el.className='cx-lbl'+(extra||'');el.dataset.code=id;
    el.innerHTML=`<b>${esc(id)}</b><span>${esc(sub)}</span>`;el.addEventListener('click',()=>{controls.autoRotate=false;select(id);});labels.appendChild(el);return el;}
  function build(){
    while(root.children.length)root.remove(root.children[0]);
    meshes=[];objs={};bubbles=[];steam=[];labels.innerHTML="";
    root.add(buildBrewhouseFrame());
    root.add(buildBarrelRacks());
    let prevBeer=null;
    L.map(toTank).forEach(t=>{
      const g=new THREE.Group();
      if(t.kind==="barrel"){const bp=barrelPos(t);g.position.set(bp[0],bp[1],bp[2]);const info=makeBarrel(t,g);
        const hit=new THREE.Mesh(new THREE.BoxGeometry(BR*2,BR*2,BL),new THREE.MeshBasicMaterial({visible:false}));hit.userData.id=t.id;g.add(hit);meshes.push(hit);
        g.userData={top:info.top,halo:null};root.add(g);
        /* one name per run of barrels holding the same beer, so labels don't pile up */
        const first=!!t.beer&&t.beer!==prevBeer;prevBeer=t.beer||null;
        const el=makeLabel(t.id,t.beer||'Empty',' barrel-tag');objs[t.id]={g,el,barrel:true,named:first};return;}
      prevBeer=null;
      const p=LAYOUT[t.id]||[0,0];g.position.set(p[0],0,p[1]);
      const info=t.kind==="bh"?makeBH(t,g):makeFV(t,g);
      const halo=new THREE.Mesh(new THREE.RingGeometry(info.r*1.12,info.r*1.24,56),new THREE.MeshBasicMaterial({color:statusColor(t.status),transparent:true,opacity:.5,side:THREE.DoubleSide}));
      halo.rotation.x=-Math.PI/2;halo.position.y=.012;g.add(halo);
      const hit=new THREE.Mesh(new THREE.CylinderGeometry(info.r*1.15,info.r*1.15,info.top,12),new THREE.MeshBasicMaterial({visible:false}));hit.position.y=info.top/2;hit.userData.id=t.id;g.add(hit);meshes.push(hit);
      g.userData={top:info.top,halo};root.add(g);
      const r0=row(t.id),lt=byCode[t.id];
      const sub=t.kind==="bh"?(t.status==="brewing"?(t.beer||"Brewing"):lt.label||t.id):(t.beer||(r0.next_beer?r0.next_beer+' (planning)':STATUS[t.status].label));
      objs[t.id]={g,el:makeLabel(t.id,sub)};
    });
    bubbles.forEach(b=>b.pts.visible=xray);
    highlight();
  }
  function highlight(){Object.entries(objs).forEach(([id,o])=>{const s=id===selected;o.el.classList.toggle("sel",s);o.g.userData.ts=s?(o.barrel?1.22:1.14):1;
    if(o.barrel){o.el.hidden=!(s||o.named);return}
    o.g.userData.halo.material.opacity=s?1:.45});kick();}

  const ray=new THREE.Raycaster(),mouse=new THREE.Vector2();let down=null;
  renderer.domElement.addEventListener("pointerdown",e=>{down=[e.clientX,e.clientY]});
  renderer.domElement.addEventListener("pointerup",e=>{if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>6)return;const r=renderer.domElement.getBoundingClientRect();mouse.set((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height)*2+1);ray.setFromCamera(mouse,camera);const h=ray.intersectObjects(meshes)[0];if(h){controls.autoRotate=false;select(h.object.userData.id)}});
  let moved=false;controls.addEventListener('start',()=>{moved=true;});
  /* narrow screens: back the camera off so the whole cellar fits (until the visitor moves it) */
  function resize(){const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
    if(!moved){const k=Math.max(1,1.2/camera.aspect);scene.fog.near=26*k;scene.fog.far=54*k;const off=new THREE.Vector3(0,19.8,26.2).multiplyScalar(k);controls.maxDistance=Math.max(46,off.length()*1.1);camera.position.copy(controls.target).add(off);}}
  new ResizeObserver(resize).observe(stage);resize();
  const v=new THREE.Vector3();let last=performance.now(),vis=false,raf=0;
  function loop(now){const dt=Math.min(.05,(now-last)/1000||0);last=now;controls.update();
    if(!reduce){
      bubbles.forEach(b=>{if(!b.pts.visible)return;const p=b.geo.attributes.position.array;b.seeds.forEach((s,i)=>{s.y+=s.s*dt;if(s.y>b.lh)s.y=0;p[i*3]=s.x;p[i*3+1]=s.y;p[i*3+2]=s.z});b.geo.attributes.position.needsUpdate=true});
      steam.forEach(b=>{const p=b.geo.attributes.position.array;b.seeds.forEach((s,i)=>{s.y+=s.s*dt;if(s.y>2.2)s.y=0;p[i*3]=s.x*(1+s.y);p[i*3+1]=s.y;p[i*3+2]=s.z*(1+s.y)});b.geo.attributes.position.needsUpdate=true});
    }
    Object.values(objs).forEach(o=>{const ts=o.g.userData.ts||1,c=o.g.scale.x;if(Math.abs(ts-c)>.0005)o.g.scale.setScalar(reduce?ts:c+(ts-c)*Math.min(1,dt*9))});
    renderer.render(scene,camera);const w=stage.clientWidth,h=stage.clientHeight;
    /* place labels nearest first; a label that would collide shrinks to its ID, then hides (the selected one always shows) */
    const list=[];Object.entries(objs).forEach(([id,o])=>{if(o.el.hidden)return;v.set(0,o.g.userData.top,0);o.g.localToWorld(v);v.project(camera);
      list.push({id,o,x:(v.x+1)/2*w,y:(1-v.y)/2*h,z:v.z,on:v.z<1&&Math.abs(v.x)<1.1&&Math.abs(v.y)<1.1});});
    list.sort((a,b)=>(b.id===selected)-(a.id===selected)||a.z-b.z);
    const placed=[],hit=(r)=>placed.some(q=>r.l<q.r&&r.r>q.l&&r.t<q.b&&r.b>q.t);
    list.forEach(it=>{const el=it.o.el;if(!el._w){el._w=el.offsetWidth;el._h=el.offsetHeight;el._iw=el.firstChild.offsetWidth+8;el._ih=el.firstChild.offsetHeight+4;}
      const rect=(ww,hh)=>({l:it.x-ww/2,r:it.x+ww/2,t:it.y-hh,b:it.y});
      let mode='full',r=rect(el._w,el._h);
      if(it.id!==selected&&hit(r)){r=rect(el._iw,el._ih);mode=hit(r)?'off':'id';}
      if(!it.on)mode='off';
      el.classList.toggle('compact',mode==='id');el.style.opacity=mode==='off'?0:1;el.style.pointerEvents=mode==='off'?'none':'';
      if(mode!=='off')placed.push(r);
      el.style.transform=`translate(${it.x}px,${it.y}px) translate(-50%,-100%)`;});
    if(vis)raf=requestAnimationFrame(loop);}
  /* only animate while the cellar is on screen */
  function kick(){cancelAnimationFrame(raf);last=performance.now();raf=requestAnimationFrame(loop);}
  new IntersectionObserver(es=>{vis=es[0].isIntersecting;if(vis)kick();},{threshold:.05}).observe(stage);
  setXray(false);
  return {update(){build();},highlight};
})();

/* ---------- boot ---------- */
const chip=document.getElementById('c3chip'),chipTx=document.getElementById('c3chipText');
function setData(res){
  rowsBy={};res.rows.forEach(r=>rowsBy[r.tank_code]=r);
  chip.classList.toggle('live',res.live);chip.classList.toggle('preview',!res.live);
  chipTx.textContent=res.live?'Live from our brewing log · '+res.at.toLocaleTimeString([],{hour:'numeric',minute:'2-digit'}):'Preview data · goes live with the brewing app';
  if(!isFull(row(selected))){const f=L.find(t=>isFull(row(t.code))&&t.kind==='fv');if(f)selected=f.code;}
  renderStats();if(api)api.update();select(selected);
}
loadCellar().then(setData);
if(D.CELLAR_SOURCE.url)setInterval(()=>loadCellar().then(setData),D.CELLAR_SOURCE.refreshMinutes*60000);
})();

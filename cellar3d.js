/* Woodhouse: the cellar, mirrored from the brewing app. Read only.
   Data: the brewing app's public_cellar view (data.js CELLAR_SOURCE); preview rows otherwise. */
(function(){
const stage=document.getElementById('c3stage');if(!stage)return;
const D=window.WH_DATA,{reduce,MON,esc}=window.WH;

/* ---------- statuses (same set as the brewing app) ---------- */
const STATUS={
  brewing:{label:'Brewing',color:'#e5534b'},fermenting:{label:'Fermenting',color:'#e3a95c'},
  conditioning:{label:'Conditioning',color:'#5ec9c1'},cold_crash:{label:'Cold crash',color:'#7ea6f2'},
  carbonating:{label:'Carbonating',color:'#b49cf0'},ready:{label:'Ready to package',color:'#62c46d'},
  serving:{label:'Serving',color:'#3fd0d4'},aging:{label:'Aging',color:'#c27c45'},empty:{label:'Empty · clean',color:'#8a9392'}
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
async function loadCellar(){
  const c=D.CELLAR_SOURCE;
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

/* ---------- 3D ---------- */
const labelsEl=document.getElementById('c3labels');
api=(function(){
  if(!window.THREE)return null;
  let R;try{R=new THREE.WebGLRenderer({antialias:true});}catch(e){return null;}
  if(!R.getContext())return null;
  R.setPixelRatio(Math.min(2,window.devicePixelRatio||1));R.outputEncoding=THREE.sRGBEncoding;
  R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1.0;R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;
  R.setClearColor(0x3b3f40);
  stage.insertBefore(R.domElement,labelsEl);
  const scene=new THREE.Scene();scene.fog=new THREE.Fog(0x3b3f40,1100,2200);
  const cam=new THREE.PerspectiveCamera(32,16/9,1,6000);
  const pm=new THREE.PMREMGenerator(R),env=new THREE.Scene();
  env.add(new THREE.Mesh(new THREE.BoxGeometry(900,500,900),new THREE.MeshBasicMaterial({color:0x101314,side:THREE.BackSide})));
  const strip=(x,y,z,w,h,d,c)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshBasicMaterial({color:c}));m.position.set(x,y,z);env.add(m);};
  [-300,-120,60,240].forEach((x,i)=>strip(x,235,0,26,6,520,i%2?0xffffff:0xe9f1f0));      /* ceiling light bars */
  strip(-440,90,-120,8,160,90,0xfff4e2);strip(-440,90,140,8,160,90,0xfff4e2);           /* warm windows */
  strip(440,110,0,8,120,260,0xcfe6e3);                                                  /* cool bounce */
  strip(0,-240,0,900,4,900,0x55595a);                                                   /* floor bounce */
  strip(0,90,-440,600,40,8,0x8a9291);
  scene.environment=pm.fromScene(env,.04).texture;
  scene.add(new THREE.HemisphereLight(0xf4f7f6,0x2b2f30,.55));
  const sun=new THREE.DirectionalLight(0xffffff,.85);sun.position.set(-260,520,300);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
  Object.assign(sun.shadow.camera,{left:-420,right:420,top:420,bottom:-420,near:50,far:1500});sun.shadow.bias=-.0004;scene.add(sun);

  /* floor, grid, walkway */
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(2600,2600),new THREE.MeshStandardMaterial({color:new THREE.Color(0x3c4142).convertSRGBToLinear(),roughness:.95}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);
  const grid=new THREE.GridHelper(2600,86,0x2f3435,0x2f3435);grid.material.transparent=true;grid.material.opacity=.35;grid.position.y=.3;scene.add(grid);
  const walk=new THREE.Mesh(new THREE.BoxGeometry(7,1.2,820),new THREE.MeshStandardMaterial({color:0xe9eceb,roughness:.6}));
  walk.position.set(-60,.8,-20);walk.rotation.y=-.62;walk.receiveShadow=true;scene.add(walk);

  /* materials */
  /* brushed stainless: circumferential grain as roughness + bump */
  function brushed(){const c=document.createElement('canvas');c.width=512;c.height=1024;const x=c.getContext('2d');
    x.fillStyle='#7d7d7d';x.fillRect(0,0,512,1024);
    for(let i=0;i<2600;i++){const y=Math.random()*1024,a=.04+Math.random()*.12;x.fillStyle=Math.random()<.5?`rgba(255,255,255,${a})`:`rgba(0,0,0,${a})`;x.fillRect(0,y,512,.6+Math.random()*1.4);}
    for(let i=0;i<40;i++){const y=Math.random()*1024;x.fillStyle='rgba(0,0,0,.08)';x.fillRect(0,y,512,3+Math.random()*6);}
    const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(1,2);t.anisotropy=R.capabilities.getMaxAnisotropy();return t;}
  const brushTex=brushed();
  const glass=new THREE.MeshPhysicalMaterial({color:new THREE.Color(0xb4bab9).convertSRGBToLinear(),metalness:1,roughness:.28,roughnessMap:brushTex,bumpMap:brushTex,bumpScale:.25,
    clearcoat:.45,clearcoatRoughness:.18,envMapIntensity:1.05,side:THREE.DoubleSide,transparent:false,opacity:1});
  const leg=new THREE.MeshStandardMaterial({color:new THREE.Color(0xc5cbca).convertSRGBToLinear(),metalness:1,roughness:.32,envMapIntensity:1.1});
  const rimMat=new THREE.LineBasicMaterial({color:0x6f7776,transparent:true,opacity:.7});
  const woodTex=new THREE.CanvasTexture(window.WH.makeWoodCanvas(false));woodTex.encoding=THREE.sRGBEncoding;woodTex.wrapS=woodTex.wrapT=THREE.RepeatWrapping;woodTex.repeat.set(.6,.25);
  const wood=new THREE.MeshStandardMaterial({map:woodTex,color:0xc89a6c,roughness:.65});
  const hoop=new THREE.MeshStandardMaterial({color:0x3b3330,metalness:.6,roughness:.45});
  const ring=(r,y,g)=>{const pts=[];for(let i=0;i<=64;i++){const a=i/64*Math.PI*2;pts.push(new THREE.Vector3(Math.sin(a)*r,y,Math.cos(a)*r));}const l=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),rimMat);g.add(l);return l;};
  const picks=[],tanks={};
  const addPick=(m,code)=>{m.userData.code=code;picks.push(m);return m;};

  /* ---- vessels ---- */
  function vessel(t){
    const g=new THREE.Group(),code=t.code;
    const brew=['hlt','mlt','bk'].includes(t.kind),fv=t.kind==='fv';
    const r=(brew?24:19)*Math.cbrt(t.bbl/10),bodyH=r*(brew?1.45:fv?2.4:2.1),coneH=fv?r*.9:r*.3,legH=brew?0:r*.55+6,y0=(brew?28:0)+legH;
    const domeS=brew?.12:fv?.3:.24;
    const body=new THREE.Mesh(new THREE.CylinderGeometry(r,r,bodyH,56,1,true),glass);body.position.y=y0+coneH+bodyH/2;g.add(addPick(body,code));
    const cone=new THREE.Mesh(new THREE.CylinderGeometry(r,fv?r*.14:r*.95,coneH,56,1,true),glass);cone.position.y=y0+coneH/2;g.add(addPick(cone,code));
    const dome=new THREE.Mesh(new THREE.SphereGeometry(r,56,14,0,Math.PI*2,0,Math.PI/2),glass);dome.scale.y=domeS;dome.position.y=y0+coneH+bodyH;g.add(addPick(dome,code));
    ring(r,y0+coneH,g);ring(r,y0+coneH+bodyH,g);ring(r*.3,y0+coneH+bodyH+r*domeS,g);
    const man=new THREE.Mesh(new THREE.CylinderGeometry(r*.17,r*.17,4,24),leg);man.position.y=y0+coneH+bodyH+r*domeS+1;g.add(man);
    if(!brew){const n=fv?4:3;for(let i=0;i<n;i++){const a=i/n*Math.PI*2+Math.PI/n,l=new THREE.Mesh(new THREE.CylinderGeometry(1.1,1.1,legH+coneH*.6,8),leg);
      l.position.set(Math.sin(a)*r*.82,(legH+coneH*.6)/2,Math.cos(a)*r*.82);l.castShadow=true;g.add(l);ring(3.2,0,g).position.set(l.position.x,.6,l.position.z);}
      ring(r*1.05,.5,g);}
    const lm=new THREE.MeshStandardMaterial({color:0xf0d26a,roughness:.35,emissive:0x000000,emissiveIntensity:.15});
    const cl=new THREE.Mesh(new THREE.CylinderGeometry(r*.97,fv?r*.13:r*.92,coneH*.98,40),lm);cl.position.y=y0+coneH/2;g.add(cl);
    const bl=new THREE.Mesh(new THREE.CylinderGeometry(r*.97,r*.97,1,40),lm);g.add(bl);
    const top=new THREE.Mesh(new THREE.CircleGeometry(r*.97,40),new THREE.MeshStandardMaterial({color:0xfaf3dd,roughness:.8}));top.rotation.x=-Math.PI/2;g.add(top);
    const bands=[];for(let i=0;i<5;i++){const b=new THREE.Mesh(new THREE.CylinderGeometry(r*.975,r*.975,1.6,40,1,true),new THREE.MeshStandardMaterial({color:0xffffff,transparent:true,opacity:.2}));g.add(b);bands.push(b);}
    [cl,bl].forEach(m=>{m.castShadow=true;addPick(m,code);});
    g.position.set(t.x,0,t.z);scene.add(g);
    g.userData={r,bodyH,coneH,y0,topY:y0+coneH+bodyH+r*domeS+4,cl,bl,top,lm,bands,cur:0,target:0,kind:t.kind};
    return g;
  }
  /* ---- brewhouse platform ---- */
  (function(){
    const g=new THREE.Group(),pm2=new THREE.MeshStandardMaterial({color:new THREE.Color(0xaab1b0).convertSRGBToLinear(),roughness:.6,metalness:.25});
    const deck=new THREE.Mesh(new THREE.BoxGeometry(150,3,150),pm2);deck.position.set(-238,26.5,-8);deck.castShadow=deck.receiveShadow=true;g.add(deck);
    const post=(x,z,h)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(.9,.9,h,8),leg);m.position.set(x,h/2,z);m.castShadow=true;g.add(m);};
    [[-310,-80],[-166,-80],[-310,64],[-166,64],[-238,-80],[-238,64]].forEach(p=>post(p[0],p[1],26));
    const rail=(x1,z1,x2,z2,y)=>{const len=Math.hypot(x2-x1,z2-z1),m=new THREE.Mesh(new THREE.CylinderGeometry(.6,.6,len,6),leg);m.position.set((x1+x2)/2,y,(z1+z2)/2);m.rotation.z=Math.PI/2;m.rotation.y=-Math.atan2(z2-z1,x2-x1);g.add(m);};
    [[-166,-80,-166,22],[-310,-80,-166,-80]].forEach(r=>{rail(...r,46);rail(...r,37);});
    for(let i=0;i<=8;i++){const p1=new THREE.Mesh(new THREE.CylinderGeometry(.6,.6,20,6),leg);p1.position.set(-310+i*18,38,-80);g.add(p1);}
    for(let i=0;i<=5;i++){const p2=new THREE.Mesh(new THREE.CylinderGeometry(.6,.6,20,6),leg);p2.position.set(-166,38,-80+i*20);g.add(p2);}
    for(let i=0;i<9;i++){const st=new THREE.Mesh(new THREE.BoxGeometry(14,2,26),pm2);st.position.set(-156+i*7,26-i*2.9,44);st.castShadow=true;g.add(st);}
    scene.add(g);
  })();
  /* ---- barrels: two racks, three wide, two high ---- */
  const rackMat=new THREE.MeshStandardMaterial({color:0x7a3f22,roughness:.6});
  function barrel(t){
    const base=[[165,40],[220,118]][t.rack],level=Math.floor(t.slot/3),col=t.slot%3,ang=.62;
    const g=new THREE.Group(),prof=[];for(let i=0;i<=12;i++){const y=-14+i*28/12;prof.push(new THREE.Vector2(8.5+2.3*Math.cos(y/14*Math.PI/2),y));}
    const b=new THREE.Mesh(new THREE.LatheGeometry(prof,28),wood);b.rotation.z=Math.PI/2;b.castShadow=true;g.add(addPick(b,t.code));
    [-10,-4,4,10].forEach(x=>{const h=new THREE.Mesh(new THREE.TorusGeometry(Math.abs(x)>8?9.5:10.7,.45,6,28),hoop);h.rotation.y=Math.PI/2;h.position.x=x;g.add(h);});
    [14.05,-14.05].forEach(x=>{const e=new THREE.Mesh(new THREE.CircleGeometry(8.6,28),wood);e.position.x=x;e.rotation.y=x>0?Math.PI/2:-Math.PI/2;g.add(e);});
    const off=(col-1)*23;g.position.set(base[0]+Math.sin(-ang)*off*0+Math.cos(ang)*0+off*Math.sin(Math.PI/2+ang)*0+off*Math.cos(ang)*0,13+level*22,base[1]);
    g.position.x=base[0]+off*Math.sin(ang);g.position.z=base[1]+off*Math.cos(ang);
    g.rotation.y=ang;
    if(t.slot===0){for(let k=0;k<2;k++){const bar2=new THREE.Mesh(new THREE.BoxGeometry(3,2.4,76),rackMat);bar2.position.set(base[0],2+k*22,base[1]);bar2.rotation.y=ang;bar2.position.x+=0;bar2.castShadow=true;scene.add(bar2);
      [-9,9].forEach(dx=>{const b3=bar2.clone();b3.position.x=base[0]+dx*Math.cos(ang);b3.position.z=base[1]-dx*Math.sin(ang);scene.add(b3);});bar2.visible=false;}}
    scene.add(g);g.userData={topY:g.position.y+12,kind:'barrel',r:16};return g;
  }
  L.forEach(t=>tanks[t.code]=t.kind==='barrel'?barrel(t):vessel(t));

  const sel=new THREE.Mesh(new THREE.TorusGeometry(1,.045,8,80),new THREE.MeshBasicMaterial({color:0xe3a95c}));sel.rotation.x=Math.PI/2;sel.position.y=1.2;scene.add(sel);

  function setLevels(){
    L.forEach(t=>{if(t.kind==='barrel')return;const u=tanks[t.code].userData,r=row(t.code);
      u.target=isFull(r)?Math.max(.05,Math.min(1,vol(t,r)/t.bbl||.8)):0;
      const c=new THREE.Color(beerColor(r.style||(r.status==='brewing'?'golden':''))).convertSRGBToLinear();u.lm.color.copy(c);u.lm.emissive.copy(c);});
  }
  function apply(u){
    const lvl=u.cur,show=lvl>.004;u.cl.visible=show;u.bl.visible=show&&lvl>.01;u.top.visible=show;
    const h=Math.max(.01,lvl*u.bodyH*.97);u.bl.scale.y=h;u.bl.position.y=u.y0+u.coneH+h/2;u.top.position.y=u.y0+u.coneH+h+.2;
    u.bands.forEach((b,i)=>{const y=(i+1)/6*h;b.visible=show&&y<h-2;b.position.y=u.y0+u.coneH+y;});
  }

  /* labels: every vessel, and the first barrel of each beer */
  const labelled=L.filter((t,i)=>{if(t.kind!=='barrel')return true;const r=row(t.code);if(!isFull(r))return false;
    const prev=L[i-1];return !(prev&&prev.kind==='barrel'&&row(prev.code).beer_name===r.beer_name);});
  labelsEl.innerHTML=labelled.map(t=>`<button type="button" class="cx-lbl" data-code="${t.code}"><b>${t.code}</b><span></span></button>`).join('');
  const lbls=[...labelsEl.querySelectorAll('.cx-lbl')];
  lbls.forEach(b=>b.addEventListener('click',()=>select(b.dataset.code)));
  function labelText(){lbls.forEach(b=>{const t=byCode[b.dataset.code],r=row(t.code);
    b.querySelector('span').textContent=['hlt','mlt','bk'].includes(t.kind)?(r.status==='brewing'?'Brewing '+(r.beer_name||''):t.label):(r.beer_name||(r.next_beer?r.next_beer+' (planning)':'Empty · clean'));});}

  /* camera: drag to orbit; scroll or pinch to zoom once you've clicked into the scene */
  let az=-.48,el=.86,dist=700,azV=0,drag=null,engaged=false,xray=0,xrayT=0;
  const cv=R.domElement,ray=new THREE.Raycaster(),ptr=new THREE.Vector2(),target=new THREE.Vector3(-30,20,-10);
  cv.style.touchAction='pan-y';
  const pts=new Map();
  cv.addEventListener('pointerdown',e=>{pts.set(e.pointerId,{x:e.clientX,y:e.clientY});drag={x:e.clientX,y:e.clientY,x0:e.clientX,y0:e.clientY};cv.setPointerCapture(e.pointerId);engaged=true;stage.classList.add('engaged');});
  cv.addEventListener('pointermove',e=>{
    if(pts.has(e.pointerId)&&pts.size===2){const a=[...pts.values()],d0=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);pts.set(e.pointerId,{x:e.clientX,y:e.clientY});const b=[...pts.values()],d1=Math.hypot(b[0].x-b[1].x,b[0].y-b[1].y);if(d1>0)dist=Math.max(420,Math.min(1600,dist*d0/d1));return;}
    if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.x=e.clientX;drag.y=e.clientY;
    azV=dx*-.005;az+=azV;if(e.pointerType!=='touch')el=Math.max(.3,Math.min(1.38,el+dy*.004));});
  const up=e=>{pts.delete(e.pointerId);if(!drag)return;const moved=Math.hypot(e.clientX-drag.x0,e.clientY-drag.y0);drag=null;
    if(moved<6){const rc=cv.getBoundingClientRect();ptr.set((e.clientX-rc.left)/rc.width*2-1,-(e.clientY-rc.top)/rc.height*2+1);ray.setFromCamera(ptr,cam);const hit=ray.intersectObjects(picks,false)[0];if(hit)select(hit.object.userData.code);}};
  cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',e=>{pts.delete(e.pointerId);drag=null;});
  cv.addEventListener('wheel',e=>{if(!engaged)return;e.preventDefault();e.stopPropagation();dist=Math.max(420,Math.min(1600,dist*(1+e.deltaY*.0012)));},{passive:false});
  stage.addEventListener('pointerleave',()=>{engaged=false;stage.classList.remove('engaged');});
  const xb=document.getElementById('xrayBtn');
  xb.textContent='X-ray view';xb.setAttribute('aria-pressed','false');
  xb.addEventListener('click',()=>{xrayT=xrayT?0:1;xb.setAttribute('aria-pressed',xrayT?'true':'false');xb.textContent=xrayT?'Steel view':'X-ray view';});

  function resize(){const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;R.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();}
  new ResizeObserver(resize).observe(stage);resize();
  const v=new THREE.Vector3();let vis=false,raf=0,started=false;const clock=new THREE.Clock();
  function frame(){
    const dt=Math.min(.05,clock.getDelta()),time=clock.elapsedTime;
    if(!drag){az+=azV;azV*=.92;}
    xray+=(xrayT-xray)*(reduce?1:Math.min(1,dt*6));
    const xt=xray>.01;if(glass.transparent!==xt){glass.transparent=xt;glass.needsUpdate=true;}
    glass.opacity=1-xray*.84;glass.depthWrite=xray<.5;glass.roughness=.3-xray*.22;glass.metalness=1-xray*.6;
    rimMat.color.setHex(xray>.5?0xffffff:0x6f7776);rimMat.opacity=.55+xray*.25;
    const d=dist*Math.max(1,1.45/cam.aspect);
    cam.position.set(target.x+Math.sin(az)*Math.cos(el)*d,target.y+Math.sin(el)*d,target.z+Math.cos(az)*Math.cos(el)*d);cam.lookAt(target);
    L.forEach(t=>{if(t.kind==='barrel')return;const u=tanks[t.code].userData;if(started)u.cur+=(u.target-u.cur)*(reduce?1:Math.min(1,dt*1.8));apply(u);});
    const sg=tanks[selected];if(sg){sel.position.x=sg.position.x;sel.position.z=sg.position.z;sel.position.y=sg.userData.kind==='barrel'?.6:1.2;
      const s=sg.userData.r*1.35+Math.sin(time*3)*1.2;sel.scale.set(s,s,s);sel.material.color.set((STATUS[row(selected).status]||STATUS.empty).color);}
    R.render(scene,cam);
    const rc=stage.getBoundingClientRect();
    lbls.forEach(l=>{const g=tanks[l.dataset.code];v.set(g.position.x,g.userData.topY,g.position.z).project(cam);
      const off=v.z>1||Math.abs(v.x)>1.1||Math.abs(v.y)>1.1;l.style.opacity=off?0:1;
      l.style.transform=`translate(${(v.x*.5+.5)*rc.width}px,${(-v.y*.5+.5)*rc.height}px) translate(-50%,-100%)`;});
    if(vis)raf=requestAnimationFrame(frame);
  }
  new IntersectionObserver(es=>{vis=es[0].isIntersecting;if(vis){started=true;cancelAnimationFrame(raf);clock.getDelta();raf=requestAnimationFrame(frame);}},{threshold:.1}).observe(stage);
  return {update(){setLevels();labelText();if(!vis)frame();},highlight(){if(!vis)frame();}};
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

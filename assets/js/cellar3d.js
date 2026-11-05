/* Woodhouse: live 3D cellar. Reads the brewing app's public_cellar view (see data.js CELLAR_SOURCE). */
(function(){
if(!document.getElementById('c3stage'))return;
const D=window.WH_DATA,{reduce,now,MON}=window.WH;
async function loadCellar(){
  const c=D.CELLAR_SOURCE;
  if(!c.url||!c.anonKey) return {rows:D.CELLAR_PREVIEW,live:false};
  try{
    const r=await fetch(`${c.url.replace(/\/$/,'')}/rest/v1/${c.view}?select=*`,{headers:{apikey:c.anonKey,Authorization:'Bearer '+c.anonKey}});
    if(!r.ok) throw new Error(r.status);
    return {rows:await r.json(),live:true,at:new Date()};
  }catch(e){return {rows:D.CELLAR_PREVIEW,live:false,failed:true};}
}
const STATUS={
 fermenting:{label:'Fermenting',color:'#e3a95c'},conditioning:{label:'Conditioning',color:'#89d8d0'},
 ready:{label:'Ready to pour',color:'#f2ead9'},empty:{label:'Empty',color:'#4a5856'},cleaning:{label:'Cleaning',color:'#4a5856'}
};
function beerColor(style=''){const s=style.toLowerCase();
  if(/porter|stout|dark|schwarz/.test(s))return 0x2a140a;
  if(/hazy|neipa/.test(s))return 0xe6a336;
  if(/light|pils|lager|kolsch|blonde/.test(s))return 0xe8c45a;
  if(/sour|wild|mixed|brett|farmhouse|saison/.test(s))return 0xc7703a;
  if(/ipa|pale/.test(s))return 0xd99030;
  if(/amber|red/.test(s))return 0xa8521f;
  return 0xd08a34;}
const fmtDay=d=>{const x=new Date(d+'T12:00:00');return MON[x.getMonth()]+' '+x.getDate();};
function cellarCard(t,row){
  const st=STATUS[row.status]||STATUS.empty, has=row.beer_name&&row.status!=='empty'&&row.status!=='cleaning';
  let prog='';
  if(has&&row.brewed_on&&row.ready_on){
    const a=Date.parse(row.brewed_on),b=Date.parse(row.ready_on),n=Date.UTC(now.y,now.m-1,now.d);
    const p=Math.max(0,Math.min(1,(n-a)/(b-a))),day=Math.max(1,Math.round((n-a)/864e5)),tot=Math.round((b-a)/864e5);
    prog=`<div class="c3-prog"><div class="track"><i style="width:${Math.round(p*100)}%"></i></div><div class="lab"><span>Day ${day} of ~${tot}</span><span>${row.status==='ready'?'Ready':'On tap ~'+fmtDay(row.ready_on)}</span></div></div>`;
  }
  const g=v=>v?Number(v).toFixed(3):'';
  const abvNow=row.og&&row.sg?((row.og-row.sg)*131.25).toFixed(1)+'%':'';
  const rows=has?[
    ['Batch',row.batch],['Brewed',row.brewed_on?fmtDay(row.brewed_on):''],
    ['Original gravity',g(row.og)],['Current gravity',g(row.sg)],
    ['Target final',g(row.fg_target)],['ABV now',abvNow||(row.abv_target?row.abv_target+'%':'')],
    ['Target ABV',row.abv_target?row.abv_target+'%':''],['IBU',row.ibu],
    ['Tank temp',row.temp_f?row.temp_f+'°F':''],['Yeast',row.yeast],
    ['Hops',row.hops],['Malt',row.malt]
  ].filter(r=>r[1]):[];
  const body=has?`<h3>${row.beer_name}</h3><p class="sty">${row.style||''}</p>`
    :`<h3>${row.status==='cleaning'?'Getting clean':'Standing by'}</h3><p class="sty">${row.status==='cleaning'?'Scrubbed and sanitized for the next brew.':'Waiting on the next brew day.'}</p>`;
  return `<div class="sheet-head"><span class="code">Brew sheet · ${t.label||t.code}</span><span class="code">${t.bbl} bbl ${t.kind==='fv'?'fermenter':'bright'}</span></div>${body}
    <span class="pill" style="background:${st.color};color:${has||row.status==='ready'?'#0a0f0f':'#f2ead9'}">${st.label}</span>${prog}
    ${rows.length?`<dl class="sheet">${rows.map(r=>`<div class="${/Hops|Malt|Yeast/.test(r[0])?'wide':''}"><dt>${r[0]}</dt><dd>${r[1]}</dd></div>`).join('')}</dl>`:''}
    <p class="sheet-note">Read only · from our brewing log</p>`;
}

/* ---------- Cellar: 3D scene ---------- */
(function(){
  const stage=document.getElementById('c3stage'),labelsEl=document.getElementById('c3labels'),card=document.getElementById('c3card');
  const chip=document.getElementById('c3chip'),chipTx=document.getElementById('c3chipText');
  let rowsBy={},selected='FV1',api=null;
  function setData(res){
    rowsBy={};res.rows.forEach(r=>rowsBy[r.tank_code]=r);
    chip.classList.toggle('live',res.live);chip.classList.toggle('preview',!res.live);
    chipTx.textContent=res.live?'Live from the cellar · updated '+res.at.toLocaleTimeString([], {hour:'numeric',minute:'2-digit'}):'Preview data · goes live with the brewing app';
    const firstFull=D.CELLAR_LAYOUT.find(t=>{const r=rowsBy[t.code];return r&&r.beer_name&&r.status!=='empty';});
    if(!rowsBy[selected]||!rowsBy[selected].beer_name) selected=(firstFull||D.CELLAR_LAYOUT[0]).code;
    if(api)api.update();else fallback();
    select(selected);
  }
  function select(code){
    selected=code;const t=D.CELLAR_LAYOUT.find(x=>x.code===code);
    card.innerHTML=cellarCard(t,rowsBy[code]||{status:'empty'});
    labelsEl.querySelectorAll('.c3-lbl').forEach(l=>l.classList.toggle('sel',l.dataset.code===code));
    if(api)api.highlight(code);
  }
  function buildLabels(){
    labelsEl.innerHTML=D.CELLAR_LAYOUT.map(t=>{const r=rowsBy[t.code]||{},st=STATUS[r.status]||STATUS.empty;
      return `<button type="button" class="c3-lbl" data-code="${t.code}"><i style="background:${st.color}"></i>${t.code}${r.beer_name&&r.status!=='empty'?' · '+r.beer_name:''}</button>`;}).join('');
    labelsEl.querySelectorAll('.c3-lbl').forEach(b=>b.addEventListener('click',()=>select(b.dataset.code)));
  }
  function fallback(){
    buildLabels();labelsEl.style.position='absolute';
    let fb=stage.querySelector('.c3-fallback');if(!fb){fb=document.createElement('div');fb.className='c3-fallback';stage.appendChild(fb);}
    fb.innerHTML=D.CELLAR_LAYOUT.map(t=>{const r=rowsBy[t.code]||{},w=Math.round(18+Math.sqrt(t.bbl)*7),h=Math.round(70+Math.sqrt(t.bbl)*22),f=r.beer_name&&r.status!=='empty'?r.fill_pct||0:0;
      return `<div class="tank${t.kind==='bt'?' bt':''}" data-code="${t.code}" style="cursor:pointer"><div class="tank-body" style="--w:${w}px;--h:${h}px;--r:${w/2}px"><div class="tank-fill" style="--fill:${f}%"></div></div><div class="tank-lbl"><b>${t.code}</b>${t.bbl} bbl</div></div>`;}).join('');
    labelsEl.innerHTML='';
    fb.querySelectorAll('.tank').forEach(el=>el.addEventListener('click',()=>select(el.dataset.code)));
  }
  api=(function(){
    if(!window.THREE)return null;
    let R;try{R=new THREE.WebGLRenderer({antialias:true,alpha:true});}catch(e){return null;}
    if(!R.getContext())return null;
    R.setPixelRatio(Math.min(2,window.devicePixelRatio||1));R.outputEncoding=THREE.sRGBEncoding;
    R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1.05;
    R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;
    stage.insertBefore(R.domElement,labelsEl);
    const scene=new THREE.Scene();
    const cam=new THREE.PerspectiveCamera(30,16/9,1,5000);
    /* studio environment for the stainless */
    const pm=new THREE.PMREMGenerator(R);const env=new THREE.Scene();
    env.add(new THREE.Mesh(new THREE.BoxGeometry(800,400,800),new THREE.MeshBasicMaterial({color:0x111817,side:THREE.BackSide})));
    [[0,190,0,600,10,300,0xffffff],[-390,60,0,10,200,500,0xbfe9e4],[390,80,-100,10,160,300,0xffe8c8],[0,60,-390,500,120,10,0xd5dcdb],[0,-190,0,700,10,500,0x3a4443]].forEach(p=>{
      const m=new THREE.Mesh(new THREE.BoxGeometry(p[3],p[4],p[5]),new THREE.MeshBasicMaterial({color:p[6]}));m.position.set(p[0],p[1],p[2]);env.add(m);});
    scene.environment=pm.fromScene(env,.04).texture;
    scene.add(new THREE.HemisphereLight(0xdde9e6,0x0a0f0f,.35));
    const sun=new THREE.DirectionalLight(0xfff1dd,1.3);sun.position.set(160,380,260);sun.castShadow=true;
    sun.shadow.mapSize.set(2048,2048);const sc=sun.shadow.camera;sc.left=-360;sc.right=360;sc.top=260;sc.bottom=-160;sc.near=50;sc.far=1200;sun.shadow.bias=-.0004;scene.add(sun);
    const rim=new THREE.PointLight(0x89d8d0,1.1,1400);rim.position.set(-300,220,-260);scene.add(rim);
    const floor=new THREE.Mesh(new THREE.CircleGeometry(900,64),new THREE.MeshStandardMaterial({color:0x0c1312,roughness:.85,metalness:.1}));
    floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);
    const grid=new THREE.GridHelper(1400,56,0x89d8d0,0x89d8d0);grid.material.transparent=true;grid.material.opacity=.06;grid.position.y=.2;scene.add(grid);
    const steel=new THREE.MeshPhysicalMaterial({color:0xe4e9e8,metalness:.9,roughness:.28,clearcoat:.5,clearcoatRoughness:.2,side:THREE.DoubleSide,envMapIntensity:1.7,transparent:true,opacity:1,emissive:0x89d8d0,emissiveIntensity:0});
    const steelDark=new THREE.MeshStandardMaterial({color:0xa9b2b1,metalness:.9,roughness:.38,envMapIntensity:1.4,transparent:true,opacity:1});
    const ring=new THREE.Mesh(new THREE.RingGeometry(1,1.12,64),new THREE.MeshBasicMaterial({color:0x89d8d0,transparent:true,opacity:.9}));ring.rotation.x=-Math.PI/2;ring.position.y=.6;scene.add(ring);
    const tanks={},picks=[];
    const TS=0,TL=Math.PI*2;
    function make(t){
      const r=22*Math.cbrt(t.bbl/10),fv=t.kind==='fv';
      const bodyH=r*(fv?2.5:2.2),coneH=fv?r*.95:r*.32,legH=r*.5+8,y0=legH;
      const g=new THREE.Group();
      const add=(geo,mat,y)=>{const m=new THREE.Mesh(geo,mat);m.position.y=y;m.castShadow=true;m.receiveShadow=true;m.userData.code=t.code;g.add(m);picks.push(m);return m;};
      add(new THREE.CylinderGeometry(r,r,bodyH,72,1,true,TS,TL),steel,y0+coneH+bodyH/2);
      add(new THREE.CylinderGeometry(r,fv?r*.13:r*.92,coneH,72,1,true,TS,TL),steel,y0+coneH/2);
      const dome=add(new THREE.SphereGeometry(r,72,18,0,Math.PI*2,0,Math.PI/2),steel,y0+coneH+bodyH);dome.scale.y=fv?.34:.26;
      if(!fv){const db=add(new THREE.SphereGeometry(r*.92,48,12,0,Math.PI*2,Math.PI/2,Math.PI/2),steel,y0);db.scale.y=.2;}
      /* cut edges, jacket bands, fittings */
      /* sight glass + racking arm, like the real ones */
      {const sg=add(new THREE.CylinderGeometry(.9,.9,bodyH*.7,10),steelDark,y0+coneH+bodyH*.5);sg.position.set(r+1.2,0,0);sg.position.y=y0+coneH+bodyH*.5;}
      {const arm=add(new THREE.CylinderGeometry(1.2,1.2,r*.5,10),steelDark,y0+coneH*.9);arm.rotation.z=Math.PI/2;arm.position.x=r*.9;}
      [.32,.72].forEach(f=>{const b=add(new THREE.CylinderGeometry(r+.6,r+.6,r*.16,72,1,true,TS,TL),steelDark,y0+coneH+bodyH*f);});
      const top=add(new THREE.CylinderGeometry(r*.12,r*.12,r*.32,24),steelDark,y0+coneH+bodyH+r*(fv?.34:.26)+r*.1);
      const legs=fv?4:3;for(let i=0;i<legs;i++){const a=i/legs*Math.PI*2+Math.PI/legs;const l=add(new THREE.CylinderGeometry(1.4,1.4,legH+coneH*.5,10),steelDark,(legH+coneH*.5)/2);l.position.x=Math.sin(a)*r*.78;l.position.z=Math.cos(a)*r*.78;}
      /* beer */
      const liqMat=new THREE.MeshPhysicalMaterial({color:0xd08a34,roughness:.12,metalness:0,clearcoat:1,emissive:0x000000,transmission:0,side:THREE.FrontSide});
      const lr=r*.965;
      const coneL=new THREE.Mesh(new THREE.CylinderGeometry(lr,fv?r*.12:r*.88,coneH*.98,48),liqMat);coneL.position.y=y0+coneH/2;g.add(coneL);
      const bodyL=new THREE.Mesh(new THREE.CylinderGeometry(lr,lr,1,48),liqMat);g.add(bodyL);
      const foam=new THREE.Mesh(new THREE.CylinderGeometry(lr,lr,1,48),new THREE.MeshStandardMaterial({color:0xf3e6c8,roughness:.9}));g.add(foam);
      const N=70,pos=new Float32Array(N*3),seed=[];for(let i=0;i<N;i++){const a=Math.random()*6.28,d=Math.sqrt(Math.random())*lr*.85;pos[i*3]=Math.sin(a)*d;pos[i*3+2]=Math.cos(a)*d;pos[i*3+1]=Math.random();seed.push(.15+Math.random()*.5);}
      const bg=new THREE.BufferGeometry();bg.setAttribute('position',new THREE.BufferAttribute(pos,3));
      const bubbles=new THREE.Points(bg,new THREE.PointsMaterial({color:0xfff6e0,size:1.6,transparent:true,opacity:.75,depthWrite:false}));g.add(bubbles);
      g.userData={r,bodyH,coneH,y0,topY:y0+coneH+bodyH+r*.5,cur:0,target:0,liqMat,coneL,bodyL,foam,bubbles,seed,fv};
      scene.add(g);return g;
    }
    D.CELLAR_LAYOUT.forEach(t=>tanks[t.code]=make(t));
    /* two rows: fermenters behind, brights in front */
    function row(list,z){const w=list.map(t=>tanks[t.code].userData.r*2);const tot=w.reduce((a,b)=>a+b,0)+(list.length-1)*22;let x=-tot/2;
      list.forEach((t,i)=>{x+=w[i]/2;tanks[t.code].position.set(x,0,z);x+=w[i]/2+22;});return tot;}
    const wB=row(D.CELLAR_LAYOUT.filter(t=>t.kind==='fv'),-48), wF=row(D.CELLAR_LAYOUT.filter(t=>t.kind==='bt'),62);
    const span=Math.max(wB,wF);
    function CELLAR_EMISSIVE(x){D.CELLAR_LAYOUT.forEach(t=>{const u=tanks[t.code].userData;u.liqMat.emissiveIntensity=.12+x*.35;});}
    function setLevels(){
      D.CELLAR_LAYOUT.forEach(t=>{const u=tanks[t.code].userData,r=rowsBy[t.code]||{},full=r.beer_name&&r.status!=='empty'&&r.status!=='cleaning';
        u.target=full?Math.max(.05,Math.min(1,(r.fill_pct||0)/100)):0;u.fer=r.status==='fermenting';
        u.liqMat.color.setHex(beerColor(r.style)).convertSRGBToLinear();u.liqMat.emissive.setHex(beerColor(r.style)).convertSRGBToLinear();});
    }
    function applyLevel(u){
      const lvl=u.cur, show=lvl>.004;
      u.coneL.visible=show;u.bodyL.visible=show&&lvl>.01;u.foam.visible=show;
      const h=Math.max(.01,lvl*u.bodyH*.96);
      u.bodyL.scale.y=h;u.bodyL.position.y=u.y0+u.coneH+h/2;
      const fh=u.fer?Math.max(2,u.r*.14):1.4;u.foam.scale.y=fh;u.foam.position.y=u.y0+u.coneH+h+fh/2;
      u.bubbles.visible=show&&u.fer;u.bubbles.userData.h=h+u.coneH*.5;
    }
    let az=-.18,azV=0,drag=false,lx=0,lastIn=0,hov=0,xray=0,xrayT=0;
    const xb=document.getElementById('xrayBtn');
    if(xb)xb.addEventListener('click',()=>{xrayT=xrayT?0:1;xb.setAttribute('aria-pressed',xrayT?'true':'false');if(!vis)frame();});
    const cv=R.domElement,ray=new THREE.Raycaster(),ptr=new THREE.Vector2();let downX=0,downY=0;
    cv.addEventListener('pointerdown',e=>{drag=true;lx=downX=e.clientX;downY=e.clientY;cv.setPointerCapture(e.pointerId);lastIn=performance.now();});
    cv.addEventListener('pointermove',e=>{const rc=cv.getBoundingClientRect();hov=(e.clientY-rc.top)/rc.height-.5;if(!drag)return;azV=(e.clientX-lx)*-.004;az+=azV;az=Math.max(-.85,Math.min(.85,az));lx=e.clientX;lastIn=performance.now();});
    cv.addEventListener('pointerup',e=>{drag=false;if(Math.hypot(e.clientX-downX,e.clientY-downY)<6){const rc=cv.getBoundingClientRect();ptr.set((e.clientX-rc.left)/rc.width*2-1,-(e.clientY-rc.top)/rc.height*2+1);ray.setFromCamera(ptr,cam);const hit=ray.intersectObjects(picks,false)[0];if(hit)select(hit.object.userData.code);}});
    cv.addEventListener('pointercancel',()=>drag=false);
    const target=new THREE.Vector3(0,58,10);
    function resize(){const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;R.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();}
    new ResizeObserver(resize).observe(stage);resize();
    const v=new THREE.Vector3();let vis=false,raf=0,started=false;const clock=new THREE.Clock();
    function frame(){
      const dt=Math.min(.05,clock.getDelta()),time=clock.elapsedTime;
      xray+=(xrayT-xray)*(reduce?1:Math.min(1,dt*5));
      steel.opacity=1-xray*.86;steel.depthWrite=xray<.5;steel.emissiveIntensity=xray*.35;steel.roughness=.28-xray*.2;steelDark.opacity=1-xray*.7;steelDark.depthWrite=xray<.5;
      CELLAR_EMISSIVE(xray);
      if(!drag){az+=azV;azV*=.92;if(performance.now()-lastIn>3000&&!reduce)az+=(Math.sin(time*.15)*.35-az)*.004;}
      const fit=(span*.62)/Math.tan(THREE.MathUtils.degToRad(cam.fov/2))/Math.max(.75,cam.aspect);
      const d=Math.max(520,fit),el=.34-hov*.04;
      cam.position.set(Math.sin(az)*d*Math.cos(el),target.y+Math.sin(el)*d,Math.cos(az)*d*Math.cos(el));cam.lookAt(target);
      D.CELLAR_LAYOUT.forEach((t,i)=>{const g=tanks[t.code],u=g.userData;
        if(started){const tgt=u.target;u.cur+=(tgt-u.cur)*(reduce?1:Math.min(1,dt*1.6));}
        applyLevel(u);
        if(u.bubbles.visible&&!reduce){const p=u.bubbles.geometry.attributes.position;for(let k=0;k<p.count;k++){let y=p.array[k*3+1]+u.seed[k]*dt*.35;if(y>1)y=0;p.array[k*3+1]=y;}p.needsUpdate=true;
          u.bubbles.scale.y=u.bubbles.userData.h;u.bubbles.position.y=u.y0+u.coneH*.5;}
      });
      const sg=tanks[selected];if(sg){ring.position.x=sg.position.x;ring.position.z=sg.position.z;const s=sg.userData.r*1.25+Math.sin(time*3)*.8;ring.scale.set(s,s,s);}
      R.render(scene,cam);
      const rc=stage.getBoundingClientRect();
      labelsEl.querySelectorAll('.c3-lbl').forEach(l=>{const g=tanks[l.dataset.code];v.set(g.position.x,g.userData.topY+4,g.position.z).project(cam);
        l.style.transform=`translate(${(v.x*.5+.5)*rc.width}px,${(-v.y*.5+.5)*rc.height}px) translate(-50%,-100%)`;});
      if(vis)raf=requestAnimationFrame(frame);
    }
    new IntersectionObserver(es=>{vis=es[0].isIntersecting;if(vis){started=true;cancelAnimationFrame(raf);raf=requestAnimationFrame(frame);}},{threshold:.15}).observe(stage);
    return {update(){setLevels();buildLabels();if(!vis)frame();},highlight(){if(!vis)frame();}};
  })();
  loadCellar().then(setData);
  if(D.CELLAR_SOURCE.url) setInterval(()=>loadCellar().then(setData),D.CELLAR_SOURCE.refreshMinutes*60000);
})();

window.WH.cellar={loadCellar,STATUS,beerColor};
})();

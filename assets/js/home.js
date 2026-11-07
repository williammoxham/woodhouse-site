/* Woodhouse: home page (hero, mark, calendar rail, news) */
(function(){
const {D,reduce,hasGsap,now,MON,WD,esc,laParts,makeWoodCanvas,loadEvents}=window.WH;

/* ---------- Bubbles canvas ---------- */
(function(){
  const c=document.getElementById('bubbles'),ctx=c.getContext('2d');
  let W,H,dpr,bs=[],mx=-999,my=-999,run=true;
  function size(){dpr=Math.min(2,window.devicePixelRatio||1);W=c.clientWidth;H=c.clientHeight;c.width=W*dpr;c.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
    const n=Math.round(Math.min(160,W*H/9000));bs=Array.from({length:n},()=>mk(true));}
  function mk(init){const r=Math.random()**2*9+1;return{x:Math.random()*W,y:init?Math.random()*H:H+r*2,r,v:.25+r*.07+Math.random()*.3,ph:Math.random()*6.28,a:.15+Math.random()*.5}}
  function draw(){
    ctx.clearRect(0,0,W,H);
    for(const b of bs){
      if(!reduce){b.y-=b.v;b.ph+=.02;b.x+=Math.sin(b.ph)*.25;
        const dx=b.x-mx,dy=b.y-my,d=Math.hypot(dx,dy);if(d<120){b.x+=dx/d*1.6;b.y+=dy/d*1.2;}
        if(b.y<-20)Object.assign(b,mk(false));}
      ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,6.283);
      ctx.strokeStyle=`rgba(137,216,208,${b.a})`;ctx.lineWidth=1;ctx.stroke();
      ctx.beginPath();ctx.arc(b.x-b.r*.35,b.y-b.r*.35,b.r*.28,0,6.283);ctx.fillStyle=`rgba(242,234,217,${b.a*.8})`;ctx.fill();
    }
    if(run && !reduce)requestAnimationFrame(draw);
  }
  size();draw();
  window.addEventListener('resize',()=>{size();if(reduce)draw();});
  c.parentElement.addEventListener('pointermove',e=>{const r=c.getBoundingClientRect();mx=e.clientX-r.left;my=e.clientY-r.top;});
  c.parentElement.addEventListener('pointerleave',()=>{mx=my=-999});
  new IntersectionObserver(es=>{const v=es[0].isIntersecting;if(v&&!run){run=true;draw();}else if(!v)run=false;}).observe(c);
})();


/* ---------- On the Calendar rail ---------- */
const rail=document.getElementById('evRail');
function renderRail(res){
  const glows=['rgba(137,216,208,.28)','rgba(227,169,92,.3)','rgba(242,234,217,.2)'];
  let rh='';
  res.events.slice(0,10).forEach((e,i)=>{
    const wd=WD[new Date(Date.UTC(e.y,e.m-1,e.d,12)).getUTCDay()];
    const diff=Math.round((Date.UTC(e.y,e.m-1,e.d)-Date.UTC(now.y,now.m-1,now.d))/864e5);
    const tick=e.tickets||(e.tags||[]).find(t=>/ticket/i.test(t));
    const chip=diff===0?'<span class="ev-chip">Tonight</span>':diff===1?'<span class="ev-chip soft">Tomorrow</span>':tick?'<span class="ev-chip soft">Tickets</span>':'';
    rh+=`<button type="button" class="ev${e.img?' has-img':''}" data-i="${i}" style="--glow:${glows[i%3]}">
      ${e.img?`<span class="ev-img" style="background-image:url('${e.img}')"></span>`:''}${chip}
      <div class="ev-date"><span class="d">${e.d}</span><span class="m"><b>${MON[e.m-1]}</b>${wd.slice(0,3)}</span></div>
      <h3>${esc(e.t)}</h3><p>${esc(e.p)}</p>
      <div class="ev-foot"><span>${e.time||''}</span><span>Details +</span></div></button>`;
  });
  rh+=`<div class="ev-end"><span class="eyebrow">Every week</span><h3>Tuesday jams, Afrobeats, line dancing, comedy and more.</h3><a class="btn btn-teal" href="calendar.html" style="align-self:flex-start">See the full calendar <span class="arr">→</span></a></div>`;
  rail.innerHTML=rh;
  railList=res.events.slice(0,10);
  if(window.ScrollTrigger)ScrollTrigger.refresh();
}
let railList=[];
if(rail){
  rail.addEventListener('click',ev=>{const b=ev.target.closest('button.ev');if(!b)return;ev.preventDefault();window.WH.openEvent(railList[+b.dataset.i],+b.dataset.i);});
  loadEvents(renderRail);
}

/* ---------- House News (Squarespace blog, read on our site; never links out) ---------- */
const newsGrid=document.getElementById('newsGrid');
function renderNews(posts,live){
  if(!newsGrid)return;
  newsGrid.innerHTML=posts.slice(0,3).map((p,i)=>{let date='From the archive';if(live&&p.date){const a=laParts(p.date);date=`${MON[a.m-1]} ${a.d}, ${a.y}`;}
    return `<button type="button" class="post" data-i="${i}">${p.image?`<span class="post-img" style="background-image:url('${p.image}')"></span>`:'<span class="post-img"></span>'}
      <span class="post-date">${date}</span><h3>${esc(p.title)}</h3><p>${esc(p.excerpt)}</p><span class="txt-link">Read more +</span></button>`;}).join('');
  newsGrid.querySelectorAll('.post').forEach(b=>b.addEventListener('click',()=>{const p=posts[+b.dataset.i];
    const paras=String(p.body||p.excerpt||'').split(/\n+/).map(x=>x.trim()).filter(Boolean).map(x=>`<p>${esc(x)}</p>`).join('');
    window.WH.openModal(`${p.image?`<div class="ev-hero" style="background-image:url('${p.image}')"></div>`:''}<div class="ev-pad"><p class="eyebrow">House News</p><h2 id="modalTitle">${esc(p.title)}</h2><div class="ev-text">${paras}</div></div>`,{cls:'modal-ev'});}));
}
renderNews(D.NEWS,false);
if(/^https?:$/.test(location.protocol)){
  fetch('/api/news').then(r=>r.ok?r.json():Promise.reject()).then(data=>{
    if(data&&Array.isArray(data.posts)&&data.posts.length){renderNews(data.posts,true);if(window.ScrollTrigger)ScrollTrigger.refresh();}
  }).catch(()=>{});
}

/* ---------- Mark progression (from the brand's tangram artwork) ---------- */
const MK=[
 [[[0,-84],[85,1],[0,86],[-85,1]]],
 [[[0,-88],[85,-3],[-85,-3]],[[-85,4],[85,4],[0,89]]],
 [[[-85,-85],[85,-85],[0,0]],[[0,0],[85,85],[-85,85]]],
 [[[-85,-86],[0,-1],[-85,84]],[[85,-86],[85,84],[0,-1]]],
 [[[-85,-87],[-43,-45],[-43,41],[-85,83]],[[85,-87],[85,83],[43,41],[43,-45]]],
 [[[-85,-134],[-42,-91],[-42,-8],[-85,36]],[[85,-134],[85,36],[43,-8],[43,-91]],[[0,-42],[85,43],[0,128],[-85,43]]],
 'final'
];
const tint=i=>['rgba(242,234,217,.28)','rgba(242,234,217,.42)','rgba(200,226,220,.55)','rgba(170,222,214,.68)','rgba(150,219,210,.8)','rgba(137,216,208,.92)','#89d8d0'][i];
const finalSvg=`<g transform="translate(-128,-171)"><use href="#wmark"/></g>`;
const stageSvg=(st,i)=>st==='final'?finalSvg:st.map(p=>`<polygon points="${p.map(q=>q.join(',')).join(' ')}" fill="${tint(i)}"/>`).join('');
const tg=document.getElementById('tgSvg'), film=document.getElementById('film');
tg.innerHTML=MK.map((st,i)=>`<g class="tg-stage${i===MK.length-1?' on':''}">${stageSvg(st,i)}</g>`).join('');
film.innerHTML=MK.map((st,i)=>`<button type="button" aria-label="Step ${i+1} of ${MK.length}" class="${i===MK.length-1?'on':''}"><svg viewBox="-140 -180 280 330">${stageSvg(st,i)}</svg></button>`).join('');
const tgStages=[...tg.children], filmBtns=[...film.children];
let tgCur=MK.length-1;
function showStage(k){if(k===tgCur)return;tgCur=k;tgStages.forEach((g,i)=>g.classList.toggle('on',i===k));filmBtns.forEach((b,i)=>b.classList.toggle('on',i===k));}


/* ---------- 3D mark: the same stages, extruded and morphed ---------- */
let tgT=MK.length-1, tgTarget=MK.length-1;
const M3=(function(){
  const box=document.getElementById('tangram');
  if(!window.THREE) return null;
  let renderer;
  try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});}catch(e){return null;}
  if(!renderer.getContext()) return null;
  renderer.setPixelRatio(Math.min(2.5,window.devicePixelRatio||1));
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;
  renderer.outputEncoding=THREE.sRGBEncoding;
  const cv=renderer.domElement; cv.setAttribute('aria-label','3D Woodhouse mark. Drag to spin.'); cv.setAttribute('role','img'); cv.tabIndex=0;
  box.appendChild(cv); box.classList.add('is3d');
  const scene=new THREE.Scene();
  const cam=new THREE.PerspectiveCamera(30,1,1,4000); cam.position.set(0,0,980);
  scene.add(new THREE.HemisphereLight(0xf2ead9,0x0a0f0f,.55));
  const key=new THREE.DirectionalLight(0xfff4e6,1.35); key.position.set(320,420,600); scene.add(key);
  const rim=new THREE.PointLight(0x89d8d0,1.6,1600); rim.position.set(-380,160,-260); scene.add(rim);
  const warm=new THREE.PointLight(0xe3a95c,.9,1400); warm.position.set(300,-320,300); scene.add(warm);

  /* stage geometry in the artwork's own coordinates (y down) */
  const tiny=(x,y)=>[[x,y-.8],[x+.8,y],[x,y+.8],[x-.8,y]];
  const fin=pts=>pts.map(p=>[p[0]-128,p[1]-171]);
  const leftHalf=fin([[0,0],[128,0],[128,128],[86,171],[86,85],[44,43],[44,213],[0,213]]);
  const rightHalf=fin([[128,0],[256,0],[256,213],[213,213],[213,43],[171,85],[171,171],[128,128]]);
  const tail=fin([[120,184],[137,184],[137,213],[213,213],[171,255],[171,340],[128,298],[86,340],[86,255],[44,213],[120,213]]);
  const S=MK.slice(0,6).map((st,i)=>{
    if(st.length===1) return [[[0,-84],[85,1],[-85,1]],[[-85,1],[85,1],[0,86]],tiny(0,40)];
    if(st.length===2) return [st[0],st[1],tiny(0,43)];
    return st;
  });
  S.push([leftHalf,rightHalf,tail]);
  const N=44;
  function norm(p){
    let a=0;for(let i=0;i<p.length;i++){const q=p[i],r=p[(i+1)%p.length];a+=q[0]*r[1]-r[0]*q[1];}
    if(a<0)p=p.slice().reverse();
    let k=0;p.forEach((q,i)=>{if(q[1]<p[k][1]-1e-6||(Math.abs(q[1]-p[k][1])<1e-6&&q[0]<p[k][0]))k=i;});
    return p.slice(k).concat(p.slice(0,k));
  }
  function resample(p){
    p=norm(p);const m=p.length,L=[];let tot=0;
    for(let i=0;i<m;i++){const a=p[i],b=p[(i+1)%m];const l=Math.hypot(b[0]-a[0],b[1]-a[1]);L.push(l);tot+=l;}
    const extra=N-m,c=L.map(l=>Math.floor(l/tot*extra));let rem=extra-c.reduce((x,y)=>x+y,0);
    while(rem-->0){let bi=0,bv=-1;L.forEach((l,i)=>{const v=l/(c[i]+1);if(v>bv){bv=v;bi=i;}});c[bi]++;}
    const out=[];for(let i=0;i<m;i++){const a=p[i],b=p[(i+1)%m];out.push(a);for(let j=1;j<=c[i];j++){const t=j/(c[i]+1);out.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);}}
    return out;
  }
  const R=S.map(st=>st.map(resample));
  const group=new THREE.Group(); scene.add(group);
  /* procedural oak: barrel stave grain, generated once */
  const woodCanvas=makeWoodCanvas;
  const maxAniso=renderer.capabilities.getMaxAnisotropy();
  const mkTex=(cvs,srgb)=>{const t=new THREE.CanvasTexture(cvs);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(1/300,1/300);t.anisotropy=maxAniso;if(srgb)t.encoding=THREE.sRGBEncoding;return t;};
  const woodTex=mkTex(woodCanvas(false),true), bumpTex=mkTex(woodCanvas(true),false);
  const tints=[0xffffff,0xe7d2b8,0xf6e6d0];
  const mats=tints.map((tc,i)=>{const m=new THREE.MeshPhysicalMaterial({color:tc,map:woodTex,bumpMap:bumpTex,bumpScale:.9,roughness:.42,metalness:0,clearcoat:.85,clearcoatRoughness:.18,sheen:0});return m;});
  const meshes=mats.map((m,i)=>{const me=new THREE.Mesh(new THREE.BufferGeometry(),m);me.position.z=i*.25-13;group.add(me);return me;});
  const ext={depth:26,bevelEnabled:true,bevelThickness:1.1,bevelSize:.9,bevelOffset:-.9,bevelSegments:4,curveSegments:1};
  function clean(p){
    const out=[];const n=p.length;
    for(let i=0;i<n;i++){const a=p[(i-1+n)%n],b=p[i],c=p[(i+1)%n];
      const cr=(b[0]-a[0])*(c[1]-b[1])-(b[1]-a[1])*(c[0]-b[0]);
      if(Math.hypot(b[0]-a[0],b[1]-a[1])<.05)continue;
      if(Math.abs(cr)<.02)continue;out.push(b);}
    return out.length>=3?out:p;
  }
  let lastT=-1;
  function build(t){
    const a=Math.min(R.length-2,Math.floor(t)),f0=Math.min(1,t-a),f=f0*f0*(3-2*f0);
    const atRest=f<.002||f>.998, rs=f>.5?a+1:a;
    for(let k=0;k<3;k++){
      let pts;
      if(atRest) pts=S[rs][k];
      else{const A=R[a][k],B=R[a+1][k];pts=A.map((p,i)=>[p[0]+(B[i][0]-p[0])*f,p[1]+(B[i][1]-p[1])*f]);}
      pts=clean(pts);
      const area=Math.abs(pts.reduce((s,p,i)=>{const q=pts[(i+1)%pts.length];return s+p[0]*q[1]-q[0]*p[1];},0))/2;
      meshes[k].visible=area>30;
      const sh=new THREE.Shape(pts.map(p=>new THREE.Vector2(p[0],-p[1])));
      const g=new THREE.ExtrudeGeometry(sh,meshes[k].visible?ext:{depth:26,bevelEnabled:false});
      meshes[k].geometry.dispose();meshes[k].geometry=g;
    }
  }
  /* interaction */
  let dragging=false,lx=0,ly=0,rotY=0,rotX=0,vY=0,hoverX=0,hoverY=0,lastInput=0;
  cv.addEventListener('pointerdown',e=>{dragging=true;lx=e.clientX;ly=e.clientY;vY=0;cv.setPointerCapture(e.pointerId);lastInput=performance.now();});
  cv.addEventListener('pointermove',e=>{
    const r=cv.getBoundingClientRect();hoverX=(e.clientX-r.left)/r.width-.5;hoverY=(e.clientY-r.top)/r.height-.5;
    if(!dragging)return;const dx=e.clientX-lx,dy=e.clientY-ly;lx=e.clientX;ly=e.clientY;
    vY=dx*.012;rotY+=vY;rotX=Math.max(-.6,Math.min(.6,rotX+dy*.006));lastInput=performance.now();
  });
  const end=()=>{dragging=false;};
  cv.addEventListener('pointerup',end);cv.addEventListener('pointercancel',end);
  cv.addEventListener('pointerleave',()=>{hoverX=hoverY=0;});
  cv.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){vY=-.12;}if(e.key==='ArrowRight'){vY=.12;}});
  function resize(){const w=box.clientWidth,h=box.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();}
  new ResizeObserver(resize).observe(box);resize();
  let visible=true,raf=0;const clock=new THREE.Clock();
  function frame(){
    const time=clock.getElapsedTime();
    tgT+=(tgTarget-tgT)*(reduce?1:.09);
    if(Math.abs(tgT-tgTarget)<.0005)tgT=tgTarget;
    if(Math.abs(tgT-lastT)>1e-4){build(tgT);lastT=tgT;}
    if(!dragging){rotY+=vY;vY*=.94;if(performance.now()-lastInput>2500){rotY*=.985;rotX*=.95;}}
    const morph=Math.sin((tgT%1)*Math.PI);
    group.rotation.y=rotY+(reduce?0:Math.sin(time*.6)*.28)+hoverX*.35+morph*.5;
    group.rotation.x=rotX+(reduce?0:Math.sin(time*.45)*.08)+hoverY*.25;
    group.position.y=reduce?0:Math.sin(time*.9)*6;
    renderer.render(scene,cam);
    if(visible&&!reduce)raf=requestAnimationFrame(frame);
  }
  new IntersectionObserver(es=>{visible=es[0].isIntersecting;if(visible&&!reduce){cancelAnimationFrame(raf);raf=requestAnimationFrame(frame);}}).observe(box);
  frame();
  return {kick(){if(reduce)frame();}};
})();
function setT(t){tgTarget=Math.max(0,Math.min(MK.length-1,t));showStage(Math.round(tgTarget));if(M3)M3.kick();}
let tgAuto=null;
function autoPlay(){if(reduce||tgAuto)return;let k=0;setT(0);tgAuto=setInterval(()=>{k=(k+1)%(MK.length+3);setT(Math.min(k,MK.length-1));},M3?1100:700);}
function stopAuto(){clearInterval(tgAuto);tgAuto=null;}
filmBtns.forEach((b,i)=>b.addEventListener('click',()=>{stopAuto();setT(i);}));

/* ---------- Home motion ---------- */
if(reduce||!hasGsap){if(!reduce)autoPlay();return;}
gsap.to('#wordmark',{yPercent:-30,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
gsap.to('#crest',{yPercent:18,rotation:8,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
gsap.to('#bubbles',{opacity:.2,scale:1.08,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
gsap.to('.hero-sub,.scroll-cue',{y:-60,opacity:.3,ease:'none',scrollTrigger:{trigger:'.hero',start:'30% top',end:'bottom top',scrub:true}});
gsap.from('.manifesto-foot p',{y:30,opacity:.3,stagger:.12,duration:1,ease:'power3.out',scrollTrigger:{trigger:'.manifesto-foot',start:'top 85%'}});
const mm=gsap.matchMedia();
mm.add('(min-width: 901px)',()=>{
  const steps=gsap.utils.toArray('.blend-step');
  steps.forEach((s,i)=>gsap.set(s,{opacity:i===0?1:0,y:i===0?0:40}));
  setT(0);
  const tl=gsap.timeline({scrollTrigger:{trigger:'#blend',start:'top top',end:'bottom bottom',scrub:1,
    onUpdate:self=>setT(Math.min(1,self.progress*1.15)*(MK.length-1))}});
  tl.to(steps[0],{opacity:0,y:-40,duration:.5},1.5).to(steps[1],{opacity:1,y:0,duration:.5},1.8)
    .to('.tangram svg',{scale:1.05,duration:.5,ease:'none'},2.6).to({},{duration:.6},2.9);
  const r=document.getElementById('evRail');
  const dist=()=>Math.max(0,r.scrollWidth-window.innerWidth);
  if(dist()>0)gsap.to(r,{x:()=>-dist(),ease:'none',scrollTrigger:{trigger:'#evPin',start:'top 18%',end:()=>'+='+dist(),pin:'#events',pinSpacing:true,scrub:1,invalidateOnRefresh:true,anticipatePin:1}});
});
mm.add('(max-width: 900px)',()=>{document.querySelectorAll('.blend-step').forEach(s=>s.style.opacity=1);autoPlay();return()=>stopAuto();});
})();

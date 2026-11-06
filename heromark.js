/* Woodhouse: home header mark. A person, arms up like the logo, spins and morphs into the oak W. */
(function(){
const box=document.getElementById('heroMark');
if(!box||!window.THREE)return;
const {reduce,makeWoodCanvas}=window.WH;
const SET={hold:1.2,turns:4,dur:2.4,ms:.25,me:.85,depth:34,idle:.45};

/* logo geometry (256 x 340, y down) */
const LOGO_OUTER=[[0,0],[256,0],[256,213],[213,213],[171,255],[171,340],[128,298],[86,340],[86,255],[44,213],[0,213]];
const LOGO_HOLE=[[44,43],[86,85],[86,171],[128,128],[171,171],[171,85],[213,43],[213,213],[137,213],[137,184],[120,184],[120,213],[44,213]];
const FINAL_A=[[0,0],[256,0],[256,213],[213,213],[213,43],[171,85],[171,171],[128,128],[86,171],[86,85],[44,43],[44,213],[0,213]];
const FINAL_B=[[120,184],[137,184],[137,213],[213,213],[171,255],[171,340],[128,298],[86,340],[86,255],[44,213],[120,213]];
const N=320;

const area=p=>p.reduce((s,q,i)=>{const r=p[(i+1)%p.length];return s+q[0]*r[1]-r[0]*q[1];},0)/2;
function rdp(pts,eps){
  if(pts.length<3)return pts;
  const a=pts[0],b=pts[pts.length-1];let md=0,mi=0;const dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy)||1;
  for(let i=1;i<pts.length-1;i++){const d=Math.abs(dy*pts[i][0]-dx*pts[i][1]+b[0]*a[1]-b[1]*a[0])/L;if(d>md){md=d;mi=i;}}
  if(md>eps){const l=rdp(pts.slice(0,mi+1),eps),r=rdp(pts.slice(mi),eps);return l.slice(0,-1).concat(r);}
  return [a,b];
}
function resample(p,n){
  const m=p.length,L=[];let tot=0;
  for(let i=0;i<m;i++){const a=p[i],b=p[(i+1)%m],l=Math.hypot(b[0]-a[0],b[1]-a[1]);L.push(l);tot+=l;}
  const out=[];let seg=0,acc=0;
  for(let k=0;k<n;k++){const target=k/n*tot;while(acc+L[seg]<target&&seg<m-1){acc+=L[seg];seg++;}
    const a=p[seg],b=p[(seg+1)%m],f=L[seg]?(target-acc)/L[seg]:0;out.push([a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f]);}
  return out;
}
function normalize(p){
  if(area(p)<0)p=p.slice().reverse();
  let minY=Infinity,cx=0;p.forEach(q=>{if(q[1]<minY)minY=q[1];cx+=q[0];});cx/=p.length;
  let k=0,best=Infinity;p.forEach((q,i)=>{const d=Math.hypot((q[0]-cx)*.6,q[1]-minY);if(d<best){best=d;k=i;}});
  return p.slice(k).concat(p.slice(0,k));
}
function trace(img){
  const W=360,H=Math.max(40,Math.round(W*img.naturalHeight/img.naturalWidth));
  const c=document.createElement('canvas');c.width=W+8;c.height=H+8;const x=c.getContext('2d',{willReadFrequently:true});
  x.filter='blur(1.4px)';x.drawImage(img,4,4,W,H);x.filter='none';
  const d=x.getImageData(0,0,c.width,c.height).data,w=c.width,h=c.height,m=new Uint8Array(w*h);
  /* transparent PNG: the opaque part is the figure */
  let clear=0;for(let i=0;i<w*h;i++)if(d[i*4+3]<40)clear++;
  if(clear>w*h*.15){for(let i=0;i<w*h;i++)m[i]=d[i*4+3]>110?1:0;}
  else{
    const L=new Float32Array(w*h),hist=new Array(256).fill(0);
    for(let i=0;i<w*h;i++){const a=d[i*4+3]/255;const l=(.299*d[i*4]+.587*d[i*4+1]+.114*d[i*4+2])*a+255*(1-a);L[i]=l;hist[l|0]++;}
    /* Otsu threshold */
    let sum=0;for(let i=0;i<256;i++)sum+=i*hist[i];let sB=0,wB=0,th=128,mx=0;
    for(let i=0;i<256;i++){wB+=hist[i];if(!wB)continue;const wF=w*h-wB;if(!wF)break;sB+=i*hist[i];const mB=sB/wB,mF=(sum-sB)/wF,v=wB*wF*(mB-mF)*(mB-mF);if(v>mx){mx=v;th=i;}}
    /* the figure is whichever side the photo's border is not */
    let edge=0,en=0;for(let X=4;X<w-4;X++){edge+=L[4*w+X]+L[(h-5)*w+X];en+=2;}for(let Y=4;Y<h-4;Y++){edge+=L[Y*w+4]+L[Y*w+w-5];en+=2;}
    const darkBg=edge/en<th;
    for(let i=0;i<w*h;i++)m[i]=(darkBg?L[i]>th:L[i]<=th)?1:0;
    for(let X=0;X<w;X++)for(let Y=0;Y<h;Y++)if(X<4||Y<4||X>=w-4||Y>=h-4)m[Y*w+X]=0;
  }
  const lab=new Int32Array(w*h);let best=0,bestN=0,id=0;
  for(let i=0;i<w*h;i++){if(!m[i]||lab[i])continue;id++;let n=0;const st=[i];lab[i]=id;
    while(st.length){const j=st.pop();n++;const xx=j%w,yy=(j/w)|0;
      [[1,0],[-1,0],[0,1],[0,-1]].forEach(([a,b])=>{const X=xx+a,Y=yy+b;if(X<0||Y<0||X>=w||Y>=h)return;const k=Y*w+X;if(m[k]&&!lab[k]){lab[k]=id;st.push(k);}});}
    if(n>bestN){bestN=n;best=id;}}
  if(!bestN)return null;
  for(let i=0;i<w*h;i++)m[i]=lab[i]===best?1:0;
  if(bestN<w*h*.02)return null;
  const D=[[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1]];
  const inside=(X,Y)=>X>=0&&Y>=0&&X<w&&Y<h&&m[Y*w+X];
  let s=0;while(!m[s])s++;
  const sx=s%w,sy=(s/w)|0;let cx=sx,cy=sy,bd=4;const pts=[[cx,cy]];
  for(let it=0;it<w*h*2;it++){let moved=false;
    for(let k=1;k<=8;k++){const nd=(bd+k)%8,nx=cx+D[nd][0],ny=cy+D[nd][1];
      if(inside(nx,ny)){const pb=(nd+7)%8,bx=cx+D[pb][0],by=cy+D[pb][1];cx=nx;cy=ny;bd=D.findIndex(q=>q[0]===bx-cx&&q[1]===by-cy);moved=true;break;}}
    if(!moved||(cx===sx&&cy===sy))break;pts.push([cx,cy]);}
  const half=Math.floor(pts.length/2);
  const poly=rdp(pts.slice(0,half+1),.9).slice(0,-1).concat(rdp(pts.slice(half).concat([pts[0]]),.9).slice(0,-1));
  let x0=Infinity,x1=-Infinity,y0=Infinity,y1=-Infinity;poly.forEach(q=>{x0=Math.min(x0,q[0]);x1=Math.max(x1,q[0]);y0=Math.min(y0,q[1]);y1=Math.max(y1,q[1]);});
  const sc=Math.min(420/(x1-x0),340/(y1-y0));
  return poly.map(q=>[128+(q[0]-(x0+x1)/2)*sc,170+(q[1]-(y0+y1)/2)*sc]);
}

/* renderer */
let R;try{R=new THREE.WebGLRenderer({antialias:true,alpha:true});}catch(e){return;}
if(!R.getContext())return;
R.setPixelRatio(Math.min(2.5,window.devicePixelRatio||1));R.outputEncoding=THREE.sRGBEncoding;R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1.15;
const cv=R.domElement;cv.setAttribute('role','img');cv.setAttribute('aria-label','A figure with raised arms spins and becomes the Woodhouse W mark in oak. Drag to spin.');
box.appendChild(cv);box.classList.add('is3d');
const scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(28,1,1,4000);cam.position.set(0,0,980);
scene.add(new THREE.HemisphereLight(0xf2ead9,0x0a0f0f,.6));
const key=new THREE.DirectionalLight(0xfff4e6,1.45);key.position.set(300,380,620);scene.add(key);
const rim=new THREE.PointLight(0x89d8d0,2,1600);rim.position.set(-360,120,-300);scene.add(rim);
const warm=new THREE.PointLight(0xe3a95c,.8,1400);warm.position.set(280,-300,320);scene.add(warm);
const ani=R.capabilities.getMaxAnisotropy();
const tex=(c,srgb)=>{const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(1/300,1/300);t.anisotropy=ani;if(srgb)t.encoding=THREE.sRGBEncoding;return t;};
const mat=new THREE.MeshPhysicalMaterial({map:tex(makeWoodCanvas(false),true),bumpMap:tex(makeWoodCanvas(true),false),bumpScale:.9,roughness:.4,clearcoat:.9,clearcoatRoughness:.16});
const group=new THREE.Group();scene.add(group);
const mesh=new THREE.Mesh(new THREE.BufferGeometry(),mat),finalA=new THREE.Mesh(new THREE.BufferGeometry(),mat),finalB=new THREE.Mesh(new THREE.BufferGeometry(),mat);
group.add(mesh,finalA,finalB);mesh.visible=false;
const P=q=>new THREE.Vector2(q[0]-128,-(q[1]-170));
const ext={depth:SET.depth,bevelEnabled:true,bevelThickness:1.3,bevelSize:1,bevelOffset:-1,bevelSegments:3,curveSegments:1};
function setGeo(m,shape){m.geometry.dispose();m.geometry=new THREE.ExtrudeGeometry(shape,ext);m.geometry.translate(0,0,-SET.depth/2);}
setGeo(finalA,new THREE.Shape(FINAL_A.map(P)));setGeo(finalB,new THREE.Shape(FINAL_B.map(P)));

const LOGO=normalize(resample(LOGO_OUTER,N));
const holeC=LOGO_HOLE.reduce((a,q)=>[a[0]+q[0]/LOGO_HOLE.length,a[1]+q[1]/LOGO_HOLE.length],[0,0]);
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
let SIL=null,lastMorph=-1;
function buildMorph(t){
  const f=ease(Math.max(0,Math.min(1,t)));
  const sh=new THREE.Shape(SIL.map((p,i)=>P([p[0]+(LOGO[i][0]-p[0])*f,p[1]+(LOGO[i][1]-p[1])*f])));
  const hs=Math.max(0,(f-.55)/.45);
  if(hs>.02){const k=(.15+.85*hs)*.985;sh.holes.push(new THREE.Path(LOGO_HOLE.map(q=>[holeC[0]+(q[0]-holeC[0])*k,holeC[1]+(q[1]-holeC[1])*k]).reverse().map(P)));}
  setGeo(mesh,sh);
}

/* timeline: person, fast spin + morph, then the slow idle turn */
let mode=reduce?'idle':'wait',t0=0,rot=reduce?.45:0,vel=0,drag=false,lx=0,last=0,base=0,hold=SET.hold;
const TAU=Math.PI*2;
function start(){if(mode!=='wait'||!SIL)return;mode='play';t0=performance.now();base=0;hold=SET.hold;}
function replay(h){if(!SIL||reduce)return;base=((rot%TAU)+TAU)%TAU;hold=h;mode='play';t0=performance.now();lastMorph=-1;vel=0;kick();}
function useImage(src,onDone){
  const im=new Image();
  im.onload=()=>{const poly=trace(im);const ok=poly&&poly.length>12;
    if(ok){SIL=normalize(resample(poly,N));if(mode==='wait'){mesh.visible=true;finalA.visible=finalB.visible=false;buildMorph(0);lastMorph=0;}}
    onDone&&onDone(ok);};
  im.onerror=()=>onDone&&onDone(false);
  im.src=src;
}
useImage('img/person-silhouette.png',ok=>{if(!ok)mode='idle';});

/* controls: they sit over the mark's own glow, so the header keeps its size */
const ui=document.createElement('div');ui.className='mark-ui';
ui.innerHTML='<button type="button" class="mark-btn" data-act="replay" aria-label="Replay the morph" data-tip="Replay"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.6-5.9"/><path d="M4 3.5V8h4.5"/></svg></button>'+
  '<button type="button" class="mark-btn" data-act="upload" aria-label="Morph your own silhouette into the W. Your photo stays on your device." data-tip="Your silhouette"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="7" r="3"/><path d="M6 21v-3.5A4.5 4.5 0 0 1 10.5 13h3a4.5 4.5 0 0 1 4.5 4.5V21"/><path d="M19 3v5M16.5 5.5h5"/></svg></button>'+
  '<input type="file" accept="image/*" hidden>';
const note=document.createElement('p');note.className='mark-note';note.setAttribute('aria-live','polite');
box.append(ui,note);
const file=ui.querySelector('input');let noteT=0;
function say(msg,ms){note.textContent=msg;note.classList.add('on');clearTimeout(noteT);if(ms)noteT=setTimeout(()=>note.classList.remove('on'),ms);}
ui.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b)return;
  if(b.dataset.act==='replay')replay(.5);else file.click();});
file.addEventListener('change',()=>{const f=file.files&&file.files[0];file.value='';if(!f)return;
  say('Tracing your shape');const url=URL.createObjectURL(f);
  useImage(url,ok=>{URL.revokeObjectURL(url);
    if(ok){say('There you are',1800);replay(1);}
    else say('No clear shape found. Try one figure against a plain background.',4200);});});
if(reduce)ui.hidden=true;

cv.addEventListener('pointerdown',e=>{drag=true;lx=e.clientX;cv.setPointerCapture(e.pointerId);last=performance.now();});
cv.addEventListener('pointermove',e=>{if(!drag)return;vel=(e.clientX-lx)*.014;rot+=vel;lx=e.clientX;last=performance.now();});
const up=()=>drag=false;cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
function resize(){const w=cv.clientWidth,h=cv.clientHeight;if(!w||!h)return;R.setSize(w,h,false);cam.aspect=w/h;cam.position.z=980*Math.max(1,1.1/cam.aspect);cam.updateProjectionMatrix();}
new ResizeObserver(resize).observe(box);resize();

let vis=true,raf=0;const clock=new THREE.Clock();
function kick(){if(vis&&!reduce){cancelAnimationFrame(raf);raf=requestAnimationFrame(frame);}}
function frame(){
  const dt=Math.min(.05,clock.getDelta()),t=clock.elapsedTime;
  if(mode==='wait'&&SIL&&t>.4)start();
  let morphT=1,spin=0,swell=0;
  if(mode==='wait'){morphT=0;}
  else if(mode==='play'){const el=(performance.now()-t0)/1000;
    const front=base>Math.PI?TAU:0;
    if(el<hold){morphT=0;spin=base+(front-base)*ease(Math.min(1,el/(hold*.7)));}
    else if(el<hold+SET.dur){const p=(el-hold)/SET.dur;spin=front+ease(p)*SET.turns*TAU;morphT=Math.max(0,Math.min(1,(p-SET.ms)/(SET.me-SET.ms)));swell=Math.sin(Math.PI*p);}
    else{mode='idle';rot=0;last=0;}}
  if(SIL&&mode!=='idle'){const fin=morphT>=1;mesh.visible=!fin;finalA.visible=finalB.visible=fin;
    if(!fin&&Math.abs(morphT-lastMorph)>.002){buildMorph(morphT);lastMorph=morphT;}}
  if(mode==='idle'){mesh.visible=false;finalA.visible=finalB.visible=true;
    if(!drag&&!reduce){rot+=vel;vel*=.95;if(performance.now()-last>1800)rot+=dt*SET.idle;}}
  group.rotation.y=mode==='play'?spin:mode==='wait'?0:rot;
  group.rotation.x=reduce?0:Math.sin(t*.7)*.05;
  group.position.y=(reduce?0:Math.sin(t*1.1)*5)+swell*14;
  const s=1+swell*.06;group.scale.set(s,s,s);
  ui.classList.toggle('ready',mode==='idle');
  R.render(scene,cam);
  if(vis&&!reduce)raf=requestAnimationFrame(frame);
}
new IntersectionObserver(es=>{vis=es[0].isIntersecting;if(vis){clock.getDelta();kick();}}).observe(box);
if(reduce)setTimeout(frame,300);
frame();
})();

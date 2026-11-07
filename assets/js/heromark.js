/* Woodhouse: home header mark. A person, arms up like the logo, spins and morphs into the oak W. */
(function(){
const box=document.getElementById('heroMark');
if(!box||!window.THREE)return;
const {reduce,makeWoodCanvas}=window.WH;
const SET={hold:1.2,turns:6,dur:5.2,ms:.06,me:.94,depth:34,idle:.45};

/* logo geometry (256 x 340, y down) */
const LOGO_OUTER=[[0,0],[256,0],[256,213],[213,213],[171,255],[171,340],[128,298],[86,340],[86,255],[44,213],[0,213]];
const LOGO_HOLE=[[44,43],[86,85],[86,171],[128,128],[171,171],[171,85],[213,43],[213,213],[137,213],[137,184],[120,184],[120,213],[44,213]];
const FINAL_A=[[0,0],[256,0],[256,213],[213,213],[213,43],[171,85],[171,171],[128,128],[86,171],[86,85],[44,43],[44,213],[0,213]];
const FINAL_B=[[120,184],[137,184],[137,213],[213,213],[171,255],[171,340],[128,298],[86,340],[86,255],[44,213],[120,213]];
const N=320;
/* the woman silhouette, pre-traced from img/person-silhouette.png so it never depends on image loading */
const SIL_DEFAULT=[[123.8,8.4],[129.7,10.7],[135.7,12.7],[142.1,13],[147.7,16.2],[151.5,21.5],[155.4,26.7],[158.2,32.1],[156.2,37.9],[158.8,43.9],[162.2,49.4],[166.5,54.3],[170,59.5],[170,66],[173.4,71.4],[174.3,77.6],[172,83.5],[168.8,89.2],[169.2,95.6],[169.8,102.1],[166.6,107.2],[167,113.2],[168.6,119.5],[165.1,123.7],[164.3,118],[161.3,114.3],[157.1,118.6],[154.6,124.6],[150.7,129.8],[148.6,135.6],[148.6,142.1],[148.6,148.6],[150.3,154.8],[153.7,160.2],[158.4,164.8],[164.2,167.5],[170.2,170.2],[176.6,170.3],[183.1,169.8],[189.6,169.4],[196.1,168.9],[202.6,168.4],[209.1,167.9],[215.3,169.7],[221.5,171.7],[227.6,173.8],[233.8,175.9],[240,177.8],[246.5,178.2],[253,178.5],[259.6,178.8],[266.1,179.1],[272.5,179.8],[278.9,181],[285.3,182.2],[291.7,183.5],[298.1,184.7],[304.1,183],[306.7,177.1],[306.7,170.6],[307.6,164.2],[308.8,157.8],[310,151.4],[311.2,145],[312.4,138.6],[313.6,132.2],[314.8,125.8],[315.2,119.3],[315.2,112.8],[315.2,106.2],[313.4,100.2],[310.5,94.3],[307.6,88.5],[306.7,82.2],[306.7,75.7],[306.7,69.2],[308.8,63.7],[313.8,59.6],[313.8,53],[313.8,46.5],[313.8,40],[314,33.6],[317,27.7],[322.1,25.5],[325.1,31.1],[325.6,37.5],[329.5,42.7],[330.4,49.1],[331.3,55.6],[332.2,62],[335,67.9],[335.2,74.4],[335.2,80.9],[335.2,87.4],[335.2,93.9],[335.2,100.5],[335.2,107],[335.2,113.5],[335.2,120],[335.2,126.5],[336,133],[337.1,139.4],[338,145.8],[338,152.4],[338,158.9],[338,165.4],[338,171.9],[338,178.4],[338,184.9],[337.5,191.4],[336.6,197.9],[335.6,204.3],[332.6,209.4],[327.2,213],[320.8,214.1],[314.3,214.8],[307.9,215.6],[301.4,216.3],[294.9,217.1],[288.4,217.7],[281.9,217.7],[275.4,217.7],[268.9,217.7],[262.4,217.7],[255.9,217.7],[249.4,217.1],[242.9,216.3],[236.5,215.4],[230,214.6],[223.5,213.7],[217.1,214.2],[210.7,215.5],[205.2,218.3],[201,223.3],[198.3,228.9],[197.9,235.4],[197.6,241.9],[197.2,248.4],[194.4,254],[190.6,259.3],[186.8,264.6],[184.5,270.6],[183,276.9],[181.4,283.2],[179.9,289.6],[178.9,296],[178.9,302.5],[179.7,309],[181.3,315.2],[183.7,321.3],[186,327.4],[184.2,331.6],[177.6,331.6],[171.1,331.6],[164.6,331.6],[158.1,331.6],[151.6,331.6],[145.1,331.6],[138.5,331.6],[132,331.6],[125.5,331.6],[119,331.6],[112.5,331.6],[106,331.6],[99.4,331.6],[92.9,331.6],[86.4,331.6],[79.9,331.6],[73.4,331.6],[69.3,328.8],[71.3,322.6],[73.2,316.3],[75.2,310.1],[75.8,303.7],[75.3,297.2],[74.8,290.7],[73.9,284.3],[72.4,278],[71,271.6],[68.3,265.8],[64.8,260.3],[61.3,254.8],[57.7,249.3],[56.1,243.1],[56.7,236.6],[57.3,230.1],[55.1,224.4],[51.2,219.2],[46.1,215.8],[39.7,214.7],[33.3,213.7],[26.8,214.1],[20.4,214.9],[13.9,215.8],[7.4,216.6],[1,217.5],[-5.5,217.7],[-12,217.7],[-18.6,217.7],[-25.1,217.7],[-31.6,217.7],[-38.1,217.2],[-44.5,216.4],[-51,215.7],[-57.5,214.9],[-64,214.2],[-70.4,213.4],[-75.9,209.9],[-79.5,205.2],[-80.4,198.7],[-81.4,192.3],[-82,185.8],[-82,179.3],[-82,172.8],[-82,166.2],[-82,159.7],[-82,153.2],[-82,146.7],[-81,140.3],[-79.9,133.8],[-79.2,127.4],[-79.2,120.9],[-79.2,114.4],[-79.2,107.8],[-79.2,101.3],[-79.2,94.8],[-79.2,88.3],[-79.2,81.8],[-79.2,75.3],[-78.9,68.8],[-76.8,62.6],[-74.8,56.4],[-74.1,49.9],[-73.2,43.5],[-69.8,37.9],[-69.2,31.6],[-65.4,26.4],[-61.8,27.1],[-58.5,32.8],[-57.8,39.1],[-57.8,45.6],[-57.8,52.1],[-57.8,58.6],[-53.9,63.5],[-50.7,67],[-50.7,73.6],[-50.7,80.1],[-50.7,86.6],[-52.9,92.6],[-55.8,98.4],[-58.7,104.2],[-59.2,110.6],[-59.2,117.2],[-59.2,123.7],[-58,130.1],[-56.8,136.5],[-55.6,142.9],[-54.4,149.3],[-53.2,155.7],[-52,162.1],[-50.8,168.5],[-50.7,175],[-49.1,180.9],[-44.3,184.8],[-37.9,183.6],[-31.5,182.4],[-25.1,181.2],[-18.7,179.9],[-12.2,179.1],[-5.7,178.8],[0.8,178.5],[7.3,178.2],[13.8,177.9],[20.1,176.4],[26.2,174.2],[32.3,171.9],[38.4,169.7],[44.6,167.9],[51.1,167.9],[57.7,167.9],[64.1,168.2],[70.3,170.2],[76.7,170.7],[83.3,170.7],[89.3,168.6],[95.3,166],[100.4,162],[104.1,156.9],[106.7,150.9],[107.4,144.5],[107.4,138],[106.9,131.6],[103.4,126.1],[99.9,120.6],[96.3,115.1],[92.3,114.6],[90.3,120.3],[90.1,126.6],[87.8,121.4],[89.5,115.4],[90.3,109.1],[86.9,105.9],[84.9,102.6],[85.4,96.1],[85.9,89.6],[83,84.1],[81.7,78],[84.1,72],[84.6,65.6],[84.9,59.2],[88.1,53.5],[91.8,48.2],[96.4,43.6],[96.2,37.6],[96.7,31.2],[97.9,24.9],[102.5,20.3],[108.4,17.7],[113.2,13.4],[117.3,8.4]];

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
function setGeo(m,shape){m.geometry.dispose();m.geometry=new THREE.ExtrudeGeometry(shape,ext);/* shape may be an array of pieces */m.geometry.translate(0,0,-SET.depth/2);}
setGeo(finalA,new THREE.Shape(FINAL_A.map(P)));setGeo(finalB,new THREE.Shape(FINAL_B.map(P)));

const LOGO=normalize(resample(LOGO_OUTER,N));
const holeC=LOGO_HOLE.reduce((a,q)=>[a[0]+q[0]/LOGO_HOLE.length,a[1]+q[1]/LOGO_HOLE.length],[0,0]);
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
let SIL=null,lastMorph=-1;
/* morph path: the woman, then every stage of the tangram progression, then the W.
   Each step is three pieces; pieces that don't exist yet start as tiny diamonds and grow. */
const NP=200;
const ART=pts=>pts.map(q=>[q[0]+128,q[1]+171]);
const tinyAt=(x,y)=>[[x,y-1.2],[x+1.2,y],[x,y+1.2],[x-1.2,y]];
const STAGES=[
  [[[0,-84],[85,1],[-85,1]],[[-85,1],[85,1],[0,86]],[[0,39],[1,40],[0,41],[-1,40]]],
  [[[0,-88],[85,-3],[-85,-3]],[[-85,4],[85,4],[0,89]],[[0,42],[1,43],[0,44],[-1,43]]],
  [[[-85,-85],[85,-85],[0,0]],[[0,0],[85,85],[-85,85]],[[0,42],[1,43],[0,44],[-1,43]]],
  [[[-85,-86],[0,-1],[-85,84]],[[85,-86],[85,84],[0,-1]],[[0,42],[1,43],[0,44],[-1,43]]],
  [[[-85,-87],[-43,-45],[-43,41],[-85,83]],[[85,-87],[85,83],[43,41],[43,-45]],[[0,42],[1,43],[0,44],[-1,43]]],
  [[[-85,-134],[-42,-91],[-42,-8],[-85,36]],[[85,-134],[85,36],[43,-8],[43,-91]],[[0,-42],[85,43],[0,128],[-85,43]]]
].map(st=>st.map(ART));
const W_PIECES=[[[0,0],[128,0],[128,128],[86,171],[86,85],[44,43],[44,213],[0,213]],[[128,0],[256,0],[256,213],[213,213],[213,43],[171,85],[171,171],[128,128]],FINAL_B];
const prep=p=>normalize(resample(p,NP));
let KEYS=null;
function buildKeys(){
  const c=SIL.reduce((a,q)=>[a[0]+q[0]/SIL.length,a[1]+q[1]/SIL.length],[0,0]);
  KEYS=[[SIL,tinyAt(c[0],c[1]-30),tinyAt(c[0],c[1]+40)]].concat(STAGES,[W_PIECES]).map(k=>k.map(prep));
}
function buildMorph(t){
  if(!KEYS)buildKeys();
  const S=KEYS.length-1,m=Math.max(0,Math.min(1,t))*S,i=Math.min(S-1,Math.floor(m));
  /* each shape settles for a beat before the next one starts */
  const f=ease(Math.max(0,Math.min(1,(m-i-.12)/.76)));
  const A=KEYS[i],B=KEYS[i+1];
  const shapes=A.map((pa,j)=>{const pb=B[j];return new THREE.Shape(pa.map((p,k)=>P([p[0]+(pb[k][0]-p[0])*f,p[1]+(pb[k][1]-p[1])*f])));});
  setGeo(mesh,shapes);
}

/* timeline: person, fast spin + morph, then the slow idle turn */
let mode=reduce?'idle':'wait',t0=0,rot=reduce?.45:0,vel=0,drag=false,lx=0,last=0,base=0,hold=SET.hold;
const TAU=Math.PI*2;
function start(){if(mode!=='wait'||!SIL)return;mode='play';t0=performance.now();base=0;hold=SET.hold;}
function replay(h){if(!SIL)return;base=((rot%TAU)+TAU)%TAU;hold=h;mode='play';t0=performance.now();lastMorph=-1;vel=0;kick();}
function useImage(src,onDone){
  const im=new Image();
  im.onload=()=>{let poly=null;try{poly=trace(im);}catch(e){}const ok=poly&&poly.length>12;
    if(ok){SIL=normalize(resample(poly,N));KEYS=null;if(mode==='wait'){mesh.visible=true;finalA.visible=finalB.visible=false;buildMorph(0);lastMorph=0;}}
    onDone&&onDone(ok);};
  im.onerror=()=>onDone&&onDone(false);
  im.src=src;
}
SIL=SIL_DEFAULT;if(mode==='wait'){mesh.visible=true;finalA.visible=finalB.visible=false;buildMorph(0);lastMorph=0;}

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

cv.addEventListener('pointerdown',e=>{drag=true;lx=e.clientX;cv.setPointerCapture(e.pointerId);last=performance.now();});
cv.addEventListener('pointermove',e=>{if(!drag)return;vel=(e.clientX-lx)*.014;rot+=vel;lx=e.clientX;last=performance.now();});
const up=()=>drag=false;cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
function resize(){const w=cv.clientWidth,h=cv.clientHeight;if(!w||!h)return;R.setSize(w,h,false);cam.aspect=w/h;cam.position.z=980*Math.max(1,1.1/cam.aspect);cam.updateProjectionMatrix();}
new ResizeObserver(resize).observe(box);resize();

let vis=true,raf=0;const clock=new THREE.Clock();
function kick(){if(vis){cancelAnimationFrame(raf);raf=requestAnimationFrame(frame);}}
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
  if(vis&&(!reduce||mode==='play'))raf=requestAnimationFrame(frame);
}
new IntersectionObserver(es=>{vis=es[0].isIntersecting;if(vis){clock.getDelta();kick();}}).observe(box);
if(reduce)setTimeout(frame,300);
frame();
})();

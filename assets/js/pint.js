/* Woodhouse: interactive 3D pint. Spin it, tip it, spill it, pour another. */
(function(){
const stage=document.getElementById('pintStage');
if(!stage)return;
const {reduce,makeWoodCanvas}=window.WH;
if(!window.THREE){stage.insertAdjacentHTML('beforeend','<div class="fallback">3D needs WebGL</div>');return;}
let R;try{R=new THREE.WebGLRenderer({antialias:true,alpha:true});}catch(e){R=null;}
if(!R||!R.getContext()){stage.insertAdjacentHTML('beforeend','<div class="fallback">3D needs WebGL</div>');return;}
R.setPixelRatio(Math.min(2,window.devicePixelRatio||1));
R.outputEncoding=THREE.sRGBEncoding;R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=.95;
R.localClippingEnabled=true;R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;
const cv=R.domElement;cv.setAttribute('role','img');cv.setAttribute('aria-label','A 3D Woodhouse pint glass. Drag to spin and tip it.');
stage.insertBefore(cv,stage.firstChild);

const scene=new THREE.Scene();
const cam=new THREE.PerspectiveCamera(30,1,1,4000);cam.position.set(0,118,360);cam.lookAt(0,58,0);

/* studio reflections */
const pm=new THREE.PMREMGenerator(R),env=new THREE.Scene();
env.add(new THREE.Mesh(new THREE.BoxGeometry(900,500,900),new THREE.MeshBasicMaterial({color:0x0c1211,side:THREE.BackSide})));
[[-300,120,160,10,260,260,0xffffff],[320,90,40,10,180,360,0xffe3b8],[0,240,0,520,10,220,0xdfeeed],[0,80,-440,400,120,10,0x89d8d0]].forEach(p=>{
  const m=new THREE.Mesh(new THREE.BoxGeometry(p[3],p[4],p[5]),new THREE.MeshBasicMaterial({color:p[6]}));m.position.set(p[0],p[1],p[2]);env.add(m);});
scene.environment=pm.fromScene(env,.03).texture;
scene.add(new THREE.HemisphereLight(0xeaf3f1,0x0a0f0f,.45));
const key=new THREE.DirectionalLight(0xfff2de,1.25);key.position.set(-160,320,220);key.castShadow=true;
key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-160,right:160,top:160,bottom:-160,near:50,far:900});key.shadow.bias=-.0005;scene.add(key);
const rim=new THREE.PointLight(0x89d8d0,1.3,900);rim.position.set(180,160,-160);scene.add(rim);
const warmBack=new THREE.PointLight(0xffb45c,.9,700);warmBack.position.set(-60,70,-140);scene.add(warmBack);

/* oak bar top */
const ani=R.capabilities.getMaxAnisotropy();
const woodTex=new THREE.CanvasTexture(makeWoodCanvas(false));woodTex.encoding=THREE.sRGBEncoding;woodTex.wrapS=woodTex.wrapT=THREE.RepeatWrapping;woodTex.repeat.set(2.2,.9);woodTex.rotation=Math.PI/2;woodTex.anisotropy=ani;
const bumpTex=new THREE.CanvasTexture(makeWoodCanvas(true));bumpTex.wrapS=bumpTex.wrapT=THREE.RepeatWrapping;bumpTex.repeat.copy(woodTex.repeat);bumpTex.rotation=Math.PI/2;
const BAR_Y=-26;
const bar=new THREE.Mesh(new THREE.BoxGeometry(900,14,300),new THREE.MeshPhysicalMaterial({map:woodTex,bumpMap:bumpTex,bumpScale:.6,roughness:.5,clearcoat:.5,clearcoatRoughness:.35,color:0x7d5e46}));
bar.position.set(0,BAR_Y-7,-20);bar.receiveShadow=true;scene.add(bar);

/* glass geometry: tapered pint, 121 units tall */
const H=120,RB=29.5,RT=38,WALL=2.3,BASE=8;
const rAt=y=>RB+(RT-RB)*(y/H);
const V=(x,y)=>new THREE.Vector2(x,y);
const glassProfile=[V(0,BASE),V(rAt(BASE)-WALL,BASE),V(RT-WALL,H),V(RT-WALL*.5,H+1.1),V(RT,H),V(RB+.2,1.6),V(RB-1.2,0),V(0,0)];
const glassMat=new THREE.MeshPhysicalMaterial({color:0xffffff,metalness:0,roughness:.03,transparent:true,opacity:.09,clearcoat:1,clearcoatRoughness:.02,envMapIntensity:1.4,side:THREE.DoubleSide,depthWrite:false});
const glass=new THREE.Mesh(new THREE.LatheGeometry(glassProfile,96),glassMat);glass.renderOrder=10;glass.castShadow=true;
const rimRing=new THREE.Mesh(new THREE.TorusGeometry(RT-WALL*.5,1.15,10,96),new THREE.MeshPhysicalMaterial({color:0xffffff,roughness:.02,transparent:true,opacity:.42,envMapIntensity:2,depthWrite:false}));
rimRing.rotation.x=Math.PI/2;rimRing.position.y=H+.2;rimRing.renderOrder=11;
const baseDisc=new THREE.Mesh(new THREE.CylinderGeometry(rAt(BASE)-WALL,RB-1,BASE,64),new THREE.MeshPhysicalMaterial({color:0xe9f2f0,roughness:.05,transparent:true,opacity:.35,envMapIntensity:1.8,depthWrite:false}));
baseDisc.position.y=BASE/2;baseDisc.renderOrder=9;

/* printed logo decal (white, like the real Woodhouse glass) */
const DY0=26,DY1=108;
const decalCanvas=document.createElement('canvas');decalCanvas.width=2048;decalCanvas.height=Math.round(2048*(DY1-DY0)/(2*Math.PI*rAt((DY0+DY1)/2)));
const decalTex=new THREE.CanvasTexture(decalCanvas);decalTex.encoding=THREE.sRGBEncoding;decalTex.anisotropy=ani;decalTex.wrapS=THREE.RepeatWrapping;
function drawDecal(wordImg){
  const c=decalCanvas.getContext('2d'),W=decalCanvas.width,Hh=decalCanvas.height;c.clearRect(0,0,W,Hh);
  const pxu=W/(2*Math.PI*rAt((DY0+DY1)/2));            /* px per world unit */
  const cx=W*.5,markH=52*pxu,markW=markH*256/340;
  c.save();c.translate(cx-markW/2,Hh*.27);c.scale(markW/256,markH/340);
  c.fillStyle='rgba(255,255,255,.94)';
  c.fill(new Path2D('M0 0H256V213H0Z M44 43L86 85V171L128 128L171 171V85L213 43V213H137V184H120V213H44Z'),'evenodd');
  c.fill(new Path2D('M44 213L86 255L86 340L128 298L171 340L171 255L213 213Z'));c.restore();
  if(wordImg){const ww=44*pxu,wh=ww*233/2113;c.globalAlpha=.94;c.drawImage(wordImg,cx-ww/2,Hh*.27-wh-4.5*pxu,ww,wh);c.globalAlpha=1;}
  c.fillStyle='rgba(255,255,255,.85)';c.font=`500 ${Math.round(3.3*pxu)}px Jost, Futura, "Century Gothic", sans-serif`;c.textAlign='center';
  c.letterSpacing='4px';c.fillText('SANTA CRUZ, CALIFORNIA',cx,Hh*.27+markH+6*pxu);
  decalTex.needsUpdate=true;
}
drawDecal(null);
const wImg=new Image();wImg.onload=()=>drawDecal(wImg);wImg.src='img/wordmark.png';
const decal=new THREE.Mesh(new THREE.LatheGeometry([V(rAt(DY0)+.25,DY0),V(rAt(DY1)+.25,DY1)],128),
  new THREE.MeshBasicMaterial({map:decalTex,transparent:true,opacity:.95,depthWrite:false,side:THREE.FrontSide}));
decal.rotation.y=Math.PI;decal.renderOrder=12;

/* beer + foam: one solid, cut by world-space clipping planes so the surface stays level */
const BEERS={
  light:{c:0xe0a015,foam:0xf8efd8,op:.9,headMax:12},
  hazy:{c:0xeba232,foam:0xfbf1dc,op:.97,headMax:15},
  porter:{c:0x3a1a0a,foam:0xd8b48a,op:1,headMax:13},
  sour:{c:0xb8322a,foam:0xf6d9d0,op:.92,headMax:7}
};
let beer=BEERS.light;
/* ---- realism: beer depth gradient, bubbly foam, condensation ---- */
const mix=(a,b,t)=>a+(b-a)*t;
function beerCanvas(hex){const c=document.createElement('canvas');c.width=64;c.height=512;const g=c.getContext('2d');
  const col=new THREE.Color(hex),r=col.r*255,gg=col.g*255,b=col.b*255;
  const shade=(k,lift)=>`rgb(${Math.round(Math.min(255,mix(r*k,255,lift)))},${Math.round(Math.min(255,mix(gg*k,235,lift)))},${Math.round(Math.min(255,mix(b*k,170,lift)))})`;
  /* lathe v runs bottom (0) to top (1); the wall sits in the middle third */
  const gr=g.createLinearGradient(0,512,0,0);
  gr.addColorStop(0,shade(.45,0));gr.addColorStop(.34,shade(.55,0));gr.addColorStop(.45,shade(.85,0));gr.addColorStop(.58,shade(1,.06));gr.addColorStop(.66,shade(1.05,.16));gr.addColorStop(1,shade(1.05,.16));
  g.fillStyle=gr;g.fillRect(0,0,64,512);
  /* faint rising streaks of carbonation */
  for(let i=0;i<26;i++){const x=Math.random()*64;g.fillStyle=`rgba(255,248,220,${.03+Math.random()*.05})`;g.fillRect(x,170,.8,170);}
  return c;}
function foamCanvas(hex){const c=document.createElement('canvas');c.width=c.height=512;const g=c.getContext('2d');
  g.fillStyle=new THREE.Color(hex).getStyle();g.fillRect(0,0,512,512);
  for(let i=0;i<2600;i++){const x=Math.random()*512,y=Math.random()*512,rr=Math.random()<.9?1+Math.random()*4:4+Math.random()*9;
    const rg=g.createRadialGradient(x-rr*.3,y-rr*.3,0,x,y,rr);rg.addColorStop(0,'rgba(255,255,255,.95)');rg.addColorStop(.6,'rgba(255,252,244,.35)');rg.addColorStop(.92,'rgba(120,96,60,.28)');rg.addColorStop(1,'rgba(120,96,60,0)');
    g.fillStyle=rg;g.beginPath();g.arc(x,y,rr,0,7);g.fill();}
  return c;}
function dropsCanvas(){const c=document.createElement('canvas');c.width=1024;c.height=512;const g=c.getContext('2d');
  for(let i=0;i<1700;i++){const x=Math.random()*1024,y=40+Math.random()*450,rr=Math.random()<.85?.6+Math.random()*1.8:2+Math.random()*3.5;
    g.fillStyle='rgba(255,255,255,.10)';g.beginPath();g.ellipse(x,y,rr,rr*1.15,0,0,7);g.fill();
    g.fillStyle='rgba(255,255,255,.75)';g.beginPath();g.arc(x-rr*.35,y-rr*.4,Math.max(.4,rr*.32),0,7);g.fill();}
  /* a few runs where drops have slid down */
  for(let i=0;i<14;i++){const x=Math.random()*1024,y=80+Math.random()*250,l=60+Math.random()*160;g.fillStyle='rgba(255,255,255,.09)';g.fillRect(x,y,2.2,l);g.fillStyle='rgba(255,255,255,.6)';g.beginPath();g.arc(x+1,y+l,2.4,0,7);g.fill();}
  return c;}
const beerTex=new THREE.CanvasTexture(beerCanvas(BEERS.light.c));beerTex.encoding=THREE.sRGBEncoding;
const foamTex=new THREE.CanvasTexture(foamCanvas(BEERS.light.foam));foamTex.encoding=THREE.sRGBEncoding;foamTex.wrapS=foamTex.wrapT=THREE.RepeatWrapping;foamTex.repeat.set(8,12);
const foamBump=new THREE.CanvasTexture(foamCanvas('#808080'));foamBump.wrapS=foamBump.wrapT=THREE.RepeatWrapping;foamBump.repeat.copy(foamTex.repeat);
const capTex=foamTex.clone();capTex.needsUpdate=true;capTex.repeat.set(2.6,2.6);
const capBump=foamBump.clone();capBump.needsUpdate=true;capBump.repeat.set(2.6,2.6);
const IN=[V(0,BASE+.5),V(rAt(BASE)-WALL-.4,BASE+.5),V(RT-WALL-.45,H-.4),V(0,H-.4)];
const clipTop=new THREE.Plane(new THREE.Vector3(0,-1,0),0),clipFoamLo=new THREE.Plane(new THREE.Vector3(0,1,0),0),clipBeerTop=new THREE.Plane(new THREE.Vector3(0,-1,0),0);
const beerMat=new THREE.MeshPhysicalMaterial({color:0xffffff,map:beerTex,roughness:.06,clearcoat:1,clearcoatRoughness:.04,envMapIntensity:1.25,transparent:false,side:THREE.DoubleSide,clippingPlanes:[clipBeerTop],emissive:0xffffff,emissiveMap:beerTex,emissiveIntensity:.32,depthWrite:true});
const foamMat=new THREE.MeshStandardMaterial({color:0xffffff,map:foamTex,bumpMap:foamBump,bumpScale:.9,roughness:.88,side:THREE.DoubleSide,clippingPlanes:[clipTop,clipFoamLo]});
const liquidGeo=new THREE.LatheGeometry(IN,72);
const beerMesh=new THREE.Mesh(liquidGeo,beerMat),foamMesh=new THREE.Mesh(liquidGeo,foamMat);
beerMesh.renderOrder=2;foamMesh.renderOrder=3;
/* surface cap (an ellipse that tracks the level when tipped) */
const capMat=new THREE.MeshStandardMaterial({color:0xffffff,map:capTex,bumpMap:capBump,bumpScale:1.1,roughness:.85,side:THREE.DoubleSide});
const cap=new THREE.Mesh(new THREE.CircleGeometry(1,64),capMat);cap.renderOrder=4;scene.add(cap);

/* bubbles */
const NB=140,bPos=new Float32Array(NB*3),bSeed=[];
for(let i=0;i<NB;i++){bSeed.push({a:Math.random()*6.283,r:Math.sqrt(Math.random())*.82,v:12+Math.random()*26});bPos[i*3+1]=BASE+Math.random()*100;}
const bGeo=new THREE.BufferGeometry();bGeo.setAttribute('position',new THREE.BufferAttribute(bPos,3));
const bubbles=new THREE.Points(bGeo,new THREE.PointsMaterial({color:0xfff8e6,size:1.5,transparent:true,opacity:.7,depthWrite:false,clippingPlanes:[clipBeerTop]}));bubbles.renderOrder=5;

const dropTex=new THREE.CanvasTexture(dropsCanvas());dropTex.encoding=THREE.sRGBEncoding;dropTex.wrapS=THREE.RepeatWrapping;dropTex.repeat.set(2,1);dropTex.anisotropy=ani;
const condense=new THREE.Mesh(new THREE.LatheGeometry([V(rAt(6)+.35,6),V(rAt(112)+.35,112)],128),
  new THREE.MeshBasicMaterial({map:dropTex,transparent:true,opacity:.55,depthWrite:false,blending:THREE.AdditiveBlending}));condense.renderOrder=13;
/* hierarchy: tilt (world z) > spin (local y) */
const tiltG=new THREE.Group(),spinG=new THREE.Group();
tiltG.position.set(0,60,0);spinG.position.set(0,-60,0);
spinG.add(beerMesh,foamMesh,bubbles,baseDisc,glass,rimRing,decal,condense);tiltG.add(spinG);scene.add(tiltG);

/* soft contact shadow + puddle on the bar */
const sh=document.createElement('canvas');sh.width=sh.height=128;{const g=sh.getContext('2d'),rg=g.createRadialGradient(64,64,0,64,64,64);rg.addColorStop(0,'rgba(0,0,0,.55)');rg.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=rg;g.fillRect(0,0,128,128);}
const shadow=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(sh),transparent:true,depthWrite:false}));
shadow.rotation.x=-Math.PI/2;shadow.position.y=BAR_Y+.2;scene.add(shadow);
const puddleMat=new THREE.MeshPhysicalMaterial({color:beer.c,roughness:.05,clearcoat:1,transparent:true,opacity:.0,depthWrite:false});
const puddle=new THREE.Mesh(new THREE.CircleGeometry(1,48),puddleMat);puddle.rotation.x=-Math.PI/2;puddle.position.set(70,BAR_Y+.35,10);puddle.scale.set(.01,.01,.01);scene.add(puddle);
let puddleVol=0,puddleX=70;

/* spill droplets */
const ND=900,dPos=new Float32Array(ND*3),dVel=new Float32Array(ND*3),dLife=new Float32Array(ND);let dHead=0;
for(let i=0;i<ND;i++)dPos[i*3+1]=-9999;
const dGeo=new THREE.BufferGeometry();dGeo.setAttribute('position',new THREE.BufferAttribute(dPos,3));
const drops=new THREE.Points(dGeo,new THREE.PointsMaterial({color:beer.c,size:3.2,transparent:true,opacity:.9,depthWrite:false}));drops.frustumCulled=false;scene.add(drops);
/* pour stream from the tap */
const stream=new THREE.Mesh(new THREE.CylinderGeometry(2.1,2.6,1,16,1,true),new THREE.MeshPhysicalMaterial({color:beer.c,roughness:.1,transparent:true,opacity:.85,emissive:beer.c,emissiveIntensity:.2}));
stream.visible=false;scene.add(stream);

const lin=h=>new THREE.Color(h).convertSRGBToLinear();
function setBeer(name){
  beer=BEERS[name]||BEERS.light;
  const bc=lin(beer.c),fc=lin(beer.foam);
  [puddleMat,drops.material,stream.material].forEach(m=>m.color.copy(bc));
  stream.material.emissive.copy(bc);
  beerTex.image=beerCanvas(beer.c);beerTex.needsUpdate=true;
  const fcv=foamCanvas(beer.foam);foamTex.image=fcv;foamTex.needsUpdate=true;capTex.image=fcv;capTex.needsUpdate=true;
  baseDisc.material.color.copy(bc).lerp(new THREE.Color(1,1,1),.55);
}

setBeer('light');
/* state */
const LMIN=BASE+.5,LMAX=H-1.2;
let level=LMAX-2,foam=11,foamTarget=7,spin=.5,spinV=0,tilt=0,tiltTarget=0,pouring=0,pints=1,emptyShown=false;
const countEl=document.getElementById('pintCount'),toast=document.getElementById('pintToast');
const slider=document.getElementById('tilt');
const showToast=t=>{toast.textContent=t;toast.classList.add('show');clearTimeout(showToast.t);showToast.t=setTimeout(()=>toast.classList.remove('show'),2600);};

/* input */
let drag=null,lastIn=0;
cv.style.touchAction='pan-y';
cv.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,touch:e.pointerType==='touch',t0:tiltTarget};cv.setPointerCapture(e.pointerId);lastIn=performance.now();});
cv.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x;drag.x=e.clientX;spinV=dx*.012;spin+=spinV;
  if(!drag.touch){const dy=e.clientY-drag.y;tiltTarget=Math.max(0,Math.min(1.95,drag.t0+dy*.011));slider.value=Math.round(tiltTarget/1.95*100);}lastIn=performance.now();});
const release=()=>{if(!drag)return;const wasMouse=!drag.touch;drag=null;if(wasMouse){tiltTarget=0;slider.value=0;}};
cv.addEventListener('pointerup',release);cv.addEventListener('pointercancel',release);
slider.addEventListener('input',()=>{tiltTarget=slider.value/100*1.95;lastIn=performance.now();});
document.getElementById('spinBtn').addEventListener('click',()=>{spinV=.42;lastIn=performance.now();});
function pour(){tiltTarget=0;slider.value=0;pouring=1;emptyShown=false;foamTarget=beer.headMax;foam=Math.min(foam,2);
  pints++;countEl.textContent=pints;}
document.getElementById('pourBtn').addEventListener('click',pour);
document.querySelectorAll('#beerSeg button').forEach(b=>b.addEventListener('click',()=>{
  document.querySelectorAll('#beerSeg button').forEach(x=>x.setAttribute('aria-pressed',x===b?'true':'false'));
  setBeer(b.dataset.beer);level=LMIN;foam=0;pour();}));

function resize(){const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;R.setSize(w,h,false);cam.aspect=w/h;
  const d=360*Math.max(1,1/cam.aspect*1.02);cam.position.set(0,118*d/360,d);cam.lookAt(0,58,0);cam.updateProjectionMatrix();}
new ResizeObserver(resize).observe(stage);resize();

const tmp=new THREE.Vector3(),tmp2=new THREE.Vector3(),up=new THREE.Vector3(0,1,0);
let vis=false,raf=0;const clock=new THREE.Clock();
function emit(n,from){
  for(let k=0;k<n;k++){const i=dHead;dHead=(dHead+1)%ND;
    dPos[i*3]=from.x+(Math.random()-.5)*4;dPos[i*3+1]=from.y+(Math.random()-.5)*2;dPos[i*3+2]=from.z+(Math.random()-.5)*14;
    dVel[i*3]=28+Math.random()*40;dVel[i*3+1]=-8+Math.random()*18;dVel[i*3+2]=(Math.random()-.5)*16;dLife[i]=1;}
}
function frame(){
  const dt=Math.min(.05,clock.getDelta()),t=clock.elapsedTime;
  /* spin + idle drift */
  if(!drag){spin+=spinV;spinV*=.95;if(performance.now()-lastIn>2500&&!reduce)spin+=dt*.35;}
  tilt+=(tiltTarget-tilt)*Math.min(1,dt*(drag?14:5));
  spinG.rotation.y=spin;tiltG.rotation.z=-tilt;
  tiltG.position.y=60+(reduce?0:Math.sin(t*1.3)*1.6);
  tiltG.updateMatrixWorld(true);

  /* pouring */
  if(pouring){
    level=Math.min(LMAX,level+dt*48);foam=Math.min(beer.headMax,foam+dt*9);
    stream.visible=true;const top=tmp.set(0,level,0);spinG.localToWorld(top);
    const y0=260,y1=top.y;stream.scale.set(1,y0-y1,1);stream.position.set(0,(y0+y1)/2,0);
    if(level>=LMAX-.5){pouring=0;stream.visible=false;foamTarget=Math.max(5,beer.headMax*.6);}
  } else foam+=(foamTarget-foam)*dt*.25;

  /* spill: plane through axis at "level" must stay below the downhill rim */
  const th=tilt;
  let lmax=th<1.45?H-RT*Math.tan(th):LMIN;
  lmax=Math.max(LMIN,lmax);
  if(level>lmax&&!pouring){
    const spilled=level-lmax;level=lmax;
    const lip=tiltG.localToWorld(tmp2.set(RT*.98,H-60+.5,0));
    emit(Math.min(40,Math.ceil(spilled*9)),lip);
    puddleVol+=spilled;puddleX=lip.x+30;
    if(foam>0)foam=Math.max(0,foam-spilled*.5);
  }
  if(level<=LMIN+.6&&!emptyShown&&!pouring){emptyShown=true;showToast('Cheers. Pour another?');}

  /* surface */
  const axisPt=spinG.localToWorld(tmp.set(0,level,0));
  const sY=axisPt.y,f=Math.min(foam,Math.max(0,level-LMIN));
  clipTop.constant=sY;clipBeerTop.constant=sY-f;clipFoamLo.constant=-(sY-f);
  const has=level>LMIN+.3;
  beerMesh.visible=foamMesh.visible=bubbles.visible=has;cap.visible=has;
  const cosT=Math.max(.12,Math.cos(th)),rr=rAt(level)-WALL-.5;
  cap.position.copy(axisPt);cap.rotation.set(-Math.PI/2,0,0);cap.scale.set(rr*.96/cosT,rr*.96,1);
  if(f>.6){capMat.map=capTex;capMat.bumpMap=capBump;capMat.color.set(0xffffff);}else{capMat.map=null;capMat.bumpMap=null;capMat.color.copy(lin(beer.c));}capMat.needsUpdate=capMat._f!==(f>.6);capMat._f=f>.6;
  /* keep the cap inside the glass when tipped steeply */
  cap.visible=has&&th<.95;

  /* bubbles rise inside the beer */
  if(has&&!reduce){for(let i=0;i<NB;i++){const s=bSeed[i];let y=bPos[i*3+1]+s.v*dt;if(y>level-f)y=BASE+1;
    const r=(rAt(y)-WALL-1.5)*s.r;bPos[i*3]=Math.sin(s.a+y*.03)*r;bPos[i*3+2]=Math.cos(s.a+y*.03)*r;bPos[i*3+1]=y;}
    bGeo.attributes.position.needsUpdate=true;}

  /* droplets */
  let alive=0;
  for(let i=0;i<ND;i++){if(dLife[i]<=0)continue;alive++;
    dVel[i*3+1]-=420*dt;dPos[i*3]+=dVel[i*3]*dt;dPos[i*3+1]+=dVel[i*3+1]*dt;dPos[i*3+2]+=dVel[i*3+2]*dt;
    if(dPos[i*3+1]<BAR_Y+1){dLife[i]=0;dPos[i*3+1]=-9999;}}
  if(alive)dGeo.attributes.position.needsUpdate=true;
  const ps=Math.min(95,Math.sqrt(puddleVol)*8);
  puddle.scale.x+=(ps*1.35-puddle.scale.x)*dt*1.6;puddle.scale.y+=(ps-puddle.scale.y)*dt*1.6;
  puddle.position.x+=(Math.min(150,puddleX)-puddle.position.x)*dt*2;
  puddleMat.opacity=puddleVol>0?.6:0;
  if(pouring){puddleVol=Math.max(0,puddleVol-dt*60);}

  /* shadow follows the glass */
  const cx=tiltG.localToWorld(tmp2.set(0,0,0)).x;shadow.position.x=cx;shadow.scale.set(120+tilt*70,90,1);

  R.render(scene,cam);
  if(vis)raf=requestAnimationFrame(frame);
}
new IntersectionObserver(es=>{vis=es[0].isIntersecting;if(vis){cancelAnimationFrame(raf);clock.getDelta();raf=requestAnimationFrame(frame);}}).observe(stage);
frame();
})();

/* Woodhouse: shared site script (every page). Exposes window.WH helpers. */
(function(){
const D=window.WH_DATA;
const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasGsap=!!(window.gsap&&window.ScrollTrigger);
if(reduce||!hasGsap)document.documentElement.classList.add('no-motion');

/* ---------- Pacific time ---------- */
function laNow(){
  const parts = new Intl.DateTimeFormat('en-US',{timeZone:'America/Los_Angeles',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false,weekday:'short'}).formatToParts(new Date());
  const o={}; parts.forEach(p=>o[p.type]=p.value);
  const wd=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(o.weekday);
  return {y:+o.year,m:+o.month,d:+o.day,h:(+o.hour)%24,min:+o.minute,wd};
}
const now = laNow();
const nowMin = now.h*60+now.min;
const todayKey=now.y*10000+now.m*100+now.d;
const MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const WD=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const fmt=h=>{const p=h>=12?'pm':'am';const x=h%12||12;return x+p};
const esc=t=>String(t==null?'':t).replace(/&(?!amp;|#\d+;|[a-z]+;)/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
const laParts=ms=>{const o={};new Intl.DateTimeFormat('en-US',{timeZone:'America/Los_Angeles',year:'numeric',month:'numeric',day:'numeric',hour:'numeric',minute:'2-digit',hour12:false}).formatToParts(new Date(ms)).forEach(p=>o[p.type]=p.value);return {y:+o.year,m:+o.month,d:+o.day,h:(+o.hour)%24,min:+o.minute};};
const clock12=(h,m)=>`${h%12||12}${m?':'+String(m).padStart(2,'0'):''}`;
const ampm=h=>h>=12?'pm':'am';

/* ---------- Events: one shape for Squarespace + fallback ---------- */
function normFallback(e){
  const [y,m,d]=e.date.split('-').map(Number),[sh,sm]=e.start.split(':').map(Number),[eh,em]=(e.end||e.start).split(':').map(Number);
  return {y,m,d,sh:sh+sm/60,eh:eh+em/60,t:e.title,p:e.excerpt||'',body:e.body||e.excerpt||'',u:e.url,img:e.image||'',tags:e.tags||[],tickets:e.tickets||'',
    time:`${clock12(sh,sm)} to ${clock12(eh,em)} ${ampm(eh)}`};
}
function normApi(x){
  const a=laParts(x.start),b=laParts(x.end||x.start);
  return {y:a.y,m:a.m,d:a.d,sh:a.h+a.min/60,eh:(b.d!==a.d?24:b.h+b.min/60),t:x.title,p:x.excerpt||'',body:x.body||x.excerpt||'',u:x.url,img:x.image||'',tickets:x.tickets||'',
    tags:[...(x.tags||[]),...(x.categories||[])],time:`${clock12(a.h,a.min)} to ${clock12(b.h,b.min)} ${ampm(b.h)}`};
}
const isUpcoming=e=>{const k=e.y*10000+e.m*100+e.d;return k>todayKey||(k===todayKey&&now.h*60+now.min<e.eh*60);};
const evSort=(a,b)=>(a.y*1e4+a.m*100+a.d+a.sh/100)-(b.y*1e4+b.m*100+b.d+b.sh/100);
/* loadEvents(cb): calls cb immediately with fallback, then again with Squarespace data when it arrives */
function loadEvents(cb){
  cb({events:D.EVENTS.map(normFallback).filter(isUpcoming).sort(evSort),live:false});
  if(!/^https?:$/.test(location.protocol))return;
  fetch('/api/events').then(r=>r.ok?r.json():Promise.reject()).then(data=>{
    if(!data||!Array.isArray(data.events)||!data.events.length)return;
    cb({events:data.events.map(normApi).filter(isUpcoming).sort(evSort),past:(data.past||[]).map(normApi),calendarUrl:data.calendarUrl||'',live:true});
  }).catch(()=>{});
}

/* ---------- Hours + open status ---------- */
const HOURS=D.HOURS;
const hoursEl=document.getElementById('hours');
if(hoursEl){
  const span=[10,23],order=[2,3,4,5,6,0,1];
  let hh='<div class="hours-axis" aria-hidden="true"><span></span><div><span>10am</span><span>4pm</span><span>11pm</span></div><span></span></div>';
  order.forEach(i=>{
    const h=HOURS[i],today=i===now.wd;
    const bar=h.o==null?'':`<i style="left:${(h.o-span[0])/(span[1]-span[0])*100}%;right:${(span[1]-h.c)/(span[1]-span[0])*100}%"></i>`;
    hh+=`<div class="hr${today?' today':''}${h.o==null?' closed':''}"><span class="day">${h.d}</span><span class="bar">${bar}</span><span class="t">${h.o==null?'Closed':fmt(h.o)+' to '+fmt(h.c)}${today?' · today':''}</span></div>`;
  });
  hoursEl.innerHTML=hh;
}
function openStatus(){
  const t=HOURS[now.wd];
  if(t.o!=null&&nowMin>=t.o*60&&nowMin<t.c*60)return {open:true,text:'Open now · until '+fmt(t.c)};
  if(t.o!=null&&nowMin<t.o*60)return {open:false,text:'Opens today at '+fmt(t.o)};
  for(let k=1;k<=7;k++){const n=HOURS[(now.wd+k)%7];if(n.o!=null)return {open:false,text:'Closed · opens '+(k===1?'tomorrow':n.d)+' at '+fmt(n.o)};}
  return {open:false,text:''};
}
document.querySelectorAll('[data-status]').forEach(st=>{const s=openStatus();st.classList.toggle('open',s.open);const tx=st.querySelector('.status-text');if(tx)tx.textContent=s.text;});

/* ---------- Copy buttons ---------- */
function sel(b){const el=b.parentElement.querySelector('.v');const r=document.createRange();r.selectNodeContents(el);const s=getSelection();s.removeAllRanges();s.addRange(r);b.textContent='Selected';}
document.querySelectorAll('.copybtn').forEach(b=>b.addEventListener('click',()=>{
  const done=()=>{b.textContent='Copied';setTimeout(()=>b.textContent='Copy',1600)};
  try{navigator.clipboard.writeText(b.dataset.copy).then(done,()=>sel(b))}catch(e){sel(b)}
}));

/* ---------- Signup (wire to a mailing list at launch) ---------- */
const su=document.getElementById('signup');
if(su)su.addEventListener('submit',e=>{
  e.preventDefault();
  const v=document.getElementById('email').value.trim(),m=document.getElementById('signupMsg');
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)){m.textContent='Enter an email address like you@email.com.';return;}
  m.textContent='Adding you...';
  fetch('/api/subscribe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:v})})
    .then(r=>r.json()).then(j=>{if(!j.ok)throw 0;m.textContent="You're on the list. See you at the bar.";su.reset();})
    .catch(()=>{m.textContent='Signups open when the site goes live. Email '+D.CONTACT.general+' in the meantime.';});
});

/* ---------- Downloads that may not exist yet (press kit) ---------- */
document.querySelectorAll('[data-optional-file]').forEach(a=>{
  if(!/^https?:$/.test(location.protocol))return;
  fetch(a.getAttribute('href'),{method:'HEAD'}).then(r=>{if(!r.ok)throw 0;}).catch(()=>{
    a.removeAttribute('download');a.href='mailto:'+(a.dataset.fallbackEmail||D.CONTACT.booking)+'?subject=Press%20kit%20request';
    a.querySelector('.lbl')&&(a.querySelector('.lbl').textContent='Request the press kit');
  });
});

/* ---------- Nav ---------- */
const nav=document.getElementById('nav');
const onScroll=()=>nav.classList.toggle('scrolled',window.scrollY>40);
window.addEventListener('scroll',onScroll,{passive:true});onScroll();
const menuBtn=document.getElementById('menuBtn'),drawer=document.getElementById('drawer');
menuBtn.addEventListener('click',()=>{const o=drawer.classList.toggle('open');menuBtn.setAttribute('aria-expanded',o);menuBtn.textContent=o?'Close':'Menu';});
drawer.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{drawer.classList.remove('open');menuBtn.setAttribute('aria-expanded','false');menuBtn.textContent='Menu';}));

/* ---------- Oak texture (shared by every 3D piece) ---------- */
function makeWoodCanvas(bump){
    const W=1024,H=1024,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');
    let seed=7;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
    const g=x.createLinearGradient(0,0,W,0);
    if(bump){g.addColorStop(0,'#7a7a7a');g.addColorStop(1,'#808080');}
    else{g.addColorStop(0,'#9a6538');g.addColorStop(.5,'#b37a45');g.addColorStop(1,'#93602f');}
    x.fillStyle=g;x.fillRect(0,0,W,H);
    for(let i=0;i<900;i++){
      const px=rnd()*W,amp=2+rnd()*10,freq=.002+rnd()*.006,ph=rnd()*6.28,w=.4+rnd()*2.2,dark=rnd()<.62;
      x.beginPath();for(let y=0;y<=H;y+=8){const xx=px+Math.sin(y*freq+ph)*amp+Math.sin(y*freq*3.1+ph)*amp*.25;y?x.lineTo(xx,y):x.moveTo(xx,y);}
      const a=.04+rnd()*.16;
      x.strokeStyle=bump?(dark?`rgba(0,0,0,${a*1.6})`:`rgba(255,255,255,${a})`):(dark?`rgba(58,30,12,${a*1.4})`:`rgba(236,190,128,${a})`);
      x.lineWidth=w;x.stroke();
    }
    for(let i=0;i<9;i++){const kx=rnd()*W,ky=rnd()*H,r=6+rnd()*14;
      const rg=x.createRadialGradient(kx,ky,0,kx,ky,r*2.4);rg.addColorStop(0,bump?'rgba(0,0,0,.5)':'rgba(55,28,10,.55)');rg.addColorStop(1,'rgba(0,0,0,0)');
      x.fillStyle=rg;x.beginPath();x.ellipse(kx,ky,r*1.2,r*2.4,0,0,6.28);x.fill();}
    for(let s=128;s<W;s+=256){x.fillStyle=bump?'rgba(0,0,0,.55)':'rgba(40,20,8,.55)';x.fillRect(s-1.5,0,3,H);
      x.fillStyle=bump?'rgba(255,255,255,.25)':'rgba(240,200,140,.12)';x.fillRect(s+1.5,0,1.5,H);}
    return c;
  }

/* ---------- Word-by-word reveal ---------- */
function splitWords(el){
  const wrap=node=>{[...node.childNodes].forEach(n=>{
    if(n.nodeType===3){const f=document.createDocumentFragment();n.textContent.split(/(\s+)/).forEach(t=>{if(!t)return;if(/^\s+$/.test(t))f.appendChild(document.createTextNode(t));else{const s=document.createElement('span');s.className='w';s.textContent=t;f.appendChild(s);}});n.replaceWith(f);}
    else if(n.nodeType===1)wrap(n);});};
  wrap(el);
  if(reduce||!hasGsap)el.querySelectorAll('.w').forEach(w=>w.style.opacity=1);
}
document.querySelectorAll('[data-words]').forEach(splitWords);

/* ---------- Popup window (events, bar packages) ---------- */
const modal=document.createElement('div');modal.className='modal';modal.hidden=true;
modal.innerHTML='<div class="modal-back" data-close></div><div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="modalTitle" tabindex="-1"><button class="modal-x" type="button" aria-label="Close" data-close>×</button><div class="modal-body"></div></div>';
document.body.appendChild(modal);
const mBody=modal.querySelector('.modal-body'),mCard=modal.querySelector('.modal-card');let lastFocus=null,onClose=null;
function openModal(html,opts={}){
  lastFocus=document.activeElement;mBody.innerHTML=html;modal.className='modal'+(opts.cls?' '+opts.cls:'');modal.hidden=false;
  document.documentElement.classList.add('modal-open');if(window.WH&&WH.lenis)WH.lenis.stop();
  requestAnimationFrame(()=>{modal.classList.add('in');mCard.focus();});mCard.scrollTop=0;onClose=opts.onClose||null;
  mBody.querySelectorAll('.copybtn').forEach(b=>b.addEventListener('click',()=>{try{navigator.clipboard.writeText(b.dataset.copy).then(()=>{b.textContent='Copied';});}catch(e){}}));
}
function closeModal(){if(modal.hidden)return;modal.classList.remove('in');document.documentElement.classList.remove('modal-open');if(window.WH&&WH.lenis)WH.lenis.start();
  setTimeout(()=>{modal.hidden=true;mBody.innerHTML='';},250);if(lastFocus)lastFocus.focus();if(onClose)onClose();}
modal.addEventListener('click',e=>{if(e.target.closest('[data-close]'))closeModal();});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();});

const slug=t=>String(t).toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60);
const FALLBACK_IMG=['img/stage-night.jpg','img/crowd.jpg','img/indoor.jpg','img/stage.jpg','img/patio-dusk.jpg'];
function gcal(e){
  const p=n=>String(n).padStart(2,'0'),hm=h=>p(Math.floor(h))+p(Math.round((h%1)*60));
  const d=`${e.y}${p(e.m)}${p(e.d)}`;
  return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text='+encodeURIComponent(e.t+' at Woodhouse')+
    `&dates=${d}T${hm(e.sh)}00/${d}T${hm(Math.min(e.eh,23.98))}00&ctz=America/Los_Angeles&location=`+encodeURIComponent('Woodhouse Blending & Brewing, 119 Madrone St, Santa Cruz, CA')+
    '&details='+encodeURIComponent(e.p||'');
}
function eventHtml(e,i){
  const wd=WD[new Date(Date.UTC(e.y,e.m-1,e.d,12)).getUTCDay()];
  const tickets=e.tickets||((e.body||'').match(/https?:\/\/\S*(eventbrite|fareharbor|ticket|tix)\S*/i)||[])[0]||'';
  const paras=String(e.body||e.p||'').split(/\n{2,}|\n/).map(x=>x.trim()).filter(Boolean).map(x=>`<p>${esc(x)}</p>`).join('');
  const img=e.img||FALLBACK_IMG[(i||0)%FALLBACK_IMG.length];
  return `<div class="ev-hero" style="background-image:url('${img}')"><div class="ev-hero-date"><span class="d">${e.d}</span><span class="m"><b>${MON[e.m-1]}</b>${wd}</span></div></div>
    <div class="ev-pad"><p class="eyebrow">${esc(e.time)} · Woodhouse, 119 Madrone St</p><h2 id="modalTitle">${esc(e.t)}</h2>
    <div class="chips" style="margin-top:14px">${(e.cats||e.tags||[]).filter(c=>c!=='Ticketed').slice(0,3).map(c=>`<span class="chip">${esc(c)}</span>`).join('')}${tickets?'<span class="chip warm">Tickets</span>':''}</div>
    <div class="ev-text">${paras}</div>
    <div class="btn-row" style="margin-top:26px">${tickets?`<a class="btn btn-teal" href="${tickets}" target="_blank" rel="noopener">Get tickets <span class="arr">↗</span></a>`:''}
      <a class="btn ${tickets?'btn-ghost':'btn-teal'}" href="${gcal(e)}" target="_blank" rel="noopener">Add to calendar</a>
      <a class="btn btn-ghost" href="https://maps.google.com?q=119%20Madrone%20Street%20Santa%20Cruz%2C%20CA%2095060" target="_blank" rel="noopener">Directions</a></div>
</div>`;
}
function openEvent(e,i){openModal(eventHtml(e,i),{cls:'modal-ev'});}

window.WH={D,reduce,hasGsap,now,nowMin,todayKey,MON,WD,fmt,esc,laParts,clock12,makeWoodCanvas,loadEvents,openStatus,openModal,closeModal,openEvent,slug,lenis:null};

/* ---------- Motion (shared) ---------- */
if(reduce||!hasGsap)return;
gsap.registerPlugin(ScrollTrigger);
if(window.Lenis){
  const lenis=new Lenis({duration:1.15,smoothWheel:true});
  window.WH.lenis=lenis;
  lenis.on('scroll',ScrollTrigger.update);
  gsap.ticker.add(t=>lenis.raf(t*1000));
  gsap.ticker.lagSmoothing(0);
  document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
    const id=a.getAttribute('href');const t=id==='#top'?0:document.querySelector(id);
    if(t!==null){e.preventDefault();lenis.scrollTo(t,{offset:id==='#top'?0:-70});}
  }));
  if(location.hash&&location.hash.length>1){const t=document.querySelector(location.hash);if(t)setTimeout(()=>lenis.scrollTo(t,{offset:-70,immediate:true}),60);}
}
document.querySelectorAll('[data-words]').forEach(el=>gsap.to(el.querySelectorAll('.w'),{opacity:1,stagger:.08,ease:'none',scrollTrigger:{trigger:el,start:'top 80%',end:'bottom 40%',scrub:true}}));
gsap.utils.toArray('[data-parallax]').forEach(el=>gsap.fromTo(el,{yPercent:-8},{yPercent:8,ease:'none',scrollTrigger:{trigger:el.parentElement,start:'top bottom',end:'bottom top',scrub:true}}));
gsap.utils.toArray('.plate').forEach(p=>gsap.from(p,{clipPath:'inset(8% 8% 8% 8% round 24px)',duration:1.4,ease:'power3.out',scrollTrigger:{trigger:p,start:'top 85%'}}));
gsap.utils.toArray('.panel .copy,[data-stagger]').forEach(c=>gsap.from(c.children,{y:30,opacity:.25,stagger:.08,duration:1,ease:'power3.out',scrollTrigger:{trigger:c,start:'top 88%'}}));
gsap.utils.toArray('[data-count]').forEach(el=>{
  const end=+el.dataset.count,o={v:0};
  ScrollTrigger.create({trigger:el,start:'top 90%',once:true,onEnter:()=>gsap.to(o,{v:end,duration:1.6,ease:'power2.out',onUpdate:()=>el.textContent=Math.round(o.v).toLocaleString("en-US")})});
});
gsap.utils.toArray('.sec-head h2,.book h2,.page-hero h1').forEach(h=>gsap.from(h,{y:60,opacity:.2,duration:1.2,ease:'power4.out',scrollTrigger:{trigger:h,start:'top 92%'}}));
gsap.utils.toArray('[data-drift]').forEach(el=>gsap.to(el,{yPercent:+el.dataset.drift||-20,ease:'none',scrollTrigger:{trigger:el.closest('section')||el,start:'top top',end:'bottom top',scrub:true}}));
if(document.querySelector('.book-w'))gsap.from('.book-w',{rotation:-12,y:80,ease:'none',scrollTrigger:{trigger:'#book',start:'top bottom',end:'bottom top',scrub:true}});
gsap.from('.giant',{yPercent:40,opacity:.3,ease:'none',scrollTrigger:{trigger:'footer',start:'top bottom',end:'bottom bottom',scrub:true}});
window.addEventListener('load',()=>ScrollTrigger.refresh());
})();

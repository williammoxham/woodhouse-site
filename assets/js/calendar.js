/* Woodhouse: full calendar listing (Squarespace events with a built-in fallback) + artist wall */
(function(){
const {D,esc,now,MON,WD,loadEvents}=window.WH;
const cards=document.getElementById('calCards'),monthEl=document.getElementById('calMonth'),list=cards,filt=document.getElementById('filters'),note=document.getElementById('calNote');
const CATS=[
  ['All',null],
  ['Live music',/band|music|jazz|rock|folk|funk|reggae|tribute|jam|bluegrass|americana|psych|trio|live|concert|guitar|dead/i],
  ['DJ & dance',/dj|dance|afrobeat|dancehall|line danc|square danc|disco|selecta|roll call|bass/i],
  ['Comedy',/comed|comic|stand.?up/i],
  ['Art & workshops',/art|drawing|figure|workshop|class|film|immersive/i],
  ['Markets & community',/market|vendor|benefit|fundrais|community|mixer|fest|celebrat|heritage|election/i],
  ['Ticketed',/ticket|\$\d|eventbrite|fareharbor/i]
];
let all=[],cur='All';
const catOf=e=>{const s=[e.t,e.p,e.body,...(e.tags||[])].join(' ');return CATS.filter(c=>c[1]&&c[1].test(s)).map(c=>c[0]);};
function renderFilters(){
  filt.innerHTML=CATS.map(([n])=>{const c=n==='All'?all.length:all.filter(e=>e.cats.includes(n)).length;
    return c||n==='All'?`<button type="button" aria-pressed="${n===cur}" data-cat="${esc(n)}">${esc(n)}<span>${c}</span></button>`:'';}).join('');
  filt.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{cur=b.dataset.cat;renderFilters();renderList();}));
}
const wdOf=e=>WD[new Date(Date.UTC(e.y,e.m-1,e.d,12)).getUTCDay()];
const dayDiff=e=>Math.round((Date.UTC(e.y,e.m-1,e.d)-Date.UTC(now.y,now.m-1,now.d))/864e5);
const ticketChip=e=>e.tickets||e.cats.includes('Ticketed');
let view='cards',shown=[],monthKey=null,pickDay=null;
const filtered=()=>cur==='All'?all:all.filter(e=>e.cats.includes(cur));
function open(e){try{history.replaceState(null,'','#ev-'+window.WH.slug(e.t));}catch(x){}window.WH.openEvent(e,all.indexOf(e));}

/* ---- poster cards, like the home page, with tickets right on the card ---- */
function renderCards(){
  const ev=filtered();shown=ev;
  if(!ev.length){cards.innerHTML='<p class="cal-empty">Nothing in this category right now. New shows go up every week.</p>';return;}
  let html='',lastM='';
  ev.forEach((e,i)=>{
    const mk=e.y*100+e.m;if(mk!==lastM){html+=`<p class="cal-month">${new Date(Date.UTC(e.y,e.m-1,15)).toLocaleString('en-US',{month:'long',timeZone:'UTC'})} <span>${e.y}</span></p>`;lastM=mk;}
    const diff=dayDiff(e);
    const chip=diff===0?'<span class="ev-chip">Tonight</span>':diff===1?'<span class="ev-chip soft">Tomorrow</span>':'';
    html+=`<article class="pc" id="ev-${window.WH.slug(e.t)}">
      <button type="button" class="pc-art" data-i="${i}" aria-label="More about ${esc(e.t)}">${e.img?`<span class="pc-img" style="background-image:url('${e.img}')"></span>`:`<span class="pc-img pc-noimg"><svg viewBox="-20 -10 296 360" aria-hidden="true"><use href="#wmark"/></svg></span>`}${chip}
        <span class="pc-date"><b>${e.d}</b><span>${MON[e.m-1]}<br>${wdOf(e).slice(0,3)}</span></span></button>
      <div class="pc-body">
        <div class="meta"><span class="time">${esc(e.time||'')}</span>${e.cats.filter(c=>c!=='Ticketed').slice(0,2).map(c=>`<span class="chip">${esc(c)}</span>`).join('')}</div>
        <h3><button type="button" data-i="${i}">${esc(e.t)}</button></h3>
        <p>${esc(e.p)}</p>
        <div class="pc-foot"><button type="button" class="btn btn-ghost" data-i="${i}">Details +</button>${e.tickets?`<a class="btn btn-teal" href="${e.tickets}" target="_blank" rel="noopener">Tickets ↗</a>`:ticketChip(e)?'<span class="chip warm">Tickets</span>':`<span class="chip">${esc(e.door||'Free')}</span>`}</div>
      </div></article>`;
  });
  cards.innerHTML=html;
  if(window.ScrollTrigger)ScrollTrigger.refresh();
}
cards&&cards.addEventListener('click',ev=>{const b=ev.target.closest('[data-i]');if(!b)return;open(shown[+b.dataset.i]);});

/* ---- a real month calendar ---- */
function months(){const set=new Set(filtered().map(e=>e.y*100+e.m));set.add(now.y*100+now.m);return [...set].sort((a,b)=>a-b);}
function renderMonth(){
  const ms=months();if(monthKey==null||!ms.includes(monthKey))monthKey=ms.includes(now.y*100+now.m)?now.y*100+now.m:ms[0];
  const y=Math.floor(monthKey/100),m=monthKey%100,first=new Date(Date.UTC(y,m-1,1)).getUTCDay(),days=new Date(Date.UTC(y,m,0)).getUTCDate();
  const ev=filtered().filter(e=>e.y===y&&e.m===m),byDay={};ev.forEach(e=>(byDay[e.d]=byDay[e.d]||[]).push(e));
  const idx=ms.indexOf(monthKey);
  if(pickDay==null||!byDay[pickDay]){const up=Object.keys(byDay).map(Number).sort((a,b)=>a-b);pickDay=(y===now.y&&m===now.m&&byDay[now.d])?now.d:(up.find(d=>y>now.y||m>now.m||d>=now.d)||up[0]||null);}
  let cells='';for(let i=0;i<first;i++)cells+='<div class="mc empty" aria-hidden="true"></div>';
  for(let d=1;d<=days;d++){const list=byDay[d]||[],today=y===now.y&&m===now.m&&d===now.d,past=Date.UTC(y,m-1,d)<Date.UTC(now.y,now.m-1,now.d);
    cells+=`<div class="mc${list.length?' has':''}${today?' today':''}${past?' past':''}${d===pickDay?' pick':''}" data-day="${d}">
      <button type="button" class="mc-num" data-day="${d}" ${list.length?'':'tabindex="-1"'} aria-label="${MON[m-1]} ${d}${list.length?', '+list.length+' event'+(list.length>1?'s':''):''}">${d}</button>
      <div class="mc-evs">${list.slice(0,3).map(e=>`<button type="button" class="mc-ev${e.tickets?' tix':''}" data-ev="${all.indexOf(e)}">${e.img?`<i style="background-image:url('${e.img}')"></i>`:''}<span>${esc(e.t)}</span></button>`).join('')}${list.length>3?`<span class="mc-more">+${list.length-3} more</span>`:''}</div>
      <div class="mc-dots" aria-hidden="true">${list.slice(0,4).map(()=>'<i></i>').join('')}</div></div>`;}
  const dayList=(byDay[pickDay]||[]);
  monthEl.innerHTML=`<div class="mc-head"><button type="button" class="mc-nav" data-step="-1" ${idx<=0?'disabled':''} aria-label="Previous month">‹</button>
      <h3>${new Date(Date.UTC(y,m-1,15)).toLocaleString('en-US',{month:'long',timeZone:'UTC'})} <span>${y}</span></h3>
      <button type="button" class="mc-nav" data-step="1" ${idx>=ms.length-1?'disabled':''} aria-label="Next month">›</button>
      <span class="mc-count">${ev.length} event${ev.length===1?'':'s'}</span></div>
    <div class="mc-grid"><div class="mc-wd">Sun</div><div class="mc-wd">Mon</div><div class="mc-wd">Tue</div><div class="mc-wd">Wed</div><div class="mc-wd">Thu</div><div class="mc-wd">Fri</div><div class="mc-wd">Sat</div>${cells}</div>
    <div class="mc-day">${pickDay&&dayList.length?`<p class="eyebrow">${wdOf({y,m,d:pickDay})}, ${MON[m-1]} ${pickDay}</p>${dayList.map(e=>`<button type="button" class="mc-row" data-ev="${all.indexOf(e)}">${e.img?`<i style="background-image:url('${e.img}')"></i>`:'<i class="noimg"></i>'}<span><b>${esc(e.t)}</b><small>${esc(e.time||'')}${e.tickets?' · Tickets':''}</small></span><em>Details +</em></button>`).join('')}`:'<p class="muted">Pick a day with a dot to see what is on.</p>'}</div>`;
}
monthEl&&monthEl.addEventListener('click',ev=>{
  const n=ev.target.closest('.mc-nav');if(n){const ms=months(),i=ms.indexOf(monthKey)+(+n.dataset.step);if(ms[i]){monthKey=ms[i];pickDay=null;renderMonth();}return;}
  const e=ev.target.closest('[data-ev]');if(e){open(all[+e.dataset.ev]);return;}
  const d=ev.target.closest('[data-day]');if(d&&d.closest('.mc.has')){pickDay=+d.dataset.day;renderMonth();
    if(window.matchMedia('(max-width:760px)').matches)monthEl.querySelector('.mc-day').scrollIntoView({behavior:'smooth',block:'nearest'});}
});
function renderList(){cards.hidden=view!=='cards';monthEl.hidden=view!=='month';if(view==='cards')renderCards();else renderMonth();}
document.querySelectorAll('.cal-views button').forEach(b=>b.addEventListener('click',()=>{view=b.dataset.view;
  document.querySelectorAll('.cal-views button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));renderList();}));
let opened=false;
if(list)loadEvents(res=>{
  all=res.events.map(e=>Object.assign(e,{cats:catOf(e)}));
  note.textContent=res.live?'Updated from our events calendar.':'Showing a saved list of upcoming shows. The full calendar loads on the live site.';
  if(cur!=='All'&&!all.some(e=>e.cats.includes(cur)))cur='All';
  renderFilters();renderList();
  const h=location.hash.slice(1);if(h.startsWith('ev-')&&!opened){const e=all.find(x=>'ev-'+window.WH.slug(x.t)===h);if(e){opened=true;window.WH.openEvent(e,all.indexOf(e));}}
});

/* artist wall */
const wall=document.getElementById('wall');
if(wall){const a=D.ARTISTS.slice(2),rows=[[D.ARTISTS[0]],[],[D.ARTISTS[1]]];a.forEach((n,i)=>rows[i%3].push(n));
  rows.splice(1,0,D.CULTURE.slice());
  wall.innerHTML=rows.map((r,ri)=>{const s=r.map(n=>`<span>${esc(n)}</span>`).join('');return `<div class="wall-row${ri===1?' culture':''}">${s}${s.replace(/<span>/g,'<span aria-hidden="true">')}</div>`;}).join('');}
})();

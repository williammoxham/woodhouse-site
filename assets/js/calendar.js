/* Woodhouse: full calendar listing (Squarespace events with a built-in fallback) + artist wall */
(function(){
const {D,esc,now,MON,WD,loadEvents}=window.WH;
const list=document.getElementById('calList'),filt=document.getElementById('filters'),note=document.getElementById('calNote');
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
function renderList(){
  const ev=cur==='All'?all:all.filter(e=>e.cats.includes(cur));
  if(!ev.length){list.innerHTML='<p class="cal-empty">Nothing in this category right now. New shows go up every week.</p>';return;}
  let html='',lastM='';
  ev.forEach(e=>{
    const mk=MON[e.m-1]+' '+e.y;if(mk!==lastM){html+=`<p class="cal-month">${new Date(Date.UTC(e.y,e.m-1,15)).toLocaleString('en-US',{month:'long',timeZone:'UTC'})} ${e.y}</p>`;lastM=mk;}
    const wd=WD[new Date(Date.UTC(e.y,e.m-1,e.d,12)).getUTCDay()];
    const diff=Math.round((Date.UTC(e.y,e.m-1,e.d)-Date.UTC(now.y,now.m-1,now.d))/864e5);
    const when=diff===0?'<span class="ev-chip" style="position:static">Tonight</span>':diff===1?'<span class="chip" style="color:var(--teal)">Tomorrow</span>':'';
    const long=e.body&&e.body.length>e.p.length+40;
    html+=`<article class="cal-row">
      <div class="cal-date"><span class="d">${e.d}</span><span class="w">${wd.slice(0,3)} · ${MON[e.m-1]}</span></div>
      <div class="cal-main"><h3>${esc(e.t)}</h3>
        <div class="meta">${when}<span class="time">${esc(e.time)}</span>${e.cats.filter(c=>c!=='Ticketed').slice(0,2).map(c=>`<span class="chip">${esc(c)}</span>`).join('')}${e.cats.includes('Ticketed')?'<span class="chip" style="color:var(--amber);border-color:rgba(227,169,92,.35)">Tickets</span>':''}</div>
        <p>${esc(e.p)}</p>
        ${long?`<details><summary>More about this show</summary><p>${esc(e.body)}</p></details>`:''}
      </div>
      <div class="cal-side">${e.img?`<span class="cal-thumb" style="background-image:url('${e.img}')"></span>`:''}<a class="btn btn-ghost" href="${e.u}" target="_blank" rel="noopener">Details ↗</a></div>
    </article>`;
  });
  list.innerHTML=html;
  if(window.ScrollTrigger)ScrollTrigger.refresh();
}
if(list)loadEvents(res=>{
  all=res.events.map(e=>Object.assign(e,{cats:catOf(e)}));
  note.textContent=res.live?'Updated from our events calendar.':'Showing a saved list of upcoming shows. The full calendar loads on the live site.';
  if(cur!=='All'&&!all.some(e=>e.cats.includes(cur)))cur='All';
  renderFilters();renderList();
});

/* artist wall */
const wall=document.getElementById('wall');
if(wall){const a=D.ARTISTS.slice(),rows=[[],[],[]];a.forEach((n,i)=>rows[i%3].push(n));
  wall.innerHTML=rows.map(r=>{const s=r.map(n=>`<span>${esc(n)}</span>`).join('');return `<div class="wall-row">${s}${s.replace(/<span>/g,'<span aria-hidden="true">')}</div>`;}).join('');}
})();

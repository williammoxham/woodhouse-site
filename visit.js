/* Woodhouse: visit page. Partners, beer trail, coffee and music come from WH_DATA.PLACES;
   every place opens a pop-up with the details, a map, directions and Google photos. */
(function(){
const {D,esc,MON,WD,now,loadEvents,openModal}=window.WH;
const P=D.PLACES||{partners:[],beer:[],coffee:[],music:[]};
const full=p=>p.a?(p.a+(/,/.test(p.a)?', CA':', Santa Cruz, CA')):p.n+', Santa Cruz, CA';
const mapsQ=p=>encodeURIComponent((p.a?p.n+', ':'')+full(p));
const all=[];const reg=p=>{all.push(p);return all.length-1;};

function openPlace(p){
  const q=mapsQ(p),partner=!!p.partner,hasAddr=!!p.a&&!partner;
  openModal(`<div class="pl-pop">
    ${hasAddr?`<div class="pl-map"><iframe title="Map of ${esc(p.n)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=${q}&amp;z=15&amp;output=embed"></iframe></div>`:'<div class="pl-map pl-nomap"><svg viewBox="-20 -10 296 360" aria-hidden="true"><use href="#wmark"/></svg></div>'}
    <div class="pl-body">
      <div class="pl-tags">${p.kind?`<span class="chip warm">${esc(p.kind)}</span>`:''}<span class="chip">${esc(p.area||'Santa Cruz')}</span></div>
      <h3 id="modalTitle">${esc(p.n)}</h3>
      ${p.a?`<p class="pl-addr">${esc(full(p))}</p>`:''}
      <p class="pl-about">${esc(p.about||p.s||'')}</p>
      <div class="btn-row">
        ${hasAddr?`<a class="btn btn-teal" href="https://www.google.com/maps/dir/?api=1&amp;destination=${q}" target="_blank" rel="noopener">Directions <span class="arr">↗</span></a>`:''}
        ${partner?'':`<a class="btn btn-ghost" href="https://www.google.com/maps/search/?api=1&amp;query=${q}" target="_blank" rel="noopener">Photos &amp; reviews on Google ↗</a>`}
        ${p.ig?`<a class="btn ${partner?'btn-teal':'btn-ghost'}" href="${p.ig}" target="_blank" rel="noopener">Instagram @${p.ig.replace(/\/$/,'').split('/').pop()} ↗</a>`:''}
        ${p.url?`<a class="btn ${partner&&!p.ig?'btn-teal':'btn-ghost'}" href="${p.url}" target="_blank" rel="noopener">Website ↗</a>`:''}
      </div>
    </div></div>`,{cls:'pl-modal'});
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-place]');if(!b)return;e.preventDefault();openPlace(all[+b.dataset.place]);});

const row=p=>`<li><button type="button" data-place="${reg(p)}"><b>${esc(p.n)}</b><span>${esc(p.a?p.a+(p.area?' · '+p.area:''):p.area||'')}</span><small>${esc(p.s||'')}</small><em aria-hidden="true">+</em></button></li>`;

/* partners: featured */
const pg=document.getElementById('vzPartners');
if(pg)pg.innerHTML=P.partners.map(p=>Object.assign(p,{partner:true})).map((p,i)=>`<button type="button" class="vz-partner" data-place="${reg(p)}">
  <span class="vz-pn">${String(i+1).padStart(2,'0')}</span><span class="chip warm">${esc(p.kind||'Partner')}</span>
  <b>${esc(p.n)}</b><small>${esc(p.s||'')}</small>${p.a?`<span class="vz-paddr">${esc(p.a)}</span>`:''}<em>More +</em></button>`).join('');
/* beer trail */
const bt=document.getElementById('vzBeer');
if(bt){const half=Math.ceil(P.beer.length/2);const cols=[P.beer.slice(0,1),P.beer.slice(1)];
  bt.innerHTML=cols.map(gs=>`<div class="vz-group">${gs.map((g,k)=>`<h3 class="vz-gh"${k?' style="margin-top:28px"':''}>${esc(g.g)}</h3><ul class="vz-list">${g.items.map(row).join('')}</ul>`).join('')}</div>`).join('');}
/* coffee */
const cf=document.getElementById('vzCoffee');if(cf)cf.innerHTML=P.coffee.map(row).join('');
/* music */
const mu=document.getElementById('vzMusic');
if(mu)mu.innerHTML=P.music.map(p=>`<li><button type="button" data-place="${reg(p)}"><span class="vz-kind">${esc(p.kind||'')}</span><b>${esc(p.n)}</b><span>${esc(p.a)}</span><small>${esc(p.s||'')}</small><em aria-hidden="true">+</em></button></li>`).join('');

/* next four at Woodhouse */
const box=document.getElementById('vzNext');
if(box)loadEvents(res=>{
  const ev=res.events.slice(0,4);
  if(!ev.length){box.innerHTML='<p class="muted">New shows go up every week. Check the calendar.</p>';return;}
  box.innerHTML=ev.map((e,i)=>{const wd=WD[new Date(Date.UTC(e.y,e.m-1,e.d,12)).getUTCDay()];
    const diff=Math.round((Date.UTC(e.y,e.m-1,e.d)-Date.UTC(now.y,now.m-1,now.d))/864e5);
    return `<button type="button" class="vz-ev" data-i="${i}"><span class="vz-ev-d"><b>${e.d}</b>${MON[e.m-1]}</span><span class="vz-ev-t"><b>${esc(e.t)}</b><small>${diff===0?'Tonight · ':diff===1?'Tomorrow · ':wd.slice(0,3)+' · '}${esc(e.time||'')}${e.tickets?' · Tickets':''}</small></span><em>+</em></button>`;}).join('');
  box.querySelectorAll('.vz-ev').forEach(b=>b.addEventListener('click',()=>window.WH.openEvent(ev[+b.dataset.i],+b.dataset.i)));
});
})();

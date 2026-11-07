/* Woodhouse: visit page (next shows at Woodhouse, tap any address for directions) */
(function(){
const {esc,MON,WD,now,loadEvents}=window.WH;
/* every listed place opens in Maps */
document.querySelectorAll('[data-maps] li').forEach(li=>{
  const name=li.querySelector('b').textContent,addr=li.querySelector('b+span').textContent;
  const q=encodeURIComponent(name+', '+addr+(/,/.test(addr)?', CA':', Santa Cruz, CA'));
  const a=document.createElement('a');a.href='https://www.google.com/maps/search/?api=1&query='+q;a.target='_blank';a.rel='noopener';
  a.setAttribute('aria-label',name+', '+addr+', open in Maps');
  while(li.firstChild)a.appendChild(li.firstChild);a.insertAdjacentHTML('beforeend','<em aria-hidden="true">↗</em>');li.appendChild(a);
});
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

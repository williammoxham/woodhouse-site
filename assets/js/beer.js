/* Woodhouse: beer page (taps, drinks, archive, flip cards, oak portraits) */
(function(){
const {D,esc,makeWoodCanvas}=window.WH;
const tl=document.getElementById('tapList');
if(tl)tl.innerHTML=D.TAPS.map((t,i)=>`<div class="tap"><span class="no">${String(i+1).padStart(2,'0')}</span>
  <h4>${esc(t.name)}${t.house?'<span class="flag">House</span>':t.guest?'<span class="flag guest">Guest</span>':''}</h4>
  <span class="abv">${t.abv?t.abv+'%':''}</span>
  <p class="sty"><b>${esc(t.style)}</b>${t.note?' · '+esc(t.note):''}</p></div>`).join('');
const dl=document.getElementById('drinkList');
if(dl)dl.innerHTML=D.OTHER_DRINKS.map(d=>`<div><b>${esc(d.name)}</b><span>${esc(d.note)}</span></div>`).join('');
const ar=document.getElementById('archiveList');
if(ar)ar.innerHTML=D.ARCHIVE.map(a=>`<div class="arch"><h4>${esc(a[0])}</h4><span class="style">${esc(a[1])}</span><span class="abv">${esc(a[2])}</span></div>`).join('');
document.querySelectorAll('.flip').forEach(f=>f.addEventListener('click',()=>f.setAttribute('aria-pressed',f.getAttribute('aria-pressed')==='true'?'false':'true')));
try{const c=makeWoodCanvas(false),s=document.createElement('canvas');s.width=s.height=320;s.getContext('2d').drawImage(c,0,0,320,320);
  const url=s.toDataURL('image/jpeg',.8);document.querySelectorAll('.por.oak').forEach(p=>p.style.setProperty('--oak',`url(${url})`));}catch(e){}
})();

/* Woodhouse: beer page (taps, drinks, archive, flip cards, oak portraits) */
(function(){
const {D,esc,makeWoodCanvas}=window.WH;
/* ---------- On tap: live from Square (/api/taps), snapshot fallback ---------- */
const groupsEl=document.getElementById('tapGroups'),tabsEl=document.getElementById('tapTabs');
const money=c=>c==null?'':'$'+(c%100?(c/100).toFixed(2):c/100);
let curTab='all',data=null;
function renderTaps(){
  if(!groupsEl||!data)return;
  const groups=data.groups.filter(g=>g.items.length);
  tabsEl.innerHTML=[['all','Everything']].concat(groups.map(g=>[g.key,g.label])).map(([k,l])=>`<button type="button" aria-pressed="${k===curTab}" data-k="${k}">${esc(l)}${k!=='all'?`<span>${groups.find(g=>g.key===k).items.length}</span>`:''}</button>`).join('');
  tabsEl.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{curTab=b.dataset.k;renderTaps();}));
  groupsEl.innerHTML=groups.filter(g=>curTab==='all'||g.key===curTab).map(g=>`<div class="tap-group"><h3 class="tap-gh">${esc(g.label)}</h3><div class="taps">${g.items.map((t,i)=>{
      const sizes=(t.sizes||[]).filter(s=>s[1]!=null).slice(0,4).map(s=>`<span>${esc(s[0].replace(/\s*\(.*?\)/,''))} <b>${money(s[1])}</b></span>`).join('');
      const poured=t.poured&&t.poured.length?`<b>${esc(t.poured.join(', '))}</b>`:'';
      return `<div class="tap"><span class="no" style="--c:${t.color||'var(--teal)'}"></span>
        <h4>${esc(t.name)}</h4><span class="abv">${t.abv?t.abv+'%':''}</span>
        <p class="sty">${poured||(t.desc?esc(t.desc):esc(t.style||''))}</p>${sizes?`<p class="sizes">${sizes}</p>`:''}</div>`;}).join('')}</div></div>`).join('');
}
function setTaps(d,live){
  data=d;const chip=document.getElementById('tapChip'),tx=document.getElementById('tapChipText');
  if(chip){chip.classList.toggle('live',live);chip.classList.toggle('preview',!live);
    tx.textContent=live?'Live from our bar · updated '+new Date(d.updated).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'}):'Snapshot from our bar · goes live with Square';}
  renderTaps();
}
setTaps(D.TAPS_SNAPSHOT,false);
if(/^https?:$/.test(location.protocol))fetch('/api/taps').then(r=>r.ok?r.json():Promise.reject()).then(j=>{if(j&&j.groups&&j.groups.length)setTaps(j,true);}).catch(()=>{});
const ar=document.getElementById('archiveList');
if(ar)ar.innerHTML=D.ARCHIVE.map(a=>`<div class="arch"><h4>${esc(a[0])}</h4><span class="style">${esc(a[1])}</span><span class="abv">${esc(a[2])}</span></div>`).join('');
document.querySelectorAll('.flip').forEach(f=>f.addEventListener('click',()=>f.setAttribute('aria-pressed',f.getAttribute('aria-pressed')==='true'?'false':'true')));
try{const c=makeWoodCanvas(false),s=document.createElement('canvas');s.width=s.height=320;s.getContext('2d').drawImage(c,0,0,320,320);
  const url=s.toDataURL('image/jpeg',.8);document.querySelectorAll('.por.oak').forEach(p=>p.style.setProperty('--oak',`url(${url})`));}catch(e){}
})();

/* Woodhouse: food menu tabs */
(function(){
const menuEl=document.getElementById('menu');if(!menuEl)return;
const D=window.WH_DATA,{reduce,hasGsap}=window.WH;
function renderMenu(k){
  menuEl.setAttribute('aria-labelledby','tab-'+k);
  menuEl.innerHTML=D.MENU[k].map(i=>`<div class="item"><h4>${i[0]}${i[3]?`<span class="tagx">${i[3]}</span>`:''}</h4><span class="price mono">${i[1]}</span><p>${i[2]}</p></div>`).join('');
  if(hasGsap && !reduce) gsap.from(menuEl.children,{y:16,opacity:.0,duration:.5,stagger:.04,ease:'power2.out',clearProps:'all'});
}
document.querySelectorAll('.tab').forEach(b=>b.addEventListener('click',()=>{
  document.querySelectorAll('.tab').forEach(x=>x.setAttribute('aria-selected',x===b?'true':'false'));
  renderMenu(b.dataset.tab);
}));
renderMenu('small');
})();

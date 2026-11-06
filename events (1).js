/* Woodhouse: events page guest-count sizer */
(function(){
const r=document.getElementById('guests');if(!r)return;
const n=document.getElementById('guestN'),sizes=[...document.querySelectorAll('.size')];
function upd(){const v=+r.value;n.textContent=v>=500?'500+':v;
  sizes.forEach(s=>s.classList.toggle('on',v>=+s.dataset.min&&v<=+s.dataset.max));}
r.addEventListener('input',upd);upd();
})();

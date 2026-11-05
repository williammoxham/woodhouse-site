/* Woodhouse: events page guest-count sizer */
(function(){
const r=document.getElementById('guests');if(!r)return;
const n=document.getElementById('guestN'),sizes=[...document.querySelectorAll('.size')];
function upd(){const v=+r.value;n.textContent=v>=500?'500+':v;
  sizes.forEach(s=>s.classList.toggle('on',v>=+s.dataset.min&&v<=+s.dataset.max));}
r.addEventListener('input',upd);upd();
})();

/* bar packages popup (from the brochure; pricing through our event planner) */
(function(){
const b=document.getElementById('barBtn');if(!b)return;
const {D,esc,openModal}=window.WH;
const ic=[ '<svg viewBox="-100 -100 200 200" aria-hidden="true"><polygon points="0,-84 85,1 0,86 -85,1" fill="#89d8d0"/></svg>',
  '<svg viewBox="-100 -100 200 200" aria-hidden="true"><polygon points="0,-88 85,-3 -85,-3" fill="#89d8d0"/><polygon points="-85,6 85,6 0,91" fill="#f2ead9"/></svg>',
  '<svg viewBox="-20 -10 296 360" aria-hidden="true"><use href="#wmark"/></svg>'];
b.addEventListener('click',()=>openModal(`<div class="ev-pad"><p class="eyebrow">Bar packages</p><h2 id="modalTitle">Pour Woodhouse</h2>
  <p class="muted" style="margin-top:12px;max-width:60ch">Two open bar packages, each with up to three hours of unlimited service, or a flexible setup that fits your crowd. Pricing depends on your date, headcount and hours, so our event planner will put it together with you.</p>
  <div class="pkgs">${D.BAR_PACKAGES.map((p,i)=>`<article class="pkg${i===1?' feat':''}"><span class="pkg-ic">${ic[i]}</span><h3>${esc(p.name)}</h3><p class="muted">${esc(p.lede)}</p><ul>${p.items.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></article>`).join('')}</div>
  <div class="btn-row" style="margin-top:26px"><a class="btn btn-teal" href="${D.LINKS.tally}" target="_blank" rel="noopener">Talk to our event planner <span class="arr">→</span></a><span class="muted" style="font-size:14px;align-self:center">or email ${esc(D.CONTACT.events)}</span></div></div>`,{cls:'modal-wide'}));
})();

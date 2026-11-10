/* Woodhouse: Merch. Reads the Woodhouse Gear Shopify store through the Storefront API (Headless channel),
   keeps a real Shopify cart, and opens Shopify's secure checkout in a window over this page. */
(function(){
const {D,esc,openModal,closeModal}=window.WH;
const S=D.SHOPIFY||{};
const API=`https://${S.domain}/api/${S.api||'2026-07'}/graphql.json`;
const $=id=>document.getElementById(id);
const grid=$('mhGrid'),filt=$('mhFilters'),meta=$('mhMeta');
let products=[],collections=[],cur='all',cart=null;

/* ---------- Storefront API ---------- */
async function gql(query,variables){
  const r=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json','X-Shopify-Storefront-Access-Token':S.token},body:JSON.stringify({query,variables})});
  const j=await r.json();if(j.errors)throw new Error(j.errors.map(e=>e.message).join('; '));return j.data;
}
const MONEY='amount currencyCode';
const Q_SHOP=`query{
  products(first:100,sortKey:BEST_SELLING){nodes{id handle title description productType availableForSale
    priceRange{minVariantPrice{${MONEY}} maxVariantPrice{${MONEY}}}
    images(first:12){nodes{url altText}}
    options{name optionValues{name swatch{color}}}
    variants(first:100){nodes{id title availableForSale price{${MONEY}} compareAtPrice{${MONEY}} selectedOptions{name value} image{url altText}}}}}
  collections(first:25){nodes{handle title products(first:100){nodes{handle}}}}}`;
const F_CART=`fragment C on Cart{id checkoutUrl totalQuantity cost{subtotalAmount{${MONEY}}}
  lines(first:100){nodes{id quantity merchandise{...on ProductVariant{id title availableForSale image{url altText} price{${MONEY}} product{title handle featuredImage{url altText}}}}}}}`;
const Q_CART=`query($id:ID!){cart(id:$id){...C}}${F_CART}`;
const M_CREATE=`mutation($lines:[CartLineInput!]){cartCreate(input:{lines:$lines}){cart{...C} userErrors{message}}}${F_CART}`;
const M_ADD=`mutation($id:ID!,$lines:[CartLineInput!]!){cartLinesAdd(cartId:$id,lines:$lines){cart{...C} userErrors{message}}}${F_CART}`;
const M_UPD=`mutation($id:ID!,$lines:[CartLineUpdateInput!]!){cartLinesUpdate(cartId:$id,lines:$lines){cart{...C} userErrors{message}}}${F_CART}`;
const M_DEL=`mutation($id:ID!,$ids:[ID!]!){cartLinesRemove(cartId:$id,lineIds:$ids){cart{...C} userErrors{message}}}${F_CART}`;

/* ---------- helpers ---------- */
const money=m=>{if(!m)return'';const n=+m.amount;try{return new Intl.NumberFormat('en-US',{style:'currency',currency:m.currencyCode||'USD',minimumFractionDigits:n%1?2:0}).format(n);}catch(e){return '$'+n.toFixed(2);}};
const nb=t=>String(t||'').replace(/-/g,'\u2011');   /* T-Shirt never breaks at the hyphen */
const img=(u,w)=>u?u+(u.includes('?')?'&':'?')+'width='+w:'';
const store={get(){try{return localStorage.getItem('wh-cart');}catch(e){return null;}},set(v){try{v?localStorage.setItem('wh-cart',v):localStorage.removeItem('wh-cart');}catch(e){}}};
const colorOpt=p=>p.options.find(o=>/colou?r/i.test(o.name));
function kindOf(p){const t=(p.productType+' '+p.title).toLowerCase();
  if(/hood|sweat|crew/.test(t))return'Hoodies & sweats';if(/tank/.test(t))return'Tanks';if(/hat|cap|beanie/.test(t))return'Hats';if(/tee|t-shirt|shirt/.test(t))return'Tees';return'More';}

/* ---------- shop grid ---------- */
function renderFilters(){
  let tabs=[];
  const useful=collections.filter(c=>c.products.nodes.length&&c.products.nodes.length<products.length&&!/^(all|home ?page|frontpage)$/i.test(c.title));
  if(useful.length)tabs=useful.map(c=>({key:'c:'+c.handle,label:c.title,test:p=>c.products.nodes.some(n=>n.handle===p.handle)}));
  else{const kinds=[...new Set(products.map(kindOf))];if(kinds.length>1)tabs=kinds.map(k=>({key:'k:'+k,label:k,test:p=>kindOf(p)===k}));}
  tabs.unshift({key:'all',label:'All gear',test:()=>true});
  filt.innerHTML=tabs.map(t=>`<button type="button" aria-pressed="${t.key===cur}" data-k="${esc(t.key)}">${esc(t.label)}</button>`).join('');
  filt.onclick=e=>{const b=e.target.closest('[data-k]');if(!b)return;cur=b.dataset.k;filt.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));renderGrid(tabs.find(t=>t.key===cur).test);};
  renderGrid(()=>true);
}
function renderGrid(test){
  const list=products.filter(test);
  meta.textContent=list.length+' piece'+(list.length===1?'':'s');
  grid.innerHTML=list.map(p=>{
    const i0=p.images.nodes[0],i1=p.images.nodes[1],lo=p.priceRange.minVariantPrice,hi=p.priceRange.maxVariantPrice;
    const co=colorOpt(p),n=co?co.optionValues.length:0;
    const sw=co?co.optionValues.slice(0,6).map(v=>v.swatch&&v.swatch.color?`<i style="background:${esc(v.swatch.color)}" title="${esc(v.name)}"></i>`:'').join(''):'';
    return `<button type="button" class="mh-card${p.availableForSale?'':' out'}" data-h="${esc(p.handle)}">
      <span class="mh-img">${i0?`<img src="${img(i0.url,700)}" alt="${esc(i0.altText||p.title)}" loading="lazy">`:''}${i1?`<img class="alt" src="${img(i1.url,700)}" alt="" loading="lazy">`:''}
        ${p.availableForSale?'':'<span class="mh-badge">Sold out</span>'}<span class="mh-quick">View +</span></span>
      <span class="mh-info"><b>${esc(nb(p.title))}</b><span class="mh-price">${+lo.amount!==+hi.amount?'From ':''}${money(lo)}</span>
        ${n>1?`<span class="mh-colors">${sw?`<span class="mh-sw">${sw}</span>`:''}${n} colors</span>`:''}</span></button>`;}).join('')||'<p class="muted">Nothing here right now. Check back soon.</p>';
}
grid.addEventListener('click',e=>{const c=e.target.closest('[data-h]');if(c)openProduct(products.find(p=>p.handle===c.dataset.h));});

/* ---------- product pop-up ---------- */
function openProduct(p){
  if(!p)return;
  const sel={};p.options.forEach(o=>{const firstOk=p.variants.nodes.find(v=>v.availableForSale)||p.variants.nodes[0];const so=firstOk&&firstOk.selectedOptions.find(x=>x.name===o.name);sel[o.name]=so?so.value:o.optionValues[0].name;});
  const single=p.options.length===1&&p.options[0].optionValues.length===1;
  const variant=()=>p.variants.nodes.find(v=>v.selectedOptions.every(so=>sel[so.name]===so.value));
  const avail=(name,val)=>p.variants.nodes.some(v=>v.availableForSale&&v.selectedOptions.every(so=>so.name===name?so.value===val:sel[so.name]===so.value));
  const gal=p.images.nodes;
  openModal(`<div class="mh-pop">
    <div class="mh-gal"><div class="mh-main">${gal[0]?`<img id="mhMain" src="${img(gal[0].url,1100)}" alt="${esc(gal[0].altText||p.title)}">`:''}</div>
      ${gal.length>1?`<div class="mh-thumbs">${gal.map((g,i)=>`<button type="button" data-g="${i}" aria-label="Photo ${i+1}"${i?'':' aria-current="true"'}><img src="${img(g.url,160)}" alt=""></button>`).join('')}</div>`:''}</div>
    <div class="mh-detail">
      <p class="eyebrow">Woodhouse Gear</p>
      <h3 id="modalTitle">${esc(nb(p.title))}</h3>
      <p class="mh-pp" id="mhPP"></p>
      <div id="mhOpts">${single?'':p.options.map(o=>`<div class="mh-opt"><span class="k">${esc(o.name)} <em data-on="${esc(o.name)}"></em></span><div class="mh-vals" data-o="${esc(o.name)}">${o.optionValues.map(v=>`<button type="button" data-v="${esc(v.name)}"${v.swatch&&v.swatch.color&&/colou?r/i.test(o.name)?` class="sw" style="--sw:${esc(v.swatch.color)}" aria-label="${esc(v.name)}"`:''}>${v.swatch&&v.swatch.color&&/colou?r/i.test(o.name)?'':esc(v.name)}</button>`).join('')}</div></div>`).join('')}</div>
      <div class="mh-buy"><div class="mh-qty"><button type="button" data-q="-1" aria-label="One fewer">−</button><span id="mhQ">1</span><button type="button" data-q="1" aria-label="One more">+</button></div>
        <button type="button" class="btn btn-teal" id="mhAdd">Add to bag</button></div>
      <p class="mh-small" id="mhMsg" aria-live="polite"></p>
      ${p.description?`<div class="mh-desc">${esc(p.description).replace(/\n{2,}/g,'</p><p>').replace(/^/,'<p>')}</p></div>`:''}
    </div></div>`,{cls:'mh-modal'});
  const root=document.querySelector('.mh-pop');let qty=1;
  function sync(){
    const v=variant();
    root.querySelectorAll('.mh-vals').forEach(g=>{const o=g.dataset.o;g.querySelectorAll('button').forEach(b=>{b.setAttribute('aria-pressed',String(sel[o]===b.dataset.v));b.classList.toggle('na',!avail(o,b.dataset.v));});
      const on=root.querySelector(`[data-on="${CSS.escape(o)}"]`);if(on)on.textContent=sel[o];});
    $('mhPP').innerHTML=v?`${money(v.price)}${v.compareAtPrice&&+v.compareAtPrice.amount>+v.price.amount?` <s>${money(v.compareAtPrice)}</s>`:''}`:money(p.priceRange.minVariantPrice);
    const b=$('mhAdd');b.disabled=!v||!v.availableForSale;b.textContent=!v?'Pick your options':v.availableForSale?'Add to bag':'Sold out';
    if(v&&v.image){const m=$('mhMain');if(m)m.src=img(v.image.url,1100);}
  }
  root.addEventListener('click',async e=>{
    const g=e.target.closest('[data-g]');if(g){$('mhMain').src=img(gal[+g.dataset.g].url,1100);root.querySelectorAll('[data-g]').forEach(x=>x.toggleAttribute('aria-current',x===g));return;}
    const vb=e.target.closest('[data-v]');if(vb){sel[vb.closest('[data-o]').dataset.o]=vb.dataset.v;sync();return;}
    const q=e.target.closest('[data-q]');if(q){qty=Math.max(1,Math.min(20,qty+(+q.dataset.q)));$('mhQ').textContent=qty;return;}
    if(e.target.closest('#mhAdd')){const v=variant();if(!v)return;const b=$('mhAdd');b.disabled=true;b.textContent='Adding…';
      try{await addLine(v.id,qty);closeModal();openCart();}catch(err){$('mhMsg').textContent='Could not add that just now. Try again in a moment.';b.disabled=false;b.textContent='Add to bag';}}
  });
  sync();
}

/* ---------- cart ---------- */
async function loadCart(){const id=store.get();if(!id)return renderCart();try{const d=await gql(Q_CART,{id});cart=d.cart;if(!cart)store.set(null);}catch(e){}renderCart();}
async function addLine(merchandiseId,quantity){
  const lines=[{merchandiseId,quantity}];
  let d=cart?await gql(M_ADD,{id:cart.id,lines}):null;
  if(!d||!d.cartLinesAdd.cart){d=await gql(M_CREATE,{lines});cart=d.cartCreate.cart;}else cart=d.cartLinesAdd.cart;
  store.set(cart.id);renderCart();
}
async function setQty(lineId,q){const d=q>0?await gql(M_UPD,{id:cart.id,lines:[{id:lineId,quantity:q}]}):await gql(M_DEL,{id:cart.id,ids:[lineId]});cart=(d.cartLinesUpdate||d.cartLinesRemove).cart;renderCart();}
function renderCart(){
  const n=cart?cart.totalQuantity:0;
  document.querySelectorAll('[data-cart-count]').forEach(c=>{c.textContent=n;c.classList.toggle('on',n>0);});
  document.querySelector('.mh-fab').classList.toggle('show',n>0);
  const lines=cart?cart.lines.nodes:[];
  $('mhLines').innerHTML=lines.length?lines.map(l=>{const m=l.merchandise,im=m.image||m.product.featuredImage;
    return `<div class="mh-line" data-l="${esc(l.id)}">${im?`<img src="${img(im.url,200)}" alt="">`:'<span class="mh-noimg"></span>'}
      <div class="mh-lt"><b>${esc(nb(m.product.title))}</b>${m.title&&m.title!=='Default Title'?`<small>${esc(m.title)}</small>`:''}<span class="mh-price">${money(m.price)}</span>
        <div class="mh-qty sm"><button type="button" data-lq="-1" aria-label="One fewer">−</button><span>${l.quantity}</span><button type="button" data-lq="1" aria-label="One more">+</button></div></div>
      <button type="button" class="mh-rm" data-rm aria-label="Remove ${esc(m.product.title)}">Remove</button></div>`;}).join('')
    :'<div class="mh-empty"><svg viewBox="0 0 256 340" aria-hidden="true"><use href="#wmark"/></svg><p>Your bag is empty.</p><button type="button" class="btn btn-ghost" data-cart-close>Browse the gear</button></div>';
  $('mhSubtotal').textContent=cart&&lines.length?money(cart.cost.subtotalAmount):'$0.00';
  $('mhCheckout').disabled=!lines.length;
}
$('mhLines').addEventListener('click',async e=>{
  const row=e.target.closest('[data-l]');if(!row)return;const line=cart.lines.nodes.find(l=>l.id===row.dataset.l);if(!line)return;
  const b=e.target.closest('[data-lq]'),rm=e.target.closest('[data-rm]');if(!b&&!rm)return;
  row.classList.add('busy');try{await setQty(line.id,rm?0:line.quantity+(+b.dataset.lq));}catch(err){row.classList.remove('busy');}
});
const drawer=$('mhCart'),scrim=$('mhScrim');
function openCart(){scrim.hidden=false;requestAnimationFrame(()=>{drawer.classList.add('open');scrim.classList.add('in');});drawer.setAttribute('aria-hidden','false');if(WH.lenis)WH.lenis.stop();setTimeout(()=>drawer.querySelector('.mh-x').focus(),50);}
function closeCart(){drawer.classList.remove('open');scrim.classList.remove('in');drawer.setAttribute('aria-hidden','true');setTimeout(()=>{scrim.hidden=true;},350);if(WH.lenis)WH.lenis.start();}
document.addEventListener('click',e=>{if(e.target.closest('[data-cart-open]')){e.preventDefault();openCart();}else if(e.target.closest('[data-cart-close]')||e.target===scrim)closeCart();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&drawer.classList.contains('open'))closeCart();});

/* ---------- checkout: Shopify's secure checkout in its own window over this page ---------- */
const co=$('mhCo');let win=null,poll=0;
$('mhCheckout').addEventListener('click',()=>{
  if(!cart)return;const url=cart.checkoutUrl;
  const w=Math.min(560,screen.availWidth-40),h=Math.min(860,screen.availHeight-60),l=Math.round((screen.availWidth-w)/2+(screen.availLeft||0)),t=Math.round((screen.availHeight-h)/2+(screen.availTop||0));
  win=window.open(url,'woodhouse-checkout',`popup=yes,width=${w},height=${h},left=${l},top=${t}`);
  if(!win){window.open(url,'_blank','noopener')||(location.href=url);return;}   /* popup blocked: open it in a tab instead */
  closeCart();co.hidden=false;requestAnimationFrame(()=>co.classList.add('in'));
  clearInterval(poll);poll=setInterval(async()=>{if(!win||win.closed){clearInterval(poll);await afterCheckout();}},700);
});
$('mhCoFocus').addEventListener('click',()=>{if(win&&!win.closed)win.focus();else afterCheckout();});
$('mhCoClose').addEventListener('click',()=>{co.classList.remove('in');co.hidden=true;});
async function afterCheckout(){
  /* a cart that went through checkout comes back empty or gone: that means the order is in */
  let done=false;try{const d=await gql(Q_CART,{id:cart.id});done=!d.cart||!d.cart.lines.nodes.length;if(d.cart)cart=d.cart;}catch(e){}
  if(done){cart=null;store.set(null);renderCart();
    co.querySelector('.mh-co-card').innerHTML='<svg viewBox="0 0 256 340" aria-hidden="true"><use href="#wmark"/></svg><h2>Thank <span class="o">you</span></h2><p>Your order is in. Shopify will email your receipt, and tracking once it ships. See you at the bar.</p><div class="btn-row" style="justify-content:center"><button type="button" class="btn btn-teal" id="mhCoDone">Keep browsing</button></div>';
    co.querySelector('#mhCoDone').onclick=()=>{co.classList.remove('in');co.hidden=true;};}
  else{co.classList.remove('in');co.hidden=true;renderCart();}
}

/* ---------- start ---------- */
(async()=>{
  if(!S.token){grid.innerHTML='<p class="muted">The shop is not connected yet.</p>';return;}
  try{const d=await gql(Q_SHOP);products=d.products.nodes;collections=d.collections.nodes;renderFilters();}
  catch(e){grid.innerHTML=`<div class="mh-fail"><p>The shop is taking a breather. Refresh in a moment.</p></div>`;meta.textContent='';console.warn('Shopify:',e.message);}
  loadCart();
})();
})();

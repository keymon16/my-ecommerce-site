
// Shared helpers and state
const $$ = (s, root=document)=>Array.from(root.querySelectorAll(s));
const $ = (s, root=document)=>root.querySelector(s);

const STORE = {
  cart: JSON.parse(localStorage.getItem('cart')||'[]'),
  wishlist: JSON.parse(localStorage.getItem('wishlist')||'[]'),
  compare: JSON.parse(localStorage.getItem('compare')||'[]'),
  user: JSON.parse(localStorage.getItem('user')||'null'),
  theme: localStorage.getItem('theme') || 'dark',
  products: (window.__DATA__||[]).map(p=>({...p,
    sale: Math.random()<.25 ? (10+Math.floor(Math.random()*30)) : 0,
    badge: (Math.random()<.2 && 'New') || (Math.random()<.2 && 'Hot') || (Math.random()<.25 && 'Sale') || ''
  }))
};

const save = (k,v)=>localStorage.setItem(k, JSON.stringify(v));
const priceAfterSale = p => Math.round(p.price*(1 - (p.sale||0)/100));
const formatINR = n => '₹' + n.toLocaleString('en-IN');
const placeholder = 'https://via.placeholder.com/800x600?text=Product';

function setTheme(){
  document.documentElement.classList.toggle('light', STORE.theme==='light');
}
function toggleTheme(){
  STORE.theme = STORE.theme==='light' ? 'dark' : 'light';
  localStorage.setItem('theme', STORE.theme);
  setTheme();
}
function updateBadges(){
  const count = STORE.cart.reduce((s,i)=>s+i.qty,0);
  const el = document.getElementById('cartCount');
  if(el) el.textContent = String(count);
}

function addToCart(id, qty=1){
  const it = STORE.cart.find(x=>x.id===id);
  if(it) it.qty += qty; else STORE.cart.push({id, qty});
  save('cart', STORE.cart); updateBadges(); toast('Added to cart');
}
function removeFromCart(id){
  STORE.cart = STORE.cart.filter(x=>x.id!==id);
  save('cart', STORE.cart); updateBadges();
}
function setQty(id, qty){
  const it = STORE.cart.find(x=>x.id===id); if(!it) return;
  it.qty = Math.max(1, qty); save('cart', STORE.cart); updateBadges();
}
function toggleWishlist(id){
  const i = STORE.wishlist.indexOf(id);
  if(i>=0) STORE.wishlist.splice(i,1); else STORE.wishlist.push(id);
  save('wishlist', STORE.wishlist);
}
function toggleCompare(id){
  const i = STORE.compare.indexOf(id);
  if(i>=0) STORE.compare.splice(i,1);
  else { if(STORE.compare.length>=4){ toast('You can compare up to 4 items'); return; } STORE.compare.push(id); }
  save('compare', STORE.compare);
}
function login(username){
  STORE.user = {username: username||'Guest'};
  save('user', STORE.user); location.reload();
}
function logout(){ STORE.user=null; localStorage.removeItem('user'); location.reload(); }
function toast(msg){
  const t = document.createElement('div'); t.className='toast'; t.textContent=msg;
  Object.assign(t.style,{position:'fixed',bottom:'16px',left:'50%',transform:'translateX(-50%)',background:'var(--card)',border:'1px solid var(--border)',padding:'10px 14px',borderRadius:'12px',zIndex:9999});
  document.body.appendChild(t); setTimeout(()=>t.remove(),1500);
}

function navInit(){
  setTheme(); updateBadges();
  const userBtn = document.getElementById('userBtn');
  if(userBtn){ userBtn.textContent = STORE.user ? `Hi, ${STORE.user.username}` : 'Login'; }
}

function productCard(p){
  return `<article class="card">
    <a href="product.html?id=${p.id}" class="img"><img src="${p.image}" alt="${p.title}" onerror="this.src='${placeholder}'"/></a>
    <div class="body">
      <div class="row" style="display:flex;justify-content:space-between;align-items:center">
        <strong>${p.title}</strong>
        ${p.sale?`<span class="badge">-${p.sale}%</span>`:''}
      </div>
      <div> ${formatINR(priceAfterSale(p))} ${p.sale?`<span class="pill">MRP <s>${formatINR(p.price)}</s></span>`:''} </div>
      <div class="pill">★ ${p.rating.toFixed(1)}</div>
      <div class="actions">
        <button class="btn primary" onclick="addToCart(${p.id})">Add to Cart</button>
        <button class="btn" onclick="toggleWishlist(${p.id});toast('Wishlist updated')">♡</button>
        <button class="btn" onclick="toggleCompare(${p.id});toast('Compare updated')">Compare</button>
      </div>
    </div>
  </article>`;
}

function buildHeader(active){
  return `<header class="site"><div class="container header-inner">
    <a class="brand" href="index.html">🛍️ <h1>Dynamic Web Solution</h1></a>
    <div class="grow"><input id="globalSearch" class="search" placeholder="Search products"/></div>
    <nav style="display:flex;gap:10px;align-items:center">
      <a class="btn ${active==='home'?'primary':''}" href="index.html">Home</a>
      <a class="btn ${active==='shop'?'primary':''}" href="shop.html">Shop</a>
      <a class="btn ${active==='about'?'primary':''}" href="about.html">About</a>
      <a class="btn ${active==='contact'?'primary':''}" href="contact.html">Contact</a>
      <a class="icon-btn" href="compare.html" title="Compare">📊</a>
      <a class="icon-btn" href="wishlist.html" title="Wishlist">💖</a>
      <a class="icon-btn" href="cart.html" title="Cart">🛒 <span id="cartCount">0</span></a>
      <button class="icon-btn" onclick="toggleTheme()">🌓</button>
      <a id="userBtn" class="btn" href="login.html"></a>
    </nav></div></header>`;
}

function buildFooter(){
  const y = new Date().getFullYear();
  return `<footer class="footer container"><span>© ${y} Dynamic Web Solution — Frontend Demo</span><span><a href="shop.html">Shop</a> · <a href="about.html">About</a> · <a href="contact.html">Contact</a></span></footer>`;
}

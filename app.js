/* Scalon — interações (drawer, filtros, countdown, sticky) */
const CART_KEY='scalon_proto_cart';
const getCart=()=>{try{return JSON.parse(localStorage.getItem(CART_KEY))||[]}catch(e){return[]}};
const setCart=c=>localStorage.setItem(CART_KEY,JSON.stringify(c));
const BRL=v=>v.toLocaleString('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:2});
const FREE_SHIP=799;

function updateBadge(){
  const n=getCart().reduce((a,i)=>a+i.qtd,0);
  document.querySelectorAll('.cartcount').forEach(el=>{el.textContent=n;el.style.display=n?'flex':'none'});
}
function addToCart(item){
  const c=getCart();const f=c.find(i=>i.id===item.id&&i.tam===item.tam);
  if(f)f.qtd+=item.qtd;else c.push(item);
  setCart(c);updateBadge();renderCart();openCart();
}
function renderCart(){
  const box=document.getElementById('cartItems');if(!box)return;
  const c=getCart();
  const sub=c.reduce((a,i)=>a+i.preco*i.qtd,0);
  document.getElementById('cartSub').textContent=BRL(sub);
  const falta=Math.max(0,FREE_SHIP-sub);
  document.getElementById('freeMsg').innerHTML=falta>0
    ?`Faltam <b>${BRL(falta)}</b> para o <b>frete grátis</b>`
    :`Você ganhou <b>frete grátis</b>`;
  document.getElementById('freeFill').style.width=Math.min(100,sub/FREE_SHIP*100)+'%';
  box.innerHTML=c.length?c.map((i,x)=>`
    <div class="citem">
      <img src="${i.img}" alt="${i.nome}" loading="lazy" onerror="this.style.opacity=.2">
      <div class="ci"><b>${i.nome}</b><br>Tamanho ${i.tam} · Qtd ${i.qtd}<br><b>${BRL(i.preco*i.qtd)}</b>
      <br><a href="#" onclick="rmCart(${x});return false" style="color:#7a2e2e;font-size:12px">remover</a></div>
    </div>`).join('')
    :'<p style="color:#6f6a66;font-size:14px">Seu carrinho está vazio. Que tal começar pelos <a href="colecao.html" style="color:#7a2e2e;font-weight:700">Mais Vendidos</a>?</p>';
}
function rmCart(x){const c=getCart();c.splice(x,1);setCart(c);updateBadge();renderCart()}
function openCart(){document.getElementById('drawer').classList.add('show');document.getElementById('scrim').classList.add('show')}
function closeCart(){document.getElementById('drawer').classList.remove('show');document.getElementById('scrim').classList.remove('show')}
function openModal(id){document.getElementById(id).classList.add('show')}
function closeModal(id){document.getElementById(id).classList.remove('show')}
function toggleMega(){document.getElementById('mega').classList.toggle('open')}

/* simulador de frete (mock — no Shopify: app de frete na PDP) */
function simFrete(){
  const cep=(document.getElementById('cep').value||'').replace(/\D/g,'');
  const box=document.getElementById('freteRes');
  if(cep.length<8){box.innerHTML='<div><span>Digite um CEP válido com 8 dígitos.</span></div>';return}
  const sul=/^(8|9)/.test(cep);
  box.innerHTML=`
    <div><span>Entrega padrão · 3 a ${sul?'6':'9'} dias úteis</span><b>R$ 24,90</b></div>
    <div><span>Entrega expressa · 1 a 3 dias úteis</span><b>R$ 39,90</b></div>
    <div><span>Retirada em loja parceira</span><b style="color:#1e7e46">Grátis</b></div>
    <div><span>Pedidos acima de ${BRL(FREE_SHIP)}</span><b style="color:#1e7e46">Frete grátis</b></div>`;
}

/* countdown outlet — relógio único atualiza announce (#count2) e box (#count);
   só existe na outlet (retorna nas demais páginas) */
function tick(){
  const top=document.getElementById('count2');
  if(!top)return; /* countdown só na outlet (única página com #count2 no announce) */
  const box=document.getElementById('count');
  const end=Date.now()+1000*60*60*0+1000*60*59;
  const f=()=>{let s=Math.max(0,Math.floor((end-Date.now())/1000));
    const t=String(Math.floor(s/3600)).padStart(2,'0')+':'+String(Math.floor(s%3600/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
    if(box)box.textContent=t;if(top)top.textContent=t};
  f();setInterval(f,1000);
}

/* Escape fecha drawer, modal e mega menu (foco/acessibilidade) */
document.addEventListener('keydown',e=>{
  if(e.key!=='Escape')return;
  closeCart();toggleMegaOff();
  document.querySelectorAll('.modal.show').forEach(m=>m.classList.remove('show'));
});
function toggleMegaOff(){const m=document.getElementById('mega');if(m)m.classList.remove('open')}

/* sticky ATC aparece após scroll (D1) */
window.addEventListener('scroll',()=>{
  const s=document.getElementById('sticky');if(!s)return;
  s.classList.toggle('show',window.scrollY>520);
},{passive:true});

/* faixa do topo: alterna promo ↔ rastreio (como a announcement bar original) */
function rotateAnnounce(){
  var a=document.getElementById('announce');if(!a)return;
  var m=a.querySelectorAll('.amsg');if(m.length<2)return;
  if(window.matchMedia('(prefers-reduced-motion:reduce)').matches)return;
  var i=0,t=setInterval(function(){m[i].classList.remove('on');i=(i+1)%m.length;m[i].classList.add('on')},4000);
  a.addEventListener('mouseenter',function(){clearInterval(t)});
}
document.addEventListener('DOMContentLoaded',()=>{updateBadge();renderCart();tick();rotateAnnounce()});

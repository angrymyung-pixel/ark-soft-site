(()=>{'use strict';
const film=document.querySelector('#heroFilm'),toggle=document.querySelector('#filmToggle'),trailer=document.querySelector('#trailerDialog'),full=document.querySelector('#fullFilm'),art=document.querySelector('#artDialog'),large=document.querySelector('#largeArt');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
document.querySelectorAll('[data-trailer]').forEach(b=>b.addEventListener('click',()=>{trailer.showModal();full.play().catch(()=>{});}));
trailer.addEventListener('close',()=>full.pause());
full.addEventListener('error',()=>{document.querySelector('#videoStatus').textContent='영상을 불러오지 못했습니다. 페이지를 새로고침한 뒤 다시 재생해 주세요.';});
document.querySelectorAll('dialog').forEach(d=>{d.querySelector('[data-close]').addEventListener('click',()=>d.close());d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});});
function openArt(el){const img=el.querySelector('img');large.src=img.dataset.full||img.src;large.alt=img.alt;document.querySelector('#artTitle').textContent=img.alt;art.showModal();}
document.querySelectorAll('.person,.shot').forEach(el=>{el.tabIndex=0;el.setAttribute('role','button');el.setAttribute('aria-label',el.querySelector('img').alt+' 확대 보기');el.addEventListener('click',()=>openArt(el));el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openArt(el);}});});
document.querySelectorAll('.person').forEach(el=>{el.addEventListener('pointermove',e=>{if(reduced.matches||e.pointerType!=='mouse')return;const r=el.getBoundingClientRect();el.style.setProperty('--ry',((e.clientX-r.left)/r.width-.5)*12+'deg');el.style.setProperty('--rx',(.5-(e.clientY-r.top)/r.height)*9+'deg');});el.addEventListener('pointerleave',()=>{el.style.setProperty('--rx','0deg');el.style.setProperty('--ry','0deg');});});
document.querySelectorAll('video').forEach(v=>{v.setAttribute('playsinline','');v.addEventListener('play',()=>{if(v===film)return;document.querySelectorAll('video').forEach(other=>{if(other!==v)other.pause();});});});
})();

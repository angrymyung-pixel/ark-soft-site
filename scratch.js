/* Two aligned images; opaque organic erasure with shrinking, non-fading trails. */
(()=>{'use strict';
const surface=document.getElementById('scratchSurface'),canvas=document.getElementById('scratchCanvas'),normal=document.getElementById('scratchFallback'),hidden=document.getElementById('scratchUnder');
if(!surface||!canvas)return;const ctx=canvas.getContext('2d');if(!ctx)return;
let width=0,height=0,dpr=1,ready=false,raf=0,last=0,inside=false,touchId=null,sx=0,sy=0,tx=0,ty=0,anchorX=0,anchorY=0,moving=false,hasStroke=false,seed=0,stamps=[];
const LIFE=2700,shapes=[];
const touchToggle=document.getElementById('scratchTouchToggle'),hint=document.getElementById('scratchHint');let touchEnabled=false;
function updateTouch(){surface.classList.toggle('touch-enabled',touchEnabled);touchToggle.setAttribute('aria-pressed',String(touchEnabled));touchToggle.textContent=touchEnabled?'문지르기 종료':'문질러 보기';hint.textContent=matchMedia('(any-pointer: coarse)').matches?(touchEnabled?'그림을 문질러 보세요. 종료하면 다시 스크롤할 수 있습니다.':'위아래로 스크롤하세요. 그림은 문질러 보기를 눌러 체험합니다.'):'화면을 문질러 다른 빛을 발견해 보세요';}
touchToggle.addEventListener('click',()=>{touchEnabled=!touchEnabled;reset();updateTouch();});updateTouch();
function organic(path,cx,cy,rx,ry,seed,reverse=false){const points=[];for(let i=0;i<48;i++){const a=(reverse?-1:1)*i*Math.PI*2/48;const noise=1+.095*Math.sin(3*a+seed)+.063*Math.sin(5*a+seed*2.1)+.041*Math.sin(9*a+seed*3.7)+.032*Math.sin(17*a+seed*1.3);points.push([cx+Math.cos(a)*rx*noise,cy+Math.sin(a)*ry*noise]);}const n=points.length;path.moveTo(...points[0]);for(let i=0;i<n;i++){const p0=points[(i+n-1)%n],p1=points[i],p2=points[(i+1)%n],p3=points[(i+2)%n];path.bezierCurveTo(p1[0]+(p2[0]-p0[0])/6,p1[1]+(p2[1]-p0[1])/6,p2[0]-(p3[0]-p1[0])/6,p2[1]-(p3[1]-p1[1])/6,...p2);}path.closePath();}
for(let i=0;i<12;i++){const p=new Path2D();organic(p,0,0,1,.84,i*.73);organic(p,-.31,.28,.24,.028,i+2,true);organic(p,.23,-.34,.19,.035,i+4,true);organic(p,.6,.14,.16,.02,i+6,true);shapes.push(p);}
function drawNormal(){ctx.globalCompositeOperation='source-over';ctx.clearRect(0,0,width,height);const scale=Math.max(width/normal.naturalWidth,height/normal.naturalHeight);const w=normal.naturalWidth*scale,h=normal.naturalHeight*scale;ctx.drawImage(normal,(width-w)/2,(height-h)/2,w,h);}
function resize(){const r=surface.getBoundingClientRect();width=r.width;height=r.height;dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);stamps=[];inside=false;moving=false;if(ready)drawNormal();}
function wake(){if(!raf){last=performance.now();raf=requestAnimationFrame(frame);}}
function stamp(x,y,angle,speed,now){stamps.push({x,y,r:Math.min(width,height)*.095,angle,stretch:1+Math.min(.16,speed/180),born:now,seed:seed++%shapes.length});}
function frame(now){raf=0;const dt=Math.min(.05,(now-last)/1000);last=now;
if(inside&&moving){const k=1-Math.pow(1-.17,dt*60);sx+=(tx-sx)*k;sy+=(ty-sy)*k;const dx=sx-anchorX,dy=sy-anchorY,dist=Math.hypot(dx,dy),spacing=Math.max(1,Math.min(width,height)*.095*.09);if(dist>=spacing){const angle=Math.atan2(dy,dx),steps=Math.floor(dist/spacing);for(let i=1;i<=steps;i++){const t=i*spacing/dist;stamp(anchorX+dx*t,anchorY+dy*t,angle,dist,now);}anchorX+=dx*(steps*spacing/dist);anchorY+=dy*(steps*spacing/dist);}if(Math.hypot(tx-sx,ty-sy)<.5)moving=false;}
stamps=stamps.filter(s=>now-s.born<LIFE);drawNormal();ctx.globalCompositeOperation='destination-out';ctx.fillStyle='#000';for(const s of stamps){const life=Math.max(0,1-(now-s.born)/LIFE),radius=s.r*Math.pow(life,.85);ctx.save();ctx.translate(s.x,s.y);ctx.rotate(s.angle);ctx.scale(radius*s.stretch,radius);ctx.fill(shapes[s.seed],'evenodd');ctx.restore();}ctx.globalCompositeOperation='source-over';if((inside&&moving)||stamps.length)raf=requestAnimationFrame(frame);}
function position(e){const r=surface.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top};}
function enter(e){const p=position(e);sx=tx=anchorX=p.x;sy=ty=anchorY=p.y;inside=true;moving=false;hasStroke=false;}
function move(e){if(!ready||(e.pointerType!=='mouse'&&(!touchEnabled||touchId!==e.pointerId)))return;if(!inside)enter(e);const p=position(e);if(p.x===tx&&p.y===ty)return;if(!hasStroke){sx=anchorX=p.x;sy=anchorY=p.y;stamp(p.x,p.y,0,0,performance.now());hasStroke=true;}tx=p.x;ty=p.y;moving=true;wake();}
function leave(){inside=false;moving=false;}
surface.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')enter(e);});
surface.addEventListener('pointermove',move);
surface.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'||!touchEnabled)return;touchId=e.pointerId;enter(e);surface.setPointerCapture(e.pointerId);});
surface.addEventListener('pointerleave',leave);
function release(e){if(e.pointerId===touchId){if(surface.hasPointerCapture(e.pointerId))surface.releasePointerCapture(e.pointerId);touchId=null;leave();}}
surface.addEventListener('pointerup',release);surface.addEventListener('pointercancel',release);
function reset(){stamps=[];leave();if(raf)cancelAnimationFrame(raf);raf=0;if(ready)drawNormal();}
document.getElementById('scratchReset').addEventListener('click',()=>{reset();touchEnabled=false;updateTouch();});
document.querySelectorAll('dialog').forEach(d=>d.addEventListener('close',reset));
document.querySelectorAll('[data-trailer]').forEach(b=>b.addEventListener('click',reset));
document.addEventListener('visibilitychange',()=>{if(document.hidden)reset();});
new IntersectionObserver(([entry])=>{if(!entry.isIntersecting)reset();}).observe(surface);
new ResizeObserver(resize).observe(surface);
Promise.all([normal.decode(),hidden.decode()]).then(()=>{if(normal.naturalWidth!==hidden.naturalWidth||normal.naturalHeight!==hidden.naturalHeight)throw Error('Image dimensions differ');ready=true;resize();surface.classList.add('ready');}).catch(()=>{document.getElementById('scratchStatus').textContent='장면은 감상할 수 있지만, 문지르기 효과를 불러오지 못했습니다.';});
})();

(()=>{'use strict';
 const bgm=document.getElementById('siteBgm');if(!bgm)return;
 const toggle=document.getElementById('musicToggle'),state=document.getElementById('musicState'),status=document.getElementById('musicStatus'),dock=document.querySelector('.sound-dock'),heroMusic=document.getElementById('heroMusic'),volume=document.getElementById('musicVolume');
 const videos=Array.from(document.querySelectorAll('video'));
 const read=k=>{try{return localStorage.getItem(k)}catch{return null}},write=(k,v)=>{try{localStorage.setItem(k,String(v))}catch{}};
 const storedVolume=read('arkMusicVolume');const n=storedVolume===null?34:Number(storedVolume);volume.value=Number.isFinite(n)?Math.max(0,Math.min(100,n)):34;bgm.volume=Number(volume.value)/100;
 let wanted=false,pending=false,failed=false;
 const videoPlaying=()=>videos.some(v=>!v.paused&&!v.ended);
 const permitted=()=>wanted&&!document.hidden&&!videoPlaying();
 function paint(){const playing=!bgm.paused;dock.classList.toggle('playing',playing);toggle.setAttribute('aria-pressed',String(wanted));toggle.setAttribute('aria-label',wanted?'배경음악 끄기':'배경음악 켜기');state.textContent=failed?'재생 실패 · 다시 시도':playing?'재생 중 · 누르면 끄기':wanted?(videoPlaying()?'영상 감상 중 · 음악 대기':'음악 대기'):'음악 켜기';heroMusic.textContent=wanted?'♫ 음악 끄기':'♫ 음악과 함께 감상';}
 async function reconcile(){if(!permitted()){bgm.pause();paint();return;}if(pending||!bgm.paused){paint();return;}pending=true;try{await bgm.play();failed=false;status.textContent='';if(!permitted())bgm.pause();}catch{failed=true;wanted=false;status.textContent='음악을 재생하지 못했습니다. 버튼을 눌러 다시 시도해 주세요.';}finally{pending=false;paint();}}
 function toggleMusic(){wanted=!wanted;failed=false;status.textContent='';reconcile();}
 toggle.addEventListener('click',toggleMusic);heroMusic.addEventListener('click',toggleMusic);
 volume.addEventListener('input',()=>{bgm.volume=Number(volume.value)/100;write('arkMusicVolume',volume.value)});
 bgm.addEventListener('play',paint);bgm.addEventListener('pause',paint);bgm.addEventListener('error',()=>{failed=true;wanted=false;bgm.pause();status.textContent='음악 파일을 불러오지 못했습니다. 연결을 확인한 뒤 다시 시도해 주세요.';paint()});
 let scheduled=false;function schedule(){if(scheduled)return;scheduled=true;queueMicrotask(()=>{scheduled=false;reconcile()})}
 videos.forEach(v=>['play','pause','ended','emptied','error'].forEach(name=>v.addEventListener(name,schedule)));
 document.addEventListener('visibilitychange',reconcile);addEventListener('pagehide',()=>bgm.pause());paint();
 const motion=document.getElementById('motionToggle'),hero=document.getElementById('messiah'),reduced=matchMedia('(prefers-reduced-motion: reduce)');let motionWanted=!reduced.matches,inView=true;
 function paintMotion(){const stopped=!motionWanted||document.hidden||!inView;document.body.classList.toggle('motion-paused',stopped);motion.setAttribute('aria-pressed',String(motionWanted));motion.disabled=reduced.matches;motion.textContent=reduced.matches?'움직임 줄임 설정 적용':motionWanted?'움직임 멈춤':'움직임 켜기';}
 motion.addEventListener('click',()=>{motionWanted=!motionWanted;paintMotion()});reduced.addEventListener('change',()=>{motionWanted=!reduced.matches;paintMotion()});document.addEventListener('visibilitychange',paintMotion);
 if('IntersectionObserver'in window)new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;paintMotion()},{threshold:0}).observe(hero);paintMotion();
})();

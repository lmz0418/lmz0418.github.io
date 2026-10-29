import {getLang} from './i18n.js';
import {getFilmPlayer} from './film-player.js?v=20261030-smooth1';
import {works} from './works.js?v=20261030-smooth1';
import {advanceCinemaScroll} from './cinema-scroll.js?v=20261030-smooth1';

const mobile=matchMedia('(max-width: 900px), (pointer: coarse), (hover: none)');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const focus=[.36,.51,.66,.80];
const films=['seedance','capcut','reno','lixiang'].map(id=>works.find(work=>work.id===id));
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const smooth=v=>{v=clamp(v);return v*v*(3-2*v);};
const label=(zh,en)=>getLang()==='en'?en:zh;
let installed=false,sceneModule=null,current=null,generation=0,opening=0,css=null,cssReady=null;
let previousStats=null;

function restoreEntry(){document.documentElement.classList.remove('desktop-cinema-pending');}
function showPortfolio(anchor='#portfolio'){
  document.body.classList.remove('desktop-cinema-active');
  restoreEntry();
  document.getElementById('portfolio')?.removeAttribute('inert');
  if(anchor){
    history.replaceState(history.state,'',location.pathname+location.search+anchor);
    document.getElementById(anchor.slice(1))?.scrollIntoView({behavior:'instant',block:'start'});
  }
}
function close(anchor='#portfolio'){
  const session=current;
  generation++;
  opening=0;
  if(session){
    current=null;
    session.events.abort();
    clearTimeout(session.loadTimer);
    cancelAnimationFrame(session.raf);
    session.engine?.dispose();
    previousStats={...session.engine?.stats,closed:true};
    session.root.remove();
  }
  showPortfolio(anchor);
  if(anchor==='#portfolio')document.getElementById('workNav')?.focus({preventScroll:true});
}
function schedule(session){
  if(current!==session||session.raf||document.hidden||document.querySelector('dialog[open]'))return;
  session.raf=requestAnimationFrame(now=>frame(session,now));
}
function mediaAllowed(session){
  return !document.hidden&&!document.querySelector('dialog[open]')&&(!session.mobile||(
    !session.dragging&&!session.posterOnly&&!navigator.connection?.saveData&&Math.abs(session.target-session.progress)<.0003
  ));
}
function frame(session,now){
  session.raf=0;
  if(current!==session||document.hidden||document.querySelector('dialog[open]'))return;
  const frameGap=now-session.last;
  const dt=Math.min(.045,Math.max(.001,frameGap/1000));session.last=now;
  const delta=session.target-session.progress;
  if(session.mobile&&Math.abs(delta)>.001&&frameGap<250){
    session.slowFrames=Math.max(0,session.slowFrames+(frameGap>45?1:-.5));
    if(session.slowFrames>12&&session.quality>.6){
      session.quality=session.quality===1?.75:.6;
      session.engine?.setQuality(session.quality);
      session.posterOnly=session.quality===.6;session.slowFrames=0;
    }
  }
  session.progress+=delta*(1-Math.exp(-dt/.115));
  if(Math.abs(session.target-session.progress)<.00006)session.progress=session.target;
  const p=session.progress;
  if(session.mobile)session.engine?.setMediaEnabled(mediaAllowed(session));
  session.engine?.setProgress(p);
  session.engine?.render();
  session.canvas.style.opacity=String(smooth(p/.20)*(1-smooth((p-.92)/.075)));
  session.portal.style.opacity=String(1-smooth((p-.055)/.17));
  session.portal.style.transform=`scale(${1+smooth(p/.24)*2.4})`;
  session.portal.style.visibility=p>.235?'hidden':'';
  const visible=smooth((p-.26)/.06)*(1-smooth((p-.87)/.04));
  session.caption.style.opacity=String(visible);
  session.watch.style.opacity=String(visible);
  session.watch.style.visibility=visible>.2?'visible':'hidden';
  const index=focus.reduce((best,point,i)=>Math.abs(p-point)<Math.abs(p-focus[best])?i:best,0);
  if(index!==session.index){session.index=index;localize(session);}
  session.progressText.textContent=String(Math.round(p*100)).padStart(2,'0')+' / 100';
  session.progressFill.style.transform=`scaleX(${p})`;
  session.root.dataset.progress=p.toFixed(5);
  if(p>=.992&&session.target>=.999){close();return;}
  if(Math.abs(session.target-p)>.00006)schedule(session);
}
function move(session,pixels,divisor=3000){
  if(current!==session||!Number.isFinite(pixels)||!pixels)return;
  session.target=advanceCinemaScroll(session.target,clamp(pixels,-360,360)/divisor,focus);
  if(session.mobile)session.engine?.setMediaEnabled(false);
  schedule(session);
}
function localize(session){
  const work=films[session.index];
  session.root.setAttribute('aria-label',label('李明泽 · 交互影院','Mingze Li · Interactive cinema'));
  session.root.querySelector('.dc-tagline').textContent=label('让想象，拥有质感。','GIVE IMAGINATION A TANGIBLE FORM.');
  session.root.querySelector('.dc-hint strong').textContent=session.mobile?label('上滑，进入影院','SWIPE TO EXPLORE'):label('滚动进入影院','SCROLL TO EXPLORE');
  session.root.querySelector('.dc-hint small').textContent=session.mobile?label('上滑前进 · 下滑返回','SWIPE UP / BACK DOWN'):label('向下前进 · 向上返回','SCROLL DOWN / BACK UP');
  session.root.querySelector('.dc-exit').textContent=label('直接看作品 ↗','VIEW WORK ↗');
  session.root.querySelector('.dc-watch-label').textContent=label('观看完整影片','WATCH FULL FILM');
  session.root.querySelector('.dc-caption small').textContent=`${String(session.index+1).padStart(2,'0')} / 04 — SELECTED FILM`;
  session.root.querySelector('.dc-caption h2').textContent=getLang()==='en'?work.titleEn:work.title;
  session.root.querySelector('.dc-caption p').textContent=getLang()==='en'?work.roleEn:work.role;
}
async function open(){
  if(current||opening||reduced.matches){restoreEntry();return;}
  const id=++generation;
  opening=id;
  if(!cssReady){
    cssReady=new Promise((resolve,reject)=>{
      css=document.createElement('link');css.rel='stylesheet';css.href=new URL('./desktop-cinema.css?v=20261030-touch2',import.meta.url).href;
      const timer=setTimeout(()=>reject(new Error('Cinema style timeout')),4000);
      css.onload=()=>{clearTimeout(timer);resolve();};
      css.onerror=()=>{clearTimeout(timer);reject(new Error('Cinema style unavailable'));};
      document.head.append(css);
    });
  }
  try{await cssReady;}catch{css?.remove();css=cssReady=null;if(id===generation){opening=0;restoreEntry();}return;}
  if(id!==generation)return;
  opening=0;
  if(reduced.matches){restoreEntry();return;}
  const events=new AbortController();
  const root=document.createElement('section');root.className='desktop-cinema';root.id='desktopCinema';root.tabIndex=-1;
  const isMobile=mobile.matches;
  if(isMobile)root.classList.add('dc-touch');
  root.innerHTML=`<canvas aria-hidden="true"></canvas><div class="dc-shade"></div>
    <div class="dc-frame" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
    <div class="dc-meta" aria-hidden="true"><span><b></b>MINGZE LI</span><span>AI CINEMA / SELECTED WORKS</span></div>
    <div class="dc-portal"><div class="dc-mark" role="img" aria-label="MAKE BELIEVE"></div><p class="dc-tagline"></p></div>
    <div class="dc-caption"><small></small><h2></h2><p></p></div>
    <button class="dc-watch" type="button"><span aria-hidden="true">▶</span><span class="dc-watch-label"></span></button>
    <p class="dc-status" role="status"></p>
    <div class="dc-footer"><button class="dc-hint" type="button"><span class="dc-hint-arrow" aria-hidden="true">↓</span><span><strong></strong><small></small></span></button>
    <div class="dc-progress" aria-hidden="true"><span class="dc-progress-text">00 / 100</span><span class="dc-progress-track"><i class="dc-progress-fill"></i></span></div>
    <button type="button" class="dc-exit"></button></div>`;
  const session={root,events,engine:null,raf:0,progress:0,target:0,index:0,last:performance.now(),loadTimer:0,
    mobile:isMobile,dragging:false,pointer:null,quality:1,slowFrames:0,posterOnly:false,
    canvas:root.querySelector('canvas'),portal:root.querySelector('.dc-portal'),caption:root.querySelector('.dc-caption'),watch:root.querySelector('.dc-watch'),
    progressText:root.querySelector('.dc-progress-text'),progressFill:root.querySelector('.dc-progress-fill')};
  current=session;
  document.body.classList.add('desktop-cinema-active');restoreEntry();
  document.getElementById('portfolio')?.setAttribute('inert','');
  document.body.append(root);localize(session);root.focus({preventScroll:true});
  document.querySelectorAll('video').forEach(video=>video.pause());
  document.querySelector('.vgent-knowledge')?.contentWindow?.postMessage({type:'art-study:pause'},'*');
  const listen=(target,event,fn,extra={})=>target.addEventListener(event,fn,{...extra,signal:events.signal});
  const resize=()=>{if(session.mobile!==mobile.matches||reduced.matches){close(null);return;}session.engine?.resize(root.clientWidth,root.clientHeight);schedule(session);};
  listen(window,'resize',resize);
  if(window.visualViewport)listen(visualViewport,'resize',resize);
  listen(root,'wheel',event=>{if(event.ctrlKey||document.querySelector('dialog[open]'))return;event.preventDefault();move(session,event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1));},{passive:false});
  // Touch only belongs to the opening. The portfolio returns to native scrolling.
  const startTouch=(id,x,y,target)=>{
    if(session.pointer||document.querySelector('dialog[open]')||target.closest('button,a,input'))return false;
    session.pointer={id,x,y,startX:x,startY:y,vertical:false};session.dragging=true;
    if(session.mobile)session.engine?.setMediaEnabled(false);
    return true;
  };
  const moveTouch=(id,x,y)=>{
    const point=session.pointer;if(!point||point.id!==id)return false;
    const dx=x-point.startX,dy=y-point.startY;
    if(!point.vertical){if(Math.abs(dy)<6||Math.abs(dy)<Math.abs(dx))return false;point.vertical=true;}
    const travel=point.y-y;point.x=x;point.y=y;
    move(session,travel,Math.max(1100,Math.min(1800,root.clientHeight*2.1)));
    return true;
  };
  const endTouch=id=>{if(session.pointer?.id===id){session.pointer=null;session.dragging=false;session.last=performance.now();schedule(session);}};
  if(window.PointerEvent){
    listen(root,'pointerdown',event=>{
      if(event.pointerType==='mouse'||!event.isPrimary)return;
      if(startTouch(event.pointerId,event.clientX,event.clientY,event.target))root.setPointerCapture(event.pointerId);
    });
    listen(root,'pointermove',event=>{if(moveTouch(event.pointerId,event.clientX,event.clientY)&&event.cancelable)event.preventDefault();});
    for(const name of ['pointerup','pointercancel','lostpointercapture'])listen(root,name,event=>endTouch(event.pointerId));
  }else{
    listen(root,'touchstart',event=>{if(event.touches.length!==1)return;const point=event.touches[0];startTouch(point.identifier,point.clientX,point.clientY,event.target);},{passive:true});
    listen(root,'touchmove',event=>{const point=event.touches[0];if(point&&moveTouch(point.identifier,point.clientX,point.clientY)&&event.cancelable)event.preventDefault();},{passive:false});
    for(const name of ['touchend','touchcancel'])listen(root,name,event=>{for(const point of event.changedTouches)endTouch(point.identifier);},{passive:true});
  }
  listen(root,'keydown',event=>{
    if(event.key==='Escape'){event.preventDefault();close();return;}
    if(event.target.closest('button,a,input'))return;
    const amount={ArrowDown:150,ArrowUp:-150,PageDown:360,PageUp:-360,' ':360}[event.key];
    if(amount!==undefined){event.preventDefault();move(session,amount);}
    if(event.key==='End'){event.preventDefault();close();}
    if(event.key==='Home'){event.preventDefault();session.target=0;schedule(session);}
  });
  listen(root.querySelector('.dc-exit'),'click',()=>close());
  listen(root.querySelector('.dc-hint'),'click',()=>{session.target=session.progress<.26?.36:Math.min(1,session.target+.15);schedule(session);});
  listen(session.watch,'click',()=>{
    const work=films[session.index];session.engine?.setMediaEnabled(false);cancelAnimationFrame(session.raf);session.raf=0;
    getFilmPlayer().open({src:work.video,title:getLang()==='en'?work.titleEn:work.title,poster:work.poster});
  });
  listen(document.getElementById('filmDialog'),'close',()=>{if(current===session){session.engine?.setMediaEnabled(mediaAllowed(session));session.last=performance.now();schedule(session);}});
  listen(window,'portfolio-film-open',()=>{session.engine?.setMediaEnabled(false);cancelAnimationFrame(session.raf);session.raf=0;});
  listen(document,'visibilitychange',()=>{
    session.pointer=null;session.dragging=false;session.engine?.setMediaEnabled(mediaAllowed(session));
    if(!document.hidden){session.last=performance.now();schedule(session);}else{cancelAnimationFrame(session.raf);session.raf=0;}
  });
  listen(window,'languagechange',()=>localize(session));
  session.loadTimer=setTimeout(()=>{if(current===session)close();},6000);
  try{
    sceneModule??=import('./desktop-cinema-scene.js?v=20261030-touch2');
    const {createDesktopCinema}=await sceneModule;
    if(id!==generation||current!==session)return;
    session.engine=createDesktopCinema({canvas:session.canvas,mobile:session.mobile,onInvalidate:()=>schedule(session),onFatal:()=>{if(current===session)close();}});
    if(id!==generation){session.engine?.dispose();return;}
    clearTimeout(session.loadTimer);resize();
    session.engine.setMediaEnabled(mediaAllowed(session));
    session.engine.setProgress(session.progress);schedule(session);
  }catch(error){
    console.warn('The desktop cinema is unavailable; opening the portfolio.',error.message);
    sceneModule=null;if(current===session)close();
  }
}
export function initDesktopCinema({auto=false}={}){
  if(installed)return;installed=true;
  document.addEventListener('click',event=>{
    const link=event.target.closest('a');if(!link)return;
    if(link.id==='cinemaLink'){event.preventDefault();event.stopImmediatePropagation();if(reduced.matches)close();else open();return;}
    if((current||opening)&&(link.id==='workNav'||link.id==='home'||link.getAttribute('href')==='#contact')){
      event.preventDefault();event.stopImmediatePropagation();close(link.getAttribute('href')==='#contact'?'#contact':'#portfolio');
    }
  },true);
  mobile.addEventListener('change',()=>{if(current)close(null);});
  reduced.addEventListener('change',()=>{if(reduced.matches&&(current||opening))close(null);});
  addEventListener('pagehide',()=>{if(current||opening)close(null);});
  addEventListener('hashchange',()=>{if((current||opening)&&location.hash&&location.hash!=='#cinema')close(location.hash);});
  window.desktopCinema={open,close,get state(){return current?{active:true,progress:current.progress,target:current.target,index:current.index}:{active:false};},get stats(){return current?.engine?.stats||previousStats;}};
  if(auto)open();else restoreEntry();
}

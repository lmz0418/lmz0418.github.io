// Brand heading and a social-film presentation of the existing audience figures.
export function createBrandSocial(getLang,{reduced=false}={}){
  const css=document.createElement('link');css.rel='stylesheet';css.href=new URL('./brand-social.css?v=20261030-smooth1',import.meta.url).href;document.head.append(css);
  let observer=null,video=null,phone=null,metrics=[],userPaused=reduced,inView=false;
  const el=(tag,cls,text)=>{const e=document.createElement(tag);e.className=cls;if(text)e.textContent=text;return e;};
  const heart='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M20.8 4.6c-2.3-2.3-6-1.5-8.8 1.4C9.2 3.1 5.5 2.3 3.2 4.6c-3.9 4 1.2 10.1 8.8 15 7.6-4.9 12.7-11 8.8-15Z"/></svg>';
  const thumb='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M8 10 12 3c3 0 3 3 2 6h5c2 0 2 1 2 3l-2 8H8Z"/><path d="M3 10h5v10H3Z"/></svg>';
  function sync(){
    observer?.disconnect();video?.pause();metrics=[];
    const en=getLang()==='en',marquee=document.getElementById('clientMarquee'),host=document.getElementById('clientsBody');if(!marquee||!host)return;
    let title=document.getElementById('brandTrustHeading');
    if(!title){title=el('div','brand-trust-heading');title.id='brandTrustHeading';}
    title.replaceChildren(el('p','sec-eyebrow','SELECTED BRANDS'),el('h2','sec-title',en?'Brands featured in my work.':'参与项目涉及的品牌'));
    title.dataset.reveal='';
    marquee.before(title);
    const stats=Array.from(host.querySelectorAll('.stat-cell')).map(cell=>({value:cell.querySelector('.stat-value')?.textContent,label:cell.querySelector('.stat-label')?.textContent}));
    host.replaceChildren();host.classList.add('social-impact');
    phone=el('div','social-phone');
    const screen=el('div','social-screen');video=el('video','social-film');video.poster='assets/seedance-cover.webp';video.muted=true;video.loop=true;video.playsInline=true;video.preload='none';video.setAttribute('aria-label',en?'Seedance 2.5 film':'Seedance 2.5 作品视频');
    const status=el('div','social-status');status.append(el('span','','09:41'),el('span','social-island','MAKE BELIEVE'),el('span','','▥ ▰'));
    const caption=el('div','social-caption');caption.append(el('span','social-account','@MINGZE LI'),el('strong','','SEEDANCE 2.5'),el('p','',en?'From an idea to a moving story.':'从一个想象，到一段被看见的故事。'));
    const reactions=el('div','social-reactions');reactions.setAttribute('aria-hidden','true');
    for(let i=0;i<10;i++){const dot=el('span','social-reaction');dot.innerHTML=i%3?heart:thumb;dot.style.setProperty('--delay',`${-i*.67}s`);dot.style.setProperty('--drift',`${(i%3-1)*30}px`);reactions.append(dot);}
    const like=el('button','social-like');like.type='button';like.setAttribute('aria-label',en?'Send a heart':'送出一颗心');like.innerHTML=heart;
    like.setAttribute('aria-pressed','false');
    const sendHeart=()=>{like.classList.add('is-liked');like.setAttribute('aria-pressed','true');if(reduced)return;const dot=el('span','social-reaction social-burst is-liked');dot.innerHTML=heart;dot.style.setProperty('--drift',`${Math.round(Math.random()*70-35)}px`);reactions.append(dot);dot.addEventListener('animationend',()=>dot.remove(),{once:true});};
    like.addEventListener('click',sendHeart);
    screen.addEventListener('click',e=>{if(e.target.closest('button'))return;e.target.closest('.social-reaction')?.classList.add('is-liked');sendHeart();});
    const toggle=el('button','social-play',en?'Play':'播放');toggle.type='button';toggle.addEventListener('click',()=>{userPaused=!video.paused;applyPlayback();});
    video.addEventListener('play',()=>{toggle.textContent=en?'Pause':'暂停';});video.addEventListener('pause',()=>{toggle.textContent=en?'Play':'播放';});
    screen.append(video,status,reactions,caption,like,toggle);phone.append(screen);
    const copy=el('div','social-copy');copy.append(el('p','sec-eyebrow','MY PRACTICE'),el('h2','social-title',en?'Art in commercial projects.':'让美术，进入真实项目。'));
    const list=el('div','social-metrics');for(const stat of stats){const cell=el('div','social-metric');cell.dataset.reveal='';const value=el('strong','social-odometer');value.setAttribute('aria-label',stat.value);const wheels=[];
      for(const char of stat.value){const glyph=el('span',/\d/.test(char)?'social-digit':'social-unit');glyph.setAttribute('aria-hidden','true');if(/\d/.test(char)){const strip=el('span','social-wheel');const end=20+Number(char);for(let n=0;n<=end;n++)strip.append(el('span','social-numeral',String(n%10)));glyph.append(strip);wheels.push({strip,end});}else glyph.textContent=char;value.append(glyph);}
      metrics.push({cell,wheels,last:-1,started:null});cell.append(value,el('span','social-metric-label',stat.label));list.append(cell);}for(const heading of copy.children)heading.dataset.reveal='';copy.append(list);host.append(phone,copy);
    observer=new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;applyPlayback();},{threshold:.15});observer.observe(phone);
  }
  function update(now=performance.now()){
    for(const metric of metrics){const rect=metric.cell.getBoundingClientRect();if(rect.bottom<=0||rect.top>=innerHeight*1.05)metric.started=null;if(metric.started===null&&rect.bottom>0&&rect.top<innerHeight*.92)metric.started=now;const q=reduced?1:metric.started===null?0:Math.min(1,Math.max(0,(now-metric.started)/1100));const p=1-Math.pow(1-q,3);if(Math.abs(p-metric.last)<.0001)continue;metric.last=p;metric.cell.dataset.rollProgress=p.toFixed(3);for(const {strip,end} of metric.wheels)strip.style.transform=`translate3d(0,${-end*p}em,0)`;}
  }
  function applyPlayback(){if(!phone||!video)return;const active=inView&&!document.hidden&&!document.querySelector('dialog[open]');const playing=active&&!userPaused;phone.classList.toggle('is-playing',playing&&!reduced);phone.classList.toggle('is-arrived',active);if(playing){if(!video.getAttribute('src'))video.src='assets/seedance-preview.mp4';video.play().catch(()=>{});}else{video.pause();if(!active&&video.getAttribute('src')){video.removeAttribute('src');video.load();}}}
  const filmOpen=()=>{video?.pause();if(video?.getAttribute('src')){video.removeAttribute('src');video.load();}};
  addEventListener('portfolio-film-open',filmOpen);
  const visibility=()=>applyPlayback();document.addEventListener('visibilitychange',visibility);
  return {sync,update,dispose(){observer?.disconnect();video?.pause();document.removeEventListener('visibilitychange',visibility);removeEventListener('portfolio-film-open',filmOpen);css.remove();}};
}

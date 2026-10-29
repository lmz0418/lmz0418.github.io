import {getLang} from './i18n.js';
import {getMediaSources} from './media-sources.js?v=20261030-smooth1';

let player;
// Keep play() in the original click stack. A blocked promise is a request for
// another tap, not a media error, so native controls alone are not our fallback.
export function getFilmPlayer(){
  if(player)return player;
  const video=document.getElementById('fullFilm'),dialog=document.getElementById('filmDialog');
  const toolbar=document.createElement('div');toolbar.className='film-playback';
  const status=document.createElement('span');status.setAttribute('role','status');
  const play=document.createElement('button'),retry=document.createElement('button'),direct=document.createElement('a'),original=document.createElement('a');
  play.type=retry.type='button';play.className='film-play-button';retry.className='film-retry-button';
  direct.target='_blank';direct.rel='noopener';
  original.target='_blank';original.rel='noopener';original.hidden=true;original.dataset.originalMedia='';
  toolbar.append(status,play,retry,direct,original);video.after(toolbar);
  video.setAttribute('playsinline','');video.setAttribute('webkit-playsinline','');
  video.controls=true;video.preload='none';
  let timer=0,generation=0,state='idle',onClose=null,seekListener=null;
  const label=(zh,en)=>getLang()==='en'?en:zh;
  const messages={
    loading:['正在载入影片…','Loading film…'],
    blocked:['点击播放，开始观看。','Tap play to begin.'],
    waiting:['载入较慢，可以继续等待、重试或直接打开影片。','Loading is taking longer. Wait, retry or open the video.'],
    error:['影片暂未载入，请重试或直接打开。','The film could not load. Retry or open it directly.'],
    playing:['正在播放 · 支持全屏','Playing · Fullscreen available'],
    paused:['已暂停','Paused'],ended:['播放结束','Film ended']
  };
  function render(next=state){
    state=next;toolbar.hidden=!dialog.open||state==='idle';
    status.textContent=label(...(messages[state]||messages.loading));
    play.textContent=label(state==='ended'?'↻ 重播':'▶ 播放',state==='ended'?'↻ Replay':'▶ Play');
    retry.textContent=label('重新加载','Reload');direct.textContent=label('直接打开影片 ↗','Open video ↗');
    original.textContent=label('高清原片 ↗','Original quality ↗');
    play.hidden=state==='playing';retry.hidden=!['waiting','error'].includes(state);
    video.dataset.playbackState=state;
  }
  function clear(){clearTimeout(timer);timer=0;}
  function arm(){clear();timer=setTimeout(()=>{if(dialog.open&&video.getAttribute('src')&&!video.ended)render('waiting');},12000);}
  function attempt(reload=false){
    if(!dialog.open||!video.getAttribute('src'))return;
    const current=generation;
    if(reload||video.error)video.load();
    render('loading');arm();
    video.play().catch(error=>{
      if(current!==generation||!dialog.open||error.name==='AbortError')return;
      clear();video.dataset.playbackFailure=error.name;
      render(error.name==='NotAllowedError'?'blocked':'error');
    });
  }
  play.addEventListener('click',()=>attempt());retry.addEventListener('click',()=>attempt(true));
  video.addEventListener('playing',()=>{clear();delete video.dataset.playbackFailure;render('playing');});
  video.addEventListener('waiting',()=>{if(dialog.open){render('loading');arm();}});
  video.addEventListener('stalled',()=>{if(dialog.open&&!video.paused)arm();});
  video.addEventListener('pause',()=>{if(dialog.open&&video.readyState>=2&&!video.ended&&!['loading','waiting','error','blocked'].includes(state)){clear();render('paused');}});
  video.addEventListener('ended',()=>{clear();render('ended');});
  video.addEventListener('error',()=>{if(dialog.open&&video.getAttribute('src')){clear();video.dataset.playbackFailure=String(video.error?.code||'media');render('error');}});
  const close=()=>{
    generation++;clear();seekListener?.abort();seekListener=null;
    const callback=onClose;onClose=null;
    if(video.readyState>=1&&!video.seeking)callback?.(video.currentTime);
    video.pause();video.removeAttribute('src');video.removeAttribute('poster');delete video.dataset.originalSrc;video.load();original.hidden=true;original.removeAttribute('href');render('idle');
  };
  dialog.addEventListener('close',close);
  document.getElementById('closeFilm').addEventListener('click',()=>dialog.close());
  addEventListener('languagechange',()=>render());
  player={video,open({src,title,poster,muted=false,startAt=0,onFinish=null}){
    generation++;clear();seekListener?.abort();seekListener=new AbortController();
    onClose=onFinish;video.pause();delete video.dataset.playbackFailure;
    document.getElementById('filmTitle').textContent=title;
    if(poster)video.poster=poster;else video.removeAttribute('poster');
    const media=getMediaSources(src);
    direct.href=media.src;original.href=media.originalSrc;original.hidden=!media.isLite;video.muted=muted;
    if(!dialog.open)dialog.showModal();
    // Release WebGL/background streams before the requested film starts fetching.
    window.dispatchEvent(new Event('portfolio-film-open'));
    video.dataset.originalSrc=src;
    video.src=media.src;
    if(startAt>0)video.addEventListener('loadedmetadata',()=>{
      video.currentTime=Math.min(startAt,Math.max(0,video.duration-.1));
    },{once:true,signal:seekListener.signal});
    attempt();
  }};
  return player;
}

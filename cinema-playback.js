import * as THREE from 'three';

// Distant screens use silent excerpts. Nearby screens play the complete film
// from its selected cue, with the original soundtrack and a distance-based fade.
export function createCinemaPlayback(cinema,previews,details,cues){
  const firstFilm=cinema.halls[0].mediaIndex;
  const mobile=matchMedia('(pointer: coarse)').matches||Boolean(navigator.connection?.saveData);
  let backgroundStarted=false,suspended=/^#(?:portfolio|work|contact|about|agent|idtalk|tools|art-collections|post-workflow)$/.test(location.hash),currentFilm=firstFilm,currentProgress=0;
  const players=details.map((detail,index)=>{
    const video=detail.metadata;video.preload='none';video.playsInline=true;video.muted=true;video.volume=0;video.hidden=true;
    if(video.getAttribute('src')){video.removeAttribute('src');video.load();}
    video.dataset.cinemaFilm=String(index);video.setAttribute('aria-hidden','true');document.body.append(video);
    const texture=new THREE.VideoTexture(video);texture.colorSpace=THREE.SRGBColorSpace;
    const player={video,texture,src:detail.src,gain:0,wanted:false,started:false,blocked:false,unlocking:false,pending:false,version:0,resumeTime:null};
    video.addEventListener('ended',()=>{if(player.wanted){video.currentTime=cues[index].start;video.play().catch(()=>{})}});
    return player;
  });
  const intro=document.createElement('audio');intro.loop=true;intro.preload='none';intro.hidden=true;intro.dataset.cinemaIntro='true';intro.volume=0;document.body.append(intro);
  let sound=true,audioBlocked=false,introRequested=false,unlocked=false,introUnlocking=false;
  function ensurePlayer(index){
    const player=players[index];if(suspended||!player?.src)return;
    if(player.video.getAttribute('src')===player.src)return;
    player.video.preload='auto';player.video.src=player.src;player.video.load();
  }
  function ensureIntro(){
    if(suspended||intro.getAttribute('src'))return;
    intro.preload='auto';intro.src='design-assets/cinema-intro.m4a';intro.load();
  }
  function releasePlayer(player){
    if(player.started&&Number.isFinite(player.video.currentTime))player.resumeTime=player.video.currentTime;
    player.version++;player.pending=player.unlocking=player.started=player.wanted=false;
    player.video.pause();player.video.muted=true;player.gain=0;player.video.volume=0;
    if(player.video.getAttribute('src')){player.video.removeAttribute('src');player.video.preload='none';player.video.load();}
  }
  function suspendBackground(){
    if(suspended)return;
    suspended=true;pause();players.forEach(releasePlayer);backgroundStarted=false;unlocked=false;
    if(intro.getAttribute('src')){intro.removeAttribute('src');intro.preload='none';intro.load();}
  }
  function resumeBackground(){if(!suspended)return;suspended=false;backgroundStarted=false;}
  function playFilm(player){
    if(suspended||player.pending||player.unlocking||!player.video.getAttribute('src'))return;
    player.pending=true;const version=player.version;
    player.video.play().then(()=>{if(version===player.version&&!player.video.muted)player.blocked=false;}).catch(error=>{
      if(version!==player.version||suspended)return;
      if(error.name==='NotAllowedError'){
        player.blocked=true;player.video.muted=true;
        player.video.play().catch(()=>{});
      }
    }).finally(()=>{if(version===player.version)player.pending=false;});
  }
  const startIntro=()=>{
    if(introRequested)return;
    introRequested=true;
    intro.play().then(()=>{audioBlocked=false}).catch(error=>{audioBlocked=error.name==='NotAllowedError';introRequested=false});
  };
  function update(dt,progress,camera,enabled,dialogOpen){
    if(dialogOpen||document.hidden){suspendBackground();return;}
    if(suspended)return;
    currentProgress=progress;currentFilm=cinema.active(progress).mediaIndex;
    if(enabled&&mobile){
      for(const [index,player] of players.entries()){
        if(index===currentFilm)ensurePlayer(index);
        else if(player.video.getAttribute('src'))releasePlayer(player);
      }
    }else if(enabled&&!backgroundStarted){
      backgroundStarted=true;
      for(const hall of cinema.halls)if(!hall.externalMedia)ensurePlayer(hall.mediaIndex);
    }
    const introWanted=enabled&&progress<.345;
    const introTarget=sound&&introWanted ? .6*(1-THREE.MathUtils.smoothstep(progress,.25,.345)):0;
    intro.volume+=(introTarget-intro.volume)*(1-Math.exp(-dt/(introTarget>intro.volume?1300:650)));
    intro.muted=!sound;intro.dataset.audioGain=intro.volume.toFixed(3);
    if(introWanted&&sound&&!audioBlocked){ensureIntro();startIntro();}
    if(!introWanted&&intro.volume<.002&&!introUnlocking){intro.pause();introRequested=false;}
    const weights=cinema.weights(progress),gains=players.map(()=>0);players.forEach(player=>player.wanted=false);
    for(const hall of cinema.halls){
      if(hall.externalMedia)continue;
      const weight=weights[hall.n-1];
      const allowed=enabled&&progress>.31&&progress<.9;
      const enter=allowed&&weight>.08;
      const stay=enter;
      hall.engaged=hall.engaged?stay:enter;
      const player=players[hall.mediaIndex],video=player.video;
      if(hall.engaged){
        player.wanted=true;
        gains[hall.mediaIndex]=Math.max(gains[hall.mediaIndex],weight*THREE.MathUtils.smoothstep(progress,.31,.345));
        if(!player.started&&video.readyState>=3){
          video.currentTime=Math.min(player.resumeTime??cues[hall.mediaIndex].start,Math.max(0,video.duration-.1));player.resumeTime=null;player.started=true;
          video.muted=!sound;
          playFilm(player);
        }
      }
      const texture=hall.engaged&&player.started?player.texture:previews[hall.mediaIndex].texture;
      if(hall.screenMaterial.map!==texture){hall.screenMaterial.map=texture;hall.screenMaterial.needsUpdate=true;}
      // Retain the currently displayed video for screen-based effects.
      hall.currentVideo=texture===player.texture?video:previews[hall.mediaIndex].video;
    }
    const sum=Math.max(1,gains.reduce((a,b)=>a+b,0));
    players.forEach((player,index)=>{
      const desired=sound&&!dialogOpen?gains[index]/sum:0;
      player.gain+=(desired-player.gain)*(1-Math.exp(-dt/(desired>player.gain?800:1000)));
      player.video.volume=THREE.MathUtils.clamp(player.gain,0,1);player.video.dataset.audioGain=player.video.volume.toFixed(3);
      player.video.muted=!sound||player.blocked||dialogOpen||document.hidden;
      player.video.dataset.audioBlocked=String(player.blocked);
      if(!player.wanted&&player.gain<.002&&!player.unlocking){player.video.pause();player.started=false;}
      else if(player.wanted&&player.started&&player.video.paused&&!dialogOpen&&!document.hidden)playFilm(player);
    });
  }
  async function setSound(on){
    sound=on;audioBlocked=false;
    if(!on){intro.muted=true;intro.pause();intro.volume=0;introRequested=false;players.forEach(player=>{player.video.muted=true;player.gain=0;player.video.volume=0});return false;}
    if(suspended||document.body.classList.contains('collection'))return false;
    if(unlocked&&!players.some(player=>player.blocked))return sound;
    // Unlock only the actual cinema films within the entry click, at zero volume.
    const needsIntro=!mobile||currentProgress<.345;if(needsIntro)ensureIntro();
    intro.muted=false;introUnlocking=needsIntro;
    const used=[...new Set(cinema.halls.filter(hall=>!hall.externalMedia&&(!mobile||hall.mediaIndex===currentFilm)).map(hall=>hall.mediaIndex))];
    const versions=used.map(index=>players[index].version);
    const attempts=await Promise.allSettled([needsIntro?intro.play().finally(()=>{introUnlocking=false;}):Promise.resolve(),...used.map(index=>{
      ensurePlayer(index);const player=players[index];player.video.muted=false;player.unlocking=true;const version=player.version;
      return player.video.play().then(()=>{if(version===player.version)player.blocked=false}).finally(()=>{if(version!==player.version)return;player.unlocking=false;if(!player.wanted||!sound||suspended)player.video.pause();});
    })]);
    if(suspended||used.some((index,n)=>players[index].version!==versions[n]))return false;
    introRequested=!intro.paused;
    audioBlocked=attempts[0].status==='rejected'&&attempts[0].reason?.name==='NotAllowedError';
    used.forEach((index,n)=>{
      players[index].blocked=attempts[n+1].status==='rejected'&&attempts[n+1].reason?.name==='NotAllowedError';
      if(!players[index].wanted)players[index].video.pause();
    });
    unlocked=attempts.every(result=>result.status==='fulfilled');
    return sound;
  }
  function pause(){intro.pause();intro.volume=0;introRequested=false;intro.dataset.audioGain='0.000';players.forEach(player=>{player.video.pause();player.video.muted=true;player.gain=0;player.video.volume=0;player.video.dataset.audioGain='0.000'});}
  function point(detail){const index=details.indexOf(detail),player=players[index];return player?.started?player.video.currentTime:(player?.resumeTime??cues[index]?.start??0)}
  function resume(detail,time){const player=players[details.indexOf(detail)];if(!player||!Number.isFinite(time))return;player.resumeTime=time;if(player.started&&player.video.readyState>=1)player.video.currentTime=time;}
  function resetIntro(){intro.pause();intro.currentTime=0;introRequested=false;}
  // A dropped range request leaves a media element permanently errored, so retry it with a clean load.
  function recover(){
    if(suspended)return false;
    let retried=false;
    for(const video of [intro,...players.map(player=>player.video),...previews.map(m=>m.video)]){
      if(!video.error||!video.getAttribute('src'))continue;
      retried=true;video.load();
      const player=players.find(candidate=>candidate.video===video);
      if(player){player.started=false;player.blocked=false}
      if(video===intro){introRequested=false;audioBlocked=false}
    }
    return retried;
  }
  function bufferReady(video,start=0){
    if(video.error)return false;
    if(video.readyState<3||video.seeking)return false;
    const end=Math.min(video.duration,start+8);
    for(let i=0;i<video.buffered.length;i++)if(video.buffered.start(i)<=start+.05&&video.buffered.end(i)>=end-.1)return true;
    return false;
  }
  function preparation(){
    // Only the first cinema can delay entry. Audio, unused excerpts, and later
    // full films load in the background; one stalled request cannot block all.
    const first=cinema.halls[0].mediaIndex,video=players[first].video,preview=previews[first].video;
    if(!suspended)ensurePlayer(first);
    const previewReady=!preview.error&&preview.readyState>=3;
    const filmReady=bufferReady(video,cues[first].start);
    return {ready:filmReady,playable:previewReady||filmReady,
      progress:Math.round((Number(previewReady)+Number(filmReady))/2*100),error:Boolean(video.error||preview.error)};
  }
  return {update,setSound,preparation,recover,suspendBackground,resumeBackground,unlocked:()=>unlocked,pause,point,resume,resetIntro,blocked:()=>audioBlocked||players.some(player=>player.wanted&&player.blocked)};
}

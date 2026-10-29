import * as THREE from 'three';
import { JOURNEY_LAST_FRAME as LAST_FRAME } from './journey-timing.js';
import { JOURNEY_EDIT } from './journey-edit.js';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));

// Both directions decode sequentially. Seek only at entry, reversal or an explicit jump.
export function createJourneyMedia(onFrame){
  const events=new AbortController(),samples=[],turns=[];
  const mobile=matchMedia('(pointer: coarse)').matches||Boolean(navigator.connection?.saveData);
  let active=null,disposed=false,failed=false,suspended=false,command=null,seeks=0,seekTotal=0,seekMax=0;
  const slots=[1,-1].map(sign=>{
    const video=document.createElement('video');
    video.hidden=true;video.playsInline=true;video.muted=true;video.preload='none';
    video.dataset.vgentJourney=sign===1?'forward':'reverse';document.body.append(video);
    const texture=new THREE.VideoTexture(video);texture.colorSpace=THREE.SRGBColorSpace;
    const slot={sign,video,texture,loaded:false,frame:sign===1?0:LAST_FRAME,ready:false,seekAt:0,pendingPlay:false,aligned:false,callback:0,version:0};
    const listen=(name,fn)=>video.addEventListener(name,fn,{signal:events.signal});
    listen('loadeddata',()=>{if(!slot.loaded)return;slot.ready=true;if(slot===active)onFrame(texture,slot.frame);});
    listen('seeked',()=>{
      if(!slot.loaded)return;
      slot.frame=sourceTime(slot,video.currentTime);slot.ready=true;texture.needsUpdate=true;
      if(slot.seekAt){const ms=performance.now()-slot.seekAt;seeks++;seekTotal+=ms;seekMax=Math.max(seekMax,ms);slot.seekAt=0;}
      if(slot===active)onFrame(texture,slot.frame);
    });
    listen('error',()=>{if(slot.loaded&&video.getAttribute('src'))failed=true;});
    function frame(now,meta){
      if(disposed)return;
      if(!slot.loaded){slot.callback=video.requestVideoFrameCallback(frame);return;}
      const before=slot.frame;slot.frame=sourceTime(slot,meta.mediaTime);slot.ready=true;
      if(slot===active){
        onFrame(texture,slot.frame);
        if(!video.paused&&Math.abs(before-slot.frame)>.001){
          samples.push(now);while(samples[0]<now-2000)samples.shift();
          if(command&&Math.sign(slot.frame-before)===command.sign){
            turns.push({phase:command.phase,direction:command.sign,ms:Math.round(now-command.at)});if(turns.length>8)turns.shift();command=null;
          }
        }
      }
      slot.callback=video.requestVideoFrameCallback(frame);
    }
    if(video.requestVideoFrameCallback)slot.callback=video.requestVideoFrameCallback(frame);
    return slot;
  });
  active=slots[0];
  function sourceTime(slot,time){return clamp(slot.sign===1?time:LAST_FRAME-time,0,LAST_FRAME);}
  function mediaTime(slot,time){return slot.sign===1?time:LAST_FRAME-time;}
  function warm(sign){
    if(suspended||disposed)return;
    const wanted=sign===1||sign===-1?slots.filter(slot=>slot.sign===sign):mobile?[slots[0]]:slots;
    for(const slot of wanted){if(slot.loaded)continue;slot.loaded=true;slot.video.src=slot.sign<0?JOURNEY_EDIT.reverse:JOURNEY_EDIT.forward;slot.video.preload='auto';slot.video.load();}
  }
  function release(slot){
    slot.version++;slot.video.pause();slot.loaded=slot.ready=slot.aligned=slot.pendingPlay=false;slot.seekAt=0;
    if(slot.video.getAttribute('src')){slot.video.removeAttribute('src');slot.video.preload='none';slot.video.load();}
  }
  function suspendBackground(){if(suspended)return;suspended=true;slots.forEach(release);command=null;samples.length=0;}
  function resumeBackground(){suspended=false;}
  function align(slot,time){
    const v=slot.video;if(v.readyState<1||v.seeking)return false;
    const target=mediaTime(slot,clamp(time,0,LAST_FRAME));
    if(Math.abs(v.currentTime-target)<.024&&slot.ready){slot.aligned=true;return true;}
    v.pause();slot.seekAt=performance.now();v.currentTime=target;slot.aligned=true;return false;
  }
  function pauseAll(){for(const {video} of slots)if(!video.paused)video.pause();}
  function prime(){
    warm(1);
    // Decode and align the first frame while the previous cinema is still visible.
    const forward=slots[0];
    if(!forward.aligned||forward.video.currentTime>.024)align(forward,0);
  }
  function prepare(sign,time,velocity=0){
    if(suspended)return;
    const slot=slots.find(s=>s.sign===sign);if(!slot)return;
    warm(sign);
    command={sign,at:performance.now(),phase:time>LAST_FRAME?'gallery':'film'};
    // Pre-position the other decoder during the brief deceleration to zero.
    if(slot!==active){
      const v=Math.abs(velocity),distance=Math.sign(velocity)*.12*(v-Math.log1p(v));
      align(slot,time+distance);
    }
  }
  function sync(time,velocity,running){
    if(suspended)return {ready:false};
    if(failed){pauseAll();return {ready:false};}
    const target=clamp(time,0,LAST_FRAME),sign=Math.abs(velocity)>.025?Math.sign(velocity):active.sign;
    const wanted=slots.find(s=>s.sign===sign);
    warm(sign);
    if(wanted!==active){
      pauseAll();
      if(!align(wanted,target))return {ready:false};
      active=wanted;samples.length=0;onFrame(active.texture,active.frame);
      if(mobile)for(const slot of slots)if(slot!==active&&slot.loaded)release(slot);
    }
    const v=active.video;
    if(!active.ready||v.seeking||!active.aligned){pauseAll();return {ready:align(active,target)};}
    const within=time>=0&&time<=LAST_FRAME&&!v.ended;
    if(!running||!within||Math.abs(velocity)<.025){
      pauseAll();
      // Keep the end frame available throughout the geometric gallery handoff.
      if(!within&&Math.abs(sourceTime(active,v.currentTime)-target)>.025)align(active,target);
      return {ready:true};
    }
    // Native media time is the picture clock. Never seek every animation frame.
    const rate=clamp(Math.abs(velocity),.0625,1);
    if((rate===1&&v.playbackRate!==1)||Math.abs(v.playbackRate-rate)>.015)v.playbackRate=rate;
    if(v.paused&&!active.pendingPlay){
      const slot=active,version=slot.version;slot.pendingPlay=true;
      v.play().catch(error=>{if(version===slot.version&&error.name!=='AbortError')failed=true;}).finally(()=>{if(version===slot.version)slot.pendingPlay=false;});
    }
    if(!v.requestVideoFrameCallback){active.frame=sourceTime(active,v.currentTime);onFrame(active.texture,active.frame);}
    return {ready:v.readyState>=2,time:sourceTime(active,v.currentTime)};
  }
  function stageForward(time){
    if(suspended)return false;
    warm(1);pauseAll();
    active=slots[0];
    if(mobile&&slots[1].loaded)release(slots[1]);
    const ready=align(active,time);
    if(ready)onFrame(active.texture,active.frame);
    return ready&&active.video.readyState>=2&&!active.video.seeking;
  }
  return {warm,prime,prepare,sync,stageForward,suspendBackground,resumeBackground,pause:pauseAll,
    get failed(){return failed;},get texture(){return active.texture;},get video(){return active.video;},
    get stats(){const now=performance.now();while(samples[0]<now-2000)samples.shift();const quality=active.video.getVideoPlaybackQuality?.();return {mode:'continuous',direction:active.sign,displayedFps:samples.length>1?+((samples.length-1)*1000/(samples.at(-1)-samples[0])).toFixed(1):0,seeks,meanSeekMs:seeks?Math.round(seekTotal/seeks):0,maxSeekMs:Math.round(seekMax),droppedFrames:quality?.droppedVideoFrames??null,turns:[...turns]};},
    reset(){pauseAll();samples.length=0;command=null;for(const s of slots)s.aligned=false;active=slots[0];if(active.loaded)align(active,0);},
    retry(){failed=false;suspended=false;for(const slot of slots)release(slot);warm(mobile?active.sign:undefined);},
    dispose(){disposed=true;events.abort();for(const {video,texture,callback} of slots){video.cancelVideoFrameCallback?.(callback);video.pause();video.removeAttribute('src');video.load();video.remove();texture.dispose();}}
  };
}

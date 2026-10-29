import * as THREE from 'three';
import {journeyFlightAt} from './journey-clock.js';
import {JOURNEY_FLIGHT_DURATION as DURATION,JOURNEY_FLIGHT_ANTICIPATION as ANTICIPATION} from './journey-timing.js';
import { JOURNEY_EDIT } from './journey-edit.js';

export const FLIGHT_TARGET=JOURNEY_EDIT.flightTarget;
const SCALE=JOURNEY_EDIT.proxyRate,LAND=.28;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));

// A small, pre-accelerated proxy decodes continuously during the flight. The
// original 4K decoder stages the destination once, behind the moving proxy.
export function createJourneyFlight(){
  const video=document.createElement('video');video.hidden=true;video.muted=true;video.playsInline=true;video.preload='none';
  video.dataset.vgentFlight='true';document.body.append(video);
  const texture=new THREE.VideoTexture(video);texture.colorSpace=THREE.SRGBColorSpace;
  let job=null,loaded=false,pending=false,failed=false;
  const onError=()=>{failed=true;};video.addEventListener('error',onError);
  function warm(){if(loaded)return;loaded=true;video.src=JOURNEY_EDIT.proxy;video.preload='auto';video.load();}
  function start(from){
    if(job)return false;
    warm();video.pause();job={from,origin:from,phase:'prepare',elapsed:0,wait:0,seek:false,blend:0,amount:0,velocity:0,time:from};return true;
  }
  function play(){if(video.paused&&!pending){pending=true;video.play().catch(e=>{if(e.name!=='AbortError')failed=true;}).finally(()=>{pending=false;if(!job)video.pause();});}}
  function update(dt,blocked,landingReady,rewindTime){
    if(!job)return null;
    const j=job,seconds=Math.min(.05,dt/1000);j.landed=false;
    if(blocked){video.pause();return j;}
    if(j.phase==='prepare'){
      j.wait+=seconds;
      if(rewindTime!==undefined)j.time=rewindTime;
      const rewound=j.origin-j.time>=Math.min(ANTICIPATION,j.origin)-.012;
      if(rewound&&video.readyState>=1&&!j.seek){j.from=j.time;video.currentTime=j.from/SCALE;j.seek=true;}
      if(j.seek&&!video.seeking&&video.readyState>=2){j.phase='fly';j.elapsed=0;}
      // A missing proxy still gets a short covered transition, never a stuck CTA.
      else if(failed||j.wait>3){j.phase='fallback';j.elapsed=0;}
    }
    if(j.phase==='fly'){
      if(video.readyState>=3&&!video.seeking){
        const curve=journeyFlightAt(j.from,FLIGHT_TARGET,j.elapsed,DURATION);
        const actual=video.currentTime*SCALE;
        video.playbackRate=clamp((curve.velocity+(curve.time-actual)*8)/SCALE,.0625,16);
        play();if(!video.paused)j.elapsed+=seconds;
        j.time=clamp(actual,j.from,FLIGHT_TARGET);
        j.amount=curve.envelope;j.velocity=curve.velocity;
        if(actual>=FLIGHT_TARGET-.04||j.elapsed>DURATION+.45){video.playbackRate=.25;j.phase='waiting';}
      }else j.wait+=seconds;
      if(failed||j.wait>5){video.pause();j.phase='fallback';j.elapsed=0;}
    }
    if(j.phase==='fallback'){
      j.elapsed+=seconds;j.amount=Math.min(1,j.elapsed/.18);
      if(j.elapsed>=.18)j.phase='waiting';
    }
    if(j.phase==='waiting'){play();j.time=video.currentTime*SCALE;j.amount*=Math.exp(-seconds/.12);}
    if(j.phase==='waiting'&&landingReady){j.phase='land';j.elapsed=0;j.time=FLIGHT_TARGET;j.landed=true;}
    else if(j.phase==='land'){
      j.landed=false;j.elapsed+=seconds;j.blend=clamp(j.elapsed/LAND,0,1);j.amount*=Math.exp(-seconds/.06);
      if(j.blend===1){reset();return null;}
    }
    video.dataset.flightPhase=j.phase;video.dataset.flightSource=String(JOURNEY_EDIT.trackOffset+j.time);
    return j;
  }
  function reset(){video.pause();job=null;video.dataset.flightPhase='idle';}
  return {warm,start,update,reset,texture,video,get active(){return !!job;},get job(){return job;},
    get hasPicture(){return !!job&&job.seek&&!video.seeking&&video.readyState>=2&&job.phase!=='prepare'&&job.phase!=='fallback';},
    dispose(){reset();video.removeEventListener('error',onError);video.removeAttribute('src');video.load();video.remove();texture.dispose();}};
}

// Picture decoders stay silent. Both music cues always run forwards: changing
// direction crossfades cues, never reverses speech or seeks audio every frame.
import { JOURNEY_EDIT } from './journey-edit.js?v=20261030-smooth1';
import { JOURNEY_DURATION } from './journey-timing.js?v=20261030-smooth1';
export function createJourneyAudio(){
  const mobile=matchMedia('(pointer: coarse)').matches||Boolean(navigator.connection?.saveData);
  const tracks=[['forward',JOURNEY_EDIT.music],['rewind',JOURNEY_EDIT.rewind]].map(([name,src])=>{
    const audio=document.createElement('audio');audio.preload='none';audio.hidden=true;audio.volume=0;audio.loop=name==='rewind';
    audio.dataset.vgentMusic=name;audio.dataset.audioGain='0.000';document.body.append(audio);
    return {audio,src,gain:0,blocked:false,permitted:false,pending:null,priming:false,align:name==='forward',version:0};
  });
  let sound=true,selected=-1,running=false,disposed=false,suspended=false;
  const writeGain=track=>{track.audio.volume=track.gain;track.audio.dataset.audioGain=track.gain.toFixed(3);track.audio.dataset.audioBlocked=String(track.blocked);};
  function ensure(track){if(suspended||disposed||track.audio.getAttribute('src'))return;track.audio.preload='auto';track.audio.src=track.src;track.audio.load();}
  function release(track){
    track.version++;track.audio.pause();track.priming=false;track.pending=null;track.permitted=false;track.gain=0;track.align=true;writeGain(track);
    if(track.audio.getAttribute('src')){track.audio.removeAttribute('src');track.audio.preload='none';track.audio.load();}
  }
  function suspendBackground(){if(suspended)return;suspended=true;running=false;selected=-1;tracks.forEach(release);}
  function resumeBackground(){suspended=false;}
  function play(track){
    if(suspended||disposed)return Promise.resolve();
    ensure(track);
    if(track.pending)return track.pending;
    if(!track.audio.paused)return Promise.resolve();
    const version=track.version;
    track.pending=track.audio.play().then(()=>{if(version!==track.version)return;track.blocked=false;track.permitted=true;}).catch(error=>{
      if(version!==track.version)return;
      if(error.name==='NotAllowedError')track.blocked=true;
    }).finally(()=>{if(version!==track.version)return;track.pending=null;writeGain(track);if(disposed||suspended||!sound)track.audio.pause();});
    return track.pending;
  }
  function stop(){
    for(const track of tracks){track.gain=0;writeGain(track);if(!track.priming)track.audio.pause();}
    tracks[0].align=true;
  }
  async function setSound(on){
    sound=on;
    if(!sound){stop();return;}
    if(suspended)return;
    // Call play synchronously inside the trusted click for both elements. Do
    // not let an inactive animation frame abort these permission probes.
    const wanted=mobile?[tracks[selected<0?0:selected]]:tracks;
    await Promise.all(wanted.map(async track=>{
      if(track.permitted&&!track.blocked)return;
      const version=track.version;
      track.blocked=false;track.priming=true;track.audio.muted=false;
      await play(track);if(version!==track.version||suspended||disposed)return;track.priming=false;
      if(!running||!sound||track.gain===0)track.audio.pause();
    }));
  }
  function update(dt,{active,time,velocity,paused,blocked}){
    running=active&&!paused&&!blocked;
    if(suspended||!sound||blocked||paused){stop();return;}
    const next=active?(velocity>.08?0:velocity<-.08?1:selected):-1;
    if(next!==selected){if(next===0)tracks[0].align=true;selected=next;}
    if(active&&selected>=0)ensure(tracks[selected]);
    const step=Math.min(dt,100)/450;
    // Preserve the original forward soundtrack's source time. Align only on
    // entry/resume/return from rewind, at silence; normal frames never seek.
    const forward=tracks[0],audio=forward.audio;
    const forwardInRange=time<JOURNEY_DURATION;
    if(selected===0&&forwardInRange&&!forward.align&&Math.abs(audio.currentTime-time)>.6)forward.align=true;
    if(selected===0&&forwardInRange&&forward.align&&forward.gain<.025&&audio.readyState>=1){
      forward.gain=0;audio.currentTime=Math.max(0,Math.min(time,audio.duration-.025));forward.align=false;
    }
    if(selected===0&&!forward.align)audio.playbackRate=Math.max(.96,Math.min(1.04,1+(time-audio.currentTime)*.12));
    tracks.forEach((track,index)=>{
      const wanted=running&&selected===index&&!(index===0&&(track.align||!forwardInRange));
      const endGain=Math.max(0,Math.min(1,index===0?JOURNEY_DURATION+.01-time:(JOURNEY_DURATION+.81-time)/1.5));
      const target=wanted ? .85*endGain : 0;
      if(wanted&&!track.blocked&&!track.audio.ended)play(track);
      const ready=!track.audio.paused&&!track.audio.seeking&&track.audio.readyState>=3;
      const gain=ready?target:0;
      track.gain+=Math.sign(gain-track.gain)*Math.min(Math.abs(gain-track.gain),step);
      track.audio.muted=false;writeGain(track);
      if(track.gain===0&&!wanted&&!track.priming)track.audio.pause();
    });
  }
  function reset(){running=false;selected=-1;stop();for(const track of tracks)track.audio.currentTime=0;}
  return {update,setSound,stop,reset,suspendBackground,resumeBackground,unlocked:()=>mobile?tracks[selected<0?0:selected].permitted:tracks.every(track=>track.permitted),
    blocked:()=>running&&selected>=0&&tracks[selected].blocked,
    dispose(){disposed=true;reset();for(const track of tracks){track.audio.removeAttribute('src');track.audio.load();track.audio.remove();}}};
}

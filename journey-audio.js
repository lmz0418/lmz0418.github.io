// Picture decoders stay silent. Both music cues always run forwards: changing
// direction crossfades cues, never reverses speech or seeks audio every frame.
import { JOURNEY_EDIT } from './journey-edit.js';
import { JOURNEY_DURATION } from './journey-timing.js';
export function createJourneyAudio(){
  const tracks=[['forward',JOURNEY_EDIT.music],['rewind',JOURNEY_EDIT.rewind]].map(([name,src])=>{
    const audio=document.createElement('audio');audio.src=src;audio.preload='auto';audio.hidden=true;audio.volume=0;audio.loop=name==='rewind';
    audio.dataset.vgentMusic=name;audio.dataset.audioGain='0.000';document.body.append(audio);
    return {audio,gain:0,blocked:false,permitted:false,pending:null,priming:false,align:name==='forward'};
  });
  let sound=true,selected=-1,running=false,disposed=false;
  const writeGain=track=>{track.audio.volume=track.gain;track.audio.dataset.audioGain=track.gain.toFixed(3);track.audio.dataset.audioBlocked=String(track.blocked);};
  function play(track){
    if(track.pending)return track.pending;
    if(!track.audio.paused)return Promise.resolve();
    track.pending=track.audio.play().then(()=>{track.blocked=false;track.permitted=true;}).catch(error=>{
      if(error.name==='NotAllowedError')track.blocked=true;
    }).finally(()=>{track.pending=null;writeGain(track);if(disposed||!sound)track.audio.pause();});
    return track.pending;
  }
  function stop(){
    for(const track of tracks){track.gain=0;writeGain(track);if(!track.priming)track.audio.pause();}
    tracks[0].align=true;
  }
  async function setSound(on){
    sound=on;
    if(!sound){stop();return;}
    // Call play synchronously inside the trusted click for both elements. Do
    // not let an inactive animation frame abort these permission probes.
    await Promise.all(tracks.map(async track=>{
      if(track.permitted&&!track.blocked)return;
      track.blocked=false;track.priming=true;track.audio.muted=false;
      await play(track);track.priming=false;
      if(!running||!sound||track.gain===0)track.audio.pause();
    }));
  }
  function update(dt,{active,time,velocity,paused,blocked}){
    running=active&&!paused&&!blocked;
    if(!sound||blocked||paused){stop();return;}
    const next=active?(velocity>.08?0:velocity<-.08?1:selected):-1;
    if(next!==selected){if(next===0)tracks[0].align=true;selected=next;}
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
  return {update,setSound,stop,reset,unlocked:()=>tracks.every(track=>track.permitted),
    blocked:()=>running&&selected>=0&&tracks[selected].blocked,
    dispose(){disposed=true;reset();for(const track of tracks){track.audio.removeAttribute('src');track.audio.load();track.audio.remove();}}};
}

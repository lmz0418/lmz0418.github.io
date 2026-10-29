import {JOURNEY_DURATION} from './journey-timing.js?v=20261030-smooth1';
// Direction commands are idempotent. Wheel distance never changes playback speed.
// A one-shot flight has unit-speed endpoints and a smooth acceleration hump.
export function journeyFlightAt(from,to,seconds,duration=1.25){
  const t=Math.max(0,Math.min(duration,seconds)),up=duration*.22,down=duration*.4;
  if(t===duration)return {time:to,velocity:1,progress:1,envelope:0};
  let area,envelope;
  if(t<up){envelope=.5*(1-Math.cos(Math.PI*t/up));area=.5*(t-up/Math.PI*Math.sin(Math.PI*t/up));}
  else if(t<=duration-down){envelope=1;area=up/2+t-up;}
  else{const s=t-(duration-down);envelope=.5*(1+Math.cos(Math.PI*s/down));area=up/2+duration-up-down+.5*(s+down/Math.PI*Math.sin(Math.PI*s/down));}
  const integral=duration-(up+down)/2,extra=to-from-duration;
  return {time:from+t+extra*area/integral,velocity:1+extra*envelope/integral,progress:t/duration,envelope};
}
export function createJourneyClock(duration=JOURNEY_DURATION){
  let time=0,velocity=0,direction=0,paused=false;
  return {
    command(sign){sign=Math.sign(sign);if(!sign)return;direction=sign;paused=false;},
    // A camera already travelling into the film must not brake to zero on handoff.
    start(sign=1){direction=velocity=Math.sign(sign);paused=false;},
    tick(seconds,blocked=false){
      const dt=Math.min(1/30,Math.max(0,seconds)),desired=paused?0:direction;
      velocity+=(desired-velocity)*(1-Math.exp(-dt/.12));
      if(Math.abs(velocity-desired)<.001)velocity=desired;
      if(blocked)return time;
      time=Math.max(0,Math.min(duration,time+velocity*dt));
      if((time===0&&velocity<0)||(time===duration&&velocity>0)){velocity=direction=0;}
      return time;
    },
    set(value){time=Math.max(0,Math.min(duration,value));velocity=direction=0;paused=false;},
    follow(value){
      time=Math.max(0,Math.min(duration,value));
      if((time===0&&velocity<0)||(time===duration&&velocity>0))velocity=direction=0;
    },
    suspend(){paused=true;velocity=0;},
    toggle(){paused=!paused;},
    get time(){return time;},get velocity(){return velocity;},get direction(){return direction;},get paused(){return paused;},get duration(){return duration;}
  };
}

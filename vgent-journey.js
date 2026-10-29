import * as THREE from 'three';
import { JOURNEY_FPS as FPS, JOURNEY_DURATION as DURATION, JOURNEY_WALL as WALL, JOURNEY_PEEL as PEEL, JOURNEY_FLIGHT_PREROLL, JOURNEY_FLIGHT_PREPARE_AT } from './journey-timing.js';
import { createJourneyClock } from './journey-clock.js';
import { createJourneyMedia } from './journey-media.js?v=20261030-video1';
import { createJourneyAudio } from './journey-audio.js?v=20261030-video1';
import { createJourneyFlight, FLIGHT_TARGET } from './journey-flight.js?v=20261030-video1';
import { JOURNEY_EDIT } from './journey-edit.js';
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const smooth=v=>{v=clamp(v);return v*v*(3-2*v)};
const START=.80,END=1.90,ENTRY_START=.70,ENTER=1.8;
export function createVgentJourney({cinema,camera,renderer,canvas,gallery,getLang,onGallery,onSeek}){
  const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile=matchMedia('(pointer: coarse)').matches||Boolean(navigator.connection?.saveData);
  let backgroundSuspended=false;
  const hall=cinema.halls[3];hall.externalMedia=true;
  // Keep the VGENT screen clear before entry as well as during the camera move.
  hall.screenMaterial.fog=false;
  for(const child of hall.group.children)if(child!==hall.screen&&child.material?.isShaderMaterial)child.visible=false;
  const clock=createJourneyClock(DURATION),music=createJourneyAudio(),flight=createJourneyFlight(),events=new AbortController();
  const listen=(target,type,handler)=>target.addEventListener(type,handler,{signal:events.signal});
  let texture;
  const poster=new THREE.TextureLoader().load(JOURNEY_EDIT.poster);poster.colorSpace=THREE.SRGBColorSpace;hall.screenMaterial.map=poster;
  const scene=new THREE.Scene(),ortho=new THREE.OrthographicCamera(-1,1,1,-1,0,2);ortho.position.z=1;
  // VideoTexture needs the same sRGB decode as Three's built-in video map; image textures decode on upload.
  const material=new THREE.ShaderMaterial({depthTest:false,depthWrite:false,transparent:true,uniforms:{image:{value:poster},decodeVideo:{value:0},cover:{value:new THREE.Vector2(1,1)},fade:{value:0},opacity:{value:1},flightAmount:{value:0},landingMix:{value:0},landingImage:{value:poster}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',fragmentShader:`
    uniform sampler2D image,landingImage;uniform vec2 cover;
    uniform float fade,opacity,decodeVideo,flightAmount,landingMix;varying vec2 vUv;
    vec3 decode(vec3 c){return mix(pow(c*.9478672986+vec3(.0521327014),vec3(2.4)),c*.0773993808,vec3(lessThanEqual(c,vec3(.04045))));}
    void main(){
      vec2 uv=.5+(vUv-.5)*cover/(1.+flightAmount*.075);
      vec3 c=texture2D(image,uv).rgb;if(decodeVideo>.5)c=decode(c);
      if(flightAmount>.001){
        vec3 streak=vec3(0.);
        for(int i=0;i<8;i++){
          float offset=(float(i)/7.-.5)*flightAmount*.12;
          vec3 tap=texture2D(image,clamp(.5+(uv-.5)*(1.+offset),.001,.999)).rgb;
          streak+=decodeVideo>.5?decode(tap):tap;
        }
        c=mix(c,streak/8.,flightAmount*.8);
      }
      if(landingMix>0.)c=mix(c,decode(texture2D(landingImage,.5+(vUv-.5)*cover).rgb),landingMix);
      c=mix(c,vec3(.0025,.0028,.003),fade);gl_FragColor=vec4(c,opacity);
      #include <colorspace_fragment>
    }`});
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),material));
  const panel=document.createElement('div');panel.className='vgent-journey-ui';panel.hidden=true;
  const label=document.createElement('span'),skipButton=document.createElement('button'),retry=document.createElement('button');skipButton.type=retry.type='button';skipButton.className='vgent-work-button';panel.append(label,retry,skipButton);document.body.append(panel);
  let state='cinema',failed=false,decoded=0,waiting=0,lastInput=-1000,gate=-1000,tracks=null,wasDialog=false,approachDirection=0,lastCinemaProgress=START,entryProgress=START,flightPreroll=false,flightMasterTime=FLIGHT_TARGET;
  const media=createJourneyMedia((next,time)=>{
    texture=next;decoded=time;
    // Bind the decoded first frame while still in the cinema, so video upload and
    // shader compilation do not happen halfway through the fullscreen flight.
    material.uniforms.image.value=texture;material.uniforms.decodeVideo.value=1;
    if(hall.screenMaterial.map!==texture){hall.screenMaterial.map=texture;hall.screenMaterial.needsUpdate=true;}
  });
  texture=media.texture;
  const poseCamera=camera.clone(),basePosition=new THREE.Vector3(),baseQuaternion=new THREE.Quaternion(),center=new THREE.Vector3(),normal=new THREE.Vector3(),endPosition=new THREE.Vector3(),endQuaternion=new THREE.Quaternion();
  const previousPose=camera.clone(),incomingVelocity=new THREE.Vector3(),incomingTurn=new THREE.Quaternion(),entryTangent=new THREE.Vector3(),boundedTangent=new THREE.Vector3(),turnAxis=new THREE.Vector3();
  const turnControl=new THREE.Quaternion(),turnA=new THREE.Quaternion(),turnB=new THREE.Quaternion(),turnC=new THREE.Quaternion();
  let sampledPose=false,sampleSeconds=1/60;
  cinema.pose(START,poseCamera,0,0);basePosition.copy(poseCamera.position);baseQuaternion.copy(poseCamera.quaternion);
  fetch(JOURNEY_EDIT.tracks).then(r=>{if(!r.ok)throw Error('Wall tracks unavailable');return r.json()}).then(data=>tracks=data).catch(()=>{failed=true;});
  function setState(next){
    if(state===next)return;state=next;
    if(state==='cinema')approachDirection=0;
    if(state==='cinema')cinema.halls.forEach(h=>{h.group.visible=true;h.group.children.forEach(c=>c.visible=!(h===hall&&c!==hall.screen&&c.material?.isShaderMaterial));});
    document.body.dataset.vgentState=canvas.dataset.vgentState=state;
    const isGallery=state==='gallery',exiting=state==='exiting';
    document.body.classList.toggle('journey-active',state!=='cinema'&&!isGallery);document.body.classList.toggle('journey-exit',exiting);document.body.classList.toggle('journey-gallery',isGallery);document.body.classList.toggle('collection',isGallery);
    canvas.style.visibility='';canvas.style.opacity='1';
    if(isGallery){gate=performance.now();suspendBackground();onGallery();}
  }
  function suspendBackground(){
    if(backgroundSuspended)return;backgroundSuspended=true;
    media.suspendBackground();flight.suspendBackground();music.suspendBackground();
  }
  function resumeBackground(){
    if(!backgroundSuspended)return;backgroundSuspended=false;
    media.resumeBackground();flight.resumeBackground();music.resumeBackground();
  }
  function command(sign){
    if(sign!==clock.direction||clock.paused)media.prepare(sign,clock.time,clock.velocity);
    clock.command(sign);
  }
  listen(retry,'click',()=>{failed=false;media.retry();});
  function enter(){
    resumeBackground();
    // Capture the actual displayed pose, including the cinema's remaining inertia.
    // Never snap to its .80 waypoint before beginning the fullscreen dolly.
    entryProgress=lastCinemaProgress;
    basePosition.copy(camera.position);baseQuaternion.copy(camera.quaternion);
    entryTangent.copy(incomingVelocity).multiplyScalar(ENTER/3);
    const angle=2*Math.acos(clamp(incomingTurn.w,-1,1));
    turnAxis.set(incomingTurn.x,incomingTurn.y,incomingTurn.z).normalize();
    turnControl.copy(baseQuaternion);
    if(angle>.00001)turnControl.multiply(new THREE.Quaternion().setFromAxisAngle(turnAxis,Math.min(.35,angle*ENTER/(3*sampleSeconds))));
    media.prime();clock.start(1);setState('entering');media.sync(clock.time,clock.velocity,true);onSeek(entryProgress);
  }
  function input(pixels,p=START){
    if(!pixels)return false;
    if(flight.active){if(clock.paused)clock.start(1);return true;}
    const now=performance.now(),sign=Math.sign(pixels),gap=now-lastInput;lastInput=now;
    if(state==='gallery'){
      if(scrollY>1||sign>0)return false;
      if(reduceMotion)return false;
      if(gap<160||now-gate<160)return true;
      resumeBackground();clock.set(DURATION);command(-1);setState('exiting');scrollTo(0,0);return true;
    }
    if(state==='cinema'){
      approachDirection=sign;
      if(p<ENTRY_START||lastCinemaProgress<ENTRY_START||sign<0)return false;
      if(reduceMotion){skip();return true;}
      enter();return true;
    }
    // Direction commands are immediate; smoothing belongs to the clock, not input delays.
    command(sign);return true;
  }
  function reset(){resumeBackground();flight.reset();music.reset();clock.set(0);setState('cinema');approachDirection=0;entryProgress=START;sampledPose=false;incomingVelocity.set(0,0,0);incomingTurn.identity();entryTangent.set(0,0,0);cinema.pose(START,poseCamera,0,0);basePosition.copy(poseCamera.position);baseQuaternion.copy(poseCamera.quaternion);turnControl.copy(baseQuaternion);media.reset();waiting=0;gallery.clearOverrides();panel.hidden=true;document.body.style.setProperty('--vgent-labels','0');hall.screenMaterial.map=poster;material.uniforms.image.value=poster;material.uniforms.decodeVideo.value=0;onSeek(START);}
  function skip(){flight.reset();music.stop();media.pause();clock.set(DURATION);setState('gallery');suspendBackground();gallery.clearOverrides();onSeek(END);scrollTo(0,0);}
  function replay(){reset();lastCinemaProgress=START;cinema.pose(START,camera,0,0);enter();}
  function returnToCinema(){reset();}
  function enterWork(){
    if(flight.active)return;
    if(failed||reduceMotion){skip();return;}
    // Already in the final shot: continue forwards without rewinding or jumping.
    if(clock.time>=FLIGHT_TARGET-1.5){command(1);return;}
    flightPreroll=false;flightMasterTime=FLIGHT_TARGET;
    flight.start(clock.time);media.prepare(-1,clock.time,0);clock.start(1);media.pause();
  }
  listen(skipButton,'click',enterWork);
  const suspend=()=>{if(document.hidden){clock.suspend();music.stop();}};listen(document,'visibilitychange',suspend);listen(window,'blur',()=>{if(!['cinema','gallery'].includes(state)){clock.suspend();music.stop();}});
  function update(now,dt,p,enabled,dialogOpen,reduced){
    if(dialogOpen||document.hidden)suspendBackground();
    if(enabled&&!backgroundSuspended&&state==='cinema'&&p>(mobile?.68:.55)){
      media.warm();if(!mobile)flight.warm();
    }
    hall.screenMaterial.opacity=1;
    if(state==='cinema'){
      if(enabled&&!backgroundSuspended&&p>(mobile?.68:.60)){
        media.prime();
        if(media.video.readyState>=2&&hall.screenMaterial.map!==media.texture){hall.screenMaterial.map=media.texture;hall.screenMaterial.needsUpdate=true;}
      }
      sampleSeconds=Math.max(.001,dt/1000);
      if(sampledPose){
        incomingVelocity.copy(camera.position).sub(previousPose.position).divideScalar(sampleSeconds);
        incomingTurn.copy(previousPose.quaternion).invert().multiply(camera.quaternion);
        if(incomingTurn.w<0)incomingTurn.set(-incomingTurn.x,-incomingTurn.y,-incomingTurn.z,-incomingTurn.w);
      }
      previousPose.copy(camera);sampledPose=true;
      lastCinemaProgress=p;
      if(enabled&&!dialogOpen&&p>=ENTRY_START&&approachDirection>0){if(reduceMotion)skip();else enter();}
    }
    if(dialogOpen&&!wasDialog)clock.suspend();wasDialog=dialogOpen;
    const active=!['cinema','gallery'].includes(state);
    if(active){
      const blocked=document.hidden||dialogOpen||backgroundSuspended;
      const stage=flight.job;
      // Stage the full-resolution destination only after the proxy is on screen.
      let landingReady=false,rewindTime;
      if(stage?.phase==='prepare'){
        const reverse=media.sync(clock.time,-1,!blocked&&!clock.paused);
        if(reverse.ready&&reverse.time!==undefined){rewindTime=reverse.time;clock.follow(reverse.time);}
      }
      if(stage&&stage.phase!=='prepare'&&stage.phase!=='land'){
        const prerollStart=FLIGHT_TARGET-JOURNEY_FLIGHT_PREROLL;
        if(!flightPreroll){
          const ready=media.stageForward(prerollStart);
          if(ready&&(stage.elapsed>JOURNEY_FLIGHT_PREPARE_AT||['fallback','waiting'].includes(stage.phase)))flightPreroll=true;
        }
        if(flightPreroll){
          // Start decoding behind the proxy so the landing is already moving,
          // rather than exposing play()'s first-frame latency at full resolution.
          const flow=media.sync(prerollStart,1,!blocked&&!clock.paused);
          flightMasterTime=flow.time??prerollStart;
          landingReady=flow.ready&&flightMasterTime>=FLIGHT_TARGET-.04&&decoded>=FLIGHT_TARGET-.08;
        }
      }
      const jump=flight.update(dt,blocked||clock.paused,landingReady,rewindTime);
      if(jump?.landed){clock.set(flightMasterTime);clock.start(1);}
      if(jump&&jump.phase!=='land'){
        waiting=jump.phase==='prepare'?jump.wait*1000:0;
        if(jump.phase!=='prepare'){clock.follow(jump.time);setState('scrubbing');}
        onSeek(entryProgress+(END-entryProgress)*clock.time/DURATION);
      }else{
        const flow=media.sync(clock.time,clock.velocity,!blocked&&!clock.paused);
        waiting=!flow.ready?waiting+dt:0;
        // Decoder readiness may hold position, never the response to a new direction.
        clock.tick(dt/1000,blocked||!flow.ready||clock.paused||flow.time!==undefined);
        if(flow.time!==undefined&&!blocked&&!clock.paused)clock.follow(flow.time);
        const t=clock.time;
        setState(t<=0&&clock.direction<=0?'cinema':t<ENTER?'entering':t<WALL?'scrubbing':t<DURATION||clock.direction<0?'exiting':'gallery');
        if(state==='cinema')gate=now;
        onSeek(entryProgress+(END-entryProgress)*t/DURATION);
      }
    }else media.pause();
    music.update(dt,{active:enabled&&!['cinema','gallery'].includes(state)&&(!flight.active||flight.job.phase==='land'),time:clock.time,velocity:clock.velocity,paused:clock.paused,blocked:document.hidden||dialogOpen||backgroundSuspended||waiting>150});
    failed=failed||media.failed;
    const progress=clamp(clock.time/ENTER);
    if(state==='entering'){
      hall.group.updateWorldMatrix(true,false);hall.screen.getWorldPosition(center);normal.set(0,0,1).applyQuaternion(hall.group.getWorldQuaternion(endQuaternion));
      const cover=Math.min(10.125/2,18/(2*(innerWidth/innerHeight)));
      endPosition.copy(center).addScaledVector(normal,cover/Math.tan(THREE.MathUtils.degToRad(camera.fov/2)));poseCamera.position.copy(endPosition);poseCamera.lookAt(center);endQuaternion.copy(poseCamera.quaternion);
      // One cubic flight inherits the incoming tangent; no second ease-from-rest.
      // Bound only extreme wheel/key bursts so the curve cannot cross the screen.
      boundedTangent.copy(entryTangent).clampLength(0,basePosition.distanceTo(endPosition)*.6);
      const u=1-progress;
      camera.position.copy(basePosition).multiplyScalar(u*u*u+3*u*u*progress)
        .addScaledVector(boundedTangent,3*u*u*progress).addScaledVector(endPosition,3*u*progress*progress+progress*progress*progress);
      turnA.slerpQuaternions(baseQuaternion,turnControl,progress);
      turnB.slerpQuaternions(turnControl,endQuaternion,progress);
      turnC.slerpQuaternions(turnA,turnB,progress);turnB.slerp(endQuaternion,progress);
      camera.quaternion.slerpQuaternions(turnC,turnB,progress);camera.updateMatrixWorld();
    }
    if(state!=='cinema')cinema.halls.forEach((h,i)=>{h.group.visible=i===3||progress<.98;if(i===3){h.screen.visible=true;h.screenMaterial.opacity=1;h.screenMaterial.fog=false;h.group.children.forEach(child=>{if(child!==h.screen)child.visible=!child.material?.isShaderMaterial&&progress<.7;});}});
    const en=getLang()==='en';label.textContent=flight.active?(en?'Moving into selected work…':'正在进入作品…'):failed?(en?'Scene unavailable · enter work':'场景暂时不可用 · 可进入作品'):waiting>250?(en?'Preparing frames…':'正在准备画面…'):en?'↓ FORWARD · ↑ REWIND · SPACE TO PAUSE':'↓ 前进 · ↑ 回溯 · 空格暂停';
    retry.textContent=en?'Retry':'重试';retry.hidden=!failed&&waiting<3000;
    skipButton.textContent=en?'View work ↗':'进入作品 ↗';skipButton.disabled=flight.active;skipButton.setAttribute('aria-busy',String(flight.active));panel.hidden=['cinema','gallery'].includes(state)||dialogOpen;
    document.body.style.setProperty('--vgent-labels',String(smooth((clock.time-(DURATION-.7))/.7)));
    canvas.dataset.vgentProgress=JSON.stringify({time:+clock.time.toFixed(4),direction:clock.direction,velocity:+clock.velocity.toFixed(3),paused:clock.paused,flight:flight.job?{phase:flight.job.phase,amount:+flight.job.amount.toFixed(3),blend:+flight.job.blend.toFixed(3),speed:+flight.job.velocity.toFixed(2)}:null,fps:FPS,source:+(JOURNEY_EDIT.trackOffset+(flight.active&&flight.job.phase!=='land'?flight.job.time:decoded)).toFixed(3),error:flight.active?0:+(targetTime()-decoded).toFixed(3),...(state==='entering'?{entry:{from:entryProgress,camera:camera.position.toArray().map(n=>+n.toFixed(4))}}:{})});
    canvas.dataset.vgentSeeks=JSON.stringify(media.stats);
    configureCards();return active;
  }
  function targetTime(){return clamp(clock.time,0,DURATION);}
  function trackFor(id,time){
    const frames=tracks?.panels.find(p=>p.id===id)?.frames;if(!frames)return null;
    let i=frames.findIndex(f=>f.time>=time);if(i<0)i=frames.length-1;const a=frames[Math.max(0,i-1)],b=frames[i],q=clamp((time-a.time)/(b.time-a.time||1));
    return a.corners.map((p,j)=>new THREE.Vector2(p[0]+(b.corners[j][0]-p[0])*q,1-(p[1]+(b.corners[j][1]-p[1])*q)));
  }
  function coverPoint(p){const aspect=innerWidth/innerHeight,ratio=aspect/(16/9),sx=Math.min(1,ratio),sy=Math.min(1,1/ratio);return new THREE.Vector2(.5+(p.x-.5)/sx,.5+(p.y-.5)/sy);}
  function configureCards(){
    gallery.clearOverrides();if(state!=='exiting')return;
    const t=clock.time;
    // Only the first two rows belong to the film-to-gallery transformation.
    for(const item of gallery.items)if(item.index>=6)item.override=(_,dest,u)=>{u.alpha.value=0;};
    for(const {id} of tracks?.panels??[]){
      const item=gallery.get(id);if(!item||item.index>=6)continue;
      item.override=(item,dest,u)=>{
        const source=trackFor(id,JOURNEY_EDIT.trackOffset+decoded);if(!source){u.alpha.value=0;return;}
        const origin=source.map(coverPoint),q=smooth((t-PEEL)/(DURATION-PEEL));
        u.sourceImage.value=texture;u.sourceCorners.value=source;u.videoMix.value=1-smooth((t-(PEEL+.25))/.65);
        u.corners.value=origin.map((v,i)=>v.clone().lerp(dest[i],q));
        u.size.value.set(innerWidth*(u.corners.value[1].x-u.corners.value[0].x),innerHeight*(u.corners.value[0].y-u.corners.value[3].y));
        u.radius.value=22*smooth((t-(PEEL+.2))/1.);u.reveal.value=1;u.alpha.value=t<PEEL?0:1;u.hover.value=0;
      };
    }
  }
  function render(target){
    if(!['scrubbing','exiting'].includes(state))return false;
    const ratio=(innerWidth/innerHeight)/(16/9);material.uniforms.cover.value.set(Math.min(1,ratio),Math.min(1,1/ratio));
    const jump=flight.job,useProxy=flight.hasPicture;
    material.uniforms.image.value=useProxy?flight.texture:texture??poster;
    material.uniforms.decodeVideo.value=useProxy||texture?1:0;
    material.uniforms.landingImage.value=texture??poster;
    material.uniforms.flightAmount.value=jump?.amount??0;
    material.uniforms.landingMix.value=useProxy?(jump?.blend??0):0;
    material.uniforms.fade.value=smooth((clock.time-(PEEL+.25))/.75);
    material.uniforms.opacity.value=1-smooth((clock.time-(PEEL+.85))/.65);
    renderer.setRenderTarget(target);renderer.setClearColor(0,0);renderer.clear();renderer.render(scene,ortho);return true;
  }
  if(/^#(?:portfolio|work|contact|about|agent|idtalk|tools|art-collections|post-workflow)$/.test(location.hash))suspendBackground();
  return {update,render,reset,replay,skip,input,returnToCinema,suspendBackground,resumeBackground,
    setSound:on=>mobile&&state==='cinema'&&on?Promise.resolve():music.setSound(on),audioBlocked:music.blocked,audioUnlocked:()=>mobile&&state==='cinema'||music.unlocked(),togglePause:()=>clock.toggle(),pause:()=>clock.suspend(),clock,get video(){return media.video;},
    pageProgress:p=>state==='cinema'?p:entryProgress+(1-entryProgress)*clock.time/DURATION,
    get state(){return state;},get progress(){return clamp(clock.time/ENTER);},get exitProgress(){return state==='gallery'?1:smooth((clock.time-(DURATION-.8))/.8);},get limit(){return END;},dispose(){events.abort();clock.suspend();music.dispose();flight.dispose();media.dispose();poster.dispose();material.dispose();for(const child of scene.children)child.geometry.dispose();panel.remove();gallery.clearOverrides();}};
}

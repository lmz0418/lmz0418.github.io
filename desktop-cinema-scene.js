import * as THREE from './vendor/three.module.js';

const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const smooth = value => { const t = clamp(value); return t * t * (3 - 2 * t); };
const focus = [.36, .51, .66, .80];
const locations = [[-10, 2, -25, .32], [11, 3.2, -56, -.29], [-12, 1.5, -87, .30], [9, 3.4, -118, -.25]];
const route = [
  {p:.24,x:0,y:0,z:0}, {p:.36,x:-7,y:1,z:-7},
  {p:.51,x:8,y:1.5,z:-38}, {p:.66,x:-8.5,y:.6,z:-69},
  {p:.80,x:6.5,y:1.6,z:-100}, {p:.88,x:0,y:0,z:-115}, {p:1,x:0,y:0,z:-137}
];
const films = ['seedance', 'capcut', 'reno', 'lixiang'];

// A single render pass, four poster screens, and at most one active preview.
// The caller owns scheduling: this module never creates an animation-frame loop.
export function createDesktopCinema({canvas, mobile = false, onInvalidate = () => {}, onFatal = () => {}}) {
  const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:false, powerPreference:mobile?'low-power':'default'});
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#010103');
  scene.fog = new THREE.FogExp2('#010103', .0038);
  const camera = new THREE.PerspectiveCamera(45, 1, .025, 450);
  const events = new AbortController();
  let disposed = false, progress = 0, frames = 0, width = 1, height = 1, quality = 1;
  let mediaEnabled = false, desiredIndex = -1, sourceIndex = -1, displayedIndex = -1;
  let sourceURL = '', mediaState = 'idle', mediaGeneration = 0, previewRequests = 0, pendingPlay = false;
  let switchTimer = 0, videoCallback = 0, fallbackTimer = 0, videoTexture = null;
  const invalidate = () => { if (!disposed) onInvalidate(); };
  const placeholder = new THREE.DataTexture(new Uint8Array([13, 15, 19, 255]), 1, 1);
  placeholder.needsUpdate = true;
  placeholder.colorSpace = THREE.SRGBColorSpace;
  const loader = new THREE.TextureLoader();
  const screenGeometry = new THREE.PlaneGeometry(18, 10.125);
  const haloGeometry = new THREE.PlaneGeometry(31, 22);
  const haloMaterial = new THREE.ShaderMaterial({
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:'varying vec2 vUv;void main(){vec2 p=(vUv-.5)*2.;float a=exp(-dot(p,p)*4.)*pow(sin(vUv.x*3.14159)*sin(vUv.y*3.14159),2.);gl_FragColor=vec4(vec3(.24),a*.2);}',
    transparent:true, depthWrite:false, side:THREE.DoubleSide, forceSinglePass:true
  });
  const seatShape = new THREE.Shape();
  seatShape.moveTo(-.23,0);seatShape.lineTo(.23,0);
  seatShape.quadraticCurveTo(.28,.55,0,.56);seatShape.quadraticCurveTo(-.28,.55,-.23,0);
  const seatGeometry = new THREE.ShapeGeometry(seatShape,8);
  const seatMaterial = new THREE.MeshBasicMaterial({color:'#29292b',transparent:true,opacity:.28,side:THREE.DoubleSide,forceSinglePass:true});
  const halls = locations.map(([x,y,z,yaw], index) => {
    const group = new THREE.Group();group.position.set(x,y,z);group.rotation.y=yaw;
    const material = new THREE.MeshBasicMaterial({map:placeholder,side:THREE.DoubleSide,transparent:true,forceSinglePass:true});
    const screen = new THREE.Mesh(screenGeometry,material);group.add(screen);
    const halo = new THREE.Mesh(haloGeometry,haloMaterial);halo.position.z=-.25;group.add(halo);
    const rows=mobile?2:3, columns=mobile?7:11;
    const seats = new THREE.InstancedMesh(seatGeometry,seatMaterial,rows*columns), matrix = new THREE.Matrix4();
    for(let r=0;r<rows;r++)for(let c=0;c<columns;c++){
      matrix.makeTranslation((c-(columns-1)/2)*(mobile?1.15:.85),-5.4-r*.17,3+r*1.4);seats.setMatrixAt(r*columns+c,matrix);
    }
    group.add(seats);scene.add(group);
    const hall = {group,screen,material,poster:placeholder,z,index};
    loader.load(new URL(`./assets/${films[index]}-cover.webp`,import.meta.url).href, texture => {
      if(disposed){texture.dispose();return;}
      texture.colorSpace=THREE.SRGBColorSpace;texture.generateMipmaps=false;
      texture.minFilter=THREE.LinearFilter;hall.poster=texture;
      if(displayedIndex!==index)assignMap(hall,texture);
      invalidate();
    },undefined,()=>invalidate());
    return hall;
  });

  // Static stars preserve real perspective without a time-driven effect.
  let seed=407;
  const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const starCount=mobile?240:1200, positions=new Float32Array(starCount*3), colors=new Float32Array(starCount*3);
  for(let i=0;i<starCount;i++){
    const near=i<(mobile?45:140), brightness=.10+random()*.24;
    positions[i*3]=near?(i%2?1:-1)*(23+random()*75):(random()-.5)*620;
    positions[i*3+1]=(random()-.5)*(near?110:340);
    positions[i*3+2]=near?-15-random()*165:-310-random()*90;
    colors.set([brightness,brightness,brightness*1.04],i*3);
  }
  const starsGeometry=new THREE.BufferGeometry();
  starsGeometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
  starsGeometry.setAttribute('color',new THREE.BufferAttribute(colors,3));
  const starsMaterial=new THREE.PointsMaterial({size:1.25,sizeAttenuation:false,vertexColors:true,transparent:true,opacity:.7,depthWrite:false});
  scene.add(new THREE.Points(starsGeometry,starsMaterial));

  const video=document.createElement('video');
  video.hidden=true;video.muted=true;video.defaultMuted=true;video.loop=true;video.playsInline=true;
  video.preload='none';video.setAttribute('playsinline','');video.setAttribute('webkit-playsinline','');video.setAttribute('aria-hidden','true');
  video.dataset.desktopCinemaPreview='';(canvas.parentElement||document.body).append(video);
  const supportsFrames=typeof video.requestVideoFrameCallback==='function';
  const listen=(name,fn)=>video.addEventListener(name,fn,{signal:events.signal});

  function assignMap(hall,texture){
    if(hall.material.map===texture)return;
    const oldVideo=!!hall.material.map?.isVideoTexture;
    hall.material.map=texture;
    if(oldVideo!==!!texture.isVideoTexture)hall.material.needsUpdate=true;
  }
  function showPosters(){
    for(const hall of halls)assignMap(hall,hall.poster);
    displayedIndex=-1;
  }
  function cancelFrames(){
    if(videoCallback)video.cancelVideoFrameCallback?.(videoCallback);
    videoCallback=0;clearInterval(fallbackTimer);fallbackTimer=0;
  }
  function displayVideoFrame(){
    if(disposed||!mediaEnabled||document.hidden||sourceIndex<0||sourceIndex!==desiredIndex||video.readyState<2||video.currentSrc!==sourceURL)return;
    if(!videoTexture){
      // Three r160 VideoTexture owns a callback it cannot cancel. Keep that
      // ownership here instead, while retaining its shader color conversion.
      videoTexture=new THREE.Texture(video);
      videoTexture.isVideoTexture=true;videoTexture.update=()=>{};
      videoTexture.colorSpace=THREE.SRGBColorSpace;
      videoTexture.generateMipmaps=false;
      videoTexture.minFilter=videoTexture.magFilter=THREE.LinearFilter;
    }
    videoTexture.needsUpdate=true;
    assignMap(halls[sourceIndex],videoTexture);displayedIndex=sourceIndex;
    invalidate();
  }
  function scheduleFrames(){
    if(disposed||!mediaEnabled||document.hidden||video.paused||videoCallback||fallbackTimer)return;
    if(supportsFrames){
      videoCallback=video.requestVideoFrameCallback(()=>{
        videoCallback=0;displayVideoFrame();scheduleFrames();
      });
    }else fallbackTimer=setInterval(()=>{
      if(video.paused||document.hidden||!mediaEnabled){cancelFrames();return;}
      displayVideoFrame();
    },1000/24);
  }
  function releaseVideo(){
    mediaGeneration++;pendingPlay=false;cancelFrames();video.pause();showPosters();
    if(video.getAttribute('src')){video.removeAttribute('src');video.preload='none';video.load();}
    if(videoTexture){videoTexture.dispose();videoTexture=null;}
    sourceIndex=-1;sourceURL='';mediaState='idle';
  }
  function playCurrent(){
    if(disposed||!mediaEnabled||document.hidden||sourceIndex<0||pendingPlay||!video.paused)return;
    pendingPlay=true;const generation=mediaGeneration;
    video.play().then(()=>{
      if(disposed||generation!==mediaGeneration)return;
      if(!mediaEnabled||document.hidden){video.pause();return;}
      mediaState='playing';scheduleFrames();
    }).catch(error=>{
      if(disposed||generation!==mediaGeneration||error.name==='AbortError')return;
      mediaState=error.name==='NotAllowedError'?'blocked':'error';showPosters();cancelFrames();invalidate();
    }).finally(()=>{if(generation===mediaGeneration)pendingPlay=false;});
  }
  function switchSource(){
    switchTimer=0;
    if(disposed||!mediaEnabled||document.hidden||desiredIndex<0)return;
    if(sourceIndex===desiredIndex&&video.getAttribute('src')){playCurrent();return;}
    releaseVideo();sourceIndex=desiredIndex;
    sourceURL=new URL(`./assets/${mobile?'cinema-mobile/':''}${films[sourceIndex]}-preview.mp4`,import.meta.url).href;
    mediaState='loading';previewRequests++;video.src=sourceURL;video.preload='auto';video.load();playCurrent();
  }
  function queueSource(){
    clearTimeout(switchTimer);switchTimer=0;
    if(!mediaEnabled||document.hidden||desiredIndex<0){
      if(sourceIndex>=0){releaseVideo();invalidate();}
      return;
    }
    if(sourceIndex===desiredIndex&&video.getAttribute('src')){playCurrent();return;}
    if(sourceIndex>=0)releaseVideo();
    switchTimer=setTimeout(switchSource,mobile?240:150);
  }
  listen('loadeddata',()=>{displayVideoFrame();playCurrent();});
  listen('playing',()=>{mediaState='playing';displayVideoFrame();scheduleFrames();});
  listen('pause',()=>{cancelFrames();if(mediaState==='playing')mediaState='paused';});
  listen('waiting',()=>{mediaState='loading';});
  listen('error',()=>{if(!disposed&&video.getAttribute('src')){mediaState='error';cancelFrames();showPosters();invalidate();}});
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){clearTimeout(switchTimer);switchTimer=0;cancelFrames();video.pause();}
    else if(mediaEnabled){queueSource();invalidate();}
  },{signal:events.signal});
  canvas.addEventListener('webglcontextlost',event=>{
    event.preventDefault();
    if(!disposed){setMediaEnabled(false);onFatal(new Error('Cinema graphics context was lost'));}
  },{signal:events.signal});

  function weights(p){
    if(p<focus[0])return [smooth((p-.28)/.08),0,0,0];
    if(p>focus[3])return [0,0,0,1-smooth((p-.83)/.055)];
    const i=Math.min(2,Math.floor(clamp((p-focus[0])/(focus[1]-focus[0]),0,3)));
    const t=smooth((p-focus[i])/(focus[i+1]-focus[i]));
    return focus.map((_,n)=>n===i?1-t:n===i+1?t:0);
  }
  function setProgress(value){
    if(disposed)return;
    progress=clamp(Number.isFinite(value)?value:0);
    const presence=weights(progress);
    if(progress<=.24){camera.position.set(0,0,8*(1-progress/.24));camera.rotation.set(0,0,0);}
    else{
      let i=0;while(i<route.length-2&&progress>route[i+1].p)i++;
      const a=route[i],b=route[i+1],t=clamp((progress-a.p)/(b.p-a.p)),s=smooth(t);
      camera.position.set(THREE.MathUtils.lerp(a.x,b.x,s),THREE.MathUtils.lerp(a.y,b.y,s),THREE.MathUtils.lerp(a.z,b.z,t));
      let lookX=0,lookY=1;
      for(let n=0;n<halls.length;n++){lookX+=locations[n][0]*presence[n]*.9;lookY+=(locations[n][1]-1)*presence[n]*.85;}
      if(mobile){
        // Portrait view follows the same camera path, but aims at the screen
        // rather than preserving the desktop's off-centre composition.
        const amount=presence.reduce((sum,value)=>sum+value,0);
        let screenX=0,screenY=0,screenZ=0;
        for(let n=0;n<halls.length;n++){
          screenX+=locations[n][0]*presence[n];screenY+=locations[n][1]*presence[n];screenZ+=locations[n][2]*presence[n];
        }
        camera.lookAt(screenX,screenY,screenZ+(1-amount)*(camera.position.z-28));
      }else camera.lookAt(lookX,lookY*(1-smooth((progress-.83)/.05)),camera.position.z-28);
    }
    const titlePresence=smooth((progress-.29)/.05)*(1-smooth((progress-.83)/.05));
    for(let i=0;i<halls.length;i++){
      const hall=halls[i];hall.group.visible=hall.z<camera.position.z-2;
      hall.material.opacity=1-titlePresence*.78*(1-presence[i]);
    }
    const next=progress>=.30&&progress<=.875?presence.indexOf(Math.max(...presence)):-1;
    if(next!==desiredIndex){desiredIndex=next;queueSource();}
  }
  function resize(w,h){
    if(disposed)return;
    width=Math.max(1,w);height=Math.max(1,h);
    const ratio=Math.min(window.devicePixelRatio||1,mobile?1:1.25,Math.sqrt((mobile?700000:2000000)/(width*height)))*quality;
    renderer.setPixelRatio(ratio);renderer.setSize(width,height,false);
    camera.aspect=width/height;
    // Keep the horizontal field of view wide enough to show the 16:9 screen
    // on a narrow phone; landscape uses a conventional vertical field of view.
    camera.fov=mobile?Math.max(45,THREE.MathUtils.radToDeg(2*Math.atan(Math.tan(THREE.MathUtils.degToRad(31))/camera.aspect))):45;
    camera.updateProjectionMatrix();invalidate();
  }
  function render(){
    if(disposed||document.hidden)return;
    renderer.render(scene,camera);frames++;
  }
  function setMediaEnabled(enabled){
    if(disposed)return;
    const next=!!enabled;if(next===mediaEnabled)return;
    mediaEnabled=next;
    if(next)queueSource();
    else{clearTimeout(switchTimer);switchTimer=0;cancelFrames();video.pause();}
  }
  function dispose(){
    if(disposed)return;
    disposed=true;events.abort();clearTimeout(switchTimer);switchTimer=0;
    releaseVideo();video.remove();
    const textures=new Set([placeholder,...halls.map(h=>h.poster)]),geometries=new Set(),materials=new Set();
    scene.traverse(object=>{
      if(object.geometry)geometries.add(object.geometry);
      if(object.material)for(const material of Array.isArray(object.material)?object.material:[object.material])materials.add(material);
    });
    textures.forEach(texture=>texture.dispose());geometries.forEach(geometry=>geometry.dispose());materials.forEach(material=>material.dispose());
    scene.clear();renderer.renderLists.dispose();renderer.dispose();renderer.forceContextLoss();
  }
  setProgress(0);
  resize(canvas.clientWidth||innerWidth,canvas.clientHeight||innerHeight);
  return {
    setProgress,render,resize,setMediaEnabled,dispose,
    setQuality(value){if(disposed)return;const next=clamp(value,.6,1);if(next!==quality){quality=next;resize(width,height);}},
    get stats(){return {
      progress,activeIndex:desiredIndex,sourceIndex,displayedIndex,mediaState,mediaEnabled,disposed,
      frames,drawCalls:disposed?0:renderer.info.render.calls,triangles:disposed?0:renderer.info.render.triangles,
      textures:disposed?0:renderer.info.memory.textures,geometries:disposed?0:renderer.info.memory.geometries,
      pixelRatio:renderer.getPixelRatio(),width:canvas.width,height:canvas.height,
      playingVideos:!disposed&&!video.paused?1:0,videoSource:sourceURL,
      frameCallbackPending:!!videoCallback,fallbackTimerActive:!!fallbackTimer,
      previewRequests,quality,mobile,fov:camera.fov
    };}
  };
}

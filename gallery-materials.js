import * as THREE from 'three';
const clamp=n=>Math.max(0,Math.min(1,n));
const smooth=n=>{n=clamp(n);return n*n*(3-2*n)};
const mix=(a,b,t)=>a+(b-a)*t;
export function rectCorners(r){return [[r.left,r.top],[r.right??r.left+r.width,r.top],[r.right??r.left+r.width,r.bottom??r.top+r.height],[r.left,r.bottom??r.top+r.height]].map(([x,y])=>new THREE.Vector2(x/innerWidth,1-y/innerHeight));}
export function createGalleryMaterials(renderer,parts,{reduced=false}={}){
  const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-1,1,1,-1,0,1),geometry=new THREE.PlaneGeometry(2,2,12,10);
  const placeholder=new THREE.DataTexture(new Uint8Array([50,50,50,255]),1,1);placeholder.needsUpdate=true;
  let mouse=new THREE.Vector2(-100,-100),tick=0,scrollLast=scrollY,scrollForce=0;
  function makeItems(parts,base=0){return parts.map((part,localIndex)=>{
    const index=base+localIndex;
    const material=new THREE.ShaderMaterial({transparent:true,depthTest:false,depthWrite:false,uniforms:{image:{value:placeholder},depthImage:{value:placeholder},hasDepth:{value:0},imageAspect:{value:16/9},size:{value:new THREE.Vector2(1,1)},corners:{value:rectCorners({left:0,top:0,width:1,height:1})},sourceCorners:{value:[new THREE.Vector2(),new THREE.Vector2(),new THREE.Vector2(),new THREE.Vector2()]},sourceImage:{value:placeholder},videoMix:{value:0},alpha:{value:1},reveal:{value:1},hover:{value:0},focus:{value:new THREE.Vector2(.5,.5)},warp:{value:0},radius:{value:24},frameOnly:{value:part.work.frame?1:0}},
      vertexShader:`uniform vec2 corners[4],sourceCorners[4];varying vec2 vUv,vSource;
      void main(){vUv=uv;vec2 p=mix(mix(corners[3],corners[2],uv.x),mix(corners[0],corners[1],uv.x),uv.y);vSource=mix(mix(sourceCorners[3],sourceCorners[2],uv.x),mix(sourceCorners[0],sourceCorners[1],uv.x),uv.y);gl_Position=vec4(p*2.-1.,0.,1.);}`,
      fragmentShader:`uniform sampler2D image,depthImage,sourceImage;uniform vec2 size,focus;uniform float imageAspect,hasDepth,videoMix,alpha,reveal,hover,warp,radius,frameOnly;varying vec2 vUv,vSource;
      float box(vec2 p,vec2 b,float r){vec2 q=abs(p)-b+r;return length(max(q,0.))+min(max(q.x,q.y),0.)-r;}
      void main(){vec2 maskSize=size*mix(.86,1.,reveal);float r=min(radius,min(maskSize.x,maskSize.y)*.25);
        float d=box((vUv-.5)*size,maskSize*.5,r);float aa=max(fwidth(d),.8);float mask=1.-smoothstep(-aa,aa,d);if(mask<.001)discard;
        if(frameOnly>.5){float line=1.-smoothstep(.4,1.4,abs(d));gl_FragColor=vec4(vec3(.18),line*alpha);
        #include <colorspace_fragment>
        return;}
        float aspect=size.x/max(size.y,1.);vec2 cover=vec2(min(1.,aspect/imageAspect),min(1.,imageAspect/aspect));
        vec2 uv=.5+(vUv-.5)*cover*mix(.91,1.,reveal)*(1.-hover*.02);
        float depth=texture2D(depthImage,uv).r*hasDepth;
        vec2 parallax=(focus-.5)*hover*.026*cover;
        for(int i=0;i<6;i++){float z=texture2D(depthImage,uv).r*hasDepth;uv+=parallax*(z-.5)/6.;}
        float lens=sin(vUv.x*3.14159)*sin(vUv.y*3.14159);uv.x+=warp*.018*lens;
        float focal=texture2D(depthImage,.5+(focus-.5)*cover).r;
        float blur=abs(depth-focal)*hover*hasDepth*.002+(1.-reveal)*.001;
        vec4 c=texture2D(image,uv)*.4;
        c+=texture2D(image,uv+vec2(blur,0.))*.15+texture2D(image,uv-vec2(blur,0.))*.15;
        c+=texture2D(image,uv+vec2(0.,blur))*.15+texture2D(image,uv-vec2(0.,blur))*.15;
        // Wall handoff samples a VideoTexture: match the cinema/video sRGB decode before linear compositing.
        vec4 source=texture2D(sourceImage,vSource);
        source.rgb=mix(pow(source.rgb*.9478672986+vec3(.0521327014),vec3(2.4)),source.rgb*.0773993808,vec3(lessThanEqual(source.rgb,vec3(.04045))));
        float sourceVisible=step(0.,vSource.x)*step(vSource.x,1.)*step(0.,vSource.y)*step(vSource.y,1.);
        c=mix(c,source,videoMix*sourceVisible);
        float rim=(1.-smoothstep(0.,2.,abs(d)))*hover*.12;
        c.rgb+=vec3(rim*.85,rim*.93,rim);gl_FragColor=vec4(c.rgb,mask*alpha);
        #include <colorspace_fragment>
      }`});
    const mesh=new THREE.Mesh(geometry,material);mesh.frustumCulled=false;mesh.renderOrder=index;mesh.visible=false;scene.add(mesh);
    return {...part,index,mesh,material,ready:!!part.work.frame,loading:false,started:0,hover:0,hv:0,focus:new THREE.Vector2(.5,.5),rect:null,override:null};
  });}
  const items=makeItems(parts),baseCount=items.length;
  async function load(item){
    if(item.loading||item.ready)return;item.loading=true;
    try{
      const image=await new THREE.ImageLoader().loadAsync(item.work.poster);
      const cvs=document.createElement('canvas'),scale=Math.min(1,1280/image.naturalWidth);cvs.width=Math.round(image.naturalWidth*scale);cvs.height=Math.round(image.naturalHeight*scale);cvs.getContext('2d').drawImage(image,0,0,cvs.width,cvs.height);
      const texture=new THREE.CanvasTexture(cvs);texture.colorSpace=THREE.SRGBColorSpace;texture.generateMipmaps=true;texture.minFilter=THREE.LinearMipmapLinearFilter;
      item.material.uniforms.image.value=texture;item.material.uniforms.imageAspect.value=cvs.width/cvs.height;item.ready=true;
      if(item.work.depth)new THREE.TextureLoader().load(item.work.depth,depth=>{item.material.uniforms.depthImage.value=depth;item.material.uniforms.hasDepth.value=1;},undefined,()=>{});
    }catch{item.loading=false;}
  }
  const pointer=e=>mouse.set(e.clientX,e.clientY);addEventListener('pointermove',pointer,{passive:true});
  const blur=()=>mouse.set(-100,-100);addEventListener('blur',blur);
  function update(now,dt,{enabled=false,exit=1}={}){
    tick=now;scrollForce=mix(scrollForce,Math.max(-1,Math.min(1,(scrollY-scrollLast)/80)),1-Math.exp(-dt/100));scrollLast=scrollY;
    for(const item of items){
      const rect=item.link.getBoundingClientRect();item.rect=rect;
      const available=enabled&&rect.width>1&&rect.height>1&&rect.bottom>-innerHeight&&rect.top<innerHeight*2;
      // Re-arm outside the entrance band, before visibility/texture early returns.
      // Cached images must replay exactly like newly loaded ones on the next visit.
      if(!enabled||rect.width<=1||rect.height<=1||rect.bottom<=0||rect.top>=innerHeight*1.15)item.started=0;
      if(available)load(item);
      item.mesh.visible=available&&item.ready;
      item.link.classList.toggle(item.work.frame?'gpu-border-ready':'gpu-image-ready',item.mesh.visible);
      if(!available&&item.index>=6&&item.ready&&!item.work.frame){if(!item.outSince)item.outSince=now;if(now-item.outSince>2000){item.material.uniforms.image.value.dispose();if(item.material.uniforms.hasDepth.value)item.material.uniforms.depthImage.value.dispose();item.material.uniforms.hasDepth.value=0;item.ready=item.loading=false;item.material.uniforms.image.value=placeholder;}}else item.outSince=0;
      if(!item.mesh.visible)continue;
      if(!item.started&&rect.bottom>0&&rect.top<innerHeight*1.15)item.started=now||1;
      let reveal=item.started?1-Math.pow(1-clamp((now-item.started)/1050),4):0;
      if(reduced||item.override||rect.top<innerHeight*.6||item.index<2)reveal=1;
      const inside=mouse.x>=rect.left&&mouse.x<=rect.right&&mouse.y>=rect.top&&mouse.y<=rect.bottom;
      const goal=inside&&!reduced?1:0,seconds=Math.min(dt/1000,.033);
      item.hv+=(goal-item.hover)*110*seconds;item.hv*=Math.exp(-seconds*17);item.hover+=item.hv*seconds;
      item.focus.lerp(new THREE.Vector2(clamp((mouse.x-rect.left)/rect.width),1-clamp((mouse.y-rect.top)/rect.height)),1-Math.exp(-dt/110));
      const offset=(1-reveal)*(item.index%2?40:-40),rise=(1-reveal)*25;
      const target=rectCorners({left:rect.left+offset,top:rect.top+rise,width:rect.width,height:rect.height});
      const u=item.material.uniforms;u.corners.value=target;u.size.value.set(rect.width,rect.height);u.reveal.value=reveal;u.hover.value=reduced?0:item.hover;u.focus.value.copy(item.focus);u.warp.value=reduced?0:scrollForce;u.videoMix.value=0;u.alpha.value=exit*(item.surface?Number(item.link.closest('[data-reveal]')?.style.opacity||1):1);u.radius.value=item.surface?18:22;
      if(item.override)item.override(item,target,u);
    }
  }
  function render(){renderer.autoClear=false;renderer.render(scene,camera);renderer.autoClear=true;}
  function syncSurfaces(parts){for(const i of items.splice(baseCount)){scene.remove(i.mesh);if(i.ready&&!i.work.frame)i.material.uniforms.image.value.dispose();i.material.dispose();i.link.classList.remove('gpu-image-ready','gpu-border-ready');}items.push(...makeItems(parts,baseCount));}
  return {items,update,render,syncSurfaces,get:id=>items.find(i=>i.work.id===id),clearOverrides(){for(const i of items)i.override=null;},dispose(){removeEventListener('pointermove',pointer);removeEventListener('blur',blur);for(const i of items){if(i.ready&&!i.work.frame)i.material.uniforms.image.value.dispose();if(i.material.uniforms.hasDepth.value)i.material.uniforms.depthImage.value.dispose();i.material.dispose();i.link.classList.remove('gpu-image-ready','gpu-border-ready');}geometry.dispose();placeholder.dispose();}};
}

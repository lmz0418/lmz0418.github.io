import * as THREE from 'three';

const clamp=n=>THREE.MathUtils.clamp(n,0,1);
const smooth=n=>{n=clamp(n);return n*n*(3-2*n)};
const vertex='varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}';

// Independent, floating cinemas along a forward path. No rooms or hard light cones.
export function buildCinema(scene,media){
  scene.background=new THREE.Color('#010103');scene.fog=new THREE.FogExp2('#010103',.0038);
  const halls=[],focus=[.36,.51,.66,.80];
  const locations=[[-10,2,-25,.32],[11,3.2,-56,-.29],[-12,1.5,-87,.30],[9,3.4,-118,-.25]];
  const reel=p=>THREE.MathUtils.clamp((p-focus[0])/(focus[1]-focus[0]),0,3);
  function weights(p){
    if(p<focus[0])return [smooth((p-.28)/.08),0,0,0];
    if(p>focus[3])return [0,0,0,1-smooth((p-.83)/.055)];
    const i=Math.min(2,Math.floor(reel(p))),t=smooth((p-focus[i])/(focus[i+1]-focus[i]));
    return focus.map((_,n)=>n===i?1-t:n===i+1?t:0);
  }
  for(const [index,m] of [0,1,2,4].entries()){
    const [x,y,z,yaw]=locations[index],group=new THREE.Group();group.position.set(x,y,z);group.rotation.y=yaw;scene.add(group);
    const material=new THREE.MeshBasicMaterial({map:media[m].texture,side:THREE.DoubleSide,transparent:true});
    const screen=new THREE.Mesh(new THREE.PlaneGeometry(18,10.125),material);screen.userData.mediaIndex=m;group.add(screen);
    // A soft halo behind each suspended screen, neutral and without visible borders.
    const haloMaterial=new THREE.ShaderMaterial({vertexShader:vertex,fragmentShader:'varying vec2 vUv;void main(){vec2 p=(vUv-.5)*2.;float a=exp(-dot(p,p)*4.)*pow(sin(vUv.x*3.14159)*sin(vUv.y*3.14159),2.);gl_FragColor=vec4(vec3(.24),a*.17);}',transparent:true,depthWrite:false,side:THREE.DoubleSide});
    const halo=new THREE.Mesh(new THREE.PlaneGeometry(31,22),haloMaterial);halo.position.z=-.25;group.add(halo);
    const lights=[];
    for(let j=0;j<7;j++){
      const mat=new THREE.ShaderMaterial({vertexShader:vertex,fragmentShader:'varying vec2 vUv;void main(){vec2 p=(vUv-.5)*2.;float a=exp(-dot(p*vec2(1.2,1.8),p*vec2(1.2,1.8))*3.)*pow(sin(vUv.x*3.14159)*sin(vUv.y*3.14159),2.);gl_FragColor=vec4(vec3(.32),a*.016);}',transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending});
      const light=new THREE.Mesh(new THREE.PlaneGeometry(21-j*.6,14),mat);light.position.set(0,-j*.08,1+j*1.3);group.add(light);lights.push(light);
    }
    // Small abstract rows, intentionally silhouettes rather than chair models.
    const seatShape=new THREE.Shape();seatShape.moveTo(-.23,0);seatShape.lineTo(.23,0);seatShape.quadraticCurveTo(.28,.55,0,.56);seatShape.quadraticCurveTo(-.28,.55,-.23,0);
    const seats=new THREE.InstancedMesh(new THREE.ShapeGeometry(seatShape,8),new THREE.MeshBasicMaterial({color:'#29292b',transparent:true,opacity:.28,side:THREE.DoubleSide}),33),matrix=new THREE.Matrix4();
    for(let r=0;r<3;r++)for(let c=0;c<11;c++){matrix.makeTranslation((c-5)*.85,-5.4-r*.17,3+r*1.4);seats.setMatrixAt(r*11+c,matrix)}group.add(seats);
    halls.push({n:index+1,z,side:Math.sign(x),mediaIndex:m,screen,screenMaterial:material,group});
  }
  // Depth comes from multiple drifting, low-contrast fog layers, not walls.
  const mist=[];
  for(let i=0;i<24;i++){
    const mat=new THREE.ShaderMaterial({uniforms:{uTime:{value:0},uSeed:{value:i*3.7}},vertexShader:vertex,
      fragmentShader:`uniform float uTime,uSeed;varying vec2 vUv;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+1.),f.x),f.y);}
      void main(){vec2 p=vUv*3.+vec2(uSeed,uTime*.006);float n=noise(p)*.7+noise(p*2.1)*.3;vec2 e=(vUv-.5)*2.;float a=exp(-dot(e,e)*3.)*pow(sin(vUv.x*3.14159)*sin(vUv.y*3.14159),2.);gl_FragColor=vec4(vec3(.085),a*n*.26);}`,
      transparent:true,depthWrite:false,side:THREE.DoubleSide});
    const plane=new THREE.Mesh(new THREE.PlaneGeometry(32,25),mat);plane.position.set((i%2?1:-1)*(14+i%3*4),-4+i%4*3,-8-Math.floor(i/2)*12);plane.rotation.y=i%2?-.2:.2;plane.visible=false;scene.add(plane);mist.push(mat);
  }
  // Barely visible suspended fragments give the foreground a physical parallax cue.
  const fragments=[];
  const fragmentGeometry=new THREE.IcosahedronGeometry(1,0);
  for(let i=0;i<28;i++){
    const mesh=new THREE.Mesh(fragmentGeometry,new THREE.MeshBasicMaterial({color:i%3?'#141419':'#25252b',wireframe:false,transparent:true,opacity:.2}));
    const side=i%2?1:-1;mesh.position.set(side*(16+(i*7%13)),(i*11%19)-8,-12-i*5.1);mesh.scale.setScalar(.12+(i%5)*.09);mesh.rotation.set(i*.37,i*.61,i*.19);mesh.userData.baseY=mesh.position.y;mesh.visible=false;scene.add(mesh);fragments.push(mesh);
  }
  // A distant star field plus sparse peripheral nearer stars. Actual perspective
  // produces small movement at the vanishing point and more at the edges.
  let seed=407;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
  const count=1600,positions=new Float32Array(count*3),phases=new Float32Array(count),sizes=new Float32Array(count),brightness=new Float32Array(count);
  for(let i=0;i<count;i++){
    const near=i<180,z=near?-15-random()*165:-310-random()*90;
    positions[i*3]=(near?(i%2?1:-1)*(23+random()*75):(random()-.5)*620);
    positions[i*3+1]=(random()-.5)*(near?110:340);positions[i*3+2]=z;
    phases[i]=random()*Math.PI*2;sizes[i]=.8+random()*1.1;brightness[i]=.12+random()*.33;
  }
  const starsGeometry=new THREE.BufferGeometry();starsGeometry.setAttribute('position',new THREE.BufferAttribute(positions,3));starsGeometry.setAttribute('aPhase',new THREE.BufferAttribute(phases,1));starsGeometry.setAttribute('aSize',new THREE.BufferAttribute(sizes,1));starsGeometry.setAttribute('aBrightness',new THREE.BufferAttribute(brightness,1));
  const starsMaterial=new THREE.ShaderMaterial({uniforms:{uTime:{value:0},uPixelRatio:{value:1}},vertexShader:'attribute float aPhase,aSize,aBrightness;uniform float uTime,uPixelRatio;varying float vBrightness;void main(){vec4 p=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*p;gl_PointSize=aSize*uPixelRatio;vBrightness=aBrightness*(.94+.06*sin(uTime*.65+aPhase));}',fragmentShader:'varying float vBrightness;void main(){float d=length(gl_PointCoord-.5);float a=1.-smoothstep(.12,.5,d);gl_FragColor=vec4(vec3(vBrightness),a);}',transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});scene.add(new THREE.Points(starsGeometry,starsMaterial));
  const path=[{p:.24,x:0,y:0,z:0},{p:.36,x:-7,y:1,z:-7},{p:.51,x:8,y:1.5,z:-38},{p:.66,x:-8.5,y:.6,z:-69},{p:.80,x:6.5,y:1.6,z:-100},{p:.88,x:0,y:0,z:-115},{p:1,x:0,y:0,z:-137}];
  function pose(progress,camera,px,py){
    if(progress<=.24){camera.position.set(0,0,8*(1-progress/.24));camera.rotation.set(0,0,0);return}
    let i=0;while(i<path.length-2&&progress>path[i+1].p)i++;
    const a=path[i],b=path[i+1],t=clamp((progress-a.p)/(b.p-a.p)),s=smooth(t);
    // Forward travel remains continuous; sideways drift eases through each stop.
    camera.position.set(THREE.MathUtils.lerp(a.x,b.x,s)+px*.07,THREE.MathUtils.lerp(a.y,b.y,s)-py*.04,THREE.MathUtils.lerp(a.z,b.z,t));
    const weightsNow=weights(progress);let lookX=0,lookY=1;
    for(const [n,hall] of halls.entries()){lookX+=locations[n][0]*weightsNow[n]*.9;lookY+=(locations[n][1]-1)*weightsNow[n]*.85;}
    camera.lookAt(lookX,lookY*(1-smooth((progress-.83)/.05)),camera.position.z-28);
  }
  function update(now,camera,progress){
    for(const material of mist)material.uniforms.uTime.value=now/1000;
    starsMaterial.uniforms.uTime.value=now/1000;starsMaterial.uniforms.uPixelRatio.value=Math.min(devicePixelRatio||1,1.5);
    for(const [i,mesh] of fragments.entries()){mesh.rotation.y=i*.61+now*.000018;mesh.position.y=mesh.userData.baseY+Math.sin(now*.0002+i)*.16;}
    const focusWeights=weights(progress),titlePresence=smooth((progress-.29)/.05)*(1-smooth((progress-.83)/.05));
    for(const [i,hall] of halls.entries()){
      hall.screen.visible=hall.z<camera.position.z-2;
      // Distant previews stay moving, but recede behind the opposite film title.
      hall.screenMaterial.opacity=1-titlePresence*.78*(1-focusWeights[i]);
    }
  }
  return {halls,focus,update,pose,reel,weights,active(progress){const w=weights(progress);return halls[w.indexOf(Math.max(...w))]}};
}

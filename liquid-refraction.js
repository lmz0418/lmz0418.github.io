import * as THREE from 'three';
// Keep the shared linear render target; present it without pointer effects or image grading.
export function createLiquidRefraction(renderer){
  const target=new THREE.WebGLRenderTarget(1,1,{depthBuffer:false,type:THREE.HalfFloatType});
  const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-1,1,1,-1,0,1),geometry=new THREE.PlaneGeometry(2,2);
  const material=new THREE.ShaderMaterial({depthTest:false,depthWrite:false,uniforms:{image:{value:target.texture}},
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
    fragmentShader:`uniform sampler2D image;varying vec2 vUv;
    void main(){gl_FragColor=texture2D(image,vUv);
      #include <colorspace_fragment>
    }`});
  scene.add(new THREE.Mesh(geometry,material));
  return {target,resize(){const size=renderer.getDrawingBufferSize(new THREE.Vector2());target.setSize(size.x,size.y);},present(){renderer.setRenderTarget(null);renderer.setClearColor(0,0);renderer.render(scene,camera);},clear(){},set enabled(value){},dispose(){target.dispose();material.dispose();geometry.dispose();}};
}

// Adapted from the publicly served DNA CameraObscuraIntro GSAP timeline:
// https://www.dnastudio.sa/_next/static/chunks/app/%5Blocale%5D/page-011484b7a3d73ce9.js
// React lifecycle replaced with a reusable controller. Uses our own SVG asset.
// Original timing/easing kept; homepage keeps its longer dot and horizontal reveal.
export function createDnaOpening(root,{original=false,hold=.85,speed=1,effects=false,onComplete=()=>{},onInterface=()=>{}}={}){
  const gsap=window.gsap,mark=root.querySelector('.opening-mark'),dot=root.querySelector('.opening-dot');
  const glow=document.createElement('div');glow.className='dna-intro-glow';root.prepend(glow);
  const rays=Array.from({length:12},(_,i)=>{const ray=document.createElement('span');ray.className='dna-intro-ray';root.prepend(ray);return ray});
  let timeline=null;const interfaceState={amount:0};
  const closed=original?'circle(0% at 50% 50%)':'inset(0% 50% 0% 50%)';
  const open=original?'circle(75% at 50% 50%)':'inset(0% 0% 0% 0%)';
  function play(){
    timeline?.kill();root.hidden=false;root.className=`opening playing ${effects?'':'dna-effects-off'}`;interfaceState.amount=0;
    gsap.set(root,{clearProps:'opacity'});gsap.set(dot,{clearProps:'all'});
    gsap.set(mark,{clearProps:'all',opacity:0,clipPath:closed});gsap.set(glow,{clearProps:'all',opacity:0});
    rays.forEach((ray,i)=>gsap.set(ray,{rotation:i*30,scaleY:0,opacity:0,transformOrigin:'50% 0%'}));
    timeline=gsap.timeline({defaults:{ease:'power3.out'},onComplete});
    timeline.fromTo(dot,{scale:0,opacity:0},{scale:1,opacity:1,duration:.35,ease:'power2.out'},.15)
      .to(dot,{scale:2.6,duration:.28,ease:'power2.inOut'})
      .fromTo(glow,{opacity:0},{opacity:.7,duration:.5,ease:'power2.out'},'<');
    timeline.fromTo(rays,{scaleY:0,opacity:0},{scaleY:1,opacity:1,duration:.75,stagger:{each:.025,from:'random'},ease:'power3.out'},.55+hold);
    timeline.to(rays,{scaleY:0,opacity:0,duration:.5,stagger:{each:.015,from:'edges'},ease:'power3.in',transformOrigin:'center top'},1.3+hold)
      .to(dot,{scale:0,opacity:0,duration:.35,ease:'power2.in'},'<')
      .to(glow,{opacity:1,scale:1.15,duration:.5,ease:'power2.out'},'<');
    // One tween controls BOTH aperture expansion and focus. No directional wipe.
    timeline.fromTo(mark,{clipPath:closed,opacity:0,filter:'brightness(0) invert(1) blur(16px)'},
      {clipPath:open,opacity:1,filter:'brightness(0) invert(1) blur(0px)',duration:.95,ease:'expo.out',
        onStart:()=>root.classList.add('logo-visible'),onComplete:()=>root.classList.add('focused')},1.7+hold)
      .to(glow,{opacity:.2,duration:.6,ease:'power2.in'},'<0.3');
    timeline.fromTo(interfaceState,{amount:0},{amount:1,duration:.7,ease:'power3.out',onStart:onInterface},2.4+hold);
    timeline.to(root,{opacity:0,duration:.7,ease:'power2.inOut'},3.4+hold);
    timeline.timeScale(speed);
    return timeline;
  }
  function finish(){timeline?.kill();root.hidden=true;interfaceState.amount=1;onComplete()}
  function kill(){timeline?.kill()}
  return {play,finish,kill,interfaceAmount:()=>interfaceState.amount};
}

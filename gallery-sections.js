import { createGuideLines as createCameraGuides } from './guide-camera.js?v=20261030-smooth1';
import { createProductShowcase } from './product-showcase.js?v=20261030-smooth1';
import { createBrandSocial } from './brand-social.js?v=20261030-smooth1';
// Applies the new visual system to the existing product/team content without
// replacing that content or taking ownership of its business interactions.
export function connectGallerySections(gallery,getLang,{reduced=false}={}){
  let targets=[],cameraGuides=null;
  const products=createProductShowcase(getLang);
  const brandSocial=createBrandSocial(getLang,{reduced});
  function sync(){
    const portfolio=document.getElementById('portfolio');
    for(const id of ['agent','knowledge','idtalk','numbers','clientMarquee','clientsDetail','team','about','tools','contact']){
      const section=document.getElementById(id);if(section)portfolio.append(section);
    }
    const footer=portfolio.querySelector('footer');if(footer)portfolio.append(footer);
    products.sync();
    brandSocial.sync();
    if(!cameraGuides)cameraGuides=createCameraGuides();else cameraGuides.refit();
    targets=Array.from(portfolio.querySelectorAll('[data-reveal]'));
    // The multi-view character sheet needs its full width; the GPU surface crops to cover.
    const pictures=Array.from(portfolio.querySelectorAll('.product-figure>img,.team-photo>img,.tool-shot>img')).filter(img=>!img.parentElement.hasAttribute('data-art-collection')&&!(img.parentElement.classList.contains('team-photo')&&img.getAttribute('src')?.endsWith('art-study/character-01.webp'))).map((img,index)=>({work:{id:'surface-'+index,poster:img.getAttribute('src')},link:img.parentElement,img,surface:true}));
    const borders=Array.from(portfolio.querySelectorAll('.agent-base,.kb-chip,.pipeline-node,.contact-action')).map((link,index)=>({work:{id:'border-'+index,frame:true},link,surface:true}));
    gallery.syncSurfaces(pictures.concat(borders));
  }
  const refresh=()=>queueMicrotask(sync);
  addEventListener('languagechange',refresh);refresh();
  function update(){
    brandSocial.update();
    cameraGuides?.update(reduced);
    for(const target of targets){
      const rect=target.getBoundingClientRect(),q=Math.max(0,Math.min(1,(innerHeight*1.12-rect.top)/(innerHeight*.24)));
      const t=reduced?1:q*q*(3-2*q);
      target.style.opacity=String(t);target.style.transform=`translate3d(0,${(1-t)*10}px,0)`;
    }
  }
  return {update,dispose(){cameraGuides?.dispose();products.dispose();brandSocial.dispose();removeEventListener('languagechange',refresh);targets=[];}};
}

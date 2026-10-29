import * as THREE from 'three';
import { SVGLoader } from './vendor/SVGLoader.js';
import { createDnaOpening } from './dna-opening.js';
import { createCinemaPlayback } from './cinema-playback.js?v=20261030-video1';
import { cinemaCues } from './cinema-cues.js';
import { buildCinema } from './cinema-space.js';
import { createVgentJourney } from './vgent-journey.js?v=20261030-video1';
import { createGalleryMaterials } from './gallery-materials.js';
import { createLiquidRefraction } from './liquid-refraction.js';
import { connectGallerySections } from './gallery-sections.js?v=20261030-video1';
import { advanceCinemaScroll } from './cinema-scroll.js';
import { works } from './works.js';
import { PROJECT_ORDER } from './project-order.js';
import { JOURNEY_EDIT } from './journey-edit.js';
import { clients } from './clients.js';
import { numbers } from './numbers.js';
import * as sections from './sections.js';
import { createGuideLines } from './guide-lines.js';
import { createCGMotionShowcase } from './cg-motion-showcase.js?v=20261030-video1';
import { artCollections } from './art-collections-data.js';
import { createPSWorkflowCard } from './ps-workflow.js';
import { t, getLang, initLang, toggleLang } from './i18n.js';
import {getFilmPlayer} from './film-player.js?v=20261030-video1';

// The language is resolved before anything is built, so every string below can read t().
initLang();
const cgMotionShowcase=createCGMotionShowcase(getLang);
if(window.cinemaStartup?.failed())throw new Error('Cinema startup already fell back to the portfolio');

const gsap=window.gsap;
const $=id=>document.getElementById(id);
const hasOpenDialog=()=>document.querySelector('dialog[open]')!==null;
const canvas=$('filmSpace'),opening=$('opening'),cameraFrame=$('camera');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobileMedia=matchMedia('(pointer: coarse)').matches||Boolean(navigator.connection?.saveData);
const directGallery=/^#(?:portfolio|work|contact|about|agent|idtalk|tools|art-collections|post-workflow)$/.test(location.hash);
const clamp=(n,a=0,b=1)=>Math.min(b,Math.max(a,n));
let guides=null,guidesReady=false,liquid=null;
const smooth=n=>{n=clamp(n);return n*n*(3-2*n)};
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
renderer.setClearColor('#050505');
renderer.outputColorSpace=THREE.SRGBColorSpace;
const world=new THREE.Scene(),endingWorld=new THREE.Scene(),maskScene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(45,1,.025,450);
// Lens distortion can reach 1.625 times the viewport at its corners. Render
// beyond all four edges so peripheral stars never become clamped edge streaks.
const cinemaOverscan=1.65;
const cinemaRenderCamera=new THREE.PerspectiveCamera();
const logoCamera=new THREE.PerspectiveCamera(45,1,.025,450);
const screenCamera=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
const screenScene=new THREE.Scene();
const renderTarget=new THREE.WebGLRenderTarget(1,1,{depthBuffer:true,type:THREE.HalfFloatType});
const endingTarget=new THREE.WebGLRenderTarget(1,1,{depthBuffer:true,type:THREE.HalfFloatType});
const resolution=new THREE.Vector2();
// Interior of the original right-hand 丶 stroke of 不. No added aperture.
const logoAnchor=new THREE.Vector2(515/950,128/400);
const compositeTarget=new THREE.WebGLRenderTarget(1,1,{depthBuffer:false,type:THREE.HalfFloatType});
const lensScene=new THREE.Scene();
const lensMaterial=new THREE.ShaderMaterial({
 uniforms:{uScene:{value:compositeTarget.texture},uLens:{value:0},uOverscan:{value:cinemaOverscan}},
 vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
 fragmentShader:`uniform sampler2D uScene;uniform float uLens,uOverscan;varying vec2 vUv;
 void main(){vec2 p=vUv-.5;vec2 uv=.5+p*(1.+dot(p,p)*uLens)/uOverscan;gl_FragColor=vec4(texture2D(uScene,uv).rgb,1.);
 #include <colorspace_fragment>}`,depthTest:false,depthWrite:false
});
lensScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),lensMaterial));
const backgroundMaterial=new THREE.ShaderMaterial({
  uniforms:{uFilm:{value:renderTarget.texture},uAmount:{value:0}},
  vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
  fragmentShader:'uniform sampler2D uFilm;uniform float uAmount;varying vec2 vUv;void main(){gl_FragColor=vec4(texture2D(uFilm,vUv).rgb*uAmount,1.);#include <colorspace_fragment>}'.replace(';#include',';\n#include'),
  depthTest:false,depthWrite:false
});
screenScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),backgroundMaterial));

// The logo is triangulated SVG geometry, not a magnified bitmap texture. One shared
// value drives every stroke, so the mark can start as solid white and then let the
// film show through it (0 = white, 1.12 = fully hollow).
const logoReveal={value:0};
const maskMaterial=new THREE.ShaderMaterial({
  uniforms:{uFilm:{value:renderTarget.texture},uResolution:{value:resolution},uFilmScale:{value:1/cinemaOverscan},uPortalMix:{value:1},uPortalPreview:{value:null},uUseLogoUv:{value:0},uReveal:logoReveal},
  side:THREE.DoubleSide,depthTest:false,depthWrite:false,
  vertexShader:`
    varying float vX;varying vec2 vLogoUv;
    void main(){
      vec3 p=position;vX=p.x+.5;vLogoUv=vec2(p.x+515./950.,.5+(.5-(128.-p.y*950.)/400.)*400./950.*16./9.);
      gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);
    }`,
  fragmentShader:`
    uniform sampler2D uFilm,uPortalPreview;uniform vec2 uResolution;uniform float uReveal,uUseLogoUv,uPortalMix,uFilmScale;varying float vX;varying vec2 vLogoUv;
    void main(){
      vec2 filmUv=.5+(mix(gl_FragCoord.xy/uResolution,vLogoUv,uUseLogoUv)-.5)*uFilmScale;
      vec3 image=max(texture2D(uFilm,filmUv).rgb,vec3(.012));
      image=mix(texture2D(uPortalPreview,vLogoUv).rgb,image,uPortalMix);
      // Opens from the middle outwards, the same direction as the aperture reveal.
      float spread=abs(vX-.5)*2.;
      float reveal=1.-smoothstep(uReveal-.12,uReveal+.12,spread);
      gl_FragColor=vec4(mix(vec3(1.),image,reveal),1.);
      #include <colorspace_fragment>
    }`
});
function copyMaskMaterial(reveal=logoReveal){
  return new THREE.ShaderMaterial({vertexShader:maskMaterial.vertexShader,fragmentShader:maskMaterial.fragmentShader,
    side:THREE.DoubleSide,depthTest:false,depthWrite:false,
    uniforms:{uFilm:{value:renderTarget.texture},uResolution:{value:resolution},uFilmScale:{value:1/cinemaOverscan},uPortalMix:{value:1},uPortalPreview:{value:null},uUseLogoUv:{value:0},uReveal:reveal}});
}
const endMaterial=copyMaskMaterial({value:1.1});
endMaterial.uniforms.uFilm.value=endingTarget.texture;
endMaterial.uniforms.uFilmScale.value=1;
const entryLogo=new THREE.Group(),endLogo=new THREE.Group();
maskScene.add(entryLogo,endLogo);
endLogo.position.z=-147;

const media=[["assets/seedance-preview.mp4","assets/seedance-cover.webp"],["assets/capcut-preview.mp4","assets/capcut-cover.webp"],["assets/reno-preview.mp4","assets/reno-cover.webp"],["assets/lixiang-preview.mp4","assets/lixiang-cover.webp"],[null,JOURNEY_EDIT.poster]].map(([src,poster])=>{
  const video=document.createElement('video');
  video.poster=poster;video.muted=true;video.loop=true;video.playsInline=true;video.preload='none';
  video.hidden=true;video.setAttribute('aria-hidden','true');document.body.append(video);
  const texture=new THREE.VideoTexture(video);texture.colorSpace=THREE.SRGBColorSpace;
  return {video,texture,src,pending:false,version:0};
});
function releasePreviews(){
  for(const item of media){if(!item.video.getAttribute('src'))continue;item.version++;item.pending=false;item.video.pause();item.video.removeAttribute('src');item.video.preload='none';item.video.load();}
}
function updatePreviews(active,index){
  for(const [i,item] of media.entries()){
    const wanted=active&&item.src&&(!mobileMedia||i===index||phase==='opening'&&i===1);
    if(!wanted){if(item.video.getAttribute('src')){item.version++;item.pending=false;item.video.pause();item.video.removeAttribute('src');item.video.preload='none';item.video.load();}continue;}
    if(!item.video.getAttribute('src')){item.video.preload='auto';item.video.src=item.src;item.video.load();}
    if(item.video.paused&&!item.pending){item.pending=true;const version=item.version;item.video.play().catch(()=>{}).finally(()=>{if(version===item.version)item.pending=false;});}
  }
}
endMaterial.uniforms.uPortalPreview.value=media[1].texture;
let w=0,h=0,logoWidth=0,uiScale=1,position=0,target=0,phase='preparing';
const entryLogoScale=.5;
let px=0,py=0,touchY=null,soundOn=true,announcedEnd=false;
const begun=performance.now();
// Client credit rolls as plain bold names. Two identical groups give a seamless loop,
// and the speed is derived from the measured width so it reads the same on any screen.
const clientTrack=$('clientTrack');
const clientGroup=()=>{const group=document.createElement('div');group.className='client-group';for(const name of clients){const item=document.createElement('span');item.className='client-item';item.textContent=name;group.append(item)}return group};
// The strip is display:none until the collection opens, so width is only real once visible.
function fitClients(){const group=clientTrack.firstElementChild,width=group?group.getBoundingClientRect().width:0;if(width<10)return;clientTrack.style.animationDuration=`${Math.max(16,Math.round(width/85))}s`}
const clientLoop=clientGroup();clientLoop.setAttribute('aria-hidden','true');
clientTrack.append(clientGroup(),clientLoop);fitClients();document.fonts?.ready.then(fitClients);
// The strip fades with the scroll in both directions instead of only once.
new IntersectionObserver(entries=>entries.forEach(({target,isIntersecting})=>{if(isIntersecting)fitClients();target.classList.toggle('inview',isIntersecting)}),{rootMargin:'-12% 0px -12% 0px'}).observe($('clientMarquee'));
function resize(){
  w=innerWidth;h=innerHeight;
  uiScale=Math.max(.75,Math.min(w/1280,h/720));
  logoWidth=Math.min(w*(w<650?.82:.62),h*.48*950/400);
  const style=document.documentElement.style;
  style.setProperty('--logo-width',`${logoWidth}px`);style.setProperty('--logo-height',`${logoWidth*400/950}px`);style.setProperty('--ui',`${uiScale}px`);
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5,4096/(w*cinemaOverscan),2304/(h*cinemaOverscan)));renderer.setSize(w,h,false);
  renderer.getDrawingBufferSize(resolution);
  const renderWidth=Math.ceil(resolution.x*cinemaOverscan),renderHeight=Math.ceil(resolution.y*cinemaOverscan);
  const inGallery=document.body.classList.contains('journey-gallery');
  renderTarget.setSize(inGallery?1:renderWidth,inGallery?1:renderHeight);compositeTarget.setSize(inGallery?1:renderWidth,inGallery?1:renderHeight);endingTarget.setSize(inGallery?1:resolution.x,inGallery?1:resolution.y);
  camera.aspect=w/h;camera.updateProjectionMatrix();logoCamera.aspect=w/h;logoCamera.updateProjectionMatrix();
  const visibleWidth=2*Math.tan(THREE.MathUtils.degToRad(45/2))*8*camera.aspect;
  // The opening mark is drawn at half the reference width; the closing mark keeps its own size.
  const size=visibleWidth*logoWidth/w;entryLogo.scale.setScalar(size*entryLogoScale);endLogo.scale.setScalar(size*10/8);
  fitClients();
  guides&&guides.refit();
  liquid?.resize(w,h);
}
addEventListener('resize',resize);resize();

// Project information uses complete source films, never the nine-second excerpts.
const filmDetails=[{"title":"Seedance 2.5 发布会","titleEn":"Seedance 2.5 Launch","src":"assets/seedance-film.mp4"},{"title":"CapCut World","titleEn":"CapCut World","src":"assets/capcut-film.mp4"},{"title":"OPPO Reno 开场片","titleEn":"OPPO Reno Opening Film","src":"assets/reno-film.mp4"},{"title":"李想的一天","titleEn":"A Day with Li Xiang","src":"assets/lixiang-film.mp4"},{"title":"MAKE BELIEVE · 作品巡游","titleEn":"MAKE BELIEVE · A Visual Journey","journey":"vgent","src":null}];
// Project names keep their own spelling in both languages: the English title travels with
// the Chinese one, so switching language never renames somebody's client project.
const workTitle=work=>getLang()==='en'&&work.titleEn?work.titleEn:work.title;
const filmTitle=detail=>getLang()==='en'&&detail.titleEn?detail.titleEn:detail.title;
// The playback module owns these elements; the caption no longer borrows their
// dimensions, so they only have to exist and know their source.
filmDetails.forEach(detail=>{
  detail.metadata=document.createElement('video');detail.metadata.preload='none';
});
const cinema=buildCinema(world,media,filmDetails);
const playback=createCinemaPlayback(cinema,media,filmDetails,cinemaCues);
media[4].video.pause();
const filmPlayer=getFilmPlayer();
const cinemaCaptions=cinema.halls.map(hall=>{
  const element=document.createElement('div');
  element.className=`cinema-caption ${hall.side<0?'on-right':'on-left'}`;element.hidden=true;
  const number=document.createElement('span'),title=document.createElement('strong');
  number.className='cinema-caption-number';
  number.textContent=`AI CINEMA / ${String(hall.n).padStart(2,'0')} — 04`;
  element.append(number,title);$('filmLabels').append(element);
  return {element,title,hall};
});
// Caption titles are authored in both languages instead of being translated stroke by stroke.
const captionTitles=[
  [['Seedance 2.5','发布会视觉'],['Seedance 2.5','Visual Worlds']],
  [['CapCut World','创作想象'],['CapCut World','Creative Worlds']],
  [['OPPO Reno','青春影像'],['OPPO Reno','Light & Energy']],
  [['MAKE BELIEVE','作品巡游'],['MAKE BELIEVE','A Visual Journey']]
];
function fillCaption(entry,index){
  entry.title.textContent='';
  for(const text of captionTitles[index][getLang()==='en'?1:0]){const line=document.createElement('span');line.textContent=text;entry.title.append(line)}
}
cinemaCaptions.forEach(fillCaption);
function localizeCaptions(){cinemaCaptions.forEach(fillCaption)}
const captionPoint=new THREE.Vector3();
// A distant moving image fills the final vector mark, beyond the corridor.
const finale=new THREE.Mesh(new THREE.PlaneGeometry(60,33.75),new THREE.MeshBasicMaterial({map:media[1].texture}));
finale.position.set(0,0,-165);endingWorld.add(finale);
const raycaster=new THREE.Raycaster();
canvas.addEventListener('click',event=>{
  if(phase!=='ready'||position<.26||position>.80)return;
  raycaster.setFromCamera(new THREE.Vector2(event.clientX/w*2-1,1-event.clientY/h*2),camera);
  const hit=raycaster.intersectObjects(cinema.halls.filter(hall=>hall.screen.visible).map(hall=>hall.screen))[0];
  if(hit)openFilm(filmDetails[hit.object.userData.mediaIndex]);
});
function openFilm(detail){
  if(detail.journey==='vgent'){replayVgent();return;}
  const point=playback.point(detail),work=works.find(item=>item.video===detail.src);
  filmPlayer.open({src:detail.src,title:filmTitle(detail),poster:work?.poster,muted:!soundOn,startAt:point,onFinish:time=>playback.resume(detail,time)});
}
const grid=$('workGrid');
const featuredIds=PROJECT_ORDER.slice(0,6);
const selected=featuredIds.map(id=>works.find(work=>work.id===id)).filter(Boolean);
const others=works.filter(work=>!featuredIds.includes(work.id));
const galleryHeading=document.createElement('div');galleryHeading.className='gallery-heading';
const eyebrow=document.createElement('span'),galleryTitle=document.createElement('h2');galleryHeading.append(eyebrow,galleryTitle);grid.before(galleryHeading);
const cardParts=[];
for(const work of [...selected,...others]){
  const article=document.createElement('article'),link=document.createElement(work.cg||work.video||work.journey==='vgent'?'button':'a');
  article.className='work-card';article.dataset.work=work.id;if(work.journey==='vgent')article.dataset.vgent='true';
  link.className='work-image';
  if(work.cg){link.type='button';link.dataset.cgProject=work.id;}
  else if(work.journey==='vgent'){link.type='button';link.addEventListener('click',replayVgent);}
  else if(work.video){link.type='button';link.addEventListener('click',()=>{
    filmPlayer.open({src:work.video,title:workTitle(work),poster:work.poster,muted:!soundOn});
  });}else{link.href=work.url||work.poster;link.target='_blank';link.rel='noopener';}
  const img=document.createElement('img');img.src=work.poster;img.alt=workTitle(work);img.loading=selected.includes(work)?'eager':'lazy';link.append(img);
  const caption=document.createElement('div'),heading=document.createElement('h3'),title=document.createElement('a'),info=document.createElement('p');title.href=work.url||work.poster;title.className='project-title-link';heading.append(title);caption.append(heading,info);article.append(link,caption);
  if(work.cg)title.dataset.cgProject=work.id;
  grid.append(article);cardParts.push({work,article,link,img,title,info});
}
function localizeCards(){
  eyebrow.textContent='SELECTED WORK / 2026';galleryTitle.textContent=getLang()==='en'?'Stories, made possible.':'让想象，成为作品。';
  for(const {work,link,img,title,info} of cardParts){title.textContent=workTitle(work);info.textContent=getLang()==='en'?work.roleEn:work.role;img.alt=workTitle(work);link.setAttribute('aria-label',work.cg?(getLang()==='en'?'Open project: ':'打开项目：')+workTitle(work):t('watch',{title:workTitle(work)}));}
  if($('filmDialog').open){const src=$('fullFilm').getAttribute('src'),work=works.find(item=>item.video===src),detail=filmDetails.find(item=>item.src===src);if(work||detail)$('filmTitle').textContent=work?workTitle(work):filmTitle(detail);}
}
localizeCards();
liquid=createLiquidRefraction(renderer,{reduced});liquid.resize(w,h);
const gallery=createGalleryMaterials(renderer,cardParts,{reduced});
const gallerySections=connectGallerySections(gallery,getLang,{reduced});
function updateWorkGrid(){}
// The grid enters from below immediately after the ending, then settles into
// ordinary scrolling. Every value also reverses when the visitor scrolls back.
const portfolioSection=$('portfolio');
const journey=createVgentJourney({cinema,camera,renderer,canvas,getLang,gallery,
  onGallery:()=>{$('status').textContent=t('status.end');},
  onSeek:p=>{position=target=p;scrollTo(0,0);}
});
function replayVgent(){stopEntry();playback.suspendBackground();journey.resumeBackground();journey.replay();}
function suspendBackground(){releasePreviews();playback.suspendBackground();journey.suspendBackground();}
addEventListener('portfolio-film-open',suspendBackground);
const handoffLift=()=>innerHeight*.65;
let handoffApplied=false;
function applyHandoff(){
  if(document.body.classList.contains('journey-gallery')){portfolioSection.style.marginTop='0px';canvas.style.opacity='1';return;}
  const lift=Math.min(scrollY*1.8,handoffLift()),margin=`${(innerHeight-lift).toFixed(1)}px`;
  // Move the real layout, keeping the footer at the page end rather than
  // leaving an empty strip underneath a translated collection.
  portfolioSection.style.overflowAnchor='none';
  if(portfolioSection.style.marginTop!==margin)portfolioSection.style.marginTop=margin;
  const fade=1-smooth((scrollY-innerHeight*.04)/(innerHeight*.30)),opacity=fade<1?fade.toFixed(3):'';
  if(canvas.style.opacity!==opacity)canvas.style.opacity=opacity;
  handoffApplied=true;
}
function clearHandoff(){
  if(!handoffApplied)return;
  handoffApplied=false;portfolioSection.style.marginTop='';portfolioSection.style.overflowAnchor='';canvas.style.opacity='';
}
// Headline figures count up once the band scrolls in, like the reference site.
const numbersGrid=$('numbersGrid'),numberValues=[],numberLabels=[];
numbers.forEach((stat,index)=>{
  const cell=document.createElement('div'),ordinal=document.createElement('span'),value=document.createElement('strong'),label=document.createElement('span');
  cell.className='numbers-cell';ordinal.className='numbers-index';ordinal.textContent=String(index+1).padStart(2,'0');
  value.className='numbers-value';value.textContent='0';
  label.className='numbers-label';label.textContent=stat.label;
  cell.append(ordinal,value,label);numbersGrid.append(cell);numberValues.push(value);numberLabels.push(label);
});
function localizeNumbers(){numbers.forEach((stat,index)=>{const label=numberLabels[index];if(label)label.textContent=getLang()==='en'?stat.label:stat.labelZh||stat.label})}
localizeNumbers();
const numberTargets=numbers.map(stat=>{const n=parseInt(stat.value,10);return {n,suffix:stat.value.replace(/^\d+/,'')}});
const setNumbers=ratio=>numberValues.forEach((element,index)=>{const {n,suffix}=numberTargets[index];element.textContent=Math.round(n*ratio)+suffix});
let numbersPlayed=false,numbersRaf=0;
function playNumbers(){
  if(numbersPlayed)return;numbersPlayed=true;
  cancelAnimationFrame(numbersRaf);
  if(reduced){setNumbers(1);return}
  const start=performance.now();
  const step=now=>{const t=Math.min(1,(now-start)/1500);setNumbers(1-Math.pow(1-t,3));if(t<1)numbersRaf=requestAnimationFrame(step)};
  numbersRaf=requestAnimationFrame(step);
}
// Leaving the viewport rewinds the counters so the next pass counts up again.
new IntersectionObserver(entries=>entries.forEach(({target,isIntersecting})=>{
  target.classList.toggle('inview',isIntersecting);
  if(isIntersecting)playNumbers();else{numbersPlayed=false;cancelAnimationFrame(numbersRaf);setNumbers(0)}
}),{rootMargin:'-12% 0px -12% 0px'}).observe($('numbers'));
// Agent section: knowledge bases and the VGENT case wall, laid out in the Podium
// rhythm and revealed with their scrubbed rotate-in (top 90% -> top 45%).
const agentBases=$('agentBases');
const agentCopy=[];
let agentRevealTargets=[],agentLast=[];
function renderAgent(){
  const en=getLang()==='en';
  agentBases.textContent='';
  agentCopy.forEach((entry,index)=>{
    const copy=en?entry.en:entry.zh,card=document.createElement('article');
    card.className='agent-base';card.dataset.reveal='';
    const ordinal=document.createElement('span');ordinal.className='agent-base-index';ordinal.textContent=String(index+1).padStart(2,'0');
    const title=document.createElement('h3');title.textContent=copy.title;
    const lead=document.createElement('p');lead.textContent=copy.lead;
    const list=document.createElement('ul');
    for(const item of copy.items){const li=document.createElement('li');li.textContent=item;list.append(li)}
    card.append(ordinal,title,lead,list);agentBases.append(card);
  });
  collectRevealTargets();
}
// Every section below the works grid uses the same scrubbed reveal, so the targets
// are collected in one place after each render.
function collectRevealTargets(){
  agentRevealTargets=Array.from(document.querySelectorAll('#portfolio [data-reveal]'));agentLast=[];
  for(const element of agentRevealTargets){element.style.opacity=reduced?'1':'0';element.style.transform=''}
}
const node=(tag,className,text)=>{
  const element=document.createElement(tag);
  if(className)element.className=className;
  if(text!==undefined)element.textContent=text;
  return element;
};
const pick=data=>getLang()==='en'?data.en:data.zh;
const heading=data=>{
  const head=node('div','sec-head');
  head.append(node('p','sec-eyebrow',pick(data.eyebrow)),node('h2','sec-title',pick(data.title)),node('p','sec-lead',pick(data.lead)));
  return head;
};
function renderKnowledge(){
  const host=$('kbBody');host.textContent='';host.append(heading(sections.knowledge));
  const chips=node('div','kb-chips');
  sections.knowledge.chips.forEach((chip,index)=>{
    const card=node('div','kb-chip');card.dataset.reveal='';
    card.append(node('span','kb-chip-index',String(index+1).padStart(2,'0')),node('strong','kb-chip-name',pick(chip)));
    chips.append(card);
  });
  const stats=node('div','stat-row');
  sections.knowledge.stats.forEach(stat=>{
    const cell=node('div','stat-cell');cell.dataset.reveal='';
    cell.append(node('strong','stat-value',stat.value),node('span','stat-label',pick(stat)));stats.append(cell);
  });
  host.append(chips,stats);
}
function renderTeam(){
  const host=$('teamBody');host.textContent='';host.append(heading(sections.team));
  const en=getLang()==='en';
  const grid=node('div','team-grid');
  for(const person of sections.team.people){
    const card=node('article','team-card');card.dataset.reveal='';
    const photo=node('div','team-photo'),image=node('img');
    image.src=person.photo;image.alt=en?person.nameEn:person.name;image.loading='lazy';image.decoding='async';photo.append(image);
    card.append(photo,node('h3','team-name',en?person.nameEn:person.name),node('p','team-role',en?person.roleEn:person.role),node('p','team-bio',en?person.bioEn:person.bio));
    grid.append(card);
  }
  host.append(grid);
}
function renderAbout(){
  const host=$('aboutBody');host.textContent='';host.append(heading({eyebrow:sections.about.eyebrow,title:sections.about.title,lead:{zh:'',en:''}}));
  const grid=node('div','about-grid');
  const card=node('figure','about-card about-portrait');card.dataset.reveal='';
  const image=node('img');image.src=sections.about.card;image.alt=pick(sections.about.photoAlt);image.width=1920;image.height=1280;image.loading='lazy';image.decoding='async';
  card.append(image,node('figcaption','personal-about-caption',pick(sections.about.photoCaption)));
  const info=node('div','about-copy');
  info.append(node('h3','about-name',pick(sections.about.name)),node('p','about-role',pick(sections.about.role)));
  const bio=node('div','about-bio');
  for(const paragraph of sections.about.bio)bio.append(node('p','',pick(paragraph)));
  info.append(bio,node('p','about-background',pick(sections.about.background)));
  grid.append(card,info);host.append(grid);
  const stats=node('div','about-capabilities');
  for(const capability of sections.about.capabilities){
    const cell=node('div','about-capability');cell.dataset.reveal='';
    cell.append(node('h4','about-capability-title',pick(capability.title)),node('p','about-capability-detail',pick(capability)));stats.append(cell);
  }
  host.append(stats);
  const socials=node('ul','about-socials');
  for(const social of sections.about.socials){const item=node('li');item.append(node('span','',social));socials.append(item)}
  host.append(socials);
}
function renderProduct(){ cgMotionShowcase.sync(); }
function renderTools(){
  const host=$('toolsBody');host.textContent='';host.append(heading(sections.tools));
  const pipeline=node('div','pipeline');
  sections.tools.pipeline.forEach((step,index)=>{
    const cell=node('article','pipeline-node');cell.dataset.reveal='';
    cell.append(node('span','pipeline-step',step.step),
      node('strong','pipeline-name',step.name),
      node('span','pipeline-cn',getLang()==='en'?step.en:step.zh),
      node('p','pipeline-desc',pick(step.desc)));
    pipeline.append(cell);
    if(index<sections.tools.pipeline.length-1)pipeline.append(node('span','pipeline-arrow','→'));
  });
  const metrics=node('div','stat-row');
  for(const metric of sections.tools.metrics){
    const cell=node('div','stat-cell');cell.dataset.reveal='';
    cell.append(node('strong','stat-value',metric.value),node('span','stat-label',pick(metric)));metrics.append(cell);
  }
  host.append(pipeline,metrics);
  for(const group of sections.tools.groups){
    const block=node('div','tool-group');
    if(group.items.some(tool=>tool.collectionId))block.id='art-collections';
    if(group.items.some(tool=>tool.workflow))block.id='post-workflow';
    const head=node('div','tool-group-head');
    head.append(node('p','tool-group-label',getLang()==='en'?group.en:group.zh),node('p','tool-group-lead',pick(group.lead)));
    block.append(head);
    const rows=node('div','tool-rows');
    group.items.forEach((tool,index)=>{
      const row=node('article','tool-row');row.dataset.reveal=tool.shot||tool.workflow?'tilt':'';
      if(tool.workflow==='photoshop'){
        row.append(createPSWorkflowCard(getLang));
      }else if(tool.shot){
        const shot=node(tool.collectionId?'button':'figure','tool-shot');
        const collection=artCollections.find(item=>item.id===tool.collectionId);
        if(collection){
          shot.type='button';shot.dataset.artCollection=collection.id;
          shot.setAttribute('aria-label',(getLang()==='en'?'Explore ':'浏览')+(getLang()==='en'?tool.en:tool.zh));
        }
        const image=node('img');image.src=tool.shot;image.alt=getLang()==='en'?tool.en:tool.zh;image.loading='lazy';image.decoding='async';
        shot.append(image);row.append(shot);
        if(collection){
          const count=collection.comparisons?.length||collection.images?.length||0;
          const caption=getLang()==='en'?`${count} ${collection.type==='still'?'COMPARISONS':'IMAGES'} ↗`:`${count} ${collection.type==='still'?'组对比':'张设定'} ↗`;
          shot.append(node('span','art-collection-count',caption));
        }
      }else{
        const plate=node('div','tool-plate');
        plate.append(node('span','tool-plate-index',String(index+1).padStart(2,'0')));
        row.append(plate);
      }
      const text=node('div','tool-text');
      const name=node('h4','tool-name');name.append(node('span','tool-title',tool.name),node('em','tool-cn',getLang()==='en'?tool.en:tool.zh));
      text.append(name,node('p','tool-desc',pick(tool.desc)));
      row.append(text);
      rows.append(row);
    });
    block.append(rows);host.append(block);
  }
  const principles=node('div','principles');
  for(const principle of sections.tools.principles){
    const card=node('article','principle');card.dataset.reveal='';
    card.append(node('span','principle-name',principle.name),node('strong','principle-title',pick(principle)),node('p','principle-desc',pick(principle.desc)));
    principles.append(card);
  }
  host.append(principles);
}
function renderClientsDetail(){
  const host=$('clientsBody');host.textContent='';host.append(heading({eyebrow:sections.clientsDetail.eyebrow,title:sections.clientsDetail.title,lead:{zh:'',en:''}}));
  const stats=node('div','stat-row');
  for(const stat of sections.clientsDetail.influence){
    const cell=node('div','stat-cell');cell.dataset.reveal='';
    cell.append(node('strong','stat-value',stat.value),node('span','stat-label',pick(stat)));stats.append(cell);
  }
  host.append(stats);
}
function renderContact(){
  const host=$('contactBody');host.textContent='';
  const inner=node('div','contact-inner');inner.dataset.reveal='';
  inner.append(node('p','sec-eyebrow',pick(sections.contact.eyebrow)),node('h2','contact-title',pick(sections.contact.title)));
  const cta=node('a','contact-cta',pick(sections.contact.cta));cta.href='mailto:1158609347@qq.com';inner.append(cta);
  const links=node('ul','contact-links');
  for(const link of sections.contact.links){const item=node('li');item.append(node('span','',link));links.append(item)}
  inner.append(links);host.append(inner);
}
function renderSections(){
  renderKnowledge();renderTeam();renderAbout();renderProduct();renderTools();renderClientsDetail();renderContact();
}
renderAgent();renderSections();collectRevealTargets();
// The dashed guide layer starts at the agent block and runs to the end of the page.
guides=createGuideLines();guides.refit();
// One write per changed value: the reveal is scrubbed every frame in both directions,
// so scrolling back up rewinds it instead of leaving a half-played state behind.
function updateAgentReveal(){
  if(!agentRevealTargets.length)return;
  const vh=innerHeight;
  agentRevealTargets.forEach((element,index)=>{
    // Measured from the card's own centre, so anything sitting in the middle of the
    // viewport is already square instead of still leaning a degree or two. Only the
    // picture cards tilt (and just a little); text blocks rise and fade instead, so
    // the page does not read as one rolling carousel.
    const rect=element.getBoundingClientRect(),progress=clamp((vh*.92-(rect.top+rect.height/2))/(vh*.4));
    const tilt=element.dataset.reveal==='tilt';
    const opacity=progress.toFixed(3);
    const rotate=tilt&&progress<1?`${(-2.5*(1-progress)).toFixed(2)}deg`:'0deg';
    const lift=tilt||progress>=1?'0px':`${(16*(1-progress)).toFixed(1)}px`;
    const transform=`translate3d(0,${lift},0) rotate(${rotate})`;
    const last=agentLast[index]||(agentLast[index]={o:'',t:''});
    if(last.o!==opacity){last.o=opacity;element.style.opacity=opacity}
    if(last.t!==transform){last.t=transform;element.style.transform=transform}
  });
}
// A missing or hanging SVG must not prevent the frame loop and entry timer
// from starting. The cinema can open directly without the vector portal.
let logoLoadTimer;
const svg=await Promise.race([
  new SVGLoader().loadAsync('logo/make-believe.svg'),
  new Promise((_,reject)=>{logoLoadTimer=setTimeout(()=>reject(new Error('Logo load timed out')),5000)})
]).catch(error=>{console.warn('Opening without the vector logo:',error.message);return null});
clearTimeout(logoLoadTimer);
if(window.cinemaStartup?.failed())throw new Error('Cinema startup already fell back to the portfolio');
for(const [index,path] of (svg?.paths||[]).entries())for(const shape of SVGLoader.createShapes(path)){
  const original=new THREE.ShapeGeometry(shape,256),geometry=original.clone();
  geometry.scale(1/950,-1/950,1);geometry.translate(-logoAnchor.x,logoAnchor.y*400/950,0);
  // All other strokes retain moving cinema imagery. The 丶 reveals the actual aisle.
  const material=index===2?maskMaterial:copyMaskMaterial();
  material.uniforms.uPortalPreview.value=media[1].texture;
  if(index!==2){material.uniforms.uFilm.value=media[1].texture;material.uniforms.uUseLogoUv.value=1;material.uniforms.uFilmScale.value=1;}
  entryLogo.add(new THREE.Mesh(geometry,material));
  original.scale(1/950,-1/950,1);original.translate(-.5,200/950,0);endLogo.add(new THREE.Mesh(original,endMaterial));
}
let entryTween=null;
function stopEntry(){entryTween?.kill();entryTween=null;document.body.classList.remove('auto-entering')}
function beginEntry(){
  stopEntry();const travel={progress:0};document.body.classList.add('auto-entering');
  entryTween=gsap.to(travel,{progress:cinema.focus[0],duration:reduced?0:1.45,ease:'power2.inOut',
    onUpdate:()=>{position=target=travel.progress},
    onComplete:()=>{entryTween=null;document.body.classList.remove('auto-entering');$('status').textContent=t('status.entered')}});
}
function completeOpening(){
  window.cinemaStartup?.finish();
  opening.hidden=true;phase='ready';document.body.classList.remove('incoming');document.body.classList.add('ready');
  $('status').textContent=t('status.entering');beginEntry();
}
// The white mark hands over to the same mark drawn by WebGL, then the strokes open
// from the centre so the film shows through instead of white cutting to image.
let logoDissolve=null;
function handOverLogo(){
  if(reduced){logoReveal.value=1.12;completeOpening();return}
  logoDissolve=gsap.fromTo(logoReveal,{value:0},{value:1.12,duration:reduced?0:.525,ease:'power2.inOut',onComplete:completeOpening});
}
const dnaIntro=createDnaOpening(opening,{hold:0,speed:4,effects:false,
  onInterface:()=>document.body.classList.add('incoming'),onComplete:handOverLogo});
function reveal(){if(phase==='opening')dnaIntro.finish()}
function playOpening(){
  playback.resumeBackground();journey.resumeBackground();
  journey.reset();
  stopEntry();dnaIntro.kill();logoDissolve?.kill();logoDissolve=null;logoReveal.value=0;
  playback.pause();playback.resetIntro();
  window.scrollTo(0,0);document.body.classList.remove('collection','ready','incoming');
  position=target=0;phase='opening';announcedEnd=false;
  $('status').textContent=t('status.opening');
  if(reduced)dnaIntro.finish();else dnaIntro.play();
}
function move(delta){
  if(phase!=='ready'||!delta)return;
  stopEntry();
  if(journey.input(delta*6500,target))return;
  target=clamp(advanceCinemaScroll(target,delta,cinema.focus),0,.80);
}
function returnHome(){playOpening()}
// The cinema keeps positional scrolling; the VGENT chapter owns direction commands.
addEventListener('wheel',e=>{
  if(hasOpenDialog()||phase!=='ready'||e.ctrlKey)return;
  const pixels=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?h:1);if(!pixels)return;
  if(journey.input(pixels,target)){e.preventDefault();stopEntry();return;}
  if(journey.state==='gallery')return;
  e.preventDefault();move(clamp(pixels,-180,180)/6500);
},{passive:false});
document.addEventListener('touchstart',e=>{touchY=e.touches[0].clientY},{passive:true});
document.addEventListener('touchmove',e=>{const y=e.touches[0].clientY,delta=touchY===null?0:touchY-y;touchY=y;if(hasOpenDialog())return;if(document.body.classList.contains('collection')&&!(scrollY<=1&&delta<0))return;e.preventDefault();move(delta/6500)},{passive:false});
document.addEventListener('touchend',()=>{touchY=null});
addEventListener('keydown',e=>{
  if(e.key==='Escape'&&phase==='opening'){reveal();return}
  if(hasOpenDialog())return;
  if(e.key==='Home'&&phase==='ready'){e.preventDefault();returnHome();return;}
  if(e.key==='End'&&phase==='ready'){e.preventDefault();stopEntry();journey.skip();return;}
  if(e.key==='Escape'&&['entering','scrubbing','exiting'].includes(journey.state)){e.preventDefault();journey.pause();return;}
  if(e.key===' '&&['entering','scrubbing','exiting'].includes(journey.state)&&!e.target.closest('button,a,input,textarea')){e.preventDefault();journey.togglePause();return;}
  if(e.target.closest('button,a')&&!['ArrowDown','ArrowUp','PageDown','PageUp'].includes(e.key))return;
  if(e.key==='Enter'&&phase==='ready'&&position>.26&&position<=.80){e.preventDefault();openFilm(filmDetails[cinema.active(position).mediaIndex]);return;}
  if(document.body.classList.contains('collection')&&!(scrollY<=1&&['ArrowUp','PageUp'].includes(e.key)))return;
  const delta={ArrowDown:.035,ArrowUp:-.035,PageDown:.14,PageUp:-.14,' ':.1}[e.key];
  if(delta!==undefined){e.preventDefault();move(delta)}
  if(phase==='ready'&&e.key==='Home'){e.preventDefault();returnHome()}
  if(phase==='ready'&&e.key==='End'){e.preventDefault();stopEntry();target=1}
});
if(matchMedia('(pointer:fine)').matches&&!reduced){
  addEventListener('pointermove',e=>{
    px=(e.clientX/w-.5)*2;py=(e.clientY/h-.5)*2;
  },{passive:true});
}
$('skip').disabled=false;$('skip').addEventListener('click',reveal);$('replay').addEventListener('click',playOpening);
$('workNav').addEventListener('click',e=>{e.preventDefault();if(journey.state==='gallery')scrollTo({top:0,behavior:'smooth'});else openPersonalSection('#portfolio')});
$('home').addEventListener('click',e=>{e.preventDefault();returnHome()});$('restart').addEventListener('click',returnHome);
const soundBlocked=()=>playback.blocked()||journey.audioBlocked();
function updateSound(){const blocked=soundOn&&soundBlocked();$('sound').textContent=t(blocked?'sound.blocked':soundOn?'sound.on':'sound.off');$('sound').setAttribute('aria-pressed',String(soundOn&&!blocked));$('sound').title=t(blocked?'sound.unlock':'sound.title')}
function setSound(on){
  soundOn=on;$('fullFilm').muted=!on;
  // Start both permission requests in this gesture, before awaiting either.
  const attempts=journey.state==='gallery'||hasOpenDialog()?[]:journey.state==='cinema'?[playback.setSound(on)]:[journey.setSound(on)];updateSound();
  return Promise.allSettled(attempts).then(updateSound);
}
$('sound').addEventListener('click',()=>setSound(soundOn&&soundBlocked()?true:!soundOn));
$('lang').addEventListener('click',()=>toggleLang());
// Everything the scripts built reads the dictionary again when the language changes.
addEventListener('languagechange',()=>{localizeCards();localizeCaptions();localizeNumbers();renderAgent();renderSections();collectRevealTargets();guides&&guides.refit();updateSound()});
// A gesture unlocks the default-on soundtrack without toggling the preference.
const unlockSound=e=>{
  if(journey.state==='gallery'||hasOpenDialog()||e.target.closest('#sound,.work-image,[data-cg-project],.product-action'))return;
  if(journey.state==='cinema')updatePreviews(true,cinema.active(Math.min(position,.80)).mediaIndex);
  if(soundOn&&(!playback.unlocked()||!journey.audioUnlocked()||soundBlocked()))setSound(true);
};
addEventListener('click',unlockSound,{passive:true});addEventListener('keydown',unlockSound);addEventListener('touchend',unlockSound,{passive:true});
updateSound();
document.addEventListener('visibilitychange',()=>{if(document.hidden)suspendBackground()});

// The entry stays a bare breathing dot, but a failed or stalled load must not trap
// the visitor: failed media is retried, then the cinema opens on what did buffer.
const prepStarted=performance.now();
let prepRetries=0,prepNextRetry=1000,prepTimer;
if(mobileMedia){
  const actions=document.createElement('div');actions.className='cinema-mobile-actions';
  const start=document.createElement('button'),work=document.createElement('button');
  start.type=work.type='button';start.textContent=getLang()==='en'?'▶ Play opening':'▶ 播放开场';work.textContent=getLang()==='en'?'View work ↗':'查看作品 ↗';
  start.addEventListener('click',()=>{playback.resumeBackground();updatePreviews(true,cinema.halls[0].mediaIndex);playback.setSound(soundOn);start.textContent=getLang()==='en'?'Loading…':'正在载入…';});
  work.addEventListener('click',()=>openPersonalSection('#portfolio'));
  actions.append(start,work);$('cinemaPreparation').append(actions);
}
function finishPreparation(){
  if(phase!=='preparing'||window.cinemaStartup?.failed())return;
  clearInterval(prepTimer);
  $('cinemaPreparation').hidden=true;$('skip').disabled=false;
  if(entryLogo.children.length)playOpening();else completeOpening();
}
function updatePreparation(){
  if(phase!=='preparing')return;
  const state=playback.preparation();
  const prepElapsed=performance.now()-prepStarted;
  if(state.error&&prepRetries<3&&prepElapsed>prepNextRetry){prepRetries++;prepNextRetry=prepElapsed+3000;playback.recover()}
  const status=$('preparationStatus');
  status.className='sr-only';
  status.textContent=state.error?(prepRetries?t('prep.retry'):t('prep.failed')):t('prep.progress',{n:state.progress});
  if(prepElapsed>=8000&&!state.playable){window.cinemaStartup?.fail();return}
  if(state.ready||(state.playable&&prepElapsed>=3000)||prepElapsed>=8000)finishPreparation();
}
// This clock is independent of render speed and also checks immediately when
// returning to the tab. No animation-frame accumulator controls the deadline.
prepTimer=setInterval(updatePreparation,250);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)updatePreparation()});
addEventListener('cinema-startup-failed',()=>{
  clearInterval(prepTimer);stopEntry();dnaIntro.kill();logoDissolve?.kill();suspendBackground();
  phase='fallback';position=target=1;
});

let last=performance.now(),perfTicks=0,cinemaBuffersParked=false;const frameIntervals=[];
function frame(now){
  if(phase==='fallback')return;
  if(renderer.getContext().isContextLost()){last=now;requestAnimationFrame(frame);return;}
  const rawDt=now-last,dt=Math.min(rawDt,50);last=now;
  const dialogOpen=hasOpenDialog();
  const mediaBlocked=dialogOpen||document.hidden||journey.state==='gallery';
  if(mediaBlocked)suspendBackground();
  else{journey.resumeBackground();if(journey.state==='cinema')playback.resumeBackground();else playback.suspendBackground();}
  updatePreviews(!mediaBlocked&&['cinema','entering'].includes(journey.state),cinema.active(Math.min(position,.80)).mediaIndex);
  if(['entering','scrubbing','exiting','gallery'].includes(journey.state)){frameIntervals.push(rawDt);if(frameIntervals.length>300)frameIntervals.shift();if(++perfTicks%60===0){const values=[...frameIntervals].sort((a,b)=>a-b);canvas.dataset.vgentPerf=JSON.stringify({frames:perfTicks,p95:+values[Math.floor(values.length*.95)].toFixed(2),max:+values.at(-1).toFixed(2),long:values.filter(v=>v>50).length});}}
  position+=(target-position)*(reduced?1:1-Math.exp(-dt/(position>.80?100:200)));
  if(Math.abs(target-position)<.00001)position=target;
  cinema.pose(Math.min(position,.80),camera,px,py);
  if(phase==='preparing')updatePreparation(dt);else playback.update(dt,Math.min(position,.80),camera,phase==='ready'&&journey.state==='cinema',dialogOpen);
  cinema.update(now,camera,Math.min(position,.80));
  journey.update(now,dt,position,phase==='ready',dialogOpen,reduced);
  if(journey.state==='gallery'&&!cinemaBuffersParked){renderTarget.setSize(1,1);compositeTarget.setSize(1,1);endingTarget.setSize(1,1);cinemaBuffersParked=true;}
  if(cinemaBuffersParked&&(['cinema','entering'].includes(journey.state)||(journey.clock.direction<0&&journey.clock.time<3))){resize();cinemaBuffersParked=false;}

  updateSound();
  canvas.dataset.transitioning=String(!!entryTween);
  const uiAmount=phase==='ready'?1:dnaIntro.interfaceAmount();
  const exit=0;
  maskMaterial.uniforms.uPortalMix.value=smooth((position-.06)/.11);
  // Logo projection stays front-on. Pointer and cinema perspective cannot warp it.
  logoCamera.position.set(0,0,camera.position.z);logoCamera.rotation.set(0,0,0);
  entryLogo.visible=camera.position.z>.02;
  endLogo.visible=exit>0;
  if(!['scrubbing','exiting','gallery'].includes(journey.state)){
  // Cinema perspective is sampled inside a stable, front-facing vector portal.
  cinemaRenderCamera.copy(camera);
  cinemaRenderCamera.setViewOffset(w,h,-w*(cinemaOverscan-1)/2,-h*(cinemaOverscan-1)/2,w*cinemaOverscan,h*cinemaOverscan);
  renderer.setRenderTarget(renderTarget);renderer.render(world,cinemaRenderCamera);
  if(endLogo.visible){renderer.setRenderTarget(endingTarget);renderer.render(endingWorld,camera);}
  backgroundMaterial.uniforms.uAmount.value=(camera.position.z<=.35?1:0)*(1-exit);
  renderer.setRenderTarget(compositeTarget);renderer.render(screenScene,screenCamera);
  lensMaterial.uniforms.uLens.value=(.65*Math.sin(Math.PI*clamp(position/.34))+Math.min(.6,Math.abs(target-position)*5))*(1-smooth((position-.68)/.05))*(1-smooth(journey.progress*2));
  renderer.setRenderTarget(liquid.target);renderer.render(lensScene,screenCamera);
  // The animated HTML mark dissolves onto the same antialiased SVG silhouette.
  renderer.autoClear=false;renderer.render(maskScene,logoCamera);renderer.autoClear=true;
  }
  if(journey.state==='gallery'){renderer.setRenderTarget(liquid.target);renderer.setClearColor(0,0);renderer.clear();}
  journey.render(liquid.target);
  const collection=document.body.classList.contains('collection');

  if(collection)applyHandoff();else clearHandoff();
  if(collection){
    if(!guidesReady&&guides){guides.refit();guidesReady=true}
    // The guide field belongs exclusively to the finished portfolio state.
    // During the cinema path, including its final handoff, keep every dashed
    // layer out of the viewport even if the collection class is still present.
    if(guides)guides.layer.style.visibility=(phase==='ready'&&position>.999)?'visible':'hidden';
    guides&&guides.update(reduced);
    if(!reduced){updateWorkGrid(now);updateAgentReveal()}
  }else {guidesReady=false;guides&&(guides.layer.style.visibility='hidden');}
  if(collection)gallerySections.update();
  gallery.update(now,dt,{enabled:journey.state==='gallery'||journey.state==='exiting',exit:journey.exitProgress});
  if(['gallery','exiting'].includes(journey.state)){renderer.setRenderTarget(liquid.target);gallery.render();}
  liquid.enabled=phase==='ready'&&!dialogOpen;liquid.present(dt);
  const hall=cinema.active(Math.min(position,.80));
  const captionWeights=cinema.weights(position);
  cinemaCaptions.forEach(({element,hall},i)=>{
    const opacity=smooth((captionWeights[i]-.2)/.6)*smooth((position-.29)/.05)*(1-smooth((position-.83)/.05));
    element.hidden=phase!=='ready'||opacity<.005;
    element.style.opacity=opacity;
    // The title sits opposite its screen, at the same projected vertical center.
    hall.screen.getWorldPosition(captionPoint);captionPoint.project(camera);
    element.style.top=`${clamp((1-captionPoint.y)*50,28,68)}%`;
  });
  canvas.setAttribute('aria-label',position<.24?t('canvas.enter'):t('canvas.in',{title:filmTitle(filmDetails[hall.mediaIndex])}));
  const waiting=uiAmount*(1-smooth(position/.06));
  cameraFrame.style.opacity=waiting;$('entrance').style.opacity=waiting;
  $('ending').style.opacity=exit;$('ending').style.visibility=exit>.8?'visible':'hidden';
  $('progress').textContent=`${String(Math.round(journey.pageProgress(position)*100)).padStart(2,'0')} / 100`;
  const seconds=Math.floor((now-begun)/1000);
  $('timecode').textContent=`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}:${String(Math.floor(now/1000*24)%24).padStart(2,'0')}`;
  if(exit>.95&&!announcedEnd){$('status').textContent=t('status.end');announcedEnd=true}if(exit<.5)announcedEnd=false;
  requestAnimationFrame(frame);
}
addEventListener('pagehide',e=>{if(!e.persisted){journey.dispose();cgMotionShowcase.dispose();gallerySections.dispose();gallery.dispose();liquid.dispose();}});
canvas.addEventListener('webglcontextlost',()=>{journey.pause();document.querySelectorAll('.gpu-image-ready,.gpu-border-ready').forEach(node=>node.classList.remove('gpu-image-ready','gpu-border-ready'));});
canvas.addEventListener('webglcontextrestored',()=>{liquid.clear();resize();});
$('skip').disabled=true;requestAnimationFrame(frame);

function openPersonalSection(anchor='#portfolio'){
  clearInterval(prepTimer);stopEntry();dnaIntro.kill();logoDissolve?.kill();logoDissolve=null;
  $('cinemaPreparation').hidden=true;$('skip').disabled=false;opening.hidden=true;phase='ready';
  document.body.classList.remove('incoming');document.body.classList.add('ready');window.cinemaStartup?.finish();
  suspendBackground();
  journey.skip();requestAnimationFrame(()=>requestAnimationFrame(()=>document.querySelector(anchor==='#work'?'#portfolio':anchor)?.scrollIntoView({behavior:'instant'})));
}
window.mingzeCinema={showWork:()=>openPersonalSection(),replay:playOpening};
document.querySelectorAll('a[href="#contact"]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();openPersonalSection('#contact')}));
if(directGallery)openPersonalSection(location.hash);

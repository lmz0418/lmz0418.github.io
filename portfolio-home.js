// Native-scroll portfolio. The optional cinema owns all WebGL and animation loops.
import { works } from './works.js?v=20261030-smooth1';
import { clients } from './clients.js?v=20261030-smooth1';
import { numbers } from './numbers.js?v=20261030-smooth1';
import * as sections from './sections.js?v=20261030-smooth1';
import { createCGMotionShowcase } from './cg-motion-showcase.js?v=20261030-smooth1';
import { artCollections } from './art-collections-data.js?v=20261030-smooth1';
import { createPSWorkflowCard } from './ps-workflow.js?v=20261030-smooth1';
import { createProductShowcase } from './product-showcase.js?v=20261030-smooth1';
import { createBrandSocial } from './brand-social.js?v=20261030-smooth1';
import { getLang, initLang, toggleLang } from './i18n.js';
import { getFilmPlayer } from './film-player.js?v=20261030-smooth1';
import './personal-interactions.js?v=20261030-smooth1';

initLang();
const $=id=>document.getElementById(id);
const cgMotionShowcase=createCGMotionShowcase(getLang);
const artShowcase=createProductShowcase(getLang);
const brandSocial=createBrandSocial(getLang,{reduced:true});
const filmPlayer=getFilmPlayer();
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
  renderTeam();renderAbout();renderProduct();renderTools();renderClientsDetail();renderContact();
}

function renderWorks(){
  const en=getLang()==='en',fragment=document.createDocumentFragment();
  works.forEach((work,index)=>{
    const title=en?work.titleEn:work.title;
    const card=node('article','work-card');card.dataset.work=work.id;
    const cover=node(work.cg||work.video?'button':'a','work-image');
    if(cover.tagName==='BUTTON')cover.type='button';else cover.href=work.url;
    cover.setAttribute('aria-label',(en?'View ':'查看 ')+title);
    if(work.cg)cover.dataset.cgProject=work.id;
    else if(work.video)cover.addEventListener('click',()=>filmPlayer.open({src:work.video,title,poster:work.poster}));
    const image=node('img');image.src=work.poster;image.alt=title;image.width=960;image.height=600;
    image.loading=index<3?'eager':'lazy';image.decoding='async';if(index===0)image.fetchPriority='high';cover.append(image);
    if(work.video||work.cg)cover.append(node('span','work-open-mark',work.video?'▶':'↗'));
    const caption=node('div'),name=node('h3'),link=node('a','project-title-link',title);link.href=work.url;
    if(work.cg)link.dataset.cgProject=work.id;
    name.append(link);caption.append(name,node('p','',en?work.roleEn||work.role:work.role));card.append(cover,caption);fragment.append(card);
  });
  $('workGrid').replaceChildren(fragment);
  $('worksHeading').textContent=en?'Give imagination a tangible form.':'让想象，拥有质感。';
  $('workCount').textContent=String(works.length).padStart(2,'0')+' PROJECTS';
  $('cinemaLink').textContent=en?'CINEMA ↗':'观看开场 ↗';
}
function renderNumbers(){
  $('numbersGrid').replaceChildren(...numbers.map((stat,index)=>{
    const cell=node('div','numbers-cell');cell.append(node('span','numbers-index',String(index+1).padStart(2,'0')),node('strong','numbers-value',stat.value),node('span','numbers-label',getLang()==='en'?stat.label:stat.labelZh));return cell;
  }));
}
function renderClients(){
  const group=node('div','client-group');for(const client of clients)group.append(node('span','client-name',client));$('clientTrack').replaceChildren(group);
}
function render(){
  renderWorks();renderSections();renderNumbers();renderClients();artShowcase.sync();brandSocial.sync();brandSocial.update();
}
render();
$('lang').addEventListener('click',toggleLang);
addEventListener('languagechange',render);
// Pausing uses visibility/events, never a frame-by-frame scan or scroll interception.
function pauseMedia(){document.querySelectorAll('video').forEach(video=>video.pause());document.querySelector('.vgent-knowledge')?.contentWindow?.postMessage({type:'art-study:pause'},'*');}
addEventListener('portfolio-film-open',pauseMedia);
document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseMedia();});
addEventListener('pagehide',event=>{pauseMedia();if(!event.persisted){cgMotionShowcase.dispose();artShowcase.dispose();brandSocial.dispose();}});
// Resolve a direct section link after synchronous section construction.
if(location.hash&&location.hash!=='#portfolio'&&location.hash!=='#work'){
  const target=document.getElementById(location.hash.slice(1));if(target)setTimeout(()=>target.scrollIntoView(),0);
}

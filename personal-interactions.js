import {portfolio} from './personal-data.js?v=20261030-smooth1';
import {getLang} from './i18n.js';
import {createCGProjectViewer} from './cg-project-viewer.js?v=20261030-smooth1';
import {artCollections} from './art-collections-data.js?v=20261030-smooth1';
import {createPSWorkflowViewer} from './ps-workflow.js?v=20261030-smooth1';
import {getFilmPlayer} from './film-player.js?v=20261030-smooth1';
const cgViewer=createCGProjectViewer(getLang,{additionalEntries:artCollections});
const psWorkflow=createPSWorkflowViewer(getLang);
const all=[...portfolio.projects,...portfolio.cgProjects];
const $=id=>document.getElementById(id);
const en=()=>getLang()==='en';
const film=$('fullFilm'),dialog=$('filmDialog');
const filmPlayer=getFilmPlayer();
dialog.setAttribute('aria-labelledby','filmTitle');
const context=document.createElement('div');context.className='film-context';dialog.append(context);
function filmInfo(){
 const src=film.dataset.originalSrc||film.getAttribute('src')||'';const item=all.find(p=>p.film===src||p.processFilm===src);context.replaceChildren();
 if(!item){context.hidden=true;return}context.hidden=false;
 const text=document.createElement('p');text.textContent=(en()?item.summaryEn||item.summary:item.summary);
 const link=document.createElement('a');link.href='project.html?id='+item.id;link.textContent=en()?'View visual details ↗':'查看美术详情 ↗';context.append(text,link);
}
new MutationObserver(filmInfo).observe(film,{attributes:true,attributeFilter:['src']});
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});
function openFilm(src,title){filmPlayer.open({src,title,poster:all.find(p=>p.film===src||p.processFilm===src)?.cover});}

const viewer=document.createElement('dialog');viewer.className='image-viewer';viewer.setAttribute('aria-label','作品图片');
viewer.innerHTML='<header><p></p><button type="button" class="image-close">关闭 ×</button></header><div class="image-stage"><img alt=""></div><nav><button type="button" class="image-prev">←</button><span class="image-counter"></span><button type="button" class="image-next">→</button></nav>';
document.body.append(viewer);let images=[],at=0,title='';
function renderImage(){viewer.querySelector('img').src=images[at];viewer.querySelector('img').alt=title;viewer.querySelector('header p').textContent=title;viewer.querySelector('.image-counter').textContent=`${String(at+1).padStart(2,'0')} / ${String(images.length).padStart(2,'0')}`;viewer.querySelector('.image-close').textContent=en()?'CLOSE ×':'关闭 ×';viewer.querySelector('.image-prev').disabled=viewer.querySelector('.image-next').disabled=images.length<2;}
function openImages(sources,label){images=sources.filter(Boolean);if(!images.length)return;at=0;title=label;renderImage();viewer.showModal()}
viewer.querySelector('.image-close').onclick=()=>viewer.close();
viewer.querySelector('.image-prev').onclick=()=>{at=(at+images.length-1)%images.length;renderImage()};
viewer.querySelector('.image-next').onclick=()=>{at=(at+1)%images.length;renderImage()};
viewer.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();at=(at+(e.key==='ArrowRight'?1:-1)+images.length)%images.length;renderImage()}});

document.addEventListener('click',e=>{
 const psTrigger=e.target.closest('[data-ps-workflow]');if(psTrigger){e.preventDefault();e.stopImmediatePropagation();document.querySelectorAll('video').forEach(v=>v.pause());psWorkflow.open();return}
 const artTrigger=e.target.closest('[data-art-collection]');if(artTrigger){e.preventDefault();e.stopImmediatePropagation();document.querySelectorAll('video').forEach(v=>v.pause());cgViewer.open(artTrigger.dataset.artCollection);return}
 const cgTrigger=e.target.closest('[data-cg-project]');if(cgTrigger){e.preventDefault();e.stopImmediatePropagation();document.querySelectorAll('video').forEach(v=>v.pause());window.dispatchEvent(new Event('portfolio-film-open'));cgViewer.open(cgTrigger.dataset.cgProject);return}
 const action=e.target.closest('.product-action');if(action&&/\.mp4$/.test(action.getAttribute('href')||'')){e.preventDefault();openFilm(action.getAttribute('href'),action.textContent.replace(/[↗→]/g,''));return}
 const card=e.target.closest('.work-card');if(card){const item=all.find(p=>p.id===card.dataset.work);if(item&&!item.film&&e.target.closest('.work-image')){e.preventDefault();const pics=item.stills?.length?item.stills:item.chapters?.map(c=>c.image)||[item.cover];openImages(pics,en()?item.titleEn||item.title:item.title);return}}
 const picture=e.target.closest('.team-photo,.tool-shot');if(picture){const img=picture.querySelector('img');if(img)openImages([img.getAttribute('src')],picture.parentElement.querySelector('h3,h4')?.textContent||'MINGZE LI')}
},true);
addEventListener('pagehide',event=>{if(!event.persisted){cgViewer.dispose();psWorkflow.dispose();}});

function enhance(){
 const about=$('aboutBody'),contact=$('contactBody');if(!about||!contact)return;
 const photo=about.querySelector('.about-card');if(photo&&!photo.querySelector('figcaption')){const cap=document.createElement('figcaption');cap.className='personal-about-caption';cap.textContent=en()?'MINGZE LI · IN THE STUDIO':'MINGZE LI · 工作室日常';photo.append(cap)}
 for(const host of [about,contact.querySelector('.contact-inner')||contact]){
  if(host.querySelector('.personal-actions'))continue;
  const bar=document.createElement('div');bar.className='personal-actions';
  const resume=document.createElement('a');resume.href='resume.html';resume.className='primary';resume.textContent=en()?'VIEW RESUME ↗':'查看简历 ↗';
  const pdf=document.createElement('a');pdf.href='assets/mingze-li-resume-20261029.pdf';pdf.download='李明泽_AI美术与视觉设计_简历.pdf';pdf.textContent=en()?'DOWNLOAD PDF ↓':'下载简历 ↓';
  const wechat=document.createElement('button');wechat.type='button';wechat.textContent=en()?'COPY WECHAT':'复制微信';
  const status=document.createElement('p');status.className='copy-feedback';status.setAttribute('role','status');
  wechat.onclick=async()=>{try{await navigator.clipboard.writeText(portfolio.person.wechat);status.textContent=en()?'Copied: '+portfolio.person.wechat:'已复制微信号：'+portfolio.person.wechat}catch{status.textContent='WeChat: '+portfolio.person.wechat}};
  bar.append(resume,pdf,wechat);host.append(bar,status);
 }
 contact.querySelectorAll('.contact-links li').forEach(li=>{if(li.textContent===portfolio.person.email){const a=document.createElement('a');a.href=portfolio.person.emailHref;a.textContent=portfolio.person.email;li.replaceChildren(a)}if(/AI 广告美术|AI advertising art/.test(li.textContent))li.textContent=en()?'AI advertising art · Visual design · CG & motion':'AI 广告美术 · 视觉设计 · CG 与动态设计';});
}
// The reference re-renders localized sections; attach public personal actions afterwards.
const bodyObserver=new MutationObserver(()=>{if($('aboutBody')?.querySelector('.about-copy'))enhance()});bodyObserver.observe($('aboutBody'),{childList:true});bodyObserver.observe($('contactBody'),{childList:true});
addEventListener('languagechange',()=>queueMicrotask(enhance));enhance();
document.querySelectorAll('a[href="#contact"]').forEach(a=>a.addEventListener('click',()=>{if(document.body.classList.contains('cinema-fallback'))$('contact')?.scrollIntoView()}));
